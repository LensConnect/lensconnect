export type UserRole = "client" | "photographer" | "admin"

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  avatar?: string
  createdAt: Date
}

export interface PhotographerProfile {
  id: string
  userId: string
  bio: string
  specialties: string[]
  location: string
  hourlyRate: number
  rating: number
  reviewCount: number
  portfolioImages: string[]
  availability: boolean
}

export interface Booking {
  id: string
  clientId: string
  photographerId: string
  date: Date
  duration: number
  location: string
  type: string
  status: "pending" | "confirmed" | "completed" | "cancelled"
  totalPrice: number
  notes?: string
}

export interface Review {
  id: string
  bookingId: string
  clientId: string
  photographerId: string
  rating: number
  comment: string
  createdAt: Date
}

export interface Message {
  id: string
  senderId: string
  receiverId: string
  content: string
  createdAt: Date
  read: boolean
}

export interface Job {
  id: string
  clientId: string
  title: string
  description: string
  location: string
  category: string
  date: Date
  durationHours: number
  budget: number
  status: "open" | "filled" | "cancelled" | "completed"
  createdAt: Date
}

export interface JobApplication {
  id: string
  jobId: string
  photographerId: string
  message: string
  bidAmount?: number
  status: "pending" | "accepted" | "rejected"
  createdAt: Date
}
