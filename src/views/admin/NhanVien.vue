<template>
    <!-- Search & Filter -->
    <div class="search-section">
      <el-input
        v-model="searchText"
        placeholder="Tìm kiếm theo tên, mã hoặc số điện thoại..."
        class="search-input"
        clearable
      >
        <template #prefix>
          <i class="fas fa-search"></i>
        </template>
      </el-input>
      <el-button type="primary" @click="openAddDialog" class="btn-add-staff">
        <i class="fas fa-plus"></i> Thêm Nhân Viên
      </el-button>
    </div>

    <!-- Table -->
    <div class="table-container">
      <el-table
        :data="filteredStaff"
        stripe
        style="width: 100%; border-radius: 10px; overflow: hidden;"
        :default-sort="{ prop: 'maNV', order: 'ascending' }"
      >
        <el-table-column prop="maNV" label="Mã NV" width="100" sortable />
        <el-table-column prop="hoTen" label="Họ Tên" width="200" />
        <el-table-column prop="ngaySinh" label="Ngày Sinh" width="120" :formatter="formatDate" />
        <el-table-column prop="gioiTinh" label="Giới Tính" width="100" />
        <el-table-column prop="dienThoai" label="Số Điện Thoại" width="130" />
        <el-table-column prop="diaChi" label="Địa Chỉ" min-width="200" />
        <el-table-column prop="chucVu" label="Chức Vụ" width="120" :formatter="formatRole" />
        <el-table-column label="Hành Động" width="250" fixed="right" align="center">
          <template #default="{ row }">
            <el-button link type="primary" @click="viewDetail(row)">
              <i class="fas fa-eye"></i> Xem Chi Tiết
            </el-button>
            <el-button link type="warning" @click="editStaff(row)">
              <i class="fas fa-edit"></i> Sửa
            </el-button>
            <el-button link type="danger" @click="deleteStaff(row)">
              <i class="fas fa-trash"></i> Xóa
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- Add/Edit Dialog -->
    <el-dialog v-model="dialogVisible" :title="isEdit ? 'Sửa Nhân Viên' : 'Thêm Nhân Viên'" width="600px">
      <el-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        label-width="140px"
      >
        <el-form-item label="Mã Nhân Viên" prop="maNV" v-if="!isEdit">
          <el-input v-model="formData.maNV" placeholder="Tự động sinh" disabled />
        </el-form-item>
        <el-form-item label="Họ Tên" prop="hoTen">
          <el-input v-model="formData.hoTen" placeholder="Nhập họ tên" />
        </el-form-item>
        <el-form-item label="Ngày Sinh" prop="ngaySinh">
          <el-date-picker
            v-model="formData.ngaySinh"
            type="date"
            placeholder="Chọn ngày sinh"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="Giới Tính" prop="gioiTinh">
          <el-select v-model="formData.gioiTinh" placeholder="Chọn giới tính">
            <el-option label="Nam" value="Nam" />
            <el-option label="Nữ" value="Nữ" />
            <el-option label="Khác" value="Khác" />
          </el-select>
        </el-form-item>
        <el-form-item label="Số Điện Thoại" prop="dienThoai">
          <el-input v-model="formData.dienThoai" placeholder="Nhập số điện thoại" />
        </el-form-item>
        <el-form-item label="Địa Chỉ" prop="diaChi">
          <el-input
            v-model="formData.diaChi"
            type="textarea"
            placeholder="Nhập địa chỉ"
            :rows="3"
          />
        </el-form-item>
        <el-form-item label="Chức Vụ" prop="chucVu">
          <el-select v-model="formData.chucVu" placeholder="Chọn chức vụ">
            <el-option label="Admin" :value="1" />
            <el-option label="Nhân Viên" :value="2" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">Hủy</el-button>
        <el-button type="primary" @click="saveStaff">Lưu</el-button>
      </template>
    </el-dialog>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import axios from 'axios';

const API_URL = 'https://localhost:7283/api';
const router = useRouter();

// Data
const staffList = ref([]);
const searchText = ref('');
const dialogVisible = ref(false);
const isEdit = ref(false);
const selectedStaff = ref(null);
const formRef = ref(null);

const formData = ref({
  maNV: '',
  hoTen: '',
  ngaySinh: null,
  gioiTinh: 'Nam',
  dienThoai: '',
  diaChi: '',
  chucVu: 2
});

const rules = {
  hoTen: [
    { required: true, message: 'Vui lòng nhập họ tên', trigger: 'blur' }
  ],
  dienThoai: [
    { required: true, message: 'Vui lòng nhập số điện thoại', trigger: 'blur' }
  ]
};

// Computed
const filteredStaff = computed(() => {
  if (!searchText.value) return staffList.value;
  const search = searchText.value.toLowerCase();
  return staffList.value.filter(staff =>
    staff.hoTen?.toLowerCase().includes(search) ||
    staff.maNV?.toLowerCase().includes(search) ||
    staff.dienThoai?.includes(search)
  );
});

// Methods
const formatDate = (row, column, cellValue) => {
  if (!cellValue) return '';
  const date = new Date(cellValue);
  return date.toLocaleDateString('vi-VN');
};

const formatCurrency = (row, column, cellValue) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(cellValue || 0);
};

const formatRole = (row, column, cellValue) => {
  return cellValue === 1 ? 'Admin' : 'Nhân Viên';
};

const formatPaymentStatus = (row, column, cellValue) => {
  return cellValue ? 'Đã Thanh Toán' : 'Chưa Thanh Toán';
};

const fetchStaff = async () => {
  try {
    const response = await axios.get(`${API_URL}/NhanVien`);
    staffList.value = response.data;
  } catch (error) {
    ElMessage.error('Lỗi khi tải danh sách nhân viên');
    console.error(error);
  }
};

const openAddDialog = () => {
  // Navigate tới trang tạo mới nhân viên (mode create)
  router.push({ name: 'admin-nhanvien-detail', params: { maNV: 'new' } });
};

const editStaff = (row) => {
  isEdit.value = true;
  formData.value = { ...row };
  dialogVisible.value = true;
};

const saveStaff = async () => {
  if (!formRef.value) return;
  await formRef.value.validate();

  try {
    if (isEdit.value) {
      await axios.put(`${API_URL}/NhanVien/${formData.value.maNV}`, formData.value);
      ElMessage.success('Cập nhật nhân viên thành công');
    } else {
      await axios.post(`${API_URL}/NhanVien`, formData.value);
      ElMessage.success('Thêm nhân viên thành công');
    }
    dialogVisible.value = false;
    fetchStaff();
  } catch (error) {
    ElMessage.error('Lỗi khi lưu nhân viên: ' + error.response?.data?.message);
  }
};

const deleteStaff = (row) => {
  ElMessageBox.confirm(
    `Bạn có chắc chắn muốn xóa nhân viên "${row.hoTen}"?`,
    'Xác Nhận Xóa',
    {
      confirmButtonText: 'Xóa',
      cancelButtonText: 'Hủy',
      type: 'warning'
    }
  )
    .then(async () => {
      try {
        await axios.delete(`${API_URL}/NhanVien/${row.maNV}`);
        ElMessage.success('Xóa nhân viên thành công');
        fetchStaff();
      } catch (error) {
        ElMessage.error('Lỗi khi xóa nhân viên');
      }
    })
    .catch(() => {});
};

const viewDetail = (row) => {
  router.push(`/admin/nhanvien/${row.maNV}`);
};

onMounted(() => {
  fetchStaff();
});
</script>

<style scoped>
.nhanvien-container {
  padding: 20px;
  background: linear-gradient(135deg, #f5f7fa 0%, #e8eef5 100%);
  min-height: auto;
}

.nhanvien-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  background: linear-gradient(135deg, #17a2b8 0%, #20b2aa 100%);
  padding: 30px 40px;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(23, 162, 184, 0.2);
  will-change: auto;
}

.nhanvien-header:hover {
  box-shadow: 0 12px 40px rgba(23, 162, 184, 0.3);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 20px;
}

.page-title {
  font-size: 32px;
  font-weight: 800;
  color: white;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 16px;
  letter-spacing: -0.5px;
}

.page-title i {
  color: #ffffff;
  font-size: 40px;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.15));
}

.header-right {
  display: flex;
  gap: 12px;
}

.header-right :deep(.el-button) {
  padding: 12px 28px !important;
  font-weight: 600;
  border-radius: 10px !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.header-right :deep(.el-button:hover) {
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
}

.search-section {
  margin-bottom: 25px;
  display: flex;
  gap: 12px;
  align-items: center;
}

.search-input {
  flex: 1;
  max-width: 500px;
  background: white !important;
  border-radius: 12px !important;
}

.search-input :deep(.el-input__wrapper) {
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.search-input:focus-within :deep(.el-input__wrapper) {
  box-shadow: 0 4px 16px rgba(23, 162, 184, 0.15);
  border-color: #17a2b8;
}

.btn-add-staff {
  white-space: nowrap;
  padding: 12px 24px !important;
  border-radius: 10px !important;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(23, 162, 184, 0.25);
}

.btn-add-staff:hover {
  box-shadow: 0 6px 20px rgba(23, 162, 184, 0.35);
}

.table-container {
  background: white;
  padding: 25px;
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
}

/* Table Styling */
.table-container :deep(.el-table) {
  --el-table-border-color: #e8e8e8;
  --el-table-header-bg-color: #f8fafc;
  --el-table-header-text-color: #0d3d47;
}

.table-container :deep(.el-table__header th) {
  background: linear-gradient(135deg, #f8fafc 0%, #f0f4f8 100%);
  font-weight: 700;
  color: #0d3d47;
  border-bottom: 2px solid #17a2b8;
}

.table-container :deep(.el-table__body tr:hover) {
  background-color: #f0fafb !important;
}

/* Table row styling - no transitions to prevent layout shift */

.table-container :deep(.el-table__body td) {
  padding: 16px 12px;
  color: #333333;
  font-size: 14px;
}

.table-container :deep(.el-table__body tr.current-row > td) {
  background-color: #f0fafb;
}

/* Button Styling in Table */
.table-container :deep(.el-button--link) {
  font-weight: 600;
  margin: 0 4px;
}

.table-container :deep(.el-button--link.is-text) {
  color: #17a2b8;
}

.table-container :deep(.el-button--link.is-text:hover) {
  color: #20b2aa;
  text-decoration: underline;
}

.table-container :deep(.el-button--link.is-text.el-button--danger:hover) {
  color: #ff4d6d;
}

.table-container :deep(.el-button--link.is-text.el-button--warning:hover) {
  color: #ffa500;
}

/* Dialog Styling */
:deep(.el-dialog) {
  border-radius: 16px !important;
}

:deep(.el-dialog__header) {
  border-bottom: 2px solid #f0f4f8;
  padding: 24px !important;
}

:deep(.el-dialog__title) {
  font-size: 20px;
  font-weight: 700;
  color: #0d3d47;
}

:deep(.el-dialog__body) {
  padding: 24px !important;
}

:deep(.el-form-item) {
  margin-bottom: 20px;
}

:deep(.el-form-item__label) {
  font-weight: 600;
  color: #0d3d47;
}

:deep(.el-input__wrapper),
:deep(.el-select__wrapper),
:deep(.el-date-editor__wrap) {
  border-radius: 10px !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

:deep(.el-input__wrapper:focus-within),
:deep(.el-select__wrapper:focus-within),
:deep(.el-date-editor__wrap:focus-within) {
  box-shadow: 0 4px 16px rgba(23, 162, 184, 0.15);
  border-color: #17a2b8;
}

:deep(.el-dialog__footer) {
  border-top: 2px solid #f0f4f8;
  padding: 16px 24px !important;
  text-align: right;
}

:deep(.el-dialog__footer .el-button) {
  padding: 10px 24px !important;
  border-radius: 8px !important;
  font-weight: 600;
}

:deep(.el-dialog__footer .el-button:hover) {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* Pagination & Empty State */
:deep(.el-table__empty-text) {
  color: #999999;
  font-size: 16px;
}

/* Status Badge */
.status-badge {
  display: inline-block;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  background: linear-gradient(135deg, #f0fafb 0%, #e8f7f9 100%);
  color: #17a2b8;
  border: 1px solid #17a2b8;
}

/* Animation */
@keyframes fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.nhanvien-container {
  animation: slideIn 0.3s ease;
}

/* Responsive */
@media (max-width: 768px) {
  .nhanvien-header {
    flex-direction: column;
    gap: 16px;
    padding: 20px;
  }

  .page-title {
    font-size: 24px;
  }

  .search-input {
    max-width: 100%;
  }

  .table-container {
    padding: 16px;
  }

  .table-container :deep(.el-table__body td) {
    padding: 12px 8px;
    font-size: 12px;
  }
}
</style>
