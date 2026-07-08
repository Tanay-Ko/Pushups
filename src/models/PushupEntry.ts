export interface PushupEntry {
  id: string
  amount: number
  timestamp: string
  createdAt: string
  updatedAt: string
}

export type CreatePushupEntry = Pick<PushupEntry, 'amount'> & {
  timestamp?: string
}

export type UpdatePushupEntry = Partial<Pick<PushupEntry, 'amount' | 'timestamp'>>
