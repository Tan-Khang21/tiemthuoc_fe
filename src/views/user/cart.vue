<template>
  <div class="cart-page">
    <h2>🛒 Giỏ hàng của bạn</h2>

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

        <el-button
          type="primary"
          size="large"
          style="width: 100%; margin-top: 20px"
          @click="handleCheckout"
        >
          Đặt hàng
        </el-button>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { useCartStore, useAuthStore } from '@/store';
import { ElMessage, ElMessageBox } from 'element-plus';

const router = useRouter();
const cartStore = useCartStore();
const authStore = useAuthStore();

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
  if (!authStore.isAuthenticated) {
    ElMessage.warning('Vui lòng đăng nhập để đặt hàng');
    router.push('/login');
    return;
  }

  const result = await cartStore.checkout({
    maKH: authStore.user.MAKH,
    ghiChu: 'Đơn hàng online',
  });

  if (result.success) {
    ElMessage.success('Đặt hàng thành công!');
    router.push('/user/orders');
  } else {
    ElMessage.error(result.message || 'Đặt hàng thất bại');
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
</style>
