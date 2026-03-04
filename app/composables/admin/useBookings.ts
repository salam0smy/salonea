// app/composables/admin/useBookings.ts
import { ref, computed, watch } from 'vue'
import type { Booking, BookingStatus } from '~/types'

interface BookingsResponse {
  data: Booking[]
  total: number
}

export function useBookings() {
  const page = ref(1)
  const limit = ref(10)
  const search = ref('')
  const statusFilter = ref<BookingStatus | 'all'>('all')
  const dateFrom = ref('')
  const dateTo = ref('')

  watch([search, statusFilter, dateFrom, dateTo], () => {
    page.value = 1
  })

  const queryParams = computed(() => {
    const q: Record<string, any> = {
      page: page.value,
      limit: limit.value,
    }
    if (search.value.trim()) q.search = search.value.trim()
    if (statusFilter.value !== 'all') q.status = statusFilter.value
    if (dateFrom.value) q.from = dateFrom.value
    if (dateTo.value) q.to = dateTo.value
    return q
  })

  const { data: response, pending, error, refresh } = useFetch<BookingsResponse>(
    '/api/admin/bookings',
    { 
      query: queryParams,
      default: () => ({ data: [], total: 0 }),
      watch: [page, limit, search, statusFilter, dateFrom, dateTo]
    },
  )

  const bookings = computed(() => {
    const v = response.value
    if (!v || typeof v !== 'object') return []
    if (Array.isArray(v)) return v
    return Array.isArray((v as BookingsResponse).data) ? (v as BookingsResponse).data : []
  })
  
  const total = computed(() => {
    const v = response.value
    if (!v || typeof v !== 'object') return 0
    if (Array.isArray(v)) return v.length
    return typeof (v as BookingsResponse).total === 'number' ? (v as BookingsResponse).total : 0
  })

  async function confirmBooking(id: string): Promise<void> {
    await $fetch(`/api/admin/bookings/${id}/status`, {
      method: 'PATCH',
      body: { status: 'confirmed' },
    })
    await refresh()
  }

  async function cancelBooking(id: string): Promise<void> {
    await $fetch(`/api/admin/bookings/${id}/status`, {
      method: 'PATCH',
      body: { status: 'cancelled' },
    })
    await refresh()
  }

  async function completeBooking(id: string): Promise<void> {
    await $fetch(`/api/admin/bookings/${id}/status`, {
      method: 'PATCH',
      body: { status: 'completed' },
    })
    await refresh()
  }

  return {
    bookings,
    total,
    page,
    limit,
    search,
    statusFilter,
    dateFrom,
    dateTo,
    confirmBooking,
    cancelBooking,
    completeBooking,
    isLoading: pending,
    error,
    refresh,
  }
}
