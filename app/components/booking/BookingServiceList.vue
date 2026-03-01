<!-- app/components/booking/BookingServiceList.vue -->
<script setup lang="ts">
import type { Service, ServiceCategory, StaffMember } from '~/types'

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
