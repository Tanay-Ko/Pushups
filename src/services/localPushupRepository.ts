import { v4 as uuidv4 } from 'uuid'
import { STORAGE_KEYS } from '../constants'
import type { CreatePushupEntry, PushupEntry, UpdatePushupEntry } from '../models/PushupEntry'
import type { PushupRepository } from './pushupRepository'

export class LocalPushupRepository implements PushupRepository {
  private read(): PushupEntry[] {
    const raw = localStorage.getItem(STORAGE_KEYS.PUSHUP_ENTRIES)
    if (!raw) return []
    try {
      return JSON.parse(raw) as PushupEntry[]
    } catch {
      return []
    }
  }

  private write(entries: PushupEntry[]): void {
    localStorage.setItem(STORAGE_KEYS.PUSHUP_ENTRIES, JSON.stringify(entries))
  }

  async getAll(): Promise<PushupEntry[]> {
    return this.read().sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    )
  }

  async add(entry: CreatePushupEntry): Promise<PushupEntry> {
    const now = new Date().toISOString()
    const newEntry: PushupEntry = {
      id: uuidv4(),
      amount: entry.amount,
      timestamp: entry.timestamp ?? now,
      createdAt: now,
      updatedAt: now,
    }
    const entries = this.read()
    entries.push(newEntry)
    this.write(entries)
    return newEntry
  }

  async update(id: string, updates: UpdatePushupEntry): Promise<PushupEntry> {
    const entries = this.read()
    const index = entries.findIndex((e) => e.id === id)
    if (index === -1) throw new Error(`Entry not found: ${id}`)

    const updated: PushupEntry = {
      ...entries[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    }
    entries[index] = updated
    this.write(entries)
    return updated
  }

  async delete(id: string): Promise<void> {
    const entries = this.read().filter((e) => e.id !== id)
    this.write(entries)
  }
}

export const localPushupRepository = new LocalPushupRepository()
