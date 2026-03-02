<!-- app/pages/[salon].vue -->
<script setup lang="ts">
import type { Service, ServiceCategory } from '~/types'

const route = useRoute()
const slug = route.params.salon as string
const { t } = useI18n()

const { data: servicesData } = await useFetch<{ categories: ServiceCategory[]; services: Service[] }>(`/api/${slug}/services`)
const categories = computed(() => servicesData.value?.categories ?? [])
const services = computed(() => servicesData.value?.services ?? [])

const { data: staff } = await useFetch(`/api/${slug}/staff`)

// We'll also need tenant and settings for the header and confirmation
const { data: tenant } = await useFetch(`/api/${slug}/tenant`)
const { data: settings } = await useFetch(`/api/${slug}/settings`)

const { step, selection, advance, back, submitBooking } = useBookingFlow()

// Allow clicking a stepper item to go back to a previously reached step.
// Forward jumps are blocked — user must complete each step in order.
function goToStep(index: string | number | undefined) {
  if (index === undefined) return
  const target = (Number(index) + 1) as 1 | 2 | 3 | 4
  if (target < step.value) {
    step.value = target
  }
}

const stepperItems = computed(() => [
  { title: t('booking.steps.service') },
  { title: t('booking.steps.datetime') },
  { title: t('booking.steps.contact') },
  { title: t('booking.steps.confirm') },
])

// Reactively fetch slots when date or service changes
const availabilityUrl = computed(() =>
  selection.value.date && selection.value.service
    ? `/api/${slug}/availability?date=${selection.value.date}&serviceId=${selection.value.service.id}${selection.value.staff ? `&staffId=${selection.value.staff.id}` : ''}`
    : null,
)
const { data: availabilityData } = await useAsyncData(
  () => (availabilityUrl.value ? `availability-${availabilityUrl.value}` : 'availability-none'),
  () =>
    availabilityUrl.value
      ? $fetch<{ slots: { time: string; available: boolean }[] }>(availabilityUrl.value)
      : Promise.resolve({ slots: [] }),
  { watch: [availabilityUrl] },
)
const availableSlots = computed(() => (availabilityData.value?.slots ?? []).map((s) => s.time))

async function handleNextContact() {
  await submitBooking(slug)
}
</script>

<template>
  <div class="min-h-screen bg-(--color-bg)">
    <BookingHeader v-if="tenant" :tenant="tenant" />

    <div class="max-w-lg mx-auto px-4 pb-36">
      <!-- Step progress indicator -->
      <div v-if="step <= 4" class="pt-5 pb-2">
        <UStepper
          :items="stepperItems"
          :model-value="step - 1"
          size="sm"
          @update:model-value="goToStep"
        />
      </div>

      <!-- Step 1: Service selection -->
      <BookingServiceList
        v-if="step === 1"
        v-model:selected-service="selection.service"
        v-model:selected-staff="selection.staff"
        :categories="categories"
        :services="services"
        :staff="staff ?? []"
        @next="advance"
      />

      <!-- Step 2: Date/time picker -->
      <BookingDatePicker
        v-else-if="step === 2"
        v-model:selected-date="selection.date"
        v-model:selected-time="selection.time"
        :service="selection.service!"
        :staff="selection.staff"
        :available-slots="availableSlots"
        @next="advance"
        @back="back"
      />

      <!-- Step 3: Contact info -->
      <BookingContactForm
        v-else-if="step === 3"
        v-model:contact="selection.contact"
        @next="handleNextContact"
        @back="back"
      />

      <!-- Step 4: Confirmation -->
      <BookingConfirmation
        v-else-if="step === 4 && tenant && settings"
        :selection="selection"
        :tenant="tenant"
        :settings="settings"
        @back="back"
      />
    </div>
  </div>
</template>
