# Admin Services Management Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build `/admin/services` — lists all services grouped by category with add, edit, and delete, backed by in-memory mock data.

**Architecture:** A `useServices` composable owns in-memory reactive state seeded from mock data and exposes add/update/remove operations. The page calls the composable once and passes props/events down to two child components: `AdminServiceCard` (per-row display + inline delete confirm) and `AdminServiceFormModal` (shared add/edit form). No API calls — all state lives in memory and resets on page refresh.

**Tech Stack:** Nuxt 4 · Vue 3 Composition API · Nuxt UI v3 (UButton, UModal, UInput) · @nuxtjs/i18n · Vitest + nuxt test environment

---

## Task 1: `useServices` composable (TDD)

**Files:**
- Create: `app/composables/admin/useServices.ts`
- Create: `tests/app/composables/admin/useServices.test.ts`

---

### Step 1: Write the failing tests

Create `tests/app/composables/admin/useServices.test.ts`:

```ts
// tests/app/composables/admin/useServices.test.ts
import { describe, it, expect } from 'vitest'
import { useServices } from '~/composables/admin/useServices'

describe('useServices', () => {
  it('loads all mock services', () => {
    const { services } = useServices()
    expect(services.value.length).toBeGreaterThan(0)
  })

  it('loads all mock categories', () => {
    const { categories } = useServices()
    expect(categories.value.length).toBeGreaterThan(0)
  })

  it('groups services by category in sortOrder', () => {
    const { servicesByCategory } = useServices()
    const groups = servicesByCategory.value
    expect(groups.length).toBeGreaterThan(0)
    expect(groups[0].services.length).toBeGreaterThan(0)
    // groups must be in ascending sortOrder
    for (let i = 1; i < groups.length; i++) {
      expect(groups[i].category.sortOrder).toBeGreaterThan(
        groups[i - 1].category.sortOrder,
      )
    }
  })

  it('omits categories that have no services', () => {
    const { servicesByCategory, services } = useServices()
    // remove all services from first category
    const firstCatId = servicesByCategory.value[0].category.id
    services.value = services.value.filter(s => s.categoryId !== firstCatId)
    const ids = servicesByCategory.value.map(g => g.category.id)
    expect(ids).not.toContain(firstCatId)
  })

  it('addService appends a new service with a generated id', () => {
    const { services, addService } = useServices()
    const before = services.value.length
    addService({
      categoryId: 'cat-hair',
      name: 'تجربة',
      nameEn: null,
      description: null,
      price: 100,
      durationMinutes: 30,
      isActive: true,
    })
    expect(services.value.length).toBe(before + 1)
    const added = services.value[services.value.length - 1]
    expect(added.id).toBeTruthy()
    expect(added.name).toBe('تجربة')
  })

  it('updateService patches an existing service by id', () => {
    const { services, updateService } = useServices()
    const id = services.value[0].id
    updateService(id, { price: 999 })
    expect(services.value.find(s => s.id === id)?.price).toBe(999)
  })

  it('removeService deletes the service with the given id', () => {
    const { services, removeService } = useServices()
    const before = services.value.length
    const id = services.value[0].id
    removeService(id)
    expect(services.value.length).toBe(before - 1)
    expect(services.value.find(s => s.id === id)).toBeUndefined()
  })

  it('each call to useServices returns independent state', () => {
    const a = useServices()
    const b = useServices()
    a.removeService(a.services.value[0].id)
    // b is unaffected
    expect(b.services.value.length).toBe(a.services.value.length + 1)
  })
})
```

### Step 2: Run tests — expect FAIL

```bash
npm test tests/app/composables/admin/useServices.test.ts
```

Expected: all tests fail with "Cannot find module '~/composables/admin/useServices'"

---

### Step 3: Write the minimal implementation

Create `app/composables/admin/useServices.ts`:

```ts
// app/composables/admin/useServices.ts
import { ref, computed } from 'vue'
import { mockCategories, mockServices } from '~/data/mock'
import type { Service, ServiceCategory } from '~/types'

export type NewServiceData = Omit<Service, 'id' | 'tenantId'>

export function useServices() {
  const categories = ref<ServiceCategory[]>([...mockCategories])
  const services = ref<Service[]>([...mockServices])

  const servicesByCategory = computed(() =>
    [...categories.value]
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map(category => ({
        category,
        services: services.value.filter(s => s.categoryId === category.id),
      }))
      .filter(group => group.services.length > 0),
  )

  function addService(data: NewServiceData): void {
    const id = `s-${Date.now()}`
    services.value = [...services.value, { ...data, id, tenantId: 't1' }]
  }

  function updateService(id: string, patch: Partial<Service>): void {
    services.value = services.value.map(s =>
      s.id === id ? { ...s, ...patch } : s,
    )
  }

  function removeService(id: string): void {
    services.value = services.value.filter(s => s.id !== id)
  }

  return { categories, services, servicesByCategory, addService, updateService, removeService }
}
```

### Step 4: Run tests — expect PASS

```bash
npm test tests/app/composables/admin/useServices.test.ts
```

Expected: all 8 tests pass.

### Step 5: Commit

```bash
git add app/composables/admin/useServices.ts tests/app/composables/admin/useServices.test.ts
git commit -m "feat: add useServices composable with in-memory CRUD"
```

---

## Task 2: i18n keys

**Files:**
- Modify: `i18n/locales/ar.json`
- Modify: `i18n/locales/en.json`

No tests for translation strings.

### Step 1: Add keys to `i18n/locales/ar.json`

Inside the `"admin"` object, append after `"logout"`:

```json
"editService": "تعديل الخدمة",
"deleteService": "حذف الخدمة",
"confirmDelete": "هل أنت متأكد؟",
"serviceName": "اسم الخدمة",
"serviceNameEn": "الاسم بالإنجليزية (اختياري)",
"servicePrice": "السعر (ر.س)",
"serviceDuration": "المدة (دقيقة)",
"serviceCategory": "التصنيف",
"serviceActive": "نشطة",
"noServices": "لا توجد خدمات بعد"
```

### Step 2: Add keys to `i18n/locales/en.json`

Inside the `"admin"` object, append after `"logout"`:

```json
"editService": "Edit service",
"deleteService": "Delete service",
"confirmDelete": "Are you sure?",
"serviceName": "Service name",
"serviceNameEn": "Name in English (optional)",
"servicePrice": "Price (SAR)",
"serviceDuration": "Duration (minutes)",
"serviceCategory": "Category",
"serviceActive": "Active",
"noServices": "No services yet"
```

### Step 3: Commit

```bash
git add i18n/locales/ar.json i18n/locales/en.json
git commit -m "feat: add services form i18n keys"
```

---

## Task 3: `AdminServiceCard` component

**Files:**
- Create: `app/components/admin/AdminServiceCard.vue`

Displays one service row. Has Edit and Delete buttons. Clicking Delete once shows an inline "Are you sure?" confirmation to prevent accidental deletes.

### Step 1: Create the component

```vue
<!-- app/components/admin/AdminServiceCard.vue -->
<script setup lang="ts">
import type { Service } from '~/types'

defineProps<{
  service: Service
}>()

const emit = defineEmits<{
  edit: [service: Service]
  delete: [id: string]
}>()

const confirmingDelete = ref(false)

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} د`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m === 0 ? `${h} س` : `${h} س ${m} د`
}
</script>

<template>
  <div
    class="flex items-center justify-between gap-3 px-4 py-3 bg-white rounded-xl border border-gray-100 hover:border-gray-200 transition-colors"
    :class="{ 'opacity-50': !service.isActive }"
  >
    <!-- Service info -->
    <div class="flex-1 min-w-0">
      <p class="font-medium text-gray-900 text-sm truncate">{{ service.name }}</p>
      <p class="text-xs text-gray-400 mt-0.5">
        {{ formatDuration(service.durationMinutes) }}
      </p>
    </div>

    <!-- Price -->
    <div class="shrink-0 text-end">
      <span class="font-semibold text-gray-900 text-sm">{{ service.price }}</span>
      <span class="text-xs text-gray-400 me-0.5"> {{ $t('common.sar') }}</span>
    </div>

    <!-- Actions -->
    <div class="flex items-center gap-1 shrink-0">
      <template v-if="confirmingDelete">
        <span class="text-xs text-red-600 font-medium me-1">
          {{ $t('admin.confirmDelete') }}
        </span>
        <UButton
          size="xs"
          color="error"
          variant="solid"
          @click="emit('delete', service.id); confirmingDelete = false"
        >
          {{ $t('common.confirm') }}
        </UButton>
        <UButton
          size="xs"
          color="neutral"
          variant="ghost"
          @click="confirmingDelete = false"
        >
          {{ $t('common.cancel') }}
        </UButton>
      </template>
      <template v-else>
        <UButton
          size="xs"
          color="neutral"
          variant="ghost"
          icon="i-heroicons-pencil-square"
          :aria-label="$t('admin.editService')"
          @click="emit('edit', service)"
        />
        <UButton
          size="xs"
          color="error"
          variant="ghost"
          icon="i-heroicons-trash"
          :aria-label="$t('admin.deleteService')"
          @click="confirmingDelete = true"
        />
      </template>
    </div>
  </div>
</template>
```

### Step 2: Verify it renders (manual check in dev)

```bash
npm run dev
# Navigate to /admin/services — nothing visible yet (page still a stub)
# No errors in the console is a good sign
```

### Step 3: Commit

```bash
git add app/components/admin/AdminServiceCard.vue
git commit -m "feat: add AdminServiceCard with inline delete confirmation"
```

---

## Task 4: `AdminServiceFormModal` component

**Files:**
- Create: `app/components/admin/AdminServiceFormModal.vue`

A `UModal` that handles both **add** (service prop is null) and **edit** (service prop is a Service) modes. The parent controls open state via `v-model:open`. On submit, emits `save` with the form data; parent is responsible for calling `addService` or `updateService`.

### Step 1: Create the component

```vue
<!-- app/components/admin/AdminServiceFormModal.vue -->
<script setup lang="ts">
import type { Service, ServiceCategory } from '~/types'
import type { NewServiceData } from '~/composables/admin/useServices'

const props = defineProps<{
  service: Service | null
  categories: ServiceCategory[]
}>()

const emit = defineEmits<{
  save: [data: NewServiceData]
}>()

const open = defineModel<boolean>('open', { default: false })

// Local form state — reset whenever the modal opens or service prop changes
const form = reactive({
  categoryId: '',
  name: '',
  nameEn: '',
  description: '',
  price: 0,
  durationMinutes: 30,
  isActive: true,
})

watch(
  () => props.service,
  (service) => {
    if (service) {
      form.categoryId = service.categoryId
      form.name = service.name
      form.nameEn = service.nameEn ?? ''
      form.description = service.description ?? ''
      form.price = service.price
      form.durationMinutes = service.durationMinutes
      form.isActive = service.isActive
    } else {
      form.categoryId = props.categories[0]?.id ?? ''
      form.name = ''
      form.nameEn = ''
      form.description = ''
      form.price = 0
      form.durationMinutes = 30
      form.isActive = true
    }
  },
  { immediate: true },
)

// Also reset when modal opens to add mode
watch(open, (val) => {
  if (val && !props.service) {
    form.categoryId = props.categories[0]?.id ?? ''
    form.name = ''
    form.nameEn = ''
    form.description = ''
    form.price = 0
    form.durationMinutes = 30
    form.isActive = true
  }
})

function handleSubmit() {
  if (!form.name.trim() || !form.categoryId) return
  emit('save', {
    categoryId: form.categoryId,
    name: form.name.trim(),
    nameEn: form.nameEn.trim() || null,
    description: form.description.trim() || null,
    price: Number(form.price),
    durationMinutes: Number(form.durationMinutes),
    isActive: form.isActive,
  })
  open.value = false
}
</script>

<template>
  <UModal v-model:open="open">
    <template #content>
      <div class="p-6 space-y-4">
        <!-- Header -->
        <h3 class="text-lg font-semibold text-gray-900">
          {{ service ? $t('admin.editService') : $t('admin.addService') }}
        </h3>

        <form class="space-y-4" @submit.prevent="handleSubmit">
          <!-- Category -->
          <div class="space-y-1.5">
            <label class="text-sm font-medium text-gray-700">
              {{ $t('admin.serviceCategory') }}
            </label>
            <select
              v-model="form.categoryId"
              class="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-gray-900"
              required
            >
              <option
                v-for="cat in categories"
                :key="cat.id"
                :value="cat.id"
              >
                {{ cat.name }}
              </option>
            </select>
          </div>

          <!-- Name (Arabic) -->
          <div class="space-y-1.5">
            <label class="text-sm font-medium text-gray-700">
              {{ $t('admin.serviceName') }}
            </label>
            <UInput v-model="form.name" required dir="rtl" />
          </div>

          <!-- Name (English) -->
          <div class="space-y-1.5">
            <label class="text-sm font-medium text-gray-700">
              {{ $t('admin.serviceNameEn') }}
            </label>
            <UInput v-model="form.nameEn" dir="ltr" />
          </div>

          <!-- Price + Duration (side by side) -->
          <div class="grid grid-cols-2 gap-3">
            <div class="space-y-1.5">
              <label class="text-sm font-medium text-gray-700">
                {{ $t('admin.servicePrice') }}
              </label>
              <UInput v-model="form.price" type="number" min="0" required />
            </div>
            <div class="space-y-1.5">
              <label class="text-sm font-medium text-gray-700">
                {{ $t('admin.serviceDuration') }}
              </label>
              <UInput v-model="form.durationMinutes" type="number" min="5" step="5" required />
            </div>
          </div>

          <!-- Active toggle -->
          <label class="flex items-center gap-3 cursor-pointer">
            <input
              v-model="form.isActive"
              type="checkbox"
              class="w-4 h-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900"
            />
            <span class="text-sm text-gray-700">{{ $t('admin.serviceActive') }}</span>
          </label>

          <!-- Footer buttons -->
          <div class="flex justify-end gap-2 pt-2">
            <UButton
              type="button"
              color="neutral"
              variant="ghost"
              @click="open = false"
            >
              {{ $t('common.cancel') }}
            </UButton>
            <UButton type="submit" color="neutral" variant="solid">
              {{ $t('common.save') }}
            </UButton>
          </div>
        </form>
      </div>
    </template>
  </UModal>
</template>
```

### Step 2: Commit

```bash
git add app/components/admin/AdminServiceFormModal.vue
git commit -m "feat: add AdminServiceFormModal for add/edit"
```

---

## Task 5: Wire up `app/pages/admin/services.vue`

**Files:**
- Modify: `app/pages/admin/services.vue`

Replace the stub with the full page. The page owns all state; components only receive props and emit events.

### Step 1: Replace the page

```vue
<!-- app/pages/admin/services.vue -->
<script setup lang="ts">
import type { Service } from '~/types'

definePageMeta({ layout: 'admin', middleware: 'auth' })

const { categories, servicesByCategory, addService, updateService, removeService } =
  useServices()

const modalOpen = ref(false)
const editingService = ref<Service | null>(null)

function openAdd() {
  editingService.value = null
  modalOpen.value = true
}

function openEdit(service: Service) {
  editingService.value = service
  modalOpen.value = true
}

function handleSave(data: Parameters<typeof addService>[0]) {
  if (editingService.value) {
    updateService(editingService.value.id, data)
  } else {
    addService(data)
  }
}
</script>

<template>
  <div class="p-6 max-w-2xl mx-auto">
    <!-- Page header -->
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-semibold text-gray-900">
        {{ $t('admin.services') }}
      </h1>
      <UButton
        icon="i-heroicons-plus"
        color="neutral"
        variant="solid"
        @click="openAdd"
      >
        {{ $t('admin.addService') }}
      </UButton>
    </div>

    <!-- Category groups -->
    <div v-if="servicesByCategory.length > 0" class="space-y-6">
      <section
        v-for="group in servicesByCategory"
        :key="group.category.id"
      >
        <h2 class="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
          {{ group.category.name }}
        </h2>
        <div class="space-y-2">
          <AdminServiceCard
            v-for="service in group.services"
            :key="service.id"
            :service="service"
            @edit="openEdit"
            @delete="removeService"
          />
        </div>
      </section>
    </div>

    <!-- Empty state -->
    <p v-else class="text-center text-gray-400 py-16">
      {{ $t('admin.noServices') }}
    </p>

    <!-- Add / Edit modal -->
    <AdminServiceFormModal
      v-model:open="modalOpen"
      :service="editingService"
      :categories="categories"
      @save="handleSave"
    />
  </div>
</template>
```

### Step 2: Verify in the browser

```bash
npm run dev
```

Open `http://localhost:3000/admin/services` and verify:
- [ ] Services are listed grouped under 4 category headers (الشعر، الأظافر، البشرة، المكياج)
- [ ] Each service shows name, duration, price, edit and delete icons
- [ ] Clicking delete shows inline "هل أنت متأكد؟ / تأكيد / إلغاء"
- [ ] Confirmed delete removes the service from the list
- [ ] "إضافة خدمة" opens the modal with an empty form
- [ ] Selecting a category, filling name + price + duration and saving adds the service under the correct category
- [ ] Clicking the pencil on an existing service opens the modal prefilled — saving updates it in place

### Step 3: Run the full test suite to confirm no regressions

```bash
npm test
```

Expected: all tests pass (the 8 new useServices tests + pre-existing tests).

### Step 4: Commit

```bash
git add app/pages/admin/services.vue
git commit -m "feat: implement admin services page with list, add, edit, delete"
```

---

## Summary

| File | Action |
|---|---|
| `app/composables/admin/useServices.ts` | Create |
| `tests/app/composables/admin/useServices.test.ts` | Create |
| `i18n/locales/ar.json` | Modify (add 10 keys under `admin`) |
| `i18n/locales/en.json` | Modify (add 10 keys under `admin`) |
| `app/components/admin/AdminServiceCard.vue` | Create |
| `app/components/admin/AdminServiceFormModal.vue` | Create |
| `app/pages/admin/services.vue` | Modify (replace stub) |

**Total commits: 5** (composable, i18n, card, modal, page)
