import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './assets/tailwind.css'
// 完整導入 Element Plus
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

const app = createApp(App);
// 註冊 Element Plus
app.use(ElementPlus);
app.use(router);
app.mount('#app');
