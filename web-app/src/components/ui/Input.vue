<script setup lang="ts">
import { cn } from '@/lib/utils'

interface Props {
  modelValue: string | number | null | undefined
  type?: string
  placeholder?: string
  disabled?: boolean
  invalid?: boolean
  id?: string
  step?: string
  min?: string
  max?: string
  autocomplete?: string
}

withDefaults(defineProps<Props>(), {
  type: 'text',
  disabled: false,
  invalid: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>

<template>
  <input
    :id="id"
    :type="type"
    :value="modelValue ?? ''"
    :placeholder="placeholder"
    :disabled="disabled"
    :step="step"
    :min="min"
    :max="max"
    :autocomplete="autocomplete"
    :class="cn(
      'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm',
      'placeholder:text-muted-foreground',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
      'disabled:cursor-not-allowed disabled:opacity-50',
      invalid && 'border-destructive focus-visible:ring-destructive',
    )"
    @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
  />
</template>
