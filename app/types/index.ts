// app/types/index.ts

export interface Tenant {
  id: string
  slug: string
  name: string         // Arabic (primary display)
  nameEn: string | null
  description: string | null
  logoUrl: string | null
  brandColor: string   // hex, e.g. "#C9A87C"
  phone: string | null // Saudi format, e.g. "+966501234567"
}

export interface ServiceCategory {
  id: string
  tenantId: string
  name: string         // Arabic
  nameEn: string | null
  sortOrder: number
}

export interface Service {
  id: string
  tenantId: string
  categoryId: string
  name: string         // Arabic
  nameEn: string | null
  description: string | null
  price: number        // SAR, integer (e.g. 150 = 150 ر.س)
  durationMinutes: number
  isActive: boolean
}

export interface StaffMember {
  id: string
  tenantId: string
  name: string         // Arabic
  nameEn: string | null
  photoUrl: string | null
  serviceIds: string[] // services this staff member can perform
}

export interface TimeSlot {
  time: string         // "09:00" 24h
  available: boolean
}

export interface BookingContact {
  name: string
  phone: string
}

export type PaymentMode = 'full' | 'deposit' | 'at_salon'

export interface TenantSettings {
  paymentMode: PaymentMode
  depositPercent: number | null  // e.g. 30 means 30%
  maxAdvanceDays: number         // how far ahead customers can book
}

export interface BookingSelection {
  service: Service | null
  staff: StaffMember | null      // null = no preference
  date: string | null            // "2026-03-15" ISO date
  time: string | null            // "10:00" 24h
  contact: BookingContact | null
}
