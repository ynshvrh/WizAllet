<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  useTransactions,
  useUpdateTransaction,
  useDeleteTransaction,
} from '@/api/queries'
import { errorMessage } from '@/i18n'
import Card from '@/components/ui/Card.vue'
import Button from '@/components/ui/Button.vue'
import Alert from '@/components/ui/Alert.vue'
import TransactionModal from '@/components/TransactionModal.vue'
import type { Transaction } from '@/api/types'
import { Pencil, Trash2 } from 'lucide-vue-next'

const { t, locale } = useI18n()
const txs = useTransactions()
const updateTx = useUpdateTransaction()
const deleteTx = useDeleteTransaction()

const editing = ref<Transaction | null>(null)
const modalRef = ref<InstanceType<typeof TransactionModal> | null>(null)
const pageError = ref<string | null>(null)

const dateFmt = computed(() =>
  new Intl.DateTimeFormat(locale.value === 'uk' ? 'uk-UA' : 'en-US', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  }),
)

const currency = computed(() =>
  new Intl.NumberFormat(locale.value === 'uk' ? 'uk-UA' : 'en-US', {
    style: 'currency',
    currency: 'UAH',
    maximumFractionDigits: 2,
  }),
)

function fmtDate(s: string) {
  return dateFmt.value.format(new Date(s))
}
function fmtAmount(s: string) {
  return currency.value.format(Number(s))
}

async function onSubmitEdit(payload: {
  type: 'income' | 'expense'
  amount: string
  note: string | null
  occurred_at?: string
}) {
  if (!editing.value) return
  try {
    await updateTx.mutateAsync({ id: editing.value.id, patch: payload })
    editing.value = null
  } catch (err) {
    modalRef.value?.showError(errorMessage(err))
  }
}

async function onDelete(tx: Transaction) {
  if (!window.confirm(t('history.confirmDelete'))) return
  pageError.value = null
  try {
    await deleteTx.mutateAsync(tx.id)
  } catch (err) {
    pageError.value = errorMessage(err)
  }
}
</script>

<template>
  <div class="space-y-6">
    <h1 class="text-2xl font-semibold">{{ t('history.title') }}</h1>

    <Alert v-if="pageError" variant="destructive">{{ pageError }}</Alert>
    <Alert v-if="txs.isError.value" variant="destructive">{{ errorMessage(txs.error.value) }}</Alert>

    <Card class="overflow-hidden">
      <div v-if="txs.isPending.value" class="p-8 text-center text-sm text-muted-foreground">…</div>
      <div v-else-if="!txs.data.value?.length" class="p-8 text-center text-sm text-muted-foreground">
        {{ t('history.empty') }}
      </div>
      <table v-else class="w-full text-sm">
        <thead>
          <tr class="bg-muted/50 text-left text-muted-foreground">
            <th class="px-4 py-3 font-medium">{{ t('history.columns.date') }}</th>
            <th class="px-4 py-3 font-medium">{{ t('history.columns.type') }}</th>
            <th class="px-4 py-3 font-medium text-right">{{ t('history.columns.amount') }}</th>
            <th class="px-4 py-3 font-medium">{{ t('history.columns.note') }}</th>
            <th class="px-4 py-3 font-medium text-right">{{ t('history.columns.actions') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="tx in txs.data.value" :key="tx.id" class="border-t">
            <td class="px-4 py-3">{{ fmtDate(tx.occurred_at) }}</td>
            <td class="px-4 py-3">
              <span
                class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
                :class="tx.type === 'income' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'"
              >
                {{ t(`transaction.${tx.type}`) }}
              </span>
            </td>
            <td class="px-4 py-3 text-right font-medium tabular-nums" :class="tx.type === 'income' ? 'text-emerald-700' : 'text-rose-700'">
              {{ tx.type === 'income' ? '+' : '-' }}{{ fmtAmount(tx.amount) }}
            </td>
            <td class="px-4 py-3 text-muted-foreground">{{ tx.note ?? '—' }}</td>
            <td class="px-4 py-3">
              <div class="flex justify-end gap-1">
                <Button variant="ghost" size="sm" @click="editing = tx" aria-label="edit">
                  <Pencil class="size-4" />
                </Button>
                <Button variant="ghost" size="sm" @click="onDelete(tx)" aria-label="delete">
                  <Trash2 class="size-4 text-rose-600" />
                </Button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </Card>

    <TransactionModal
      ref="modalRef"
      :open="!!editing"
      :transaction="editing"
      :submitting="updateTx.isPending.value"
      @close="editing = null"
      @submit="onSubmitEdit"
    />
  </div>
</template>
