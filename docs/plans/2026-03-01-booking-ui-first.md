# Booking Page UI (UI-First) Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build the complete customer-facing booking page UI with TypeScript types and realistic mock data — zero real API calls, zero Supabase queries.

**Architecture:** Domain types in `app/types/index.ts` define all entities (these become the DB schema later). Mock fixtures in `app/data/mock.ts` feed components. A `useBookingFlow` composable owns step state and selections. The booking page at `app/pages/[salon].vue` renders one of four steps. Components are in `app/components/booking/`.

**Tech Stack:** Nuxt 4, Nuxt UI v3 (Tailwind v4), @nuxtjs/i18n (Arabic default, RTL), TypeScript, Vitest

---

## Task 1: Domain types

**Files:**
- Create: `app/types/index.ts`

These TypeScript interfaces are the schema — same shape the DB tables will have later. Define them carefully; everything is built on top.

**Step 1: Create the types file**

```ts
// app/types/index.ts

export interface Tenant {
  id: string
  slug: string
  name: string         // Arabic (primary display)
  nameEn: string | null
  description: string | null
  logoUrl: string | null
  brandColor: string   // hex, e.g. "#C9A87C"
  phone: string | null // Saudi format, e.g. "+966501234567"
}

export interface ServiceCategory {
  id: string
  tenantId: string
  name: string         // Arabic
  nameEn: string | null
  sortOrder: number
}

export interface Service {
  id: string
  tenantId: string
  categoryId: string
  name: string         // Arabic
  nameEn: string | null
  description: string | null
  price: number        // SAR, integer (e.g. 150 = 150 ر.س)
  durationMinutes: number
  isActive: boolean
}

export interface StaffMember {
  id: string
  tenantId: string
  name: string         // Arabic
  nameEn: string | null
  photoUrl: string | null
  serviceIds: string[] // services this staff member can perform
}

export interface TimeSlot {
  time: string         // "09:00" 24h
  available: boolean
}

export interface BookingContact {
  name: string
  phone: string
}

export type PaymentMode = 'full' | 'deposit' | 'at_salon'

export interface TenantSettings {
  paymentMode: PaymentMode
  depositPercent: number | null  // e.g. 30 means 30%
  maxAdvanceDays: number         // how far ahead customers can book
}

export interface BookingSelection {
  service: Service | null
  staff: StaffMember | null      // null = no preference
  date: string | null            // "2026-03-15" ISO date
  time: string | null            // "10:00" 24h
  contact: BookingContact | null
}
```

**Step 2: Verify TypeScript is happy**

```bash
npm run dev
```

Expected: No type errors on startup.

**Step 3: Commit**

```bash
git add app/types/index.ts
git commit -m "feat: add domain types for tenant, service, staff, and booking"
```

---

## Task 2: Mock fixtures

**Files:**
- Create: `app/data/mock.ts`

Realistic Arabic salon data. This is what all UI components render during development. Name the salon and services like a real Saudi salon.

**Step 1: Create mock data**

```ts
// app/data/mock.ts
import type { Tenant, ServiceCategory, Service, StaffMember, TenantSettings } from '~/app/types'

export const mockTenant: Tenant = {
  id: 't1',
  slug: 'nour-beauty',
  name: 'صالون نور للتجميل',
  nameEn: 'Nour Beauty Salon',
  description: 'صالون نسائي متخصص في العناية بالشعر والأظافر والبشرة في الرياض',
  logoUrl: null,
  brandColor: '#C9A87C',
  phone: '+966501234567',
}

export const mockSettings: TenantSettings = {
  paymentMode: 'full',
  depositPercent: null,
  maxAdvanceDays: 30,
}

export const mockCategories: ServiceCategory[] = [
  { id: 'cat-hair',   tenantId: 't1', name: 'الشعر',    nameEn: 'Hair',    sortOrder: 1 },
  { id: 'cat-nails',  tenantId: 't1', name: 'الأظافر',  nameEn: 'Nails',   sortOrder: 2 },
  { id: 'cat-skin',   tenantId: 't1', name: 'البشرة',   nameEn: 'Skin',    sortOrder: 3 },
  { id: 'cat-makeup', tenantId: 't1', name: 'المكياج',  nameEn: 'Makeup',  sortOrder: 4 },
]

export const mockServices: Service[] = [
  // Hair
  { id: 's1',  tenantId: 't1', categoryId: 'cat-hair',   name: 'قص وتصفيف الشعر',   nameEn: 'Haircut & Style',      description: null, price: 150, durationMinutes: 60,  isActive: true },
  { id: 's2',  tenantId: 't1', categoryId: 'cat-hair',   name: 'صبغة شعر كاملة',    nameEn: 'Full Hair Color',       description: null, price: 350, durationMinutes: 120, isActive: true },
  { id: 's3',  tenantId: 't1', categoryId: 'cat-hair',   name: 'كيراتين',            nameEn: 'Keratin Treatment',     description: null, price: 500, durationMinutes: 180, isActive: true },
  { id: 's4',  tenantId: 't1', categoryId: 'cat-hair',   name: 'بروتين للشعر',       nameEn: 'Protein Treatment',     description: null, price: 280, durationMinutes: 90,  isActive: true },
  // Nails
  { id: 's5',  tenantId: 't1', categoryId: 'cat-nails',  name: 'مناكير جل',          nameEn: 'Gel Manicure',          description: null, price: 120, durationMinutes: 45,  isActive: true },
  { id: 's6',  tenantId: 't1', categoryId: 'cat-nails',  name: 'باديكير',            nameEn: 'Pedicure',              description: null, price: 100, durationMinutes: 45,  isActive: true },
  { id: 's7',  tenantId: 't1', categoryId: 'cat-nails',  name: 'تطويل أظافر',        nameEn: 'Nail Extensions',       description: null, price: 200, durationMinutes: 90,  isActive: true },
  // Skin
  { id: 's8',  tenantId: 't1', categoryId: 'cat-skin',   name: 'تنظيف بشرة عميق',   nameEn: 'Deep Cleansing Facial', description: null, price: 250, durationMinutes: 60,  isActive: true },
  { id: 's9',  tenantId: 't1', categoryId: 'cat-skin',   name: 'إزالة شعر بالشمع',  nameEn: 'Full Waxing',           description: null, price: 180, durationMinutes: 60,  isActive: true },
  // Makeup
  { id: 's10', tenantId: 't1', categoryId: 'cat-makeup', name: 'مكياج سهرة',         nameEn: 'Evening Makeup',        description: null, price: 300, durationMinutes: 75,  isActive: true },
  { id: 's11', tenantId: 't1', categoryId: 'cat-makeup', name: 'مكياج عرائس',        nameEn: 'Bridal Makeup',         description: null, price: 800, durationMinutes: 120, isActive: true },
]

export const mockStaff: StaffMember[] = [
  {
    id: 'st1', tenantId: 't1',
    name: 'سارة العمري', nameEn: 'Sara Al-Omari', photoUrl: null,
    serviceIds: ['s1', 's2', 's3', 's4'],
  },
  {
    id: 'st2', tenantId: 't1',
    name: 'نورة الزهراني', nameEn: 'Noura Al-Zahrani', photoUrl: null,
    serviceIds: ['s5', 's6', 's7'],
  },
  {
    id: 'st3', tenantId: 't1',
    name: 'ريم الشمري', nameEn: 'Reem Al-Shammari', photoUrl: null,
    serviceIds: ['s8', 's9', 's10', 's11'],
  },
]

// Returns deterministically varied time slots for any date.
// "Deterministic" means the same date always returns the same slots,
// but different dates feel different — avoids every day being fully open.
export function mockAvailableSlots(date: string): string[] {
  const allSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
    '16:00', '16:30', '17:00', '17:30',
  ]
  const day = new Date(date).getDate()
  return allSlots.filter((_, i) => (i + day) % 3 !== 0)
}
```

**Step 2: Commit**

```bash
git add app/data/mock.ts
git commit -m "feat: add mock fixtures with realistic Arabic salon data"
```

---

## Task 3: Booking flow composable

**Files:**
- Create: `app/composables/booking/useBookingFlow.ts`
- Create: `tests/app/composables/booking/useBookingFlow.test.ts`

This composable is the single source of truth for the booking flow: which step we're on, what's been selected, and whether we can advance. Keeping it in a composable makes it testable without rendering anything.

**Step 1: Write the failing tests first**

```ts
// tests/app/composables/booking/useBookingFlow.test.ts
import { describe, it, expect } from 'vitest'
import { useBookingFlow } from '~/app/composables/booking/useBookingFlow'

const minimalService = {
  id: 's1', tenantId: 't1', categoryId: 'cat-hair',
  name: 'قص', nameEn: null, description: null,
  price: 150, durationMinutes: 60, isActive: true,
}

describe('useBookingFlow', () => {
  it('starts on step 1', () => {
    const { step } = useBookingFlow()
    expect(step.value).toBe(1)
  })

  it('cannot advance from step 1 without a service selected', () => {
    const { step, advance } = useBookingFlow()
    advance()
    expect(step.value).toBe(1)
  })

  it('advances to step 2 when a service is selected', () => {
    const { step, selection, advance } = useBookingFlow()
    selection.value.service = minimalService
    advance()
    expect(step.value).toBe(2)
  })

  it('goes back from step 2 to step 1', () => {
    const { step, selection, advance, back } = useBookingFlow()
    selection.value.service = minimalService
    advance()
    back()
    expect(step.value).toBe(1)
  })

  it('cannot advance from step 2 without date and time', () => {
    const { step, selection, advance } = useBookingFlow()
    selection.value.service = minimalService
    advance() // → step 2
    advance() // should stay at 2
    expect(step.value).toBe(2)
  })

  it('advances to step 3 when date and time are selected', () => {
    const { step, selection, advance } = useBookingFlow()
    selection.value.service = minimalService
    advance()
    selection.value.date = '2026-03-15'
    selection.value.time = '10:00'
    advance()
    expect(step.value).toBe(3)
  })

  it('cannot advance from step 3 without contact info', () => {
    const { step, selection, advance } = useBookingFlow()
    selection.value.service = minimalService
    advance()
    selection.value.date = '2026-03-15'
    selection.value.time = '10:00'
    advance()
    advance() // should stay at 3
    expect(step.value).toBe(3)
  })
})
```

**Step 2: Run test — verify it fails**

```bash
npm test tests/app/composables/booking/useBookingFlow.test.ts
```

Expected: FAIL — `useBookingFlow` not found.

**Step 3: Implement the composable**

```ts
// app/composables/booking/useBookingFlow.ts
import type { BookingSelection } from '~/app/types'

export type BookingStep = 1 | 2 | 3 | 4

export function useBookingFlow() {
  const step = ref<BookingStep>(1)

  const selection = ref<BookingSelection>({
    service: null,
    staff: null,
    date: null,
    time: null,
    contact: null,
  })

  function canAdvance(): boolean {
    if (step.value === 1) return selection.value.service !== null
    if (step.value === 2) return selection.value.date !== null && selection.value.time !== null
    if (step.value === 3) return selection.value.contact !== null
    return false
  }

  function advance() {
    if (canAdvance() && step.value < 4) {
      step.value = (step.value + 1) as BookingStep
    }
  }

  function back() {
    if (step.value > 1) {
      step.value = (step.value - 1) as BookingStep
    }
  }

  return { step, selection, advance, back, canAdvance }
}
```

**Step 4: Run tests — verify they pass**

```bash
npm test tests/app/composables/booking/useBookingFlow.test.ts
```

Expected: 7 passed.

**Step 5: Commit**

```bash
git add app/composables/booking/useBookingFlow.ts tests/app/composables/booking/useBookingFlow.test.ts
git commit -m "feat: add useBookingFlow composable with step validation and navigation"
```

---

## Task 4: Booking page scaffold + header

**Files:**
- Create: `app/pages/[salon].vue`
- Create: `app/components/booking/BookingHeader.vue`

`[salon]` is the dynamic route — the tenant slug from the URL (e.g. `/nour-beauty`). The page wires the composable to the four step components. The header shows the salon's brand.

**Step 1: Create BookingHeader**

```vue
<!-- app/components/booking/BookingHeader.vue -->
<script setup lang="ts">
import type { Tenant } from '~/app/types'
defineProps<{ tenant: Tenant }>()
</script>

<template>
  <header class="bg-white border-b border-gray-100 px-4 py-4 sticky top-0 z-10">
    <div class="max-w-lg mx-auto flex items-center gap-3">
      <!-- Logo: shows image if available, falls back to colored initial -->
      <div
        v-if="tenant.logoUrl"
        class="w-10 h-10 rounded-xl overflow-hidden shrink-0"
      >
        <img :src="tenant.logoUrl" :alt="tenant.name" class="w-full h-full object-cover" />
      </div>
      <div
        v-else
        class="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold shrink-0"
        :style="{ backgroundColor: tenant.brandColor }"
      >
        {{ tenant.name.charAt(0) }}
      </div>

      <div class="flex-1 min-w-0">
        <h1 class="font-semibold text-gray-900 text-base leading-tight">{{ tenant.name }}</h1>
        <p v-if="tenant.description" class="text-xs text-gray-400 truncate mt-0.5">
          {{ tenant.description }}
        </p>
      </div>
    </div>
  </header>
</template>
```

**Step 2: Create the booking page**

```vue
<!-- app/pages/[salon].vue -->
<script setup lang="ts">
import { mockTenant, mockSettings, mockCategories, mockServices, mockStaff } from '~/app/data/mock'

definePageMeta({ layout: 'default' })

const { step, selection, advance, back } = useBookingFlow()
</script>

<template>
  <div class="min-h-screen bg-[#FAFAF7]">
    <BookingHeader :tenant="mockTenant" />

    <div class="max-w-lg mx-auto px-4 pb-36">
      <!-- Step 1: Service selection -->
      <BookingServiceList
        v-if="step === 1"
        :categories="mockCategories"
        :services="mockServices"
        :staff="mockStaff"
        v-model:selected-service="selection.service"
        v-model:selected-staff="selection.staff"
        @next="advance"
      />

      <!-- Step 2: Date/time picker -->
      <BookingDatePicker
        v-else-if="step === 2"
        :service="selection.service!"
        :staff="selection.staff"
        v-model:selected-date="selection.date"
        v-model:selected-time="selection.time"
        @next="advance"
        @back="back"
      />

      <!-- Step 3: Contact info -->
      <BookingContactForm
        v-else-if="step === 3"
        v-model:contact="selection.contact"
        @next="advance"
        @back="back"
      />

      <!-- Step 4: Confirmation -->
      <BookingConfirmation
        v-else-if="step === 4"
        :selection="selection"
        :tenant="mockTenant"
        :settings="mockSettings"
        @back="back"
      />
    </div>
  </div>
</template>
```

**Step 3: Verify in browser**

```bash
npm run dev
```

Navigate to `http://localhost:3000/nour-beauty`. Expected: Header with "صالون نور للتجميل" and a gold initial. Step 1 component will error (not yet built) — that's expected.

**Step 4: Commit**

```bash
git add "app/pages/[salon].vue" app/components/booking/BookingHeader.vue
git commit -m "feat: add booking page scaffold and salon header component"
```

---

## Task 5: Step 1 — Service selection

**Files:**
- Create: `app/components/booking/BookingServiceCard.vue`
- Create: `app/components/booking/BookingServiceList.vue`

Design: horizontal scrollable category pills → service card list → optional staff selector (appears after service picked). Sticky bottom CTA shows selected price.

**Step 1: Create BookingServiceCard**

```vue
<!-- app/components/booking/BookingServiceCard.vue -->
<script setup lang="ts">
import type { Service } from '~/app/types'

const props = defineProps<{
  service: Service
  selected: boolean
}>()

const emit = defineEmits<{
  select: [service: Service]
}>()

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} دقيقة`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (m === 0) return h === 1 ? 'ساعة' : `${h} ساعات`
  return `${h} ساعة و${m} دقيقة`
}
</script>

<template>
  <button
    class="w-full text-start p-4 rounded-2xl border transition-all duration-150"
    :class="selected
      ? 'border-gray-800 bg-white shadow-sm'
      : 'border-gray-100 bg-white hover:border-gray-200'"
    @click="emit('select', service)"
  >
    <div class="flex items-center justify-between gap-3">
      <div class="flex-1 min-w-0">
        <p class="font-medium text-gray-900 text-base">{{ service.name }}</p>
        <p class="text-sm text-gray-400 mt-0.5">{{ formatDuration(service.durationMinutes) }}</p>
      </div>
      <div class="shrink-0 text-end">
        <span class="font-semibold text-gray-900">{{ service.price }}</span>
        <span class="text-xs text-gray-400 me-0.5"> ر.س</span>
      </div>
    </div>
  </button>
</template>
```

**Step 2: Create BookingServiceList**

```vue
<!-- app/components/booking/BookingServiceList.vue -->
<script setup lang="ts">
import type { Service, ServiceCategory, StaffMember } from '~/app/types'

const props = defineProps<{
  categories: ServiceCategory[]
  services: Service[]
  staff: StaffMember[]
  selectedService: Service | null
  selectedStaff: StaffMember | null
}>()

const emit = defineEmits<{
  'update:selectedService': [v: Service | null]
  'update:selectedStaff': [v: StaffMember | null]
  'next': []
}>()

const activeCategory = ref<string | null>(null)

const filteredServices = computed(() => {
  const active = props.services.filter(s => s.isActive)
  if (!activeCategory.value) return active
  return active.filter(s => s.categoryId === activeCategory.value)
})

// Only staff who can perform the selected service
const eligibleStaff = computed(() => {
  if (!props.selectedService) return []
  return props.staff.filter(st => st.serviceIds.includes(props.selectedService!.id))
})

function selectService(service: Service) {
  emit('update:selectedService', service)
  emit('update:selectedStaff', null) // reset staff when service changes
}
</script>

<template>
  <div class="pt-5 space-y-5">
    <h2 class="text-xl font-semibold text-gray-900">اختاري الخدمة</h2>

    <!-- Category filter pills -->
    <div class="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-hide">
      <button
        class="shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors"
        :class="activeCategory === null
          ? 'bg-gray-900 text-white'
          : 'bg-white border border-gray-200 text-gray-600'"
        @click="activeCategory = null"
      >
        الكل
      </button>
      <button
        v-for="cat in categories"
        :key="cat.id"
        class="shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors"
        :class="activeCategory === cat.id
          ? 'bg-gray-900 text-white'
          : 'bg-white border border-gray-200 text-gray-600'"
        @click="activeCategory = cat.id"
      >
        {{ cat.name }}
      </button>
    </div>

    <!-- Service cards -->
    <div class="space-y-2">
      <BookingServiceCard
        v-for="service in filteredServices"
        :key="service.id"
        :service="service"
        :selected="selectedService?.id === service.id"
        @select="selectService"
      />
    </div>

    <!-- Staff preference — appears when service is selected and >1 staff can do it -->
    <template v-if="selectedService && eligibleStaff.length > 1">
      <div class="pt-1">
        <h3 class="text-sm font-medium text-gray-700 mb-3">
          اختاري الموظفة
          <span class="text-gray-400 font-normal"> (اختياري)</span>
        </h3>
        <div class="flex gap-2 flex-wrap">
          <button
            class="px-4 py-1.5 rounded-full text-sm border transition-colors"
            :class="selectedStaff === null
              ? 'bg-gray-900 text-white border-gray-900'
              : 'bg-white border-gray-200 text-gray-600'"
            @click="emit('update:selectedStaff', null)"
          >
            بدون تفضيل
          </button>
          <button
            v-for="member in eligibleStaff"
            :key="member.id"
            class="px-4 py-1.5 rounded-full text-sm border transition-colors"
            :class="selectedStaff?.id === member.id
              ? 'bg-gray-900 text-white border-gray-900'
              : 'bg-white border-gray-200 text-gray-600'"
            @click="emit('update:selectedStaff', member)"
          >
            {{ member.name }}
          </button>
        </div>
      </div>
    </template>
  </div>

  <!-- Sticky bottom CTA -->
  <div class="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-sm border-t border-gray-100 p-4">
    <div class="max-w-lg mx-auto">
      <UButton
        block
        size="xl"
        :disabled="!selectedService"
        color="neutral"
        @click="emit('next')"
      >
        <span v-if="selectedService">
          التالي — {{ selectedService.price }} ر.س
        </span>
        <span v-else>اختاري خدمة للمتابعة</span>
      </UButton>
    </div>
  </div>
</template>
```

**Step 3: Verify in browser**

Navigate to `http://localhost:3000/nour-beauty`. Expected:
- Services list renders with all 11 services
- Category pills filter correctly
- Tapping a service card highlights it and shows price in the CTA
- Staff pills appear when service has multiple eligible staff
- "التالي" button is disabled until a service is selected

**Step 4: Commit**

```bash
git add app/components/booking/BookingServiceCard.vue app/components/booking/BookingServiceList.vue
git commit -m "feat: add service selection step with category filter and staff preference"
```

---

## Task 6: Step 2 — Date/time picker

**Files:**
- Create: `app/components/booking/BookingDatePicker.vue`

Design: horizontal scrollable date strip showing next 14 days, then a grid of available time slots. Both are tap-to-select with clear selected state. Times shown in 12-hour Arabic format.

**Step 1: Create BookingDatePicker**

```vue
<!-- app/components/booking/BookingDatePicker.vue -->
<script setup lang="ts">
import type { Service, StaffMember } from '~/app/types'
import { mockAvailableSlots } from '~/app/data/mock'

const props = defineProps<{
  service: Service
  staff: StaffMember | null
  selectedDate: string | null
  selectedTime: string | null
}>()

const emit = defineEmits<{
  'update:selectedDate': [v: string]
  'update:selectedTime': [v: string]
  'next': []
  'back': []
}>()

// Next 14 days starting today
const days = computed(() => {
  const result = []
  const today = new Date()
  for (let i = 0; i < 14; i++) {
    const d = new Date(today)
    d.setDate(today.getDate() + i)
    result.push({
      value: d.toISOString().split('T')[0],
      dayName: d.toLocaleDateString('ar-SA', { weekday: 'short' }),
      dayNum: d.getDate(),
      isToday: i === 0,
    })
  }
  return result
})

const availableSlots = computed(() =>
  props.selectedDate ? mockAvailableSlots(props.selectedDate) : []
)

// Arabic 12-hour format: "10:00" → "١٠:٠٠ ص"
function formatTime(time: string): string {
  const [h, m] = time.split(':').map(Number)
  const period = h < 12 ? 'ص' : 'م'
  const hour = h % 12 || 12
  return `${hour}:${m.toString().padStart(2, '0')} ${period}`
}

function selectDate(date: string) {
  emit('update:selectedDate', date)
  emit('update:selectedTime', '') // reset time when date changes
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

    <h2 class="text-xl font-semibold text-gray-900">اختاري الموعد</h2>

    <!-- Date strip -->
    <div class="space-y-2">
      <p class="text-sm text-gray-500 font-medium">التاريخ</p>
      <div class="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-hide">
        <button
          v-for="day in days"
          :key="day.value"
          class="shrink-0 flex flex-col items-center gap-1 w-[52px] py-3 rounded-2xl border text-center transition-all duration-150"
          :class="selectedDate === day.value
            ? 'bg-gray-900 text-white border-gray-900'
            : 'bg-white border-gray-100 text-gray-700'"
          @click="selectDate(day.value)"
        >
          <span class="text-[11px]">{{ day.dayName }}</span>
          <span class="text-lg font-semibold leading-none">{{ day.dayNum }}</span>
          <span v-if="day.isToday" class="text-[10px] opacity-60">اليوم</span>
        </button>
      </div>
    </div>

    <!-- Time slots grid -->
    <template v-if="selectedDate">
      <div class="space-y-2">
        <p class="text-sm text-gray-500 font-medium">الوقت</p>
        <div v-if="availableSlots.length" class="grid grid-cols-3 gap-2">
          <button
            v-for="slot in availableSlots"
            :key="slot"
            class="py-2.5 rounded-xl border text-sm text-center transition-all duration-150"
            :class="selectedTime === slot
              ? 'bg-gray-900 text-white border-gray-900 font-medium'
              : 'bg-white border-gray-100 text-gray-700'"
            @click="emit('update:selectedTime', slot)"
          >
            {{ formatTime(slot) }}
          </button>
        </div>
        <p v-else class="text-sm text-gray-400 text-center py-6">
          لا توجد مواعيد متاحة في هذا اليوم
        </p>
      </div>
    </template>
    <template v-else>
      <p class="text-sm text-gray-400">اختاري تاريخاً لعرض الأوقات المتاحة</p>
    </template>
  </div>

  <!-- Sticky CTA -->
  <div class="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-sm border-t border-gray-100 p-4">
    <div class="max-w-lg mx-auto">
      <UButton
        block
        size="xl"
        :disabled="!selectedDate || !selectedTime"
        color="neutral"
        @click="emit('next')"
      >
        التالي
      </UButton>
    </div>
  </div>
</template>
```

**Step 2: Verify in browser**

Select a service → tap "التالي" → Step 2 loads. Expected:
- 14-day strip scrolls horizontally
- Tapping a date shows time slots in a 3-column grid
- Tapping a time slot highlights it
- "التالي" is disabled until both date and time are selected

**Step 3: Commit**

```bash
git add app/components/booking/BookingDatePicker.vue
git commit -m "feat: add date/time picker step with scrollable date strip and slot grid"
```

---

## Task 7: Step 3 — Contact form

**Files:**
- Create: `app/components/booking/BookingContactForm.vue`

Two fields only: name and phone. No account creation. Phone input is LTR (numbers are LTR even in RTL context). Advance is gated on minimal validation.

**Step 1: Create BookingContactForm**

```vue
<!-- app/components/booking/BookingContactForm.vue -->
<script setup lang="ts">
import type { BookingContact } from '~/app/types'

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
```

**Step 2: Verify in browser**

Fill name (2+ chars) and phone (9+ digits). Expected:
- "متابعة" becomes enabled
- Submitting moves to step 4
- Going back preserves what was typed (pre-filled from `props.contact`)

**Step 3: Commit**

```bash
git add app/components/booking/BookingContactForm.vue
git commit -m "feat: add contact form step (name + phone, no account required)"
```

---

## Task 8: Step 4 — Confirmation

**Files:**
- Create: `app/components/booking/BookingConfirmation.vue`

Shows a clean summary card with all selections. WhatsApp confirmation link. Payment CTA (stubbed — Moyasar integration is a separate feature).

**Step 1: Create BookingConfirmation**

```vue
<!-- app/components/booking/BookingConfirmation.vue -->
<script setup lang="ts">
import type { BookingSelection, Tenant, TenantSettings } from '~/app/types'

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
  <div class="pt-5 space-y-4">
    <!-- Back -->
    <button
      class="flex items-center gap-1 text-sm text-gray-500"
      @click="emit('back')"
    >
      <span class="inline-block rotate-180 rtl:rotate-0">←</span>
      رجوع
    </button>

    <h2 class="text-xl font-semibold text-gray-900">تأكيد الحجز</h2>

    <!-- Summary card -->
    <div class="bg-white rounded-2xl border border-gray-100 p-4 space-y-3">
      <!-- Service + price -->
      <div class="flex items-start justify-between gap-2">
        <div>
          <p class="font-semibold text-gray-900 text-base">{{ selection.service?.name }}</p>
          <p class="text-sm text-gray-400 mt-0.5">{{ formatDuration(selection.service!.durationMinutes) }}</p>
        </div>
        <p class="font-bold text-gray-900 shrink-0">
          {{ selection.service?.price }}
          <span class="text-sm font-normal text-gray-400"> ر.س</span>
        </p>
      </div>

      <!-- Details -->
      <div class="border-t border-gray-50 pt-3 space-y-2">
        <div class="flex justify-between text-sm">
          <span class="text-gray-500">التاريخ</span>
          <span class="text-gray-900">{{ formatDate(selection.date!) }}</span>
        </div>
        <div class="flex justify-between text-sm">
          <span class="text-gray-500">الوقت</span>
          <span class="text-gray-900">{{ formatTime(selection.time!) }}</span>
        </div>
        <div v-if="selection.staff" class="flex justify-between text-sm">
          <span class="text-gray-500">الموظفة</span>
          <span class="text-gray-900">{{ selection.staff.name }}</span>
        </div>
        <div class="border-t border-gray-50 pt-2 flex justify-between text-sm">
          <span class="text-gray-500">الاسم</span>
          <span class="text-gray-900">{{ selection.contact?.name }}</span>
        </div>
        <div class="flex justify-between text-sm">
          <span class="text-gray-500">الجوال</span>
          <span class="text-gray-900" dir="ltr">{{ selection.contact?.phone }}</span>
        </div>
      </div>
    </div>

    <!-- WhatsApp confirmation link -->
    <a
      v-if="tenant.phone"
      :href="whatsappUrl"
      target="_blank"
      rel="noopener"
      class="flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-gray-200 bg-white text-sm text-gray-700 hover:border-gray-300 transition-colors"
    >
      <span class="text-[#25D366]">●</span>
      شاركي التأكيد عبر واتساب
    </a>
  </div>

  <!-- Sticky payment CTA (stub) -->
  <div class="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-sm border-t border-gray-100 p-4">
    <div class="max-w-lg mx-auto space-y-2">
      <UButton block size="xl" color="neutral">
        {{ ctaLabel }}
      </UButton>
      <p
        v-if="settings.paymentMode !== 'at_salon'"
        class="text-xs text-center text-gray-400"
      >
        ستُحوَّلين إلى صفحة الدفع الآمن
      </p>
    </div>
  </div>
</template>
```

**Step 2: Run full end-to-end flow in browser**

Navigate to `http://localhost:3000/nour-beauty` and complete all 4 steps:
- Step 1: tap a service, optionally pick a staff member → التالي
- Step 2: tap a date → time slots appear → tap a time → التالي
- Step 3: enter name + phone → متابعة
- Step 4: verify summary card shows all selections correctly, WhatsApp link opens with pre-filled message

**Step 3: Commit**

```bash
git add app/components/booking/BookingConfirmation.vue
git commit -m "feat: add confirmation step with booking summary and WhatsApp link"
```

---

## What's next

The booking page is fully functional as a UI prototype. No data is saved and no payments are processed — that's intentional. Next steps, in order:

1. **Admin: service management UI** — CRUD pages for services and categories (same mock-data-first approach)
2. **Admin: staff management UI** — CRUD pages for staff
3. **Supabase schema** — design and create the DB tables (types above become the schema)
4. **Server API endpoints** — replace mock data with real queries using the repository pattern
5. **Moyasar payment integration** — wire up the pay button in the confirmation step
6. **Admin: calendar view** — display real bookings
