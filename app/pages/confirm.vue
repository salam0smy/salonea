<!-- app/pages/confirm.vue — Supabase callback redirect (e.g. OAuth). Phone OTP does not use this; kept to avoid 404. -->
<script setup lang="ts">
definePageMeta({ layout: false })

const user = useSupabaseUser()

onMounted(() => {
  if (user.value) {
    navigateTo('/admin')
  } else {
    navigateTo('/login')
  }
})

watch(user, (u) => {
  if (u) navigateTo('/admin')
  else navigateTo('/login')
}, { immediate: true })
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-(--color-surface)">
    <p class="text-(--color-text-muted)">{{ $t('common.loading') }}</p>
  </div>
</template>
