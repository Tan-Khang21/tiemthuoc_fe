<template>
  <div class="register-container">
    <div class="container">
      <div class="info-box">
        <div class="info-content">
          <div class="badge">EASY HEALTH CARE</div>
          <h2>Chăm Sóc Sức Khỏe <span>Dễ Dàng</span> Cho Gia Đình Bạn</h2>
          <p>
            Cung cấp dịch vụ y tế và dược phẩm chất lượng cao với đội ngũ chuyên
            nghiệp, giao hàng nhanh chóng trong 30 phút.
          </p>

          <div class="feature">
            <div class="feature-icon">
              <i class="fas fa-truck"></i>
            </div>
            <div class="feature-text">
              <h4>Giao hàng trong</h4>
              <h3>30 phút</h3>
            </div>
          </div>
        </div>

        <div class="decoration-circle circle-1"></div>
        <div class="decoration-circle circle-2"></div>
        <div class="decoration-circle circle-3"></div>
      </div>

      <div class="register-box">
        <div class="logo">
          <img src="/src/assets/img/logo/logo.png" alt="Medion Logo" />
        </div>

        <h2>Đăng Ký</h2>
        <p class="subtitle">Tạo tài khoản mới của bạn</p>

        <form class="register-form" @submit.prevent="handleRegister">
          <div class="input-group">
            <i class="fas fa-user"></i>
            <input
              type="text"
              v-model="registerForm.username"
              placeholder="Tên đăng nhập"
              required
              @input="checkUsername"
            />
            <span v-if="usernameStatus" class="username-status" :class="usernameStatus">
              <i v-if="usernameStatus === 'checking'" class="fas fa-spinner fa-spin"></i>
              <i v-if="usernameStatus === 'success'" class="fas fa-check-circle"></i>
              <i v-if="usernameStatus === 'error'" class="fas fa-times-circle"></i>
            </span>
          </div>
          <div v-if="usernameError" class="error-message">{{ usernameError }}</div>

          <div class="input-group">
            <i class="fas fa-envelope"></i>
            <input
              type="email"
              v-model="registerForm.email"
              placeholder="Email của bạn"
              required
            />
          </div>

          <div class="input-group">
            <i class="fas fa-lock"></i>
            <input
              :type="showPassword ? 'text' : 'password'"
              v-model="registerForm.password"
              placeholder="Mật khẩu (tối thiểu 6 ký tự)"
              required
            />
            <i 
              class="fas toggle-password"
              :class="showPassword ? 'fa-eye-slash' : 'fa-eye'"
              @click="showPassword = !showPassword"
            ></i>
          </div>

          <div class="input-group">
            <i class="fas fa-lock"></i>
            <input
              :type="showConfirmPassword ? 'text' : 'password'"
              v-model="confirmPassword"
              placeholder="Xác nhận mật khẩu"
              required
            />
            <i 
              class="fas toggle-password"
              :class="showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'"
              @click="showConfirmPassword = !showConfirmPassword"
            ></i>
          </div>

          <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>

          <div class="form-options">
            <label class="terms-agree">
              <input type="checkbox" v-model="agreeTerms" required />
              <span>Tôi đồng ý với <a href="#">Điều khoản dịch vụ</a> và <a href="#">Chính sách bảo mật</a></span>
            </label>
          </div>

          <button type="submit" class="btn-register" :disabled="loading || !isUsernameValid">
            <span>{{ loading ? 'Đang xử lý...' : 'Đăng Ký' }}</span>
            <i v-if="!loading" class="fas fa-arrow-right"></i>
            <i v-else class="fas fa-spinner fa-spin"></i>
          </button>

          <p class="login-link">
            Đã có tài khoản? <router-link to="/login">Đăng nhập ngay</router-link>
          </p>
        </form>
      </div>
    </div>

    <!-- Success Modal -->
    <div v-if="showSuccessModal" class="modal-overlay" @click="closeSuccessModal">
      <div class="modal-content" @click.stop>
        <div class="success-icon">
          <i class="fas fa-check-circle"></i>
        </div>
        <h2>Đăng Ký Thành Công!</h2>
        <p>{{ successMessage }}</p>
        <button @click="goToLogin" class="btn-modal">Đến trang đăng nhập</button>
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
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const agreeTerms = ref(false)
const errorMessage = ref('')
const confirmPassword = ref('')
const usernameStatus = ref('')
const usernameError = ref('')
const isUsernameValid = ref(false)
const showSuccessModal = ref(false)
const successMessage = ref('')

let usernameCheckTimeout = null

const registerForm = ref({
  username: '',
  email: '',
  password: ''
})

const checkUsername = async () => {
  const username = registerForm.value.username.trim()
  
  // Clear previous timeout
  clearTimeout(usernameCheckTimeout)
  
  // Reset status
  usernameStatus.value = ''
  usernameError.value = ''
  isUsernameValid.value = false
  
  if (username.length < 3) {
    if (username.length > 0) {
      usernameError.value = 'Tên đăng nhập phải có ít nhất 3 ký tự'
    }
    return
  }
  
  // Show checking status
  usernameStatus.value = 'checking'
  
  // Debounce API call
  usernameCheckTimeout = setTimeout(async () => {
    try {
      const response = await api.taikhoan.checkUsername(username)
      console.log('API Response:', response.data)
      
      // API trả về { "Exists": false } nếu tài khoản chưa tồn tại (chữ E viết hoa)
      // API trả về { "Exists": true } nếu tài khoản đã tồn tại
      let exists = response.data?.Exists ?? response.data?.exists
      
      // Nếu response.data là boolean trực tiếp
      if (typeof response.data === 'boolean') {
        exists = response.data
      }
      
      console.log('Username exists:', exists)
      
      if (exists === false) {
        // Tài khoản chưa tồn tại - được phép đăng ký
        usernameStatus.value = 'success'
        usernameError.value = ''
        isUsernameValid.value = true
      } else if (exists === true) {
        // Tài khoản đã tồn tại - không được đăng ký
        usernameStatus.value = 'error'
        usernameError.value = 'Tên đăng nhập đã tồn tại'
        isUsernameValid.value = false
      } else {
        // Không xác định được kết quả
        console.warn('Unexpected response format:', response.data)
        usernameStatus.value = 'error'
        usernameError.value = 'Không thể kiểm tra tên đăng nhập'
        isUsernameValid.value = false
      }
    } catch (error) {
      console.error('Error checking username:', error)
      usernameStatus.value = 'error'
      usernameError.value = 'Không thể kiểm tra tên đăng nhập'
      isUsernameValid.value = false
    }
  }, 500)
}

const handleRegister = async () => {
  // Hide previous errors
  errorMessage.value = ''
  
  // Validate username length
  if (registerForm.value.username.length < 3) {
    errorMessage.value = 'Tên đăng nhập phải có ít nhất 3 ký tự!'
    return
  }
  
  // Check if username is available
  if (!isUsernameValid.value) {
    errorMessage.value = 'Vui lòng chọn tên đăng nhập khác!'
    return
  }
  
  // Validate email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(registerForm.value.email)) {
    errorMessage.value = 'Email không hợp lệ!'
    return
  }
  
  // Validate password
  if (registerForm.value.password.length < 6) {
    errorMessage.value = 'Mật khẩu phải có ít nhất 6 ký tự!'
    return
  }
  
  // Check password match
  if (registerForm.value.password !== confirmPassword.value) {
    errorMessage.value = 'Mật khẩu xác nhận không khớp!'
    return
  }
  
  // Check terms agreement
  if (!agreeTerms.value) {
    errorMessage.value = 'Vui lòng đồng ý với điều khoản dịch vụ!'
    return
  }
  
  loading.value = true
  try {
    const result = await authStore.register({
      TenDangNhap: registerForm.value.username,
      MatKhau: registerForm.value.password,
      Email: registerForm.value.email
    })
    
    if (result?.success) {
      successMessage.value = result.message || 'Vui lòng kiểm tra email để xác thực tài khoản!'
      showSuccessModal.value = true
      
      // Clear form
      registerForm.value = { username: '', email: '', password: '' }
      confirmPassword.value = ''
      agreeTerms.value = false
      isUsernameValid.value = false
      usernameStatus.value = ''
    } else {
      errorMessage.value = result?.message || 'Đăng ký thất bại'
      ElMessage.error(errorMessage.value)
    }
  } catch (error) {
    console.error('Register error:', error)
    let errMsg = 'Đăng ký thất bại!'
    
    // Xử lý các format lỗi khác nhau từ backend
    if (error.response) {
      if (typeof error.response.data === 'string') {
        errMsg = error.response.data
      } else if (error.response.data?.message) {
        errMsg = error.response.data.message
      } else if (error.response.data?.Message) {
        errMsg = error.response.data.Message
      } else if (error.response.data) {
        errMsg = JSON.stringify(error.response.data)
      }
    } else if (error.message) {
      errMsg = error.message
    }
    
    errorMessage.value = errMsg
    ElMessage.error(errMsg)
  } finally {
    loading.value = false
  }
}

const closeSuccessModal = () => {
  showSuccessModal.value = false
  router.push('/login')
}

const goToLogin = () => {
  showSuccessModal.value = false
  router.push('/login')
}
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  max-width: 1200px;
  width: 100%;
  min-height: 600px;
  background: white;
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  margin: 10px auto;
}

/* Info Box - Left Side */
.info-box {
  background: linear-gradient(135deg, #d4eef2 0%, #a8dde6 100%);
  padding: 40px 40px;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.info-content {
  position: relative;
  z-index: 2;
}

.badge {
  background: #17a2b8;
  color: white;
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 1px;
  display: inline-block;
  margin-bottom: 15px;
  text-transform: uppercase;
}

.info-box h2 {
  font-size: 30px;
  color: #0d3d47;
  margin-bottom: 15px;
  line-height: 1.3;
  font-weight: 700;
}

.info-box h2 span {
  color: #17a2b8;
}

.info-box p {
  color: #495057;
  line-height: 1.6;
  margin-bottom: 25px;
  font-size: 14px;
}

.feature {
  background: white;
  padding: 20px;
  border-radius: 15px;
  display: flex;
  align-items: center;
  gap: 15px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  max-width: 280px;
}

.feature-icon {
  width: 50px;
  height: 50px;
  background: linear-gradient(135deg, #ffa500 0%, #ff8c00 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.feature-icon i {
  font-size: 24px;
  color: white;
}

.feature-text h4 {
  color: #6c757d;
  font-size: 13px;
  font-weight: 500;
  margin-bottom: 4px;
}

.feature-text h3 {
  color: #0d3d47;
  font-size: 22px;
  font-weight: 700;
}

/* Decoration Circles */
.decoration-circle {
  position: absolute;
  border-radius: 50%;
  opacity: 0.15;
}

.circle-1 {
  width: 300px;
  height: 300px;
  background: #17a2b8;
  top: -100px;
  left: -100px;
}

.circle-2 {
  width: 200px;
  height: 200px;
  background: #ffa500;
  bottom: -50px;
  right: -50px;
}

.circle-3 {
  width: 150px;
  height: 150px;
  background: #17a2b8;
  bottom: 100px;
  left: 50px;
}

/* Register Box - Right Side */
.register-box {
  padding: 30px 40px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  overflow-y: auto;
}

.logo {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 10px;
  margin-bottom: 20px;
}

.logo img {
  width: 120px;
  height: auto;
  object-fit: contain;
}

.logo h1 {
  font-size: 24px;
  color: #0d3d47;
  font-weight: 700;
}

.register-box h2 {
  font-size: 28px;
  color: #0d3d47;
  margin-bottom: 8px;
  font-weight: 700;
}

.subtitle {
  color: #6c757d;
  margin-bottom: 20px;
  font-size: 14px;
}

.register-form {
  width: 100%;
}

.input-group {
  position: relative;
  margin-bottom: 14px;
}

.username-status {
  position: absolute;
  right: 15px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 18px;
}

.username-status.success {
  color: #28a745;
}

.username-status.error {
  color: #dc3545;
}

.error-message {
  color: #dc3545;
  font-size: 13px;
  margin-top: -12px;
  margin-bottom: 15px;
  padding: 8px;
  background: #fff5f5;
  border-radius: 5px;
  border-left: 3px solid #dc3545;
}

.input-group i {
  position: absolute;
  left: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: #6c757d;
  font-size: 16px;
}

.input-group input {
  width: 100%;
  padding: 14px 45px;
  border: 2px solid #e9ecef;
  border-radius: 10px;
  font-size: 15px;
  transition: all 0.3s ease;
  outline: none;
}

.input-group input[type="password"] {
  padding-right: 45px;
}

.input-group input:focus {
  border-color: #17a2b8;
  box-shadow: 0 0 0 3px rgba(23, 162, 184, 0.1);
}

.toggle-password {
  position: absolute;
  right: 15px;
  left: auto !important;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
  transition: color 0.3s ease;
  z-index: 10;
  color: #6c757d;
  font-size: 16px;
}

.toggle-password:hover {
  color: #17a2b8;
}

.form-options {
  margin-bottom: 20px;
  font-size: 13px;
}

.terms-agree {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  cursor: pointer;
  color: #495057;
  line-height: 1.6;
}

.terms-agree input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: #17a2b8;
  margin-top: 2px;
  flex-shrink: 0;
}

.terms-agree a {
  color: #17a2b8;
  text-decoration: none;
  font-weight: 500;
}

.terms-agree a:hover {
  text-decoration: underline;
}

.btn-register {
  width: 100%;
  padding: 15px;
  background: linear-gradient(135deg, #17a2b8 0%, #138496 100%);
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
  margin-bottom: 20px;
}

.btn-register:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(23, 162, 184, 0.3);
}

.btn-register:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.divider {
  text-align: center;
  margin: 20px 0;
  position: relative;
}

.divider::before,
.divider::after {
  content: "";
  position: absolute;
  top: 50%;
  width: 40%;
  height: 1px;
  background: #dee2e6;
}

.divider::before {
  left: 0;
}

.divider::after {
  right: 0;
}

.login-link {
  text-align: center;
  color: #6c757d;
  font-size: 14px;
}

.login-link a {
  color: #17a2b8;
  text-decoration: none;
  font-weight: 600;
  transition: color 0.3s ease;
}

.login-link a:hover {
  color: #138496;
  text-decoration: underline;
}

/* Success Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.modal-content {
  background: white;
  padding: 40px;
  border-radius: 15px;
  text-align: center;
  max-width: 400px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}

.success-icon {
  color: #17a2b8;
  font-size: 60px;
  margin-bottom: 20px;
}

.modal-content h2 {
  color: #0d3d47;
  margin-bottom: 15px;
}

.modal-content p {
  color: #6c757d;
  margin-bottom: 25px;
  line-height: 1.6;
}

.btn-modal {
  padding: 12px 30px;
  background: linear-gradient(135deg, #17a2b8 0%, #138496 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-modal:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(23, 162, 184, 0.3);
}

/* Responsive Design */
@media (max-width: 968px) {
  .container {
    grid-template-columns: 1fr;
  }

  .info-box {
    display: none;
  }

  .register-box {
    padding: 40px 30px;
  }
}

@media (max-width: 480px) {
  .register-box {
    padding: 30px 20px;
  }

  .logo h1 {
    font-size: 24px;
  }

  .register-box h2 {
    font-size: 26px;
  }

  .social-register {
    grid-template-columns: 1fr;
  }
}
</style>
