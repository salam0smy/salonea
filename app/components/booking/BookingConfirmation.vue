<!-- app/components/booking/BookingConfirmation.vue -->
<script setup lang="ts">
import type { BookingSelection, Tenant, TenantSettings } from '~/types'

declare global {
  interface Window {
    Moyasar: {
      init: (config: Record<string, unknown>) => void
    }
  }
}

const { t, locale } = useI18n()

const props = defineProps<{
  selection: BookingSelection
  tenant: Tenant
  settings: TenantSettings
}>()

const emit = defineEmits<{ back: [] }>()

const route = useRoute()
const slug = route.params.salon as string

const showPaymentForm = ref(false)
const isLoadingPayment = ref(false)
const paymentError = ref<string | null>(null)

async function loadMoyasarScript(): Promise<void> {
  if (document.querySelector('script[src*="moyasar"]')) return
  return new Promise((resolve, reject) => {
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = 'https://cdn.moyasar.com/mpf/1.14.0/moyasar.css'
    document.head.appendChild(link)

    const script = document.createElement('script')
    script.src = 'https://cdn.moyasar.com/mpf/1.14.0/moyasar.js'
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Failed to load Moyasar'))
    document.head.appendChild(script)
  })
}

async function handlePayNow(): Promise<void> {
  if (props.settings.paymentMode === 'at_salon') {
    await $fetch(`/api/${slug}/bookings/${props.selection.bookingId}/confirm`, { method: 'POST' })
    return
  }

  isLoadingPayment.value = true
  paymentError.value = null

  try {
    const config = await $fetch<{ publishableKey: string | null; isConnected: boolean }>(
      `/api/${slug}/payment-config`,
    )

    if (!config.isConnected || !config.publishableKey) {
      paymentError.value = t('booking.paymentUnavailable')
      return
    }

    await loadMoyasarScript()
    showPaymentForm.value = true

    await nextTick()

    const amountHalalas = props.selection.service!.price * 100

    window.Moyasar.init({
      element: '#moyasar-form',
      amount: amountHalalas,
      currency: 'SAR',
      description: props.selection.service!.name,
      publishable_api_key: config.publishableKey,
      callback_url: `${window.location.origin}/${slug}/booking-done`,
      metadata: {
        booking_id: props.selection.bookingId,
        tenant_id: props.tenant.id,
      },
      methods: ['creditcard', 'applepay', 'stcpay'],
      language: locale.value === 'ar' ? 'ar' : 'en',
    })
  }
  catch {
    paymentError.value = t('booking.paymentUnavailable')
    showPaymentForm.value = false
  }
  finally {
    isLoadingPayment.value = false
  }
}

const dateLocale = computed(() => (locale.value === 'ar' ? 'ar-SA' : 'en-US'))

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString(dateLocale.value, {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })
}

function formatTime(time: string): string {
  const [h, m] = time.split(':').map(Number)
  const period = h < 12 ? t('booking.am') : t('booking.pm')
  const hour = h % 12 || 12
  return `${hour}:${m.toString().padStart(2, '0')} ${period}`
}

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} ${t('booking.minuteLabel')}`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (m === 0) return h === 1 ? t('booking.hourLabel') : `${h} ${t('booking.hoursLabel')}`
  return t('booking.hourAndMinutes', { hours: h, minutes: m })
}

const whatsappUrl = computed(() => {
  const s = props.selection
  const lines = [
    t('booking.whatsappIntro'),
    ``,
    `${t('booking.service')}: ${s.service?.name}`,
    `${t('booking.date')}: ${formatDate(s.date!)}`,
    `${t('booking.time')}: ${formatTime(s.time!)}`,
    `${t('booking.name')}: ${s.contact?.name}`,
    `${t('booking.phone')}: ${s.contact?.phone}`,
  ]
  const text = encodeURIComponent(lines.join('\n'))
  const number = props.tenant.phone?.replace(/\+|\s/g, '') ?? ''
  return `https://wa.me/${number}?text=${text}`
})

const ctaLabel = computed(() => {
  const price = props.selection.service?.price ?? 0
  if (props.settings.paymentMode === 'at_salon') return t('booking.confirmAtSalon')
  if (props.settings.paymentMode === 'deposit' && props.settings.depositPercent) {
    const deposit = Math.round(price * props.settings.depositPercent / 100)
    return t('booking.payDeposit', { deposit })
  }
  return t('booking.payNow', { price })
})
</script>

<template>
  <div class="pt-5 space-y-6">
    <!-- Back -->
    <UButton
      variant="ghost"
      color="neutral"
      size="sm"
      :leading-icon="$i18n.locale === 'ar' ? 'i-heroicons-arrow-right' : 'i-heroicons-arrow-left'"
      @click="emit('back')"
    >
      {{ t('common.back') }}
    </UButton>

    <h2 class="text-2xl font-semibold text-(--color-text)">{{ t('booking.confirmBooking') }}</h2>

    <!-- Summary card -->
    <div class="bg-(--color-surface) rounded-[16px] border border-(--color-border) p-5 space-y-4 shadow-sm">
      <!-- Service + price -->
      <div class="flex items-start justify-between gap-4">
        <div>
          <p class="font-semibold text-(--color-text) text-lg">{{ selection.service?.name }}</p>
          <p class="text-sm text-(--color-text-muted) mt-1">{{ formatDuration(selection.service!.durationMinutes) }}</p>
        </div>
        <p class="font-bold text-(--color-text) text-lg shrink-0">
          {{ selection.service?.price }}
          <span class="text-sm font-normal text-(--color-text-muted)"> {{ t('common.sar') }}</span>
        </p>
      </div>

      <!-- Details -->
      <USeparator class="my-1" />
      <div class="space-y-3">
        <div class="flex justify-between text-base">
          <span class="text-(--color-text-muted)">{{ t('booking.date') }}</span>
          <span class="text-(--color-text) font-medium">{{ formatDate(selection.date!) }}</span>
        </div>
        <div class="flex justify-between text-base">
          <span class="text-(--color-text-muted)">{{ t('booking.time') }}</span>
          <span class="text-(--color-text) font-medium">{{ formatTime(selection.time!) }}</span>
        </div>
        <div v-if="selection.staff" class="flex justify-between text-base">
          <span class="text-(--color-text-muted)">{{ t('booking.staffMember') }}</span>
          <span class="text-(--color-text) font-medium">{{ selection.staff.name }}</span>
        </div>
        <USeparator class="my-1" />
        <div class="flex justify-between text-base">
          <span class="text-(--color-text-muted)">{{ t('booking.name') }}</span>
          <span class="text-(--color-text) font-medium">{{ selection.contact?.name }}</span>
        </div>
        <div class="flex justify-between text-base">
          <span class="text-(--color-text-muted)">{{ t('booking.phone') }}</span>
          <span class="text-(--color-text) font-medium" dir="ltr">{{ selection.contact?.phone }}</span>
        </div>
      </div>
    </div>

    <!-- WhatsApp confirmation link -->
    <UButton
      v-if="tenant.phone"
      as="a"
      :href="whatsappUrl"
      target="_blank"
      rel="noopener"
      variant="outline"
      color="neutral"
      block
      size="lg"
    >
      <template #leading>
        <span class="text-[#25D366] text-lg leading-none" aria-hidden="true">●</span>
      </template>
      {{ t('booking.shareWhatsappConfirmation') }}
    </UButton>
  </div>

  <!-- Moyasar inline payment form (shown after user taps Pay) -->
  <div v-if="showPaymentForm" class="pt-4">
    <div id="moyasar-form" class="rounded-[16px] overflow-hidden" />
  </div>

  <!-- Error -->
  <UAlert
    v-if="paymentError"
    color="error"
    variant="subtle"
    icon="i-heroicons-x-circle"
    :description="paymentError"
    class="mt-4"
  />

  <!-- Sticky payment CTA (hidden once Moyasar form is shown) -->
  <div v-if="!showPaymentForm" class="fixed bottom-0 inset-x-0 bg-(--color-surface)/95 backdrop-blur-md border-t border-(--color-border) p-5">
    <div class="max-w-lg mx-auto space-y-2">
      <UButton block size="xl" color="primary" :loading="isLoadingPayment" @click="handlePayNow">
        <span class="text-lg">{{ ctaLabel }}</span>
      </UButton>
      <p
        v-if="settings.paymentMode !== 'at_salon'"
        class="text-sm text-center text-(--color-text-muted)"
      >
        {{ t('booking.securePaymentRedirect') }}
      </p>
    </div>
  </div>
</template>
