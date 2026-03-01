// nuxt.config.ts
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: [
    '@nuxt/ui',
    '@nuxtjs/supabase',
    '@nuxtjs/i18n',
    '@pinia/nuxt',
    '@nuxt/eslint',
  ],

  css: ['~/assets/css/main.css'],

  colorMode: {
    preference: 'system',   // follow OS — no toggle needed
    fallback: 'light',      // when OS preference is unknown
    classSuffix: '',        // apply class="dark" not class="dark-mode"
  },

  imports: {
    dirs: ['composables/**'],
  },

  i18n: {
    locales: [
      { code: 'ar', language: 'ar-SA', dir: 'rtl', name: 'العربية', file: 'ar.json' },
      { code: 'en', language: 'en-US', dir: 'ltr', name: 'English', file: 'en.json' },
    ],
    defaultLocale: 'ar',
    strategy: 'no_prefix',
  },

  supabase: {
    redirectOptions: {
      login: '/login',
      callback: '/confirm',
      exclude: ['/', '/*', '/*/**'],
    },
  },
})
