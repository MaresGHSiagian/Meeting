// Shared types for the application
export interface User {
  id: string
  name: string
  email: string
  avatar?: string
  initials: string
}

export interface Message {
  id: string
  sender: string
  text: string
  timestamp: Date
}

export interface Meeting {
  id: string
  title?: string
  createdBy: string
  participants: User[]
  startTime: Date
  endTime?: Date
}

export type MediaStatus = {
  video: boolean
  audio: boolean
  screen: boolean
}
