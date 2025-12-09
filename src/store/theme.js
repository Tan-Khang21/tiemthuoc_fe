import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useThemeStore = defineStore('theme', () => {
  // Seasonal effects settings
  const seasonalEffects = ref({
    enabled: true,
    currentSeason: 'winter', // winter, spring, summer, autumn, none
    snowEffect: true,
    springPetals: false,
    summerBubbles: false,
    autumnLeaves: false
  })

  // Load settings from localStorage
  const loadSettings = () => {
    const saved = localStorage.getItem('themeSettings')
    if (saved) {
      seasonalEffects.value = JSON.parse(saved)
    }
  }

  // Save settings to localStorage
  const saveSettings = () => {
    localStorage.setItem('themeSettings', JSON.stringify(seasonalEffects.value))
  }

  // Toggle seasonal effects
  const toggleSeasonalEffects = (enabled) => {
    seasonalEffects.value.enabled = enabled
    saveSettings()
  }

  // Set current season
  const setSeason = (season) => {
    seasonalEffects.value.currentSeason = season
    
    // Reset all effects
    seasonalEffects.value.snowEffect = false
    seasonalEffects.value.springPetals = false
    seasonalEffects.value.summerBubbles = false
    seasonalEffects.value.autumnLeaves = false
    
    // Enable effect based on season
    switch (season) {
      case 'winter':
        seasonalEffects.value.snowEffect = true
        break
      case 'spring':
        seasonalEffects.value.springPetals = true
        break
      case 'summer':
        seasonalEffects.value.summerBubbles = true
        break
      case 'autumn':
        seasonalEffects.value.autumnLeaves = true
        break
      case 'none':
        // All effects already false
        break
    }
    
    saveSettings()
  }

  // Toggle specific effect
  const toggleEffect = (effectName, enabled) => {
    seasonalEffects.value[effectName] = enabled
    saveSettings()
  }

  // Initialize
  loadSettings()

  return {
    seasonalEffects,
    toggleSeasonalEffects,
    setSeason,
    toggleEffect,
    loadSettings,
    saveSettings
  }
})
