<!-- app/components/admin/AdminBookingPanel.vue -->
<script setup lang="ts">
import { parseDate } from '@internationalized/date'
import type { DateValue } from '@internationalized/date'
import type { Booking, Service, StaffMember } from '~/types'
import type { CreateBookingDefaults } from '~/composables/admin/useCalendar'

const props = defineProps<{
  mode: 'view' | 'create'
  booking?: Booking | null
  createDefaults?: CreateBookingDefaults | null
  services: Service[]
  staffList: StaffMember[]
  timeSlots: string[]
  getServiceName: (serviceId: string) => string
  getServiceDuration: (serviceId: string) => number
}>()

const emit = defineEmits<{
  close: []
  confirm: [id: string]
  cancel: [id: string]
  complete: [id: string]
  create: [payload: {
    serviceId: string
    staffId: string | null
    date: string
    time: string
    customerName: string
    customerPhone: string
  }]
}>()

const { t, locale } = useI18n()
const colorMode = useColorMode()
const confirmingCancel = ref(false)
const datePickerOpen   = ref(false)

// Create form
const form = reactive({
  serviceId:     '',
  staffId:       null as string | null,
  date:          '',
  time:          '',
  customerName:  '',
  customerPhone: '',
})

watch(() => props.createDefaults, (d) => {
  if (!d) return
  form.serviceId     = ''
  form.staffId       = d.staffId
  form.date          = d.date
  form.time          = d.time
  form.customerName  = ''
  form.customerPhone = ''
  confirmingCancel.value = false
}, { immediate: true })

watch(() => props.booking, () => { confirmingCancel.value = false })

const panelTitle = computed(() =>
  props.mode === 'view' && props.booking
    ? props.booking.contact.name
    : t('admin.newBooking'),
)

// View mode
const statusColor = computed((): 'warning' | 'primary' | 'success' | 'neutral' => {
  const map = { pending: 'warning', confirmed: 'primary', completed: 'success', cancelled: 'neutral' } as const
  return props.booking ? map[props.booking.status] : 'neutral'
})
const canConfirm  = computed(() => props.booking?.status === 'pending')
const canComplete = computed(() => props.booking?.status === 'confirmed')
const canCancel   = computed(() =>
  props.booking?.status !== 'completed' && props.booking?.status !== 'cancelled',
)

// Create form
const serviceOptions = computed(() =>
  props.services.map(s => ({ label: s.name, value: s.id })),
)
const staffOptions = computed(() => [
  { label: t('admin.calendar.noPreference'), value: '__none__' },
  ...props.staffList.map(s => ({ label: s.name, value: s.id })),
])
const staffSelectValue = computed({
  get: () => form.staffId ?? '__none__',
  set: (v: string) => { form.staffId = v === '__none__' ? null : v },
})
const timeOptions = computed(() =>
  props.timeSlots.map(slot => ({ label: slot, value: slot })),
)
const calendarValue = computed(() => form.date ? parseDate(form.date) : undefined)

function onDateSelect(
  date: DateValue | { start?: DateValue; end?: DateValue } | DateValue[] | null | undefined,
) {
  if (date == null || Array.isArray(date) || (typeof date === 'object' && ('start' in date || 'end' in date))) return
  form.date = date.toString()
  datePickerOpen.value = false
}

const formattedDate = computed(() => {
  const date = props.mode === 'view' ? props.booking?.date : form.date
  if (!date) return t('common.selectDate')
  return new Date(date + 'T12:00:00').toLocaleDateString(
    locale.value === 'ar' ? 'ar-SA' : 'en-GB',
    { weekday: 'long', month: 'long', day: 'numeric' },
  )
})

const isFormValid = computed(() =>
  !!form.serviceId && !!form.date && !!form.time &&
  form.customerName.trim().length > 0 && form.customerPhone.trim().length > 0,
)

function submitCreate() {
  if (!isFormValid.value) return
  emit('create', {
    serviceId:     form.serviceId,
    staffId:       form.staffId,
    date:          form.date,
    time:          form.time,
    customerName:  form.customerName.trim(),
    customerPhone: form.customerPhone.trim(),
  })
}

function onClose() {
  confirmingCancel.value = false
  emit('close')
}
</script>

<template>
  <UDashboardPanel id="booking-panel" :default-size="38" :min-size="30" :resizable="true" :max-size="40">
    <template #header>
      <UDashboardNavbar :title="panelTitle">
        <template #right>
          <UButton
            color="neutral"
            variant="ghost"
            icon="i-heroicons-x-mark"
            :aria-label="$t('common.close')"
            @click="onClose"
          />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <!-- VIEW MODE -->
      <div v-if="mode === 'view' && booking" class="space-y-5 p-4">
        <ClientOnly>
          <UBadge :color="statusColor" :variant="colorMode.value === 'light' ? 'solid' : 'soft'">
            {{ $t(`admin.bookingStatus.${booking.status}`) }}
          </UBadge>
          <template #fallback>
            <UBadge :color="statusColor" variant="soft">
              {{ $t(`admin.bookingStatus.${booking.status}`) }}
            </UBadge>
          </template>
        </ClientOnly>

        <a
          :href="`tel:${booking.contact.phone}`"
          class="flex items-center gap-2 text-sm text-(--color-text-muted)
                 hover:text-(--color-primary) transition-colors duration-150"
          dir="ltr"
        >
          <UIcon name="i-heroicons-phone" class="size-4 shrink-0" />
          {{ booking.contact.phone }}
        </a>

        <USeparator />

        <div>
          <p class="font-medium text-(--color-text)">
            {{ getServiceName(booking.serviceId) }}
          </p>
          <p class="text-sm text-(--color-text-muted) mt-0.5">
            {{ getServiceDuration(booking.serviceId) }}د
          </p>
        </div>

        <div class="flex items-center gap-2 text-sm text-(--color-text-muted)">
          <UIcon name="i-heroicons-calendar-days" class="size-4 shrink-0" />
          <span>{{ formattedDate }}</span>
          <span class="font-mono tabular-nums" dir="ltr">{{ booking.time }}</span>
        </div>
      </div>

      <!-- CREATE MODE -->
      <div v-else-if="mode === 'create'" class="space-y-4 p-4">
        <UFormField :label="$t('admin.calendar.selectService')" required>
          <USelect
            v-model="form.serviceId"
            :items="serviceOptions"
            :placeholder="$t('admin.calendar.selectService')"
            class="w-full"
          />
        </UFormField>

        <UFormField :label="$t('admin.calendar.selectStaff')">
          <USelect
            v-model="staffSelectValue"
            :items="staffOptions"
            class="w-full"
          />
        </UFormField>

        <UFormField :label="$t('common.date')" required>
          <UPopover v-model:open="datePickerOpen">
            <UButton
              color="neutral"
              variant="outline"
              icon="i-heroicons-calendar-days"
              :label="formattedDate"
              class="w-full justify-start font-normal"
            />
            <template #content>
              <UCalendar
                :model-value="calendarValue"
                class="p-2"
                @update:model-value="onDateSelect"
              />
            </template>
          </UPopover>
        </UFormField>

        <UFormField :label="$t('admin.calendar.selectTime')" required>
          <USelect
            v-model="form.time"
            :items="timeOptions"
            :placeholder="$t('admin.calendar.selectTime')"
            class="w-full"
          />
        </UFormField>

        <USeparator />

        <UFormField :label="$t('booking.name')" required>
          <UInput
            v-model="form.customerName"
            :placeholder="$t('booking.namePlaceholder')"
            class="w-full"
          />
        </UFormField>

        <UFormField :label="$t('booking.phone')" required>
          <UInput
            v-model="form.customerPhone"
            type="tel"
            dir="ltr"
            :placeholder="$t('booking.phonePlaceholder')"
            class="w-full"
          />
        </UFormField>
      </div>
    </template>

    <template #footer>
      <div class="flex flex-col gap-2 p-4 border-t border-(--color-border)">
        <!-- VIEW MODE ACTIONS -->
        <template v-if="mode === 'view' && booking">
          <template v-if="confirmingCancel">
            <div class="flex items-center gap-2 flex-wrap">
              <p class="text-sm text-red-600 dark:text-red-400 flex-1 min-w-[200px]">
                {{ $t('admin.confirmCancelBooking') }}
              </p>
              <div class="flex gap-2">
                <UButton color="error" variant="solid" size="sm" @click="emit('cancel', booking.id)">
                  {{ $t('common.confirm') }}
                </UButton>
                <UButton color="neutral" variant="ghost" size="sm" @click="confirmingCancel = false">
                  {{ $t('common.back') }}
                </UButton>
              </div>
            </div>
          </template>
          <template v-else>
            <UButton
              v-if="canConfirm"
              color="primary"
              variant="solid"
              block
              @click="emit('confirm', booking.id)"
            >
              {{ $t('common.confirm') }}
            </UButton>
            <UButton
              v-if="canComplete"
              color="success"
              variant="solid"
              block
              @click="emit('complete', booking.id)"
            >
              {{ $t('admin.completeBooking') }}
            </UButton>
            <UButton
              v-if="canCancel"
              color="neutral"
              variant="ghost"
              block
              class="hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30 dark:hover:text-red-400 transition-colors duration-150"
              @click="confirmingCancel = true"
            >
              {{ $t('common.cancel') }}
            </UButton>
          </template>
        </template>

        <!-- CREATE MODE ACTIONS -->
        <template v-else-if="mode === 'create'">
          <UButton
            color="primary"
            variant="solid"
            block
            :disabled="!isFormValid"
            @click="submitCreate"
          >
            {{ $t('admin.calendar.addBooking') }}
          </UButton>
        </template>
      </div>
    </template>
  </UDashboardPanel>
</template>
