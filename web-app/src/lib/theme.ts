import { ref } from 'vue'

export type Theme = 'light' | 'dark'

const STORAGE_KEY = 'wizallet.theme'
const DARK_CLASS = 'dark'

function detect(): Theme {
  const stored = localStorage.getItem(STORAGE_KEY) as Theme | null
  if (stored === 'light' || stored === 'dark') return stored
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function apply(theme: Theme) {
  document.documentElement.classList.toggle(DARK_CLASS, theme === 'dark')
}

// Lazily initialised so the toggle and the boot helper share one ref.
let active: ReturnType<typeof ref<Theme>> | null = null

export function useTheme() {
  if (!active) {
    active = ref<Theme>(detect())
    apply(active.value!)
  }
  function setTheme(next: Theme) {
    active!.value = next
    localStorage.setItem(STORAGE_KEY, next)
    apply(next)
  }
  function toggle() {
    setTheme(active!.value === 'dark' ? 'light' : 'dark')
  }
  return { theme: active, setTheme, toggle }
}

// Call once before mount() to avoid a flash of the wrong theme.
export function initTheme() {
  useTheme()
}
