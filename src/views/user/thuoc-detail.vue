<template>
  <div class="thuoc-detail page-container" v-loading="loading">
    <el-row :gutter="40" v-if="thuoc">
      <el-col :span="10">
        <div class="image-container">
          <img
            :src="thuoc.urlAnh || 'https://via.placeholder.com/400'"
            class="product-image"
          />
        </div>
      </el-col>

      <el-col :span="14">
        <div class="product-info">
          <h1>{{ thuoc.tenThuoc }}</h1>
          
          <el-descriptions :column="1" border style="margin: 20px 0">
            <el-descriptions-item label="Mã thuốc">
              {{ thuoc.maThuoc }}
            </el-descriptions-item>
            <el-descriptions-item label="Loại thuốc">
              {{ thuoc.tenLoaiThuoc || 'N/A' }}
            </el-descriptions-item>
            <el-descriptions-item label="Hoạt chất">
              {{ thuoc.hoatChat || 'N/A' }}
            </el-descriptions-item>
            <el-descriptions-item label="Nước sản xuất">
              {{ thuoc.nuocSanXuat || 'N/A' }}
            </el-descriptions-item>
            <el-descriptions-item label="Đơn vị">
              {{ thuoc.tenLoaiDonVi || 'Viên' }}
            </el-descriptions-item>
          </el-descriptions>

          <div class="price-section">
            <span class="price-label">Giá bán:</span>
            <span class="price-value">{{ formatPrice(thuoc.donGiaSi) }}đ</span>
          </div>

          <div class="quantity-section">
            <span class="quantity-label">Số lượng:</span>
            <el-input-number v-model="quantity" :min="1" :max="100" />
          </div>

          <el-button
            type="primary"
            size="large"
            style="width: 100%; margin-top: 20px"
            @click="addToCart"
          >
            🛒 Thêm vào giỏ hàng
          </el-button>

          <el-button
            style="width: 100%; margin-top: 10px"
            @click="$router.back()"
          >
            ← Quay lại
          </el-button>
        </div>
      </el-col>
    </el-row>

    <el-empty v-else-if="!loading" description="Không tìm thấy thông tin thuốc" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import api from '@/api';
import { useCartStore } from '@/store';
import { ElMessage } from 'element-plus';

const route = useRoute();
const router = useRouter();
const cartStore = useCartStore();

const loading = ref(false);
const thuoc = ref(null);
const quantity = ref(1);

onMounted(async () => {
  await loadThuocDetail();
});

const loadThuocDetail = async () => {
  loading.value = true;
  try {
    const maThuoc = route.params.maThuoc;
    const response = await api.thuoc.getById(maThuoc);
    thuoc.value = response.data;
  } catch (error) {
    console.error('Load thuoc detail error:', error);
    ElMessage.error('Lỗi khi tải thông tin thuốc');
  } finally {
    loading.value = false;
  }
};

const addToCart = () => {
  if (!thuoc.value) return;

  cartStore.addToCart({
    maThuoc: thuoc.value.maThuoc,
    tenThuoc: thuoc.value.tenThuoc,
    donGia: thuoc.value.donGiaSi,
    donVi: thuoc.value.maLoaiDonVi,
    tenDonVi: thuoc.value.tenLoaiDonVi,
    urlAnh: thuoc.value.urlAnh,
    soLuong: quantity.value,
  });

  ElMessage.success('Đã thêm vào giỏ hàng');
  router.push('/user/cart');
};

const formatPrice = (price) => {
  return new Intl.NumberFormat('vi-VN').format(price);
};
</script>

<style scoped>
.thuoc-detail {
  padding: 20px 0;
}

.image-container {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
}

.product-image {
  width: 100%;
  height: auto;
}

.product-info h1 {
  color: #333;
  margin-bottom: 20px;
}

.price-section {
  margin: 30px 0;
  padding: 20px;
  background: #f5f5f5;
  border-radius: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.price-label {
  font-size: 18px;
  color: #666;
}

.price-value {
  font-size: 32px;
  font-weight: bold;
  color: #2E8B57;
}

.quantity-section {
  display: flex;
  align-items: center;
  gap: 20px;
  margin: 20px 0;
}

.quantity-label {
  font-size: 16px;
  font-weight: 500;
}
</style>
