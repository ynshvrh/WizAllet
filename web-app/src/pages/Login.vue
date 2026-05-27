<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'
import { errorMessage } from '@/i18n'
import Card from '@/components/ui/Card.vue'
import Input from '@/components/ui/Input.vue'
import Label from '@/components/ui/Label.vue'
import Button from '@/components/ui/Button.vue'
import Alert from '@/components/ui/Alert.vue'

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()
const { t } = useI18n()

const login = ref('')
const password = ref('')
const submitting = ref(false)
const error = ref<string | null>(null)

async function onSubmit() {
  error.value = null
  submitting.value = true
  try {
    await auth.login({ login: login.value, password: password.value })
    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/'
    router.replace(redirect)
  } catch (err) {
    error.value = errorMessage(err)
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center px-4 bg-accent/40">
    <Card class="w-full max-w-md p-8 space-y-6">
      <div class="space-y-2 text-center">
        <h1 class="text-2xl font-semibold">{{ t('auth.loginTitle') }}</h1>
        <p class="text-sm text-muted-foreground">{{ t('auth.loginSubtitle') }}</p>
      </div>

      <Alert v-if="error" variant="destructive">{{ error }}</Alert>

      <form class="space-y-4" @submit.prevent="onSubmit">
        <div class="space-y-2">
          <Label for="login">{{ t('auth.fields.login') }}</Label>
          <Input id="login" v-model="login" autocomplete="username" :disabled="submitting" />
        </div>
        <div class="space-y-2">
          <Label for="password">{{ t('auth.fields.password') }}</Label>
          <Input id="password" v-model="password" type="password" autocomplete="current-password" :disabled="submitting" />
        </div>
        <Button type="submit" :loading="submitting" class="w-full">
          {{ t('auth.actions.signIn') }}
        </Button>
      </form>

      <div class="text-sm text-center text-muted-foreground">
        {{ t('auth.actions.noAccount') }}
        <RouterLink to="/register" class="text-primary font-medium hover:underline">
          {{ t('auth.actions.signUpLink') }}
        </RouterLink>
      </div>
    </Card>
  </div>
</template>
