<template>
    <!-- Chart Section with Stats Cards -->
    <div class="chart-section">
      <!-- Stats Cards Inside Chart Section -->
      <div class="stats-cards-inline">
        <!-- Admin Stats Cards -->
        <template v-if="isAdmin">
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

          <div class="stat-card staff-card">
            <div class="card-icon">
              <i class="fas fa-users"></i>
            </div>
            <div class="card-content">
              <p class="card-label">Tổng Nhân Viên</p>
              <p class="card-value">{{ totalStaff }}</p>
            </div>
            <div class="card-bg-icon">
              <i class="fas fa-users"></i>
            </div>
          </div>
        </template>

        <!-- Staff Stats Cards -->
        <template v-else>
          <div class="stat-card revenue-card">
            <div class="card-icon">
              <i class="fas fa-receipt"></i>
            </div>
            <div class="card-content">
              <p class="card-label">Tổng Hóa Đơn</p>
              <p class="card-value">{{ staffTotalInvoices }}</p>
            </div>
            <div class="card-bg-icon">
              <i class="fas fa-receipt"></i>
            </div>
          </div>

          <div class="stat-card import-card">
            <div class="card-icon">
              <i class="fas fa-coins"></i>
            </div>
            <div class="card-content">
              <p class="card-label">Tổng Doanh Thu</p>
              <p class="card-value">{{ formatCurrency(staffTotalRevenue) }}</p>
            </div>
            <div class="card-bg-icon">
              <i class="fas fa-coins"></i>
            </div>
          </div>

          <div class="stat-card cancel-card">
            <div class="card-icon">
              <i class="fas fa-calendar-alt"></i>
            </div>
            <div class="card-content">
              <p class="card-label">Doanh Thu Tháng Này</p>
              <p class="card-value">{{ formatCurrency(staffMonthRevenue) }}</p>
            </div>
            <div class="card-bg-icon">
              <i class="fas fa-calendar-alt"></i>
            </div>
          </div>
        </template>
      </div>

      <!-- Filters Section (only show for admin) -->
      <div class="filters-section-inline" v-if="isAdmin">
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

      <!-- Charts Container (only show for admin) -->
      <div class="charts-container-admin" v-if="isAdmin">
        <!-- Bar Chart -->
        <div class="bar-chart-wrapper">
          <h3 class="chart-subtitle">Biểu đồ so sánh doanh thu, nhập hàng và tiền huỷ theo {{ viewMode === 'year' ? 'tháng' : 'ngày' }}</h3>
          <div class="chart-container">
            <div v-if="loaded" class="chart-wrapper">
              <Bar :data="chartData" :options="chartOptions" />
            </div>
            <div v-else class="loading-placeholder">
              <i class="fas fa-spinner fa-spin"></i> Đang tải dữ liệu...
            </div>
          </div>
        </div>

        <!-- Line Chart for Revenue Trend -->
        <div class="line-chart-wrapper">
          <h3 class="chart-subtitle">Xu hướng doanh thu vs tiền nhập theo {{ viewMode === 'year' ? 'tháng' : 'ngày' }}</h3>
          <div class="chart-container">
            <div v-if="loaded" class="chart-wrapper">
              <Line :data="lineChartData" :options="lineChartOptions" />
            </div>
            <div v-else class="loading-placeholder">
              <i class="fas fa-spinner fa-spin"></i> Đang tải dữ liệu...
            </div>
          </div>
        </div>

        <!-- Pie Chart -->
        <div class="pie-chart-wrapper">
          <h3 class="chart-subtitle">Top 3 loại thuốc bán chạy</h3>
          <div class="pie-chart-container">
            <div v-if="loaded" class="chart-wrapper">
              <Doughnut :data="pieChartData" :options="pieChartOptions" />
            </div>
            <div v-else class="loading-placeholder">
              <i class="fas fa-spinner fa-spin"></i> Đang tải dữ liệu...
            </div>
          </div>
          <div v-if="topMedicines.length > 0" class="medicines-list">
            <div v-for="(medicine, index) in topMedicines" :key="medicine.maThuoc" class="medicine-item">
              <span class="medicine-index" :style="{ background: pieChartData.datasets[0].backgroundColor[index] }">{{ index + 1 }}</span>
              <span class="medicine-name">{{ medicine.tenThuoc }}</span>
              <span class="medicine-quantity">{{ medicine.totalQuantity }} x</span>
            </div>
          </div>
        </div>

        <!-- Revenue by Category Chart -->
        <div class="category-chart-wrapper">
          <h3 class="chart-subtitle">Doanh thu theo danh mục thuốc</h3>
          <div class="chart-container">
            <div v-if="loaded && revenueByCategory.labels && revenueByCategory.labels.length > 0" class="chart-wrapper">
              <Bar :data="revenueByCategory" :options="chartOptions" />
            </div>
            <div v-else class="loading-placeholder">
              <i class="fas fa-spinner fa-spin"></i> Đang tải dữ liệu...
            </div>
          </div>
        </div>
      </div>

      <!-- Charts Container for Staff -->
      <div class="charts-container-staff" v-else>
        <!-- Staff Revenue Line Chart -->
        <div class="line-chart-wrapper">
          <h3 class="chart-subtitle">Biểu đồ doanh thu hàng ngày (tháng này)</h3>
          <div class="chart-container">
            <div v-if="loaded && lineChartData.labels && lineChartData.labels.length > 0" class="chart-wrapper">
              <Line :data="lineChartData" :options="lineChartOptions" />
            </div>
            <div v-else class="loading-placeholder">
              <i class="fas fa-spinner fa-spin"></i> Đang tải dữ liệu...
            </div>
          </div>
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
  ArcElement,
  CategoryScale,
  LinearScale
} from 'chart.js';
import { Bar, Doughnut, Line } from 'vue-chartjs';
import ThongKeService from '@/services/ThongKeService';
import axios from 'axios';
import { useAuthStore } from '@/store/auth';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

const authStore = useAuthStore();

const selectedYear = ref(new Date().getFullYear());
const selectedMonth = ref(new Date().getMonth() + 1);
const viewMode = ref('year'); // 'year' or 'month'
const loaded = ref(false);
const years = computed(() => {
  const currentYear = new Date().getFullYear();
  return Array.from({ length: 5 }, (_, i) => currentYear - i);
});

// Check if user is admin
const isAdmin = computed(() => {
  return authStore.user?.ChucVu === 1 || authStore.user?.ChucVu === '1' || 
         authStore.user?.isAdmin === true || authStore.user?.VaiTro === 'Admin';
});

const chartData = ref({
  labels: [],
  datasets: []
});

const pieChartData = ref({
  labels: [],
  datasets: []
});

const lineChartData = ref({
  labels: [],
  datasets: []
});

const topMedicines = ref([]);
const revenueByCategory = ref([]);

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top',
    }
  }
};

const pieChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom',
    }
  }
};

const lineChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top',
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        callback: function(value) {
          return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(value);
        }
      }
    }
  }
};

const totalRevenue = ref(0);
const totalImport = ref(0);
const totalCancel = ref(0);
const totalStaff = ref(0);

// Staff personal statistics
const staffTotalInvoices = ref(0);
const staffTotalRevenue = ref(0);
const staffMonthRevenue = ref(0);

const formatCurrency = (value) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
};

const fetchTopMedicines = async () => {
  try {
    let response;
    if (viewMode.value === 'year') {
      response = await ThongKeService.getTopSellingMedicines(selectedYear.value, 10);
    } else {
      response = await ThongKeService.getTopSellingMedicinesByMonth(selectedMonth.value, selectedYear.value, 10);
    }
    
    const allMedicines = response.data;
    
    // Get top 3
    topMedicines.value = allMedicines.slice(0, 3);
    
    // Calculate other medicines total
    const otherTotal = allMedicines.slice(3).reduce((sum, m) => sum + m.totalQuantity, 0);

    // Setup pie chart with top 3 + others
    const colors = ['#10B981', '#3B82F6', '#F59E0B', '#6c757d'];
    const labels = topMedicines.value.map(m => m.categoryName || 'Khác');
    const data = topMedicines.value.map(m => m.totalQuantity);
    
    if (otherTotal > 0) {
      labels.push('Khác');
      data.push(otherTotal);
    }

    pieChartData.value = {
      labels: labels,
      datasets: [
        {
          label: 'Số lượng bán',
          backgroundColor: colors.slice(0, labels.length),
          borderColor: colors.slice(0, labels.length),
          data: data
        }
      ]
    };
  } catch (error) {
    console.error('Error fetching top selling medicines:', error);
  }
};

const fetchData = async () => {
  loaded.value = false;
  try {
    if (isAdmin.value) {
      // Admin sees system-wide statistics
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

      // Fetch top medicines
      await fetchTopMedicines();
      
      // Fetch revenue by category
      await fetchRevenueByCategory();
      
      // Fetch line chart data
      await fetchRevenueLineChart();

      // Fetch staff count
      await fetchStaffCount();
    } else {
      // Staff sees only their personal statistics
      await fetchStaffStatistics();
    }

    loaded.value = true;
  } catch (error) {
    console.error('Error fetching statistics:', error);
  }
};

const fetchStaffCount = async () => {
  try {
    const response = await axios.get('https://localhost:7283/api/NhanVien');
    totalStaff.value = response.data.length;
  } catch (error) {
    console.error('Error fetching staff count:', error);
  }
};

// Fetch revenue trends by category for admin
const fetchRevenueByCategory = async () => {
  try {
    const response = await axios.get('https://localhost:7283/api/ThongKe/revenue-by-category');
    const categories = response.data || [];
    
    const labels = categories.map(c => c.categoryName);
    const revenues = categories.map(c => c.totalRevenue);
    const colors = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];
    
    revenueByCategory.value = {
      labels: labels,
      datasets: [{
        label: 'Doanh Thu Theo Danh Mục',
        backgroundColor: colors.slice(0, labels.length),
        borderColor: colors.slice(0, labels.length),
        data: revenues,
        borderWidth: 2
      }]
    };
  } catch (error) {
    console.error('Error fetching revenue by category:', error);
    // Fallback: Leave empty, the chart will show loading placeholder
    revenueByCategory.value = { labels: [], datasets: [] };
  }
};

// Fetch line chart data for revenue trend
const fetchRevenueLineChart = async () => {
  try {
    let response;
    if (viewMode.value === 'year') {
      response = await ThongKeService.getThongKeNam(selectedYear.value);
    } else {
      response = await ThongKeService.getThongKeThang(selectedMonth.value, selectedYear.value);
    }
    
    const data = response.data;
    
    lineChartData.value = {
      labels: data.doanhThu.map(item => item.label),
      datasets: [
        {
          label: 'Doanh Thu',
          borderColor: '#10B981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          data: data.doanhThu.map(item => item.value),
          tension: 0.4,
          fill: true,
          borderWidth: 2
        },
        {
          label: 'Tiền Nhập',
          borderColor: '#3B82F6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          data: data.tienNhapHang.map(item => item.value),
          tension: 0.4,
          fill: true,
          borderWidth: 2
        }
      ]
    };
  } catch (error) {
    console.error('Error fetching line chart data:', error);
  }
};

// Fetch staff personal statistics
const fetchStaffStatistics = async () => {
  try {
    const maNV = authStore.user?.MaNV;
    if (!maNV) return;

    // Get invoices for this staff
    const invoicesResponse = await axios.get(`https://localhost:7283/api/HoaDon/nhanvien/${maNV}`);
    const invoices = invoicesResponse.data || [];
    
    staffTotalInvoices.value = invoices.length;
    staffTotalRevenue.value = invoices.reduce((sum, inv) => sum + (inv.tongTien || 0), 0);
    
    // Get this month's revenue
    const today = new Date();
    const currentMonth = today.getMonth() + 1;
    const currentYear = today.getFullYear();
    
    const monthRevenue = invoices
      .filter(inv => {
        const invDate = new Date(inv.ngayLap);
        return invDate.getMonth() + 1 === currentMonth && invDate.getFullYear() === currentYear;
      })
      .reduce((sum, inv) => sum + (inv.tongTien || 0), 0);
    
    staffMonthRevenue.value = monthRevenue;
    
    // Generate line chart for staff showing their revenue trend this month
    const today2 = new Date();
    const currentYear2 = today2.getFullYear();
    const currentMonth2 = today2.getMonth() + 1;
    
    // Group invoices by date for this month
    const revenueByDate = {};
    invoices.forEach(inv => {
      const invDate = new Date(inv.ngayLap);
      if (invDate.getFullYear() === currentYear2 && invDate.getMonth() + 1 === currentMonth2) {
        const dateStr = `${invDate.getDate()}/${invDate.getMonth() + 1}`;
        revenueByDate[dateStr] = (revenueByDate[dateStr] || 0) + (inv.tongTien || 0);
      }
    });
    
    const dates = Object.keys(revenueByDate).sort((a, b) => {
      const [dayA] = a.split('/');
      const [dayB] = b.split('/');
      return parseInt(dayA) - parseInt(dayB);
    });
    
    lineChartData.value = {
      labels: dates,
      datasets: [
        {
          label: 'Doanh Thu Hàng Ngày',
          borderColor: '#10B981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          data: dates.map(date => revenueByDate[date]),
          tension: 0.4,
          fill: true,
          borderWidth: 2
        }
      ]
    };
  } catch (error) {
    console.error('Error fetching staff statistics:', error);
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

.filters-section-inline {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 15px;
  align-items: flex-end;
  margin-bottom: 20px;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.filter-label {
  font-weight: 600;
  color: #0d3d47;
  font-size: 12px;
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

.stats-cards-inline {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 15px;
  margin-bottom: 25px;
}

.stat-card {
  background: white;
  border-radius: 15px;
  padding: 15px;
  box-shadow: 0 10px 35px rgba(0, 0, 0, 0.08);
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  gap: 12px;
}

.stat-card:hover {
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

.staff-card::before {
  background: linear-gradient(90deg, #8B5CF6 0%, #7C3AED 100%);
}

.card-icon {
  font-size: 32px;
  width: 56px;
  height: 56px;
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

.staff-card .card-icon {
  background: rgba(139, 92, 246, 0.1);
  color: #8B5CF6;
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
  font-size: 11px;
  font-weight: 600;
  color: #6c757d;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.card-value {
  margin: 4px 0 0 0;
  font-size: 18px;
  font-weight: 700;
  color: #0d3d47;
}

.chart-section {
  background: white;
  border-radius: 15px;
  padding: 20px;
  box-shadow: 0 10px 35px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.charts-container {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 20px;
  align-items: start;
  overflow: hidden;
}

.charts-container-admin {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
  gap: 20px;
  align-items: start;
  overflow: hidden;
}

.charts-container-staff {
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
  align-items: start;
  overflow: hidden;
}

.line-chart-wrapper {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.category-chart-wrapper {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.bar-chart-wrapper {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.pie-chart-wrapper {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.chart-subtitle {
  font-size: 14px;
  font-weight: 600;
  color: #0d3d47;
  margin: 0 0 15px 0;
}

.chart-container {
  position: relative;
  height: 350px;
  width: 100%;
}

.pie-chart-container {
  position: relative;
  height: 250px;
  width: 100%;
  margin-bottom: 15px;
}

.chart-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
}

.medicines-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.medicine-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px;
  border-radius: 8px;
  background: #f8f9fa;
  font-size: 12px;
}

.medicine-index {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  color: white;
  font-weight: 700;
  font-size: 11px;
  flex-shrink: 0;
}

.medicine-name {
  flex: 1;
  color: #0d3d47;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.medicine-quantity {
  color: #6c757d;
  font-weight: 600;
  flex-shrink: 0;
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

  .charts-container {
    grid-template-columns: 1fr;
    gap: 15px;
  }

  .charts-container-admin {
    grid-template-columns: 1fr;
    gap: 15px;
  }

  .charts-container-staff {
    grid-template-columns: 1fr;
    gap: 15px;
  }

  .chart-container {
    height: 300px;
  }

  .pie-chart-container {
    height: 200px;
  }

  .medicine-item {
    font-size: 11px;
  }

  .medicine-name {
    font-size: 11px;
  }
}
</style>
