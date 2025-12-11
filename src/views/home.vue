<template>
  <div class="home-2">
    <main class="main">
      <!-- hero section -->
      <div class="hero-section hs-1">
        <div class="hero-single" style="background-image: url('/src/assets/img/hero/bg.png');">
          <div class="container position-relative">
            <div class="row align-items-center">
              <div class="col-lg-6">
                <div class="hero-content">
                  <h6 class="hero-sub-title" data-animation="fadeInUp" data-delay=".25s">Easy Health Care</h6>
                  <h1 class="hero-title" data-animation="fadeInRight" data-delay=".50s">
                    Cung Cấp Thuốc Và <span>Chăm Sóc Sức Khỏe</span> Tốt Nhất Cho Gia Đình Bạn
                  </h1>
                  <p data-animation="fadeInLeft" data-delay=".75s">
                    Chúng tôi cam kết mang đến các sản phẩm dược phẩm chất lượng cao với đội ngũ chuyên nghiệp và tư vấn tận tình.
                  </p>
                  <div class="hero-btn" data-animation="fadeInUp" data-delay="1s">
                    <router-link to="/user/thuoc" class="theme-btn">Mua sắp ngay<i class="fas fa-arrow-right"></i></router-link>
                    <a href="#" class="theme-btn theme-btn2">Tìm hiểu thêm<i class="fas fa-arrow-right"></i></a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- hero section end -->

      <!-- small banner -->
      <div class="small-banner pt-80 pb-100">
        <div class="container wow fadeInUp" data-wow-delay=".25s">
          <div class="row g-4">
            <div class="col-12 col-md-6 col-lg-4">
              <div class="banner-item">
                <img src="https://images.unsplash.com/photo-1585435557343-3b092031a831?w=400&h=250&fit=crop" alt="">
                <div class="banner-content">
                  <p>Nước rửa tay</p>
                  <h3>Bộ sưu tập <br> Nước rửa tay</h3>
                  <a href="#">Mua ngay</a>
                </div>
              </div>
            </div>
            <div class="col-12 col-md-6 col-lg-4">
              <div class="banner-item">
                <img src="https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400&h=250&fit=crop" alt="">
                <div class="banner-content">
                  <p>Giảm giá</p>
                  <h3>Sữa rửa mặt <br> Khuyến mãi</h3>
                  <a href="#">Khám phá ngay</a>
                </div>
              </div>
            </div>
            <div class="col-12 col-md-6 col-lg-4">
              <div class="banner-item">
                <img src="https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=400&h=250&fit=crop" alt="">
                <div class="banner-content">
                  <p>Mặt nạ</p>
                  <h3>Mặt nạ giảm giá <br> Lên đến <span>50%</span></h3>
                  <a href="#">Khám phá ngay</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- small banner end -->

      <!-- trending item -->
      <div class="product-area pb-100" v-if="trendingProducts.length > 0">
        <div class="container">
          <div class="row">
            <div class="col-12 wow fadeInDown" data-wow-delay=".25s">
              <div class="site-heading-inline">
                <h2 class="site-title">Sản phẩm nổi bật</h2>
                <div class="slider-nav-buttons">
                  <button class="slider-nav-btn" @click="slideTrending(-1)" :disabled="trendingIndex === 0">
                    <i class="fas fa-chevron-left"></i>
                  </button>
                  <button class="slider-nav-btn" @click="slideTrending(1)" :disabled="trendingIndex >= trendingProducts.length - 4">
                    <i class="fas fa-chevron-right"></i>
                  </button>
                  <router-link to="/user/thuoc" class="view-all-link">Xem thêm <i class="fas fa-angle-double-right"></i></router-link>
                </div>
              </div>
            </div>
          </div>
          <div class="product-slider-container">
            <div class="product-slider" :style="{ transform: `translateX(-${trendingIndex * 25}%)` }">
              <div 
                v-for="product in trendingProducts" 
                :key="product?.maThuoc || Math.random()"
                class="product-slide"
              >
                <div class="product-item" v-if="product">
                  <div class="product-img-wrapper">
                    <router-link :to="`/user/thuoc/${product.maThuoc}`" class="product-img-link">
                      <img :src="getProductImage(product)" :alt="product.tenThuoc" class="product-img">
                    </router-link>
                    <div class="product-badges">
                      <span class="badge badge-hot">HOT</span>
                    </div>
                    <div class="product-overlay">
                      <button class="quick-action-btn" @click.prevent="quickView(product)" title="Xem nhanh">
                        <i class="far fa-eye"></i>
                      </button>
                      <button class="quick-action-btn" @click.prevent="addToCart(product)" title="Thêm vào giỏ">
                        <i class="far fa-shopping-cart"></i>
                      </button>
                    </div>
                  </div>
                  <div class="product-info">
                    <h3 class="product-name">
                      <router-link :to="`/user/thuoc/${product.maThuoc}`">
                        {{ product.tenThuoc }}
                      </router-link>
                    </h3>
                    <div class="product-rating">
                      <div class="stars" v-if="getProductRating(product).count > 0">
                        <i v-for="n in renderStars(getProductRating(product).average).full" :key="'full-' + n" class="fas fa-star"></i>
                        <i v-if="renderStars(getProductRating(product).average).half" class="fas fa-star-half-alt"></i>
                        <i v-for="n in renderStars(getProductRating(product).average).empty" :key="'empty-' + n" class="far fa-star"></i>
                      </div>
                      <div class="stars" v-else>
                        <i v-for="n in 5" :key="'empty-' + n" class="far fa-star"></i>
                      </div>
                      <span class="rating-count" v-if="getProductRating(product).count > 0">
                        ({{ getProductRating(product).average.toFixed(1) }})
                      </span>
                      <span class="rating-count" v-else>(Chưa có đánh giá)</span>
                    </div>
                    
                    <div class="product-price-box" v-if="product.giaThuocs && product.giaThuocs.length > 0">
                      <div class="price-row">
                        <div class="price-info">
                          <span class="unit-label">{{ product.giaThuocs[0].tenLoaiDonVi }}</span>
                          <span class="price-tag">{{ formatPriceShort(product.giaThuocs[0].donGia) }}</span>
                        </div>
                        <button class="add-cart-btn" @click="addToCart(product)">
                          <i class="fas fa-plus"></i>
                        </button>
                      </div>
                      <div class="stock-info">
                        <i class="fas fa-box-open"></i>
                        <span>Còn {{ product.giaThuocs[0].soLuongCon }} sản phẩm</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- trending item end -->


      
      <!-- inventory products -->
      <div class="product-area pb-100" v-if="inventoryProducts.length > 0">
        <div class="container">
          <div class="row">
            <div class="col-12 wow fadeInDown" data-wow-delay=".25s">
              <div class="site-heading-inline">
                <h2 class="site-title">Sản phẩm</h2>
                <router-link to="/user/thuoc">Xem thêm <i class="fas fa-angle-double-right"></i></router-link>
              </div>
            </div>
          </div>
          <div class="row g-4 mt-3">
            <div 
              v-for="product in inventoryProducts.slice(0, 8)" 
              :key="product?.maThuoc || Math.random()"
              class="col-6 col-md-4 col-lg-3"
            >
              <div class="product-item" v-if="product">
                <div class="product-img-wrapper">
                  <router-link :to="`/user/thuoc/${product.maThuoc}`" class="product-img-link">
                    <img :src="getProductImage(product)" :alt="product.tenThuoc" class="product-img">
                  </router-link>
                  <div class="product-badges">
                    <span class="badge badge-stock">Còn Hàng</span>
                  </div>
                  <div class="product-overlay">
                    <button class="quick-action-btn" @click.prevent="quickView(product)" title="Xem nhanh">
                      <i class="far fa-eye"></i>
                    </button>
                    <button class="quick-action-btn" @click.prevent="addToCart(product)" title="Thêm vào giỏ">
                      <i class="far fa-shopping-cart"></i>
                    </button>
                  </div>
                </div>
                <div class="product-info">
                  <h3 class="product-name">
                    <router-link :to="`/user/thuoc/${product.maThuoc}`">
                      {{ product.tenThuoc }}
                    </router-link>
                  </h3>
                  <div class="product-rating">
                    <div class="stars" v-if="getProductRating(product).count > 0">
                      <i v-for="n in renderStars(getProductRating(product).average).full" :key="'full-' + n" class="fas fa-star"></i>
                      <i v-if="renderStars(getProductRating(product).average).half" class="fas fa-star-half-alt"></i>
                      <i v-for="n in renderStars(getProductRating(product).average).empty" :key="'empty-' + n" class="far fa-star"></i>
                    </div>
                    <div class="stars" v-else>
                      <i v-for="n in 5" :key="'empty-' + n" class="far fa-star"></i>
                    </div>
                    <span class="rating-count" v-if="getProductRating(product).count > 0">
                      ({{ getProductRating(product).average.toFixed(1) }})
                    </span>
                    <span class="rating-count" v-else>(Chưa có đánh giá)</span>
                  </div>
                  
                  <div class="product-price-box" v-if="product.giaThuocs && product.giaThuocs.length > 0">
                    <div class="price-row">
                      <div class="price-info">
                        <span class="unit-label">{{ product.giaThuocs[0].tenLoaiDonVi }}</span>
                        <span class="price-tag">{{ formatPriceShort(product.giaThuocs[0].donGia) }}</span>
                      </div>
                      <button class="add-cart-btn" @click="addToCart(product)">
                        <i class="fas fa-plus"></i>
                      </button>
                    </div>
                    <div class="stock-info">
                      <i class="fas fa-box-open"></i>
                      <span>Còn {{ product.giaThuocs[0].soLuongCon }} sản phẩm</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- inventory products end -->

      <!-- feature area -->
      <div class="feature-area pb-100">
        <div class="container wow fadeInUp" data-wow-delay=".25s">
          <div class="feature-wrap">
            <div class="row g-0">
              <div class="col-12 col-md-6 col-lg-3">
                <div class="feature-item">
                  <div class="feature-icon">
                    <i class="fal fa-truck"></i>
                  </div>
                  <div class="feature-content">
                    <h4>Giao hàng miễn phí</h4>
                    <p>Đơn hàng trên 500.000đ</p>
                  </div>
                </div>
              </div>
              <div class="col-12 col-md-6 col-lg-3">
                <div class="feature-item">
                  <div class="feature-icon">
                    <i class="fal fa-sync"></i>
                  </div>
                  <div class="feature-content">
                    <h4>Đổi trả dễ dàng</h4>
                    <p>Trong vòng 30 ngày</p>
                  </div>
                </div>
              </div>
              <div class="col-12 col-md-6 col-lg-3">
                <div class="feature-item">
                  <div class="feature-icon">
                    <i class="fal fa-wallet"></i>
                  </div>
                  <div class="feature-content">
                    <h4>Thanh toán an toàn</h4>
                    <p>100% bảo mật</p>
                  </div>
                </div>
              </div>
              <div class="col-12 col-md-6 col-lg-3">
                <div class="feature-item">
                  <div class="feature-icon">
                    <i class="fal fa-headset"></i>
                  </div>
                  <div class="feature-content">
                    <h4>Hỗ trợ 24/7</h4>
                    <p>Luôn sẵn sàng tư vấn</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- feature area end -->
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import api from '@/api'
import http from '@/api/axios'
import { useCartStore } from '@/store'

const router = useRouter()
const cartStore = useCartStore()

// Data
const categories = ref([])
const trendingProducts = ref([])
const inventoryProducts = ref([])
const trendingIndex = ref(0)
const searchForm = ref({
  category: '',
  keyword: ''
})
const emailSubscribe = ref('')

// Methods
const slideTrending = (direction) => {
  const maxIndex = Math.max(0, trendingProducts.value.length - 4)
  trendingIndex.value = Math.min(Math.max(0, trendingIndex.value + direction), maxIndex)
}

const loadCategories = async () => {
  try {
    const response = await http.get('/Thuoc/TopLoaiThuoc')
    const result = response.data || response
    console.log('Categories API response:', result)
    
    if (result.status === 1 && result.data) {
      categories.value = result.data.filter(cat => cat && cat.maLoaiThuoc)
    } else {
      categories.value = []
    }
    console.log('Categories loaded:', categories.value.length)
  } catch (error) {
    console.error('Lỗi tải danh mục:', error)
    categories.value = []
  }
}

// Lấy đánh giá từ dữ liệu sản phẩm (đã có sẵn từ API ListThuocTonKho)
const getProductRating = (product) => {
  if (!product) return { average: 0, count: 0 }
  return {
    average: product.soSaoTrungBinh || 0,
    count: product.soLuongDanhGia || 0
  }
}

const renderStars = (rating) => {
  const fullStars = Math.floor(rating)
  const hasHalfStar = rating % 1 >= 0.5
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0)
  
  return {
    full: fullStars,
    half: hasHalfStar ? 1 : 0,
    empty: emptyStars
  }
}

const loadTrendingProducts = async () => {
  try {
    // Gọi API TopSelling để lấy sản phẩm bán chạy nhất
    const response = await http.get('/Thuoc/TopSelling?top=10')
    const result = response.data || response
    
    let products = []
    if (result.status === 1 && result.data) {
      products = result.data.filter(p => p && p.maThuoc)
    } else if (result.data) {
      products = result.data.filter(p => p && p.maThuoc)
    }
    
    // Lọc sản phẩm có đơn vị khả dụng (có giá > 0 và còn hàng)
    trendingProducts.value = products.filter(product => {
      if (!product.giaThuocs || product.giaThuocs.length === 0) return false
      const availableUnits = product.giaThuocs.filter(
        unit => unit.soLuongCon > 0 && unit.trangThai === true && unit.donGia > 0
      )
      if (availableUnits.length > 0) {
        product.giaThuocs = availableUnits
        return true
      }
      return false
    })
    
    console.log('Trending products loaded:', trendingProducts.value.length)
  } catch (error) {
    console.error('Lỗi tải sản phẩm:', error)
    trendingProducts.value = []
  }
}

const loadInventoryProducts = async () => {
  try {
    const response = await http.get('/Thuoc/ListThuocTonKho')
    const result = response.data || response
    console.log('Inventory products response:', result)
    
    let products = []
    if (result.status === 1 && result.data) {
      products = result.data.filter(p => p && p.maThuoc)
    } else if (result.data) {
      products = result.data.filter(p => p && p.maThuoc)
    }
    
    // Lọc sản phẩm: chỉ giữ những sản phẩm có ít nhất 1 đơn vị với soLuongCon > 0 và trangThai === true
    inventoryProducts.value = products.filter(product => {
      if (!product.giaThuocs || product.giaThuocs.length === 0) {
        return false
      }
      
      // Lọc các đơn vị khả dụng
      const availableUnits = product.giaThuocs.filter(
        unit => unit.soLuongCon > 0 && unit.trangThai === true
      )
      
      // Chỉ giữ sản phẩm có ít nhất 1 đơn vị khả dụng
      if (availableUnits.length > 0) {
        // Cập nhật giaThuocs chỉ với các đơn vị khả dụng
        product.giaThuocs = availableUnits
        return true
      }
      return false
    })
    
    console.log('Filtered inventory products:', inventoryProducts.value.length)
  } catch (error) {
    console.error('Lỗi tải sản phẩm:', error)
    inventoryProducts.value = []
  }
}

const getProductImage = (product) => {
  const urlAnh = product.urlAnh || product.UrlAnh || 'default.png'
  if (urlAnh.startsWith('http://') || urlAnh.startsWith('https://') || urlAnh.startsWith('/')) {
    return urlAnh
  }
  return 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=300&h=300&fit=crop'
}

const getProductPrice = (product) => {
  if (product.giaThuocs && product.giaThuocs.length > 0) {
    return product.giaThuocs[0].donGia
  }
  return product.donGiaSi || 0
}

const getProductUnit = (product) => {
  if (product.giaThuocs && product.giaThuocs.length > 0) {
    return product.giaThuocs[0].tenLoaiDonVi
  }
  return ''
}

const formatPrice = (price) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(price || 0)
}

const formatPriceShort = (price) => {
  if (!price || price === 0) return '0 đ'
  return new Intl.NumberFormat('vi-VN').format(price) + ' đ'
}

const searchProducts = () => {
  const query = {}
  if (searchForm.value.category) {
    query.category = searchForm.value.category
  }
  if (searchForm.value.keyword) {
    query.keyword = searchForm.value.keyword
  }
  router.push({ path: '/user/thuoc', query })
}

const quickView = (product) => {
  router.push(`/user/thuoc/${product.maThuoc}`)
}

const addToCart = (product) => {
  // Lấy đơn vị đầu tiên từ giaThuocs
  const firstUnit = product.giaThuocs && product.giaThuocs.length > 0 ? product.giaThuocs[0] : null;
  
  if (!firstUnit) {
    ElMessage.error('Sản phẩm không có thông tin đơn vị');
    return;
  }

  cartStore.addToCart({
    maThuoc: product.maThuoc,
    tenThuoc: product.tenThuoc,
    donGia: firstUnit.donGia,
    donVi: firstUnit.maLoaiDonVi,  // Sử dụng maLoaiDonVi từ giaThuocs
    tenDonVi: firstUnit.tenLoaiDonVi,
    urlAnh: product.urlAnh,
    soLuong: 1,
  });
  ElMessage.success('Đã thêm vào giỏ hàng!');
};

const subscribe = () => {
  if (emailSubscribe.value) {
    ElMessage.success('Đăng ký thành công!')
    emailSubscribe.value = ''
  }
}

// Lifecycle
onMounted(() => {
  console.log('Home page mounted')
  loadCategories()
  loadTrendingProducts()
  loadInventoryProducts()
})

const route = useRoute()
watch(() => route.path, (newPath) => {
  if (newPath === '/' || newPath === '/home') {
    console.log('Reloading home page data')
    loadCategories()
    loadTrendingProducts()
    loadInventoryProducts()
  }
})
</script>

<style scoped>
/* CSS bổ sung cho home page */
.home-2 {
  background: #fff;
}

.main {
  overflow-x: hidden;
}

/* Hero Section */
.hero-section {
  position: relative;
  overflow: hidden;
}

.hero-single {
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  padding: 120px 0 80px;
  position: relative;
}

.hero-single::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(14, 207, 224, 0.1), rgba(247, 99, 49, 0.1));
}

.hero-content {
  position: relative;
  z-index: 2;
}

.hero-sub-title {
  font-size: 16px;
  color: #0ecfe0;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 15px;
  display: inline-block;
  padding: 8px 20px;
  background: #fff;
  border-radius: 50px;
  clip-path: polygon(100% 0, 95% 50%, 100% 100%, 0% 100%, 5% 50%, 0% 0%);
}

.hero-title {
  font-size: 48px;
  font-weight: 700;
  line-height: 1.2;
  margin-bottom: 20px;
  color: #17181c;
}

.hero-title span {
  color: #0ecfe0;
}

.hero-content p {
  font-size: 16px;
  color: #666;
  margin-bottom: 30px;
  line-height: 1.8;
}

.hero-btn {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
}

.theme-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 14px 30px;
  background: #0ecfe0;
  color: #fff;
  border-radius: 50px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.3s;
  border: 2px solid #0ecfe0;
}

.theme-btn:hover {
  background: #0bb5c4;
  transform: translateY(-2px);
  box-shadow: 0 10px 30px rgba(14, 207, 224, 0.3);
}

.theme-btn2 {
  background: transparent;
  color: #0ecfe0;
}

.theme-btn2:hover {
  background: #0ecfe0;
  color: #fff;
}

.hero-right {
  position: relative;
}

.hero-img {
  position: relative;
  text-align: center;
  animation: float 3s ease-in-out infinite;
  transform: scale(20);
  margin: 100px 200px;
}

.hero-img img {
  max-width: 100%;
  height: auto;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-20px);
  }
}

.hero-img-info {
  position: absolute;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  background: #fff;
  padding: 50px 80px;
  border-radius: 30px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
  display: flex;
  align-items: center;
  gap: 40px;
  min-width: 600px;
}

.hero-img-info .icon {
  width: 140px;
  height: 140px;
  background: linear-gradient(135deg, #0ecfe0, #f76331);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 72px;
  color: #fff;
  flex-shrink: 0;
}

.hero-img-info .icon img {
  width: 80px;
  height: 80px;
}

.hero-img-info h6 {
  margin: 0;
  font-size: 42px;
  font-weight: 700;
  color: #17181c;
  line-height: 1.4;
}

/* Search Product */
.search-product {
  margin-top: -50px;
  position: relative;
  z-index: 3;
  margin-bottom: 50px;
}

.search-form {
  background: #fff;
  padding: 30px;
  border-radius: 10px;
  box-shadow: 0 10px 50px rgba(0, 0, 0, 0.1);
}

.search-form h5 {
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 20px;
  color: #17181c;
}

.search-form .form-group {
  margin-bottom: 0;
}

.search-form .select,
.search-form .form-control {
  height: 50px;
  border: 1px solid #e5e5e5;
  border-radius: 10px;
  padding: 0 20px;
  font-size: 14px;
  width: 100%;
}

.search-form .select:focus,
.search-form .form-control:focus {
  border-color: #0ecfe0;
  outline: none;
  box-shadow: 0 0 0 3px rgba(14, 207, 224, 0.1);
}

.search-form .theme-btn {
  width: 100%;
  justify-content: center;
  height: 50px;
}

/* Category Area */
.category-area {
  padding-top: 80px;
  padding-bottom: 100px;
}

.site-heading-inline {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 30px;
}

.site-title {
  font-size: 32px;
  font-weight: 700;
  color: #17181c;
  margin: 0;
}

.site-heading-inline a {
  color: #0ecfe0;
  font-weight: 600;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 5px;
  transition: all 0.3s;
}

.site-heading-inline a:hover {
  gap: 10px;
}

.category-item {
  background: #fff;
  border-radius: 10px;
  padding: 25px;
  text-align: center;
  transition: all 0.3s;
  border: 1px solid #f0f0f0;
  height: 100%;
}

.category-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.1);
  border-color: #0ecfe0;
}

.category-info {
  text-align: center;
}

.category-info .icon {
  width: 80px;
  height: 80px;
  margin: 0 auto 20px;
  background: linear-gradient(135deg, #0ecfe0, #f76331);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36px;
  color: #fff;
}

.category-info .content h4 {
  font-size: 18px;
  font-weight: 700;
  color: #17181c;
  margin-bottom: 5px;
}

.category-info .content p {
  font-size: 14px;
  color: #666;
  margin: 0;
}

.category-item a {
  text-decoration: none;
  display: block;
}

/* Small Banner */
.small-banner {
  padding-bottom: 100px;
}

.banner-item {
  position: relative;
  border-radius: 10px;
  overflow: hidden;
  height: 250px;
}

.banner-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s;
}

.banner-item:hover img {
  transform: scale(1.1);
}

.banner-content {
  position: absolute;
  top: 50%;
  left: 30px;
  transform: translateY(-50%);
  z-index: 2;
}

.banner-content p {
  font-size: 14px;
  color: #666;
  margin-bottom: 5px;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.banner-content h3 {
  font-size: 24px;
  font-weight: 700;
  color: #17181c;
  margin-bottom: 15px;
  line-height: 1.3;
}

.banner-content h3 span {
  color: #f76331;
}

.banner-content a {
  color: #0ecfe0;
  font-weight: 600;
  text-decoration: none;
  font-size: 14px;
  border-bottom: 2px solid #0ecfe0;
  transition: all 0.3s;
}

.banner-content a:hover {
  color: #f76331;
  border-color: #f76331;
}

/* Product Area */
.product-area {
  padding-bottom: 100px;
}

.product-item {
  background: #fff;
  border-radius: 10px;
  overflow: hidden;
  transition: all 0.3s;
  border: 1px solid #f0f0f0;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.product-item:hover {
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.1);
  transform: translateY(-5px);
}

.product-img {
  position: relative;
  overflow: hidden;
  background: #f8f9fa;
  padding: 20px;
  text-align: center;
}

.product-badge {
  position: absolute;
  top: 10px;
  left: 10px;
  background: linear-gradient(135deg, #0ecfe0, #17a2b8);
  color: #fff;
  padding: 5px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  z-index: 2;
  box-shadow: 0 2px 8px rgba(14, 207, 224, 0.3);
}

.product-img img {
  width: 100%;
  height: 200px;
  object-fit: contain;
  transition: transform 0.5s;
}

.product-item:hover .product-img img {
  transform: scale(1.1);
}

.product-action-wrap {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%) translateY(20px);
  opacity: 0;
  transition: all 0.3s ease;
  z-index: 3;
}

.product-item:hover .product-action-wrap {
  opacity: 1;
  transform: translateX(-50%) translateY(0);
}

.product-action {
  display: flex;
  flex-direction: row;
  gap: 10px;
  justify-content: center;
  align-items: center;
}

.product-action a {
  width: 45px;
  height: 45px;
  background: #f8f9fa;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #17181c;
  text-decoration: none;
  transition: all 0.3s;
  font-size: 16px;
}

.product-action a:hover {
  background: #0ecfe0;
  color: #fff;
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(14, 207, 224, 0.4);
}

/* Modern Product Card Design */
.product-img-wrapper {
  position: relative;
  overflow: hidden;
  border-radius: 12px;
  background: #f8f9fa;
  aspect-ratio: 1/1;
}

.product-img-link {
  display: block;
  height: 100%;
}

.product-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.product-item:hover .product-img {
  transform: scale(1.08);
}

/* Product Badges */
.product-badges {
  position: absolute;
  top: 12px;
  left: 12px;
  z-index: 2;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.badge {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.badge-hot {
  background: linear-gradient(135deg, #ff6b6b, #ee5a6f);
  color: #fff;
}

.badge-stock {
  background: linear-gradient(135deg, #4ecdc4, #44a08d);
  color: #fff;
}

/* Product Overlay */
.product-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(180deg, transparent 0%, rgba(0, 0, 0, 0.7) 100%);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  gap: 10px;
  padding: 20px;
  opacity: 0;
  transition: opacity 0.3s;
  pointer-events: none;
}

.product-item:hover .product-overlay {
  opacity: 1;
}

.quick-action-btn {
  pointer-events: auto;
}

.quick-action-btn {
  width: 44px;
  height: 44px;
  background: #fff;
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.quick-action-btn:hover {
  background: #0ecfe0;
  color: #fff;
  transform: translateY(-3px);
}

.quick-action-btn i {
  font-size: 18px;
}

/* Product Info */
.product-info {
  padding: 16px 0 0;
}

.product-name {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 8px;
  min-height: 40px;
  line-height: 1.4;
}

.product-name a {
  color: #2c3e50;
  text-decoration: none;
  transition: color 0.3s;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  line-clamp: 2;
  overflow: hidden;
}

.product-name a:hover {
  color: #0ecfe0;
}

/* Product Rating */
.product-rating {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 12px;
}

.stars {
  display: flex;
  gap: 2px;
}

.stars i {
  color: #ffc107;
  font-size: 12px;
}

.rating-count {
  font-size: 12px;
  color: #7f8c8d;
  font-weight: 500;
}

/* Product Price Box */
.product-price-box {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 10px;
  padding: 12px;
  margin-top: auto;
}

.price-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.price-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.unit-label {
  font-size: 11px;
  color: #7f8c8d;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.price-tag {
  font-size: 18px;
  font-weight: 800;
  background: linear-gradient(135deg, #0ecfe0, #0bb5c4);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.add-cart-btn {
  width: 36px;
  height: 36px;
  background: linear-gradient(135deg, #0ecfe0, #0bb5c4);
  border: none;
  border-radius: 50%;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 4px 12px rgba(14, 207, 224, 0.3);
}

.add-cart-btn:hover {
  transform: scale(1.1) rotate(90deg);
  box-shadow: 0 6px 16px rgba(14, 207, 224, 0.4);
}

.add-cart-btn i {
  font-size: 14px;
}

.stock-info {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #27ae60;
  font-weight: 600;
}

.stock-info i {
  font-size: 13px;
}

/* Feature Area */
.feature-area {
  padding-bottom: 100px;
}

.feature-wrap {
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 10px 50px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.feature-item {
  padding: 30px;
  display: flex;
  align-items: center;
  gap: 20px;
  border-right: 1px solid #f0f0f0;
  transition: all 0.3s;
}

.feature-item:last-child {
  border-right: none;
}

.feature-item:hover {
  background: #f8f9fa;
}

.feature-icon {
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #0ecfe0, #f76331);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  color: #fff;
  flex-shrink: 0;
}

.feature-content h4 {
  font-size: 18px;
  font-weight: 700;
  color: #17181c;
  margin-bottom: 5px;
}

.feature-content p {
  font-size: 14px;
  color: #666;
  margin: 0;
}

/* Newsletter Area */
.newsletter-area {
  padding-bottom: 100px;
}

.newsletter-wrap {
  background: linear-gradient(135deg, #0ecfe0, #f76331);
  border-radius: 10px;
  padding: 60px 30px;
  position: relative;
  overflow: hidden;
}

.newsletter-wrap::before {
  content: '';
  position: absolute;
  width: 300px;
  height: 300px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  top: -150px;
  right: -150px;
}

.newsletter-wrap::after {
  content: '';
  position: absolute;
  width: 200px;
  height: 200px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  bottom: -100px;
  left: -100px;
}

.newsletter-content {
  position: relative;
  z-index: 2;
  text-align: center;
}

.newsletter-content h3 {
  font-size: 36px;
  font-weight: 700;
  color: #fff;
  margin-bottom: 10px;
}

.newsletter-content h3 span {
  color: #17181c;
}

.newsletter-content p {
  font-size: 16px;
  color: #fff;
  margin-bottom: 30px;
}

.subscribe-form form {
  display: flex;
  gap: 10px;
  max-width: 500px;
  margin: 0 auto;
}

.subscribe-form .form-control {
  flex: 1;
  height: 55px;
  border: none;
  border-radius: 50px;
  padding: 0 25px;
  font-size: 14px;
}

.subscribe-form .form-control:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.3);
}

.subscribe-form .theme-btn {
  background: #17181c;
  border-color: #17181c;
  white-space: nowrap;
}

.subscribe-form .theme-btn:hover {
  background: #fff;
  color: #17181c;
}

/* Product Slider Styles */
.site-heading-inline {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 15px;
}

.slider-nav-buttons {
  display: flex;
  align-items: center;
  gap: 10px;
}

.slider-nav-btn {
  width: 40px;
  height: 40px;
  border: 2px solid #4a90a4;
  background: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  color: #4a90a4;
}

.slider-nav-btn:hover:not(:disabled) {
  background: #4a90a4;
  color: #fff;
}

.slider-nav-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.view-all-link {
  color: #4a90a4;
  font-weight: 600;
  text-decoration: none;
  margin-left: 10px;
}

.view-all-link:hover {
  text-decoration: underline;
}

.product-slider-container {
  overflow: hidden;
  margin-top: 25px;
}

.product-slider {
  display: flex;
  transition: transform 0.5s ease;
}

.product-slide {
  flex: 0 0 25%;
  padding: 0 12px;
  box-sizing: border-box;
}

/* Responsive */
@media (max-width: 991px) {
  .hero-title {
    font-size: 36px;
  }
  
  .feature-item {
    border-right: none;
    border-bottom: 1px solid #f0f0f0;
  }
  
  .feature-item:last-child {
    border-bottom: none;
  }
  
  .product-slide {
    flex: 0 0 33.333%;
  }
}

@media (max-width: 767px) {
  .hero-title {
    font-size: 28px;
  }
  
  .hero-btn {
    flex-direction: column;
  }
  
  .hero-btn .theme-btn {
    width: 100%;
    justify-content: center;
  }
  
  .site-title {
    font-size: 24px;
  }
  
  .newsletter-content h3 {
    font-size: 28px;
  }
  
  .subscribe-form form {
    flex-direction: column;
  }
  
  .subscribe-form .theme-btn {
    width: 100%;
    justify-content: center;
  }
  
  .product-slide {
    flex: 0 0 50%;
  }
  
  .slider-nav-buttons {
    width: 100%;
    justify-content: flex-end;
  }
}

@media (max-width: 480px) {
  .product-slide {
    flex: 0 0 100%;
  }
}
</style>
