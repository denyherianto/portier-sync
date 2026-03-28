export type UserStatus = 'active' | 'suspended'

export interface User {
  id: string
  name: string
  email: string
  phone: string
  role: string
  status: UserStatus
  createdAt: string
  updatedAt: string
}

export interface CreateUserPayload {
  name: string
  email: string
  phone: string
  role: string
  status?: UserStatus
}

export interface UpdateUserPayload {
  name?: string
  email?: string
  phone?: string
  role?: string
  status?: UserStatus
}
