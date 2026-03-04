<!-- app/pages/login.vue -->
<script setup lang="ts">
definePageMeta({ layout: false })

const config = useRuntimeConfig()
const authMode = config.public.authMode as string
const user = useSupabaseUser()
const { sendOtp, verifyOtp, signInWithEmail, isLoading, error, clearError, normalizePhone } = useAuth()
const { t } = useI18n()

useHead({ title: () => t('auth.title') })

const step = ref<1 | 2>(1)
const email = ref('')
const password = ref('')
const phone = ref('')
const otp = ref<string[]>([])
const resendCooldown = ref(0)
let cooldownTimer: ReturnType<typeof setInterval> | null = null

// Already logged in → go to admin
onMounted(() => {
  if (user.value) {
    navigateTo('/admin')
  }
})

watch(user, (u) => {
  if (u) navigateTo('/admin')
}, { immediate: true })

function startResendCooldown() {
  resendCooldown.value = 60
  if (cooldownTimer) clearInterval(cooldownTimer)
  cooldownTimer = setInterval(() => {
    resendCooldown.value -= 1
    if (resendCooldown.value <= 0 && cooldownTimer) {
      clearInterval(cooldownTimer)
      cooldownTimer = null
    }
  }, 1000)
}

async function onSendOtp() {
  const { ok } = await sendOtp(phone.value)
  if (ok) {
    step.value = 2
    otp.value = []
    startResendCooldown()
  }
}

async function onVerifyOtp() {
  await verifyOtp(phone.value, otp.value.join(''))
}

async function onResend() {
  if (resendCooldown.value > 0) return
  const { ok } = await sendOtp(phone.value)
  if (ok) startResendCooldown()
}

function backToPhone() {
  step.value = 1
  otp.value = []
  clearError()
}

async function onSignInEmail() {
  await signInWithEmail(email.value, password.value)
}

onUnmounted(() => {
  if (cooldownTimer) clearInterval(cooldownTimer)
})

const errorMessage = computed(() => {
  if (!error.value) return null
  if (error.value === 'invalid_phone') return t('auth.invalidPhone')
  if (error.value === 'invalid_otp') return t('auth.invalidOtp')
  if (error.value === 'invalid_credentials') return t('auth.invalidCredentials')
  return error.value
})
</script>

<template>
  <div class="min-h-screen flex items-center justify-center p-4 bg-(--color-bg)">
    <UCard
      class="w-full max-w-sm bg-(--color-surface)! border border-(--color-border)"
    >
      <template #header>
        <h1 class="text-lg font-semibold text-(--color-text)">
          {{ $t('auth.title') }}
        </h1>
        <p class="text-sm text-(--color-text-muted) mt-1">
          {{ authMode === 'email' ? $t('auth.subtitleEmail') : $t('auth.subtitle') }}
        </p>
      </template>

      <!-- Email / password form -->
      <form
        v-if="authMode === 'email'"
        class="space-y-4"
        @submit.prevent="onSignInEmail"
      >
        <UFormField :label="$t('auth.emailLabel')">
          <UInput
            v-model="email"
            type="email"
            :placeholder="$t('auth.emailPlaceholder')"
            size="lg"
            autocomplete="email"
            :disabled="isLoading"
          />
        </UFormField>
        <UFormField :label="$t('auth.passwordLabel')">
          <UInput
            v-model="password"
            type="password"
            :placeholder="$t('auth.passwordPlaceholder')"
            size="lg"
            autocomplete="current-password"
            :disabled="isLoading"
          />
        </UFormField>
        <UAlert
          v-if="errorMessage"
          color="error"
          :title="errorMessage"
          class="text-sm"
        />
        <UButton
          type="submit"
          block
          size="lg"
          :loading="isLoading"
          :label="$t('auth.signIn')"
        />
      </form>

      <!-- Step 1: Phone -->
      <form
        v-else-if="step === 1"
        class="space-y-4"
        @submit.prevent="onSendOtp"
      >
        <UFormField :label="$t('auth.phoneLabel')">
          <PhoneInput
            v-model="phone"
            size="lg"
            autocomplete="tel"
            :disabled="isLoading"
            class="w-full"
          />
        </UFormField>
        <UAlert
          v-if="errorMessage"
          color="error"
          :title="errorMessage"
          class="text-sm"
        />
        <UButton
          type="submit"
          block
          size="lg"
          :loading="isLoading"
          :label="$t('auth.sendOtp')"
        />
      </form>

      <!-- Step 2: OTP -->
      <form
        v-else-if="step === 2"
        class="space-y-4"
        @submit.prevent="onVerifyOtp"
      >
        <p class="text-sm text-(--color-text-muted)">
          {{ $t('auth.otpLabel') }} → {{ normalizePhone(phone) ?? phone }}
        </p>
        <UPinInput
          v-model="otp"
          :length="6"
          otp
          size="lg"
          :disabled="isLoading"
          class="justify-center"
        />
        <UAlert
          v-if="errorMessage"
          color="error"
          :title="errorMessage"
          class="text-sm"
        />
        <UButton
          type="submit"
          block
          size="lg"
          :loading="isLoading"
          :disabled="otp.filter(Boolean).length !== 6"
          :label="$t('auth.verifyOtp')"
        />
        <div class="flex items-center justify-between">
          <UButton
            type="button"
            variant="link"
            color="primary"
            size="sm"
            @click="backToPhone"
          >
            {{ $t('auth.changePhone') }}
          </UButton>
          <UButton
            type="button"
            variant="link"
            color="neutral"
            size="sm"
            :disabled="resendCooldown > 0"
            @click="onResend"
          >
            {{ resendCooldown > 0 ? $t('auth.resendIn', { seconds: resendCooldown }) : $t('auth.resendOtp') }}
          </UButton>
        </div>
      </form>
    </UCard>
  </div>
</template>
