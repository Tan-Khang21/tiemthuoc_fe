<template>
    <!-- Search & Filter Card -->
    <el-card class="search-card" shadow="hover">
      <div style="display: flex; gap: 12px; align-items: center; flex-wrap: wrap;">
        <el-input
          v-model="searchQuery"
          placeholder="Tìm kiếm theo tên hoặc số điện thoại..."
          prefix-icon="Search"
          clearable
          style="flex: 1; min-width: 250px;"
          @input="handleSearch"
        />
        <el-button type="primary" @click="handleSearch">
          <i class="fas fa-search"></i> Tìm kiếm
        </el-button>
        <el-button @click="refreshData">
          <i class="fas fa-sync-alt"></i> Làm mới
        </el-button>
      </div>
    </el-card>

    <!-- Customers Table -->
    <el-card class="table-card" shadow="hover">
      <template #header>
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="font-weight: 600;">Danh sách khách hàng ({{ customers.length }})</span>
        </div>
      </template>

      <el-table :data="filteredCustomers" stripe style="width: 100%" v-loading="loading">
        <el-table-column prop="makh" label="Mã KH" width="120" />
        <el-table-column prop="hoTen" label="Họ Tên" min-width="180" />
        <el-table-column prop="dienThoai" label="Số Điện Thoại" width="140" />
        <el-table-column prop="diaChi" label="Địa Chỉ" min-width="250" />
        <el-table-column prop="email" label="Email" min-width="250" />
        <el-table-column label="Hành Động" width="130" align="center" fixed="right">
          <template #default="{ row }">
            <el-button
              type="primary"
              size="small"
              @click="handleEdit(row)"
              link
            >
              <i class="fas fa-edit"></i> Sửa
            </el-button>
            <el-button
              type="success"
              size="small"
              @click="handleViewPurchaseHistory(row)"
              link
            >
              <i class="fas fa-history"></i> Xem
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- Edit Dialog -->
    <el-dialog
      title="Chỉnh Sửa Khách Hàng"
      v-model="dialogVisible"
      width="600px"
      @close="resetForm"
    >
      <el-form :model="formData" ref="formRef" label-width="140px">
        <el-form-item label="Mã KH">
          <el-input v-model="formData.makh" disabled />
        </el-form-item>
        <el-form-item label="Họ Tên" required>
          <el-input v-model="formData.hoTen" placeholder="Nhập họ tên khách hàng" />
        </el-form-item>
        <el-form-item label="Số Điện Thoại" required>
          <el-input v-model="formData.dienThoai" placeholder="Nhập số điện thoại" />
        </el-form-item>
        <el-form-item label="Địa Chỉ">
          <el-input v-model="formData.diaChi" placeholder="Nhập địa chỉ" type="textarea" :rows="2" />
        </el-form-item>
        <el-form-item label="Email">
          <el-input v-model="formData.email" disabled />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">Hủy</el-button>
        <el-button type="primary" @click="handleSave">Lưu</el-button>
      </template>
    </el-dialog>

    <!-- Purchase History Dialog -->
    <el-dialog
      title="📋 Lịch Sử Mua Hàng"
      v-model="historyDialogVisible"
      width="95%"
      max-width="1400px"
      :modal-append-to-body="false"
      @close="resetHistory"
      class="history-dialog"
      destroy-on-close
    >
      <template #header="{ close }">
        <div class="dialog-header-custom">
          <div class="header-title">
            <i class="fas fa-history"></i>
            <span>Lịch Sử Mua Hàng</span>
          </div>
          <button class="close-btn" @click="close">
            <i class="fas fa-times"></i>
          </button>
        </div>
      </template>

      <el-tabs class="history-tabs" tab-position="top">
        <!-- Lịch Sử Tab -->
        <el-tab-pane name="history">
          <template #label>
            <div class="tab-label">
              <i class="fas fa-list"></i>
              <span>Lịch Sử {{ `(${purchaseHistory.length})` }}</span>
            </div>
          </template>
          
          <div class="table-wrapper" v-loading="historyLoading">
            <el-table 
              :data="paginatedPurchaseHistory" 
              stripe 
              max-height="380"
              style="width: 100%"
              :row-class-name="tableRowClassName"
            >
              <el-table-column prop="maHD" label="Mã Hóa Đơn" width="180" sortable>
                <template #default="{ row }">
                  <span class="invoice-code">{{ row.maHD }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="ngayLap" label="Ngày Lập" width="170" sortable>
                <template #default="{ row }">
                  <span class="date-time">{{ new Date(row.ngayLap).toLocaleString('vi-VN') }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="tongTien" label="Tổng Tiền" width="140" align="right" sortable>
                <template #default="{ row }">
                  <span class="amount">{{ row.tongTien?.toLocaleString('vi-VN') }} ₫</span>
                </template>
              </el-table-column>
              <el-table-column prop="trangThaiGiaoHangName" label="Trạng Thái" width="120">
                <template #default="{ row }">
                  <el-tag 
                    :type="getStatusType(row.trangThaiGiaoHang)"
                    :class="`status-tag status-${row.trangThaiGiaoHang}`"
                  >
                    {{ row.trangThaiGiaoHangName }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="phuongThucTTName" label="PT Thanh Toán" width="130">
                <template #default="{ row }">
                  <span v-if="row.phuongThucTTName" class="payment-method">
                    <i class="fas fa-credit-card"></i> {{ row.phuongThucTTName }}
                  </span>
                  <span v-else class="text-muted">-</span>
                </template>
              </el-table-column>
              <el-table-column prop="tenNV" label="Nhân Viên" width="140">
                <template #default="{ row }">
                  <span v-if="row.tenNV" class="staff-name">
                    <i class="fas fa-user"></i> {{ row.tenNV }}
                  </span>
                  <span v-else class="text-muted">-</span>
                </template>
              </el-table-column>
              <el-table-column prop="ghiChu" label="Ghi Chú" min-width="250">
                <template #default="{ row }">
                  <el-tooltip :content="row.ghiChu" placement="top" v-if="row.ghiChu">
                    <span class="note-text">{{ truncateText(row.ghiChu, 50) }}</span>
                  </el-tooltip>
                  <span v-else class="text-muted">-</span>
                </template>
              </el-table-column>
            </el-table>
            
            <!-- Pagination -->
            <div class="pagination-wrapper" v-if="purchaseHistory.length > 0">
              <el-pagination
                v-model:current-page="historyCurrentPage"
                v-model:page-size="historyPageSize"
                :page-sizes="[10, 20, 50]"
                :total="purchaseHistory.length"
                layout="total, sizes, prev, pager, next, jumper"
                background
                small
              />
            </div>
            <div v-else class="empty-state">
              <i class="fas fa-inbox"></i>
              <p>Không có lịch sử mua hàng</p>
            </div>
          </div>
        </el-tab-pane>

        <!-- Đơn Hiện Tại Tab -->
        <el-tab-pane name="current">
          <template #label>
            <div class="tab-label">
              <i class="fas fa-shopping-cart"></i>
              <span>Đơn Hiện Tại {{ `(${currentOrder.length})` }}</span>
            </div>
          </template>

          <div class="table-wrapper" v-loading="historyLoading">
            <el-table 
              :data="currentOrder" 
              stripe 
              max-height="380"
              style="width: 100%"
              :row-class-name="tableRowClassName"
            >
              <el-table-column prop="maHD" label="Mã Hóa Đơn" width="230" sortable>
                <template #default="{ row }">
                  <span class="invoice-code">{{ row.maHD }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="ngayLap" label="Ngày Lập" width="170" sortable>
                <template #default="{ row }">
                  <span class="date-time">{{ new Date(row.ngayLap).toLocaleString('vi-VN') }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="tongTien" label="Tổng Tiền" width="140" align="right" sortable>
                <template #default="{ row }">
                  <span class="amount">{{ row.tongTien?.toLocaleString('vi-VN') }} ₫</span>
                </template>
              </el-table-column>
              <el-table-column prop="trangThaiGiaoHangName" label="Trạng Thái" width="120">
                <template #default="{ row }">
                  <el-tag 
                    :type="getStatusType(row.trangThaiGiaoHang)"
                    :class="`status-tag status-${row.trangThaiGiaoHang}`"
                  >
                    {{ row.trangThaiGiaoHangName }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="ghiChu" label="Ghi Chú" min-width="250">
                <template #default="{ row }">
                  <el-tooltip :content="row.ghiChu" placement="top" v-if="row.ghiChu">
                    <span class="note-text">{{ truncateText(row.ghiChu, 60) }}</span>
                  </el-tooltip>
                  <span v-else class="text-muted">-</span>
                </template>
              </el-table-column>
            </el-table>
            
            <div v-if="currentOrder.length === 0" class="empty-state">
              <i class="fas fa-check-circle"></i>
              <p>Không có đơn hàng hiện tại</p>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-dialog>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import api from '@/api';

// States
const customers = ref([]);
const loading = ref(false);
const searchQuery = ref('');
const dialogVisible = ref(false);
const historyDialogVisible = ref(false);
const historyLoading = ref(false);
const formRef = ref(null);

// Pagination for history
const historyCurrentPage = ref(1);
const historyPageSize = ref(10);

// Form data
const formData = ref({
  makh: '',
  hoTen: '',
  dienThoai: '',
  diaChi: '',
  email: ''
});

// Purchase history
const purchaseHistory = ref([]);
const currentOrder = ref([]);

// Computed
const filteredCustomers = computed(() => {
  if (!searchQuery.value) return customers.value;
  const q = searchQuery.value.toLowerCase();
  return customers.value.filter(c => 
    (c.hoTen?.toLowerCase().includes(q) || 
     c.dienThoai?.includes(q) ||
     c.email?.toLowerCase().includes(q))
  );
});

// Paginated purchase history
const paginatedPurchaseHistory = computed(() => {
  const start = (historyCurrentPage.value - 1) * historyPageSize.value;
  const end = start + historyPageSize.value;
  return purchaseHistory.value.slice(start, end);
});

// Methods
const loadCustomers = async () => {
  try {
    loading.value = true;
    const response = await api.khachhang.getAll();
    console.log('API Response:', response);
    
    const rawData = response?.data?.data || response?.data || [];
    console.log('Raw data:', rawData);
    
    customers.value = rawData.map(c => {
      console.log('Mapping customer:', c);
      return {
        makh: c.makh || c.MaKh || c.MaKH || c.id || '',
        hoTen: c.hoTen || c.HoTen || c.tenKH || c.TenKH || '',
        dienThoai: c.dienThoai || c.DienThoai || c.soDienThoai || c.SoDienThoai || '',
        diaChi: c.diaChi || c.DiaChi || c.diaChiKH || c.DiaChiKH || '',
        email: c.email || c.Email || c.emailKH || c.EmailKH || ''
      };
    });
    console.log('Customers loaded:', customers.value);
  } catch (err) {
    console.error('Load customers error:', err);
    ElMessage.error('Lỗi tải danh sách khách hàng');
  } finally {
    loading.value = false;
  }
};

const handleEdit = (row) => {
  formData.value = { ...row };
  dialogVisible.value = true;
};

const handleViewPurchaseHistory = async (row) => {
  try {
    historyLoading.value = true;
    const response = await api.hoadon.getHistoryByKhachHang(row.makh);
    console.log('Purchase history response:', response);
    
    purchaseHistory.value = response?.data?.data?.history || [];
    currentOrder.value = response?.data?.data?.current || [];
    historyDialogVisible.value = true;
  } catch (err) {
    console.error('Load history error:', err);
    ElMessage.error('Lỗi tải lịch sử mua hàng');
  } finally {
    historyLoading.value = false;
  }
};

const handleSave = async () => {
  if (!formData.value.hoTen || !formData.value.dienThoai) {
    ElMessage.warning('Vui lòng nhập đầy đủ thông tin bắt buộc');
    return;
  }

  try {
    loading.value = true;
    // Chỉ gửi hoTen, dienThoai, diaChi (không gửi email)
    const updateData = {
      hoTen: formData.value.hoTen,
      dienThoai: formData.value.dienThoai,
      diaChi: formData.value.diaChi
    };
    await api.khachhang.update(formData.value.makh, updateData);
    ElMessage.success('Cập nhật khách hàng thành công');
    dialogVisible.value = false;
    await loadCustomers();
  } catch (err) {
    console.error('Save error:', err);
    ElMessage.error('Lỗi lưu khách hàng');
  } finally {
    loading.value = false;
  }
};

const handleSearch = () => {
  // Computed property sẽ tự động filter
};

const refreshData = async () => {
  searchQuery.value = '';
  await loadCustomers();
};

const resetForm = () => {
  formData.value = {
    makh: '',
    hoTen: '',
    dienThoai: '',
    diaChi: '',
    email: ''
  };
  if (formRef.value) {
    formRef.value.clearValidate();
  }
};

const resetHistory = () => {
  purchaseHistory.value = [];
  currentOrder.value = [];
  historyCurrentPage.value = 1;
};

// Helper functions
const truncateText = (text, length) => {
  return text?.length > length ? text.substring(0, length) + '...' : text;
};

const getStatusType = (status) => {
  if (status === -1 || status === -2 || status === -3) return 'danger'; // Hủy
  if (status === 0) return 'info'; // Đã đặt
  if (status === 1) return 'warning'; // Đã xác nhận
  if (status === 2) return 'warning'; // Đã giao
  if (status === 3) return 'success'; // Đã nhận
  return 'info';
};

const tableRowClassName = ({ row }) => {
  if (row.trangThaiGiaoHang === 3) return 'row-success'; // Đã nhận
  if (row.trangThaiGiaoHang === -1 || row.trangThaiGiaoHang === -2 || row.trangThaiGiaoHang === -3) return 'row-danger'; // Hủy
  return '';
};

// Lifecycle
onMounted(() => {
  loadCustomers();
});
</script>

<style scoped>
.khachhang-container {
  padding: 24px;
  background: #f5f7fa;
  min-height: 100vh;
}

.header-card {
  margin-bottom: 24px;
  border-radius: 8px;
  border: none;
}

.header-card :deep(.el-card__body) {
  padding: 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.search-card {
  margin-bottom: 24px;
  border-radius: 8px;
  border: none;
}

.table-card {
  border-radius: 8px;
  border: none;
}

.table-card :deep(.el-card__header) {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  border-bottom: none;
  padding: 16px 24px;
  color: white;
  font-weight: 600;
}

.table-card :deep(.el-table) {
  background: white;
}

.table-card :deep(.el-table__header th) {
  background-color: #f0f9ff;
  color: #0c3d47;
  font-weight: 600;
}

.table-card :deep(.el-table__row:hover > td) {
  background-color: #f5f7fa !important;
}

/* ===== History Dialog Styles ===== */
:deep(.history-dialog) {
  --el-dialog-border-radius: 12px;
}

:deep(.history-dialog .el-dialog) {
  margin-top: -120px !important;
}

:deep(.history-dialog .el-dialog__header) {
  border-bottom: 1px solid #e0e0e0;
  padding: 16px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

:deep(.history-dialog .el-dialog__title) {
  display: none;
}

:deep(.history-dialog .el-dialog__body) {
  padding: 0 !important;
  max-height: calc(100vh - 280px);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  background: #ffffff;
}

.dialog-header-custom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.header-title {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 18px;
  font-weight: 600;
  color: white;
}

.header-title i {
  font-size: 20px;
}

.close-btn {
  background: none;
  border: none;
  color: white;
  font-size: 20px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background 0.3s;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

/* Tab Styles */
:deep(.history-tabs) {
  display: flex;
  flex-direction: column;
  height: 100%;
}

:deep(.history-tabs .el-tabs__header) {
  background: #f5f7fa;
  border-bottom: 2px solid #e0e0e0;
  margin: 0;
}

:deep(.history-tabs .el-tabs__nav) {
  padding: 0 24px;
}

:deep(.history-tabs .el-tabs__item) {
  padding: 12px 24px;
  font-size: 14px;
  font-weight: 500;
}

:deep(.history-tabs .el-tabs__item.is-active) {
  color: #667eea;
  font-weight: 600;
}

:deep(.history-tabs .el-tabs__active-bar) {
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  height: 3px;
}

.tab-label {
  display: flex;
  align-items: center;
  gap: 8px;
}

.tab-label i {
  font-size: 16px;
}

:deep(.history-tabs .el-tabs__content) {
  flex: 1;
  overflow: hidden;
  padding: 8px 12px;
  background: white;
}

:deep(.history-tabs .el-tab-pane) {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.table-wrapper {
  display: flex;
  flex-direction: column;
  height: 100%;
  gap: 4px;
}

.table-wrapper :deep(.el-table) {
  flex: 1;
  overflow-y: auto;
}

:deep(.table-wrapper .el-table__header th) {
  background: linear-gradient(135deg, #f5f7fa 0%, #eff2f5 100%);
  color: #0c3d47;
  font-weight: 600;
  border: none;
}

:deep(.table-wrapper .el-table__body tr:hover > td) {
  background-color: #f0f9ff !important;
}

:deep(.table-wrapper .row-success) {
  background-color: #f0f9ff !important;
}

:deep(.table-wrapper .row-danger) {
  background-color: #fef0f0 !important;
}

/* Invoice Code Styles */
.invoice-code {
  font-weight: 600;
  color: #667eea;
  font-family: 'Courier New', monospace;
  font-size: 12px;
}

/* Date Time Styles */
.date-time {
  color: #666;
  font-size: 13px;
}

/* Amount Styles */
.amount {
  font-weight: 600;
  color: #27a745;
  font-size: 13px;
}

/* Status Tag */
.status-tag {
  font-size: 12px;
  font-weight: 600;
  border-radius: 4px;
  padding: 4px 10px;
}

:deep(.status-tag.el-tag--success) {
  background-color: #e7f5eb;
  color: #27a745;
}

:deep(.status-tag.el-tag--danger) {
  background-color: #fef0f0;
  color: #f56c6c;
}

:deep(.status-tag.el-tag--warning) {
  background-color: #fff7e6;
  color: #e6a23c;
}

:deep(.status-tag.el-tag--info) {
  background-color: #e6f3ff;
  color: #409eff;
}

/* Payment Method */
.payment-method {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #666;
  font-size: 12px;
}

.payment-method i {
  color: #667eea;
  font-size: 13px;
}

/* Staff Name */
.staff-name {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #666;
  font-size: 12px;
}

.staff-name i {
  color: #764ba2;
  font-size: 13px;
}

/* Note Text */
.note-text {
  color: #666;
  font-size: 12px;
  line-height: 1.4;
}

/* Text Muted */
.text-muted {
  color: #999;
  font-size: 12px;
}

/* Pagination Wrapper */
.pagination-wrapper {
  display: flex;
  justify-content: center;
  padding: 8px 6px;
  background: linear-gradient(135deg, #f5f7fa 0%, #eff2f5 100%);
  border-top: 1px solid #e0e0e0;
  border-radius: 0 0 4px 4px;
}

:deep(.pagination-wrapper .el-pagination) {
  display: flex;
  justify-content: center;
}

:deep(.pagination-wrapper .el-pagination .btn-prev,
       .pagination-wrapper .el-pagination .btn-next,
       .pagination-wrapper .el-pagination .el-pager li) {
  background: white;
  color: #667eea;
  border-color: #e0e0e0;
}

:deep(.pagination-wrapper .el-pagination .btn-prev:hover,
       .pagination-wrapper .el-pagination .btn-next:hover,
       .pagination-wrapper .el-pagination .el-pager li:hover) {
  color: #764ba2;
  border-color: #667eea;
}

:deep(.pagination-wrapper .el-pagination .el-pager li.active) {
  color: white;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-color: #667eea;
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 300px;
  color: #999;
  font-size: 14px;
}

.empty-state i {
  font-size: 48px;
  margin-bottom: 16px;
  color: #ddd;
}

.empty-state p {
  margin: 0;
  font-size: 14px;
  color: #999;
}
</style>
