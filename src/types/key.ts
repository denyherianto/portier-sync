export type KeyStatus = 'active' | 'revoked'

export interface Key {
  id: string
  userId: string
  doorId: string
  keyType: string
  accessStart: string
  accessEnd: string
  status: KeyStatus
  createdAt: string
}

export interface CreateKeyPayload {
  userId: string
  doorId: string
  keyType: string
  accessStart: string
  accessEnd: string
  status?: KeyStatus
}

export interface UpdateKeyPayload {
  keyType?: string
  accessStart?: string
  accessEnd?: string
  status?: KeyStatus
}
