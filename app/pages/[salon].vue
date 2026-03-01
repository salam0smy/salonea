<!-- app/pages/[salon].vue -->
<script setup lang="ts">
import { mockTenant, mockSettings, mockCategories, mockServices, mockStaff } from '~/data/mock'

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
