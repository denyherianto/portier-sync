export type DoorStatus = 'online' | 'offline'

export interface Door {
  id: string
  name: string
  location: string
  deviceId: string
  status: DoorStatus
  batteryLevel: number
  lastSeen: string | null
  createdAt: string
}

export interface CreateDoorPayload {
  name: string
  location: string
  deviceId: string
  status?: DoorStatus
  batteryLevel?: number
}

export interface UpdateDoorPayload {
  name?: string
  location?: string
  deviceId?: string
  status?: DoorStatus
  batteryLevel?: number
  lastSeen?: string | null
}
