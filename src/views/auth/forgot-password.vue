<template>
  <div class="forgot-password-container">
    <div class="container">
      <div class="forgot-password-box">
        <div class="logo">
          <i class="fas fa-user-md"></i>
          <h1>medion</h1>
        </div>

        <!-- Step 1: Send OTP -->
        <div v-if="step === 1">
          <h2>Quên Mật Khẩu</h2>
          <p class="subtitle">Nhập thông tin tài khoản để nhận mã OTP</p>

          <form class="forgot-form" @submit.prevent="handleSendOtp">
            <div class="input-group">
              <i class="fas fa-user"></i>
              <input
                type="text"
                v-model="forgotForm.tenDangNhap"
                placeholder="Tên đăng nhập"
                required
              />
            </div>

            <div class="input-group">
              <i class="fas fa-envelope"></i>
              <input
                type="email"
                v-model="forgotForm.email"
                placeholder="Email"
                required
              />
            </div>

            <div v-if="errorMessage" class="error-message">
              {{ errorMessage }}
            </div>

            <div v-if="successMessage" class="success-message">
              {{ successMessage }}
            </div>

            <button type="submit" class="btn-submit" :disabled="loading">
              <span>{{ loading ? 'Đang gửi...' : 'Gửi mã OTP' }}</span>
              <i v-if="!loading" class="fas fa-paper-plane"></i>
              <i v-else class="fas fa-spinner fa-spin"></i>
            </button>

            <p class="back-link">
              <router-link to="/login">
                <i class="fas fa-arrow-left"></i> Quay lại đăng nhập
              </router-link>
            </p>
          </form>
        </div>

        <!-- Step 2: Reset Password -->
        <div v-if="step === 2">
          <h2>Đặt Lại Mật Khẩu</h2>
          <p class="subtitle">Nhập mã OTP và mật khẩu mới</p>

          <form class="forgot-form" @submit.prevent="handleResetPassword">
            <div class="input-group">
              <i class="fas fa-key"></i>
              <input
                type="number"
                v-model.number="resetForm.otp"
                placeholder="Mã OTP"
                required
              />
            </div>

            <div class="input-group">
              <i class="fas fa-lock"></i>
              <input
                :type="showPassword ? 'text' : 'password'"
                v-model="resetForm.matKhauMoi"
                placeholder="Mật khẩu mới"
                required
                minlength="6"
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
                placeholder="Xác nhận mật khẩu mới"
                required
                minlength="6"
              />
              <i 
                class="fas toggle-password"
                :class="showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'"
                @click="showConfirmPassword = !showConfirmPassword"
              ></i>
            </div>

            <div v-if="errorMessage" class="error-message">
              {{ errorMessage }}
            </div>

            <div v-if="successMessage" class="success-message">
              {{ successMessage }}
            </div>

            <button type="submit" class="btn-submit" :disabled="loading">
              <span>{{ loading ? 'Đang xử lý...' : 'Đặt lại mật khẩu' }}</span>
              <i v-if="!loading" class="fas fa-check"></i>
              <i v-else class="fas fa-spinner fa-spin"></i>
            </button>

            <p class="back-link">
              <a @click="step = 1" style="cursor: pointer;">
                <i class="fas fa-arrow-left"></i> Gửi lại mã OTP
              </a>
            </p>
          </form>
        </div>
      </div>

      <div class="info-box">
        <div class="info-content">
          <div class="badge">EASY HEALTH CARE</div>
          <h2>Khôi Phục <span>Tài Khoản</span> Dễ Dàng</h2>
          <p>
            Chúng tôi sẽ gửi mã OTP về email của bạn để xác thực và đặt lại mật khẩu một cách an toàn.
          </p>

          <div class="feature">
            <div class="feature-icon">
              <i class="fas fa-shield-alt"></i>
            </div>
            <div class="feature-text">
              <h4>Bảo mật</h4>
              <h3>An toàn</h3>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import api from '@/api';
import { ElMessage } from 'element-plus';

const router = useRouter();

const step = ref(1);
const loading = ref(false);
const errorMessage = ref('');
const successMessage = ref('');
const showPassword = ref(false);
const showConfirmPassword = ref(false);

const forgotForm = ref({
  tenDangNhap: '',
  email: ''
});

const resetForm = ref({
  tenDangNhap: '',
  email: '',
  otp: '',
  matKhauMoi: ''
});

const confirmPassword = ref('');

const handleSendOtp = async () => {
  errorMessage.value = '';
  successMessage.value = '';
  loading.value = true;

  try {
    const response = await api.taikhoan.sendOtp({
      tenDangNhap: forgotForm.value.tenDangNhap,
      email: forgotForm.value.email
    });

    console.log('Send OTP response:', response);

    // Check if API call was successful (status 200)
    if (response.status === 200) {
      successMessage.value = 'Mã OTP đã được gửi về email của bạn!';
      ElMessage.success('Mã OTP đã được gửi về email!');
      
      // Copy data to reset form
      resetForm.value.tenDangNhap = forgotForm.value.tenDangNhap;
      resetForm.value.email = forgotForm.value.email;
      
      setTimeout(() => {
        step.value = 2;
        successMessage.value = '';
      }, 1500);
    } else {
      errorMessage.value = response.data?.message || 'Không thể gửi mã OTP. Vui lòng kiểm tra thông tin!';
      ElMessage.error(errorMessage.value);
    }
  } catch (error) {
    console.error('Send OTP error:', error);
    errorMessage.value = error.response?.data?.message || 'Tên đăng nhập hoặc email không chính xác!';
    ElMessage.error(errorMessage.value);
  } finally {
    loading.value = false;
  }
};

const handleResetPassword = async () => {
  errorMessage.value = '';
  successMessage.value = '';

  // Validate password match
  if (resetForm.value.matKhauMoi !== confirmPassword.value) {
    errorMessage.value = 'Mật khẩu xác nhận không khớp!';
    ElMessage.error(errorMessage.value);
    return;
  }

  // Validate password length
  if (resetForm.value.matKhauMoi.length < 6) {
    errorMessage.value = 'Mật khẩu phải có ít nhất 6 ký tự!';
    ElMessage.error(errorMessage.value);
    return;
  }

  loading.value = true;

  try {
    const response = await api.taikhoan.resetPassword({
      tenDangNhap: resetForm.value.tenDangNhap,
      email: resetForm.value.email,
      otp: resetForm.value.otp,
      matKhauMoi: resetForm.value.matKhauMoi
    });

    console.log('Reset password response:', response);

    // Check if API call was successful (status 200)
    if (response.status === 200) {
      successMessage.value = 'Đặt lại mật khẩu thành công!';
      ElMessage.success('Đặt lại mật khẩu thành công! Đang chuyển đến trang đăng nhập...');
      
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } else {
      errorMessage.value = response.data?.message || 'Không thể đặt lại mật khẩu. Vui lòng kiểm tra mã OTP!';
      ElMessage.error(errorMessage.value);
    }
  } catch (error) {
    console.error('Reset password error:', error);
    errorMessage.value = error.response?.data?.message || 'Mã OTP không chính xác hoặc đã hết hạn!';
    ElMessage.error(errorMessage.value);
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.forgot-password-container {
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

.forgot-password-box {
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
  gap: 10px;
  margin-bottom: 30px;
}

.logo i {
  font-size: 32px;
  color: #17a2b8;
}

.logo h1 {
  font-size: 28px;
  font-weight: 700;
  color: #2d3748;
  margin: 0;
}

h2 {
  font-size: 32px;
  font-weight: 700;
  color: #2d3748;
  margin: 0 0 10px;
}

.subtitle {
  color: #718096;
  margin-bottom: 30px;
  font-size: 15px;
}

.forgot-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.input-group {
  position: relative;
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

.input-group input:focus {
  outline: none;
  border-color: #17a2b8;
  background: white;
}

.error-message {
  padding: 12px 16px;
  background: #fed7d7;
  color: #c53030;
  border-radius: 8px;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.success-message {
  padding: 12px 16px;
  background: #c6f6d5;
  color: #2f855a;
  border-radius: 8px;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-submit {
  padding: 16px;
  background: #17a2b8;
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  transition: all 0.3s;
  margin-top: 10px;
}

.btn-submit:hover:not(:disabled) {
  background: #138496;
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(23, 162, 184, 0.3);
}

.btn-submit:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.back-link {
  text-align: center;
  margin-top: 20px;
  font-size: 14px;
}

.back-link a {
  color: #17a2b8;
  text-decoration: none;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: color 0.3s;
}

.back-link a:hover {
  color: #138496;
}

.info-box {
  flex: 1;
  background: linear-gradient(135deg, #d4f1f4 0%, #c9eaef 100%);
  padding: 60px 50px;
  color: #2d3748;
  display: flex;
  align-items: center;
  justify-content: center;
}

.info-content {
  max-width: 400px;
}

.badge {
  display: inline-block;
  padding: 8px 16px;
  background: #17a2b8;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 1px;
  margin-bottom: 20px;
  color: white;
}

.info-box h2 {
  font-size: 36px;
  color: #2d3748;
  margin-bottom: 20px;
  line-height: 1.2;
}

.info-box h2 span {
  color: #17a2b8;
}

.info-box p {
  font-size: 16px;
  line-height: 1.6;
  color: #4a5568;
  margin-bottom: 40px;
}

.feature {
  display: flex;
  align-items: center;
  gap: 20px;
  background: white;
  padding: 20px;
  border-radius: 12px;
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
}

.feature-icon i {
  font-size: 28px;
  color: white;
}

.feature-text h4 {
  font-size: 14px;
  font-weight: 500;
  color: #718096;
  margin: 0 0 5px;
}

.feature-text h3 {
  font-size: 24px;
  font-weight: 700;
  margin: 0;
  color: #2d3748;
}

@media (max-width: 992px) {
  .container {
    flex-direction: column;
  }

  .info-box {
    order: -1;
    padding: 40px 30px;
  }

  .forgot-password-box {
    padding: 40px 30px;
  }

  .info-box h2 {
    font-size: 28px;
  }
}

@media (max-width: 576px) {
  .forgot-password-box {
    padding: 30px 20px;
  }

  h2 {
    font-size: 24px;
  }

  .input-group input {
    padding: 14px 45px;
  }
}
</style>
