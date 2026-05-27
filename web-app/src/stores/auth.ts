import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import * as api from '@/api/endpoints'
import { bindTokenAccess } from '@/api/client'
import type { TokenPair, User } from '@/api/types'

const STORAGE_KEY = 'wizallet.auth'

interface StoredAuth {
  user: User
  tokens: TokenPair
}

function loadStored(): StoredAuth | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as StoredAuth
  } catch {
    return null
  }
}

export const useAuthStore = defineStore('auth', () => {
  const initial = loadStored()
  const user = ref<User | null>(initial?.user ?? null)
  const tokens = ref<TokenPair | null>(initial?.tokens ?? null)

  const isAuthenticated = computed(() => !!user.value && !!tokens.value)

  function persist() {
    if (user.value && tokens.value) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ user: user.value, tokens: tokens.value }))
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
  }

  function setSession(u: User, t: TokenPair) {
    user.value = u
    tokens.value = t
    persist()
  }

  function setTokens(t: TokenPair) {
    tokens.value = t
    persist()
  }

  function setUser(u: User) {
    user.value = u
    persist()
  }

  function clear() {
    user.value = null
    tokens.value = null
    persist()
  }

  async function login(input: { login: string; password: string }) {
    const res = await api.login(input)
    setSession(res.user, res.tokens)
  }

  async function register(input: {
    username: string
    email: string
    password: string
    initial_balance?: string
  }) {
    const res = await api.register(input)
    setSession(res.user, res.tokens)
  }

  async function logout() {
    const rt = tokens.value?.refresh_token
    clear()
    if (rt) {
      try {
        await api.logout(rt)
      } catch {
        /* best-effort, server may not know token after timeout */
      }
    }
  }

  // Bind the store as the token source for the axios interceptor.
  bindTokenAccess({
    getAccess: () => tokens.value?.access_token ?? null,
    getRefresh: () => tokens.value?.refresh_token ?? null,
    setTokens,
    clear,
  })

  return {
    user,
    tokens,
    isAuthenticated,
    setSession,
    setUser,
    clear,
    login,
    register,
    logout,
  }
})
