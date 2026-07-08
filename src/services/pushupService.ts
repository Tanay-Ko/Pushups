import type { CreatePushupEntry, PushupEntry, UpdatePushupEntry } from '../models/PushupEntry'
import { localPushupRepository } from './localPushupRepository'
import type { PushupRepository } from './pushupRepository'

class PushupService {
  private repository: PushupRepository

  constructor(repository: PushupRepository) {
    this.repository = repository
  }

  getAll(): Promise<PushupEntry[]> {
    return this.repository.getAll()
  }

  add(entry: CreatePushupEntry): Promise<PushupEntry> {
    return this.repository.add(entry)
  }

  update(id: string, updates: UpdatePushupEntry): Promise<PushupEntry> {
    return this.repository.update(id, updates)
  }

  delete(id: string): Promise<void> {
    return this.repository.delete(id)
  }
}

export const pushupService = new PushupService(localPushupRepository)
