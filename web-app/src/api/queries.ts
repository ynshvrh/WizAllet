import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import {
  createTransaction,
  deleteTransaction,
  fetchMe,
  listTransactions,
  updateTransaction,
} from './endpoints'
import type { Transaction, TransactionType } from './types'

const TX_KEY = ['transactions'] as const
const ME_KEY = ['me'] as const

export function useMe() {
  return useQuery({
    queryKey: ME_KEY,
    queryFn: fetchMe,
    staleTime: 5 * 60_000,
  })
}

export function useTransactions() {
  return useQuery({
    queryKey: TX_KEY,
    queryFn: listTransactions,
    staleTime: 60_000,
  })
}

export function useCreateTransaction() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: createTransaction,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: TX_KEY })
    },
  })
}

export function useUpdateTransaction() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (vars: {
      id: string
      patch: Partial<{ type: TransactionType; amount: string; note: string | null; occurred_at: string }>
    }) => updateTransaction(vars.id, vars.patch),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: TX_KEY })
    },
  })
}

export function useDeleteTransaction() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: deleteTransaction,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: TX_KEY })
    },
  })
}

export function summarise(txs: Transaction[]) {
  let income = 0
  let expense = 0
  for (const t of txs) {
    const v = Number(t.amount)
    if (Number.isFinite(v)) {
      if (t.type === 'income') income += v
      else expense += v
    }
  }
  return { income, expense, net: income - expense }
}
