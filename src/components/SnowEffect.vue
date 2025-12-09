<template>
  <div v-if="themeStore.seasonalEffects.enabled && themeStore.seasonalEffects.snowEffect" class="snow-container">
    <div 
      v-for="(snowflake, index) in snowflakes" 
      :key="index"
      class="snowflake"
      :style="snowflake.style"
    >
      {{ snowflake.char }}
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useThemeStore } from '@/store'

const themeStore = useThemeStore()
const snowflakes = ref([])

const createSnowflake = (index) => {
  const chars = ['❄', '❅', '❆', '✻', '✼', '❉']
  const randomChar = chars[Math.floor(Math.random() * chars.length)]
  
  // Random size
  const size = Math.random() * 15 + 10 // 10-25px
  
  // Random horizontal position
  const left = Math.random() * 100
  
  // Random animation duration (slower = more realistic)
  const duration = Math.random() * 10 + 15 // 15-25 seconds
  
  // Random delay
  const delay = Math.random() * 10
  
  // Random horizontal drift
  const drift = (Math.random() - 0.5) * 100 // -50 to 50px
  
  // Random opacity
  const opacity = Math.random() * 0.6 + 0.4 // 0.4-1
  
  return {
    char: randomChar,
    style: {
      left: `${left}%`,
      fontSize: `${size}px`,
      animationDuration: `${duration}s`,
      animationDelay: `${delay}s`,
      '--drift': `${drift}px`,
      opacity: opacity,
      filter: `blur(${Math.random() * 2}px)`
    }
  }
}

onMounted(() => {
  // Create 50 snowflakes
  const count = 50
  for (let i = 0; i < count; i++) {
    snowflakes.value.push(createSnowflake(i))
  }
})
</script>

<style scoped>
.snow-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 9999;
  overflow: hidden;
}

.snowflake {
  position: absolute;
  top: -50px;
  color: #fff;
  text-shadow: 0 0 5px rgba(255, 255, 255, 0.8);
  animation: fall linear infinite;
  user-select: none;
}

@keyframes fall {
  0% {
    transform: translateY(-50px) translateX(0);
  }
  100% {
    transform: translateY(100vh) translateX(var(--drift));
  }
}

/* Alternative snowflake using CSS */
.snowflake::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 100%;
  height: 100%;
  transform: translate(-50%, -50%);
}
</style>
