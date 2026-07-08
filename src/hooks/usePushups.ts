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
    const localEntries = await localPushupRepository.getAll()
    if (localEntries.length > 0) {
      console.log('Migrating local data to Supabase...')
      for (const entry of localEntries) {
        try {
          await supabasePushupRepository.add({
            amount: entry.amount,
            timestamp: entry.timestamp,
          })
          await localPushupRepository.delete(entry.id)
        } catch (e) {
          console.error('Failed to migrate entry:', e)
        }
      }
    }
  }

  const refresh = useCallback(async () => {
    setLoading(true)
    if (userId) {
      await migrateLocalData()
    }
    const data = await activeRepository.getAll()
    setEntries(data)
    setLoading(false)
  }, [userId])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const add = useCallback(
    async (entry: CreatePushupEntry) => {
      await activeRepository.add(entry)
      await refresh()
    },
    [refresh, activeRepository],
  )

  const update = useCallback(
    async (id: string, updates: UpdatePushupEntry) => {
      await activeRepository.update(id, updates)
      await refresh()
    },
    [refresh, activeRepository],
  )

  const remove = useCallback(
    async (id: string) => {
      await activeRepository.delete(id)
      await refresh()
    },
    [refresh, activeRepository],
  )

  return { entries, loading, add, update, remove, refresh }
}
