// tests/components/shared/PhoneInput.test.ts
import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import PhoneInput from '~/components/shared/PhoneInput.vue'

describe('PhoneInput', () => {
  it('renders +966 prefix text', async () => {
    const wrapper = await mountSuspended(PhoneInput, { props: { modelValue: '' } })
    expect(wrapper.text()).toContain('+966')
  })

  it('shows local part only when modelValue has +966 prefix', async () => {
    const wrapper = await mountSuspended(PhoneInput, { props: { modelValue: '+9665123456789' } })
    expect(wrapper.find('input').element.value).toBe('5123456789')
  })

  it('emits full international number on input', async () => {
    const wrapper = await mountSuspended(PhoneInput, { props: { modelValue: '' } })
    await wrapper.find('input').setValue('512345678')
    expect(wrapper.emitted('update:modelValue')![0][0]).toBe('+966512345678')
  })

  it('strips leading trunk digit 0 from pasted value', async () => {
    const wrapper = await mountSuspended(PhoneInput, { props: { modelValue: '' } })
    await wrapper.find('input').setValue('0512345678')
    expect(wrapper.emitted('update:modelValue')![0][0]).toBe('+966512345678')
  })

  it('emits empty string when cleared', async () => {
    const wrapper = await mountSuspended(PhoneInput, { props: { modelValue: '+966512345678' } })
    await wrapper.find('input').setValue('')
    expect(wrapper.emitted('update:modelValue')![0][0]).toBe('')
  })
})
