import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createI18n } from 'vue-i18n'
import Vant from 'vant'
import 'vant/lib/index.css'
import App from './App.vue'
import router from './router'
import { messages } from './locales'
import './assets/base.css'

const i18n = createI18n({
  legacy: false,
  locale: 'zh-CN',
  fallbackLocale: 'en-US',
  messages,
})

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(i18n)
app.use(Vant)

app.mount('#app')
