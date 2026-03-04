<!-- app/pages/admin/bookings.vue -->
<script setup lang="ts">
import type { BookingStatus } from '~/types'

definePageMeta({
  layout: 'admin',
  middleware: 'auth',
})

const { t } = useI18n()
const colorMode = useColorMode()

const {
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
  isLoading,
} = useBookings()
const { services } = useServices()
const { staff } = useStaff()

const statusOptions: Array<{ value: BookingStatus | 'all'; label: string }> = [
  { value: 'all', label: t('admin.filterAll') },
  { value: 'pending', label: t('admin.bookingStatus.pending') },
  { value: 'confirmed', label: t('admin.bookingStatus.confirmed') },
  { value: 'completed', label: t('admin.bookingStatus.completed') },
  { value: 'cancelled', label: t('admin.bookingStatus.cancelled') },
]

function getServiceName(serviceId: string): string {
  return services.value.find(s => s.id === serviceId)?.name ?? serviceId
}

function getStaffName(staffId: string | null): string | null {
  if (!staffId) return null
  return staff.value.find(s => s.id === staffId)?.name ?? staffId
}

const tableRows = computed(() =>
  bookings.value.map(b => ({
    id: b.id,
    customerName: b.contact.name,
    customerPhone: b.contact.phone,
    date: b.date,
    time: b.time,
    serviceName: getServiceName(b.serviceId),
    staffName: getStaffName(b.staffId),
    status: b.status,
    paymentStatus: b.paymentStatus,
  })),
)

const columns = [
  { id: 'customerName', accessorKey: 'customerName', header: t('admin.customer'), cellClass: 'min-w-0' },
  { id: 'date', accessorKey: 'date', header: t('common.date'), cellClass: 'whitespace-nowrap' },
  { id: 'time', accessorKey: 'time', header: t('booking.time'), cellClass: 'whitespace-nowrap' },
  { id: 'serviceName', accessorKey: 'serviceName', header: t('booking.service'), cellClass: 'min-w-0' },
  { id: 'status', accessorKey: 'status', header: t('admin.columnStatus'), cellClass: 'whitespace-nowrap' },
  { id: 'paymentStatus', accessorKey: 'paymentStatus', header: t('admin.columnPayment'), cellClass: 'whitespace-nowrap' },
  { id: 'actions', accessorKey: 'actions', header: ' ', cellClass: 'w-0 text-end' },
]

const statusBadgeColor = (status: BookingStatus): 'warning' | 'primary' | 'success' | 'neutral' => {
  const map: Record<BookingStatus, 'warning' | 'primary' | 'success' | 'neutral'> = {
    pending: 'warning',
    confirmed: 'primary',
    completed: 'success',
    cancelled: 'neutral',
  }
  return map[status]
}

const confirmingCancelId = ref<string | null>(null)
function requestCancel(id: string) {
  confirmingCancelId.value = id
}
function clearCancel() {
  confirmingCancelId.value = null
}

</script>

<template>
  <UDashboardPanel id="bookings">
    <template #header>
      <UDashboardNavbar :title="$t('admin.bookings')" />
    </template>

    <template #body>
      <!-- Filter bar -->
      <div class="flex flex-wrap items-center gap-3 p-4 border-b border-default">
        <UInput
          v-model="search"
          icon="i-lucide-search"
          :placeholder="$t('admin.searchBookings')"
          class="min-w-48 max-w-64"
          size="sm"
        />
        <USelect
          v-model="statusFilter"
          :items="statusOptions"
          class="min-w-36"
          size="sm"
        />
        <ClientOnly>
          <UInput
            v-model="dateFrom"
            type="date"
            size="sm"
            class="min-w-36"
            :placeholder="$t('admin.dateFrom')"
          />
          <UInput
            v-model="dateTo"
            type="date"
            size="sm"
            class="min-w-36"
            :placeholder="$t('admin.dateTo')"
          />
          <template #fallback>
            <UInput size="sm" class="min-w-36" disabled :placeholder="$t('admin.dateFrom')" />
            <UInput size="sm" class="min-w-36" disabled :placeholder="$t('admin.dateTo')" />
          </template>
        </ClientOnly>
      </div>

      <!-- Table wrapper: horizontal scroll on small screens -->
      <div class="overflow-x-auto">
        <UTable
          :data="tableRows"
          :columns="columns"
          :loading="isLoading"
          class="min-w-[800px]"
        >
          <template #customerName-cell="{ row }">
            <div class="min-w-0">
              <p class="font-medium text-default text-sm truncate">
                {{ row.original?.customerName }}
              </p>
              <p class="text-xs text-muted font-mono truncate" dir="ltr">
                {{ row.original?.customerPhone }}
              </p>
            </div>
          </template>

          <template #serviceName-cell="{ row }">
            <div class="min-w-0">
              <p class="text-sm text-default truncate">
                {{ row.original?.serviceName }}
              </p>
              <p v-if="row.original?.staffName" class="text-xs text-muted truncate">
                {{ row.original?.staffName }}
              </p>
            </div>
          </template>

          <template #status-cell="{ row }">
            <ClientOnly>
              <UBadge :color="statusBadgeColor(row.original?.status)" :variant="colorMode.value === 'light' ? 'solid' : 'soft'" size="md">
                {{ $t(`admin.bookingStatus.${row.original?.status}`) }}
              </UBadge>
              <template #fallback>
                <UBadge :color="statusBadgeColor(row.original?.status)" variant="soft" size="md">
                  {{ $t(`admin.bookingStatus.${row.original?.status}`) }}
                </UBadge>
              </template>
            </ClientOnly>
          </template>

          <template #paymentStatus-cell="{ row }">
            <ClientOnly>
              <UBadge
                v-if="row.original?.paymentStatus !== 'at_salon'"
                color="neutral"
                :variant="colorMode.value === 'light' ? 'solid' : 'soft'"
                size="sm"
              >
                {{ $t(`admin.paymentStatus.${row.original?.paymentStatus}`) }}
              </UBadge>
              <span v-else class="text-sm text-muted">{{ $t('admin.paymentStatus.at_salon') }}</span>
              <template #fallback>
                <UBadge
                  v-if="row.original?.paymentStatus !== 'at_salon'"
                  color="neutral"
                  variant="soft"
                  size="sm"
                >
                  {{ $t(`admin.paymentStatus.${row.original?.paymentStatus}`) }}
                </UBadge>
                <span v-else class="text-sm text-muted">{{ $t('admin.paymentStatus.at_salon') }}</span>
              </template>
            </ClientOnly>
          </template>

          <template #actions-cell="{ row }">
            <div class="flex items-center justify-end gap-2">
              <template v-if="confirmingCancelId === row.original?.id">
                <span class="text-sm text-error font-medium me-2">
                  {{ $t('admin.confirmCancelBooking') }}
                </span>
                <UButton
                  size="sm"
                  color="error"
                  variant="solid"
                  @click="cancelBooking(row.original?.id); clearCancel()"
                >
                  {{ $t('common.confirm') }}
                </UButton>
                <UButton
                  size="sm"
                  color="neutral"
                  variant="ghost"
                  @click="clearCancel()"
                >
                  {{ $t('common.cancel') }}
                </UButton>
              </template>
              <template v-else>
                <UButton
                  v-if="row.original?.status === 'pending'"
                  size="sm"
                  color="primary"
                  variant="soft"
                  @click="confirmBooking(row.original?.id)"
                >
                  {{ $t('common.confirm') }}
                </UButton>
                <UButton
                  v-if="row.original?.status === 'confirmed'"
                  size="sm"
                  color="success"
                  variant="soft"
                  @click="completeBooking(row.original?.id)"
                >
                  {{ $t('admin.completeBooking') }}
                </UButton>
                <UButton
                  v-if="row.original?.status !== 'completed' && row.original?.status !== 'cancelled'"
                  size="sm"
                  color="neutral"
                  variant="ghost"
                  icon="i-lucide-x"
                  :aria-label="$t('common.cancel')"
                  @click="requestCancel(row.original?.id)"
                />
              </template>
            </div>
          </template>

          <template #empty-state>
            <div class="flex flex-col items-center justify-center py-16 gap-3">
              <div class="w-12 h-12 rounded-2xl bg-elevated flex items-center justify-center">
                <UIcon name="i-lucide-clipboard-list" class="size-6 text-muted" />
              </div>
              <p class="text-muted text-sm">{{ $t('admin.noBookings') }}</p>
            </div>
          </template>
        </UTable>
      </div>

      <!-- Pagination -->
      <div
        v-if="total > 0"
        class="flex items-center justify-between gap-4 p-4 border-t border-default"
      >
        <p class="text-sm text-muted">
          {{ total }} {{ $t('admin.bookings') }}
        </p>
        <ClientOnly>
          <UPagination
            v-model:page="page"
            :total="total"
            :items-per-page="limit"
            show-edges
            prev-icon="i-lucide-chevron-right"
            next-icon="i-lucide-chevron-left"
            first-icon="i-lucide-chevrons-right"
            last-icon="i-lucide-chevrons-left"
          />
        </ClientOnly>
      </div>
    </template>
  </UDashboardPanel>
</template>
