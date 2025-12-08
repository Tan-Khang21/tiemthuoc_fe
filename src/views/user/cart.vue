<template>
  <div class="cart-page">
    <h2>Giỏ hàng của bạn</h2>

    <div v-if="cartStore.items.length === 0" class="empty-cart">
      <el-empty description="Giỏ hàng trống">
        <el-button type="primary" @click="$router.push('/user')">
          Tiếp tục mua sắm
        </el-button>
      </el-empty>
    </div>

    <div v-else>
      <el-table :data="cartStore.items" style="width: 100%">
        <el-table-column label="Hình ảnh" width="100">
          <template #default="{ row }">
            <img
              :src="row.urlAnh || 'https://via.placeholder.com/80'"
              style="width: 80px; height: 80px; object-fit: cover"
            />
          </template>
        </el-table-column>

        <el-table-column label="Tên thuốc" prop="tenThuoc" />

        <el-table-column label="Đơn vị" width="120">
          <template #default="{ row }">
            {{ row.tenDonVi || 'Viên' }}
          </template>
        </el-table-column>

        <el-table-column label="Đơn giá" width="150">
          <template #default="{ row }">
            {{ formatPrice(row.donGia) }}đ
          </template>
        </el-table-column>

        <el-table-column label="Số lượng" width="150">
          <template #default="{ row }">
            <el-input-number
              v-model="row.soLuong"
              :min="1"
              @change="updateQuantity(row)"
            />
          </template>
        </el-table-column>

        <el-table-column label="Thành tiền" width="150">
          <template #default="{ row }">
            <strong style="color: #2E8B57">
              {{ formatPrice(row.donGia * row.soLuong) }}đ
            </strong>
          </template>
        </el-table-column>

        <el-table-column label="Thao tác" width="100">
          <template #default="{ row }">
            <el-button
              type="danger"
              size="small"
              @click="removeItem(row)"
            >
              Xóa
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-card class="summary-card" style="margin-top: 20px">
        <h3>Tổng kết đơn hàng</h3>
        <div class="summary-row">
          <span>Tổng số lượng:</span>
          <strong>{{ cartStore.totalItems }} sản phẩm</strong>
        </div>
        <div class="summary-row total">
          <span>Tổng tiền:</span>
          <strong style="color: #2E8B57; font-size: 24px">
            {{ formatPrice(cartStore.totalAmount) }}đ
          </strong>
        </div>

        <div class="payment-method" style="margin: 20px 0">
          <div style="margin-bottom: 10px; font-weight: 500">Phương thức thanh toán:</div>
          <el-radio-group v-model="paymentMethod">
            <el-radio :label="1">Tiền mặt</el-radio>
            <el-radio :label="2">Chuyển khoản QR</el-radio>
          </el-radio-group>
        </div>

        <el-button
          type="primary"
          size="large"
          style="width: 100%; margin-top: 10px"
          @click="handleCheckout"
        >
          Đặt hàng
        </el-button>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useCartStore, useAuthStore } from '@/store';
import api from '@/api';
import { ElMessage, ElMessageBox } from 'element-plus';

const router = useRouter();
const cartStore = useCartStore();
const authStore = useAuthStore();
const paymentMethod = ref(2); // Mặc định là QR Code

const formatPrice = (price) => {
  return new Intl.NumberFormat('vi-VN').format(price);
};

const updateQuantity = (item) => {
  cartStore.updateQuantity(item.maThuoc, item.donVi, item.soLuong);
};

const removeItem = (item) => {
  ElMessageBox.confirm(
    `Bạn có chắc muốn xóa "${item.tenThuoc}" khỏi giỏ hàng?`,
    'Xác nhận',
    {
      confirmButtonText: 'Xóa',
      cancelButtonText: 'Hủy',
      type: 'warning',
    }
  ).then(() => {
    cartStore.removeFromCart(item.maThuoc, item.donVi);
    ElMessage.success('Đã xóa khỏi giỏ hàng');
  });
};

const handleCheckout = async () => {
  console.log('=== BẮT ĐẦU THANH TOÁN ===');
  
  if (!authStore.isAuthenticated) {
    ElMessage.warning('Vui lòng đăng nhập để đặt hàng');
    router.push('/login');
    return;
  }

  try {
    // Lấy mã khách hàng từ localStorage
    const userData = localStorage.getItem('user');
    if (!userData) {
      ElMessage.warning('Vui lòng đăng nhập lại');
      router.push('/login');
      return;
    }

    const user = JSON.parse(userData);
    const maKH = user.MaKH || user.maKH;

    if (!maKH) {
      ElMessage.error('Không tìm thấy thông tin khách hàng');
      return;
    }

    // Chuẩn bị dữ liệu đơn hàng
    const orderData = {
      maKH: maKH,
      ghiChu: 'Đơn hàng online',
      tongTien: cartStore.totalAmount,
      phuongThucTT: paymentMethod.value,
      items: cartStore.items.map(item => ({
        maThuoc: item.maThuoc,
        donVi: item.donVi,
        soLuong: item.soLuong,
        donGia: item.donGia
      }))
    };

    console.log('Payment Method:', paymentMethod.value);
    console.log('Order Data:', orderData);

    // Xử lý thanh toán dựa trên phương thức
    if (paymentMethod.value === 2) {
      // Thanh toán QR
      const paymentRequest = {
        amount: cartStore.totalAmount,
        description: `DH-${maKH}`.substring(0, 25),
        returnUrl: `${window.location.origin}/user/payment-success`,
        cancelUrl: `${window.location.origin}/user/payment-cancel`
      };

      console.log('Payment Request:', paymentRequest);
      console.log('Đang gọi API SimplePayment/Create...');

      const response = await api.simplePayment.create(paymentRequest);
      
      console.log('Response từ API:', response);
      console.log('Response.data:', response.data);
      
      // Backend trả về: { status: 1, data: {...}, message: "..." }
      const result = response.data;
      
      if (result && result.status === 1 && result.data) {
        console.log('✅ Thanh toán thành công, chuyển hướng đến:', result.data.paymentUrl);
        localStorage.setItem('pendingOrder', JSON.stringify(orderData));
        localStorage.setItem('orderCode', result.data.orderCode);
        window.location.href = result.data.paymentUrl;
      } else {
        console.error('❌ Lỗi response:', result);
        ElMessage.error(result?.message || 'Không thể tạo thanh toán');
      }
    } else {
      // Thanh toán tiền mặt
      console.log('Thanh toán tiền mặt');
      localStorage.setItem('pendingOrder', JSON.stringify(orderData));
      // Với tiền mặt, không có orderCode từ cổng thanh toán, set null hoặc bỏ qua
      localStorage.removeItem('orderCode'); 
      router.push('/user/payment-success');
    }

  } catch (error) {
    console.error('❌ Checkout error:', error);
    console.error('Error stack:', error.stack);
    console.error('Error response:', error.response);
    ElMessage.error('Có lỗi xảy ra khi tạo đơn hàng');
  }
};
</script>

<style scoped>
.cart-page {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.empty-cart {
  padding: 60px 0;
  text-align: center;
}

.summary-card {
  max-width: 400px;
  margin-left: auto;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  margin: 15px 0;
  font-size: 16px;
}

.summary-row.total {
  border-top: 2px solid #e0e0e0;
  padding-top: 15px;
  margin-top: 20px;
}

/* Fix cho el-input-number để hiển thị đầy đủ */
:deep(.el-input-number) {
  width: 140px !important;
  height: 36px !important;
}

:deep(.el-input-number .el-input__wrapper) {
  padding: 1px !important;
  box-shadow: 0 0 0 1px #dcdfe6 inset !important;
}

:deep(.el-input-number .el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px #c0c4cc inset !important;
}

:deep(.el-input-number__decrease),
:deep(.el-input-number__increase) {
  width: 36px !important;
  height: 34px !important;
  background-color: #f5f7fa;
  border: none !important;
  color: #606266;
  font-size: 16px;
  display: flex !important;
  align-items: center;
  justify-content: center;
  line-height: 1;
}

:deep(.el-input-number__decrease:hover),
:deep(.el-input-number__increase:hover) {
  background-color: #0ecfe0;
  color: #fff;
}

:deep(.el-input-number .el-input__inner) {
  text-align: center;
  padding: 0 4px !important;
  height: 34px !important;
  line-height: 34px !important;
}
</style>
