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
  nameEn: tenant?.value?.nameEn ?? '',
  phone: tenant?.value?.phone ?? '',
  description: tenant?.value?.description ?? '',
})
const localSettings = reactive({ ...settings.value })

const paymentModeOptions: Array<{ label: string; value: PaymentMode }> = [
  { label: t('admin.settings.paymentModes.full'),     value: 'full' },
  { label: t('admin.settings.paymentModes.deposit'),  value: 'deposit' },
  { label: t('admin.settings.paymentModes.at_salon'), value: 'at_salon' },
]

const toast = useToast()

// UInput v-model.number expects number | undefined; settings use number | null.
const depositPercentModel = computed({
  get: () => localSettings.depositPercent ?? undefined,
  set: (v: number | undefined) => { localSettings.depositPercent = v ?? null },
})

function handleSave(): void {
  updateTenant({
    ...localTenant,
    nameEn: localTenant.nameEn || null,
    phone: localTenant.phone || null,
    description: localTenant.description || null,
  })
  updateSettings({ ...localSettings })
  toast.add({
    title: t('admin.settings.saved'),
    color: 'success',
    icon: 'i-heroicons-check-circle',
  })
}
</script>

<template>
  <UDashboardPanel id="settings">
    <template #header>
      <UDashboardNavbar :title="$t('admin.settings.title')" />
    </template>

    <template #body>
      <form class="space-y-6 max-w-2xl p-4" @submit.prevent="handleSave">

        <!-- ── Profile section ─────────────────────────────── -->
        <section class="bg-(--color-surface) rounded-[16px] border border-(--color-border) p-6">
          <h2 class="text-lg font-semibold text-(--color-text) mb-6">
            {{ $t('admin.settings.profile') }}
          </h2>
          <div class="space-y-5">

            <UFormField :label="$t('admin.settings.salonNameAr')">
              <UInput v-model="localTenant.name" class="w-full" required />
            </UFormField>

            <UFormField :label="$t('admin.settings.salonNameEn')">
              <UInput v-model="localTenant.nameEn" class="w-full" />
            </UFormField>

            <UFormField :label="$t('admin.settings.phone')">
              <PhoneInput v-model="localTenant.phone" class="w-full" />
            </UFormField>

            <UFormField :label="$t('admin.settings.description')">
              <UTextarea v-model="localTenant.description" class="w-full" :rows="3" />
            </UFormField>

            <UFormField :label="$t('admin.settings.brandColor')">
              <div class="flex items-center gap-3">
                <input
                  v-model="localTenant.brandColor"
                  type="color"
                  class="h-10 w-14 cursor-pointer rounded border border-gray-200"
                >
                <UInput v-model="localTenant.brandColor" class="w-32 font-mono" />
              </div>
            </UFormField>

          </div>
        </section>

        <!-- ── Booking rules section ───────────────────────── -->
        <section class="bg-(--color-surface) rounded-[16px] border border-(--color-border) p-6">
          <h2 class="text-lg font-semibold text-(--color-text) mb-6">
            {{ $t('admin.settings.bookingRules') }}
          </h2>
          <div class="space-y-5">

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
                v-model.number="depositPercentModel"
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
        <div class="flex items-center pt-2">
          <UButton type="submit" color="primary">
            {{ $t('common.save') }}
          </UButton>
        </div>

      </form>
    </template>
  </UDashboardPanel>
</template>
