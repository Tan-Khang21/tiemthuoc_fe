<template>
  <div class="user-layout">
    <!-- Seasonal Effects -->
    <SnowEffect />
    <SpringPetals />
    <SummerBubbles />
    <AutumnLeaves />
    
    <!-- Header Area -->
    <header class="header">
      <!-- Navbar -->
      <div class="main-navigation">
        <nav class="navbar navbar-expand-lg">
          <div class="container position-relative">
            <a class="navbar-brand" @click="$router.push('/user')" style="cursor: pointer;">
              <img src="@/assets/img/logo/logo-light.png" alt="logo" style="max-height: 50px;">
            </a>
            <!-- Search Box -->
            <div class="header-search-box" ref="searchBoxRef">
              <input 
                type="text" 
                v-model="searchQuery"
                @input="handleSearchInput"
                @keyup.enter="handleSearch"
                @focus="handleSearchFocus"
                placeholder="Tìm kiếm sản phẩm..."
                class="form-control"
              />
              <button @click="handleSearch" class="search-btn" type="button">
                <i class="far fa-search"></i>
              </button>
              <!-- Suggestions Dropdown -->
              <div v-show="showSuggestions && filteredProducts.length > 0" class="search-suggestions">
                <div 
                  v-for="product in filteredProducts" 
                  :key="product.maThuoc"
                  @mousedown.prevent="selectProduct(product)"
                  class="suggestion-item"
                >
                  <img 
                    v-if="product.anhDaiDien || product.urlAnh" 
                    :src="getImageUrl(product.anhDaiDien || product.urlAnh)" 
                    :alt="product.tenThuoc"
                    class="suggestion-image"
                    @error="handleImageError"
                  />
                  <div v-else class="suggestion-image-placeholder">
                    <i class="far fa-capsules"></i>
                  </div>
                  <div class="suggestion-info">
                    <div class="suggestion-name">{{ product.tenThuoc }}</div>
                    <div class="suggestion-price" v-if="product.giaThuocs && product.giaThuocs.length > 0">
                      {{ formatPrice(product.giaThuocs[0].donGia) }}
                    </div>
                    <div class="suggestion-price" v-else-if="product.giaBan">
                      {{ formatPrice(product.giaBan) }}
                    </div>
                  </div>
                </div>
              </div>
              <!-- Loading indicator -->
              <div v-show="isSearching" class="search-loading">
                <i class="fas fa-spinner fa-spin"></i> Đang tìm...
              </div>
            </div>
            <div class="mobile-menu-right">
              <div class="mobile-menu-btn">
                <a @click="$router.push('/user/cart')" class="nav-right-link" style="cursor: pointer;">
                  <i class="far fa-shopping-bag"></i>
                  <span v-if="cartStore.totalItems > 0">{{ cartStore.totalItems }}</span>
                </a>
              </div>
              <button class="navbar-toggler" type="button" @click="toggleMobileMenu">
                <span></span>
                <span></span>
                <span></span>
              </button>
            </div>
            <div class="navbar-collapse" :class="{ show: showMobileMenu }" id="navbarNav">
              <ul class="navbar-nav justify-content-end flex-grow-1">
                <li class="nav-item">
                  <a class="nav-link" :class="{ active: activeMenu === '1' }" @click="navigateTo('/user')" style="cursor: pointer;">Trang chủ</a>
                </li>
                <li class="nav-item">
                  <a class="nav-link" :class="{ active: activeMenu === '2' }" @click="navigateTo('/user/thuoc')" style="cursor: pointer;">Sản phẩm</a>
                </li>
                <li class="nav-item" v-if="authStore.isAuthenticated">
                  <a class="nav-link" :class="{ active: activeMenu === '4' }" @click="navigateTo('/user/orders')" style="cursor: pointer;">Đơn hàng</a>
                </li>
                <li class="nav-item" v-if="authStore.isAuthenticated">
                  <a class="nav-link user-icon-link" :class="{ active: activeMenu === '5' }" @click="navigateTo('/user/profile')" style="cursor: pointer;" title="Tài khoản">
                    <i class="far fa-user-circle"></i>
                  </a>
                </li>
                <li class="nav-item" v-if="!authStore.isAuthenticated">
                  <a class="nav-link" @click="navigateTo('/login')" style="cursor: pointer;">Đăng nhập</a>
                </li>
                <li class="nav-item" v-else>
                  <a class="nav-link" @click="handleLogout" style="cursor: pointer;">Đăng xuất</a>
                </li>
                <li class="nav-item" v-if="authStore.isAdmin">
                  <a class="nav-link" @click="navigateTo('/admin')" style="cursor: pointer;">
                    <i class="far fa-cog"></i> Quản trị
                  </a>
                </li>
              </ul>
              <!-- Nav Right -->
              <div class="nav-right">
                <a @click="navigateTo('/user/cart')" class="nav-right-link" style="cursor: pointer;">
                  <i class="far fa-shopping-bag"></i>
                  <span v-if="cartStore.totalItems > 0">{{ cartStore.totalItems }}</span>
                </a>
              </div>
            </div>
          </div>
        </nav>
      </div>
      <!-- Navbar End -->
    </header>
    <!-- Header Area End -->

    <!-- Main Content -->
    <main class="main">
      <router-view />
    </main>

    <!-- Footer Area -->
    <footer class="footer-area ft-bg">
      <!-- Google Maps Section -->
      <div class="map-section">
        <div class="container-fluid p-0">
          <iframe 
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.1276244126966!2d106.62567931533432!3d10.806412861656704!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752be1853ec007%3A0x3a97e863d018f3a4!2s140%20L%C3%AA%20Tr%E1%BB%8Dng%20T%E1%BA%A5n%2C%20T%C3%A2y%20Th%E1%BA%A1nh%2C%20T%C3%A2n%20Ph%C3%BA%2C%20Th%C3%A0nh%20ph%E1%BB%91%20H%E1%BB%93%20Ch%C3%AD%20Minh!5e0!3m2!1svi!2s!4v1733734800000!5m2!1svi!2s"
            width="100%" 
            height="400" 
            style="border:0; display: block;" 
            allowfullscreen="" 
            loading="lazy" 
            referrerpolicy="no-referrer-when-downgrade">
          </iframe>
        </div>
      </div>
      
      <div class="copyright">
        <div class="container">
          <div class="copyright-wrap">
            <div class="row">
              <div class="col-12 col-lg-6 align-self-center">
                <p class="copyright-text">
                  &copy; Copyright 2025 <a href="#"> Nhà Thuốc MELON </a> - Sức khỏe là vàng.
                </p>
              </div>
              <div class="col-12 col-lg-6 align-self-center">
                <div class="footer-social">
                  <span>Theo dõi:</span>
                  <a href="#"><i class="fab fa-facebook-f"></i></a>
                  <a href="#"><i class="fab fa-x-twitter"></i></a>
                  <a href="#"><i class="fab fa-linkedin-in"></i></a>
                  <a href="#"><i class="fab fa-youtube"></i></a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
    <!-- Footer Area End -->
    <ChatWidget />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore, useCartStore } from '@/store';
import { ElMessage } from 'element-plus';
import ChatWidget from '@/components/ChatWidget.vue';
import SnowEffect from '@/components/SnowEffect.vue';
import SpringPetals from '@/components/SpringPetals.vue';
import SummerBubbles from '@/components/SummerBubbles.vue';
import AutumnLeaves from '@/components/AutumnLeaves.vue';
import thuocApi from '@/api/thuoc';
import loaithuocApi from '@/api/loaithuoc';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const cartStore = useCartStore();
const showMobileMenu = ref(false);
const searchQuery = ref('');
const allProducts = ref([]);
const showSuggestions = ref(false);
const filteredProducts = ref([]);
const isSearching = ref(false);
const searchBoxRef = ref(null);
const categories = ref([]);
const showCategoryDropdown = ref(false);
let searchTimeout = null;

// Test data - xóa sau khi API hoạt động
const testProducts = [
  { maThuoc: '1', tenThuoc: 'Paracetamol 500mg', giaBan: 50000, anhDaiDien: null },
  { maThuoc: '2', tenThuoc: 'Thuốc hạ sốt Panadol', giaBan: 75000, anhDaiDien: null },
  { maThuoc: '3', tenThuoc: 'Vitamin C 1000mg', giaBan: 120000, anhDaiDien: null },
  { maThuoc: '4', tenThuoc: 'Thuốc bổ gan', giaBan: 45000, anhDaiDien: null },
  { maThuoc: '5', tenThuoc: 'Thuốc đau bụng', giaBan: 85000, anhDaiDien: null },
  { maThuoc: '6', tenThuoc: 'Băng gạc y tế', giaBan: 25000, anhDaiDien: null },
  { maThuoc: '7', tenThuoc: 'Băng cá nhân', giaBan: 15000, anhDaiDien: null },
];

const activeMenu = computed(() => {
  const path = route.path;
  if (path === '/user') return '1';
  if (path === '/user/thuoc' || path.startsWith('/user/thuoc/')) return '2';
  if (path === '/user/cart') return '3';
  if (path === '/user/orders') return '4';
  if (path === '/user/profile') return '5';
  return '1';
});

const categoryColumns = computed(() => {
  if (!categories.value || categories.value.length === 0) return [];
  
  const columns = [
    { title: 'Dụng cụ y tế', icon: 'far fa-stethoscope', categories: [] },
    { title: 'Vật tư tiêu hao', icon: 'far fa-band-aid', categories: [] },
    { title: 'Thiết bị y tế', icon: 'far fa-heartbeat', categories: [] },
    { title: 'Khác', icon: 'far fa-box', categories: [] }
  ];
  
  categories.value.forEach(cat => {
    const name = cat.tenLoaiThuoc.toLowerCase();
    if (name.includes('băng') || name.includes('bông') || name.includes('gạc')) {
      columns[1].categories.push(cat);
    } else if (name.includes('máy') || name.includes('thiết bị') || name.includes('máy đo')) {
      columns[2].categories.push(cat);
    } else if (name.includes('găng') || name.includes('khẩu trang') || name.includes('cồn')) {
      columns[0].categories.push(cat);
    } else {
      columns[3].categories.push(cat);
    }
  });
  
  return columns.filter(col => col.categories.length > 0);
});

const getCategoryIcon = (categoryName) => {
  const name = categoryName.toLowerCase();
  
  // Băng bó, gạc
  if (name.includes('băng keo')) return 'far fa-scroll';
  if (name.includes('băng') || name.includes('gạc') || name.includes('bông')) return 'far fa-band-aid';
  
  // Cồn, sát khuẩn
  if (name.includes('cồn') || name.includes('sát khuẩn')) return 'far fa-flask';
  
  // Găng tay
  if (name.includes('găng')) return 'far fa-hand-paper';
  
  // Khẩu trang
  if (name.includes('khẩu trang') || name.includes('y tế')) return 'far fa-head-side-mask';
  
  // Máy đo
  if (name.includes('máy đo') || name.includes('huyết áp')) return 'far fa-heartbeat';
  if (name.includes('nhiệt kế')) return 'far fa-thermometer';
  
  // Dụng cụ
  if (name.includes('dụng cụ') || name.includes('thiết bị')) return 'far fa-tools';
  if (name.includes('kim tiêm')) return 'far fa-syringe';
  
  // Mặc định
  return 'far fa-capsules';
};

const toggleMobileMenu = () => {
  showMobileMenu.value = !showMobileMenu.value;
};

const navigateTo = (path) => {
  router.push(path);
  showMobileMenu.value = false;
};

const handleLogout = () => {
  authStore.logout();
  ElMessage.success('Đã đăng xuất');
  router.push('/login');
  showMobileMenu.value = false;
};

const navigateToCategory = (maLoaiThuoc) => {
  showCategoryDropdown.value = false;
  router.push({
    path: '/user/thuoc',
    query: { category: maLoaiThuoc }
  });
};

const loadCategories = async () => {
  try {
    const response = await loaithuocApi.getAll();
    console.log('Categories API response:', response);
    
    if (response.data && response.data.status === 1 && response.data.data) {
      categories.value = response.data.data;
      console.log('Loaded categories:', categories.value.length);
    } else {
      console.warn('Unexpected categories API response structure:', response);
    }
  } catch (error) {
    console.error('Error loading categories:', error);
  }
};


const handleSearch = () => {
  if (searchQuery.value.trim()) {
    showSuggestions.value = false;
    router.push({
      path: '/user/thuoc',
      query: { search: searchQuery.value.trim() }
    });
  }
};

const handleSearchInput = () => {
  console.log('=== handleSearchInput called ===');
  console.log('Search query:', searchQuery.value);
  
  // Clear previous timeout
  if (searchTimeout) {
    clearTimeout(searchTimeout);
  }

  if (!searchQuery.value || !searchQuery.value.trim()) {
    console.log('Empty search, hiding suggestions');
    filteredProducts.value = [];
    showSuggestions.value = false;
    return;
  }

  // Debounce search
  searchTimeout = setTimeout(async () => {
    console.log('Executing search after debounce...');
    isSearching.value = true;
    
    try {
      // Nếu chưa có data, thử load từ API
      if (allProducts.value.length === 0) {
        console.log('Loading products from API: /Thuoc/ListThuocTonKho');
        try {
          const response = await thuocApi.getListThuocTonKho();
          console.log('Full API Response:', response);
          
          // Xử lý response theo cấu trúc của API
          let products = [];
          if (response.data && response.data.status === 1 && response.data.data) {
            // Trường hợp response có cấu trúc { status: 1, data: [...] }
            products = response.data.data;
            console.log('Products from response.data.data:', products.length);
          } else if (response.data && Array.isArray(response.data)) {
            // Trường hợp response.data là mảng trực tiếp
            products = response.data;
            console.log('Products from response.data array:', products.length);
          } else if (Array.isArray(response)) {
            // Trường hợp response là mảng trực tiếp
            products = response;
            console.log('Products from direct response:', products.length);
          }
          
          // Lọc và xử lý products
          allProducts.value = products.filter(p => p && p.maThuoc && p.tenThuoc);
          console.log('Valid products after filtering:', allProducts.value.length);
          
          if (allProducts.value.length === 0) {
            console.warn('No products loaded, using test data');
            allProducts.value = testProducts;
          }
        } catch (apiError) {
          console.error('API Error:', apiError);
          console.log('Using test data as fallback');
          allProducts.value = testProducts;
        }
      }

      console.log('Total products available:', allProducts.value.length);
      if (allProducts.value.length > 0) {
        console.log('Sample product:', allProducts.value[0]);
      }

      const query = searchQuery.value.toLowerCase().trim();
      console.log('Filtering with query:', query);
      
      filteredProducts.value = allProducts.value
        .filter(p => {
          if (!p || !p.tenThuoc) {
            return false;
          }
          const matches = p.tenThuoc.toLowerCase().includes(query);
          if (matches) {
            console.log('Match found:', p.tenThuoc);
          }
          return matches;
        })
        .slice(0, 8);
      
      console.log('Filtered products count:', filteredProducts.value.length);
      console.log('Setting showSuggestions to true');
      showSuggestions.value = true;
      
    } catch (error) {
      console.error('Error in handleSearchInput:', error);
    } finally {
      isSearching.value = false;
    }
  }, 300);
};

const handleSearchFocus = () => {
  if (searchQuery.value.trim() && filteredProducts.value.length > 0) {
    showSuggestions.value = true;
  }
};

const selectProduct = (product) => {
  router.push(`/user/thuoc/${product.maThuoc}`);
  searchQuery.value = '';
  filteredProducts.value = [];
  showSuggestions.value = false;
};

const handleClickOutside = (event) => {
  if (searchBoxRef.value && !searchBoxRef.value.contains(event.target)) {
    showSuggestions.value = false;
  }
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
  loadCategories();
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});

const getImageUrl = (imagePath) => {
  if (!imagePath) return '';
  if (imagePath.startsWith('http')) return imagePath;
  // Xử lý cả urlAnh và anhDaiDien từ API
  if (imagePath.startsWith('/')) {
    return `http://localhost:5175${imagePath}`;
  }
  return `http://localhost:5175/${imagePath}`;
};

const formatPrice = (price) => {
  if (!price) return '0 ₫';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(price);
};

const handleImageError = (e) => {
  e.target.style.display = 'none';
};

const loadTestData = () => {
  console.log('Loading test data...');
  allProducts.value = testProducts;
  console.log('Test data loaded:', allProducts.value.length);
  // Re-trigger search
  handleSearchInput();
};
</script>

<style scoped>
.user-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* Header Top */
.header-top {
  background: #f8f9fa;
  padding: 8px 0;
  border-bottom: 1px solid #e5e5e5;
  font-size: 12px;
}

.header-top-wrap {
  display: flex;
  align-items: center;
}

.header-top-left,
.header-top-right {
  display: flex;
  align-items: center;
}

.header-top-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 15px;
  flex-wrap: wrap;
}

.header-top-list li {
  display: flex;
  align-items: center;
}

.header-top-list a {
  color: #666;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: color 0.3s;
}

.header-top-list a:hover {
  color: #0ecfe0;
}

.header-top-list i {
  font-size: 12px;
}

.header-top-right {
  justify-content: flex-end;
}

.header-top-right .header-top-list {
  justify-content: flex-end;
}

.header-top-right span {
  color: #666;
  margin-right: 10px;
}

/* Main Navigation */
.main-navigation {
  background: #fff;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  position: sticky;
  top: 0;
  z-index: 999;
}

.navbar {
  padding: 0;
}

.navbar-brand {
  padding: 15px 0;
  flex-shrink: 0;
  margin-right: 10px;
}

.navbar-brand img {
  max-height: 40px;
}

/* Search Box */
.header-search-box {
  flex: 1 1 auto;
  max-width: none;
  margin: 0 8px 0 15px;
  position: relative;
}

.header-search-box .form-control {
  height: 55px;
  border: 2px solid #e5e5e5;
  border-radius: 30px;
  padding: 12px 60px 12px 25px;
  font-size: 15px;
  transition: all 0.3s;
  width: 100%;
}

.header-search-box .form-control:focus {
  outline: none;
  border-color: #0ecfe0;
  box-shadow: 0 0 0 0.2rem rgba(14, 207, 224, 0.15);
}

.header-search-box .search-btn {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  width: 42px;
  height: 42px;
  border: none;
  background: #0ecfe0;
  color: #fff;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
}

.header-search-box .search-btn:hover {
  background: #0ab8c7;
  transform: translateY(-50%) scale(1.05);
}

.search-suggestions {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: #fff;
  border: 1px solid #e5e5e5;
  border-top: none;
  border-radius: 0 0 10px 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  max-height: 400px;
  overflow-y: auto;
  z-index: 1000;
  margin-top: 5px;
}

.search-loading {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: #fff;
  border: 1px solid #e5e5e5;
  border-radius: 0 0 10px 10px;
  padding: 12px 15px;
  margin-top: 5px;
  z-index: 1000;
  color: #0ecfe0;
  font-size: 14px;
}

.search-loading i {
  margin-right: 8px;
}

.search-debug {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: #fff3cd;
  border: 1px solid #ffc107;
  padding: 8px 15px;
  margin-top: 5px;
  font-size: 12px;
  color: #856404;
  z-index: 999;
}

.suggestion-item {
  display: flex;
  align-items: center;
  padding: 12px 15px;
  cursor: pointer;
  transition: background 0.2s;
  border-bottom: 1px solid #f5f5f5;
}

.suggestion-item:last-child {
  border-bottom: none;
}

.suggestion-item:hover {
  background: #f8f9fa;
}

.suggestion-image {
  width: 50px;
  height: 50px;
  object-fit: cover;
  border-radius: 8px;
  margin-right: 12px;
  border: 1px solid #e5e5e5;
  flex-shrink: 0;
}

.suggestion-image-placeholder {
  width: 50px;
  height: 50px;
  background: #f8f9fa;
  border-radius: 8px;
  margin-right: 12px;
  border: 1px solid #e5e5e5;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
  font-size: 20px;
  flex-shrink: 0;
}

.suggestion-info {
  flex: 1;
}

.suggestion-name {
  font-size: 14px;
  font-weight: 500;
  color: #17181c;
  margin-bottom: 4px;
  line-height: 1.4;
}

.suggestion-price {
  font-size: 13px;
  color: #0ecfe0;
  font-weight: 600;
}

.navbar-nav {
  gap: 0;
  margin-left: 3px;
  flex: 0 0 auto;
}

.nav-link {
  color: #17181c;
  font-weight: 500;
  padding: 25px 4px;
  transition: all 0.3s;
  border-bottom: 3px solid transparent;
  display: flex;
  align-items: center;
  gap: 2px;
  font-size: 11px;
  white-space: nowrap;
}

.nav-link:hover,
.nav-link.active {
  color: #0ecfe0;
  border-bottom-color: #0ecfe0;
}

.user-icon-link i {
  font-size: 24px;
}

/* Dropdown Menu Styles */
.nav-item.dropdown {
  position: relative;
}

.nav-link.dropdown-toggle {
  position: relative;
}

.nav-link.dropdown-toggle::after {
  content: '\f078';
  font-family: 'Font Awesome 5 Pro';
  font-weight: 400;
  border: none;
  vertical-align: middle;
  margin-left: 5px;
  font-size: 10px;
  transition: transform 0.3s;
}

.nav-item.dropdown:hover .nav-link.dropdown-toggle::after {
  transform: rotate(180deg);
}

/* Mega Menu Styles */
.nav-item.mega-menu .dropdown-menu.mega-dropdown {
  min-width: 750px;
  max-width: 900px;
  width: auto;
  padding: 0;
  left: 50%;
  transform: translateX(-50%);
  border: none;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  border-radius: 12px;
}

.dropdown-menu.show {
  opacity: 1;
  visibility: visible;
  transform: translateX(-50%) translateY(0);
}

.mega-menu-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
  padding: 25px;
  background: #fff;
  border-radius: 12px;
}

.mega-menu-item {
  padding: 12px 16px;
  color: #495057;
  text-decoration: none;
  border-radius: 6px;
  transition: all 0.2s ease;
  font-size: 14px;
  cursor: pointer;
  border: 1px solid #e9ecef;
  text-align: left;
  font-weight: 400;
  background: #fff;
  position: relative;
  overflow: hidden;
}

.mega-menu-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(23, 162, 184, 0.08), transparent);
  transition: left 0.5s;
}

.mega-menu-item:hover::before {
  left: 100%;
}

.mega-menu-item:hover {
  background: #f8f9fa;
  color: #17a2b8;
  border-color: #17a2b8;
  transform: translateX(4px);
  box-shadow: 0 2px 8px rgba(23, 162, 184, 0.15);
}

/* Old mega menu styles - remove */
.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  min-width: 250px;
  background: #fff;
  border: 1px solid #e5e5e5;
  border-radius: 8px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  padding: 8px 0;
  margin-top: 0;
  opacity: 0;
  visibility: hidden;
  transform: translateY(10px);
  transition: all 0.3s ease;
  z-index: 1000;
  max-height: 400px;
  overflow-y: auto;
}

.dropdown-menu.show {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}

.dropdown-item {
  display: flex;
  align-items: center;
  padding: 10px 20px;
  color: #17181c;
  text-decoration: none;
  transition: all 0.2s;
  font-size: 14px;
  cursor: pointer;
  gap: 10px;
}

.dropdown-item:hover {
  background: #f8f9fa;
  color: #0ecfe0;
  padding-left: 25px;
}

.dropdown-item i {
  font-size: 14px;
  width: 18px;
  text-align: center;
}

.dropdown-divider {
  margin: 8px 0;
  border-top: 1px solid #e5e5e5;
  height: 0;
}

.nav-right {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: 8px;
  flex-shrink: 0;
}

.nav-right-link {
  width: 40px;
  height: 40px;
  background: #f8f9fa;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #17181c;
  text-decoration: none;
  position: relative;
  transition: all 0.3s;
}

.nav-right-link:hover {
  background: #0ecfe0;
  color: #fff;
}

.nav-right-link span {
  position: absolute;
  top: -5px;
  right: -5px;
  background: #f76331;
  color: #fff;
  font-size: 11px;
  font-weight: 600;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.mobile-menu-right {
  display: none;
  align-items: center;
  gap: 10px;
}

.mobile-menu-btn {
  display: flex;
  gap: 10px;
}

.navbar-toggler {
  border: none;
  background: transparent;
  padding: 5px;
  cursor: pointer;
}

.navbar-toggler span {
  display: block;
  width: 25px;
  height: 3px;
  background: #17181c;
  margin: 4px 0;
  transition: all 0.3s;
  border-radius: 3px;
}

/* Main Content */
.main {
  flex: 1;
  padding: 0;
}

/* Footer */
.footer-area {
  background: #17181c;
  color: #fff;
  margin-top: auto;
}

/* Map Section */
.map-section {
  position: relative;
  width: 100%;
}

.map-section iframe {
  width: 100%;
  height: 400px;
  display: block;
}

.store-info-overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 10;
  pointer-events: none;
}

.store-info-card {
  background: rgba(255, 255, 255, 0.97);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 25px 35px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  gap: 20px;
  pointer-events: auto;
  max-width: 600px;
  border: 2px solid rgba(14, 207, 224, 0.2);
}

.info-icon {
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #0ecfe0 0%, #0ab3c2 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26px;
  color: white;
  flex-shrink: 0;
  box-shadow: 0 4px 15px rgba(14, 207, 224, 0.4);
}

.info-content h3 {
  color: #0ecfe0;
  font-size: 22px;
  font-weight: 700;
  margin: 0 0 8px 0;
}

.info-content .address {
  color: #333;
  font-size: 15px;
  margin: 0 0 12px 0;
  line-height: 1.5;
  font-weight: 500;
}

.contact-info {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  font-size: 14px;
  color: #666;
}

.contact-info span {
  display: flex;
  align-items: center;
  gap: 6px;
}

.contact-info i {
  color: #0ecfe0;
  font-size: 13px;
}

.copyright {
  padding: 30px 0;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.copyright-text {
  color: #999;
  margin: 0;
  font-size: 14px;
}

.copyright-text a {
  color: #0ecfe0;
  text-decoration: none;
}

.copyright-text a:hover {
  color: #fff;
}

.footer-social {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
}

.footer-social span {
  color: #999;
  font-size: 14px;
}

.footer-social a {
  width: 35px;
  height: 35px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  text-decoration: none;
  transition: all 0.3s;
}

.footer-social a:hover {
  background: #0ecfe0;
  transform: translateY(-3px);
}

/* Responsive */
@media (max-width: 991px) {
  .header-top {
    display: none;
  }

  .header-search-box {
    display: none;
  }

  .mobile-menu-right {
    display: flex;
  }

  .navbar-collapse {
    display: none;
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: #fff;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
    padding: 20px;
  }

  .navbar-collapse.show {
    display: block;
  }

  /* Map responsive */
  .map-section iframe {
    height: 300px;
  }

  .store-info-card {
    flex-direction: column;
    padding: 20px;
    max-width: 90%;
    text-align: center;
  }

  .info-icon {
    width: 50px;
    height: 50px;
    font-size: 22px;
  }

  .info-content h3 {
    font-size: 18px;
  }

  .info-content .address {
    font-size: 13px;
  }

  .contact-info {
    flex-direction: column;
    gap: 8px;
    font-size: 13px;
  }

  .footer-social {
    justify-content: center;
    margin-top: 15px;
  }

  .navbar-nav {
    flex-direction: column;
    gap: 0;
  }

  .nav-link {
    padding: 15px 0;
    border-bottom: 1px solid #f0f0f0;
  }

  .nav-item.mega-menu .dropdown-menu.mega-dropdown {
    position: static;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
    border: none;
    min-width: 100%;
    max-width: 100%;
    border-radius: 8px;
  }

  .mega-menu-grid {
    grid-template-columns: repeat(2, 1fr);
    padding: 15px;
    gap: 8px;
  }

  .mega-menu-item {
    padding: 10px 12px;
    font-size: 13px;
  }

  .nav-item.dropdown .dropdown-menu {
    position: static;
    box-shadow: none;
    border: none;
    border-left: 2px solid #0ecfe0;
    margin-left: 15px;
    padding-left: 0;
  }

  .nav-item.dropdown .dropdown-menu.show {
    display: block;
  }

  .dropdown-item {
    padding: 10px 15px;
  }

  .dropdown-item:hover {
    padding-left: 20px;
  }

  .nav-link.dropdown-toggle::after {
    float: right;
  }

  .nav-right {
    display: none;
  }

  .footer-social {
    justify-content: center;
    margin-top: 15px;
  }

  .copyright-text {
    text-align: center;
  }
}

@media (max-width: 767px) {
  .header-top-left,
  .header-top-right {
    justify-content: center;
  }

  .header-top-list {
    justify-content: center;
    gap: 10px;
    font-size: 12px;
  }

  .header-top-list .help {
    display: none;
  }
}
</style>
