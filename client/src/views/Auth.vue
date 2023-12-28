<script setup lang="ts">
import Cookies from 'universal-cookie';
const cookies = new Cookies();
import TheLogin from '../components/TheLogin.vue';
import { Html5Outlined, UserOutlined } from '@ant-design/icons-vue';
import { ref } from 'vue';
const isLogin = ref(false);

const authLogin = () => {
  cookies.remove('access_token', { path: '/' });
  const authWin = window.open('http://localhost:5173/login?redirect_uri=http://localhost:5173/auth-login/callback&client_id=client123&response_type=code&scope=read&state=test', "_blank", "toolbar=yes, location=yes, directories=no, status=no, menubar=yes, scrollbars=yes, resizable=no, copyhistory=yes, width=630, height=580");
  // // const authWin = window.open('http://localhost:5173/login?redirect_uri=http://localhost:5173/auth-login/callback&client_id=client123&response_type=code&scope=read&state=test', "_target");
  const timerId = setInterval(function () {
    const accessToken = cookies.get('access_token');
    if (accessToken) {
      clearInterval(timerId)
      authWin?.close()
      // window.location.reload()
      isLogin.value = true;
    }
    if (authWin?.closed) {
      clearInterval(timerId)
    }
  }, 500)

};

const authLogout = () => {
  cookies.remove('access_token', { path: '/' });
  isLogin.value = false;
};
</script>

<template>
  <a-layout style="min-width: 600px;">
    <a-layout-content v-if="!isLogin" class="layout-content">
      <TheLogin />
      <Html5Outlined @click="authLogin" style="fontSize: 40px; color: #5d5c58" />
    </a-layout-content>
    <a-layout-content v-if="isLogin" class="layout-content">
      <a-avatar shape="square" :size="64">
        <template #icon><UserOutlined /></template>
      </a-avatar>
      <span>Auth</span>
      <div style="margin-top: 20px;"></div>
      <a-button type="primary" @click="authLogout">Login Out</a-button>
    </a-layout-content>
    <a-layout-footer style="text-align: center">
      {{ isLogin ? 'Auth Login Success' : 'Ant Design Vue - Auth Login Page'  }}
      
    </a-layout-footer>
  </a-layout>
</template>

<style scoped>
.layout-content {
  padding: 50px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-width: 600px;
}
</style>