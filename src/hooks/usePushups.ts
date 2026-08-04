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

export function usePushups(userId?: string) {
  const isOnline = useOnlineStatus()
  const isSyncing = useRef(false)

  // Seed state from cache immediately so app feels instant
  const [entries, setEntries] = useState<PushupEntry[]>(() => readCache())
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

  /** Migrate any pre-auth local entries into Supabase */
  const migrateLocalData = useCallback(async () => {
    if (!userId) return
    try {
      const localEntries = await localPushupRepository.getAll()
      if (localEntries.length > 0) {
        for (const entry of localEntries) {
          try {
            await supabasePushupRepository.add({
              amount: entry.amount,
              skillId: entry.skillId,
              skillName: entry.skillName,
              timestamp: entry.timestamp,
            })
            await localPushupRepository.delete(entry.id)
          } catch (e) {
            console.error('[Migration] Failed to migrate entry:', e)
          }
        }
      }
    } catch (e) {
      console.error('[Migration] Error during migration:', e)
    }
  }, [userId])

  /** Flush offline queue to Supabase */
  const flushSyncQueue = useCallback(async () => {
    if (!userId || isSyncing.current) return
    const queue = offlineSyncQueue.getAll()
    if (queue.length === 0) return

    isSyncing.current = true
    console.log(`[Sync] Flushing ${queue.length} offline operation(s)…`)

    // Process in order, removing each op as it succeeds
    let i = 0
    while (i < offlineSyncQueue.getAll().length) {
      const op = offlineSyncQueue.getAll()[i]
      try {
        if (op.type === 'add') {
          const remote = await supabasePushupRepository.add(op.entry)
          // Replace the temp local-id entry in cache with the real one
          const cached = readCache()
          const idx = cached.findIndex((e) => e.id === op.localId)
          if (idx !== -1) {
            cached[idx] = remote
            writeCache(cached)
            setEntries([...cached].sort(
              (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
            ))
          }
        } else if (op.type === 'update') {
          await supabasePushupRepository.update(op.id, op.updates)
        } else if (op.type === 'delete') {
          await supabasePushupRepository.delete(op.id)
        }
        offlineSyncQueue.dequeue(i)
        // Don't increment i — after dequeue the next item slides into position i
      } catch (e) {
        console.error('[Sync] Failed to sync op, will retry later:', op, e)
        i++ // Skip this one for now, try next
      }
    }

    setPendingCount(offlineSyncQueue.count())
    isSyncing.current = false
  }, [userId])

  /** Silent background sync — doesn't show loading spinner, keeps cached data visible */
  const backgroundRefresh = useCallback(async () => {
    if (!userId) return
    try {
      await flushSyncQueue()
      const data = await supabasePushupRepository.getAll()
      applyAndCache(data)
    } catch (e) {
      // Offline or Supabase unavailable — silently stay on cache
      console.debug('[Pushups] Background refresh skipped (offline):', e)
    }
  }, [userId, flushSyncQueue, applyAndCache])

  /** Full refresh from Supabase, update cache */
  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      if (userId) {
        await migrateLocalData()
        await flushSyncQueue()
        const data = await supabasePushupRepository.getAll()
        applyAndCache(data)
      } else {
        const data = await localPushupRepository.getAll()
        applyAndCache(data)
      }
    } catch (e) {
      console.warn('[Pushups] Supabase unavailable, serving from cache:', e)
      // Cache is already in state from useState initialiser — nothing to do
    } finally {
      setLoading(false)
    }
  }, [userId, migrateLocalData, flushSyncQueue, applyAndCache])

  // Initial load
  useEffect(() => {
    void refresh()
  }, [refresh])

  // When device comes back online → flush queue then refresh
  useEffect(() => {
    if (isOnline && userId) {
      void flushSyncQueue().then(() => {
        // Do a quiet background refresh to pull in any changes from other devices
        supabasePushupRepository.getAll()
          .then((data) => applyAndCache(data))
          .catch(() => {/* stay on cache */})
      })
    }
  }, [isOnline, userId, flushSyncQueue, applyAndCache])

  /** Add — writes to cache instantly, queues Supabase sync */
  const add = useCallback(
    async (entry: CreatePushupEntry): Promise<void> => {
      // 1. Write to local cache immediately (optimistic)
      const localEntry = await localPushupRepository.add(entry)
      const cached = readCache()
      applyAndCache([localEntry, ...cached])

      if (!userId) return // guest mode — local only

      if (isOnline) {
        // 2a. Online: push to Supabase, replace temp entry with real one
        try {
          const remote = await supabasePushupRepository.add({
            ...entry,
            timestamp: localEntry.timestamp,
          })
          const current = readCache()
          const idx = current.findIndex((e) => e.id === localEntry.id)
          if (idx !== -1) current[idx] = remote
          applyAndCache(current)
          // Remove from local fallback store
          await localPushupRepository.delete(localEntry.id).catch(() => {})
        } catch (e) {
          console.warn('[Pushups] Add failed online, queuing for later sync:', e)
          offlineSyncQueue.enqueue({ type: 'add', localId: localEntry.id, entry: { ...entry, timestamp: localEntry.timestamp } })
          setPendingCount(offlineSyncQueue.count())
        }
      } else {
        // 2b. Offline: enqueue for later
        offlineSyncQueue.enqueue({ type: 'add', localId: localEntry.id, entry: { ...entry, timestamp: localEntry.timestamp } })
        setPendingCount(offlineSyncQueue.count())
      }
    },
    [userId, isOnline, applyAndCache],
  )

  /** Update — optimistic local update + Supabase sync */
  const update = useCallback(
    async (id: string, updates: UpdatePushupEntry): Promise<void> => {
      // Optimistic update in cache
      const cached = readCache().map((e) =>
        e.id === id ? { ...e, ...updates, updatedAt: new Date().toISOString() } : e,
      )
      applyAndCache(cached)

      if (!userId) {
        await localPushupRepository.update(id, updates).catch(console.error)
        return
      }

      if (isOnline) {
        try {
          await supabasePushupRepository.update(id, updates)
        } catch (e) {
          console.warn('[Pushups] Update failed online, queuing:', e)
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

  /** Delete — optimistic local removal + Supabase sync */
  const remove = useCallback(
    async (id: string): Promise<void> => {
      // Optimistic removal
      applyAndCache(readCache().filter((e) => e.id !== id))

      if (!userId) {
        await localPushupRepository.delete(id).catch(console.error)
        return
      }

      if (isOnline) {
        try {
          await supabasePushupRepository.delete(id)
        } catch (e) {
          console.warn('[Pushups] Delete failed online, queuing:', e)
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
