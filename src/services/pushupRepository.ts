import type { CreatePushupEntry, PushupEntry, UpdatePushupEntry } from '../models/PushupEntry'

export interface PushupRepository {
  getAll(): Promise<PushupEntry[]>
  add(entry: CreatePushupEntry): Promise<PushupEntry>
  update(id: string, updates: UpdatePushupEntry): Promise<PushupEntry>
  delete(id: string): Promise<void>
}

// TODO: Implement SupabasePushupRepository when backend is connected.
// export class SupabasePushupRepository implements PushupRepository { ... }
