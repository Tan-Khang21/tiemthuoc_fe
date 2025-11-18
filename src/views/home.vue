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

      <!-- search-product -->
      <div class="search-product">
        <div class="container">
          <div class="col-lg-12 col-xl-9">
            <div class="search-form">
              <h5>Tìm kiếm sản phẩm</h5>
              <form @submit.prevent="searchProducts">
                <div class="row">
                  <div class="col-md-6 col-lg-3">
                    <div class="form-group">
                      <select v-model="searchForm.category" class="select" name="category">
                        <option value="">Tất cả danh mục</option>
                        <option v-for="cat in categories" :key="cat.maLoaiThuoc" :value="cat.maLoaiThuoc">
                          {{ cat.tenLoaiThuoc }}
                        </option>
                      </select>
                    </div>
                  </div>
                  <div class="col-md-6 col-lg-6">
                    <div class="form-group">
                      <input type="text" v-model="searchForm.keyword" class="form-control" placeholder="Nhập từ khóa...">
                    </div>
                  </div>
                  <div class="col-md-12 col-lg-3">
                    <button type="submit" class="theme-btn"><span class="far fa-search"></span>Tìm kiếm</button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      <!-- search-product end -->

      <!-- category area -->
      <div class="category-area pt-80 pb-100">
        <div class="container">
          <div class="row">
            <div class="col-12 wow fadeInDown" data-wow-delay=".25s">
              <div class="site-heading-inline">
                <h2 class="site-title">Danh mục hàng đầu</h2>
                <router-link to="/user/thuoc">Xem thêm <i class="fas fa-angle-double-right"></i></router-link>
              </div>
            </div>
          </div>
          <div class="row g-4 mt-3">
            <div 
              v-for="category in categories.slice(0, 8)" 
              :key="category.maLoaiThuoc"
              class="col-6 col-md-4 col-lg-3"
            >
              <div class="category-item">
                <router-link :to="`/user/thuoc?category=${category.maLoaiThuoc}`">
                  <div class="category-info">
                    <div class="icon">
                      <i class="far fa-pills"></i>
                    </div>
                    <div class="content">
                      <h4>{{ category.tenLoaiThuoc }}</h4>
                      <p>{{ category.soLuongThuoc || 0 }} sản phẩm</p>
                    </div>
                  </div>
                </router-link>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- category area end -->

      <!-- small banner -->
      <div class="small-banner pb-100">
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
                <router-link to="/user/thuoc">Xem thêm <i class="fas fa-angle-double-right"></i></router-link>
              </div>
            </div>
          </div>
          <div class="row g-4 mt-3">
            <div 
              v-for="product in trendingProducts.slice(0, 8)" 
              :key="product.maThuoc"
              class="col-6 col-md-4 col-lg-3"
            >
              <div class="product-item">
                <div class="product-img">
                  <router-link :to="`/user/thuoc/${product.maThuoc}`">
                    <img :src="getProductImage(product)" :alt="product.tenThuoc">
                  </router-link>
                  <div class="product-action-wrap">
                    <div class="product-action">
                      <a href="#" @click.prevent="quickView(product)" data-tooltip="tooltip" title="Xem nhanh">
                        <i class="far fa-eye"></i>
                      </a>
                      <a href="#" @click.prevent="addToCart(product)" data-tooltip="tooltip" title="Thêm vào giỏ">
                        <i class="far fa-shopping-bag"></i>
                      </a>
                    </div>
                  </div>
                </div>
                <div class="product-content">
                  <h3 class="product-title">
                    <router-link :to="`/user/thuoc/${product.maThuoc}`">
                      {{ product.tenThuoc }}
                    </router-link>
                  </h3>
                  <div class="product-rate">
                    <i class="fas fa-star"></i>
                    <i class="fas fa-star"></i>
                    <i class="fas fa-star"></i>
                    <i class="fas fa-star"></i>
                    <i class="far fa-star"></i>
                  </div>
                  <div class="product-bottom">
                    <div class="product-price">
                      <span>{{ formatPrice(product.donGiaSi) }}</span>
                    </div>
                    <button type="button" class="product-cart-btn" @click="addToCart(product)" data-bs-placement="left" data-tooltip="tooltip" title="Thêm vào giỏ">
                      <i class="far fa-shopping-bag"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- trending item end -->

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

      <!-- newsletter area -->
      <div class="newsletter-area pb-100">
        <div class="container wow fadeInUp" data-wow-delay=".25s">
          <div class="newsletter-wrap">
            <div class="row">
              <div class="col-lg-6 mx-auto">
                <div class="newsletter-content">
                  <h3>Nhận <span>20%</span> giảm giá</h3>
                  <p>Khi đăng ký nhận tin từ chúng tôi</p>
                  <div class="subscribe-form">
                    <form @submit.prevent="subscribe">
                      <input 
                        type="email" 
                        v-model="emailSubscribe" 
                        class="form-control" 
                        placeholder="Địa chỉ email của bạn"
                        required
                      >
                      <button class="theme-btn" type="submit">
                        Đăng ký <i class="far fa-paper-plane"></i>
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- newsletter area end -->
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import api from '@/api'

const router = useRouter()

// Data
const categories = ref([])
const trendingProducts = ref([])
const searchForm = ref({
  category: '',
  keyword: ''
})
const emailSubscribe = ref('')

// Methods
const loadCategories = async () => {
  try {
    const response = await api.thuoc.getTopLoaiThuoc()
    categories.value = response.data || []
  } catch (error) {
    console.error('Lỗi tải danh mục:', error)
  }
}

const loadTrendingProducts = async () => {
  try {
    const response = await api.thuoc.getAll()
    trendingProducts.value = response.data || []
  } catch (error) {
    console.error('Lỗi tải sản phẩm:', error)
  }
}

const getProductImage = (product) => {
  const urlAnh = product.urlAnh || product.UrlAnh || 'default.png'
  if (urlAnh.startsWith('http://') || urlAnh.startsWith('https://') || urlAnh.startsWith('/')) {
    return urlAnh
  }
  return 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=300&h=300&fit=crop'
}

const formatPrice = (price) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(price || 0)
}

const searchProducts = () => {
  const query = {}
  if (searchForm.value.category) {
    query.category = searchForm.value.category
  }
  if (searchForm.value.keyword) {
    query.search = searchForm.value.keyword
  }
  router.push({ path: '/user/thuoc', query })
}

const quickView = (product) => {
  router.push(`/user/thuoc/${product.maThuoc}`)
}

const addToCart = (product) => {
  ElMessage.success('Đã thêm vào giỏ hàng!')
}

const subscribe = () => {
  if (emailSubscribe.value) {
    ElMessage.success('Đăng ký thành công!')
    emailSubscribe.value = ''
  }
}

// Lifecycle
onMounted(() => {
  loadCategories()
  loadTrendingProducts()
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
  top: 15px;
  right: 15px;
  opacity: 0;
  transform: translateX(20px);
  transition: all 0.3s;
}

.product-item:hover .product-action-wrap {
  opacity: 1;
  transform: translateX(0);
}

.product-action {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.product-action a {
  width: 40px;
  height: 40px;
  background: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #17181c;
  text-decoration: none;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  transition: all 0.3s;
}

.product-action a:hover {
  background: #0ecfe0;
  color: #fff;
}

.product-content {
  padding: 20px;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.product-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 10px;
  flex-grow: 1;
}

.product-title a {
  color: #17181c;
  text-decoration: none;
  transition: color 0.3s;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.product-title a:hover {
  color: #0ecfe0;
}

.product-rate {
  margin-bottom: 10px;
}

.product-rate i {
  color: #ffc107;
  font-size: 14px;
}

.product-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 15px;
  border-top: 1px solid #f0f0f0;
}

.product-price {
  font-size: 20px;
  font-weight: 700;
  color: #0ecfe0;
}

.product-cart-btn {
  width: 40px;
  height: 40px;
  background: #0ecfe0;
  color: #fff;
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
}

.product-cart-btn:hover {
  background: #0bb5c4;
  transform: scale(1.1);
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
}
</style>
