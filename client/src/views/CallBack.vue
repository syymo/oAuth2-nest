<script setup lang="ts">
import { onMounted } from 'vue'
import { useCookies } from '@vueuse/integrations/useCookies';

const getQueryObj = () => {
  const searchParams = new URLSearchParams(window.location.search)
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  return {
    code,
    state
  }
}

onMounted(() => {
  const query = getQueryObj()
  getAccessToken(query)
})

function getAccessToken(query: any) {

  const body = {
    'grant_type': 'authorization_code',
    'code': query.code,
  }

  var requestOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body),
  };

  fetch("http://localhost:7010/oauth2/token", requestOptions)
    .then(res => res.json())
    .then(result => {
      console.log('result', result)
      const { access_token, refresh_token, expires_at } = result
      const cookies = useCookies();
      cookies.set('access_token', access_token, { path: '/', expires_at: expires_at })
      cookies.set('refresh_token', refresh_token, { path: '/', expires_at: expires_at })
      window.location.href = 'http://localhost:5173/'
    })
    .catch(error => console.log('error', error));
}



</script>

<template>
  <a-config-provider :theme="{
    token: {
      colorPrimary: '#00b96b'
    }
  }">
    <a-layout style="min-width: 550px; height: 400px;">
      <a-layout-content class="layout-content">
        <a-spin tip="Auth Success, Get access_token...">
        </a-spin>
      </a-layout-content>
      <a-layout-footer style="text-align: center"> Ant Design Vue - Login Page </a-layout-footer>
    </a-layout>
  </a-config-provider>
</template>

<style scoped>
.layout-content {
  padding: 50px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
</style>
