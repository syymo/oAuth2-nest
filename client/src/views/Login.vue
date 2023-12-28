<script setup lang="ts">
import TheLogin from '../components/TheLogin.vue'

const submitCallback = (values: any) => {
  const url = new URL(values.url)
  window.location.href = url.href;
}

</script>

<template>
  <a-config-provider
    :theme="{
      token: {
        colorPrimary: '#00b96b'
      }
    }"
  >
    <a-layout style="min-width: 550px">
      <a-layout-content class="layout-content">
        <TheLogin @submit="submitCallback" />
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
