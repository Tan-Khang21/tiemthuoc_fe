<template>
  <div class="profile-page">
    <div class="profile-header">
      <div class="header-content">
        <i class="fas fa-user-circle"></i>
        <div>
          <h2>Thông Tin Tài Khoản</h2>
          <p>Quản lý thông tin cá nhân của bạn</p>
        </div>
      </div>
      <el-button type="primary" @click="showEditDialog = true" v-if="customerInfo">
        <i class="fas fa-edit"></i> Chỉnh Sửa
      </el-button>
    </div>

    <div v-if="loading" class="loading-container">
      <el-skeleton :rows="6" animated />
    </div>

    <div v-else-if="customerInfo" class="profile-content">
      <el-card class="info-card">
        <template #header>
          <div class="card-header">
            <i class="fas fa-id-card"></i>
            <span>Thông Tin Cá Nhân</span>
          </div>
        </template>
        
        <div class="info-grid">
          <div class="info-item">
            <label>Mã khách hàng</label>
            <div class="info-value">
              <i class="fas fa-hashtag"></i>
              <span>{{ customerInfo.makh }}</span>
            </div>
          </div>

          <div class="info-item">
            <label>Họ và tên</label>
            <div class="info-value">
              <i class="fas fa-user"></i>
              <span>{{ customerInfo.hoTen || 'Chưa cập nhật' }}</span>
            </div>
          </div>

          <div class="info-item">
            <label>Giới tính</label>
            <div class="info-value">
              <i :class="customerInfo.gioiTinh === 'Nam' ? 'fas fa-mars' : customerInfo.gioiTinh === 'Nữ' ? 'fas fa-venus' : 'fas fa-genderless'"></i>
              <span>{{ customerInfo.gioiTinh || 'Chưa cập nhật' }}</span>
            </div>
          </div>

          <div class="info-item">
            <label>Ngày sinh</label>
            <div class="info-value">
              <i class="fas fa-birthday-cake"></i>
              <span>{{ formatDate(customerInfo.ngaySinh) }}</span>
            </div>
          </div>

          <div class="info-item">
            <label>Số điện thoại</label>
            <div class="info-value">
              <i class="fas fa-phone"></i>
              <span>{{ customerInfo.dienThoai || 'Chưa cập nhật' }}</span>
            </div>
          </div>

          <div class="info-item full-width">
            <label>Địa chỉ</label>
            <div class="info-value">
              <i class="fas fa-map-marker-alt"></i>
              <span>{{ customerInfo.diaChi || 'Chưa cập nhật' }}</span>
            </div>
          </div>
        </div>
      </el-card>

      <el-card class="info-card">
        <template #header>
          <div class="card-header">
            <i class="fas fa-lock"></i>
            <span>Thông Tin Tài Khoản</span>
          </div>
        </template>
        
        <div class="info-grid">
          <div class="info-item">
            <label>Tên đăng nhập</label>
            <div class="info-value">
              <i class="fas fa-user-tag"></i>
              <span>{{ authStore.user?.TenDangNhap || 'N/A' }}</span>
            </div>
          </div>

          <div class="info-item">
            <label>Email</label>
            <div class="info-value">
              <i class="fas fa-envelope"></i>
              <span>{{ authStore.user?.Email || 'Chưa cập nhật' }}</span>
            </div>
          </div>
        </div>
      </el-card>
    </div>

    <el-card v-else class="empty-card">
      <el-empty description="Không tìm thấy thông tin khách hàng">
        <el-button type="primary" @click="loadCustomerInfo">
          <i class="fas fa-sync"></i> Tải lại
        </el-button>
      </el-empty>
    </el-card>

    <!-- Edit Dialog -->
    <el-dialog
      v-model="showEditDialog"
      title="Chỉnh Sửa Thông Tin"
      width="600px"
      :before-close="handleCloseEdit"
    >
      <el-form :model="editForm" label-width="120px" v-if="customerInfo">
        <el-form-item label="Họ và tên">
          <el-input v-model="editForm.hoTen" placeholder="Nhập họ và tên" />
        </el-form-item>
        
        <el-form-item label="Giới tính">
          <el-select v-model="editForm.gioiTinh" placeholder="Chọn giới tính">
            <el-option label="Nam" value="Nam" />
            <el-option label="Nữ" value="Nữ" />
            <el-option label="Khác" value="Khác" />
          </el-select>
        </el-form-item>

        <el-form-item label="Ngày sinh">
          <el-date-picker
            v-model="editForm.ngaySinh"
            type="date"
            placeholder="Chọn ngày sinh"
            format="DD/MM/YYYY"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>

        <el-form-item label="Số điện thoại">
          <el-input v-model="editForm.dienThoai" placeholder="Nhập số điện thoại" />
        </el-form-item>

        <el-form-item label="Địa chỉ">
          <el-input
            v-model="editForm.diaChi"
            type="textarea"
            :rows="3"
            placeholder="Nhập địa chỉ"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="showEditDialog = false">Hủy</el-button>
        <el-button type="primary" @click="handleSaveEdit" :loading="saving">
          Lưu Thay Đổi
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/store'
import { ElMessage } from 'element-plus'
import api from '@/api'

const authStore = useAuthStore()
const loading = ref(false)
const customerInfo = ref(null)
const showEditDialog = ref(false)
const saving = ref(false)

const editForm = ref({
  hoTen: '',
  gioiTinh: '',
  ngaySinh: '',
  dienThoai: '',
  diaChi: ''
})

const formatDate = (dateString) => {
  if (!dateString) return 'Chưa cập nhật'
  const date = new Date(dateString)
  return date.toLocaleDateString('vi-VN')
}

const loadCustomerInfo = async () => {
  try {
    loading.value = true
    
    // Lấy mã KH từ localStorage
    const userData = localStorage.getItem('user')
    if (!userData) {
      ElMessage.warning('Vui lòng đăng nhập lại')
      return
    }
    
    const user = JSON.parse(userData)
    const maKH = user.MaKH || user.maKH
    
    if (!maKH) {
      ElMessage.warning('Không tìm thấy mã khách hàng')
      return
    }

    console.log('Loading customer info for:', maKH)
    const response = await api.khachhang.getById(maKH)
    console.log('Customer info response:', response.data)
    
    customerInfo.value = response.data
    
    // Cập nhật editForm với dữ liệu hiện tại
    if (response.data) {
      editForm.value = {
        hoTen: response.data.hoTen || '',
        gioiTinh: response.data.gioiTinh || '',
        ngaySinh: response.data.ngaySinh ? response.data.ngaySinh.split('T')[0] : '',
        dienThoai: response.data.dienThoai || '',
        diaChi: response.data.diaChi || ''
      }
    }
  } catch (error) {
    console.error('Error loading customer info:', error)
    ElMessage.error('Không thể tải thông tin khách hàng')
  } finally {
    loading.value = false
  }
}

const handleCloseEdit = () => {
  showEditDialog.value = false
  // Reset form về giá trị ban đầu
  if (customerInfo.value) {
    editForm.value = {
      hoTen: customerInfo.value.hoTen || '',
      gioiTinh: customerInfo.value.gioiTinh || '',
      ngaySinh: customerInfo.value.ngaySinh ? customerInfo.value.ngaySinh.split('T')[0] : '',
      dienThoai: customerInfo.value.dienThoai || '',
      diaChi: customerInfo.value.diaChi || ''
    }
  }
}

const handleSaveEdit = async () => {
  try {
    saving.value = true
    
    // Lấy mã KH từ localStorage
    const userData = localStorage.getItem('user')
    if (!userData) {
      ElMessage.warning('Vui lòng đăng nhập lại')
      return
    }
    
    const user = JSON.parse(userData)
    const maKH = user.MaKH || user.maKH
    
    if (!maKH) {
      ElMessage.warning('Không tìm thấy mã khách hàng')
      return
    }

    // Gọi API với format đúng theo yêu cầu
    const updateData = {
      makh: maKH,
      hoTen: editForm.value.hoTen,
      ngaySinh: editForm.value.ngaySinh ? new Date(editForm.value.ngaySinh).toISOString() : null,
      gioiTinh: editForm.value.gioiTinh,
      diaChi: editForm.value.diaChi,
      dienThoai: editForm.value.dienThoai
    }

    console.log('Updating customer info:', updateData)
    await api.khachhang.update(maKH, updateData)

    ElMessage.success('Cập nhật thông tin thành công!')
    showEditDialog.value = false
    
    // Tải lại thông tin
    await loadCustomerInfo()
  } catch (error) {
    console.error('Error updating customer info:', error)
    ElMessage.error(error.response?.data?.message || 'Không thể cập nhật thông tin')
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  loadCustomerInfo()
})
</script>

<style scoped>
.profile-page {
  max-width: 1000px;
  margin: 0 auto;
  padding: 30px 20px;
}

.profile-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 2px solid #c8e9ee;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 20px;
}

.header-content i {
  font-size: 50px;
  color: #17a2b8;
}

.header-content h2 {
  margin: 0 0 5px;
  color: #0d3d47;
  font-size: 28px;
  font-weight: 700;
}

.header-content p {
  margin: 0;
  color: #6c757d;
  font-size: 14px;
}

.loading-container {
  background: white;
  padding: 30px;
  border-radius: 12px;
}

.profile-content {
  display: grid;
  gap: 20px;
}

.info-card {
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 600;
  color: #0d3d47;
  font-size: 16px;
}

.card-header i {
  color: #17a2b8;
  font-size: 18px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 25px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.info-item.full-width {
  grid-column: 1 / -1;
}

.info-item label {
  font-size: 13px;
  color: #6c757d;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-value {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 15px;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 3px solid #17a2b8;
}

.info-value i {
  color: #17a2b8;
  font-size: 16px;
  width: 20px;
  text-align: center;
}

.info-value span {
  color: #0d3d47;
  font-size: 15px;
  font-weight: 500;
}

.empty-card {
  margin-top: 50px;
  border-radius: 12px;
}

@media (max-width: 768px) {
  .profile-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }

  .header-content i {
    font-size: 40px;
  }

  .header-content h2 {
    font-size: 22px;
  }
}
</style>
