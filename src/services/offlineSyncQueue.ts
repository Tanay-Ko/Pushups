/**
 * Offline Sync Queue
 *
 * Persists pending mutations (add / update / delete) to localStorage.
 * When the device comes back online, usePushups flushes this queue
 * to Supabase in order.
 */

import type { CreatePushupEntry, UpdatePushupEntry } from '../models/PushupEntry'

const QUEUE_KEY = 'reptree_offline_sync_queue_v1'

export type SyncOperation =
  | { type: 'add';    localId: string; entry: CreatePushupEntry }
  | { type: 'update'; id: string;      updates: UpdatePushupEntry }
  | { type: 'delete'; id: string }

function readQueue(): SyncOperation[] {
  try {
    const raw = localStorage.getItem(QUEUE_KEY)
    return raw ? (JSON.parse(raw) as SyncOperation[]) : []
  } catch {
    return []
  }
}

function writeQueue(queue: SyncOperation[]): void {
  try {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue))
  } catch (e) {
    console.error('[SyncQueue] Failed to persist queue:', e)
  }
}

export const offlineSyncQueue = {
  getAll(): SyncOperation[] {
    return readQueue()
  },

  count(): number {
    return readQueue().length
  },

  enqueue(op: SyncOperation): void {
    const queue = readQueue()

    // Collapse: if we already queued an 'add' for this localId, and now we
    // get an 'update' for it, just patch the queued add payload instead.
    if (op.type === 'update') {
      const addIdx = queue.findIndex(
        (q) => q.type === 'add' && q.localId === op.id,
      )
      if (addIdx !== -1) {
        const existing = queue[addIdx] as Extract<SyncOperation, { type: 'add' }>
        if (op.updates.amount !== undefined) existing.entry.amount = op.updates.amount
        writeQueue(queue)
        return
      }
    }

    // Collapse: if we queued an 'add' and now a 'delete' for the same localId,
    // just remove the add — nothing ever hit Supabase.
    if (op.type === 'delete') {
      const addIdx = queue.findIndex(
        (q) => q.type === 'add' && q.localId === op.id,
      )
      if (addIdx !== -1) {
        queue.splice(addIdx, 1)
        writeQueue(queue)
        return
      }
    }

    queue.push(op)
    writeQueue(queue)
  },

  /** Remove a single operation after successful sync */
  dequeue(index: number): void {
    const queue = readQueue()
    queue.splice(index, 1)
    writeQueue(queue)
  },

  clear(): void {
    localStorage.removeItem(QUEUE_KEY)
  },
}
