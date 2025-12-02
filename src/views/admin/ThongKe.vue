<template>
  
    <!-- Header Section -->
    <div class="stats-header">
      <div class="header-content">
        <div>
          <h1 class="header-title">
            <i class="fas fa-chart-line"></i> Thống Kê Doanh Thu & Chi Phí
          </h1>
        </div>
      </div>

      <!-- Filters Section -->
      <div class="filters-section">
        <div class="filter-group">
          <label class="filter-label">Năm</label>
          <el-select v-model="selectedYear" placeholder="Chọn năm" @change="fetchData" class="filter-select">
            <el-option
              v-for="year in years"
              :key="year"
              :label="year"
              :value="year"
            />
          </el-select>
        </div>
        
        <div class="filter-group">
          <label class="filter-label">Chế độ xem</label>
          <el-radio-group v-model="viewMode" @change="fetchData" class="filter-radio">
            <el-radio-button label="year">Theo Năm</el-radio-button>
            <el-radio-button label="month">Theo Tháng</el-radio-button>
          </el-radio-group>
        </div>

        <div class="filter-group" v-if="viewMode === 'month'">
          <label class="filter-label">Tháng</label>
          <el-select v-model="selectedMonth" placeholder="Chọn tháng" @change="fetchData" class="filter-select">
            <el-option
              v-for="month in 12"
              :key="month"
              :label="'Tháng ' + month"
              :value="month"
            />
          </el-select>
        </div>

        <div class="filter-group">
          <el-button type="primary" @click="fetchData" class="refresh-btn">
            <i class="fas fa-sync-alt"></i> Làm mới
          </el-button>
        </div>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="stats-cards">
      <div class="stat-card revenue-card">
        <div class="card-icon">
          <i class="fas fa-coins"></i>
        </div>
        <div class="card-content">
          <p class="card-label">Tổng Doanh Thu</p>
          <p class="card-value">{{ formatCurrency(totalRevenue) }}</p>
        </div>
        <div class="card-bg-icon">
          <i class="fas fa-coins"></i>
        </div>
      </div>

      <div class="stat-card import-card">
        <div class="card-icon">
          <i class="fas fa-box"></i>
        </div>
        <div class="card-content">
          <p class="card-label">Tổng Tiền Nhập</p>
          <p class="card-value">{{ formatCurrency(totalImport) }}</p>
        </div>
        <div class="card-bg-icon">
          <i class="fas fa-box"></i>
        </div>
      </div>

      <div class="stat-card cancel-card">
        <div class="card-icon">
          <i class="fas fa-trash-alt"></i>
        </div>
        <div class="card-content">
          <p class="card-label">Tổng Tiền Huỷ</p>
          <p class="card-value">{{ formatCurrency(totalCancel) }}</p>
        </div>
        <div class="card-bg-icon">
          <i class="fas fa-trash-alt"></i>
        </div>
      </div>

      <div class="stat-card profit-card">
        <div class="card-icon">
          <i class="fas fa-chart-pie"></i>
        </div>
        <div class="card-content">
          <p class="card-label">Lợi Nhuận Ước Tính</p>
          <p class="card-value">{{ formatCurrency(totalRevenue - totalImport) }}</p>
        </div>
        <div class="card-bg-icon">
          <i class="fas fa-chart-pie"></i>
        </div>
      </div>
    </div>

    <!-- Chart Section -->
    <div class="chart-section">
      <div class="chart-header">
        <h2 class="chart-title">
          <i class="fas fa-bar-chart"></i> Biểu Đồ So Sánh
        </h2>
        <p class="chart-subtitle">Doanh thu, nhập hàng và tiền huỷ theo {{ viewMode === 'year' ? 'tháng' : 'ngày' }}</p>
      </div>
      <div class="chart-container">
        <div v-if="loaded" class="chart-wrapper">
          <Bar :data="chartData" :options="chartOptions" />
        </div>
        <div v-else class="loading-placeholder">
          <i class="fas fa-spinner fa-spin"></i> Đang tải dữ liệu...
        </div>
      </div>
    </div>

</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale
} from 'chart.js';
import { Bar } from 'vue-chartjs';
import ThongKeService from '@/services/ThongKeService';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const selectedYear = ref(new Date().getFullYear());
const selectedMonth = ref(new Date().getMonth() + 1);
const viewMode = ref('year'); // 'year' or 'month'
const loaded = ref(false);
const years = computed(() => {
  const currentYear = new Date().getFullYear();
  return Array.from({ length: 5 }, (_, i) => currentYear - i);
});

const chartData = ref({
  labels: [],
  datasets: []
});

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top',
    },
    title: {
      display: true,
      text: 'Biểu đồ Thống Kê'
    }
  }
};

const totalRevenue = ref(0);
const totalImport = ref(0);
const totalCancel = ref(0);

const formatCurrency = (value) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
};

const fetchData = async () => {
  loaded.value = false;
  try {
    let response;
    if (viewMode.value === 'year') {
      response = await ThongKeService.getThongKeNam(selectedYear.value);
    } else {
      response = await ThongKeService.getThongKeThang(selectedMonth.value, selectedYear.value);
    }

    const data = response.data;

    // Update totals
    totalRevenue.value = data.doanhThu.reduce((sum, item) => sum + item.value, 0);
    totalImport.value = data.tienNhapHang.reduce((sum, item) => sum + item.value, 0);
    totalCancel.value = data.tienHuyHang.reduce((sum, item) => sum + item.value, 0);

    // Update chart
    chartData.value = {
      labels: data.doanhThu.map(item => item.label),
      datasets: [
        {
          label: 'Doanh Thu',
          backgroundColor: '#10B981', // Green
          data: data.doanhThu.map(item => item.value)
        },
        {
          label: 'Tiền Nhập',
          backgroundColor: '#3B82F6', // Blue
          data: data.tienNhapHang.map(item => item.value)
        },
        {
          label: 'Tiền Huỷ',
          backgroundColor: '#EF4444', // Red
          data: data.tienHuyHang.map(item => item.value)
        }
      ]
    };

    loaded.value = true;
  } catch (error) {
    console.error('Error fetching statistics:', error);
  }
};

onMounted(() => {
  fetchData();
});
</script>

<style scoped>


.stats-header {
  background: white;
  border-radius: 15px;
  padding: 40px;
  margin-bottom: 30px;
  box-shadow: 0 10px 35px rgba(0, 0, 0, 0.08);
}

.header-content {
  margin-bottom: 30px;
}

.header-title {
  font-size: 32px;
  font-weight: 700;
  color: #0d3d47;
  margin: 0 0 10px 0;
  display: flex;
  align-items: center;
  gap: 15px;
}

.header-title i {
  color: #17a2b8;
  font-size: 36px;
}

.header-subtitle {
  font-size: 14px;
  color: #6c757d;
  margin: 0;
}

.filters-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  align-items: flex-end;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.filter-label {
  font-weight: 600;
  color: #0d3d47;
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.filter-select {
  width: 100%;
}

.filter-radio {
  width: 100%;
}

.refresh-btn {
  width: 100%;
  height: 40px;
  background: linear-gradient(135deg, #17a2b8 0%, #0d8399 100%);
  border: none;
  font-weight: 600;
}

.refresh-btn:hover {
  background: linear-gradient(135deg, #0d8399 0%, #0a6577 100%);
}

.stats-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 25px;
  margin-bottom: 40px;
}

.stat-card {
  background: white;
  border-radius: 15px;
  padding: 25px;
  box-shadow: 0 10px 35px rgba(0, 0, 0, 0.08);
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 20px;
}

.stat-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.15);
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
}

.revenue-card::before {
  background: linear-gradient(90deg, #10B981 0%, #059669 100%);
}

.import-card::before {
  background: linear-gradient(90deg, #3B82F6 0%, #1F40AF 100%);
}

.cancel-card::before {
  background: linear-gradient(90deg, #EF4444 0%, #DC2626 100%);
}

.profit-card::before {
  background: linear-gradient(90deg, #F59E0B 0%, #D97706 100%);
}

.card-icon {
  font-size: 40px;
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  flex-shrink: 0;
}

.revenue-card .card-icon {
  background: rgba(16, 185, 129, 0.1);
  color: #10B981;
}

.import-card .card-icon {
  background: rgba(59, 130, 246, 0.1);
  color: #3B82F6;
}

.cancel-card .card-icon {
  background: rgba(239, 68, 68, 0.1);
  color: #EF4444;
}

.profit-card .card-icon {
  background: rgba(245, 158, 11, 0.1);
  color: #F59E0B;
}

.card-bg-icon {
  position: absolute;
  right: -20px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 100px;
  opacity: 0.05;
  pointer-events: none;
}

.card-content {
  flex: 1;
}

.card-label {
  margin: 0;
  font-size: 13px;
  font-weight: 600;
  color: #6c757d;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.card-value {
  margin: 8px 0 0 0;
  font-size: 28px;
  font-weight: 700;
  color: #0d3d47;
}

.chart-section {
  background: white;
  border-radius: 15px;
  padding: 30px;
  box-shadow: 0 10px 35px rgba(0, 0, 0, 0.08);
}

.chart-header {
  margin-bottom: 25px;
  border-bottom: 2px solid #f0f0f0;
  padding-bottom: 20px;
}

.chart-title {
  font-size: 24px;
  font-weight: 700;
  color: #0d3d47;
  margin: 0 0 8px 0;
  display: flex;
  align-items: center;
  gap: 12px;
}

.chart-title i {
  color: #17a2b8;
  font-size: 26px;
}

.chart-subtitle {
  font-size: 13px;
  color: #6c757d;
  margin: 0;
}

.chart-container {
  position: relative;
  height: 500px;
  width: 100%;
}

.chart-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
}

.loading-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  font-size: 18px;
  color: #6c757d;
  gap: 12px;
}

.loading-placeholder i {
  font-size: 24px;
  color: #17a2b8;
}

/* Responsive Design */
@media (max-width: 768px) {


  .stats-header {
    padding: 20px;
  }

  .header-title {
    font-size: 24px;
  }

  .filters-section {
    grid-template-columns: 1fr;
  }

  .stats-cards {
    grid-template-columns: 1fr;
    gap: 15px;
  }

  .stat-card {
    padding: 20px;
  }

  .card-icon {
    width: 60px;
    height: 60px;
    font-size: 28px;
  }

  .card-value {
    font-size: 22px;
  }

  .chart-container {
    height: 300px;
  }
}
</style>
