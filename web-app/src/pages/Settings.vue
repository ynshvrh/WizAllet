<script setup lang="ts">
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { useMe } from '@/api/queries'
import { changePassword, updateProfile } from '@/api/endpoints'
import { useAuthStore } from '@/stores/auth'
import { errorMessage } from '@/i18n'
import Card from '@/components/ui/Card.vue'
import Input from '@/components/ui/Input.vue'
import Label from '@/components/ui/Label.vue'
import Button from '@/components/ui/Button.vue'
import Alert from '@/components/ui/Alert.vue'

const { t } = useI18n()
const auth = useAuthStore()
const me = useMe()
const qc = useQueryClient()

const username = ref('')
const email = ref('')
const profileError = ref<string | null>(null)
const profileSuccess = ref(false)

watch(me.data, (u) => {
  if (u) {
    username.value = u.username
    email.value = u.email
  }
}, { immediate: true })

const profileMutation = useMutation({
  mutationFn: updateProfile,
  onSuccess: (user) => {
    auth.setUser(user)
    qc.setQueryData(['me'], user)
    profileSuccess.value = true
  },
  onError: (err) => {
    profileError.value = errorMessage(err)
  },
})

async function saveProfile() {
  profileError.value = null
  profileSuccess.value = false
  await profileMutation.mutateAsync({ username: username.value.trim(), email: email.value.trim() })
}

const currentPassword = ref('')
const newPassword = ref('')
const passwordError = ref<string | null>(null)
const passwordSuccess = ref(false)

const passwordMutation = useMutation({
  mutationFn: changePassword,
  onSuccess: () => {
    passwordSuccess.value = true
    currentPassword.value = ''
    newPassword.value = ''
  },
  onError: (err) => {
    passwordError.value = errorMessage(err)
  },
})

async function savePassword() {
  passwordError.value = null
  passwordSuccess.value = false
  await passwordMutation.mutateAsync({
    current_password: currentPassword.value,
    new_password: newPassword.value,
  })
}
</script>

<template>
  <div class="space-y-6">
    <h1 class="text-2xl font-semibold">{{ t('settings.title') }}</h1>

    <Card class="p-6 space-y-4">
      <h2 class="text-lg font-medium">{{ t('settings.profile') }}</h2>
      <Alert v-if="profileError" variant="destructive">{{ profileError }}</Alert>
      <Alert v-if="profileSuccess" variant="success">{{ t('settings.profileSaved') }}</Alert>
      <form class="space-y-4" @submit.prevent="saveProfile">
        <div class="space-y-2">
          <Label for="p-username">{{ t('auth.fields.username') }}</Label>
          <Input id="p-username" v-model="username" :disabled="profileMutation.isPending.value" />
        </div>
        <div class="space-y-2">
          <Label for="p-email">{{ t('auth.fields.email') }}</Label>
          <Input id="p-email" v-model="email" type="email" :disabled="profileMutation.isPending.value" />
        </div>
        <Button type="submit" :loading="profileMutation.isPending.value">
          {{ t('settings.save') }}
        </Button>
      </form>
    </Card>

    <Card class="p-6 space-y-4">
      <h2 class="text-lg font-medium">{{ t('settings.changePassword') }}</h2>
      <Alert v-if="passwordError" variant="destructive">{{ passwordError }}</Alert>
      <Alert v-if="passwordSuccess" variant="success">{{ t('settings.passwordSaved') }}</Alert>
      <form class="space-y-4" @submit.prevent="savePassword">
        <div class="space-y-2">
          <Label for="cp">{{ t('auth.fields.currentPassword') }}</Label>
          <Input id="cp" v-model="currentPassword" type="password" autocomplete="current-password" :disabled="passwordMutation.isPending.value" />
        </div>
        <div class="space-y-2">
          <Label for="np">{{ t('auth.fields.newPassword') }}</Label>
          <Input id="np" v-model="newPassword" type="password" autocomplete="new-password" :disabled="passwordMutation.isPending.value" />
        </div>
        <Button type="submit" :loading="passwordMutation.isPending.value">
          {{ t('settings.save') }}
        </Button>
      </form>
    </Card>
  </div>
</template>
