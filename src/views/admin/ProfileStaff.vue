<template>
    <!-- Header Card with Details -->
    <el-card class="header-card" shadow="hover">
      <div class="header-content">
        <div class="profile-info">
          <h2 class="name">{{ staffInfo.hoTen }}</h2>
          <div class="details">
            <span class="badge">{{ staffInfo.maNV }}</span>
            <span class="role">{{ formatRole(staffInfo.chucVu) }}</span>
            <span class="status" :class="accountStatus ? 'enabled' : 'disabled'">
              {{ accountStatus ? '✓ Hoạt động' : '✗ Bị vô hiệu hoá' }}
            </span>
          </div>
        </div>
        <div class="action-buttons">
          <el-button type="primary" @click="editProfile">
            <i class="fas fa-edit"></i> Chỉnh Sửa
          </el-button>
          <el-button @click="goBack">
            <i class="fas fa-arrow-left"></i> Quay Lại
          </el-button>
        </div>
      </div>

      <!-- Details Grid -->
      <el-divider style="margin: 20px 0;" />
      
      <el-row :gutter="20" class="details-grid">
        <el-col :xs="24" :sm="12" :md="6">
          <div class="detail-item">
            <span class="label">Họ Tên</span>
            <span class="value">{{ staffInfo.hoTen }}</span>
          </div>
        </el-col>
        <el-col :xs="24" :sm="12" :md="6">
          <div class="detail-item">
            <span class="label">Tên Tài Khoản</span>
            <span class="value">{{ staffInfo.tenDangNhap || 'N/A' }}</span>
          </div>
        </el-col>
        <el-col :xs="24" :sm="12" :md="6">
          <div class="detail-item">
            <span class="label">Giới Tính</span>
            <span class="value">{{ staffInfo.gioiTinh || 'N/A' }}</span>
          </div>
        </el-col>
        <el-col :xs="24" :sm="12" :md="6">
          <div class="detail-item">
            <span class="label">Ngày Sinh</span>
            <span class="value">{{ formatDate(staffInfo.ngaySinh) }}</span>
          </div>
        </el-col>
        <el-col :xs="24" :sm="12" :md="6">
          <div class="detail-item">
            <span class="label">Số Điện Thoại</span>
            <span class="value">{{ staffInfo.dienThoai || 'N/A' }}</span>
          </div>
        </el-col>
        <el-col :xs="24" :sm="12" :md="6">
          <div class="detail-item">
            <span class="label">Email</span>
            <span class="value">{{ staffInfo.email || 'N/A' }}</span>
          </div>
        </el-col>
        <el-col :xs="24" :sm="12" :md="6">
          <div class="detail-item">
            <span class="label">Địa Chỉ</span>
            <span class="value">{{ staffInfo.diaChi || 'N/A' }}</span>
          </div>
        </el-col>
        <el-col :xs="24" :sm="12" :md="6">
          <div class="detail-item">
            <el-button type="warning" size="small" @click="openChangePasswordDialog" style="width: 100%;">
              <i class="fas fa-key"></i> Đổi Password
            </el-button>
          </div>
        </el-col>
      </el-row>
    </el-card>

    <!-- Statistics Cards -->
    <div class="stats-container">
      <div class="stat-card total-invoices">
        <div class="stat-icon"><i class="fas fa-file-invoice"></i></div>
        <div class="stat-content">
          <div class="stat-value">{{ statistics.totalInvoices }}</div>
          <div class="stat-label">Tổng Hoá Đơn</div>
        </div>
      </div>

      <div class="stat-card total-revenue">
        <div class="stat-icon"><i class="fas fa-money-bill-wave"></i></div>
        <div class="stat-content">
          <div class="stat-value">{{ formatPrice(statistics.totalRevenue) }}</div>
          <div class="stat-label">Tổng Doanh Thu</div>
        </div>
      </div>

      <div class="stat-card avg-revenue">
        <div class="stat-icon"><i class="fas fa-chart-line"></i></div>
        <div class="stat-content">
          <div class="stat-value">{{ formatPrice(statistics.avgRevenue) }}</div>
          <div class="stat-label">Doanh Thu Trung Bình</div>
        </div>
      </div>

      <div class="stat-card pending-invoices">
        <div class="stat-icon"><i class="fas fa-calendar-alt"></i></div>
        <div class="stat-content">
          <div class="stat-value">{{ statistics.monthlyInvoices }}</div>
          <div class="stat-label">Hoá Đơn Tháng Này</div>
        </div>
      </div>
    </div>

    <!-- Tabs -->
    <el-tabs v-model="activeTab" class="profile-tabs" @tab-change="onTabChange">
      <!-- Tab: Danh sách hoá đơn -->
      <el-tab-pane label="Danh Sách Hoá Đơn" name="invoices">
        <el-table
          :data="filteredInvoices"
          stripe
          style="width: 100%"
          v-loading="loadingInvoices"
          :default-sort="{ prop: 'ngayLap', order: 'descending' }"
        >
          <el-table-column prop="maHD" label="Mã Hoá Đơn" width="200" sortable />
          <el-table-column prop="ngayLap" label="Ngày Lập" width="120" :formatter="formatDateColumn" sortable />
          <el-table-column prop="tenKH" label="Khách Hàng" min-width="180" />
          <el-table-column prop="tongTien" label="Thành Tiền" width="150" align="right" :formatter="formatPriceColumn" sortable />
          <el-table-column prop="trangThaiGiaoHang" label="Trạng Thái" width="140" align="center">
            <template #default="{ row }">
              <el-tag :type="getStatusType(row.trangThaiGiaoHang)" size="small">
                {{ mapStatus(row.trangThaiGiaoHang) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="Hành Động" width="150" align="center">
            <template #default="{ row }">
              <el-button link type="primary" @click="viewInvoice(row)">
                <i class="fas fa-eye"></i> Xem
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <!-- Pagination -->
        <div class="pagination-container">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :page-sizes="[10, 20, 50]"
            :total="totalInvoices"
            layout="total, sizes, prev, pager, next, jumper"
          />
        </div>
      </el-tab-pane>

      <!-- Tab: Biểu đồ doanh thu -->
      <el-tab-pane label="Biểu Đồ Doanh Thu" name="chart">
        <div class="chart-container">
          <div class="chart-wrapper">
            <h3>Doanh Thu Theo Tháng</h3>
            <canvas id="revenueChart" style="max-height: 400px;"></canvas>
          </div>
          <div class="chart-wrapper">
            <h3>Phân Bố Trạng Thái Hoá Đơn</h3>
            <canvas id="statusChart" style="max-height: 400px;"></canvas>
          </div>
        </div>
      </el-tab-pane>

      <!-- Tab: Thống kê chi tiết -->
      <el-tab-pane label="Thống Kê Chi Tiết" name="stats">
        <div class="stats-detail">
          <el-row :gutter="20">
            <el-col :xs="24" :sm="12" :md="6">
              <el-statistic title="Hoá Đơn Chờ Giao" :value="statistics.pendingInvoices" />
            </el-col>
            <el-col :xs="24" :sm="12" :md="6">
              <el-statistic title="Hoá Đơn Đã Giao" :value="statistics.deliveredInvoices" />
            </el-col>
            <el-col :xs="24" :sm="12" :md="6">
              <el-statistic title="Hoá Đơn Đã Nhận" :value="statistics.receivedInvoices" />
            </el-col>
            <el-col :xs="24" :sm="12" :md="6">
              <el-statistic title="Hoá Đơn Bị Huỷ" :value="statistics.cancelledInvoices" />
            </el-col>
          </el-row>

          <el-divider />

          <el-row :gutter="20" class="revenue-stats">
            <el-col :xs="24" :sm="12">
              <div class="stat-box">
                <h4>Doanh Thu Năm Nay</h4>
                <p class="amount">{{ formatPrice(statistics.yearlyRevenue) }}</p>
              </div>
            </el-col>
            <el-col :xs="24" :sm="12">
              <div class="stat-box">
                <h4>Doanh Thu Tháng Này</h4>
                <p class="amount">{{ formatPrice(statistics.monthlyRevenue) }}</p>
              </div>
            </el-col>
          </el-row>
        </div>
      </el-tab-pane>
    </el-tabs>

    <!-- Edit Profile Dialog -->
    <el-dialog v-model="editDialogVisible" title="Chỉnh Sửa Thông Tin Cá Nhân" width="600px">
      <el-form :model="editForm" label-width="140px">
        <el-form-item label="Mã Nhân Viên">
          <el-input v-model="editForm.maNV" disabled />
        </el-form-item>
        <el-form-item label="Họ Tên">
          <el-input v-model="editForm.hoTen" placeholder="Nhập họ tên" />
        </el-form-item>
        <el-form-item label="Số Điện Thoại">
          <el-input v-model="editForm.dienThoai" placeholder="Nhập số điện thoại" />
        </el-form-item>
        <el-form-item label="Địa Chỉ">
          <el-input v-model="editForm.diaChi" placeholder="Nhập địa chỉ" type="textarea" :rows="3" />
        </el-form-item>
        <el-form-item label="Ngày Sinh">
          <el-date-picker 
            v-model="editForm.ngaySinh" 
            type="date" 
            placeholder="Chọn ngày sinh"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item label="Giới Tính">
          <el-select v-model="editForm.gioiTinh" placeholder="Chọn giới tính">
            <el-option label="Nam" value="Nam" />
            <el-option label="Nữ" value="Nữ" />
            <el-option label="Khác" value="Khác" />
          </el-select>
        </el-form-item>
        <el-form-item label="Email">
          <el-input v-model="editForm.email" placeholder="Nhập email" type="email" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="cancelEdit">Huỷ</el-button>
        <el-button type="primary" :loading="editFormLoading" @click="saveProfile">Lưu</el-button>
      </template>
    </el-dialog>

    <!-- Change Password Dialog -->
    <el-dialog v-model="changePasswordDialogVisible" title="Đổi Mật Khẩu" width="500px">
      <el-form :model="changePasswordForm" label-width="120px">
        <el-form-item label="Mật Khẩu Mới">
          <el-input 
            v-model="changePasswordForm.newPassword" 
            type="password" 
            placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
            show-password
          />
        </el-form-item>
        <el-form-item label="Xác Nhận Mật Khẩu">
          <el-input 
            v-model="changePasswordForm.confirmPassword" 
            type="password" 
            placeholder="Xác nhận mật khẩu mới"
            show-password
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="cancelChangePassword">Huỷ</el-button>
        <el-button type="primary" :loading="changePasswordLoading" @click="changePassword">Đổi Mật Khẩu</el-button>
      </template>
    </el-dialog>

</template>

<script setup>
import { ref, onMounted, computed, nextTick, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import axios from '@/api/axios';
import Chart from 'chart.js/auto';

const route = useRoute();
const router = useRouter();

// State
const staffInfo = ref({});
const invoices = ref([]);
const accountStatus = ref(true);
const loadingInvoices = ref(false);
const currentPage = ref(1);
const pageSize = ref(10);
const totalInvoices = ref(0);
const editDialogVisible = ref(false);
const editFormLoading = ref(false);
const editForm = ref({});
const changePasswordDialogVisible = ref(false);
const changePasswordLoading = ref(false);
const activeTab = ref('invoices');
const changePasswordForm = ref({
  newPassword: '',
  confirmPassword: ''
});

const statistics = ref({
  totalInvoices: 0,
  totalRevenue: 0,
  avgRevenue: 0,
  monthlyInvoices: 0,
  deliveredInvoices: 0,
  receivedInvoices: 0,
  cancelledInvoices: 0,
  yearlyRevenue: 0,
  monthlyRevenue: 0
});

// Computed
const filteredInvoices = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return invoices.value.slice(start, end);
});

// Methods
const formatDate = (date) => {
  if (!date) return 'N/A';
  try {
    // Handle both string and Date objects
    let d = typeof date === 'string' ? new Date(date) : date;
    // Check if date is valid
    if (isNaN(d.getTime())) return 'N/A';
    return d.toLocaleDateString('vi-VN', { year: 'numeric', month: '2-digit', day: '2-digit' });
  } catch (e) {
    return 'N/A';
  }
};

const formatPrice = (price) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price || 0);
};

const formatPriceColumn = (row) => formatPrice(row.tongTien || 0);

const formatDateColumn = (row) => {
  if (!row.ngayLap) return 'N/A';
  try {
    let d = typeof row.ngayLap === 'string' ? new Date(row.ngayLap) : row.ngayLap;
    if (isNaN(d.getTime())) return 'N/A';
    return d.toLocaleDateString('vi-VN', { year: 'numeric', month: '2-digit', day: '2-digit' });
  } catch (e) {
    return 'N/A';
  }
};

const formatRole = (role) => {
  return role === 1 ? 'Quản Trị Viên' : 'Nhân Viên';
};

const mapStatus = (status) => {
  const statuses = {
    0: 'Chờ Giao',
    1: 'Đã Xác Nhận',
    2: 'Đã Giao',
    3: 'Đã Nhận',
    '-1': 'Huỷ',
    '-2': 'Hoàn Tất Huỷ',
    '-3': 'Chưa Xử Lý Huỷ'
  };
  return statuses[status] || 'Đã hủy';
};

const getStatusType = (status) => {
  const types = {
    0: 'info',
    1: 'warning',
    2: 'primary',
    3: 'success',
    '-1': 'danger',
    '-2': 'danger',
    '-3': 'danger'
  };
  return types[status] || 'info';
};

// Load dữ liệu
const loadStaffInfo = async () => {
  try {
    const maNV = route.params.maNV;
    // Dùng endpoint mới để lấy thông tin nhân viên kèm tài khoản
    const response = await axios.get(`/NhanVien/${maNV}/with-account`);
    staffInfo.value = response.data;

    // Lấy trạng thái tài khoản
    const statusResponse = await axios.get(`/NhanVien/${maNV}/account-status`);
    accountStatus.value = statusResponse.data.data.isEnabled;
  } catch (error) {
    ElMessage.error('Lỗi khi tải thông tin nhân viên');
    console.error(error);
  }
};

const loadInvoices = async () => {
  loadingInvoices.value = true;
  try {
    const maNV = route.params.maNV;
    const response = await axios.get(`/HoaDon/nhanvien/${maNV}`);
    invoices.value = response.data || [];
    totalInvoices.value = invoices.value.length;
    calculateStatistics();
  } catch (error) {
    ElMessage.error('Lỗi khi tải danh sách hoá đơn');
    console.error(error);
  } finally {
    loadingInvoices.value = false;
  }
};

const calculateStatistics = () => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  let totalRevenue = 0;
  let monthlyRevenue = 0;
  let yearlyRevenue = 0;
  let pending = 0;
  let delivered = 0;
  let received = 0;
  let cancelled = 0;
  let monthlyInvoicesCount = 0;

  invoices.value.forEach(invoice => {
    const amount = invoice.tongTien || 0;
    totalRevenue += amount;

    const invoiceDate = new Date(invoice.ngayLap);
    if (invoiceDate.getFullYear() === currentYear) {
      yearlyRevenue += amount;
      if (invoiceDate.getMonth() === currentMonth) {
        monthlyRevenue += amount;
        monthlyInvoicesCount++;
      }
    }

    const status = invoice.trangThaiGiaoHang;
    if (status === 0) pending += amount;
    else if (status === 2) delivered += amount;
    else if (status === 3) received += amount;
    else if (status < 0) cancelled += amount;
  });

  const pendingCount = invoices.value.filter(i => i.trangThaiGiaoHang === 0).length;
  const deliveredCount = invoices.value.filter(i => i.trangThaiGiaoHang === 2).length;
  const receivedCount = invoices.value.filter(i => i.trangThaiGiaoHang === 3).length;
  const cancelledCount = invoices.value.filter(i => i.trangThaiGiaoHang < 0).length;

  statistics.value = {
    totalInvoices: invoices.value.length,
    totalRevenue,
    avgRevenue: invoices.value.length > 0 ? totalRevenue / invoices.value.length : 0,
    monthlyInvoices: monthlyInvoicesCount,
    deliveredInvoices: deliveredCount,
    receivedInvoices: receivedCount,
    cancelledInvoices: cancelledCount,
    yearlyRevenue,
    monthlyRevenue
  };
};

const viewInvoice = (invoice) => {
  router.push(`/admin/hoadon/${invoice.maHD}`);
};

const editProfile = () => {
  editForm.value = { ...staffInfo.value };
  editDialogVisible.value = true;
};

const saveProfile = async () => {
  editFormLoading.value = true;
  try {
    const maNV = route.params.maNV;
    const response = await axios.put(`/NhanVien/${maNV}`, editForm.value);
    staffInfo.value = { ...editForm.value };
    editDialogVisible.value = false;
    ElMessage.success('Cập nhật thông tin thành công');
  } catch (error) {
    ElMessage.error('Lỗi khi cập nhật thông tin');
    console.error(error);
  } finally {
    editFormLoading.value = false;
  }
};

const cancelEdit = () => {
  editDialogVisible.value = false;
  editForm.value = {};
};

const openChangePasswordDialog = () => {
  changePasswordForm.value = {
    newPassword: '',
    confirmPassword: ''
  };
  changePasswordDialogVisible.value = true;
};

const changePassword = async () => {
  if (!changePasswordForm.value.newPassword) {
    ElMessage.warning('Vui lòng nhập mật khẩu mới');
    return;
  }
  if (changePasswordForm.value.newPassword !== changePasswordForm.value.confirmPassword) {
    ElMessage.warning('Mật khẩu không khớp');
    return;
  }
  if (changePasswordForm.value.newPassword.length < 6) {
    ElMessage.warning('Mật khẩu phải tối thiểu 6 ký tự');
    return;
  }

  changePasswordLoading.value = true;
  try {
    const maNV = route.params.maNV;
    const response = await axios.post(`/TaiKhoan/reset-password/${maNV}`, {
      newPassword: changePasswordForm.value.newPassword
    });
    ElMessage.success('Đổi mật khẩu thành công');
    changePasswordDialogVisible.value = false;
    changePasswordForm.value = {};
  } catch (error) {
    ElMessage.error('Lỗi khi đổi mật khẩu');
    console.error(error);
  } finally {
    changePasswordLoading.value = false;
  }
};

const cancelChangePassword = () => {
  changePasswordDialogVisible.value = false;
  changePasswordForm.value = {};
};

const goBack = () => {
  router.back();
};

// Chart instances
let revenueChartInstance = null;
let statusChartInstance = null;

// Handle tab change
const onTabChange = async (tabName) => {
  if (tabName === 'chart') {
    await nextTick();
    renderRevenueChart();
    renderStatusChart();
  }
};

// Render Revenue By Month Chart
const renderRevenueChart = () => {
  try {
    const ctx = document.getElementById('revenueChart');
    if (!ctx) {
      console.warn('revenueChart element not found');
      return;
    }

    if (!invoices.value || invoices.value.length === 0) {
      console.log('No invoices data for revenue chart');
      return;
    }

    // Get last 12 months data
    const monthlyData = {};
    const now = new Date();
    
    // Initialize 12 months
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthlyData[key] = 0;
    }

    // Aggregate invoice data by month
    invoices.value.forEach(invoice => {
      const invoiceDate = new Date(invoice.ngayLap);
      const key = `${invoiceDate.getFullYear()}-${String(invoiceDate.getMonth() + 1).padStart(2, '0')}`;
      if (monthlyData.hasOwnProperty(key)) {
        monthlyData[key] += invoice.tongTien || 0;
      }
    });

    const labels = Object.keys(monthlyData).map(key => {
      const [year, month] = key.split('-');
      return `Tháng ${month}`;
    });
    const data = Object.values(monthlyData);

    if (revenueChartInstance) {
      revenueChartInstance.destroy();
    }

    revenueChartInstance = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Doanh Thu (VND)',
          data: data,
          backgroundColor: 'rgba(102, 126, 234, 0.6)',
          borderColor: 'rgba(102, 126, 234, 1)',
          borderWidth: 1,
          borderRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'top'
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function(value) {
                return new Intl.NumberFormat('vi-VN', {
                  style: 'currency',
                  currency: 'VND',
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                }).format(value);
              }
            }
          }
        }
      }
    });
  } catch (error) {
    console.error('Error rendering revenue chart:', error);
  }
};

// Render Status Distribution Chart
const renderStatusChart = () => {
  try {
    const ctx = document.getElementById('statusChart');
    if (!ctx) {
      console.warn('statusChart element not found');
      return;
    }

    if (!invoices.value || invoices.value.length === 0) {
      console.log('No invoices data for status chart');
      return;
    }

    const statusCounts = {
      'Chờ Giao': 0,
      'Đã Giao': 0,
      'Đã Nhận': 0,
      'Đã Huỷ': 0
    };

    invoices.value.forEach(invoice => {
      const status = invoice.trangThaiGiaoHang;
      if (status === 0) statusCounts['Chờ Giao']++;
      else if (status === 2) statusCounts['Đã Giao']++;
      else if (status === 3) statusCounts['Đã Nhận']++;
      else if (status < 0) statusCounts['Đã Huỷ']++;
    });

    if (statusChartInstance) {
      statusChartInstance.destroy();
    }

    statusChartInstance = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: Object.keys(statusCounts),
        datasets: [{
          data: Object.values(statusCounts),
          backgroundColor: [
            'rgba(64, 158, 255, 0.7)',
            'rgba(102, 126, 234, 0.7)',
            'rgba(76, 175, 80, 0.7)',
            'rgba(244, 67, 54, 0.7)'
          ],
          borderColor: [
            'rgba(64, 158, 255, 1)',
            'rgba(102, 126, 234, 1)',
            'rgba(76, 175, 80, 1)',
            'rgba(244, 67, 54, 1)'
          ],
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom'
          }
        }
      }
    });
  } catch (error) {
    console.error('Error rendering status chart:', error);
  }
};

onMounted(async () => {
  await loadStaffInfo();
  await loadInvoices();
});
</script>

<style scoped>


/* Header Card */
.header-card {
  margin-bottom: 24px;
  border-radius: 12px;
  overflow: hidden;
}

.header-card :deep(.el-card__body) {
  padding: 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding-bottom: 20px;
}

.header-content {
  display: flex;
  gap: 24px;
  align-items: flex-start;
  justify-content: space-between;
}

.profile-info {
  flex: 1;
}

.name {
  margin: 0;
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 8px;
  color: white;
}

.details {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  flex-wrap: wrap;
  align-items: center;
}

.badge {
  background: rgba(255, 255, 255, 0.25);
  color: white;
  padding: 8px 14px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  white-space: nowrap;
  line-height: 1;
}

.role {
  background: rgba(255, 255, 255, 0.25);
  color: white;
  padding: 8px 14px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  white-space: nowrap;
  line-height: 1;
}

.status {
  padding: 8px 14px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  white-space: nowrap;
  line-height: 1;
}

.status.enabled {
  background: rgba(76, 175, 80, 0.35);
  color: #90EE90;
}

.status.disabled {
  background: rgba(244, 67, 54, 0.35);
  color: #FF6B6B;
}

.contact-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.contact-info p {
  margin: 0;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  gap: 8px;
}

.action-buttons {
  display: flex;
  gap: 12px;
  flex-shrink: 0;
}

.action-buttons :deep(.el-button) {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.3);
  color: white;
}

.action-buttons :deep(.el-button:hover) {
  background: rgba(255, 255, 255, 0.3);
}

/* Statistics */
.stats-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.stat-icon {
  font-size: 36px;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-card.total-invoices .stat-icon {
  background: rgba(66, 165, 245, 0.2);
  color: #42a5f5;
}

.stat-card.total-revenue .stat-icon {
  background: rgba(76, 175, 80, 0.2);
  color: #4caf50;
}

.stat-card.avg-revenue .stat-icon {
  background: rgba(255, 152, 0, 0.2);
  color: #ff9800;
}

.stat-card.pending-invoices .stat-icon {
  background: rgba(33, 150, 243, 0.2);
  color: #2196f3;
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #333;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 12px;
  color: #999;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Tabs */
.profile-tabs {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.profile-tabs :deep(.el-tabs__header) {
  border-bottom: 2px solid #f0f0f0;
  margin-bottom: 20px;
}

.profile-tabs :deep(.el-tabs__nav-wrap::after) {
  display: none;
}

.pagination-container {
  margin-top: 20px;
  text-align: right;
}

/* Charts */
.chart-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
  gap: 24px;
}

.chart-wrapper {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.chart-wrapper h3 {
  margin-top: 0;
  margin-bottom: 16px;
  color: #333;
  font-weight: 600;
}

/* Stats Detail */
.stats-detail {
  padding: 20px;
}

.stats-detail :deep(.el-statistic__title) {
  color: #666;
  font-size: 13px;
}

.stats-detail :deep(.el-statistic__content) {
  font-size: 28px;
  font-weight: 700;
  color: #333;
}

.revenue-stats {
  margin-top: 20px;
}

.stat-box {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  padding: 24px;
  color: white;
}

.stat-box h4 {
  margin: 0;
  font-size: 14px;
  opacity: 0.9;
  margin-bottom: 12px;
}

.stat-box .amount {
  margin: 0;
  font-size: 28px;
  font-weight: 700;
}

/* Responsive */
@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .profile-info {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .action-buttons {
    width: 100%;
    flex-direction: column;
  }

  .action-buttons :deep(.el-button) {
    width: 100%;
  }

  .stats-container {
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  }

  .chart-container {
    grid-template-columns: 1fr;
  }

  .contact-info {
    align-items: center;
  }
}

/* Details Card */
.details-grid {
  margin-top: 0;
  padding-top: 0;
}

.detail-item {
  padding: 12px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  height: 100%;
  backdrop-filter: blur(10px);
}

.detail-item .label {
  font-weight: 600;
  color: rgba(255, 255, 255, 0.7);
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.detail-item .value {
  color: white;
  font-size: 13px;
  font-weight: 500;
  word-break: break-word;
}
</style>
