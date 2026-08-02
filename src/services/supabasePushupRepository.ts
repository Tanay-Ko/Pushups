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
      .eq('user_id', user.id)
      .order('timestamp', { ascending: false })

    if (error) {
      console.error('Supabase getAll error:', error)
      throw new Error(error.message || 'Failed to fetch entries')
    }

    return (data || []).map(row => ({
      id: row.id,
      amount: row.amount,
      skillId: row.skill_id || undefined,
      skillName: row.skill_name || undefined,
      timestamp: row.timestamp,
      createdAt: row.created_at,
      updatedAt: row.created_at,
    }))
  }

  async add(entry: CreatePushupEntry): Promise<PushupEntry> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const now = new Date().toISOString()
    const insertPayload: Record<string, any> = {
      user_id: user.id,
      amount: entry.amount,
      timestamp: entry.timestamp || now,
    }
    if (entry.skillId) insertPayload.skill_id = entry.skillId
    if (entry.skillName) insertPayload.skill_name = entry.skillName

    let res = await supabase
      .from('pushup_entries')
      .insert(insertPayload)
      .select()
      .single()

    // Fallback: If custom skill columns do not exist yet in Supabase schema, retry with basic payload
    if (res.error && (res.error.code === 'PGRST204' || res.error.message?.includes('skill_id') || res.error.message?.includes('column'))) {
      console.warn('Skill columns not found in Supabase table. Retrying with basic payload...')
      const basicPayload = {
        user_id: user.id,
        amount: entry.amount,
        timestamp: entry.timestamp || now,
      }
      res = await supabase
        .from('pushup_entries')
        .insert(basicPayload)
        .select()
        .single()
    }

    if (res.error) {
      console.error('Supabase add error:', res.error)
      throw new Error(res.error.message || 'Failed to save entry')
    }

    const data = res.data
    return {
      id: data.id,
      amount: data.amount,
      skillId: data.skill_id || entry.skillId,
      skillName: data.skill_name || entry.skillName,
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

    if (error) {
      console.error('Supabase update error:', error)
      throw new Error(error.message || 'Failed to update entry')
    }

    return {
      id: data.id,
      amount: data.amount,
      skillId: data.skill_id || undefined,
      skillName: data.skill_name || undefined,
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

    if (error) {
      console.error('Supabase delete error:', error)
      throw new Error(error.message || 'Failed to delete entry')
    }
  }
}

export const supabasePushupRepository = new SupabasePushupRepository()
