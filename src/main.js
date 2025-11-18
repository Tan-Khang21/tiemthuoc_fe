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

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);
app.use(ElementPlus);

app.mount('#app');
