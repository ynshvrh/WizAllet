<script setup lang="ts">
import { computed } from 'vue'
import { cn } from '@/lib/utils'

interface Props {
  variant?: 'default' | 'outline' | 'ghost' | 'destructive'
  size?: 'sm' | 'md' | 'lg'
  type?: 'button' | 'submit' | 'reset'
  disabled?: boolean
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
  size: 'md',
  type: 'button',
  disabled: false,
  loading: false,
})

const classes = computed(() =>
  cn(
    'inline-flex items-center justify-center gap-2 font-medium rounded-md transition-colors',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
    'disabled:opacity-50 disabled:pointer-events-none',
    {
      'bg-primary text-primary-foreground hover:bg-primary/90': props.variant === 'default',
      'border border-input bg-background hover:bg-accent hover:text-accent-foreground': props.variant === 'outline',
      'hover:bg-accent hover:text-accent-foreground': props.variant === 'ghost',
      'bg-destructive text-destructive-foreground hover:bg-destructive/90': props.variant === 'destructive',
      'h-9 px-3 text-sm': props.size === 'sm',
      'h-10 px-4 text-sm': props.size === 'md',
      'h-11 px-6 text-base': props.size === 'lg',
    },
  ),
)
</script>

<template>
  <button :type="type" :disabled="disabled || loading" :class="classes">
    <span v-if="loading" class="inline-block size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
    <slot />
  </button>
</template>
