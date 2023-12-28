<script setup lang="ts">
import { onMounted, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useStorage } from '@vueuse/core'

interface FormState {
  username: string
  password: string
  remember: boolean
}
const props = defineProps<{
  title?: string
}>()

const emit = defineEmits(['submit'])
const router = useRouter()

const localFormState = useStorage('formState', {
  username: '',
  password: '',
  remember: true
})


onMounted(() => {
  // console.log('localFormState', localFormState.value)
  if (localFormState.value) {
    formState.username = localFormState.value.username
    formState.password = localFormState.value.password
    formState.remember = localFormState.value.remember
  }
})

const formState = reactive<FormState>({
  username: '',
  password: '',
  remember: true
})

const onFinish = (values: any) => {
  if (values.remember) {
    localFormState.value = values
  } else {
    localFormState.value = null
  }
  login()
}

const onFinishFailed = (errorInfo: any) => {
  console.log('Failed:', errorInfo)
}

const login = () => {
  const currentRouteQuery = router.currentRoute.value.query
  // console.log('login', formState.username, formState.password)
  const client_id = 'your-client-id'
  const redirect_uri = currentRouteQuery.redirect_uri as string;
  const scope = 'read'
  const state = 'test'
  const query = new URLSearchParams({
    response_type: 'code',
    client_id,
    redirect_uri,
    scope,
    state,
    username: formState.username,
    password: formState.password
  })
  const userString = query.toString()
  const url = 'http://localhost:7010/oauth2/authorize' + '?' + userString
  fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  })
    .then((res) => res.json())
    .then((data) => {
      emit('submit', data)
      // console.log('data', data)
    })
}
</script>

<template>
  <a-card :title="props.title || 'Login'" style="width: 450px">
    <a-form
      :model="formState"
      name="basic"
      :label-col="{ span: 8 }"
      :wrapper-col="{ span: 16 }"
      autocomplete="off"
      @finish="onFinish"
      @finishFailed="onFinishFailed"
    >
      <a-form-item
        label="Username"
        name="username"
        :rules="[{ required: true, message: 'Please input your username!' }]"
      >
        <a-input v-model:value="formState.username" />
      </a-form-item>

      <a-form-item
        label="Password"
        name="password"
        :rules="[{ required: true, message: 'Please input your password!' }]"
      >
        <a-input-password v-model:value="formState.password" />
      </a-form-item>

      <a-form-item name="remember" :wrapper-col="{ offset: 8, span: 16 }">
        <a-checkbox v-model:checked="formState.remember">Remember me</a-checkbox>
      </a-form-item>

      <a-form-item :wrapper-col="{ offset: 8, span: 16 }">
        <a-button type="primary" html-type="submit">Submit</a-button>
      </a-form-item>
    </a-form>
  </a-card>
</template>

<style></style>
