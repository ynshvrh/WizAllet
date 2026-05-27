import { apiClient } from './client'
import type { AuthResponse, Transaction, TransactionType, User } from './types'

// --- auth ---

export async function register(input: {
  username: string
  email: string
  password: string
  initial_balance?: string
}): Promise<AuthResponse> {
  const res = await apiClient.post<AuthResponse>('/auth/register', input)
  return res.data
}

export async function login(input: { login: string; password: string }): Promise<AuthResponse> {
  const res = await apiClient.post<AuthResponse>('/auth/login', input)
  return res.data
}

export async function logout(refreshToken: string): Promise<void> {
  await apiClient.post('/auth/logout', { refresh_token: refreshToken })
}

export async function fetchMe(): Promise<User> {
  const res = await apiClient.get<{ user: User }>('/auth/me')
  return res.data.user
}

// --- users ---

export async function updateProfile(input: { username: string; email: string }): Promise<User> {
  const res = await apiClient.patch<{ user: User }>('/users/me', input)
  return res.data.user
}

export async function changePassword(input: {
  current_password: string
  new_password: string
}): Promise<void> {
  await apiClient.patch('/users/me/password', input)
}

// --- transactions ---

export async function listTransactions(): Promise<Transaction[]> {
  const res = await apiClient.get<{ transactions: Transaction[] }>('/transactions')
  return res.data.transactions
}

export async function createTransaction(input: {
  type: TransactionType
  amount: string
  note?: string | null
  occurred_at?: string
}): Promise<Transaction> {
  const res = await apiClient.post<{ transaction: Transaction }>('/transactions', input)
  return res.data.transaction
}

export async function updateTransaction(
  id: string,
  input: Partial<{ type: TransactionType; amount: string; note: string | null; occurred_at: string }>,
): Promise<Transaction> {
  const res = await apiClient.patch<{ transaction: Transaction }>(`/transactions/${id}`, input)
  return res.data.transaction
}

export async function deleteTransaction(id: string): Promise<void> {
  await apiClient.delete(`/transactions/${id}`)
}
