import { useCallback, useEffect, useState } from 'react'
import type { CreatePushupEntry, PushupEntry, UpdatePushupEntry } from '../models/PushupEntry'
import { supabasePushupRepository } from '../services/supabasePushupRepository'
import { localPushupRepository } from '../services/localPushupRepository'

export function usePushups(userId?: string) {
  const [entries, setEntries] = useState<PushupEntry[]>([])
  const [loading, setLoading] = useState(true)

  const activeRepository = userId ? supabasePushupRepository : localPushupRepository

  const migrateLocalData = async () => {
    if (!userId) return
    try {
      const localEntries = await localPushupRepository.getAll()
      if (localEntries.length > 0) {
        console.log('Migrating local data to Supabase...')
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
            console.error('Failed to migrate entry:', e)
          }
        }
      }
    } catch (e) {
      console.error('Migration error:', e)
    }
  }

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      if (userId) {
        await migrateLocalData()
      }
      const data = await activeRepository.getAll()
      setEntries(data)
    } catch (e) {
      console.warn('Failed to load from active repository, falling back to local:', e)
      const localData = await localPushupRepository.getAll()
      setEntries(localData)
    } finally {
      setLoading(false)
    }
  }, [userId, activeRepository])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const add = useCallback(
    async (entry: CreatePushupEntry) => {
      try {
        await activeRepository.add(entry)
      } catch (err) {
        console.warn('Repository add failed, saving to local repository fallback:', err)
        await localPushupRepository.add(entry)
      } finally {
        await refresh()
      }
    },
    [refresh, activeRepository],
  )

  const update = useCallback(
    async (id: string, updates: UpdatePushupEntry) => {
      try {
        await activeRepository.update(id, updates)
      } catch (err) {
        console.warn('Repository update failed, updating local repository fallback:', err)
        await localPushupRepository.update(id, updates)
      } finally {
        await refresh()
      }
    },
    [refresh, activeRepository],
  )

  const remove = useCallback(
    async (id: string) => {
      try {
        await activeRepository.delete(id)
      } catch (err) {
        console.warn('Repository delete failed, deleting from local repository fallback:', err)
        await localPushupRepository.delete(id)
      } finally {
        await refresh()
      }
    },
    [refresh, activeRepository],
  )

  return { entries, loading, add, update, remove, refresh }
}
