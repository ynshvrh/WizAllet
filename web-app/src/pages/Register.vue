<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
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
const { t } = useI18n()

const username = ref('')
const email = ref('')
const password = ref('')
const initialBalance = ref('0')
const submitting = ref(false)
const error = ref<string | null>(null)

async function onSubmit() {
  error.value = null
  submitting.value = true
  try {
    await auth.register({
      username: username.value.trim(),
      email: email.value.trim(),
      password: password.value,
      initial_balance: initialBalance.value || '0',
    })
    router.replace('/')
  } catch (err) {
    error.value = errorMessage(err)
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center px-4 py-10 bg-muted/30">
    <Card class="w-full max-w-md p-8 space-y-6">
      <div class="space-y-2 text-center">
        <h1 class="text-2xl font-semibold">{{ t('auth.registerTitle') }}</h1>
        <p class="text-sm text-muted-foreground">{{ t('auth.registerSubtitle') }}</p>
      </div>

      <Alert v-if="error" variant="destructive">{{ error }}</Alert>

      <form class="space-y-4" @submit.prevent="onSubmit">
        <div class="space-y-2">
          <Label for="username">{{ t('auth.fields.username') }}</Label>
          <Input id="username" v-model="username" autocomplete="username" :disabled="submitting" />
        </div>
        <div class="space-y-2">
          <Label for="email">{{ t('auth.fields.email') }}</Label>
          <Input id="email" v-model="email" type="email" autocomplete="email" :disabled="submitting" />
        </div>
        <div class="space-y-2">
          <Label for="password">{{ t('auth.fields.password') }}</Label>
          <Input id="password" v-model="password" type="password" autocomplete="new-password" :disabled="submitting" />
        </div>
        <div class="space-y-2">
          <Label for="initial">{{ t('auth.fields.initialBalance') }}</Label>
          <Input id="initial" v-model="initialBalance" type="number" step="0.01" min="0" :disabled="submitting" />
        </div>
        <Button type="submit" :loading="submitting" class="w-full">
          {{ t('auth.actions.signUp') }}
        </Button>
      </form>

      <div class="text-sm text-center text-muted-foreground">
        {{ t('auth.actions.hasAccount') }}
        <RouterLink to="/login" class="text-primary font-medium hover:underline">
          {{ t('auth.actions.signInLink') }}
        </RouterLink>
      </div>
    </Card>
  </div>
</template>
