# Hướng dẫn xây dựng Frontend Vue.js cho Nhà Thuốc MELON

## Tổng quan
Dự án này đã được thiết lập cấu trúc cơ bản với:
- ✅ API services đã kết nối với Backend (src/api/)
- ✅ Pinia stores cho quản lý state (auth, cart)
- ✅ Router đã cấu hình routes cho Admin và User
- ✅ Views đăng nhập/đăng ký hoàn chỉnh

## Cài đặt

```bash
cd tiemthuoc_fe
npm install
npm run dev
```

## Cấu trúc dự án đã tạo

```
tiemthuoc_fe/
├── src/
│   ├── api/              # ✅ HOÀN THÀNH - Các API services
│   │   ├── axios.js      # Axios instance với interceptors
│   │   ├── thuoc.js      # API thuốc
│   │   ├── hoadon.js     # API hóa đơn
│   │   ├── phieunhap.js  # API phiếu nhập
│   │   ├── khachhang.js  # API khách hàng
│   │   ├── nhacungcap.js # API nhà cung cấp
│   │   ├── taikhoan.js   # API tài khoản
│   │   ├── thuocview.js  # API view kho thuốc
│   │   └── index.js      # Export tất cả API
│   │
│   ├── store/            # ✅ HOÀN THÀNH - Pinia stores
│   │   ├── auth.js       # Store xác thực người dùng
│   │   ├── cart.js       # Store giỏ hàng
│   │   └── index.js      # Export stores
│   │
│   ├── router/           # ✅ HOÀN THÀNH - Vue Router
│   │   └── index.js      # Cấu hình routes
│   │
│   ├── views/            # ⚠️ CẦN HOÀN THIỆN
│   │   ├── auth/         # ✅ HOÀN THÀNH
│   │   │   ├── login.vue
│   │   │   └── register.vue
│   │   ├── user/         # ⚠️ CẦN TẠO
│   │   │   ├── user-layout.vue
│   │   │   ├── thuoc-list.vue
│   │   │   ├── thuoc-detail.vue
│   │   │   ├── cart.vue
│   │   │   ├── profile.vue
│   │   │   └── orders.vue
│   │   └── admin/        # ⚠️ CẦN TẠO
│   │       ├── admin-layout.vue
│   │       ├── thuoc.vue
│   │       ├── nhacungcap.vue
│   │       ├── phieunhap.vue
│   │       ├── them-phieunhap.vue
│   │       ├── hoadon.vue
│   │       ├── them-hoadon.vue
│   │       └── kho.vue
│   │
│   ├── App.vue           # ✅ HOÀN THÀNH
│   └── main.js           # ✅ HOÀN THÀNH
└── package.json          # ✅ HOÀN THÀNH
```

## Công việc còn lại

### 1. User Views (Khách hàng)

#### user-layout.vue
```vue
<template>
  <div class="user-layout">
    <el-container>
      <!-- Header -->
      <el-header class="header">
        <div class="header-content">
          <h2>🏥 Nhà Thuốc MELON</h2>
          <el-menu mode="horizontal" :default-active="activeMenu">
            <el-menu-item index="1" @click="$router.push('/user')">
              Trang chủ
            </el-menu-item>
            <el-menu-item index="2" @click="$router.push('/user/cart')">
              <el-badge :value="cartStore.totalItems" :hidden="cartStore.totalItems === 0">
                Giỏ hàng
              </el-badge>
            </el-menu-item>
            <el-menu-item index="3" @click="$router.push('/user/orders')" v-if="authStore.isAuthenticated">
              Đơn hàng
            </el-menu-item>
            <el-menu-item index="4" @click="$router.push('/user/profile')" v-if="authStore.isAuthenticated">
              Tài khoản
            </el-menu-item>
            <el-menu-item index="5" v-if="!authStore.isAuthenticated" @click="$router.push('/login')">
              Đăng nhập
            </el-menu-item>
            <el-menu-item index="6" v-else @click="handleLogout">
              Đăng xuất
            </el-menu-item>
          </el-menu>
        </div>
      </el-header>

      <!-- Main Content -->
      <el-main>
        <router-view />
      </el-main>

      <!-- Footer -->
      <el-footer class="footer">
        <p>© 2025 Nhà Thuốc MELON - Sức khỏe là vàng</p>
      </el-footer>
    </el-container>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore, useCartStore } from '@/store';
import { ElMessage } from 'element-plus';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const cartStore = useCartStore();

const activeMenu = computed(() => {
  const path = route.path;
  if (path === '/user') return '1';
  if (path === '/user/cart') return '2';
  if (path === '/user/orders') return '3';
  if (path === '/user/profile') return '4';
  return '1';
});

const handleLogout = () => {
  authStore.logout();
  ElMessage.success('Đã đăng xuất');
  router.push('/login');
};
</script>

<style scoped>
/* Add your styling */
</style>
```

#### thuoc-list.vue
```vue
<template>
  <div class="thuoc-list">
    <h2>Danh sách thuốc</h2>
    
    <!-- Search and Filter -->
    <el-row :gutter="20" class="filter-section">
      <el-col :span="8">
        <el-input
          v-model="searchKeyword"
          placeholder="Tìm kiếm thuốc..."
          @input="handleSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
      </el-col>
      <el-col :span="8">
        <el-select
          v-model="selectedCategory"
          placeholder="Chọn loại thuốc"
          @change="handleCategoryChange"
          clearable
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
    <el-row :gutter="20" v-loading="loading">
      <el-col
        :span="6"
        v-for="thuoc in thuocList"
        :key="thuoc.maThuoc"
        class="product-col"
      >
        <el-card class="product-card" @click="viewDetail(thuoc.maThuoc)">
          <img :src="thuoc.urlAnh || '/placeholder.jpg'" class="product-image" />
          <div class="product-info">
            <h4>{{ thuoc.tenThuoc }}</h4>
            <p class="price">{{ formatPrice(thuoc.donGiaSi) }}đ</p>
            <el-button type="primary" size="small" @click.stop="addToCart(thuoc)">
              Thêm vào giỏ
            </el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
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
    thuocList.value = response.data || [];
  } catch (error) {
    ElMessage.error('Lỗi khi tải danh sách thuốc');
  } finally {
    loading.value = false;
  }
};

const handleCategoryChange = () => {
  loadThuocList();
};

const handleSearch = () => {
  // Implement search logic
  // You may need to add a search API endpoint
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
</script>
```

### 2. Admin Views

Tương tự, bạn cần tạo các view cho Admin với các chức năng CRUD cho:
- Thuốc (thuoc.vue)
- Nhà cung cấp (nhacungcap.vue)
- Phiếu nhập (phieunhap.vue, them-phieunhap.vue)
- Hóa đơn (hoadon.vue, them-hoadon.vue)
- Kho (kho.vue)

## API Endpoints đã có sẵn

### Thuốc
- GET /api/Thuoc - Lấy tất cả thuốc
- GET /api/Thuoc/ListThuocTonKho - Lấy thuốc có tồn kho
- GET /api/Thuoc/ByLoaiTonKho/{maLoai} - Lấy theo loại
- GET /api/Thuoc/{maThuoc} - Chi tiết thuốc
- POST /api/Thuoc - Tạo thuốc mới
- PUT /api/Thuoc/{maThuoc} - Cập nhật thuốc
- DELETE /api/Thuoc/{maThuoc} - Xóa thuốc

### Hóa đơn
- GET /api/HoaDon/Search - Tìm kiếm hóa đơn
- POST /api/HoaDon/Create - Tạo hóa đơn trực tiếp
- POST /api/HoaDon/CreateOnline - Tạo hóa đơn online
- POST /api/HoaDon/Cancel/{maHd} - Hủy hóa đơn

### Phiếu nhập
- GET /api/PhieuNhap/GetByDateRange - Lấy theo khoảng thời gian
- POST /api/PhieuNhap/AddPhieuNhap - Thêm phiếu nhập

## Gợi ý hoàn thiện

1. **Tạo các component dùng chung:**
   - ProductCard.vue
   - DataTable.vue
   - FormDialog.vue

2. **Cải thiện UI/UX:**
   - Thêm loading states
   - Toast notifications
   - Error handling
   - Responsive design

3. **Thêm tính năng:**
   - Pagination cho danh sách
   - Export Excel
   - Upload ảnh thuốc
   - In hóa đơn/phiếu nhập

4. **Testing:**
   - Test từng chức năng
   - Test với backend thật
   - Fix bugs

## Chạy thử nghiệm

1. Đảm bảo Backend đang chạy tại https://kltn-l679.onrender.com/api
2. Chạy frontend: `npm run dev`
3. Truy cập: http://localhost:5173

## Lưu ý quan trọng

- **Base URL API**: Kiểm tra và thay đổi trong `src/api/axios.js` nếu backend chạy ở port khác
- **Authentication**: API có thể cần token, đã được cấu hình trong axios interceptor
- **CORS**: Đảm bảo backend cho phép CORS từ frontend

## Tham khảo

- Element Plus: https://element-plus.org/
- Vue Router: https://router.vuejs.org/
- Pinia: https://pinia.vuejs.org/

Chúc bạn code vui vẻ! 🎉
