<!-- app/components/booking/BookingServiceList.vue -->
<script setup lang="ts">
import type { Service, ServiceCategory, StaffMember } from '~/types'

const { t } = useI18n()

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
  <div class="pt-5 space-y-6">
    <h2 class="text-2xl font-semibold text-(--color-text)">{{ t('booking.selectService') }}</h2>

    <!-- Category filter pills -->
    <div class="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
      <UButton
        class="rounded-full shrink-0"
        :variant="activeCategory === null ? 'solid' : 'outline'"
        :color="activeCategory === null ? 'primary' : 'neutral'"
        size="sm"
        @click="activeCategory = null"
      >
        {{ t('booking.all') }}
      </UButton>
      <UButton
        v-for="cat in categories"
        :key="cat.id"
        class="rounded-full shrink-0"
        :variant="activeCategory === cat.id ? 'solid' : 'outline'"
        :color="activeCategory === cat.id ? 'primary' : 'neutral'"
        size="sm"
        @click="activeCategory = cat.id"
      >
        {{ cat.name }}
      </UButton>
    </div>

    <!-- Service cards -->
    <div class="space-y-3">
      <BookingServiceCard
        v-for="service in filteredServices"
        :key="service.id"
        :service="service"
        :selected="selectedService?.id === service.id"
        @select="selectService"
      />
    </div>

    <!-- Staff preference — appears when service is selected and at least one staff can do it -->
    <template v-if="selectedService && eligibleStaff.length > 0">
      <div class="pt-4 border-t border-(--color-border)">
        <h3 class="text-lg font-medium text-(--color-text) mb-4">
          {{ t('booking.selectStaff') }}
          <span class="text-(--color-text-muted) text-base font-normal"> ({{ t('booking.optional') }})</span>
        </h3>
        <div class="flex gap-2 flex-wrap">
          <UButton
            class="rounded-full"
            :variant="selectedStaff === null ? 'solid' : 'outline'"
            :color="selectedStaff === null ? 'primary' : 'neutral'"
            size="sm"
            @click="emit('update:selectedStaff', null)"
          >
            {{ t('booking.noPreference') }}
          </UButton>
          <UButton
            v-for="member in eligibleStaff"
            :key="member.id"
            class="rounded-full"
            :variant="selectedStaff?.id === member.id ? 'solid' : 'outline'"
            :color="selectedStaff?.id === member.id ? 'primary' : 'neutral'"
            size="sm"
            @click="emit('update:selectedStaff', member)"
          >
            {{ member.name }}
          </UButton>
        </div>
      </div>
    </template>
  </div>

  <!-- Sticky bottom CTA — ClientOnly to avoid hydration mismatch on disabled attribute -->
  <ClientOnly>
    <div class="fixed bottom-0 inset-x-0 bg-(--color-surface)/95 backdrop-blur-md border-t border-(--color-border) p-5">
      <div class="max-w-lg mx-auto">
        <UButton
          block
          size="xl"
          :disabled="!selectedService"
          color="neutral"
          @click="emit('next')"
        >
          <span v-if="selectedService" class="text-lg">
            {{ t('booking.continueWith', { price: selectedService.price }) }}
          </span>
          <span v-else class="text-lg">{{ t('booking.selectServiceToContinue') }}</span>
        </UButton>
      </div>
    </div>
    <template #fallback>
      <div class="fixed bottom-0 inset-x-0 bg-(--color-surface)/95 backdrop-blur-md border-t border-(--color-border) p-5">
        <div class="max-w-lg mx-auto h-14 rounded-xl bg-(--color-surface-muted)" />
      </div>
    </template>
  </ClientOnly>
</template>
