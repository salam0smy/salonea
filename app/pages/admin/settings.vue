<!-- app/pages/admin/settings.vue -->
<script setup lang="ts">
import type { PaymentMode, WorkingHoursDay } from '~/types'

definePageMeta({ layout: 'admin', middleware: 'auth' })

const { t } = useI18n()
const { tenant, settings, updateTenant, updateSettings } = useSettings()
const { workingHours, save: saveWorkingHours } = useWorkingHours()

const defaultWorkingHours = (): WorkingHoursDay[] =>
  Array.from({ length: 7 }, (_, i) => ({
    dayOfWeek: i,
    startTime: '09:00',
    endTime: '21:00',
    isWorking: true,
  }))

const localWorkingHours = ref<WorkingHoursDay[]>(defaultWorkingHours())
watch(
  workingHours,
  (hours) => {
    if (hours?.length === 7) localWorkingHours.value = [...hours]
  },
  { immediate: true },
)

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

const { paymentSettings, connecting, connectError, connect, disconnect } = usePaymentSettings()

const localPayment = reactive({ publishableKey: '', secretKey: '' })
const showDisconnectModal = ref(false)

function maskKey(key: string | null): string {
  if (!key || key.length < 14) return key ?? ''
  return key.slice(0, 10) + '●●●●' + key.slice(-4)
}

async function handleConnect(): Promise<void> {
  await connect(localPayment.publishableKey, localPayment.secretKey)
  localPayment.publishableKey = ''
  localPayment.secretKey = ''
}

async function handleDisconnect(): Promise<void> {
  await disconnect()
  showDisconnectModal.value = false
  toast.add({ title: t('admin.settings.moyasarDisconnect'), color: 'success', icon: 'i-heroicons-check-circle' })
}

// UInput v-model.number expects number | undefined; settings use number | null.
const depositPercentModel = computed({
  get: () => localSettings.depositPercent ?? undefined,
  set: (v: number | undefined) => { localSettings.depositPercent = v ?? null },
})

async function handleSave(): Promise<void> {
  updateTenant({
    ...localTenant,
    nameEn: localTenant.nameEn || null,
    phone: localTenant.phone || null,
    description: localTenant.description || null,
  })
  updateSettings({ ...localSettings })
  await saveWorkingHours(localWorkingHours.value)
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

        <!-- ── Working hours section ───────────────────────── -->
        <section class="bg-(--color-surface) rounded-[16px] border border-(--color-border) p-6">
          <h2 class="text-lg font-semibold text-(--color-text) mb-2">
            {{ $t('admin.settings.workingHours') }}
          </h2>
          <p class="text-sm text-(--color-text-muted) mb-6">
            {{ $t('admin.settings.workingHoursDefault') }}
          </p>
          <AdminWorkingHoursEditor v-model="localWorkingHours" />
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

        <!-- ── Payment / Moyasar section ──────────────────── -->
        <section class="bg-(--color-surface) rounded-[16px] border border-(--color-border) p-6">
          <h2 class="text-lg font-semibold text-(--color-text) mb-6">
            {{ $t('admin.settings.payment') }}
          </h2>

          <!-- Connected state -->
          <div v-if="paymentSettings?.isConnected" class="space-y-4">
            <div class="flex items-center gap-3">
              <UBadge color="success" variant="subtle" leading-icon="i-heroicons-check-circle">
                {{ $t('admin.settings.moyasarConnected') }}
              </UBadge>
            </div>
            <p class="text-sm text-(--color-text-muted) font-mono">
              {{ maskKey(paymentSettings.publishableKey) }}
            </p>
            <UButton variant="ghost" color="error" size="sm" @click="showDisconnectModal = true">
              {{ $t('admin.settings.moyasarDisconnect') }}
            </UButton>
          </div>

          <!-- Disconnected state -->
          <div v-else class="space-y-5">
            <UAlert
              color="warning"
              variant="subtle"
              icon="i-heroicons-information-circle"
              :description="$t('admin.settings.moyasarInstructions')"
            />
            <UAlert
              v-if="connectError"
              color="error"
              variant="subtle"
              icon="i-heroicons-x-circle"
              :description="connectError"
            />
            <UFormField :label="$t('admin.settings.moyasarPublishableKey')" required>
              <UInput
                v-model="localPayment.publishableKey"
                class="w-full font-mono"
                placeholder="pk_test_..."
                :disabled="connecting"
              />
            </UFormField>
            <UFormField
              :label="$t('admin.settings.moyasarSecretKey')"
              :hint="$t('admin.settings.moyasarSecretKeyHint')"
              required
            >
              <UInput
                v-model="localPayment.secretKey"
                type="password"
                class="w-full font-mono"
                :disabled="connecting"
              />
            </UFormField>
            <UButton
              :loading="connecting"
              :disabled="!localPayment.publishableKey || !localPayment.secretKey"
              color="primary"
              @click="handleConnect"
            >
              {{ connecting ? $t('admin.settings.moyasarConnecting') : $t('admin.settings.moyasarConnect') }}
            </UButton>
          </div>
        </section>

        <!-- ── Save row ────────────────────────────────────── -->
        <div class="flex items-center pt-2">
          <UButton type="submit" color="primary">
            {{ $t('common.save') }}
          </UButton>
        </div>

      </form>

      <UModal v-model:open="showDisconnectModal">
        <template #body>
          <p class="text-(--color-text)">{{ $t('admin.settings.moyasarDisconnectConfirm') }}</p>
        </template>
        <template #footer>
          <div class="flex gap-3 justify-end">
            <UButton variant="ghost" color="neutral" @click="showDisconnectModal = false">
              {{ $t('common.cancel') }}
            </UButton>
            <UButton color="error" @click="handleDisconnect">
              {{ $t('admin.settings.moyasarDisconnect') }}
            </UButton>
          </div>
        </template>
      </UModal>
    </template>
  </UDashboardPanel>
</template>
