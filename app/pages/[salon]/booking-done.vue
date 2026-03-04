<!-- app/pages/[salon]/booking-done.vue -->
<script setup lang="ts">
import type { Booking } from '~/types'

definePageMeta({ layout: false })

const route = useRoute()
const slug = route.params.salon as string
const { t, locale } = useI18n()

const paymentId = route.query.id as string | undefined

interface PaymentResult {
  status: 'paid' | 'failed' | 'unknown'
  booking: Booking | null
  message: string | null
}

const { data, pending, error } = await useFetch<PaymentResult>(
  () => `/api/${slug}/payment-result`,
  {
    query: { paymentId },
    immediate: !!paymentId,
  },
)

const { data: tenant } = await useFetch(`/api/${slug}/tenant`)

const status = computed(() => data.value?.status ?? 'unknown')
const booking = computed(() => data.value?.booking)
const errorMessage = computed(() => data.value?.message ?? (error.value as Error | null)?.message ?? null)

const dateLocale = computed(() => locale.value === 'ar' ? 'ar-SA' : 'en-US')

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString(dateLocale.value, {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })
}

function formatTime(time: string): string {
  const [h, m] = time.split(':').map(Number)
  const period = h! < 12 ? t('booking.am') : t('booking.pm')
  const hour = h! % 12 || 12
  return `${hour}:${m!.toString().padStart(2, '0')} ${period}`
}

const whatsappUrl = computed(() => {
  if (!tenant.value || !(tenant.value as { phone?: string | null }).phone) return null
  const phone = ((tenant.value as { phone: string }).phone).replace(/\+|\s/g, '')
  const text = encodeURIComponent(t('booking.whatsappIntro'))
  return `https://wa.me/${phone}?text=${text}`
})

function tryAgain(): void {
  navigateTo(`/${slug}`)
}

function bookAnother(): void {
  navigateTo(`/${slug}`)
}

const pageTitle = computed(() =>
  tenant.value ? `${tenant.value.name} – ${t('booking.bookingConfirmed')}` : undefined,
)
useHead({ title: pageTitle })
</script>

<template>
  <div class="min-h-screen bg-(--color-bg)">
    <BookingHeader v-if="tenant" :tenant="tenant" />

    <div class="max-w-lg mx-auto px-4 py-10">

      <!-- Loading -->
      <div v-if="pending" class="flex flex-col items-center gap-4 pt-16">
        <UIcon name="i-heroicons-arrow-path" class="animate-spin text-5xl text-(--color-text-muted)" />
        <p class="text-(--color-text-muted)">{{ t('booking.paymentProcessing') }}</p>
      </div>

      <!-- Success -->
      <div v-else-if="status === 'paid'" class="flex flex-col items-center gap-6 pt-10">
        <UIcon name="i-heroicons-check-circle" class="text-6xl text-green-500" />
        <h1 class="text-2xl font-bold text-(--color-text) text-center">
          {{ t('booking.paymentSuccess') }}
        </h1>
        <p class="text-(--color-text-muted) text-center">
          {{ t('booking.bookingConfirmedPaid') }}
        </p>

        <!-- Booking summary card -->
        <div
          v-if="booking"
          class="w-full bg-(--color-surface) rounded-[16px] border border-(--color-border) p-5 space-y-3"
        >
          <div class="flex justify-between text-base">
            <span class="text-(--color-text-muted)">{{ t('booking.date') }}</span>
            <span class="font-medium text-(--color-text)">{{ formatDate(booking.date) }}</span>
          </div>
          <USeparator />
          <div class="flex justify-between text-base">
            <span class="text-(--color-text-muted)">{{ t('booking.time') }}</span>
            <span class="font-medium text-(--color-text)">{{ formatTime(booking.time) }}</span>
          </div>
        </div>

        <!-- Book another CTA -->
        <UButton
          color="primary"
          block
          size="lg"
          @click="bookAnother"
        >
          {{ t('booking.bookAnother') }}
        </UButton>

        <!-- WhatsApp CTA -->
        <UButton
          v-if="whatsappUrl"
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

      <!-- Failed / unknown -->
      <div v-else class="flex flex-col items-center gap-6 pt-10">
        <UIcon name="i-heroicons-x-circle" class="text-6xl text-red-500" />
        <h1 class="text-2xl font-bold text-(--color-text) text-center">
          {{ t('booking.paymentFailed') }}
        </h1>
        <p v-if="errorMessage" class="text-(--color-text-muted) text-center">
          {{ errorMessage }}
        </p>
        <UButton block size="lg" color="primary" @click="tryAgain">
          {{ t('booking.tryPaymentAgain') }}
        </UButton>
      </div>

    </div>
  </div>
</template>
