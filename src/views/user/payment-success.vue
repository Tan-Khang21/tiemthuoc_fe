<template>
  <div class="payment-success-page">
    <div class="container">
      <div v-if="loading" class="loading-container">
        <el-icon class="loading-icon"><Loading /></el-icon>
        <p>Đang xử lý đơn hàng...</p>
      </div>

      <div v-else-if="success" class="success-container">
        <div class="success-icon">
          <i class="fas fa-check-circle"></i>
        </div>
        <h1>Thanh toán thành công!</h1>
        <p class="message">Cảm ơn bạn đã đặt hàng. Đơn hàng của bạn đã được xác nhận.</p>
        
        <div class="order-info" v-if="orderInfo">
          <h3>Thông tin đơn hàng</h3>
          <div class="info-row">
            <span class="label">Mã đơn hàng:</span>
            <span class="value">{{ orderInfo.orderCode }}</span>
          </div>
          <div class="info-row">
            <span class="label">Tổng tiền:</span>
            <span class="value amount">{{ formatPrice(orderInfo.amount) }}đ</span>
          </div>
          <div class="info-row">
            <span class="label">Thời gian:</span>
            <span class="value">{{ formatDateTime(new Date()) }}</span>
          </div>
        </div>

        <div class="action-buttons">
          <el-button type="primary" size="large" @click="router.push('/user/orders')">
            <i class="fas fa-list"></i> Xem đơn hàng
          </el-button>
          <el-button size="large" @click="router.push('/user')">
            <i class="fas fa-home"></i> Về trang chủ
          </el-button>
        </div>
      </div>

      <div v-else class="error-container">
        <div class="error-icon">
          <i class="fas fa-times-circle"></i>
        </div>
        <h1>Xử lý thất bại</h1>
        <p class="message">{{ errorMessage }}</p>
        
        <div class="action-buttons">
          <el-button type="primary" size="large" @click="router.push('/user/cart')">
            <i class="fas fa-shopping-cart"></i> Quay lại giỏ hàng
          </el-button>
          <el-button size="large" @click="router.push('/user')">
            <i class="fas fa-home"></i> Về trang chủ
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage, ElLoading } from 'element-plus';
import { Loading } from '@element-plus/icons-vue';
import { useCartStore } from '@/store/cart';
import api from '@/api';

const route = useRoute();
const router = useRouter();
const cartStore = useCartStore();

const loading = ref(true);
const success = ref(false);
const errorMessage = ref('');
const orderInfo = ref(null);

onMounted(async () => {
  await processPayment();
});

const processPayment = async () => {
  try {
    // Lấy thông tin từ localStorage (đã lưu trước khi thanh toán)
    const pendingOrder = localStorage.getItem('pendingOrder');
    const orderCode = route.query.orderCode || localStorage.getItem('orderCode');

    if (!pendingOrder) {
      errorMessage.value = 'Không tìm thấy thông tin đơn hàng';
      success.value = false;
      loading.value = false;
      return;
    }

    const orderData = JSON.parse(pendingOrder);
    
    // Cập nhật orderCode dựa trên phương thức thanh toán
    // Nếu là QR (2) thì lấy từ query hoặc storage, nếu là Tiền mặt (1) thì null
    if (orderData.phuongThucTT === 2) {
      orderData.orderCode = route.query.orderCode || localStorage.getItem('orderCode');
    } else {
      orderData.orderCode = null;
    }
    
    // Gọi API tạo hóa đơn
    const response = await api.hoadon.createOnline(orderData);
    const result = response.data;

    console.log('Create invoice result:', result);

    if (result.status === 1) {
      success.value = true;
      orderInfo.value = {
        orderCode: result.data?.maHD || orderData.orderCode || '---',
        amount: orderData.tongTien
      };

      // Xóa thông tin tạm và giỏ hàng
      localStorage.removeItem('pendingOrder');
      localStorage.removeItem('orderCode');
      localStorage.removeItem('cart');
      
      // Xóa giỏ hàng từ store
      cartStore.clearCart();

      ElMessage.success('Đơn hàng đã được tạo thành công!');
    } else {
      errorMessage.value = result.message || 'Không thể tạo đơn hàng';
      success.value = false;
    }
  } catch (error) {
    console.error('Process payment error:', error);
    errorMessage.value = 'Có lỗi xảy ra khi xử lý đơn hàng';
    success.value = false;
  } finally {
    loading.value = false;
  }
};

const formatPrice = (price) => {
  return new Intl.NumberFormat('vi-VN').format(price);
};

const formatDateTime = (date) => {
  return new Intl.DateTimeFormat('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }).format(date);
};
</script>

<style scoped>
.payment-success-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 50px 20px;
}

.container {
  max-width: 600px;
  margin: 0 auto;
}

.loading-container,
.success-container,
.error-container {
  background: white;
  border-radius: 20px;
  padding: 60px 40px;
  text-align: center;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.loading-icon {
  font-size: 60px;
  color: #0ecfe0;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.success-icon {
  margin-bottom: 20px;
}

.success-icon i {
  font-size: 100px;
  color: #28a745;
  animation: scaleIn 0.5s ease-out;
}

.error-icon {
  margin-bottom: 20px;
}

.error-icon i {
  font-size: 100px;
  color: #dc3545;
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
  margin-bottom: 40px;
  line-height: 1.6;
}

.order-info {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 25px;
  margin-bottom: 40px;
  text-align: left;
}

.order-info h3 {
  font-size: 18px;
  font-weight: 600;
  color: #17181c;
  margin-bottom: 20px;
  text-align: center;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #e5e5e5;
}

.info-row:last-child {
  border-bottom: none;
}

.info-row .label {
  font-weight: 500;
  color: #666;
}

.info-row .value {
  font-weight: 600;
  color: #17181c;
}

.info-row .value.amount {
  color: #28a745;
  font-size: 20px;
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
  .payment-success-page {
    padding: 30px 15px;
  }

  .loading-container,
  .success-container,
  .error-container {
    padding: 40px 20px;
  }

  h1 {
    font-size: 24px;
  }

  .success-icon i,
  .error-icon i {
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
