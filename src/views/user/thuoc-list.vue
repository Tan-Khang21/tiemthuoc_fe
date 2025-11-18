<template>
  <div class="thuoc-list">
    <h2>Danh sách thuốc</h2>
    
    <!-- Search and Filter -->
    <el-row :gutter="20" class="filter-section">
      <el-col :span="12">
        <el-input
          v-model="searchKeyword"
          placeholder="Tìm kiếm thuốc..."
          size="large"
          clearable
        >
          <template #prefix>
            <span>🔍</span>
          </template>
        </el-input>
      </el-col>
      <el-col :span="12">
        <el-select
          v-model="selectedCategory"
          placeholder="Chọn loại thuốc"
          @change="handleCategoryChange"
          size="large"
          clearable
          style="width: 100%"
        >
          <el-option
            v-for="cat in categories"
            :key="cat.maLoaiThuoc"
            :label="cat.tenLoaiThuoc"
            :value="cat.maLoaiThuoc"
          />
        </el-select>
      </el-col>
    </el-row>

    <!-- Product Grid -->
    <div v-loading="loading" style="min-height: 400px">
      <el-row :gutter="20" v-if="thuocList.length > 0">
        <el-col
          :xs="24"
          :sm="12"
          :md="8"
          :lg="6"
          v-for="thuoc in filteredThuocList"
          :key="thuoc.maThuoc"
          class="product-col"
        >
          <el-card class="product-card" shadow="hover">
            <div class="product-image-container" @click="viewDetail(thuoc.maThuoc)">
              <img
                :src="thuoc.urlAnh || 'https://via.placeholder.com/200'"
                class="product-image"
                @error="handleImageError"
              />
            </div>
            <div class="product-info">
              <h4 class="product-name" @click="viewDetail(thuoc.maThuoc)">
                {{ thuoc.tenThuoc }}
              </h4>
              <p class="product-unit">{{ thuoc.tenLoaiDonVi || 'Viên' }}</p>
              <p class="product-price">{{ formatPrice(thuoc.donGiaSi) }}đ</p>
              <el-button
                type="primary"
                size="default"
                style="width: 100%"
                @click="addToCart(thuoc)"
              >
                🛒 Thêm vào giỏ
              </el-button>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <el-empty v-else description="Không có thuốc nào" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import api from '@/api';
import { useCartStore } from '@/store';
import { ElMessage } from 'element-plus';

const router = useRouter();
const cartStore = useCartStore();

const loading = ref(false);
const thuocList = ref([]);
const categories = ref([]);
const searchKeyword = ref('');
const selectedCategory = ref('');

const filteredThuocList = computed(() => {
  if (!searchKeyword.value) return thuocList.value;
  
  return thuocList.value.filter(thuoc =>
    thuoc.tenThuoc.toLowerCase().includes(searchKeyword.value.toLowerCase())
  );
});

onMounted(async () => {
  await loadCategories();
  await loadThuocList();
});

const loadCategories = async () => {
  try {
    const response = await api.thuoc.getTopLoaiThuoc();
    categories.value = response.data || [];
  } catch (error) {
    console.error('Load categories error:', error);
  }
};

const loadThuocList = async () => {
  loading.value = true;
  try {
    let response;
    if (selectedCategory.value) {
      response = await api.thuoc.getByLoaiTonKho(selectedCategory.value);
    } else {
      response = await api.thuoc.getListThuocTonKho();
    }
    console.log('API Response:', response.data);
    // API trả về {status: 1, data: [...]}
    thuocList.value = response.data?.data || response.data || [];
  } catch (error) {
    console.error('Load thuoc error:', error);
    ElMessage.error('Lỗi khi tải danh sách thuốc');
  } finally {
    loading.value = false;
  }
};

const handleCategoryChange = () => {
  loadThuocList();
};

const viewDetail = (maThuoc) => {
  router.push(`/user/thuoc/${maThuoc}`);
};

const addToCart = (thuoc) => {
  cartStore.addToCart({
    maThuoc: thuoc.maThuoc,
    tenThuoc: thuoc.tenThuoc,
    donGia: thuoc.donGiaSi,
    donVi: thuoc.maLoaiDonVi,
    tenDonVi: thuoc.tenLoaiDonVi,
    urlAnh: thuoc.urlAnh,
    soLuong: 1,
  });
  ElMessage.success('Đã thêm vào giỏ hàng');
};

const formatPrice = (price) => {
  return new Intl.NumberFormat('vi-VN').format(price);
};

const handleImageError = (e) => {
  e.target.src = 'https://via.placeholder.com/200?text=No+Image';
};
</script>

<style scoped>
.thuoc-list {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.filter-section {
  margin-bottom: 30px;
}

.product-col {
  margin-bottom: 20px;
}

.product-card {
  height: 100%;
  transition: transform 0.3s;
}

.product-card:hover {
  transform: translateY(-5px);
}

.product-image-container {
  cursor: pointer;
  overflow: hidden;
  border-radius: 8px;
  margin-bottom: 15px;
}

.product-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
  transition: transform 0.3s;
}

.product-image:hover {
  transform: scale(1.05);
}

.product-info {
  text-align: center;
}

.product-name {
  font-size: 16px;
  margin: 10px 0;
  cursor: pointer;
  color: #333;
  min-height: 40px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  line-clamp: 2;
}

.product-name:hover {
  color: #2E8B57;
}

.product-unit {
  color: #999;
  font-size: 14px;
  margin: 5px 0;
}

.product-price {
  font-size: 20px;
  font-weight: bold;
  color: #2E8B57;
  margin: 10px 0;
}
</style>
