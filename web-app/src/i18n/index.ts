import { createI18n } from 'vue-i18n'
import en from './en'
import uk from './uk'

const LOCALE_KEY = 'wizallet.locale'

export type AppLocale = 'en' | 'uk'

function detectLocale(): AppLocale {
  const stored = localStorage.getItem(LOCALE_KEY) as AppLocale | null
  if (stored === 'en' || stored === 'uk') return stored
  const browser = navigator.language?.toLowerCase() ?? ''
  return browser.startsWith('uk') ? 'uk' : 'en'
}

export const i18n = createI18n({
  legacy: false,
  locale: detectLocale(),
  fallbackLocale: 'en',
  messages: { en, uk },
})

export function setLocale(locale: AppLocale) {
  i18n.global.locale.value = locale
  localStorage.setItem(LOCALE_KEY, locale)
}

import { asApiError } from '@/api/client'

// Map an API error to a localised user-facing message. Falls back to a generic
// copy if the code is unknown, and to a network message if there was no response.
export function errorMessage(err: unknown): string {
  const apiErr = asApiError(err)
  const t = i18n.global.t
  if (apiErr) {
    const key = `errors.${apiErr.code}`
    return i18n.global.te(key) ? t(key) : t('errors.generic')
  }
  if (err && typeof err === 'object' && 'message' in err && (err as { message?: string }).message === 'Network Error') {
    return t('errors.network')
  }
  return t('errors.generic')
}
