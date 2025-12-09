<template>
  <div v-if="shouldShow" class="spring-petals">
    <div
      v-for="petal in petals"
      :key="petal.id"
      class="petal"
      :style="petal.style"
    >
      <div class="petal-inner"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useThemeStore } from '@/store';

const themeStore = useThemeStore();

const shouldShow = computed(() => {
  return themeStore.seasonalEffects.enabled && 
         themeStore.seasonalEffects.springPetals;
});

const petals = ref([]);

const createPetal = (id) => {
  const size = Math.random() * 8 + 12; // 12-20px
  const left = Math.random() * 100; // 0-100%
  const animationDuration = Math.random() * 8 + 12; // 12-20s
  const animationDelay = Math.random() * 8; // 0-8s
  const swayDuration = Math.random() * 2 + 3; // 3-5s
  const rotation = Math.random() * 360; // Random initial rotation
  const colorVariant = Math.floor(Math.random() * 3); // 3 color variants
  
  const colors = [
    'linear-gradient(135deg, #ffc1e3 0%, #ffb3d9 50%, #ffa6d5 100%)',
    'linear-gradient(135deg, #ffe3f0 0%, #ffd4e5 50%, #ffc5da 100%)',
    'linear-gradient(135deg, #ffd9ec 0%, #ffcce2 50%, #ffbfd8 100%)'
  ];
  
  return {
    id,
    style: {
      left: `${left}%`,
      width: `${size}px`,
      height: `${size}px`,
      animationDuration: `${animationDuration}s, ${swayDuration}s`,
      animationDelay: `${animationDelay}s, ${animationDelay}s`,
      '--petal-color': colors[colorVariant],
      '--initial-rotation': `${rotation}deg`,
      opacity: Math.random() * 0.2 + 0.7, // 0.7-0.9
    }
  };
};

onMounted(() => {
  // Create 35 petals
  for (let i = 0; i < 35; i++) {
    petals.value.push(createPetal(i));
  }
});
</script>

<style scoped>
.spring-petals {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 9999;
  overflow: hidden;
}

.petal {
  position: absolute;
  top: -50px;
  animation: petalFall linear infinite, petalSway ease-in-out infinite;
  transform-style: preserve-3d;
}

.petal-inner {
  width: 100%;
  height: 100%;
  background: var(--petal-color);
  border-radius: 100% 0% 100% 0%;
  box-shadow: 
    inset 2px 2px 4px rgba(255, 255, 255, 0.5),
    0 2px 8px rgba(255, 182, 193, 0.3);
  position: relative;
}

.petal-inner::before {
  content: '';
  position: absolute;
  width: 50%;
  height: 50%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.4) 0%, transparent 70%);
  top: 10%;
  left: 10%;
  border-radius: 50%;
}

@keyframes petalFall {
  0% {
    top: -50px;
    transform: rotate(var(--initial-rotation)) rotateX(0deg);
  }
  100% {
    top: 100vh;
    transform: rotate(calc(var(--initial-rotation) + 360deg)) rotateX(360deg);
  }
}

@keyframes petalSway {
  0%, 100% {
    transform: translateX(0) translateY(0);
  }
  25% {
    transform: translateX(25px) translateY(-10px);
  }
  50% {
    transform: translateX(0) translateY(0);
  }
  75% {
    transform: translateX(-25px) translateY(-10px);
  }
}
</style>
