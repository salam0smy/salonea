<!-- app/pages/admin/settings.vue -->
<script setup lang="ts">
import type { PaymentMode } from '~/types'

definePageMeta({ layout: 'admin', middleware: 'auth' })

const { t } = useI18n()
const { tenant, settings, updateTenant, updateSettings } = useSettings()

// Local draft copies — bound to the form; committed on save.
// null → '' conversion keeps UInput happy (expects string | undefined, not null).
const localTenant = reactive({
  ...tenant.value,
  nameEn: tenant.value.nameEn ?? '',
  phone: tenant.value.phone ?? '',
})
const localSettings = reactive({ ...settings.value })

const paymentModeOptions: Array<{ label: string; value: PaymentMode }> = [
  { label: t('admin.settings.paymentModes.full'),     value: 'full' },
  { label: t('admin.settings.paymentModes.deposit'),  value: 'deposit' },
  { label: t('admin.settings.paymentModes.at_salon'), value: 'at_salon' },
]

const saved = ref(false)

function handleSave(): void {
  // '' → null: restore the nullable fields before committing to state
  updateTenant({ ...localTenant, nameEn: localTenant.nameEn || null, phone: localTenant.phone || null })
  updateSettings({ ...localSettings })
  saved.value = true
  setTimeout(() => { saved.value = false }, 2000)
}
</script>

<template>
  <div class="p-6 max-w-lg mx-auto">
    <!-- Page header -->
    <div class="mb-8">
      <h1 class="text-2xl font-semibold text-gray-900">
        {{ $t('admin.settings') }}
      </h1>
    </div>

    <form class="space-y-8" @submit.prevent="handleSave">

      <!-- ── Profile section ─────────────────────────────── -->
      <section>
        <h2 class="text-base font-semibold text-gray-700 mb-4">
          {{ $t('admin.settings.profile') }}
        </h2>
        <div class="space-y-4">

          <UFormField :label="$t('admin.settings.salonNameAr')">
            <UInput v-model="localTenant.name" class="w-full" required />
          </UFormField>

          <UFormField :label="$t('admin.settings.salonNameEn')">
            <UInput v-model="localTenant.nameEn" class="w-full" />
          </UFormField>

          <UFormField :label="$t('admin.settings.phone')">
            <UInput
              v-model="localTenant.phone"
              type="tel"
              placeholder="+966501234567"
              class="w-full"
            />
          </UFormField>

          <UFormField :label="$t('admin.settings.brandColor')">
            <div class="flex items-center gap-3">
              <input
                v-model="localTenant.brandColor"
                type="color"
                class="h-10 w-14 cursor-pointer rounded border border-gray-200"
              />
              <UInput v-model="localTenant.brandColor" class="w-32 font-mono" />
            </div>
          </UFormField>

        </div>
      </section>

      <!-- ── Booking rules section ───────────────────────── -->
      <section>
        <h2 class="text-base font-semibold text-gray-700 mb-4">
          {{ $t('admin.settings.bookingRules') }}
        </h2>
        <div class="space-y-4">

          <UFormField :label="$t('admin.settings.paymentMode')">
            <USelect
              v-model="localSettings.paymentMode"
              :items="paymentModeOptions"
              value-key="value"
              class="w-full"
            />
          </UFormField>

          <UFormField
            v-if="localSettings.paymentMode === 'deposit'"
            :label="$t('admin.settings.depositPercent')"
          >
            <UInput
              v-model.number="localSettings.depositPercent"
              type="number"
              :min="1"
              :max="99"
              class="w-full"
            />
          </UFormField>

          <UFormField :label="$t('admin.settings.maxAdvanceDays')">
            <UInput
              v-model.number="localSettings.maxAdvanceDays"
              type="number"
              :min="1"
              :max="365"
              class="w-full"
            />
          </UFormField>

        </div>
      </section>

      <!-- ── Save row ────────────────────────────────────── -->
      <div class="flex items-center gap-4 pt-2">
        <UButton type="submit" color="primary">
          {{ $t('common.save') }}
        </UButton>
        <Transition
          enter-active-class="transition-opacity duration-200"
          leave-active-class="transition-opacity duration-500"
          enter-from-class="opacity-0"
          leave-to-class="opacity-0"
        >
          <span v-if="saved" class="text-sm text-green-600">
            {{ $t('admin.settings.saved') }}
          </span>
        </Transition>
      </div>

    </form>
  </div>
</template>
