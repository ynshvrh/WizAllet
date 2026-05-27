<script setup lang="ts">
import { computed } from 'vue'
import { cn } from '@/lib/utils'

const props = withDefaults(defineProps<{ variant?: 'default' | 'destructive' | 'success' }>(), {
  variant: 'default',
})

const classes = computed(() =>
  cn(
    'rounded-md border px-4 py-3 text-sm',
    {
      'border-input bg-muted text-foreground': props.variant === 'default',
      'border-destructive/40 bg-destructive/10 text-destructive': props.variant === 'destructive',
      'border-emerald-300 bg-emerald-50 text-emerald-700': props.variant === 'success',
    },
  ),
)
</script>

<template>
  <div role="alert" :class="classes">
    <slot />
  </div>
</template>
