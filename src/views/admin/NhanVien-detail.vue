<template>
  <div class="nhanvien-detail-container">
    <!-- Create Mode -->
    <div v-if="isCreateMode" class="create-section">
      <div class="create-header">
        <div class="header-content">
          <h1 class="header-title">
            <i class="fas fa-user-plus"></i> Thêm Nhân Viên Mới
          </h1>
          <p class="header-subtitle">Vui lòng nhập đầy đủ thông tin nhân viên</p>
        </div>
        <el-button text @click="goBack" class="btn-back">
          <i class="fas fa-arrow-left"></i> Quay Lại
        </el-button>
      </div>

      <div class="create-content">
        <!-- Info Box -->
        <div class="info-box">
          <i class="fas fa-info-circle"></i>
          <span>Mật khẩu mặc định sẽ được tạo là <strong>123456</strong>. Nhân viên có thể thay đổi mật khẩu sau khi đăng nhập lần đầu.</span>
        </div>

        <el-card class="create-card">
          <el-form
            ref="createFormRef"
            :model="createFormData"
            :rules="createRules"
            label-width="120px"
            label-position="top"
            @submit.prevent
          >
            <!-- Row 1: Họ tên, Giới tính -->
            <div class="form-row">
              <div class="form-col">
                <el-form-item label="Họ Tên" prop="hoTen">
                  <el-input 
                    v-model="createFormData.hoTen" 
                    placeholder="Vd: Nguyễn Văn A"
                    clearable
                  >
                    <template #prefix>
                      <i class="fas fa-user"></i>
                    </template>
                  </el-input>
                </el-form-item>
              </div>
              <div class="form-col">
                <el-form-item label="Giới Tính" prop="gioiTinh">
                  <el-select v-model="createFormData.gioiTinh" placeholder="Chọn giới tính">
                    <el-option label="Nam" value="Nam" />
                    <el-option label="Nữ" value="Nữ" />
                    <el-option label="Khác" value="Khác" />
                  </el-select>
                </el-form-item>
              </div>
            </div>

            <!-- Row 2: Ngày sinh, Chức vụ -->
            <div class="form-row">
              <div class="form-col">
                <el-form-item label="Ngày Sinh" prop="ngaySinh">
                  <el-date-picker
                    v-model="createFormData.ngaySinh"
                    type="date"
                    placeholder="Chọn ngày sinh"
                    style="width: 100%"
                  />
                </el-form-item>
              </div>
              <div class="form-col">
                <el-form-item label="Chức Vụ" prop="chucVu">
                  <el-select v-model="createFormData.chucVu" placeholder="Chọn chức vụ">
                    <el-option label="Admin" :value="1" />
                    <el-option label="Nhân Viên" :value="2" />
                  </el-select>
                </el-form-item>
              </div>
            </div>

            <!-- Row 3: Số điện thoại -->
            <div class="form-row">
              <div class="form-col full">
                <el-form-item label="Số Điện Thoại" prop="dienThoai">
                  <el-input 
                    v-model="createFormData.dienThoai" 
                    placeholder="Vd: 0123456789"
                    clearable
                  >
                    <template #prefix>
                      <i class="fas fa-phone"></i>
                    </template>
                  </el-input>
                </el-form-item>
              </div>
            </div>

            <!-- Row 4: Địa chỉ -->
            <div class="form-row">
              <div class="form-col full">
                <el-form-item label="Địa Chỉ" prop="diaChi">
                  <el-input 
                    v-model="createFormData.diaChi" 
                    type="textarea" 
                    :rows="3"
                    placeholder="Nhập địa chỉ đầy đủ"
                  >
                    <template #prefix>
                      <i class="fas fa-map-marker-alt"></i>
                    </template>
                  </el-input>
                </el-form-item>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="form-actions">
              <el-button @click="goBack" class="btn-cancel">
                <i class="fas fa-times"></i> Hủy
              </el-button>
              <el-button type="primary" @click="createStaff" class="btn-submit">
                <i class="fas fa-save"></i> Lưu Nhân Viên
              </el-button>
            </div>
          </el-form>
        </el-card>
      </div>
    </div>

    <!-- View Mode -->
    <div v-else>
      <!-- Staff Info Card -->
      <div class="staff-info-section">
        <div class="info-card">
        <div class="info-header">
          <div class="avatar-container">
            <div class="avatar">
              <i class="fas fa-user-circle"></i>
            </div>
          </div>
          <div class="info-header-text">
            <h2 class="staff-name">{{ staff.hoTen }}</h2>
            <p class="staff-id">Mã NV: {{ staff.maNV }}</p>
          </div>
          <div class="info-header-back">
            <el-button text @click="goBack" class="btn-back">
              <i class="fas fa-arrow-left"></i> Quay Lại
            </el-button>
          </div>
        </div>

        <!-- Info Grid -->
        <div class="info-grid">
          <div class="info-item">
            <span class="label">Ngày Sinh</span>
            <span class="value">{{ formatDate(null, null, staff.ngaySinh) }}</span>
          </div>
          <div class="info-item">
            <span class="label">Giới Tính</span>
            <span class="value">{{ staff.gioiTinh }}</span>
          </div>
          <div class="info-item">
            <span class="label">Chức Vụ</span>
            <span class="value">
              <el-tag :type="staff.chucVu === 1 ? 'danger' : 'success'">
                {{ staff.chucVu === 1 ? 'Admin' : 'Nhân Viên' }}
              </el-tag>
            </span>
          </div>
          <div class="info-item">
            <span class="label">Số Điện Thoại</span>
            <span class="value">{{ staff.dienThoai }}</span>
          </div>
          <div class="info-item">
            <span class="label">Địa Chỉ</span>
            <span class="value">{{ staff.diaChi }}</span>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="info-actions">
          <el-button type="primary" @click="editStaff">
            <i class="fas fa-edit"></i> Chỉnh Sửa
          </el-button>
          <el-button type="warning" @click="confirmResetPassword">
            <i class="fas fa-key"></i> Reset Mật Khẩu
          </el-button>
          <el-button type="danger" @click="confirmDelete">
            <i class="fas fa-trash"></i> Xóa
          </el-button>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="stats-container">
        <div class="stat-card">
          <div class="stat-icon">
            <i class="fas fa-file-invoice"></i>
          </div>
          <div class="stat-content">
            <p class="stat-label">Tổng Hóa Đơn</p>
            <p class="stat-value">{{ staffInvoices.length }}</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">
            <i class="fas fa-money-bill"></i>
          </div>
          <div class="stat-content">
            <p class="stat-label">Tổng Doanh Thu</p>
            <p class="stat-value">{{ formatCurrency(null, null, totalRevenue) }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Invoices Section -->
    <div class="invoices-section">
      <div class="section-header">
        <h2 class="section-title">
          <i class="fas fa-file-invoice"></i> Danh Sách Hóa Đơn
        </h2>
        <span class="invoice-count">{{ staffInvoices.length }} hóa đơn</span>
      </div>

      <!-- Invoice Filters -->
      <div class="invoice-filters">
        <el-input
          v-model="invoiceSearch"
          placeholder="Tìm kiếm mã hóa đơn..."
          class="filter-input"
          clearable
        >
          <template #prefix>
            <i class="fas fa-search"></i>
          </template>
        </el-input>
        <el-select v-model="selectedStatus" placeholder="Trạng thái thanh toán" clearable class="filter-select">
          <el-option label="Tất cả" :value="null" />
          <el-option label="Đã thanh toán" :value="true" />
          <el-option label="Chưa thanh toán" :value="false" />
        </el-select>
      </div>

      <!-- Invoices List -->
      <div v-if="filteredInvoices.length > 0" class="invoices-list">
        <div v-for="invoice in paginatedInvoices" :key="invoice.maHD" class="invoice-card">
          <div class="invoice-card-header">
            <div class="invoice-id">
              <span class="label">Mã HĐ</span>
              <span class="value">{{ invoice.maHD }}</span>
            </div>
            <el-tag :type="invoice.trangThai ? 'success' : 'info'" class="status-tag">
              {{ invoice.trangThai ? 'Đã TT' : 'Chưa TT' }}
            </el-tag>
          </div>
          
          <div class="invoice-card-body">
            <div class="invoice-item">
              <span class="item-label">Ngày Lập</span>
              <span class="item-value">{{ formatDate(null, null, invoice.ngayLap) }}</span>
            </div>
            <div class="invoice-item">
              <span class="item-label">Tổng Tiền</span>
              <span class="item-value amount">{{ formatCurrency(null, null, invoice.tongTien) }}</span>
            </div>
            <div class="invoice-item">
              <span class="item-label">Giao Hàng</span>
              <span class="item-value">{{ formatDeliveryStatus(null, null, invoice.trangThaiGiaoHang) }}</span>
            </div>
          </div>

          <div class="invoice-card-footer">
            <el-button link type="primary" @click="viewInvoiceDetail(invoice)">
              <i class="fas fa-eye"></i> Xem Chi Tiết
            </el-button>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="filteredInvoices.length > itemsPerPage" class="pagination-wrapper">
        <el-pagination
          v-model:current-page="currentPage"
          :page-size="itemsPerPage"
          :total="filteredInvoices.length"
          layout="prev, pager, next"
          @current-change="currentPage = $event"
        />
      </div>

      <!-- Empty State -->
      <div v-if="staffInvoices.length === 0" class="empty-state">
        <i class="fas fa-inbox"></i>
        <p>Nhân viên này chưa có hóa đơn nào</p>
      </div>
    </div>

    <!-- Reset Password Dialog -->
    <el-dialog v-model="resetPasswordDialogVisible" title="Reset Mật Khẩu" width="400px">
      <div class="reset-password-content">
        <p class="confirm-text">
          Bạn có chắc chắn muốn reset mật khẩu cho nhân viên <strong>{{ staff.hoTen }}</strong> về <strong>123456</strong>?
        </p>
      </div>
      <template #footer>
        <el-button @click="resetPasswordDialogVisible = false">Hủy</el-button>
        <el-button type="warning" @click="resetPassword">Reset Mật Khẩu</el-button>
      </template>
    </el-dialog>

    <!-- Edit Dialog -->
    <el-dialog v-model="editDialogVisible" title="Chỉnh Sửa Nhân Viên" width="600px">
      <el-form
        ref="formRef"
        :model="editFormData"
        :rules="rules"
        label-width="140px"
      >
        <el-form-item label="Họ Tên" prop="hoTen">
          <el-input v-model="editFormData.hoTen" />
        </el-form-item>
        <el-form-item label="Ngày Sinh" prop="ngaySinh">
          <el-date-picker
            v-model="editFormData.ngaySinh"
            type="date"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="Giới Tính" prop="gioiTinh">
          <el-select v-model="editFormData.gioiTinh">
            <el-option label="Nam" value="Nam" />
            <el-option label="Nữ" value="Nữ" />
            <el-option label="Khác" value="Khác" />
          </el-select>
        </el-form-item>
        <el-form-item label="Số Điện Thoại" prop="dienThoai">
          <el-input v-model="editFormData.dienThoai" />
        </el-form-item>
        <el-form-item label="Địa Chỉ" prop="diaChi">
          <el-input v-model="editFormData.diaChi" type="textarea" :rows="3" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editDialogVisible = false">Hủy</el-button>
        <el-button type="primary" @click="saveEdit">Lưu</el-button>
      </template>
    </el-dialog>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import axios from 'axios';

const API_URL = 'https://localhost:7283/api';
const router = useRouter();
const route = useRoute();

// Data
const staff = ref({});
const staffInvoices = ref([]);
const invoiceSearch = ref('');
const selectedStatus = ref(null);
const loadingInvoices = ref(false);
const editDialogVisible = ref(false);
const resetPasswordDialogVisible = ref(false);
const editFormData = ref({});
const createFormData = ref({});
const formRef = ref(null);
const createFormRef = ref(null);
const currentPage = ref(1);
const itemsPerPage = ref(9);
const isCreateMode = computed(() => route.params.maNV === 'new');

const rules = {
  hoTen: [
    { required: true, message: 'Vui lòng nhập họ tên', trigger: 'blur' }
  ],
  dienThoai: [
    { required: true, message: 'Vui lòng nhập số điện thoại', trigger: 'blur' }
  ]
};

const createRules = {
  hoTen: [
    { required: true, message: 'Vui lòng nhập họ tên', trigger: 'blur' }
  ],
  ngaySinh: [
    { required: true, message: 'Vui lòng chọn ngày sinh', trigger: 'change' }
  ],
  gioiTinh: [
    { required: true, message: 'Vui lòng chọn giới tính', trigger: 'change' }
  ],
  dienThoai: [
    { required: true, message: 'Vui lòng nhập số điện thoại', trigger: 'blur' }
  ],
  diaChi: [
    { required: true, message: 'Vui lòng nhập địa chỉ', trigger: 'blur' }
  ],
  chucVu: [
    { required: true, message: 'Vui lòng chọn chức vụ', trigger: 'change' }
  ]
};

// Computed
const totalRevenue = computed(() => {
  return staffInvoices.value.reduce((sum, invoice) => sum + (invoice.tongTien || 0), 0);
});

const filteredInvoices = computed(() => {
  let result = staffInvoices.value;

  if (invoiceSearch.value) {
    const search = invoiceSearch.value.toLowerCase();
    result = result.filter(invoice =>
      invoice.maHD?.toLowerCase().includes(search)
    );
  }

  if (selectedStatus.value !== null) {
    result = result.filter(invoice => invoice.trangThai === selectedStatus.value);
  }

  return result;
});

const paginatedInvoices = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return filteredInvoices.value.slice(start, end);
});

// Methods
const formatDate = (row, column, cellValue) => {
  if (!cellValue) return '';
  const date = new Date(cellValue);
  return date.toLocaleDateString('vi-VN');
};

const formatCurrency = (row, column, cellValue) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(cellValue || 0);
};

const formatPaymentStatus = (row, column, cellValue) => {
  return cellValue ? 'Đã Thanh Toán' : 'Chưa Thanh Toán';
};

const formatDeliveryStatus = (row, column, cellValue) => {
  const statuses = {
    '-1': 'Hủy',
    '-2': 'Hủy',
    '-3': 'Hủy',
    '0': 'Đã đặt',
    '1': 'Đã xác nhận',
    '2': 'Đã giao',
    '3': 'Đã nhận'
  };
  return statuses[cellValue] || 'Không xác định';
};

const fetchStaffDetail = async () => {
  try {
    const maNV = route.params.maNV;
    if (maNV === 'new') return; // Skip khi ở mode create
    const response = await axios.get(`${API_URL}/NhanVien/${maNV}`);
    staff.value = response.data;
    editFormData.value = { ...response.data };
  } catch (error) {
    ElMessage.error('Lỗi khi tải thông tin nhân viên');
    console.error(error);
  }
};

const fetchInvoices = async () => {
  loadingInvoices.value = true;
  try {
    const maNV = route.params.maNV;
    if (maNV === 'new') return; // Skip khi ở mode create
    const response = await axios.get(`${API_URL}/HoaDon/nhanvien/${maNV}`);
    staffInvoices.value = response.data || [];
  } catch (error) {
    ElMessage.error('Lỗi khi tải danh sách hóa đơn');
    console.error(error);
  } finally {
    loadingInvoices.value = false;
  }
};

const goBack = () => {
  router.push('/admin/nhanvien');
};

const editStaff = () => {
  editFormData.value = { ...staff.value };
  editDialogVisible.value = true;
};

const saveEdit = async () => {
  if (!formRef.value) return;
  await formRef.value.validate();

  try {
    await axios.put(`${API_URL}/NhanVien/${staff.value.maNV}`, editFormData.value);
    ElMessage.success('Cập nhật thông tin thành công');
    editDialogVisible.value = false;
    fetchStaffDetail();
  } catch (error) {
    ElMessage.error('Lỗi khi cập nhật thông tin: ' + error.response?.data?.message);
  }
};

const confirmDelete = () => {
  ElMessageBox.confirm(
    `Bạn có chắc chắn muốn xóa nhân viên "${staff.value.hoTen}"?`,
    'Xác Nhận Xóa',
    {
      confirmButtonText: 'Xóa',
      cancelButtonText: 'Hủy',
      type: 'warning'
    }
  )
    .then(async () => {
      try {
        await axios.delete(`${API_URL}/NhanVien/${staff.value.maNV}`);
        ElMessage.success('Xóa nhân viên thành công');
        router.push('/admin/nhanvien');
      } catch (error) {
        ElMessage.error('Lỗi khi xóa nhân viên');
      }
    })
    .catch(() => {});
};

const createStaff = async () => {
  if (!createFormRef.value) return;
  await createFormRef.value.validate();

  try {
    await axios.post(`${API_URL}/NhanVien`, createFormData.value);
    ElMessage.success({
      title: 'Thành công!',
      message: 'Thêm nhân viên thành công! Tài khoản đã được tạo với mật khẩu mặc định: 123456',
      duration: 4000
    });
    router.push('/admin/nhanvien');
  } catch (error) {
    ElMessage.error('Lỗi khi thêm nhân viên: ' + (error.response?.data?.message || error.message));
  }
};

const confirmResetPassword = () => {
  resetPasswordDialogVisible.value = true;
};

const resetPassword = async () => {
  try {
    await axios.post(`${API_URL}/TaiKhoan/reset-password/${staff.value.maNV}`, {
      newPassword: '123456'
    });
    ElMessage.success('Reset mật khẩu thành công! Mật khẩu mới: 123456');
    resetPasswordDialogVisible.value = false;
  } catch (error) {
    ElMessage.error('Lỗi khi reset mật khẩu: ' + (error.response?.data?.message || error.message));
  }
};

const fetchInvoiceDetail = async (invoice) => {
  loadingInvoiceDetail.value = true;
  try {
    const response = await axios.get(`${API_URL}/HoaDon/${invoice.maHD}`);
    selectedInvoice.value = response.data;
    
    // Fetch invoice items (chi tiết dòng hóa đơn)
    try {
      const itemsResponse = await axios.get(`${API_URL}/HoaDon/${invoice.maHD}/items`);
      invoiceItems.value = itemsResponse.data || [];
    } catch (error) {
      console.error('Lỗi khi tải chi tiết sản phẩm:', error);
      invoiceItems.value = [];
    }
    
    invoiceDetailDialogVisible.value = true;
  } catch (error) {
    ElMessage.error('Lỗi khi tải chi tiết hóa đơn');
    console.error(error);
  } finally {
    loadingInvoiceDetail.value = false;
  }
};

const viewInvoiceDetail = (invoice) => {
  const id = invoice.maHD || invoice.MaHD;
  if (!id) return;
  router.push(`/admin/hoadon/${encodeURIComponent(id)}`);
};

// Watch để reset page khi filter thay đổi
watch([invoiceSearch, selectedStatus], () => {
  currentPage.value = 1;
});

onMounted(() => {
  fetchStaffDetail();
  fetchInvoices();
});
</script>

<style scoped>
/* Create Section */
.create-section {
  padding: 30px;
  background: linear-gradient(135deg, #f5f7fa 0%, #e8eef5 100%);
  min-height: 100vh;
}

.create-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  background: white;
  padding: 25px 30px;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.header-content {
  flex: 1;
}

.header-title {
  font-size: 28px;
  font-weight: 700;
  color: #0d3d47;
  margin: 0 0 8px 0;
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-title i {
  color: #17a2b8;
  font-size: 32px;
}

.header-subtitle {
  font-size: 14px;
  color: #909399;
  margin: 0;
}

.create-header .btn-back {
  color: #909399;
  font-size: 16px;
  transition: all 0.3s ease;
}

.create-header .btn-back:hover {
  color: #17a2b8;
}

.create-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
  justify-content: center;
}

.info-box {
  background: linear-gradient(135deg, #e8f4f8 0%, #f0fafc 100%);
  border: 1px solid #b3e5fc;
  border-radius: 8px;
  padding: 16px 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
  color: #0d5a6b;
}

.info-box i {
  font-size: 18px;
  color: #17a2b8;
  flex-shrink: 0;
}

.info-box strong {
  color: #e6424e;
  font-weight: 600;
}

.create-card {
  width: 100%;
  max-width: 900px;
  margin: 0 auto;
  box-shadow: 0 2px 16px rgba(0, 0, 0, 0.1);
  border: 1px solid #ebeef5;
}

.create-card :deep(.el-card__body) {
  padding: 40px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-bottom: 16px;
}

.form-col {
  flex: 1;
}

.form-col.full {
  grid-column: 1 / -1;
}

.create-card :deep(.el-form-item) {
  margin-bottom: 20px;
}

.create-card :deep(.el-form-item__label) {
  font-weight: 600;
  color: #303133;
  font-size: 14px;
  margin-bottom: 8px;
}

.create-card :deep(.el-input__wrapper) {
  background: #f5f7fa;
  border: 1px solid #dcdfe6;
  border-radius: 6px;
}

.create-card :deep(.el-input__wrapper:hover) {
  border-color: #17a2b8;
}

.create-card :deep(.el-input__wrapper.is-focus) {
  border-color: #17a2b8;
  box-shadow: 0 0 0 2px rgba(23, 162, 184, 0.1);
}

.create-card :deep(.el-input__prefix) {
  color: #17a2b8;
}

.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 40px;
  padding-top: 24px;
  border-top: 1px solid #ebeef5;
}

.form-actions .btn-cancel {
  min-width: 120px;
  height: 40px;
  border-radius: 6px;
  font-weight: 500;
  border: 1px solid #dcdfe6;
  color: #606266;
  background: #fff;
}

.form-actions .btn-cancel:hover {
  color: #303133;
  border-color: #b4b4b6;
}

.form-actions .btn-submit {
  min-width: 150px;
  height: 40px;
  border-radius: 6px;
  font-weight: 500;
  background: linear-gradient(135deg, #17a2b8 0%, #20b2aa 100%);
  border: none;
}

.form-actions .btn-submit:hover {
  background: linear-gradient(135deg, #0d8fa0 0%, #1fa399 100%);
}

.reset-password-content {
  padding: 10px 0;
}

.reset-password-content .confirm-text {
  font-size: 14px;
  color: #303133;
  line-height: 1.6;
  margin: 0;
}

.reset-password-content .confirm-text strong {
  color: #e6424e;
  font-weight: 600;
}

.nhanvien-detail-container {
  padding: 20px;
  background: linear-gradient(135deg, #f5f7fa 0%, #e8eef5 100%);
  min-height: 100vh;
}

.page-title {
  font-size: 28px;
  font-weight: 800;
  color: #0d3d47;
  margin: 0 0 20px 0;
  padding: 0 0 16px 0;
  border-bottom: 2px solid #17a2b8;
}

.staff-info-section {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: 20px;
  margin-bottom: 30px;
}

.info-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  grid-column: span 3;
}

.info-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f4f8;
  justify-content: space-between;
}

.info-header-back {
  display: flex;
  align-items: center;
}

.btn-back {
  color: #17a2b8 !important;
  font-weight: 600;
  padding: 8px 16px !important;
  border-radius: 8px !important;
  white-space: nowrap;
}

.btn-back:hover {
  color: #20b2aa !important;
  background: rgba(23, 162, 184, 0.05) !important;
}

.avatar-container {
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: linear-gradient(135deg, #17a2b8 0%, #20b2aa 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  color: white;
  box-shadow: 0 4px 12px rgba(23, 162, 184, 0.2);
}

.info-header-text {
  flex: 1;
}

.staff-name {
  font-size: 20px;
  font-weight: 800;
  color: #0d3d47;
  margin: 0 0 2px 0;
}

.staff-id {
  font-size: 13px;
  color: #999999;
  margin: 0;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 16px;
  margin-bottom: 16px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.info-item.full-width {
  grid-column: 1 / -1;
}

.info-item .label {
  font-size: 11px;
  font-weight: 600;
  color: #999999;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-item .value {
  font-size: 14px;
  color: #0d3d47;
  font-weight: 600;
}

.info-actions {
  display: flex;
  gap: 12px;
  padding-top: 16px;
  border-top: 1px solid #f0f4f8;
}

.info-actions :deep(.el-button) {
  flex: 1;
  border-radius: 10px !important;
  font-weight: 600;
  padding: 10px 20px !important;
}

.info-actions :deep(.el-button:hover) {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.stats-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.stat-card {
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  display: flex;
  align-items: center;
  gap: 12px;
  border-left: 4px solid #17a2b8;
}

.stat-card:hover {
  box-shadow: 0 6px 16px rgba(23, 162, 184, 0.12);
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 10px;
  background: linear-gradient(135deg, #17a2b8 0%, #20b2aa 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: white;
  flex-shrink: 0;
}

.stat-content {
  flex: 1;
  min-width: 0;
}

.stat-label {
  font-size: 11px;
  font-weight: 600;
  color: #999999;
  margin: 0;
  text-transform: uppercase;
}

.stat-value {
  font-size: 18px;
  font-weight: 800;
  color: #0d3d47;
  margin: 2px 0 0 0;
  overflow: hidden;
  text-overflow: ellipsis;
}

.invoices-section {
  background: white;
  border-radius: 16px;
  padding: 30px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
}

.section-title {
  font-size: 20px;
  font-weight: 800;
  color: #0d3d47;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 12px;
}

.section-title i {
  color: #17a2b8;
  font-size: 24px;
}

.invoice-count {
  font-size: 14px;
  font-weight: 600;
  color: #6c757d;
  background: #f0fafb;
  padding: 6px 12px;
  border-radius: 20px;
}

.invoice-filters {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  align-items: center;
}

.filter-input {
  flex: 1;
  max-width: 350px;
}

.filter-input :deep(.el-input__wrapper) {
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.filter-select {
  min-width: 180px;
}

.filter-select :deep(.el-input__wrapper) {
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.table-container {
  border-radius: 12px;
  overflow: hidden;
  background: #fafbfc;
}

.table-container :deep(.el-table__header th) {
  background: linear-gradient(135deg, #f8fafc 0%, #f0f4f8 100%);
  font-weight: 700;
  color: #0d3d47;
  border-bottom: 2px solid #17a2b8;
  padding: 16px 12px;
}

.table-container :deep(.el-table__body tr) {
  background: white;
  border-bottom: 1px solid #e8eaed;
}

.table-container :deep(.el-table__body tr:hover) {
  background-color: #f8fafc !important;
}

.table-container :deep(.el-table__body td) {
  padding: 14px 12px;
  color: #333333;
  font-size: 14px;
}

.table-container :deep(.el-tag) {
  border-radius: 6px;
  font-weight: 600;
}

.invoices-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
}

.invoice-card {
  background: white;
  border: 1px solid #e8eaed;
  border-radius: 12px;
  padding: 20px;
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.invoice-card:hover {
  box-shadow: 0 8px 20px rgba(23, 162, 184, 0.1);
  border-color: #17a2b8;
}

.invoice-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
}

.invoice-id {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.invoice-id .label {
  font-size: 11px;
  font-weight: 600;
  color: #6c757d;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.invoice-id .value {
  font-size: 16px;
  font-weight: 700;
  color: #0d3d47;
}

.status-tag {
  border-radius: 6px;
  font-weight: 600;
}

.invoice-card-body {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  padding: 12px 0;
  border-top: 1px solid #f0f4f8;
  border-bottom: 1px solid #f0f4f8;
}

.invoice-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.item-label {
  font-size: 11px;
  font-weight: 600;
  color: #6c757d;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.item-value {
  font-size: 15px;
  font-weight: 600;
  color: #0d3d47;
}

.item-value.amount {
  color: #10B981;
  font-size: 16px;
  font-weight: 700;
}

.invoice-card-footer {
  display: flex;
  justify-content: center;
}

.invoice-card-footer :deep(.el-button) {
  padding: 8px 16px !important;
  border-radius: 8px !important;
}

@media (max-width: 1024px) {
  .invoices-list {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  }
}

@media (max-width: 768px) {
  .invoices-list {
    grid-template-columns: 1fr;
  }

  .invoice-card-body {
    grid-template-columns: 1fr;
  }
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #999999;
}

.empty-state i {
  font-size: 48px;
  color: #d9d9d9;
  margin-bottom: 16px;
  display: block;
}

.empty-state p {
  font-size: 16px;
  color: #999999;
}

.pagination-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 30px;
  padding: 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
}

.pagination-wrapper :deep(.el-pagination) {
  display: flex;
  justify-content: center;
}

.pagination-wrapper :deep(.el-pager li) {
  border-radius: 6px;
  margin: 0 4px;
}

.pagination-wrapper :deep(.el-pager li.active) {
  background: linear-gradient(135deg, #17a2b8 0%, #20b2aa 100%);
  color: white;
}

.pagination-wrapper :deep(.btn-prev),
.pagination-wrapper :deep(.btn-next) {
  border-radius: 6px;
  color: #17a2b8;
}

.pagination-wrapper :deep(.btn-prev:hover),
.pagination-wrapper :deep(.btn-next:hover) {
  color: #20b2aa;
}

/* Responsive */
@media (max-width: 1024px) {
  .info-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .invoices-list {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  }
}

@media (max-width: 768px) {
  .nhanvien-detail-container {
    padding: 16px;
  }

  .detail-header {
    margin-bottom: 20px;
    flex-direction: column;
    align-items: flex-start;
  }

  .page-title {
    font-size: 22px;
  }

  .staff-info-section {
    grid-template-columns: 1fr;
  }

  .info-card {
    grid-column: span 1;
    padding: 16px;
  }

  .info-header {
    margin-bottom: 16px;
    padding-bottom: 12px;
  }

  .avatar {
    width: 56px;
    height: 56px;
    font-size: 28px;
  }

  .staff-name {
    font-size: 18px;
  }

  .info-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
    margin-bottom: 12px;
  }

  .info-item.full-width {
    grid-column: 1 / -1;
  }

  .info-actions {
    flex-direction: column;
    padding-top: 12px;
    gap: 10px;
  }

  .stats-container {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .stat-card {
    padding: 12px;
    gap: 10px;
  }

  .stat-icon {
    width: 40px;
    height: 40px;
    font-size: 18px;
  }

  .stat-value {
    font-size: 16px;
  }

  .invoices-list {
    grid-template-columns: 1fr;
  }

  .invoice-card {
    padding: 16px;
    gap: 12px;
  }

  .invoice-card-body {
    grid-template-columns: 1fr;
    gap: 10px;
    padding: 10px 0;
  }
}

/* Responsive */
@media (max-width: 1024px) {
  .info-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .invoices-list {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .staff-info-section {
    grid-template-columns: 1fr;
  }

  .info-card .info-header {
    flex-direction: column;
  }

  .info-header-back {
    position: absolute;
    top: 10px;
    right: 10px;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }

  .invoices-list {
    grid-template-columns: 1fr;
  }

  .invoice-card-body {
    grid-template-columns: 1fr;
    gap: 10px;
    padding: 10px 0;
  }
}
</style>
