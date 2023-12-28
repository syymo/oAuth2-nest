import './assets/main.css'
import { Layout, Button, message, Menu, Input, Form, Card, Checkbox, ConfigProvider, Spin, Avatar, Space } from 'ant-design-vue';
import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.use(Layout)
app.use(Button)
app.use(Menu)
app.use(Input)
app.use(Form)
app.use(Card)
app.use(Checkbox)
app.use(ConfigProvider)
app.use(Spin)
app.use(Avatar)

app.mount('#app')

app.config.globalProperties.$message = message;