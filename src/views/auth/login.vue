<template>
  <div class="login-container">
    <div class="container">
      <div class="login-box">
        <div class="logo">
          <i class="fas fa-user-md"></i>
          <h1>medion</h1>
        </div>

        <h2>Đăng Nhập</h2>
        <p class="subtitle">Chào mừng bạn trở lại!</p>

        <form class="login-form" @submit.prevent="handleLogin">
          <div class="input-group">
            <i class="fas fa-user"></i>
            <input
              type="text"
              v-model="loginForm.username"
              placeholder="Tên đăng nhập"
              required
            />
          </div>

          <div class="input-group">
            <i class="fas fa-lock"></i>
            <input
              :type="showPassword ? 'text' : 'password'"
              v-model="loginForm.password"
              placeholder="Mật khẩu"
              required
            />
            <i 
              class="fas toggle-password"
              :class="showPassword ? 'fa-eye-slash' : 'fa-eye'"
              @click="showPassword = !showPassword"
            ></i>
          </div>

          <div
            v-if="errorMessage"
            class="error-message"
          >
            {{ errorMessage }}
          </div>

          <div class="form-options">
            <label class="remember-me">
              <input type="checkbox" v-model="rememberMe" />
              <span>Ghi nhớ đăng nhập</span>
            </label>
            <a href="#" class="forgot-password">Quên mật khẩu?</a>
          </div>

          <button type="submit" class="btn-login" :disabled="loading">
            <span>{{ loading ? 'Đang đăng nhập...' : 'Đăng Nhập' }}</span>
            <i v-if="!loading" class="fas fa-arrow-right"></i>
            <i v-else class="fas fa-spinner fa-spin"></i>
          </button>

          <div class="divider">
            <span>Hoặc đăng nhập với</span>
          </div>

          <div class="social-login">
            <button type="button" class="btn-social google">
              <i class="fab fa-google"></i>
              Google
            </button>
            <button type="button" class="btn-social facebook">
              <i class="fab fa-facebook-f"></i>
              Facebook
            </button>
          </div>

          <p class="register-link">
            Chưa có tài khoản? <router-link to="/register">Đăng ký ngay</router-link>
          </p>
        </form>
      </div>

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
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/store'
import { ElMessage } from 'element-plus'

const router = useRouter()
const authStore = useAuthStore()

const loading = ref(false)
const showPassword = ref(false)
const rememberMe = ref(false)
const errorMessage = ref('')

const loginForm = ref({
  username: '',
  password: ''
})

const handleLogin = async () => {
  // Hide previous error
  errorMessage.value = ''
  
  // Validate
  if (!loginForm.value.username || !loginForm.value.password) {
    errorMessage.value = 'Vui lòng nhập đầy đủ thông tin!'
    return
  }
  
  loading.value = true
  try {
    const credentials = {
      TenDangNhap: loginForm.value.username,
      MatKhau: loginForm.value.password
    }
    
    const result = await authStore.login(credentials)
    
    if (!result.success) {
      errorMessage.value = result.message
      ElMessage.error(result.message)
      return
    }
    
    ElMessage.success('Đăng nhập thành công!')
    
    // Redirect based on user role and customer info
    if (authStore.user?.MaNV) {
      // Có mã nhân viên -> chuyển đến trang staff/admin
      router.push('/admin/thong-ke')
    } else if (!authStore.hasCustomerInfo) {
      // Nếu chưa có mã khách hàng -> yêu cầu nhập thông tin
      router.push('/user/complete-profile')
    } else {
      // Đã có đầy đủ thông tin -> vào trang user
      router.push('/user')
    }
  } catch (error) {
    console.error('Login error:', error)
    const errMsg = error.response?.data?.message || error.response?.data || 'Đăng nhập thất bại!'
    errorMessage.value = errMsg
    ElMessage.error(errMsg)
  } finally {
    loading.value = false
  }
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
  min-height: 100vh;
  background: white;
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  margin: 20px auto;
}

/* Login Box - Left Side */
.login-box {
  padding: 60px 50px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.logo {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 40px;
}

.logo i {
  font-size: 32px;
  color: #17a2b8;
}

.logo h1 {
  font-size: 28px;
  color: #0d3d47;
  font-weight: 700;
}

.login-box h2 {
  font-size: 32px;
  color: #0d3d47;
  margin-bottom: 10px;
  font-weight: 700;
}

.subtitle {
  color: #6c757d;
  margin-bottom: 30px;
  font-size: 16px;
}

.login-form {
  width: 100%;
}

.input-group {
  position: relative;
  margin-bottom: 20px;
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
  padding: 15px 45px;
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

.error-message {
  color: #dc3545;
  font-size: 14px;
  margin-bottom: 15px;
  padding: 10px;
  background: #fff5f5;
  border-radius: 5px;
  border-left: 3px solid #dc3545;
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
  font-size: 14px;
}

.remember-me {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  color: #495057;
}

.remember-me input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: #17a2b8;
}

.forgot-password {
  color: #17a2b8;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s ease;
}

.forgot-password:hover {
  color: #138496;
}

.btn-login {
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
  margin-bottom: 25px;
}

.btn-login:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(23, 162, 184, 0.3);
}

.btn-login:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.divider {
  text-align: center;
  margin: 25px 0;
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

.divider span {
  background: white;
  padding: 0 15px;
  color: #6c757d;
  font-size: 14px;
}

.social-login {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
  margin-bottom: 25px;
}

.btn-social {
  padding: 12px 20px;
  border: 2px solid #e9ecef;
  border-radius: 10px;
  background: white;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.3s ease;
}

.btn-social:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.btn-social.google {
  color: #db4437;
}

.btn-social.google:hover {
  border-color: #db4437;
  background: #fff5f5;
}

.btn-social.facebook {
  color: #4267b2;
}

.btn-social.facebook:hover {
  border-color: #4267b2;
  background: #f5f7ff;
}

.register-link {
  text-align: center;
  color: #6c757d;
  font-size: 14px;
}

.register-link a {
  color: #17a2b8;
  text-decoration: none;
  font-weight: 600;
  transition: color 0.3s ease;
}

.register-link a:hover {
  color: #138496;
  text-decoration: underline;
}

/* Info Box - Right Side */
.info-box {
  background: linear-gradient(135deg, #d4eef2 0%, #a8dde6 100%);
  padding: 60px 50px;
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
  padding: 8px 20px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 1px;
  display: inline-block;
  margin-bottom: 25px;
  text-transform: uppercase;
}

.info-box h2 {
  font-size: 36px;
  color: #0d3d47;
  margin-bottom: 20px;
  line-height: 1.3;
  font-weight: 700;
}

.info-box h2 span {
  color: #17a2b8;
}

.info-box p {
  color: #495057;
  line-height: 1.8;
  margin-bottom: 35px;
  font-size: 15px;
}

.feature {
  background: white;
  padding: 25px;
  border-radius: 15px;
  display: flex;
  align-items: center;
  gap: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  max-width: 300px;
}

.feature-icon {
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #ffa500 0%, #ff8c00 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.feature-icon i {
  font-size: 28px;
  color: white;
}

.feature-text h4 {
  color: #6c757d;
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 5px;
}

.feature-text h3 {
  color: #0d3d47;
  font-size: 24px;
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
  right: -100px;
}

.circle-2 {
  width: 200px;
  height: 200px;
  background: #ffa500;
  bottom: -50px;
  left: -50px;
}

.circle-3 {
  width: 150px;
  height: 150px;
  background: #17a2b8;
  bottom: 100px;
  right: 50px;
}

/* Responsive Design */
@media (max-width: 968px) {
  .container {
    grid-template-columns: 1fr;
  }

  .info-box {
    display: none;
  }

  .login-box {
    padding: 40px 30px;
  }
}

@media (max-width: 480px) {
  .login-box {
    padding: 30px 20px;
  }

  .logo h1 {
    font-size: 24px;
  }

  .login-box h2 {
    font-size: 26px;
  }

  .social-login {
    grid-template-columns: 1fr;
  }
}
</style>
