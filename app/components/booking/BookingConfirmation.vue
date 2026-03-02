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
  <div class="pt-5 space-y-6">
    <!-- Back -->
    <button
      class="flex items-center gap-1 text-sm text-(--color-text-muted) hover:text-(--color-text) transition-colors"
      @click="emit('back')"
    >
      <span class="inline-block rotate-180 rtl:rotate-0">←</span>
      رجوع
    </button>

    <h2 class="text-2xl font-semibold text-(--color-text)">تأكيد الحجز</h2>

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
          <span class="text-sm font-normal text-(--color-text-muted)"> ر.س</span>
        </p>
      </div>

      <!-- Details -->
      <div class="border-t border-(--color-border) pt-4 space-y-3">
        <div class="flex justify-between text-base">
          <span class="text-(--color-text-muted)">التاريخ</span>
          <span class="text-(--color-text) font-medium">{{ formatDate(selection.date!) }}</span>
        </div>
        <div class="flex justify-between text-base">
          <span class="text-(--color-text-muted)">الوقت</span>
          <span class="text-(--color-text) font-medium">{{ formatTime(selection.time!) }}</span>
        </div>
        <div v-if="selection.staff" class="flex justify-between text-base">
          <span class="text-(--color-text-muted)">الموظفة</span>
          <span class="text-(--color-text) font-medium">{{ selection.staff.name }}</span>
        </div>
        <div class="border-t border-(--color-border) pt-3 flex justify-between text-base">
          <span class="text-(--color-text-muted)">الاسم</span>
          <span class="text-(--color-text) font-medium">{{ selection.contact?.name }}</span>
        </div>
        <div class="flex justify-between text-base">
          <span class="text-(--color-text-muted)">الجوال</span>
          <span class="text-(--color-text) font-medium" dir="ltr">{{ selection.contact?.phone }}</span>
        </div>
      </div>
    </div>

    <!-- WhatsApp confirmation link -->
    <a
      v-if="tenant.phone"
      :href="whatsappUrl"
      target="_blank"
      rel="noopener"
      class="flex items-center justify-center gap-2 w-full py-4 rounded-[12px] border border-(--color-border) bg-(--color-surface) text-base text-(--color-text) hover:border-gray-300 hover:shadow-sm transition-all"
    >
      <span class="text-[#25D366] text-xl leading-none">●</span>
      شاركي التأكيد عبر واتساب
    </a>
  </div>

  <!-- Sticky payment CTA (stub) -->
  <div class="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-(--color-border) p-5">
    <div class="max-w-lg mx-auto space-y-2">
      <UButton block size="xl" color="neutral">
        <span class="text-lg">{{ ctaLabel }}</span>
      </UButton>
      <p
        v-if="settings.paymentMode !== 'at_salon'"
        class="text-sm text-center text-(--color-text-muted)"
      >
        ستُحوَّلين إلى صفحة الدفع الآمن
      </p>
    </div>
  </div>
</template>
