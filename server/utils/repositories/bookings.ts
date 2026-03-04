// server/utils/repositories/bookings.ts
import type { H3Event } from 'h3'
import type { Booking, BookingStatus, PaymentStatus } from '~/types'

interface BookingRow {
  id: string
  tenant_id: string
  service_id: string
  staff_id: string | null
  customer_name: string
  customer_phone: string
  date: string
  time: string
  status: string
  payment_status: string
  created_at: string
}

function mapBooking(row: BookingRow): Booking {
  return {
    id: row.id,
    tenantId: row.tenant_id,
    serviceId: row.service_id,
    staffId: row.staff_id,
    date: row.date,
    time: row.time.slice(0, 5),
    contact: { name: row.customer_name, phone: row.customer_phone },
    status: row.status as BookingStatus,
    paymentStatus: row.payment_status as PaymentStatus,
    createdAt: row.created_at,
  }
}

const BOOKING_SELECT = 'id, tenant_id, service_id, staff_id, customer_name, customer_phone, date, time, status, payment_status, created_at'

export interface BookingQueryOptions {
  date?: string
  from?: string
  to?: string
  status?: BookingStatus
  search?: string
  page?: number
  limit?: number
}

export interface BookingsResult {
  data: Booking[]
  total: number
}

export async function getBookingsByTenant(
  event: H3Event,
  tenantId: string,
  options?: BookingQueryOptions,
): Promise<BookingsResult> {
  const client = await getServerClient(event)
  const page = Math.max(1, options?.page ?? 1)
  const limit = Math.min(100, Math.max(1, options?.limit ?? 10))
  const from = (page - 1) * limit
  const to = from + limit - 1

  let query = client
    .from('bookings')
    .select(BOOKING_SELECT, { count: 'exact' })
    .eq('tenant_id', tenantId)
    .order('date', { ascending: true })
    .order('time', { ascending: true })
    .range(from, to)

  if (options?.date) query = query.eq('date', options.date)
  if (options?.from) query = query.gte('date', options.from)
  if (options?.to) query = query.lte('date', options.to)
  if (options?.status) query = query.eq('status', options.status)
  if (options?.search?.trim()) {
    const term = `%${options.search.trim()}%`
    query = query.or(`customer_name.ilike.${term},customer_phone.ilike.${term}`)
  }

  const { data, error, count } = await query
  if (error) return { data: [], total: 0 }
  return {
    data: (data as BookingRow[]).map(mapBooking),
    total: count ?? 0,
  }
}

export async function createBooking(event: H3Event, payload: {
  tenantId: string
  serviceId: string
  staffId: string | null
  date: string
  time: string
  customerName: string
  customerPhone: string
  paymentStatus: PaymentStatus
}): Promise<Booking | null> {
  const client = await getServerClient(event)
  const { data, error } = await client
    .from('bookings')
    .insert({
      tenant_id: payload.tenantId,
      service_id: payload.serviceId,
      staff_id: payload.staffId,
      date: payload.date,
      time: payload.time,
      customer_name: payload.customerName,
      customer_phone: payload.customerPhone,
      status: 'pending',
      payment_status: payload.paymentStatus,
    })
    .select(BOOKING_SELECT)
    .single()

  if (error || !data) return null
  return mapBooking(data as BookingRow)
}

/** Fetches a single booking by ID scoped to a tenant. Returns null if not found. */
export async function getBookingById(
  event: H3Event,
  tenantId: string,
  bookingId: string,
): Promise<Booking | null> {
  const client = await getServerClient(event)
  const { data, error } = await client
    .from('bookings')
    .select(BOOKING_SELECT)
    .eq('id', bookingId)
    .eq('tenant_id', tenantId)
    .maybeSingle()

  if (error || !data) return null
  return mapBooking(data as BookingRow)
}

export async function updateBookingStatus(
  event: H3Event,
  bookingId: string,
  tenantId: string,
  status: BookingStatus,
): Promise<Booking | null> {
  const client = await getServerClient(event)
  const { data, error } = await client
    .from('bookings')
    .update({ status })
    .eq('id', bookingId)
    .eq('tenant_id', tenantId)
    .select(BOOKING_SELECT)
    .single()

  if (error || !data) return null
  return mapBooking(data as BookingRow)
}
