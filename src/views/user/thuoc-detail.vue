<template>
  <div class="thuoc-detail-page">
    <div class="container">
      <!-- Breadcrumb -->
      <div class="breadcrumb">
        <router-link to="/">Trang chủ</router-link>
        <i class="fas fa-chevron-right"></i>
        <router-link to="/user/thuoc">Sản phẩm</router-link>
        <i class="fas fa-chevron-right"></i>
        <span>{{ thuoc?.tenThuoc || 'Chi tiết' }}</span>
      </div>

      <!-- Product Detail -->
      <div v-if="loading" class="loading-container">
        <el-skeleton :rows="8" animated />
      </div>

      <div v-else-if="thuoc" class="product-detail">
        <div class="row">
          <!-- Product Images -->
          <div class="col-lg-5">
            <div class="product-images">
              <div class="main-image-wrapper">
                <img :src="getProductImage(thuoc)" :alt="thuoc.tenThuoc" class="main-image">
                <div class="image-badges">
                  <span class="badge-stock" v-if="getStockQuantity() > 0">
                    <i class="fas fa-check-circle"></i> Còn hàng
                  </span>
                  <span class="badge-authentic">
                    <i class="fas fa-shield-check"></i> Chính hãng
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Product Info -->
          <div class="col-lg-7">
            <div class="product-content">
              <div class="product-meta-top">
                <div class="product-category">
                  <i class="fas fa-tag"></i>
                  {{ thuoc.tenLoaiThuoc || 'Dược phẩm' }}
                </div>
                <div class="product-sku">
                  <i class="fas fa-barcode"></i> {{ thuoc.maThuoc }}
                </div>
              </div>
              
              <h1 class="product-title">{{ thuoc.tenThuoc }}</h1>
              
              <div class="product-rating">
                <div class="stars">
                  <i class="fas fa-star"></i>
                  <i class="fas fa-star"></i>
                  <i class="fas fa-star"></i>
                  <i class="fas fa-star"></i>
                  <i class="fas fa-star-half-alt"></i>
                </div>
                <span class="rating-score">4.5</span>
                <span class="rating-count">(128 đánh giá)</span>
                <span class="divider">|</span>
                <span class="sold-count">
                  <i class="fas fa-shopping-cart"></i> Đã bán 850+
                </span>
              </div>

              <div class="product-price-card">
                <div class="price-row">
                  <div class="price-main">
                    <span class="price-label">Giá bán</span>
                    <span class="current-price">{{ formatPrice(getProductPrice(thuoc)) }}</span>
                  </div>
                  <div class="price-unit">
                    <i class="fas fa-box"></i>
                    <span>{{ getProductUnit(thuoc) }}</span>
                  </div>
                </div>
              </div>

              <div class="product-short-info">
                <div class="info-item">
                  <i class="fas fa-flask"></i>
                  <div>
                    <span class="label">Thành phần:</span>
                    <span class="value">{{ thuoc.thanhPhan || 'Đang cập nhật' }}</span>
                  </div>
                </div>
                <div class="info-item" v-if="thuoc.tenNCC">
                  <i class="fas fa-building"></i>
                  <div>
                    <span class="label">Nhà cung cấp:</span>
                    <span class="value">{{ thuoc.tenNCC }}</span>
                  </div>
                </div>
                <div class="info-item">
                  <i class="fas fa-boxes"></i>
                  <div>
                    <span class="label">Tồn kho:</span>
                    <span class="value stock">{{ getStockQuantity() }} {{ getProductUnit(thuoc) }}</span>
                  </div>
                </div>
              </div>

              <!-- Chọn đơn vị tính -->
              <div class="unit-selector-modern" v-if="thuoc.giaThuocs && thuoc.giaThuocs.length > 0">
                <label class="section-label">
                  <i class="fas fa-box-open"></i>
                  Chọn đơn vị đóng gói
                </label>
                <div class="unit-grid">
                  <div 
                    v-for="unit in thuoc.giaThuocs" 
                    :key="unit.maGiaThuoc"
                    @click="changeUnit(unit)"
                    :class="['unit-card-modern', { selected: selectedUnit?.maGiaThuoc === unit.maGiaThuoc }]"
                  >
                    <div class="unit-check" v-if="selectedUnit?.maGiaThuoc === unit.maGiaThuoc">
                      <i class="fas fa-check-circle"></i>
                    </div>
                    <div class="unit-name">{{ unit.tenLoaiDonVi }}</div>
                    <div class="unit-price-modern">{{ formatPriceShort(unit.donGia) }}</div>
                    <div class="unit-stock-modern">
                      <i class="fas fa-warehouse"></i>
                      Còn {{ unit.soLuongCon }}
                    </div>
                  </div>
                </div>
              </div>

              <div class="product-actions">
                <div class="quantity-selector-modern">
                  <label class="section-label">
                    <i class="fas fa-calculator"></i>
                    Số lượng
                  </label>
                  <div class="quantity-controls-modern">
                    <button @click="decreaseQuantity" class="qty-btn-modern">
                      <i class="fas fa-minus"></i>
                    </button>
                    <input type="number" v-model.number="quantity" :min="1" :max="100" />
                    <button @click="increaseQuantity" class="qty-btn-modern">
                      <i class="fas fa-plus"></i>
                    </button>
                  </div>
                </div>

                <div class="action-buttons-modern">
                  <button class="btn-add-cart-modern" @click="addToCart">
                    <i class="fas fa-cart-plus"></i>
                    <span>Thêm vào giỏ</span>
                  </button>
                  <button class="btn-buy-now-modern" @click="buyNow">
                    <i class="fas fa-bolt"></i>
                    <span>Mua ngay</span>
                  </button>
                </div>
              </div>

              <div class="product-guarantees">
                <div class="guarantee-card">
                  <div class="guarantee-icon">
                    <i class="fas fa-shield-check"></i>
                  </div>
                  <div class="guarantee-text">
                    <strong>Chính hãng</strong>
                    <span>100% chất lượng</span>
                  </div>
                </div>
                <div class="guarantee-card">
                  <div class="guarantee-icon">
                    <i class="fas fa-undo-alt"></i>
                  </div>
                  <div class="guarantee-text">
                    <strong>Đổi trả</strong>
                    <span>Trong vòng 30 ngày</span>
                  </div>
                </div>
                <div class="guarantee-card">
                  <div class="guarantee-icon">
                    <i class="fas fa-shipping-fast"></i>
                  </div>
                  <div class="guarantee-text">
                    <strong>Giao hàng</strong>
                    <span>Toàn quốc</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Product Tabs -->
        <div class="product-tabs">
          <el-tabs v-model="activeTab">
            <el-tab-pane label="Mô tả sản phẩm" name="description">
              <div class="tab-content">
                <h3>Mô tả chi tiết</h3>
                <p v-if="thuoc.moTa" class="description-text">{{ thuoc.moTa }}</p>
                <p v-else class="no-data">Đang cập nhật thông tin mô tả sản phẩm...</p>
              </div>
            </el-tab-pane>

            <el-tab-pane label="Công dụng" name="uses">
              <div class="tab-content">
                <h3>Công dụng</h3>
                <div class="uses-content">
                  <p v-if="thuoc.congDung" class="description-text">{{ thuoc.congDung }}</p>
                  <p v-else class="no-data">Đang cập nhật thông tin công dụng...</p>
                </div>
              </div>
            </el-tab-pane>

            <el-tab-pane label="Cách dùng" name="usage">
              <div class="tab-content">
                <h3>Cách dùng</h3>
                <div class="usage-content">
                  <p v-if="thuoc.cachDung" class="description-text">{{ thuoc.cachDung }}</p>
                  <p v-else class="no-data">Đang cập nhật thông tin cách dùng...</p>
                </div>
              </div>
            </el-tab-pane>

            <el-tab-pane label="Lưu ý" name="notes">
              <div class="tab-content">
                <h3>Lưu ý khi sử dụng</h3>
                <div class="notes-content">
                  <div v-if="thuoc.luuY" class="alert-box">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p class="description-text">{{ thuoc.luuY }}</p>
                  </div>
                  <p v-else class="no-data">Đang cập nhật thông tin lưu ý...</p>
                </div>
              </div>
            </el-tab-pane>

            <el-tab-pane label="Thông tin chi tiết" name="specifications">
              <div class="tab-content">
                <h3>Thông số kỹ thuật</h3>
                <table class="specs-table">
                  <tbody>
                    <tr>
                      <td>Mã sản phẩm</td>
                      <td>{{ thuoc.maThuoc }}</td>
                    </tr>
                    <tr>
                      <td>Loại thuốc</td>
                      <td>{{ thuoc.tenLoaiThuoc || 'N/A' }}</td>
                    </tr>
                    <tr v-if="thuoc.thanhPhan">
                      <td>Thành phần</td>
                      <td>{{ thuoc.thanhPhan }}</td>
                    </tr>
                    <tr v-if="thuoc.tenNCC">
                      <td>Nhà cung cấp</td>
                      <td>{{ thuoc.tenNCC }}</td>
                    </tr>
                    <tr v-if="thuoc.maNCC">
                      <td>Mã nhà cung cấp</td>
                      <td>{{ thuoc.maNCC }}</td>
                    </tr>
                    <tr>
                      <td>Đơn vị tính</td>
                      <td>{{ getProductUnit(thuoc) }}</td>
                    </tr>
                    <tr v-if="selectedUnit">
                      <td>Quy cách đóng gói</td>
                      <td>{{ selectedUnit.soLuong }} {{ getProductUnit(thuoc) }}</td>
                    </tr>
                    <tr v-if="selectedUnit && selectedUnit.soLuongCon">
                      <td>Tồn kho</td>
                      <td><span class="stock-badge">{{ selectedUnit.soLuongCon }} {{ getProductUnit(thuoc) }}</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </el-tab-pane>
          </el-tabs>
        </div>

        <!-- Related Products -->
        <div class="related-products" v-if="relatedProducts.length > 0">
          <h2 class="section-title">Sản phẩm liên quan</h2>
          <div class="products-grid">
            <div v-for="product in relatedProducts.slice(0, 4)" :key="product.maThuoc" class="product-card">
              <router-link :to="`/user/thuoc/${product.maThuoc}`" class="product-link">
                <div class="product-image">
                  <img :src="getProductImage(product)" :alt="product.tenThuoc">
                </div>
                <div class="product-info">
                  <h4>{{ product.tenThuoc }}</h4>
                  <div class="product-price">
                    <span class="price">{{ formatPrice(getProductPrice(product)) }}</span>
                  </div>
                </div>
              </router-link>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="empty-state">
        <i class="fas fa-box-open"></i>
        <p>Không tìm thấy thông tin sản phẩm</p>
        <button @click="$router.push('/user/thuoc')" class="btn-back">
          Quay lại danh sách sản phẩm
        </button>
      </div>
    </div>
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
const activeTab = ref('description');
const relatedProducts = ref([]);
const selectedUnit = ref(null); // Đơn vị tính được chọn
const availableUnits = ref([]); // Danh sách đơn vị tính khả dụng

onMounted(async () => {
  await loadThuocDetail();
  await loadRelatedProducts();
});

const loadThuocDetail = async () => {
  loading.value = true;
  try {
    const maThuoc = route.params.maThuoc;
    const response = await api.thuoc.getById(maThuoc);
    console.log('API Response:', response);
    
    // API trả về { status, message, data: {...} }
    const data = response.data?.data || response.data;
    
    // Lọc giaThuocs: chỉ giữ những đơn vị có soLuongCon > 0 và trangThai === true
    if (data && data.giaThuocs) {
      availableUnits.value = data.giaThuocs.filter(
        unit => unit.soLuongCon > 0 && unit.trangThai === true
      );
      
      // Nếu không có đơn vị nào khả dụng, ẩn sản phẩm (redirect hoặc hiển thị thông báo)
      if (availableUnits.value.length === 0) {
        ElMessage.warning('Sản phẩm tạm hết hàng');
        router.push('/user/thuoc');
        return;
      }
      
      // Chọn đơn vị đầu tiên làm mặc định
      selectedUnit.value = availableUnits.value[0];
      
      // Cập nhật data với giaThuocs đã lọc
      data.giaThuocs = availableUnits.value;
    }
    
    thuoc.value = data;
  } catch (error) {
    console.error('Load thuoc detail error:', error);
    ElMessage.error('Lỗi khi tải thông tin thuốc');
  } finally {
    loading.value = false;
  }
};

const loadRelatedProducts = async () => {
  try {
    const response = await api.thuoc.getAll();
    relatedProducts.value = (response.data || [])
      .filter(p => p && p.maThuoc && p.maThuoc !== route.params.maThuoc)
      .slice(0, 4);
  } catch (error) {
    console.error('Load related products error:', error);
  }
};

const getProductImage = (product) => {
  const urlAnh = product?.urlAnh || product?.UrlAnh;
  if (urlAnh && (urlAnh.startsWith('http://') || urlAnh.startsWith('https://'))) {
    return urlAnh;
  }
  return 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=500&h=500&fit=crop';
};

const getProductPrice = (product) => {
  // Sử dụng đơn vị đã chọn nếu có
  if (selectedUnit.value) {
    return selectedUnit.value.donGia;
  }
  if (product?.giaThuocs && product.giaThuocs.length > 0) {
    return product.giaThuocs[0].donGia;
  }
  return product?.donGiaSi || 0;
};

const getProductUnit = (product) => {
  // Sử dụng đơn vị đã chọn nếu có
  if (selectedUnit.value) {
    return selectedUnit.value.tenLoaiDonVi;
  }
  if (product?.giaThuocs && product.giaThuocs.length > 0) {
    return product.giaThuocs[0].tenLoaiDonVi;
  }
  return product?.tenLoaiDonVi || 'Hộp';
};

const getStockQuantity = () => {
  if (selectedUnit.value) {
    return selectedUnit.value.soLuongCon;
  }
  if (thuoc.value?.giaThuocs && thuoc.value.giaThuocs.length > 0) {
    return thuoc.value.giaThuocs[0].soLuongCon;
  }
  return 0;
};

const changeUnit = (unit) => {
  selectedUnit.value = unit;
  quantity.value = 1; // Reset số lượng khi đổi đơn vị
};

const increaseQuantity = () => {
  if (quantity.value < 100) {
    quantity.value++;
  }
};

const decreaseQuantity = () => {
  if (quantity.value > 1) {
    quantity.value--;
  }
};

const addToCart = () => {
  if (!thuoc.value || !selectedUnit.value) return;

  cartStore.addToCart({
    maThuoc: thuoc.value.maThuoc,
    tenThuoc: thuoc.value.tenThuoc,
    donGia: selectedUnit.value.donGia,
    donVi: selectedUnit.value.maLoaiDonVi,
    tenDonVi: selectedUnit.value.tenLoaiDonVi,
    urlAnh: thuoc.value.urlAnh,
    soLuong: quantity.value,
  });

  ElMessage.success('Đã thêm vào giỏ hàng!');
};

const buyNow = () => {
  addToCart();
  router.push('/user/cart');
};

const formatPrice = (price) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(price || 0);
};

const formatPriceShort = (price) => {
  if (!price || price === 0) return '0 đ';
  return new Intl.NumberFormat('vi-VN').format(price) + ' đ';
};
</script>

<style scoped>
.thuoc-detail-page {
  background: #f8f9fa;
  min-height: 100vh;
  padding: 30px 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

/* Breadcrumb */
.breadcrumb {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 30px;
  font-size: 14px;
}

.breadcrumb a {
  color: #666;
  text-decoration: none;
  transition: color 0.3s;
}

.breadcrumb a:hover {
  color: #0ecfe0;
}

.breadcrumb i {
  font-size: 10px;
  color: #999;
}

.breadcrumb span {
  color: #0ecfe0;
  font-weight: 500;
}

/* Loading */
.loading-container {
  background: #fff;
  padding: 40px;
  border-radius: 10px;
}

/* Product Detail */
.product-detail {
  background: #fff;
  border-radius: 10px;
  padding: 40px;
  margin-bottom: 30px;
}

.row {
  display: flex;
  gap: 40px;
  margin-bottom: 50px;
}

.col-lg-5 {
  flex: 0 0 40%;
}

.col-lg-7 {
  flex: 0 0 calc(60% - 40px);
}

/* Product Images - Modern Design */
.product-images {
  position: sticky;
  top: 20px;
}

.main-image-wrapper {
  position: relative;
  border-radius: 20px;
  overflow: hidden;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  padding: 30px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
  border: 1px solid #e0e0e0;
}

.main-image {
  width: 100%;
  height: 500px;
  object-fit: contain;
  transition: transform 0.5s ease;
  cursor: zoom-in;
}

.main-image-wrapper:hover .main-image {
  transform: scale(1.05);
}

.image-badges {
  position: absolute;
  top: 20px;
  left: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  z-index: 2;
}

.badge-stock {
  background: linear-gradient(135deg, #4ecdc4, #44a08d);
  color: #fff;
  padding: 10px 18px;
  border-radius: 25px;
  font-size: 13px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 4px 15px rgba(78, 205, 196, 0.4);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.badge-authentic {
  background: linear-gradient(135deg, #f093fb, #f5576c);
  color: #fff;
  padding: 10px 18px;
  border-radius: 25px;
  font-size: 13px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 4px 15px rgba(245, 87, 108, 0.4);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Product Content */
.product-content {
  padding-left: 20px;
}

.product-meta-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 12px;
}

.product-category {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  padding: 8px 20px;
  border-radius: 25px;
  font-size: 13px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

.product-sku {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: #f8f9fa;
  color: #666;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  border: 1px solid #e0e0e0;
}

.product-title {
  font-size: 28px;
  font-weight: 800;
  color: #2c3e50;
  line-height: 1.3;
  margin-bottom: 20px;
  letter-spacing: -0.5px;
}

/* Rating - Modern */
.product-rating {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 25px;
  padding: 18px 20px;
  background: linear-gradient(135deg, #fff9e6 0%, #fff3cd 100%);
  border-radius: 15px;
  border: 1px solid #ffe69c;
}

.stars {
  display: flex;
  gap: 4px;
}

.stars i {
  color: #ffc107;
  font-size: 18px;
  filter: drop-shadow(0 2px 4px rgba(255, 193, 7, 0.3));
}

.rating-score {
  font-size: 20px;
  font-weight: 800;
  color: #f59e0b;
  margin-left: 4px;
}

.rating-count {
  color: #666;
  font-size: 14px;
  font-weight: 500;
}

.divider {
  color: #ddd;
  font-weight: 300;
}

.sold-count {
  color: #666;
  font-size: 14px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 6px;
}

.sold-count i {
  color: #0ecfe0;
}

/* Price Card - Modern */
.product-price-card {
  background: linear-gradient(135deg, #0ecfe0 0%, #0bb5c4 100%);
  padding: 25px;
  border-radius: 20px;
  margin-bottom: 30px;
  box-shadow: 0 10px 30px rgba(14, 207, 224, 0.3);
  position: relative;
  overflow: hidden;
}

.product-price-card::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -20%;
  width: 200px;
  height: 200px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  filter: blur(40px);
}

.price-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  z-index: 1;
}

.price-main {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.price-label {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.current-price {
  font-size: 38px;
  font-weight: 900;
  color: #fff;
  letter-spacing: -1px;
  text-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.price-unit {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 12px 20px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 15px;
  backdrop-filter: blur(10px);
}

.price-unit i {
  font-size: 24px;
  color: #fff;
}

.price-unit span {
  font-size: 13px;
  color: #fff;
  font-weight: 700;
  text-transform: uppercase;
}

/* Short Info */
.product-short-info {
  margin-bottom: 30px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 10px;
}

.info-item {
  display: flex;
  align-items: flex-start;
  gap: 15px;
  padding: 12px 0;
  border-bottom: 1px solid #e5e5e5;
}

.info-item:last-child {
  border-bottom: none;
}

.info-item i {
  color: #0ecfe0;
  font-size: 18px;
  margin-top: 2px;
}

.info-item .label {
  font-weight: 600;
  color: #17181c;
  margin-right: 8px;
}

.info-item .value {
  color: #666;
}

.info-item .value.stock {
  color: #28a745;
  font-weight: 600;
}

/* Product Actions */
.product-actions {
  margin-bottom: 30px;
}

/* Unit Selector Modern */
.unit-selector-modern {
  margin-bottom: 25px;
}

.section-label {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 700;
  font-size: 15px;
  color: #2c3e50;
  margin-bottom: 15px;
}

.section-label i {
  color: #0ecfe0;
  font-size: 18px;
}

.unit-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 12px;
}

.unit-card-modern {
  position: relative;
  background: #fff;
  border: 2px solid #e0e0e0;
  border-radius: 15px;
  padding: 18px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.unit-card-modern:hover {
  border-color: #0ecfe0;
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(14, 207, 224, 0.2);
}

.unit-card-modern.selected {
  border-color: #0ecfe0;
  background: linear-gradient(135deg, #e0f7fa 0%, #b2ebf2 100%);
  box-shadow: 0 8px 25px rgba(14, 207, 224, 0.3);
  transform: translateY(-2px);
}

.unit-check {
  position: absolute;
  top: -8px;
  right: -8px;
  width: 28px;
  height: 28px;
  background: linear-gradient(135deg, #0ecfe0, #0bb5c4);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(14, 207, 224, 0.4);
}

.unit-check i {
  color: #fff;
  font-size: 14px;
}

.unit-name {
  font-weight: 700;
  font-size: 16px;
  color: #2c3e50;
  margin-bottom: 8px;
  text-transform: capitalize;
}

.unit-price-modern {
  font-size: 20px;
  font-weight: 800;
  background: linear-gradient(135deg, #0ecfe0, #0bb5c4);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 6px;
}

.unit-stock-modern {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-size: 12px;
  color: #27ae60;
  font-weight: 600;
}

.unit-stock-modern i {
  font-size: 13px;
}

/* Unit Selector */
.unit-selector {
  margin-bottom: 25px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 10px;
}

.unit-selector label {
  display: block;
  font-weight: 600;
  margin-bottom: 15px;
  color: #17181c;
  font-size: 15px;
}

.unit-options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 12px;
}

.unit-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 15px;
  background: #fff;
  border: 2px solid #e5e5e5;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
}

.unit-option:hover {
  border-color: #0ecfe0;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(14, 207, 224, 0.15);
}

.unit-option.active {
  border-color: #0ecfe0;
  background: linear-gradient(135deg, #f0f9ff, #e0f7fa);
  box-shadow: 0 4px 12px rgba(14, 207, 224, 0.2);
}

.unit-name {
  font-weight: 600;
  color: #17181c;
  font-size: 15px;
  margin-bottom: 5px;
}

.unit-price {
  color: #0ecfe0;
  font-weight: 700;
  font-size: 18px;
  margin-bottom: 3px;
}

.unit-stock {
  font-size: 13px;
  color: #28a745;
  font-weight: 500;
}

/* Quantity Selector Modern */
.quantity-selector-modern {
  margin-bottom: 20px;
}

.quantity-controls-modern {
  display: inline-flex;
  align-items: center;
  gap: 0;
  background: #fff;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  overflow: hidden;
}

.qty-btn-modern {
  width: 50px;
  height: 50px;
  background: #f8f9fa;
  border: none;
  cursor: pointer;
  color: #0ecfe0;
  font-size: 18px;
  font-weight: 700;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.qty-btn-modern:hover {
  background: linear-gradient(135deg, #0ecfe0, #0bb5c4);
  color: #fff;
}

.quantity-controls-modern input {
  width: 80px;
  height: 50px;
  border: none;
  border-left: 1px solid #e0e0e0;
  border-right: 1px solid #e0e0e0;
  text-align: center;
  font-size: 18px;
  font-weight: 700;
  outline: none;
  color: #2c3e50;
}

/* Action Buttons Modern */
.action-buttons-modern {
  display: flex;
  gap: 15px;
  margin-top: 20px;
}

.btn-add-cart-modern,
.btn-buy-now-modern {
  flex: 1;
  height: 58px;
  border: none;
  border-radius: 15px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  transition: all 0.3s;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.btn-add-cart-modern {
  background: #fff;
  color: #0ecfe0;
  border: 3px solid #0ecfe0;
}

.btn-add-cart-modern:hover {
  background: linear-gradient(135deg, #0ecfe0, #0bb5c4);
  color: #fff;
  transform: translateY(-3px);
  box-shadow: 0 10px 25px rgba(14, 207, 224, 0.3);
}

.btn-buy-now-modern {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: #fff;
  box-shadow: 0 8px 20px rgba(245, 87, 108, 0.3);
}

.btn-buy-now-modern:hover {
  background: linear-gradient(135deg, #f5576c 0%, #f093fb 100%);
  transform: translateY(-3px);
  box-shadow: 0 12px 30px rgba(245, 87, 108, 0.4);
}

.btn-add-cart-modern i,
.btn-buy-now-modern i {
  font-size: 20px;
}

/* Product Guarantees - Modern Cards */
.product-guarantees {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
  margin-top: 30px;
}

.guarantee-card {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 18px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 15px;
  border: 2px solid transparent;
  transition: all 0.3s;
}

.guarantee-card:hover {
  border-color: #0ecfe0;
  background: #fff;
  box-shadow: 0 8px 20px rgba(14, 207, 224, 0.15);
  transform: translateY(-4px);
}

.guarantee-icon {
  width: 50px;
  height: 50px;
  background: linear-gradient(135deg, #0ecfe0, #0bb5c4);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(14, 207, 224, 0.3);
}

.guarantee-icon i {
  color: #fff;
  font-size: 22px;
}

.guarantee-text {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.guarantee-text strong {
  font-size: 14px;
  font-weight: 700;
  color: #2c3e50;
}

.guarantee-text span {
  font-size: 12px;
  color: #666;
  font-weight: 500;
}

/* Product Tabs */
.product-tabs {
  margin: 40px 0;
}

.tab-content {
  padding: 30px;
}

.tab-content h3 {
  font-size: 24px;
  font-weight: 700;
  color: #17181c;
  margin-bottom: 20px;
}

.description-text {
  color: #666;
  line-height: 1.8;
  font-size: 15px;
}

.ingredients-list p {
  color: #666;
  line-height: 1.8;
  font-size: 15px;
}

.no-data {
  color: #999;
  font-style: italic;
}

/* Specs Table */
.specs-table {
  width: 100%;
  border-collapse: collapse;
}

.specs-table tbody tr {
  border-bottom: 1px solid #e5e5e5;
}

.specs-table tbody tr:last-child {
  border-bottom: none;
}

.specs-table td {
  padding: 15px;
  font-size: 15px;
}

.specs-table td:first-child {
  font-weight: 600;
  color: #17181c;
  width: 30%;
}

.specs-table td:last-child {
  color: #666;
}

/* Related Products */
.related-products {
  margin-top: 50px;
}

.section-title {
  font-size: 28px;
  font-weight: 700;
  color: #17181c;
  margin-bottom: 30px;
  padding-bottom: 15px;
  border-bottom: 2px solid #0ecfe0;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.product-card {
  background: #fff;
  border: 1px solid #e5e5e5;
  border-radius: 10px;
  overflow: hidden;
  transition: all 0.3s;
}

.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  border-color: #0ecfe0;
}

.product-link {
  text-decoration: none;
  display: block;
}

.product-card .product-image {
  background: #f8f9fa;
  padding: 20px;
  text-align: center;
}

.product-card .product-image img {
  width: 100%;
  height: 200px;
  object-fit: contain;
}

.product-card .product-info {
  padding: 15px;
}

.product-card h4 {
  font-size: 15px;
  font-weight: 600;
  color: #17181c;
  margin-bottom: 10px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  line-clamp: 2;
  overflow: hidden;
  line-height: 1.4;
}

.product-card .product-price .price {
  font-size: 18px;
  font-weight: 700;
  color: #0ecfe0;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 80px 20px;
  background: #fff;
  border-radius: 10px;
}

.empty-state i {
  font-size: 80px;
  color: #ddd;
  margin-bottom: 20px;
}

.empty-state p {
  font-size: 18px;
  color: #666;
  margin-bottom: 30px;
}

.btn-back {
  background: #0ecfe0;
  color: #fff;
  border: none;
  padding: 12px 30px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-back:hover {
  background: #0bb5c4;
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(14, 207, 224, 0.3);
}

.notes-content .alert-box {
  background: #fff3cd;
  border-left: 4px solid #ffc107;
  padding: 20px;
  border-radius: 8px;
  display: flex;
  gap: 15px;
  align-items: flex-start;
}

.notes-content .alert-box i {
  color: #ffc107;
  font-size: 24px;
  flex-shrink: 0;
  margin-top: 2px;
}

.notes-content .alert-box p {
  margin: 0;
  color: #856404;
  line-height: 1.8;
}

.stock-badge {
  background: linear-gradient(135deg, #28a745, #20c997);
  color: #fff;
  padding: 4px 12px;
  border-radius: 15px;
  font-weight: 600;
  font-size: 14px;
}

/* Responsive */
@media (max-width: 991px) {
  .row {
    flex-direction: column;
  }

  .col-lg-5,
  .col-lg-7 {
    flex: 0 0 100%;
  }

  .product-content {
    padding-left: 0;
  }

  .products-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .product-meta {
    flex-direction: column;
    gap: 15px;
  }
}

@media (max-width: 767px) {
  .product-title {
    font-size: 24px;
  }

  .current-price {
    font-size: 28px;
  }

  .action-buttons {
    flex-direction: column;
  }

  .products-grid {
    grid-template-columns: 1fr;
  }

  .main-image img {
    height: 300px;
  }
}
</style>
