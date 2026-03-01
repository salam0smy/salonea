/**
 * Phone OTP auth for admin (salon owner). Uses Supabase phone provider.
 * Saudi numbers normalized to E.164: 05XXXXXXXX → +9665XXXXXXXX
 */
export function useAuth() {
  const supabase = useSupabaseClient()
  const user = useSupabaseUser()

  const isLoading = ref(false)
  const error = ref<string | null>(null)

  /** Normalize Saudi phone to E.164 (+966XXXXXXXXX). Accepts 05XX, 5XX, +966... */
  function normalizePhone(phone: string): string | null {
    const digits = phone.replace(/\D/g, '')
    if (digits.length === 9 && digits.startsWith('5')) {
      return `+966${digits}`
    }
    if (digits.length === 10 && digits.startsWith('05')) {
      return `+966${digits.slice(1)}`
    }
    if (digits.length === 12 && digits.startsWith('966')) {
      return `+${digits}`
    }
    return null
  }

  async function sendOtp(phone: string): Promise<{ ok: boolean }> {
    error.value = null
    isLoading.value = true
    try {
      const e164 = normalizePhone(phone)
      if (!e164) {
        error.value = 'invalid_phone'
        return { ok: false }
      }
      const { error: err } = await supabase.auth.signInWithOtp({ phone: e164 })
      if (err) {
        error.value = err.message
        return { ok: false }
      }
      return { ok: true }
    } finally {
      isLoading.value = false
    }
  }

  async function verifyOtp(phone: string, token: string): Promise<{ ok: boolean }> {
    error.value = null
    isLoading.value = true
    try {
      const e164 = normalizePhone(phone)
      if (!e164) {
        error.value = 'invalid_phone'
        return { ok: false }
      }
      const { data, error: err } = await supabase.auth.verifyOtp({
        phone: e164,
        token,
        type: 'sms',
      })
      if (err) {
        error.value = 'invalid_otp'
        return { ok: false }
      }
      if (data.session) {
        await navigateTo('/admin')
      }
      return { ok: true }
    } finally {
      isLoading.value = false
    }
  }

  async function signOut() {
    error.value = null
    await supabase.auth.signOut()
    await navigateTo('/login')
  }

  function clearError() {
    error.value = null
  }

  return {
    user,
    isLoading: readonly(isLoading),
    error: readonly(error),
    sendOtp,
    verifyOtp,
    signOut,
    clearError,
    normalizePhone,
  }
}
