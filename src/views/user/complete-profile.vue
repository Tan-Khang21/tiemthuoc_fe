<template>
  <div class="complete-profile-container">
    <div class="container">
      <div class="profile-box">
        <div class="header">
          <i class="fas fa-user-circle"></i>
          <h2>Hoàn Thiện Thông Tin</h2>
          <p class="subtitle">Vui lòng nhập thông tin để tiếp tục</p>
        </div>

        <form class="profile-form" @submit.prevent="handleSubmit">
          <div class="form-row">
            <div class="input-group">
              <label>Họ và tên <span class="required">*</span></label>
              <input
                type="text"
                v-model="profileForm.hoTen"
                placeholder="Nhập họ và tên đầy đủ"
                required
              />
            </div>
          </div>

          <div class="form-row">
            <div class="input-group">
              <label>Số điện thoại <span class="required">*</span></label>
              <input
                type="tel"
                v-model="profileForm.soDienThoai"
                placeholder="Nhập số điện thoại"
                required
                pattern="[0-9]{10,11}"
              />
            </div>

            <div class="input-group">
              <label>Giới tính <span class="required">*</span></label>
              <select v-model="profileForm.gioiTinh" required>
                <option value="">Chọn giới tính</option>
                <option value="Nam">Nam</option>
                <option value="Nữ">Nữ</option>
                <option value="Khác">Khác</option>
              </select>
            </div>
          </div>

          <div class="form-row">
            <div class="input-group">
              <label>Ngày sinh</label>
              <input
                type="date"
                v-model="profileForm.ngaySinh"
              />
            </div>

            <div class="input-group">
              <label>CCCD/CMND</label>
              <input
                type="text"
                v-model="profileForm.cccd"
                placeholder="Nhập số CCCD/CMND"
                pattern="[0-9]{9,12}"
              />
            </div>
          </div>

          <div class="input-group full-width">
            <label>Địa chỉ <span class="required">*</span></label>
            <textarea
              v-model="profileForm.diaChi"
              placeholder="Nhập địa chỉ chi tiết"
              rows="3"
              required
            ></textarea>
          </div>

          <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>

          <div class="form-actions">
            <button type="submit" class="btn-submit" :disabled="loading">
              <span>{{ loading ? 'Đang xử lý...' : 'Hoàn Thành' }}</span>
              <i v-if="!loading" class="fas fa-arrow-right"></i>
              <i v-else class="fas fa-spinner fa-spin"></i>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/store'
import { ElMessage } from 'element-plus'
import api from '@/api'

const router = useRouter()
const authStore = useAuthStore()

const loading = ref(false)
const errorMessage = ref('')

const profileForm = ref({
  hoTen: '',
  soDienThoai: '',
  gioiTinh: '',
  ngaySinh: '',
  cccd: '',
  diaChi: ''
})

// Kiểm tra nếu đã có thông tin khách hàng thì chuyển hướng
if (authStore.hasCustomerInfo) {
  router.push('/user')
}

const handleSubmit = async () => {
  errorMessage.value = ''
  loading.value = true

  try {
    // Lấy MaKH từ localStorage
    const user = authStore.user
    const maKH = user?.MaKH
    
    if (!maKH) {
      throw new Error('Không tìm thấy mã khách hàng')
    }

    console.log('Updating customer info for MaKH:', maKH)

    // Gọi API cập nhật thông tin khách hàng theo MaKH
    const response = await api.khachhang.update(maKH, {
      HoTen: profileForm.value.hoTen,
      DienThoai: profileForm.value.soDienThoai,
      GioiTinh: profileForm.value.gioiTinh,
      NgaySinh: profileForm.value.ngaySinh || null,
      DiaChi: profileForm.value.diaChi
    })

    console.log('Update response:', response)

    if (response.data) {
      ElMessage.success('Hoàn thiện thông tin thành công!')
      
      // Cập nhật HasCustomerInfo = true trong store
      const updatedUser = { ...authStore.user, HasCustomerInfo: true }
      authStore.user = updatedUser
      localStorage.setItem('user', JSON.stringify(updatedUser))
      
      // Chuyển đến trang user
      router.push('/user')
    }
  } catch (error) {
    console.error('Complete profile error:', error)
    let errMsg = 'Có lỗi xảy ra khi lưu thông tin'
    
    if (error.response) {
      if (typeof error.response.data === 'string') {
        errMsg = error.response.data
      } else if (error.response.data?.message) {
        errMsg = error.response.data.message
      }
    }
    
    errorMessage.value = errMsg
    ElMessage.error(errMsg)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.complete-profile-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
}

.container {
  max-width: 800px;
  width: 100%;
}

.profile-box {
  background: white;
  border-radius: 20px;
  padding: 50px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.header {
  text-align: center;
  margin-bottom: 40px;
}

.header i {
  font-size: 60px;
  color: #667eea;
  margin-bottom: 20px;
}

.header h2 {
  font-size: 32px;
  color: #0d3d47;
  margin-bottom: 10px;
  font-weight: 700;
}

.subtitle {
  color: #6c757d;
  font-size: 16px;
}

.profile-form {
  width: 100%;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 20px;
}

.input-group {
  display: flex;
  flex-direction: column;
}

.input-group.full-width {
  margin-bottom: 20px;
}

.input-group label {
  color: #495057;
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 8px;
}

.required {
  color: #dc3545;
}

.input-group input,
.input-group select,
.input-group textarea {
  width: 100%;
  padding: 12px 15px;
  border: 2px solid #e9ecef;
  border-radius: 10px;
  font-size: 15px;
  transition: all 0.3s ease;
  outline: none;
}

.input-group input:focus,
.input-group select:focus,
.input-group textarea:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.input-group textarea {
  resize: vertical;
  font-family: inherit;
}

.error-message {
  color: #dc3545;
  font-size: 14px;
  margin-bottom: 20px;
  padding: 12px;
  background: #fff5f5;
  border-radius: 8px;
  border-left: 3px solid #dc3545;
}

.form-actions {
  margin-top: 30px;
}

.btn-submit {
  width: 100%;
  padding: 15px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.btn-submit:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
}

.btn-submit:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .profile-box {
    padding: 30px 20px;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .header h2 {
    font-size: 26px;
  }
}
</style>
