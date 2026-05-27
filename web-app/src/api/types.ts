export interface User {
  id: string
  username: string
  email: string
  initial_balance: string
  created_at: string
}

export interface TokenPair {
  access_token: string
  access_expires_at: string
  refresh_token: string
  refresh_expires_at: string
}

export interface AuthResponse {
  user: User
  tokens: TokenPair
}

export type TransactionType = 'income' | 'expense'

export interface Transaction {
  id: string
  type: TransactionType
  amount: string
  note: string | null
  occurred_at: string
  created_at: string
  updated_at: string
}

export interface ApiFieldError {
  field: string
  code: string
  message?: string
}

export interface ApiError {
  code: string
  error: string
  fields?: ApiFieldError[]
}
