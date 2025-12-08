<template>
  <router-view v-slot="{ Component, route }">
    <transition :name="getTransitionName(route)" mode="out-in">
      <component :is="Component" :key="route.path" />
    </transition>
  </router-view>
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

const getTransitionName = (route) => {
  // Áp dụng hiệu ứng slide cho các trang auth
  if (route.name === 'login' || route.name === 'register' || route.name === 'forgot-password') {
    return 'slide';
  }
  return 'fade';
};
</script>

<style>
/* Global styles for auth pages */
body {
  margin: 0;
  padding: 0;
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
  overflow-x: hidden;
}

#app {
  min-height: 100vh;
  overflow-x: hidden;
  position: relative;
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
  overflow: hidden;
  width: 100vw;
  max-width: 100%;
}

/* Page container for user pages */
.page-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

/* Slide transition for auth pages */
.slide-enter-active,
.slide-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: absolute;
  width: 100%;
  max-width: 100vw;
  left: 0;
  right: 0;
}

.slide-enter-from {
  opacity: 0;
  transform: translateX(15px);
}

.slide-leave-to {
  opacity: 0;
  transform: translateX(-15px);
}

/* Fade transition for other pages */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
