import { supabase } from './supabaseClient'
import type { PushupRepository } from './pushupRepository'
import type { CreatePushupEntry, PushupEntry, UpdatePushupEntry } from '../models/PushupEntry'

export class SupabasePushupRepository implements PushupRepository {
  async getAll(): Promise<PushupEntry[]> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data, error } = await supabase
      .from('pushup_entries')
      .select('*')
      .order('timestamp', { ascending: false })

    if (error) throw error

    return data.map(row => ({
      id: row.id,
      amount: row.amount,
      timestamp: row.timestamp,
      createdAt: row.created_at,
      updatedAt: row.created_at, // Mocking updatedAt since we didn't add it to DB
    }))
  }

  async add(entry: CreatePushupEntry): Promise<PushupEntry> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const now = new Date().toISOString()
    const { data, error } = await supabase
      .from('pushup_entries')
      .insert({
        user_id: user.id,
        amount: entry.amount,
        timestamp: entry.timestamp || now,
      })
      .select()
      .single()

    if (error) throw error

    return {
      id: data.id,
      amount: data.amount,
      timestamp: data.timestamp,
      createdAt: data.created_at,
      updatedAt: data.created_at,
    }
  }

  async update(id: string, updates: UpdatePushupEntry): Promise<PushupEntry> {
    const { data, error } = await supabase
      .from('pushup_entries')
      .update({
        amount: updates.amount,
        timestamp: updates.timestamp,
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return {
      id: data.id,
      amount: data.amount,
      timestamp: data.timestamp,
      createdAt: data.created_at,
      updatedAt: data.created_at,
    }
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('pushup_entries')
      .delete()
      .eq('id', id)

    if (error) throw error
  }
}

export const supabasePushupRepository = new SupabasePushupRepository()
