<template>
  <div class="theme-settings-page">
    <div class="page-header">
      <h1><i class="fas fa-palette"></i> Quản Lý Giao Diện</h1>
      <p>Tùy chỉnh hiệu ứng theo mùa và giao diện website</p>
    </div>

    <div class="settings-container">
      <!-- Master Toggle -->
      <el-card class="setting-card" shadow="hover">
        <template #header>
          <div class="card-header">
            <span><i class="fas fa-toggle-on"></i> Bật/Tắt Hiệu Ứng</span>
          </div>
        </template>
        <div class="setting-item">
          <div class="setting-info">
            <h3>Hiệu ứng theo mùa</h3>
            <p>Bật/tắt tất cả hiệu ứng trang trí theo mùa trên website</p>
          </div>
          <el-switch
            v-model="themeStore.seasonalEffects.enabled"
            size="large"
            active-text="Bật"
            inactive-text="Tắt"
            @change="handleToggleEffects"
          />
        </div>
      </el-card>

      <!-- Season Selection -->
      <el-card class="setting-card" shadow="hover" v-if="themeStore.seasonalEffects.enabled">
        <template #header>
          <div class="card-header">
            <span><i class="fas fa-calendar-alt"></i> Chọn Mùa</span>
          </div>
        </template>
        
        <div class="season-grid">
          <div 
            v-for="season in seasons" 
            :key="season.value"
            class="season-card"
            :class="{ active: themeStore.seasonalEffects.currentSeason === season.value }"
            @click="handleSetSeason(season.value)"
          >
            <div class="season-icon" :style="{ background: season.color }">
              <i :class="season.icon"></i>
            </div>
            <h3>{{ season.name }}</h3>
            <p>{{ season.description }}</p>
            <div class="season-badge" v-if="themeStore.seasonalEffects.currentSeason === season.value">
              <i class="fas fa-check-circle"></i> Đang áp dụng
            </div>
          </div>
        </div>
      </el-card>

      <!-- Effect Details -->
      <el-card class="setting-card" shadow="hover" v-if="themeStore.seasonalEffects.enabled">
        <template #header>
          <div class="card-header">
            <span><i class="fas fa-sparkles"></i> Chi Tiết Hiệu Ứng</span>
          </div>
        </template>

        <div class="effect-list">
          <div class="effect-item">
            <div class="effect-info">
              <i class="fas fa-snowflake effect-icon snow"></i>
              <div>
                <h4>Tuyết rơi</h4>
                <p>Hiệu ứng tuyết rơi cho mùa đông</p>
              </div>
            </div>
            <el-switch
              v-model="themeStore.seasonalEffects.snowEffect"
              @change="handleToggleSnow"
            />
          </div>

          <div class="effect-item">
            <div class="effect-info">
              <i class="fas fa-leaf effect-icon spring"></i>
              <div>
                <h4>Cánh hoa rơi</h4>
                <p>Hiệu ứng cánh hoa cho mùa xuân</p>
              </div>
            </div>
            <el-switch
              v-model="themeStore.seasonalEffects.springPetals"
              @change="handleToggleSpringPetals"
            />
          </div>

          <div class="effect-item">
            <div class="effect-info">
              <i class="fas fa-sun effect-icon summer"></i>
              <div>
                <h4>Bong bóng hè</h4>
                <p>Hiệu ứng bong bóng cho mùa hè</p>
              </div>
            </div>
            <el-switch
              v-model="themeStore.seasonalEffects.summerBubbles"
              @change="handleToggleSummerBubbles"
            />
          </div>

          <div class="effect-item">
            <div class="effect-info">
              <i class="fas fa-leaf effect-icon autumn"></i>
              <div>
                <h4>Lá vàng rơi</h4>
                <p>Hiệu ứng lá rơi cho mùa thu</p>
              </div>
            </div>
            <el-switch
              v-model="themeStore.seasonalEffects.autumnLeaves"
              @change="handleToggleAutumnLeaves"
            />
          </div>
        </div>
      </el-card>

      <!-- Preview -->
      <el-card class="setting-card preview-card" shadow="hover">
        <template #header>
          <div class="card-header">
            <span><i class="fas fa-eye"></i> Xem Trước</span>
          </div>
        </template>
        
        <div class="preview-area">
          <div class="preview-box">
            <SnowEffect v-if="themeStore.seasonalEffects.enabled && themeStore.seasonalEffects.snowEffect" />
            <SpringPetals v-if="themeStore.seasonalEffects.enabled && themeStore.seasonalEffects.springPetals" />
            <SummerBubbles v-if="themeStore.seasonalEffects.enabled && themeStore.seasonalEffects.summerBubbles" />
            <AutumnLeaves v-if="themeStore.seasonalEffects.enabled && themeStore.seasonalEffects.autumnLeaves" />
            <div class="preview-content">
              <i class="fas fa-store-alt preview-icon"></i>
              <h3>Nhà Thuốc MELON</h3>
              <p>Xem trước hiệu ứng đã chọn</p>
            </div>
          </div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { useThemeStore } from '@/store'
import SnowEffect from '@/components/SnowEffect.vue'
import SpringPetals from '@/components/SpringPetals.vue'
import SummerBubbles from '@/components/SummerBubbles.vue'
import AutumnLeaves from '@/components/AutumnLeaves.vue'

const themeStore = useThemeStore()

const seasons = [
  {
    value: 'winter',
    name: 'Mùa Đông',
    description: 'Tuyết rơi lãng mạn',
    icon: 'fas fa-snowflake',
    color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  },
  {
    value: 'spring',
    name: 'Mùa Xuân',
    description: 'Cánh hoa bay',
    icon: 'fas fa-seedling',
    color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
  },
  {
    value: 'summer',
    name: 'Mùa Hè',
    description: 'Tươi mát',
    icon: 'fas fa-sun',
    color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
  },
  {
    value: 'autumn',
    name: 'Mùa Thu',
    description: 'Lá vàng rơi',
    icon: 'fas fa-leaf',
    color: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
  },
  {
    value: 'none',
    name: 'Không có',
    description: 'Tắt hiệu ứng',
    icon: 'fas fa-ban',
    color: 'linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)'
  }
]

const handleToggleEffects = (enabled) => {
  themeStore.toggleSeasonalEffects(enabled)
  ElMessage.success(enabled ? 'Đã bật hiệu ứng theo mùa' : 'Đã tắt hiệu ứng theo mùa')
}

const handleSetSeason = (season) => {
  themeStore.setSeason(season)
  const selectedSeason = seasons.find(s => s.value === season)
  ElMessage.success(`Đã chuyển sang ${selectedSeason.name}`)
}

const handleToggleSnow = (enabled) => {
  themeStore.toggleEffect('snowEffect', enabled)
  ElMessage.success(enabled ? 'Đã bật hiệu ứng tuyết rơi' : 'Đã tắt hiệu ứng tuyết rơi')
}

const handleToggleSpringPetals = (enabled) => {
  themeStore.toggleEffect('springPetals', enabled)
  ElMessage.success(enabled ? 'Đã bật hiệu ứng cánh hoa' : 'Đã tắt hiệu ứng cánh hoa')
}

const handleToggleSummerBubbles = (enabled) => {
  themeStore.toggleEffect('summerBubbles', enabled)
  ElMessage.success(enabled ? 'Đã bật hiệu ứng bong bóng' : 'Đã tắt hiệu ứng bong bóng')
}

const handleToggleAutumnLeaves = (enabled) => {
  themeStore.toggleEffect('autumnLeaves', enabled)
  ElMessage.success(enabled ? 'Đã bật hiệu ứng lá rơi' : 'Đã tắt hiệu ứng lá rơi')
}
</script>

<style scoped>
.theme-settings-page {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 30px;
}

.page-header h1 {
  font-size: 28px;
  color: #2c3e50;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.page-header p {
  color: #7f8c8d;
  font-size: 15px;
}

.settings-container {
  display: grid;
  gap: 24px;
}

.setting-card {
  border-radius: 12px;
  overflow: hidden;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
}

.setting-info h3 {
  font-size: 16px;
  color: #2c3e50;
  margin: 0 0 6px 0;
}

.setting-info p {
  font-size: 14px;
  color: #7f8c8d;
  margin: 0;
}

/* Season Grid */
.season-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.season-card {
  padding: 24px;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

.season-card:hover {
  border-color: #0ecfe0;
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(14, 207, 224, 0.2);
}

.season-card.active {
  border-color: #0ecfe0;
  background: linear-gradient(135deg, rgba(14, 207, 224, 0.05) 0%, rgba(14, 207, 224, 0.1) 100%);
}

.season-icon {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
  font-size: 36px;
  color: white;
}

.season-card h3 {
  font-size: 18px;
  color: #2c3e50;
  margin: 0 0 8px 0;
}

.season-card p {
  font-size: 14px;
  color: #7f8c8d;
  margin: 0;
}

.season-badge {
  margin-top: 12px;
  padding: 6px 12px;
  background: #0ecfe0;
  color: white;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

/* Effect List */
.effect-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.effect-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
  gap: 12px;
}

.effect-info {
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 1;
}

.effect-icon {
  font-size: 32px;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.effect-icon.snow {
  color: #667eea;
  background: rgba(102, 126, 234, 0.1);
}

.effect-icon.spring {
  color: #f093fb;
  background: rgba(240, 147, 251, 0.1);
}

.effect-icon.summer {
  color: #4facfe;
  background: rgba(79, 172, 254, 0.1);
}

.effect-icon.autumn {
  color: #fa709a;
  background: rgba(250, 112, 154, 0.1);
}

.effect-info h4 {
  font-size: 16px;
  color: #2c3e50;
  margin: 0 0 4px 0;
}

.effect-info p {
  font-size: 14px;
  color: #7f8c8d;
  margin: 0;
}

/* Preview */
.preview-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.preview-card :deep(.el-card__header) {
  background: rgba(255, 255, 255, 0.95);
  border-bottom: none;
}

.preview-card :deep(.el-card__body) {
  background: transparent;
}

.preview-area {
  min-height: 300px;
}

.preview-box {
  position: relative;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 60px 40px;
  overflow: hidden;
  min-height: 300px;
}

.preview-content {
  position: relative;
  z-index: 2;
  text-align: center;
  color: white;
}

.preview-icon {
  font-size: 64px;
  margin-bottom: 20px;
  opacity: 0.9;
}

.preview-content h3 {
  font-size: 32px;
  margin: 0 0 12px 0;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}

.preview-content p {
  font-size: 16px;
  opacity: 0.9;
}

/* Responsive */
@media (max-width: 768px) {
  .season-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .effect-item {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
