<template>
  <div v-if="shouldShow" class="autumn-leaves">
    <div
      v-for="leaf in leaves"
      :key="leaf.id"
      class="leaf"
      :class="leaf.type"
      :style="leaf.style"
    >
      <div class="leaf-vein"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useThemeStore } from '@/store';

const themeStore = useThemeStore();

const shouldShow = computed(() => {
  return themeStore.seasonalEffects.enabled && 
         themeStore.seasonalEffects.autumnLeaves;
});

const leaves = ref([]);

const leafTypes = ['maple', 'oak', 'ginkgo'];

const createLeaf = (id) => {
  const size = Math.random() * 12 + 16; // 16-28px
  const left = Math.random() * 100; // 0-100%
  const animationDuration = Math.random() * 6 + 10; // 10-16s
  const animationDelay = Math.random() * 8; // 0-8s
  const swayDuration = Math.random() * 2 + 3; // 3-5s
  const rotation = Math.random() * 360; // Random initial rotation
  const type = leafTypes[Math.floor(Math.random() * leafTypes.length)];
  
  return {
    id,
    type,
    style: {
      left: `${left}%`,
      width: `${size}px`,
      height: `${size}px`,
      animationDuration: `${animationDuration}s, ${swayDuration}s`,
      animationDelay: `${animationDelay}s, ${animationDelay}s`,
      '--initial-rotation': `${rotation}deg`,
      opacity: Math.random() * 0.2 + 0.75, // 0.75-0.95
    }
  };
};

onMounted(() => {
  // Create 38 leaves
  for (let i = 0; i < 38; i++) {
    leaves.value.push(createLeaf(i));
  }
});
</script>

<style scoped>
.autumn-leaves {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 9999;
  overflow: hidden;
}

.leaf {
  position: absolute;
  top: -50px;
  animation: leafFall linear infinite, leafSpin ease-in-out infinite;
  transform-style: preserve-3d;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
}

.leaf-vein {
  width: 100%;
  height: 100%;
  position: relative;
}

.leaf-vein::after {
  content: '';
  position: absolute;
  width: 2px;
  height: 70%;
  background: rgba(139, 69, 19, 0.3);
  top: 15%;
  left: 50%;
  transform: translateX(-50%);
}

.leaf.maple {
  background: linear-gradient(135deg, #ff6b35 0%, #f7931e 50%, #c1440e 100%);
  clip-path: polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%);
}

.leaf.oak {
  background: linear-gradient(135deg, #d4a373 0%, #b8860b 50%, #8b6914 100%);
  clip-path: path('M 12 0 Q 16 2, 18 6 Q 20 10, 22 12 Q 20 14, 18 18 Q 16 22, 12 24 Q 8 22, 6 18 Q 4 14, 2 12 Q 4 10, 6 6 Q 8 2, 12 0');
  border-radius: 45% 55% 50% 50% / 55% 50% 50% 45%;
}

.leaf.ginkgo {
  background: linear-gradient(135deg, #ffd700 0%, #f4a460 50%, #daa520 100%);
  clip-path: polygon(50% 100%, 20% 40%, 15% 20%, 30% 10%, 50% 0%, 70% 10%, 85% 20%, 80% 40%);
}

@keyframes leafFall {
  0% {
    top: -50px;
  }
  100% {
    top: 100vh;
  }
}

@keyframes leafSpin {
  0% {
    transform: translateX(0) rotate(var(--initial-rotation)) rotateY(0deg);
  }
  25% {
    transform: translateX(35px) rotate(calc(var(--initial-rotation) + 90deg)) rotateY(90deg);
  }
  50% {
    transform: translateX(0) rotate(calc(var(--initial-rotation) + 180deg)) rotateY(180deg);
  }
  75% {
    transform: translateX(-35px) rotate(calc(var(--initial-rotation) + 270deg)) rotateY(270deg);
  }
  100% {
    transform: translateX(0) rotate(calc(var(--initial-rotation) + 360deg)) rotateY(360deg);
  }
}
</style>
