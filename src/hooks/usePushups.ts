import { useCallback, useEffect, useRef, useState } from 'react'
import type { CreatePushupEntry, PushupEntry, UpdatePushupEntry } from '../models/PushupEntry'
import { supabasePushupRepository } from '../services/supabasePushupRepository'
import { localPushupRepository } from '../services/localPushupRepository'
import { offlineSyncQueue } from '../services/offlineSyncQueue'
import { useOnlineStatus } from './useOnlineStatus'

const LOCAL_CACHE_KEY = 'reptree_entries_cache_v1'

function readCache(): PushupEntry[] {
  try {
    const raw = localStorage.getItem(LOCAL_CACHE_KEY)
    return raw ? (JSON.parse(raw) as PushupEntry[]) : []
  } catch {
    return []
  }
}

function writeCache(entries: PushupEntry[]): void {
  try {
    localStorage.setItem(LOCAL_CACHE_KEY, JSON.stringify(entries))
  } catch (e) {
    console.error('[Cache] Failed to write cache:', e)
  }
}

/**
 * Build the initial visible entries by merging:
 *   1. The persisted cache (last known Supabase state)
 *   2. Any pending 'add' ops from the queue that survived an app close while offline
 *
 * This prevents offline-added entries from disappearing after close/reopen.
 */
function seedEntries(): PushupEntry[] {
  const cached = readCache()
  const cachedIds = new Set(cached.map((e) => e.id))

  const pendingAdds: PushupEntry[] = offlineSyncQueue
    .getAll()
    .filter((op): op is Extract<typeof op, { type: 'add' }> => op.type === 'add')
    .filter((op) => !cachedIds.has(op.localId)) // not already in cache
    .map((op) => ({
      id: op.localId,
      amount: op.entry.amount,
      skillId: op.entry.skillId,
      skillName: op.entry.skillName,
      timestamp: op.entry.timestamp ?? new Date().toISOString(),
      createdAt: op.entry.timestamp ?? new Date().toISOString(),
      updatedAt: op.entry.timestamp ?? new Date().toISOString(),
    }))

  return [...pendingAdds, ...cached].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  )
}

export function usePushups(userId?: string) {
  const isOnline = useOnlineStatus()
  const isSyncing = useRef(false)

  // Seed instantly from cache + pending queue so the UI is never empty on open
  const [entries, setEntries] = useState<PushupEntry[]>(seedEntries)
  const [loading, setLoading] = useState(true)
  const [pendingCount, setPendingCount] = useState(() => offlineSyncQueue.count())

  /** Update state + cache atomically */
  const applyAndCache = useCallback((updated: PushupEntry[]) => {
    const sorted = [...updated].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    )
    setEntries(sorted)
    writeCache(sorted)
  }, [])

  /**
   * Merge Supabase data with any still-pending offline adds so they
   * stay visible until the queue is flushed.
   */
  const mergeWithPending = useCallback((remote: PushupEntry[]): PushupEntry[] => {
    const remoteIds = new Set(remote.map((e) => e.id))
    const pendingAdds: PushupEntry[] = offlineSyncQueue
      .getAll()
      .filter((op): op is Extract<typeof op, { type: 'add' }> => op.type === 'add')
      .filter((op) => !remoteIds.has(op.localId))
      .map((op) => ({
        id: op.localId,
        amount: op.entry.amount,
        skillId: op.entry.skillId,
        skillName: op.entry.skillName,
        timestamp: op.entry.timestamp ?? new Date().toISOString(),
        createdAt: op.entry.timestamp ?? new Date().toISOString(),
        updatedAt: op.entry.timestamp ?? new Date().toISOString(),
      }))
    return [...pendingAdds, ...remote]
  }, [])

  /** Flush offline queue to Supabase */
  const flushSyncQueue = useCallback(async () => {
    if (!userId || isSyncing.current) return
    const queue = offlineSyncQueue.getAll()
    if (queue.length === 0) return

    isSyncing.current = true
    console.log(`[Sync] Flushing ${queue.length} offline operation(s)…`)

    let i = 0
    while (i < offlineSyncQueue.getAll().length) {
      const op = offlineSyncQueue.getAll()[i]
      try {
        if (op.type === 'add') {
          const remote = await supabasePushupRepository.add(op.entry)
          // Replace temp-id entry in cache with the real Supabase one
          const cached = readCache()
          const idx = cached.findIndex((e) => e.id === op.localId)
          if (idx !== -1) {
            cached[idx] = remote
          } else {
            cached.unshift(remote)
          }
          writeCache(cached)
          setEntries([...cached].sort(
            (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
          ))
        } else if (op.type === 'update') {
          await supabasePushupRepository.update(op.id, op.updates)
        } else if (op.type === 'delete') {
          await supabasePushupRepository.delete(op.id)
        }
        offlineSyncQueue.dequeue(i)
        // After dequeue, next item slides into index i — don't increment
      } catch (e) {
        console.error('[Sync] Failed to sync op, will retry later:', op, e)
        i++
      }
    }

    setPendingCount(offlineSyncQueue.count())
    isSyncing.current = false
  }, [userId])

  /** Silent background sync — no spinner, keeps cached data visible */
  const backgroundRefresh = useCallback(async () => {
    if (!userId) return
    try {
      await flushSyncQueue()
      const data = await supabasePushupRepository.getAll()
      applyAndCache(mergeWithPending(data))
    } catch (e) {
      console.debug('[Pushups] Background refresh skipped (offline):', e)
    }
  }, [userId, flushSyncQueue, applyAndCache, mergeWithPending])

  /** Migrate any local guest workout entries to Supabase cloud upon sign in */
  const syncGuestEntriesToCloud = useCallback(async () => {
    if (!userId || !isOnline) return
    try {
      const localEntries = await localPushupRepository.getAll()
      if (localEntries.length === 0) return

      console.log(`[Sync] Migrating ${localEntries.length} local guest entries to cloud for user ${userId}...`)
      for (const entry of localEntries) {
        await supabasePushupRepository.add({
          amount: entry.amount,
          skillId: entry.skillId,
          skillName: entry.skillName,
          timestamp: entry.timestamp,
        })
      }
      // Clear local guest repository once migrated to cloud
      localStorage.removeItem('calisthenics_pushup_entries')
      localStorage.removeItem('calisthenics_entries_v1')
    } catch (e) {
      console.error('[Sync] Failed to sync local guest entries to cloud:', e)
    }
  }, [userId, isOnline])

  /** Full refresh from Supabase */
  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      if (userId) {
        await syncGuestEntriesToCloud()
        await flushSyncQueue()
        const data = await supabasePushupRepository.getAll()
        applyAndCache(mergeWithPending(data))
      } else {
        const data = await localPushupRepository.getAll()
        applyAndCache(data)
      }
    } catch (e) {
      console.warn('[Pushups] Supabase unavailable, serving from cache:', e)
    } finally {
      setLoading(false)
    }
  }, [userId, syncGuestEntriesToCloud, flushSyncQueue, applyAndCache, mergeWithPending])

  // Initial load
  useEffect(() => {
    void refresh()
  }, [refresh])

  // When device comes back online → flush queue then quietly refresh
  useEffect(() => {
    if (isOnline && userId) {
      void flushSyncQueue().then(() => {
        supabasePushupRepository.getAll()
          .then((data) => applyAndCache(mergeWithPending(data)))
          .catch(() => { /* stay on cache */ })
      })
    }
  }, [isOnline, userId, flushSyncQueue, applyAndCache, mergeWithPending])

  /**
   * Add — optimistic cache write ONLY (no localPushupRepository for logged-in users).
   * For logged-in users, localPushupRepository is only used as a guest fallback.
   * Using it for logged-in adds was causing duplicates via migrateLocalData on reopen.
   */
  const add = useCallback(
    async (entry: CreatePushupEntry): Promise<void> => {
      const now = new Date().toISOString()

      if (!userId) {
        // Guest mode: write to local repo and cache
        const localEntry = await localPushupRepository.add(entry)
        applyAndCache([localEntry, ...readCache()])
        return
      }

      // Logged-in: create a temp entry in-memory only
      const tempId = `pending_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`
      const tempEntry: PushupEntry = {
        id: tempId,
        amount: entry.amount,
        skillId: entry.skillId,
        skillName: entry.skillName,
        timestamp: entry.timestamp ?? now,
        createdAt: now,
        updatedAt: now,
      }
      applyAndCache([tempEntry, ...readCache()])

      if (isOnline) {
        try {
          const remote = await supabasePushupRepository.add({
            ...entry,
            timestamp: tempEntry.timestamp,
          })
          // Swap temp for real
          const current = readCache()
          const idx = current.findIndex((e) => e.id === tempId)
          if (idx !== -1) current[idx] = remote
          applyAndCache(current)
        } catch (e) {
          console.warn('[Pushups] Add failed while online, queuing:', e)
          offlineSyncQueue.enqueue({
            type: 'add',
            localId: tempId,
            entry: { ...entry, timestamp: tempEntry.timestamp },
          })
          setPendingCount(offlineSyncQueue.count())
        }
      } else {
        // Offline: queue it — temp entry stays in cache until flushed
        offlineSyncQueue.enqueue({
          type: 'add',
          localId: tempId,
          entry: { ...entry, timestamp: tempEntry.timestamp },
        })
        setPendingCount(offlineSyncQueue.count())
      }
    },
    [userId, isOnline, applyAndCache],
  )

  /** Update — optimistic cache update + Supabase sync */
  const update = useCallback(
    async (id: string, updates: UpdatePushupEntry): Promise<void> => {
      applyAndCache(
        readCache().map((e) =>
          e.id === id ? { ...e, ...updates, updatedAt: new Date().toISOString() } : e,
        ),
      )

      if (!userId) {
        await localPushupRepository.update(id, updates).catch(console.error)
        return
      }

      if (isOnline) {
        try {
          await supabasePushupRepository.update(id, updates)
        } catch (e) {
          console.warn('[Pushups] Update failed, queuing:', e)
          offlineSyncQueue.enqueue({ type: 'update', id, updates })
          setPendingCount(offlineSyncQueue.count())
        }
      } else {
        offlineSyncQueue.enqueue({ type: 'update', id, updates })
        setPendingCount(offlineSyncQueue.count())
      }
    },
    [userId, isOnline, applyAndCache],
  )

  /** Delete — remove from cache immediately, sync to Supabase */
  const remove = useCallback(
    async (id: string): Promise<void> => {
      applyAndCache(readCache().filter((e) => e.id !== id))

      if (!userId) {
        await localPushupRepository.delete(id).catch(console.error)
        return
      }

      // Also cancel any pending 'add' op for this id (offline add + offline delete = no-op)
      // offlineSyncQueue already handles this collapse internally

      if (isOnline) {
        try {
          await supabasePushupRepository.delete(id)
        } catch (e) {
          console.warn('[Pushups] Delete failed, queuing:', e)
          offlineSyncQueue.enqueue({ type: 'delete', id })
          setPendingCount(offlineSyncQueue.count())
        }
      } else {
        offlineSyncQueue.enqueue({ type: 'delete', id })
        setPendingCount(offlineSyncQueue.count())
      }
    },
    [userId, isOnline, applyAndCache],
  )

  return { entries, loading, add, update, remove, refresh, backgroundRefresh, isOnline, pendingCount }
}
