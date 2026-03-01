<!-- app/components/booking/BookingConfirmation.vue -->
<script setup lang="ts">
import type { BookingSelection, Tenant, TenantSettings } from '~/types'

const props = defineProps<{
  selection: BookingSelection
  tenant: Tenant
  settings: TenantSettings
}>()

const emit = defineEmits<{ back: [] }>()

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('ar-SA', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })
}

function formatTime(time: string): string {
  const [h, m] = time.split(':').map(Number)
  const period = h < 12 ? 'ص' : 'م'
  const hour = h % 12 || 12
  return `${hour}:${m.toString().padStart(2, '0')} ${period}`
}

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} دقيقة`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (m === 0) return h === 1 ? 'ساعة' : `${h} ساعات`
  return `${h} ساعة و${m} دقيقة`
}

const whatsappUrl = computed(() => {
  const s = props.selection
  const lines = [
    `مرحباً، أودّ تأكيد حجزي:`,
    ``,
    `الخدمة: ${s.service?.name}`,
    `التاريخ: ${formatDate(s.date!)}`,
    `الوقت: ${formatTime(s.time!)}`,
    `الاسم: ${s.contact?.name}`,
    `الجوال: ${s.contact?.phone}`,
  ]
  const text = encodeURIComponent(lines.join('\n'))
  const number = props.tenant.phone?.replace(/\+|\s/g, '') ?? ''
  return `https://wa.me/${number}?text=${text}`
})

const ctaLabel = computed(() => {
  const price = props.selection.service?.price ?? 0
  if (props.settings.paymentMode === 'at_salon') return 'تأكيد الحجز — الدفع في الصالون'
  if (props.settings.paymentMode === 'deposit' && props.settings.depositPercent) {
    const deposit = Math.round(price * props.settings.depositPercent / 100)
    return `ادفعي العربون — ${deposit} ر.س`
  }
  return `ادفعي الآن — ${price} ر.س`
})
</script>

<template>
  <div class="pt-5 space-y-4">
    <!-- Back -->
    <button
      class="flex items-center gap-1 text-sm text-gray-500"
      @click="emit('back')"
    >
      <span class="inline-block rotate-180 rtl:rotate-0">←</span>
      رجوع
    </button>

    <h2 class="text-xl font-semibold text-gray-900">تأكيد الحجز</h2>

    <!-- Summary card -->
    <div class="bg-white rounded-2xl border border-gray-100 p-4 space-y-3">
      <!-- Service + price -->
      <div class="flex items-start justify-between gap-2">
        <div>
          <p class="font-semibold text-gray-900 text-base">{{ selection.service?.name }}</p>
          <p class="text-sm text-gray-400 mt-0.5">{{ formatDuration(selection.service!.durationMinutes) }}</p>
        </div>
        <p class="font-bold text-gray-900 shrink-0">
          {{ selection.service?.price }}
          <span class="text-sm font-normal text-gray-400"> ر.س</span>
        </p>
      </div>

      <!-- Details -->
      <div class="border-t border-gray-50 pt-3 space-y-2">
        <div class="flex justify-between text-sm">
          <span class="text-gray-500">التاريخ</span>
          <span class="text-gray-900">{{ formatDate(selection.date!) }}</span>
        </div>
        <div class="flex justify-between text-sm">
          <span class="text-gray-500">الوقت</span>
          <span class="text-gray-900">{{ formatTime(selection.time!) }}</span>
        </div>
        <div v-if="selection.staff" class="flex justify-between text-sm">
          <span class="text-gray-500">الموظفة</span>
          <span class="text-gray-900">{{ selection.staff.name }}</span>
        </div>
        <div class="border-t border-gray-50 pt-2 flex justify-between text-sm">
          <span class="text-gray-500">الاسم</span>
          <span class="text-gray-900">{{ selection.contact?.name }}</span>
        </div>
        <div class="flex justify-between text-sm">
          <span class="text-gray-500">الجوال</span>
          <span class="text-gray-900" dir="ltr">{{ selection.contact?.phone }}</span>
        </div>
      </div>
    </div>

    <!-- WhatsApp confirmation link -->
    <a
      v-if="tenant.phone"
      :href="whatsappUrl"
      target="_blank"
      rel="noopener"
      class="flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-gray-200 bg-white text-sm text-gray-700 hover:border-gray-300 transition-colors"
    >
      <span class="text-[#25D366]">●</span>
      شاركي التأكيد عبر واتساب
    </a>
  </div>

  <!-- Sticky payment CTA (stub) -->
  <div class="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-sm border-t border-gray-100 p-4">
    <div class="max-w-lg mx-auto space-y-2">
      <UButton block size="xl" color="neutral">
        {{ ctaLabel }}
      </UButton>
      <p
        v-if="settings.paymentMode !== 'at_salon'"
        class="text-xs text-center text-gray-400"
      >
        ستُحوَّلين إلى صفحة الدفع الآمن
      </p>
    </div>
  </div>
</template>
