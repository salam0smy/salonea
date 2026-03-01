<!-- app/components/booking/BookingContactForm.vue -->
<script setup lang="ts">
import type { BookingContact } from '~/types'

const props = defineProps<{
  contact: BookingContact | null
}>()

const emit = defineEmits<{
  'update:contact': [v: BookingContact]
  'next': []
  'back': []
}>()

const name = ref(props.contact?.name ?? '')
const phone = ref(props.contact?.phone ?? '')

// Name: at least 2 chars. Phone: at least 9 digits (Saudi: 05xxxxxxxx)
const isValid = computed(() =>
  name.value.trim().length >= 2 && phone.value.replace(/\D/g, '').length >= 9
)

function handleNext() {
  if (!isValid.value) return
  emit('update:contact', { name: name.value.trim(), phone: phone.value.trim() })
  emit('next')
}
</script>

<template>
  <div class="pt-5 space-y-6">
    <!-- Back -->
    <button
      class="flex items-center gap-1 text-sm text-gray-500"
      @click="emit('back')"
    >
      <span class="inline-block rotate-180 rtl:rotate-0">←</span>
      رجوع
    </button>

    <div>
      <h2 class="text-xl font-semibold text-gray-900">بياناتك</h2>
      <p class="text-sm text-gray-400 mt-1">لا داعي لإنشاء حساب</p>
    </div>

    <div class="space-y-4">
      <div class="space-y-1.5">
        <label class="text-sm font-medium text-gray-700">الاسم</label>
        <UInput
          v-model="name"
          placeholder="اسمك الكريم"
          size="lg"
          class="w-full"
        />
      </div>

      <div class="space-y-1.5">
        <label class="text-sm font-medium text-gray-700">رقم الجوال</label>
        <UInput
          v-model="phone"
          placeholder="05xxxxxxxx"
          type="tel"
          size="lg"
          class="w-full"
          dir="ltr"
        />
        <p class="text-xs text-gray-400">سيُستخدم لتأكيد حجزك فقط</p>
      </div>
    </div>
  </div>

  <!-- Sticky CTA -->
  <div class="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-sm border-t border-gray-100 p-4">
    <div class="max-w-lg mx-auto">
      <UButton
        block
        size="xl"
        :disabled="!isValid"
        color="neutral"
        @click="handleNext"
      >
        متابعة
      </UButton>
    </div>
  </div>
</template>
