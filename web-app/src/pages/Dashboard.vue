<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useTransactions, useCreateTransaction, useMe, summarise } from '@/api/queries'
import { errorMessage } from '@/i18n'
import Card from '@/components/ui/Card.vue'
import Button from '@/components/ui/Button.vue'
import Alert from '@/components/ui/Alert.vue'
import TransactionModal from '@/components/TransactionModal.vue'
import { Plus, TrendingUp, TrendingDown, Wallet } from 'lucide-vue-next'

const { t, locale } = useI18n()
const me = useMe()
const txs = useTransactions()
const createTx = useCreateTransaction()

const modalOpen = ref(false)
const modalRef = ref<InstanceType<typeof TransactionModal> | null>(null)

const summary = computed(() => {
  const items = txs.data.value ?? []
  const s = summarise(items)
  const initial = Number(me.data.value?.initial_balance ?? '0')
  return { ...s, balance: initial + s.net }
})

const currency = computed(() => new Intl.NumberFormat(locale.value === 'uk' ? 'uk-UA' : 'en-US', {
  style: 'currency',
  currency: 'UAH',
  maximumFractionDigits: 2,
}))

function fmt(n: number) {
  return currency.value.format(n)
}

async function onSubmitTx(payload: {
  type: 'income' | 'expense'
  amount: string
  note: string | null
  occurred_at?: string
}) {
  try {
    await createTx.mutateAsync(payload)
    modalOpen.value = false
  } catch (err) {
    modalRef.value?.showError(errorMessage(err))
  }
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-semibold">{{ t('dashboard.title') }}</h1>
      <Button @click="modalOpen = true">
        <Plus class="size-4" />
        {{ t('dashboard.addTransaction') }}
      </Button>
    </div>

    <Alert v-if="txs.isError.value" variant="destructive">
      {{ errorMessage(txs.error.value) }}
    </Alert>

    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <Card class="p-5">
        <div class="flex items-center gap-2 text-muted-foreground text-sm">
          <Wallet class="size-4" /> {{ t('dashboard.balance') }}
        </div>
        <div class="mt-2 text-2xl font-semibold">{{ fmt(summary.balance) }}</div>
      </Card>
      <Card class="p-5">
        <div class="flex items-center gap-2 text-muted-foreground text-sm">
          <TrendingUp class="size-4 text-emerald-600" /> {{ t('dashboard.income') }}
        </div>
        <div class="mt-2 text-2xl font-semibold text-emerald-700">{{ fmt(summary.income) }}</div>
      </Card>
      <Card class="p-5">
        <div class="flex items-center gap-2 text-muted-foreground text-sm">
          <TrendingDown class="size-4 text-rose-600" /> {{ t('dashboard.expense') }}
        </div>
        <div class="mt-2 text-2xl font-semibold text-rose-700">{{ fmt(summary.expense) }}</div>
      </Card>
    </div>

    <Card class="p-5">
      <h2 class="text-sm font-medium mb-4">{{ t('dashboard.income') }} vs {{ t('dashboard.expense') }}</h2>
      <div v-if="txs.isPending.value" class="h-32 grid place-items-center text-muted-foreground text-sm">…</div>
      <div v-else-if="!txs.data.value?.length" class="h-32 grid place-items-center text-muted-foreground text-sm">
        {{ t('dashboard.noTransactions') }}
      </div>
      <div v-else class="space-y-3">
        <div>
          <div class="flex justify-between text-xs text-muted-foreground mb-1">
            <span>{{ t('dashboard.income') }}</span><span>{{ fmt(summary.income) }}</span>
          </div>
          <div class="h-3 bg-muted rounded-full overflow-hidden">
            <div class="h-full bg-emerald-600" :style="{ width: `${barPct(summary.income, summary)}%` }" />
          </div>
        </div>
        <div>
          <div class="flex justify-between text-xs text-muted-foreground mb-1">
            <span>{{ t('dashboard.expense') }}</span><span>{{ fmt(summary.expense) }}</span>
          </div>
          <div class="h-3 bg-muted rounded-full overflow-hidden">
            <div class="h-full bg-rose-600" :style="{ width: `${barPct(summary.expense, summary)}%` }" />
          </div>
        </div>
      </div>
    </Card>

    <TransactionModal
      ref="modalRef"
      :open="modalOpen"
      :submitting="createTx.isPending.value"
      @close="modalOpen = false"
      @submit="onSubmitTx"
    />
  </div>
</template>

<script lang="ts">
function barPct(value: number, sum: { income: number; expense: number }) {
  const max = Math.max(sum.income, sum.expense, 1)
  return Math.min(100, Math.round((value / max) * 100))
}
</script>
