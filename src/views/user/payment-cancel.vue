<template>
  <div class="payment-cancel-page">
    <div class="container">
      <div class="cancel-container">
        <div class="cancel-icon">
          <i class="fas fa-exclamation-triangle"></i>
        </div>
        <h1>Thanh toán đã bị hủy</h1>
        <p class="message">
          Giao dịch của bạn đã bị hủy. Giỏ hàng của bạn vẫn được giữ nguyên.
        </p>
        
        <div class="info-box">
          <i class="fas fa-info-circle"></i>
          <p>Bạn có thể quay lại giỏ hàng để tiếp tục mua sắm hoặc thử thanh toán lại.</p>
        </div>

        <div class="action-buttons">
          <el-button type="primary" size="large" @click="router.push('/user/cart')">
            <i class="fas fa-shopping-cart"></i> Quay lại giỏ hàng
          </el-button>
          <el-button size="large" @click="router.push('/user')">
            <i class="fas fa-home"></i> Tiếp tục mua sắm
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();
</script>

<style scoped>
.payment-cancel-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 50px 20px;
}

.container {
  max-width: 600px;
  margin: 0 auto;
}

.cancel-container {
  background: white;
  border-radius: 20px;
  padding: 60px 40px;
  text-align: center;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
}

.cancel-icon {
  margin-bottom: 20px;
}

.cancel-icon i {
  font-size: 100px;
  color: #ffc107;
  animation: scaleIn 0.5s ease-out;
}

@keyframes scaleIn {
  from {
    transform: scale(0);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

h1 {
  font-size: 32px;
  font-weight: 700;
  color: #17181c;
  margin-bottom: 15px;
}

.message {
  font-size: 16px;
  color: #666;
  margin-bottom: 30px;
  line-height: 1.6;
}

.info-box {
  background: #fff3cd;
  border-left: 4px solid #ffc107;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 40px;
  display: flex;
  gap: 15px;
  align-items: flex-start;
  text-align: left;
}

.info-box i {
  color: #ffc107;
  font-size: 24px;
  flex-shrink: 0;
  margin-top: 2px;
}

.info-box p {
  margin: 0;
  color: #856404;
  line-height: 1.6;
}

.action-buttons {
  display: flex;
  gap: 15px;
  justify-content: center;
  flex-wrap: wrap;
}

.action-buttons .el-button {
  min-width: 180px;
}

@media (max-width: 576px) {
  .payment-cancel-page {
    padding: 30px 15px;
  }

  .cancel-container {
    padding: 40px 20px;
  }

  h1 {
    font-size: 24px;
  }

  .cancel-icon i {
    font-size: 80px;
  }

  .action-buttons {
    flex-direction: column;
  }

  .action-buttons .el-button {
    width: 100%;
  }
}
</style>
