<!-- app/components/shared/PhoneInput.vue -->
<script setup lang="ts">
defineOptions({ inheritAttrs: false })

const props = defineProps<{
  modelValue?: string | null
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const localValue = computed({
  get() {
    const v = props.modelValue ?? ''
    if (v.startsWith('+966')) return v.slice(4)
    if (v.startsWith('966') && v.length > 3) return v.slice(3)
    return v
  },
  set(v: string) {
    const digits = v.replace(/\D/g, '')
    if (!digits) {
      emit('update:modelValue', '')
      return
    }
    // Strip trunk digit 0 (user types 05x → store +9665x)
    const local = digits.startsWith('0') ? digits.slice(1) : digits
    emit('update:modelValue', '+966' + local)
  },
})
</script>

<template>
  <UInput
    v-model="localValue"
    type="tel"
    inputmode="numeric"
    dir="ltr"
    :size="props.size"
    placeholder="5x xxx xxxx"
    v-bind="$attrs"
  >
    <template #leading>
      <span class="text-sm font-mono text-(--color-text-muted) select-none pe-1">
        +966
      </span>
    </template>
  </UInput>
</template>
