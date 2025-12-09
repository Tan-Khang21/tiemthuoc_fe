<template>
  <div v-if="shouldShow" class="summer-effect">
    <div
      v-for="bubble in bubbles"
      :key="bubble.id"
      class="bubble"
      :style="bubble.style"
    ></div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useThemeStore } from '@/store';

const themeStore = useThemeStore();

const shouldShow = computed(() => {
  return themeStore.seasonalEffects.enabled && 
         themeStore.seasonalEffects.summerBubbles;
});

const bubbles = ref([]);

const createBubble = (id) => {
  const size = Math.random() * 40 + 20; // 20-60px
  const left = Math.random() * 100; // 0-100%
  const animationDuration = Math.random() * 10 + 15; // 15-25s
  const animationDelay = Math.random() * 8; // 0-8s
  const floatDuration = Math.random() * 3 + 3; // 3-6s
  
  return {
    id,
    style: {
      left: `${left}%`,
      width: `${size}px`,
      height: `${size}px`,
      animationDuration: `${animationDuration}s, ${floatDuration}s`,
      animationDelay: `${animationDelay}s, ${animationDelay}s`,
      opacity: Math.random() * 0.3 + 0.4, // 0.4-0.7
    }
  };
};

onMounted(() => {
  // Create 30 bubbles
  for (let i = 0; i < 30; i++) {
    bubbles.value.push(createBubble(i));
  }
});
</script>

<style scoped>
.summer-effect {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 9999;
  overflow: hidden;
}

.bubble {
  position: absolute;
  bottom: -100px;
  border-radius: 50%;
  background: radial-gradient(circle at 30% 30%, 
    rgba(255, 255, 255, 0.8) 0%, 
    rgba(135, 206, 250, 0.6) 30%, 
    rgba(30, 144, 255, 0.3) 100%);
  box-shadow: 
    inset 0 0 20px rgba(255, 255, 255, 0.5),
    0 0 20px rgba(135, 206, 250, 0.3);
  animation: rise linear infinite, drift ease-in-out infinite;
}

@keyframes rise {
  0% {
    bottom: -100px;
  }
  100% {
    bottom: 110vh;
  }
}

@keyframes drift {
  0%, 100% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(-30px);
  }
  75% {
    transform: translateX(30px);
  }
}
</style>
