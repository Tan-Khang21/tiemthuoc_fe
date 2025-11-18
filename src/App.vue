<template>
  <router-view></router-view>
</template>

<script setup>
import { onMounted } from 'vue';
import { useAuthStore, useCartStore } from '@/store';

const authStore = useAuthStore();
const cartStore = useCartStore();

onMounted(() => {
  authStore.initAuth();
  cartStore.initCart();
});
</script>

<style>
/* Global styles for auth pages */
body {
  margin: 0;
  padding: 0;
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
}

#app {
  min-height: 100vh;
}

/* Auth pages background */
.login-container,
.register-container {
  background: linear-gradient(135deg, #e8f5f7 0%, #d4eef2 100%);
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

/* Page container for user pages */
.page-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}
</style>
