import axios, { AxiosError, type AxiosRequestConfig, type InternalAxiosRequestConfig } from 'axios'
import type { ApiError, TokenPair } from './types'

const baseURL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080'

export const apiClient = axios.create({ baseURL })

// --- token storage hooks injected by the auth store ---

type TokenAccess = {
  getAccess: () => string | null
  getRefresh: () => string | null
  setTokens: (t: TokenPair) => void
  clear: () => void
}

let tokenAccess: TokenAccess | null = null

export function bindTokenAccess(access: TokenAccess) {
  tokenAccess = access
}

// --- request interceptor: attach access token ---

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = tokenAccess?.getAccess()
  if (token) {
    config.headers.set('Authorization', `Bearer ${token}`)
  }
  return config
})

// --- response interceptor: refresh on TOKEN_EXPIRED, retry once ---

type RetryConfig = AxiosRequestConfig & { _retry?: boolean }

let refreshPromise: Promise<TokenPair> | null = null

async function performRefresh(refreshToken: string): Promise<TokenPair> {
  const res = await axios.post<{ tokens: TokenPair }>(
    `${baseURL}/auth/refresh`,
    { refresh_token: refreshToken },
  )
  return res.data.tokens
}

apiClient.interceptors.response.use(
  (res) => res,
  async (error: AxiosError<ApiError>) => {
    const original = error.config as RetryConfig | undefined
    if (!original || original._retry) {
      return Promise.reject(error)
    }

    const body = error.response?.data
    const isExpired = error.response?.status === 401 && body?.code === 'TOKEN_EXPIRED'

    if (!isExpired) {
      return Promise.reject(error)
    }

    const refresh = tokenAccess?.getRefresh()
    if (!refresh || !tokenAccess) {
      return Promise.reject(error)
    }

    try {
      if (!refreshPromise) {
        refreshPromise = performRefresh(refresh).finally(() => {
          refreshPromise = null
        })
      }
      const tokens = await refreshPromise
      tokenAccess.setTokens(tokens)
      original._retry = true
      original.headers = { ...(original.headers ?? {}), Authorization: `Bearer ${tokens.access_token}` }
      return apiClient.request(original)
    } catch (refreshErr) {
      tokenAccess.clear()
      return Promise.reject(refreshErr)
    }
  },
)

export function asApiError(err: unknown): ApiError | null {
  if (axios.isAxiosError<ApiError>(err) && err.response?.data?.code) {
    return err.response.data
  }
  return null
}
