<script setup lang="ts">
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { errorMessage } from '@/i18n'
import Card from '@/components/ui/Card.vue'
import Input from '@/components/ui/Input.vue'
import Label from '@/components/ui/Label.vue'
import Button from '@/components/ui/Button.vue'
import Alert from '@/components/ui/Alert.vue'
import type { Transaction, TransactionType } from '@/api/types'

interface Props {
  open: boolean
  transaction?: Transaction | null
  submitting?: boolean
}

const props = withDefaults(defineProps<Props>(), { submitting: false, transaction: null })

const emit = defineEmits<{
  close: []
  submit: [
    payload: {
      type: TransactionType
      amount: string
      note: string | null
      occurred_at?: string
    },
  ]
}>()

const { t } = useI18n()

const type = ref<TransactionType>('expense')
const amount = ref('')
const note = ref('')
const date = ref('')
const error = ref<string | null>(null)

function reset() {
  if (props.transaction) {
    type.value = props.transaction.type
    amount.value = props.transaction.amount
    note.value = props.transaction.note ?? ''
    date.value = props.transaction.occurred_at.slice(0, 10)
  } else {
    type.value = 'expense'
    amount.value = ''
    note.value = ''
    date.value = new Date().toISOString().slice(0, 10)
  }
  error.value = null
}

watch(() => props.open, (open) => {
  if (open) reset()
})

async function onSubmit() {
  error.value = null
  try {
    const occurred_at = date.value ? new Date(date.value + 'T12:00:00Z').toISOString() : undefined
    emit('submit', {
      type: type.value,
      amount: amount.value.trim(),
      note: note.value.trim() ? note.value.trim() : null,
      occurred_at,
    })
  } catch (err) {
    error.value = errorMessage(err)
  }
}

function onBackdrop(event: MouseEvent) {
  if (event.target === event.currentTarget) emit('close')
}

defineExpose({ showError: (msg: string) => { error.value = msg } })
</script>

<template>
  <Teleport to="body">
    <div v-if="open" class="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center px-4" @click="onBackdrop">
      <Card class="w-full max-w-md p-6 space-y-4">
        <h2 class="text-lg font-semibold">
          {{ transaction ? t('transaction.edit') : t('transaction.new') }}
        </h2>

        <Alert v-if="error" variant="destructive">{{ error }}</Alert>

        <form class="space-y-4" @submit.prevent="onSubmit">
          <div class="space-y-2">
            <Label>{{ t('transaction.type') }}</Label>
            <div class="flex gap-2">
              <Button
                type="button"
                :variant="type === 'expense' ? 'default' : 'outline'"
                class="flex-1"
                @click="type = 'expense'"
              >
                {{ t('transaction.expense') }}
              </Button>
              <Button
                type="button"
                :variant="type === 'income' ? 'default' : 'outline'"
                class="flex-1"
                @click="type = 'income'"
              >
                {{ t('transaction.income') }}
              </Button>
            </div>
          </div>

          <div class="space-y-2">
            <Label for="amount">{{ t('transaction.amount') }}</Label>
            <Input id="amount" v-model="amount" type="number" step="0.01" min="0.01" :disabled="submitting" />
          </div>

          <div class="space-y-2">
            <Label for="date">{{ t('transaction.date') }}</Label>
            <Input id="date" v-model="date" type="date" :disabled="submitting" />
          </div>

          <div class="space-y-2">
            <Label for="note">{{ t('transaction.note') }}</Label>
            <Input id="note" v-model="note" :disabled="submitting" />
          </div>

          <div class="flex gap-2 justify-end">
            <Button type="button" variant="outline" :disabled="submitting" @click="$emit('close')">
              {{ t('transaction.cancel') }}
            </Button>
            <Button type="submit" :loading="submitting">
              {{ t('transaction.save') }}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  </Teleport>
</template>
