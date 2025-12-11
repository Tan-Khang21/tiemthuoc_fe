<template>
  <div class="login-container">
    <div class="container">
      <div class="login-box">
        <div class="logo">
          <router-link to="/">
            <img src="/src/assets/img/logo/logo.png" alt="Medion Logo" />
          </router-link>
        </div>

        <h2>Đăng Nhập</h2>
        <p class="subtitle">Chào mừng bạn trở lại!</p>

        <div class="login-form">
          <div class="input-group">
            <i class="fas fa-user"></i>
            <input
              type="text"
              v-model="loginForm.username"
              placeholder="Tên đăng nhập"
              @keyup.enter="handleLogin"
            />
          </div>

          <div class="input-group">
            <i class="fas fa-lock"></i>
            <input
              :type="showPassword ? 'text' : 'password'"
              v-model="loginForm.password"
              placeholder="Mật khẩu"
              @keyup.enter="handleLogin"
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
            <router-link to="/forgot-password" class="forgot-password">Quên mật khẩu?</router-link>
          </div>

          <button type="button" class="btn-login" :disabled="loading" @click="handleLogin">
            <span>{{ loading ? 'Đang đăng nhập...' : 'Đăng Nhập' }}</span>
            <i v-if="!loading" class="fas fa-arrow-right"></i>
            <i v-else class="fas fa-spinner fa-spin"></i>
          </button>

          <div class="divider">
            <span>Hoặc</span>
          </div>

          <button type="button" class="btn-google" :disabled="loading" @click="handleGoogleLogin">
            <svg class="google-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            <span>{{ loading ? 'Đang đăng nhập...' : 'Đăng nhập bằng Google' }}</span>
          </button>

          <p class="register-link">
            Chưa có tài khoản? <router-link to="/register">Đăng ký ngay</router-link>
          </p>
        </div>
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
    return false
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
      return false
    }
    
    ElMessage.success('Đăng nhập thành công!')
    
    // Redirect based on user role and customer info

    if (authStore.user?.MaNV) {
      // Có mã nhân viên -> chuyển đến trang staff/admin
      router.push('/admin/thong-ke')
    } else if (!authStore.hasCustomerInfo) {
      // Nếu chưa có mã khách hàng -> yêu cầu nhập thông tin
      await router.push('/user/complete-profile')
    } else {
      // Đã có đầy đủ thông tin -> vào trang user
      await router.push('/user')
    }
    
    return true
  } catch (error) {
    console.error('Login error:', error)
    const errMsg = error.response?.data?.message || error.response?.data || 'Đăng nhập thất bại!'
    errorMessage.value = errMsg
    ElMessage.error(errMsg)
    return false
  } finally {
    loading.value = false
  }
}

const handleGoogleLogin = async () => {
  // Hide previous error
  errorMessage.value = ''
  loading.value = true
  
  try {
    const result = await authStore.loginWithGoogle()
    
    if (!result.success) {
      errorMessage.value = result.message
      ElMessage.error(result.message)
      return false
    }
    
    ElMessage.success('Đăng nhập bằng Google thành công!')
    
    // Redirect based on user role and customer info
    if (authStore.user?.MaNV) {
      // Có mã nhân viên -> chuyển đến trang staff/admin
      router.push('/admin/thong-ke')
    } else if (!authStore.hasCustomerInfo) {
      // Nếu chưa có mã khách hàng -> yêu cầu nhập thông tin
      await router.push('/user/complete-profile')
    } else {
      // Đã có đầy đủ thông tin -> vào trang user
      await router.push('/user')
    }
    
    return true
  } catch (error) {
    console.error('Google login error:', error)
    const errMsg = error.message || 'Đăng nhập bằng Google thất bại!'
    errorMessage.value = errMsg
    ElMessage.error(errMsg)
    return false
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

.login-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #e0f5f7 0%, #c9eaef 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.container {
  display: flex;
  max-width: 1200px;
  width: 100%;
  background: linear-gradient(135deg, #d4f1f4 0%, #c9eaef 100%);
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  overflow: hidden;
  min-height: 600px;
}

/* Login Box - Left Side */
.login-box {
  flex: 1;
  padding: 60px 50px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  background: white;
  border-radius: 20px 0 0 20px;
}

.logo {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 10px;
  margin-bottom: 40px;
}

.logo img {
  width: 120px;
  height: auto;
  object-fit: contain;
}

.logo h1 {
  font-size: 28px;
  color: #0d3d47;
  font-weight: 700;
}

.login-box h2 {
  font-size: 32px;
  color: #2d3748;
  margin-bottom: 10px;
  font-weight: 700;
}

.subtitle {
  color: #718096;
  margin-bottom: 30px;
  font-size: 15px;
}

.login-form {
  width: 100%;
  box-shadow: none;
}

.input-group {
  position: relative;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
}

.input-group i {
  position: absolute;
  left: 20px;
  color: #a0aec0;
  font-size: 18px;
}

.input-group i.toggle-password {
  left: auto;
  right: 20px;
  cursor: pointer;
  transition: color 0.3s;
}

.input-group i.toggle-password:hover {
  color: #17a2b8;
}

.input-group input {
  width: 100%;
  padding: 16px 50px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 15px;
  transition: all 0.3s;
  background: #f7fafc;
}

.input-group input[type="password"] {
  padding-right: 50px;
}

.input-group input:focus {
  outline: none;
  border-color: #17a2b8;
  background: white;
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
  display: flex;
  align-items: center;
  text-align: center;
  margin: 25px 0;
  color: #6c757d;
  font-size: 14px;
}

.divider::before,
.divider::after {
  content: '';
  flex: 1;
  border-bottom: 1px solid #e2e8f0;
}

.divider span {
  padding: 0 15px;
}

.btn-google {
  width: 100%;
  padding: 15px;
  background: white;
  color: #333;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-bottom: 25px;
}

.btn-google:hover:not(:disabled) {
  border-color: #4285F4;
  background: #f8f9fa;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(66, 133, 244, 0.2);
}

.btn-google:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.google-icon {
  width: 20px;
  height: 20px;
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
  flex: 1;
  background: linear-gradient(135deg, #d4f1f4 0%, #c9eaef 100%);
  padding: 60px 50px;
  color: #2d3748;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
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
  color: #2d3748;
  margin-bottom: 20px;
  line-height: 1.3;
  font-weight: 700;
}

.info-box h2 span {
  color: #17a2b8;
}

.info-box p {
  color: #4a5568;
  line-height: 1.8;
  margin-bottom: 35px;
  font-size: 15px;
}

.feature {
  background: white;
  padding: 20px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.feature-icon {
  width: 60px;
  height: 60px;
  background: #ffa500;
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
  color: #718096;
  font-size: 14px;
  font-weight: 500;
  margin: 0 0 5px;
}

.feature-text h3 {
  color: #2d3748;
  font-size: 24px;
  font-weight: 700;
  margin: 0;
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
@media (max-width: 992px) {
  .container {
    flex-direction: column;
  }

  .info-box {
    order: -1;
    padding: 40px 30px;
  }

  .login-box {
    padding: 40px 30px;
  }

  .info-box h2 {
    font-size: 28px;
  }
}

@media (max-width: 576px) {
  .login-box {
    padding: 30px 20px;
  }

  .logo h1 {
    font-size: 24px;
  }

  .login-box h2 {
    font-size: 24px;
  }

  .input-group input {
    padding: 14px 45px;
  }
}
</style>
