<!-- app/components/booking/BookingContactForm.vue -->
<script setup lang="ts">
import type { BookingContact } from '~/types'

const { t } = useI18n()

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
  <div class="pt-5 space-y-8">
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

    <div>
      <h2 class="text-2xl font-semibold text-(--color-text)">{{ t('booking.yourDetails') }}</h2>
      <p class="text-base text-(--color-text-muted) mt-2">{{ t('booking.noAccountNeeded') }}</p>
    </div>

    <div class="space-y-5">
      <UFormField :label="t('booking.name')">
        <UInput
          v-model="name"
          :placeholder="t('booking.namePlaceholder')"
          size="xl"
          class="w-full"
        />
      </UFormField>

      <UFormField :label="t('booking.phone')" :hint="t('booking.phoneHint')">
        <UInput
          v-model="phone"
          :placeholder="t('auth.phonePlaceholder')"
          type="tel"
          size="xl"
          class="w-full"
          dir="ltr"
        />
      </UFormField>
    </div>
  </div>

  <!-- Sticky CTA -->
  <div class="fixed bottom-0 inset-x-0 bg-(--color-surface)/95 backdrop-blur-md border-t border-(--color-border) p-5">
    <div class="max-w-lg mx-auto">
      <UButton
        block
        size="xl"
        :disabled="!isValid"
        color="neutral"
        @click="handleNext"
      >
        <span class="text-lg">{{ t('booking.continue') }}</span>
      </UButton>
    </div>
  </div>
</template>
