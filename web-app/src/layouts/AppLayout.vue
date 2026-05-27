<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'
import { setLocale, type AppLocale } from '@/i18n'
import { useTheme } from '@/lib/theme'
import Button from '@/components/ui/Button.vue'
import { LogOut, Languages, Sun, Moon } from 'lucide-vue-next'

const auth = useAuthStore()
const router = useRouter()
const { t, locale } = useI18n()
const { theme, toggle: toggleTheme } = useTheme()

async function onLogout() {
  await auth.logout()
  router.replace({ name: 'login' })
}

function toggleLocale() {
  const next: AppLocale = locale.value === 'uk' ? 'en' : 'uk'
  setLocale(next)
}
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <header class="border-b bg-background">
      <div class="mx-auto max-w-5xl px-4 h-14 flex items-center justify-between">
        <RouterLink to="/" class="font-semibold text-lg text-primary">{{ t('app.name') }}</RouterLink>
        <nav class="hidden md:flex items-center gap-1">
          <RouterLink
            v-for="link in [
              { to: '/', label: t('nav.dashboard') },
              { to: '/history', label: t('nav.history') },
              { to: '/settings', label: t('nav.settings') },
            ]"
            :key="link.to"
            :to="link.to"
            class="px-3 py-2 text-sm rounded-md hover:bg-accent"
            active-class="bg-accent"
          >
            {{ link.label }}
          </RouterLink>
        </nav>
        <div class="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            :aria-label="theme === 'dark' ? t('theme.switchToLight') : t('theme.switchToDark')"
            @click="toggleTheme"
          >
            <Sun v-if="theme === 'dark'" class="size-4" />
            <Moon v-else class="size-4" />
          </Button>
          <Button variant="ghost" size="sm" @click="toggleLocale">
            <Languages class="size-4" />
            <span class="uppercase">{{ locale }}</span>
          </Button>
          <Button variant="ghost" size="sm" @click="onLogout">
            <LogOut class="size-4" />
            <span class="hidden sm:inline">{{ t('nav.logout') }}</span>
          </Button>
        </div>
      </div>
    </header>

    <nav class="md:hidden border-b bg-background">
      <div class="mx-auto max-w-5xl px-4 flex">
        <RouterLink
          v-for="link in [
            { to: '/', label: t('nav.dashboard') },
            { to: '/history', label: t('nav.history') },
            { to: '/settings', label: t('nav.settings') },
          ]"
          :key="link.to"
          :to="link.to"
          class="flex-1 text-center py-3 text-sm border-b-2 border-transparent"
          active-class="border-primary text-primary"
        >
          {{ link.label }}
        </RouterLink>
      </div>
    </nav>

    <main class="flex-1 mx-auto w-full max-w-5xl px-4 py-6">
      <RouterView />
    </main>
  </div>
</template>
