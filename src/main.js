import { createApp } from 'vue';
import { createPinia } from 'pinia';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import App from './App.vue';
import router from './router';
import './style.css';

// Import Medion CSS
import './assets/css/bootstrap.min.css';
import './assets/css/all-fontawesome.min.css';
import './assets/css/animate.min.css';
import './assets/css/magnific-popup.min.css';
import './assets/css/owl.carousel.min.css';
import './assets/css/jquery-ui.min.css';
import './assets/css/nice-select.min.css';
import './assets/css/style.css';
import './assets/css/overrides.css'; // Import last to fix layout issues

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);
app.use(ElementPlus);

// Initialize auth state from localStorage before mounting
import { useAuthStore } from '@/store/auth';
const authStore = useAuthStore();
authStore.initAuth();

app.mount('#app');
