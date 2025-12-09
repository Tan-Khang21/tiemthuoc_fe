<template>
  <div class="shop-area bg py-90">
    <div class="container">
      <div class="row">
        <!-- Sidebar -->
        <div class="col-lg-3">
          <div class="shop-sidebar">
            <!-- Search Widget -->
            <div class="shop-widget">
              <div class="shop-search-form">
                <h4 class="shop-widget-title">Tìm kiếm</h4>
                <form @submit.prevent>
                  <div class="form-group">
                    <input 
                      type="text" 
                      v-model="searchKeyword"
                      class="form-control" 
                      placeholder="Tìm kiếm sản phẩm..."
                    >
                    <button type="button"><i class="far fa-search"></i></button>
                  </div>
                </form>
              </div>
            </div>

            <!-- Category Widget -->
            <div class="shop-widget">
              <h4 class="shop-widget-title">Danh mục</h4>
              <ul class="shop-category-list">
                <li :class="{ active: selectedCategory === '' }">
                  <a href="#" @click.prevent="selectedCategory = ''; loadThuocList()">
                    Tất cả sản phẩm<span>({{ thuocList.length }})</span>
                  </a>
                </li>
                <li 
                  v-for="(cat, index) in displayedCategories" 
                  :key="cat.maLoaiThuoc"
                  :class="{ active: selectedCategory === cat.maLoaiThuoc }"
                >
                  <a href="#" @click.prevent="selectedCategory = cat.maLoaiThuoc; loadThuocList()">
                    {{ cat.tenLoaiThuoc }}<span>({{ cat.soLuongThuoc || 0 }})</span>
                  </a>
                </li>
              </ul>
              <button 
                v-if="categories.length > 8" 
                class="show-more-btn" 
                @click="showAllCategories = !showAllCategories"
              >
                <i :class="showAllCategories ? 'fas fa-chevron-up' : 'fas fa-chevron-down'"></i>
                {{ showAllCategories ? 'Thu gọn' : `Xem thêm (${categories.length - 8})` }}
              </button>
            </div>

            <!-- Ratings Widget -->
            <div class="shop-widget">
              <h4 class="shop-widget-title">Đánh giá</h4>
              <ul class="shop-checkbox-list rating">
                <li v-for="star in [5, 4, 3, 2, 1]" :key="star">
                  <div class="form-check">
                    <input 
                      class="form-check-input" 
                      type="checkbox" 
                      :id="`rate${star}`"
                      v-model="filters.ratings"
                      :value="star"
                    >
                    <label class="form-check-label" :for="`rate${star}`">
                      <i v-for="i in star" :key="`filled-${i}`" class="fas fa-star"></i>
                      <i v-for="i in (5 - star)" :key="`empty-${i}`" class="fal fa-star"></i>
                    </label>
                  </div>
                </li>
              </ul>
            </div>

            <!-- Banner Widget -->
            <div class="shop-widget-banner mt-30">
              <div class="banner-img" style="background-image:url(https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400&h=300&fit=crop)"></div>
              <div class="banner-content">
                <h6>Giảm <span>35%</span></h6>
                <h4>Bộ sưu tập mới</h4>
                <a href="#" class="theme-btn">Mua ngay</a>
              </div>
            </div>
          </div>
        </div>

        <!-- Main Content -->
        <div class="col-lg-9">
          <!-- Sort Bar -->
          <div class="col-md-12">
            <div class="shop-sort">
              <div class="shop-sort-box">
                <div class="shop-sorty-label">Sắp xếp:</div>
                <select class="select" v-model="sortBy" @change="handleSort">
                  <option value="">Mặc định</option>
                  <option value="latest">Mới nhất</option>
                  <option value="price-low">Giá thấp đến cao</option>
                  <option value="price-high">Giá cao đến thấp</option>
                  <option value="name">Tên A-Z</option>
                </select>
                <div class="shop-sort-show">
                  Hiển thị {{ (currentPage - 1) * itemsPerPage + 1 }}-{{ Math.min(currentPage * itemsPerPage, filteredThuocList.length) }} 
                  trong {{ filteredThuocList.length }} kết quả
                </div>
              </div>
            </div>
          </div>

          <!-- Product Grid -->
          <div class="shop-item-wrap item-4" v-loading="loading">
            <div class="row g-4">
              <div 
                v-for="thuoc in paginatedProducts" 
                :key="thuoc.maThuoc"
                class="col-md-6 col-lg-4"
              >
                <div class="product-item">
                  <div class="product-img-wrapper">
                    <router-link :to="`/user/thuoc/${thuoc.maThuoc}`" class="product-img-link">
                      <img :src="getProductImage(thuoc)" :alt="thuoc.tenThuoc" class="product-img" @error="handleImageError">
                    </router-link>
                    <div class="product-badges">
                      <span class="badge badge-available" v-if="getStockQuantity(thuoc) > 0">Còn hàng</span>
                      <span class="badge badge-out" v-else>Hết hàng</span>
                    </div>
                    <div class="product-overlay">
                      <button class="quick-action-btn" @click.prevent="viewDetail(thuoc.maThuoc)" title="Xem nhanh">
                        <i class="far fa-eye"></i>
                      </button>
                      <button class="quick-action-btn" @click.prevent="addToCart(thuoc)" title="Thêm vào giỏ">
                        <i class="far fa-shopping-cart"></i>
                      </button>
                    </div>
                  </div>
                  
                  <div class="product-info">
                    <h3 class="product-name">
                      <router-link :to="`/user/thuoc/${thuoc.maThuoc}`">
                        {{ thuoc.tenThuoc }}
                      </router-link>
                    </h3>
                    <div class="product-rating">
                      <div class="stars" v-if="getProductRating(thuoc.maThuoc).count > 0">
                        <i v-for="n in renderStars(getProductRating(thuoc.maThuoc).average).full" :key="'full-' + n" class="fas fa-star"></i>
                        <i v-if="renderStars(getProductRating(thuoc.maThuoc).average).half" class="fas fa-star-half-alt"></i>
                        <i v-for="n in renderStars(getProductRating(thuoc.maThuoc).average).empty" :key="'empty-' + n" class="far fa-star"></i>
                      </div>
                      <div class="stars" v-else>
                        <i v-for="n in 5" :key="'empty-' + n" class="far fa-star"></i>
                      </div>
                      <span class="rating-count" v-if="getProductRating(thuoc.maThuoc).count > 0">
                        ({{ getProductRating(thuoc.maThuoc).average.toFixed(1) }})
                      </span>
                      <span class="rating-count" v-else>(Chưa có đánh giá)</span>
                    </div>
                    
                    <div class="product-price-box" v-if="thuoc.giaThuocs && thuoc.giaThuocs.length > 0">
                      <div class="price-row">
                        <div class="price-info">
                          <span class="unit-label">{{ thuoc.giaThuocs[0].tenLoaiDonVi }}</span>
                          <span class="price-tag">{{ formatPriceShort(thuoc.giaThuocs[0].donGia) }}</span>
                        </div>
                        <button class="add-cart-btn" @click="addToCart(thuoc)">
                          <i class="fas fa-plus"></i>
                        </button>
                      </div>
                      <div class="stock-info">
                        <i class="fas fa-box-open"></i>
                        <span>Còn {{ thuoc.giaThuocs[0].soLuongCon }} sản phẩm</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Empty State -->
            <div v-if="filteredThuocList.length === 0" class="empty-state">
              <i class="far fa-box-open"></i>
              <p>Không tìm thấy sản phẩm nào</p>
              <button @click="resetFilters" class="theme-btn">
                <i class="far fa-redo"></i> Xóa bộ lọc
              </button>
            </div>
          </div>

          <!-- Pagination -->
          <div class="pagination-area mt-50" v-if="totalPages > 1">
            <div aria-label="Page navigation">
              <ul class="pagination">
                <li class="page-item" :class="{ disabled: currentPage === 1 }">
                  <a class="page-link" href="#" @click.prevent="changePage(currentPage - 1)" aria-label="Previous">
                    <span aria-hidden="true"><i class="far fa-arrow-left"></i></span>
                  </a>
                </li>
                
                <li 
                  v-for="page in displayPages" 
                  :key="page"
                  class="page-item" 
                  :class="{ active: currentPage === page }"
                >
                  <a v-if="page !== '...'" class="page-link" href="#" @click.prevent="changePage(page)">{{ page }}</a>
                  <span v-else class="page-link">...</span>
                </li>
                
                <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                  <a class="page-link" href="#" @click.prevent="changePage(currentPage + 1)" aria-label="Next">
                    <span aria-hidden="true"><i class="far fa-arrow-right"></i></span>
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import api from '@/api';
import { useCartStore } from '@/store';
import { ElMessage } from 'element-plus';

const router = useRouter();
const route = useRoute();
const cartStore = useCartStore();

const loading = ref(false);
const thuocList = ref([]);
const categories = ref([]);
const productRatings = ref({}); // Store ratings for each product
const searchKeyword = ref('');
const selectedCategory = ref('');
const sortBy = ref('');
const currentPage = ref(1);
const itemsPerPage = ref(9);
const showAllCategories = ref(false);

const filters = ref({
  onSale: false,
  inStock: false,
  outOfStock: false,
  ratings: []
});

const displayedCategories = computed(() => {
  if (showAllCategories.value) {
    return categories.value;
  }
  return categories.value.slice(0, 8);
});

const filteredThuocList = computed(() => {
  let result = [...thuocList.value];
  
  // Filter by search keyword
  if (searchKeyword.value) {
    result = result.filter(thuoc =>
      thuoc.tenThuoc.toLowerCase().includes(searchKeyword.value.toLowerCase())
    );
  }
  
  // Filter by stock status
  if (filters.value.inStock) {
    result = result.filter(thuoc => getStockQuantity(thuoc) > 0);
  }
  if (filters.value.outOfStock) {
    result = result.filter(thuoc => getStockQuantity(thuoc) === 0);
  }
  
  // Filter by ratings
  if (filters.value.ratings && filters.value.ratings.length > 0) {
    result = result.filter(thuoc => {
      const rating = getProductRating(thuoc.maThuoc);
      if (rating.count === 0) return false;
      const avgRating = Math.floor(rating.average);
      return filters.value.ratings.includes(avgRating);
    });
  }
  
  // Sort
  if (sortBy.value === 'latest') {
    result.sort((a, b) => b.maThuoc.localeCompare(a.maThuoc));
  } else if (sortBy.value === 'price-low') {
    result.sort((a, b) => getProductPrice(a) - getProductPrice(b));
  } else if (sortBy.value === 'price-high') {
    result.sort((a, b) => getProductPrice(b) - getProductPrice(a));
  } else if (sortBy.value === 'name') {
    result.sort((a, b) => a.tenThuoc.localeCompare(b.tenThuoc));
  }
  
  return result;
});

const paginatedProducts = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return filteredThuocList.value.slice(start, end);
});

const totalPages = computed(() => {
  return Math.ceil(filteredThuocList.value.length / itemsPerPage.value);
});

const displayPages = computed(() => {
  const pages = [];
  const total = totalPages.value;
  const current = currentPage.value;
  
  if (total <= 7) {
    for (let i = 1; i <= total; i++) {
      pages.push(i);
    }
  } else {
    if (current <= 3) {
      pages.push(1, 2, 3, 4, '...', total);
    } else if (current >= total - 2) {
      pages.push(1, '...', total - 3, total - 2, total - 1, total);
    } else {
      pages.push(1, '...', current - 1, current, current + 1, '...', total);
    }
  }
  
  return pages;
});

onMounted(async () => {
  // Đọc search query từ URL nếu có
  if (route.query.search) {
    searchKeyword.value = route.query.search;
  }
  await loadCategories();
  await loadThuocList();
});

const loadProductRatings = async (products) => {
  for (const product of products) {
    try {
      const response = await api.danhgiathuoc.getByThuoc(product.maThuoc)
      
      if (response.data && response.data.status === 1 && response.data.data && response.data.data.length > 0) {
        const ratings = response.data.data
        const avgRating = ratings.reduce((sum, r) => sum + (r.soSao || 0), 0) / ratings.length
        productRatings.value[product.maThuoc] = {
          average: avgRating,
          count: ratings.length
        }
      } else {
        productRatings.value[product.maThuoc] = { average: 0, count: 0 }
      }
    } catch (error) {
      console.error(`Error loading ratings for ${product.maThuoc}:`, error)
      productRatings.value[product.maThuoc] = { average: 0, count: 0 }
    }
  }
}

const getProductRating = (maThuoc) => {
  return productRatings.value[maThuoc] || { average: 0, count: 0 }
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

// Watch route query changes
watch(() => route.query.search, (newSearch) => {
  if (newSearch) {
    searchKeyword.value = newSearch;
  }
});

const loadCategories = async () => {
  try {
    const response = await fetch('https://kltn-l679.onrender.com/api/Thuoc/TopLoaiThuoc', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      mode: 'cors'
    });
    
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    
    const result = await response.json();
    console.log('Categories API response:', result);
    
    if (result.status === 1 && result.data) {
      categories.value = result.data.filter(cat => cat && cat.maLoaiThuoc);
    } else {
      categories.value = [];
    }
  } catch (error) {
    console.error('Load categories error:', error);
  }
};

const loadThuocList = async () => {
  loading.value = true;
  try {
    let response;
    if (selectedCategory.value) {
      response = await fetch(`https://kltn-l679.onrender.com/api/Thuoc/ByLoai/${selectedCategory.value}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        mode: 'cors'
      });
      response = await response.json();
    } else {
      response = await fetch('https://kltn-l679.onrender.com/api/Thuoc/ListThuocTonKho', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        mode: 'cors'
      });
      response = await response.json();
    }
    
    let products = (response.data?.data || response.data || []).filter(p => p && p.maThuoc);
    
    // Lọc sản phẩm: chỉ giữ những sản phẩm có ít nhất 1 đơn vị với soLuongCon > 0 và trangThai === true
    thuocList.value = products.filter(product => {
      if (!product.giaThuocs || product.giaThuocs.length === 0) {
        return false;
      }
      
      // Lọc các đơn vị khả dụng
      const availableUnits = product.giaThuocs.filter(
        unit => unit.soLuongCon > 0 && unit.trangThai === true
      );
      
      // Chỉ giữ sản phẩm có ít nhất 1 đơn vị khả dụng
      if (availableUnits.length > 0) {
        // Cập nhật giaThuocs chỉ với các đơn vị khả dụng
        product.giaThuocs = availableUnits;
        return true;
      }
      return false;
    });
    
    currentPage.value = 1;
    
    // Load ratings for displayed products
    if (thuocList.value.length > 0) {
      await loadProductRatings(thuocList.value);
    }
  } catch (error) {
    console.error('Load thuoc error:', error);
    ElMessage.error('Lỗi khi tải danh sách thuốc');
  } finally {
    loading.value = false;
  }
};

const handleSort = () => {
  currentPage.value = 1;
};

const changePage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
};

const viewDetail = (maThuoc) => {
  router.push(`/user/thuoc/${maThuoc}`);
};

const getProductPrice = (thuoc) => {
  if (thuoc?.giaThuocs && thuoc.giaThuocs.length > 0) {
    return thuoc.giaThuocs[0].donGia;
  }
  return thuoc?.donGiaSi || 0;
};

const getProductUnit = (thuoc) => {
  if (thuoc?.giaThuocs && thuoc.giaThuocs.length > 0) {
    return thuoc.giaThuocs[0].tenLoaiDonVi;
  }
  return thuoc?.tenLoaiDonVi || 'Hộp';
};

const getStockQuantity = (thuoc) => {
  if (thuoc?.giaThuocs && thuoc.giaThuocs.length > 0) {
    return thuoc.giaThuocs[0].soLuongCon || 0;
  }
  return thuoc?.tongSoLuongCon || 0;
};

const getProductImage = (thuoc) => {
  const urlAnh = thuoc?.urlAnh || thuoc?.UrlAnh;
  if (urlAnh && (urlAnh.startsWith('http://') || urlAnh.startsWith('https://'))) {
    return urlAnh;
  }
  return 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=400&h=400&fit=crop';
};

const addToCart = (thuoc) => {
  // Lấy đơn vị đầu tiên từ giaThuocs
  const firstUnit = thuoc.giaThuocs && thuoc.giaThuocs.length > 0 ? thuoc.giaThuocs[0] : null;
  
  if (!firstUnit) {
    ElMessage.error('Sản phẩm không có thông tin đơn vị');
    return;
  }

  cartStore.addToCart({
    maThuoc: thuoc.maThuoc,
    tenThuoc: thuoc.tenThuoc,
    donGia: firstUnit.donGia,
    donVi: firstUnit.maLoaiDonVi,  // Sử dụng maLoaiDonVi từ giaThuocs
    tenDonVi: firstUnit.tenLoaiDonVi,
    urlAnh: thuoc.urlAnh,
    soLuong: 1,
  });
  ElMessage.success('Đã thêm vào giỏ hàng!');
};

const addToWishlist = (thuoc) => {
  ElMessage.success('Đã thêm vào danh sách yêu thích!');
};

const resetFilters = () => {
  searchKeyword.value = '';
  selectedCategory.value = '';
  sortBy.value = '';
  filters.value = {
    onSale: false,
    inStock: false,
    outOfStock: false,
    ratings: []
  };
  loadThuocList();
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

const handleImageError = (e) => {
  e.target.src = 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=400&h=400&fit=crop';
};
</script>

<style scoped>
/* Shop Area */
.shop-area {
  background: #f8f9fa;
  padding: 90px 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 15px;
}

/* Sidebar */
.shop-sidebar {
  position: sticky;
  top: 20px;
}

.shop-widget {
  background: #fff;
  padding: 25px;
  border-radius: 10px;
  margin-bottom: 30px;
  box-shadow: 0 2px 15px rgba(0, 0, 0, 0.05);
}

.shop-widget-title {
  font-size: 18px;
  font-weight: 700;
  color: #17181c;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 2px solid #0ecfe0;
}

/* Search Form */
.shop-search-form .form-group {
  position: relative;
  margin-bottom: 0;
}

.shop-search-form .form-control {
  height: 50px;
  border: 1px solid #e5e5e5;
  border-radius: 8px;
  padding: 0 50px 0 20px;
  font-size: 14px;
}

.shop-search-form button {
  position: absolute;
  right: 0;
  top: 0;
  height: 50px;
  width: 50px;
  background: #0ecfe0;
  border: none;
  border-radius: 0 8px 8px 0;
  color: #fff;
  cursor: pointer;
  transition: all 0.3s;
}

.shop-search-form button:hover {
  background: #0bb5c4;
}

/* Category List */
.shop-category-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.shop-category-list li {
  margin-bottom: 12px;
}

.shop-category-list li.active a {
  color: #0ecfe0;
  font-weight: 600;
}

.shop-category-list li a {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 15px;
  color: #666;
  text-decoration: none;
  border-radius: 6px;
  transition: all 0.3s;
}

.shop-category-list li a:hover {
  background: #f0f9ff;
  color: #0ecfe0;
  padding-left: 20px;
}

.shop-category-list li a span {
  color: #999;
  font-size: 13px;
}

/* Show More Button */
.show-more-btn {
  width: 100%;
  margin-top: 15px;
  padding: 10px 15px;
  background: #f0f9ff;
  border: 1px solid #e0f4f7;
  border-radius: 8px;
  color: #0ecfe0;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.show-more-btn:hover {
  background: #0ecfe0;
  color: #fff;
  border-color: #0ecfe0;
}

.show-more-btn i {
  font-size: 12px;
}

/* Checkbox List */
.shop-checkbox-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.shop-checkbox-list li {
  margin-bottom: 12px;
}

.form-check {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.form-check-input {
  width: 18px;
  height: 18px;
  margin-right: 10px;
  cursor: pointer;
  border: 2px solid #ddd;
}

.form-check-input:checked {
  background-color: #0ecfe0;
  border-color: #0ecfe0;
}

.form-check-label {
  cursor: pointer;
  color: #666;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 5px;
}

/* Rating Stars */
.shop-checkbox-list.rating .form-check-label i {
  font-size: 14px;
  color: #ffc107;
}

.shop-checkbox-list.rating .form-check-label i.fal {
  color: #ddd;
}

/* Banner Widget */
.shop-widget-banner {
  position: relative;
  border-radius: 10px;
  overflow: hidden;
  height: 300px;
  margin-top: 30px;
}

.banner-img {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-size: cover;
  background-position: center;
}

.banner-img::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(14, 207, 224, 0.8), rgba(247, 99, 49, 0.8));
}

.banner-content {
  position: relative;
  z-index: 2;
  padding: 30px;
  color: #fff;
  display: flex;
  flex-direction: column;
  justify-content: center;
  height: 100%;
}

.banner-content h6 {
  font-size: 14px;
  margin-bottom: 10px;
}

.banner-content h6 span {
  font-size: 24px;
  font-weight: 700;
}

.banner-content h4 {
  font-size: 22px;
  font-weight: 700;
  margin-bottom: 20px;
  line-height: 1.3;
}

.banner-content .theme-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 25px;
  background: #fff;
  color: #0ecfe0;
  border-radius: 50px;
  font-weight: 600;
  text-decoration: none;
  width: fit-content;
  transition: all 0.3s;
  border: 2px solid #fff;
}

.banner-content .theme-btn:hover {
  background: transparent;
  color: #fff;
}

/* Shop Sort */
.shop-sort {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff;
  padding: 20px 25px;
  border-radius: 10px;
  margin-bottom: 30px;
  box-shadow: 0 2px 15px rgba(0, 0, 0, 0.05);
  flex-wrap: wrap;
  gap: 15px;
}

.shop-sort-box {
  display: flex;
  align-items: center;
  gap: 15px;
  flex-wrap: wrap;
}

.shop-sorty-label {
  font-weight: 600;
  color: #17181c;
  font-size: 14px;
}

.shop-sort .select {
  min-width: 200px;
  height: 45px;
  border: 1px solid #e5e5e5;
  border-radius: 8px;
  padding: 0 15px;
  font-size: 14px;
  cursor: pointer;
}

.shop-sort-show {
  color: #666;
  font-size: 14px;
}

/* Product Grid */
.shop-item-wrap {
  margin-top: 30px;
}

.product-item {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s;
  box-shadow: 0 2px 15px rgba(0, 0, 0, 0.08);
  height: 100%;
  display: flex;
  flex-direction: column;
}

.product-item:hover {
  transform: translateY(-8px);
  box-shadow: 0 15px 35px rgba(14, 207, 224, 0.2);
}

/* Modern Product Card Design */
.product-img-wrapper {
  position: relative;
  overflow: hidden;
  border-radius: 12px 12px 0 0;
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

.badge-available {
  background: linear-gradient(135deg, #4ecdc4, #44a08d);
  color: #fff;
}

.badge-out {
  background: linear-gradient(135deg, #95a5a6, #7f8c8d);
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
}

.product-item:hover .product-overlay {
  opacity: 1;
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
  padding: 16px;
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

.empty-state .theme-btn {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 12px 30px;
  background: #0ecfe0;
  color: #fff;
  border-radius: 50px;
  font-weight: 600;
  text-decoration: none;
  border: none;
  cursor: pointer;
  transition: all 0.3s;
}

.empty-state .theme-btn:hover {
  background: #0bb5c4;
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(14, 207, 224, 0.3);
}

/* Pagination */
.pagination-area {
  margin-top: 50px;
  display: flex;
  justify-content: center;
}

.pagination {
  display: flex;
  list-style: none;
  padding: 0;
  margin: 0;
  gap: 10px;
}

.page-item {
  margin: 0;
}

.page-item.disabled .page-link {
  opacity: 0.5;
  pointer-events: none;
}

.page-item.active .page-link {
  background: linear-gradient(135deg, #0ecfe0, #17a2b8);
  color: #fff;
  border-color: #0ecfe0;
}

.page-link {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 45px;
  height: 45px;
  padding: 0 15px;
  background: #fff;
  color: #666;
  border: 1px solid #e5e5e5;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.3s;
}

.page-link:hover {
  background: #0ecfe0;
  color: #fff;
  border-color: #0ecfe0;
}

/* Responsive */
@media (max-width: 991px) {
  .shop-sidebar {
    position: static;
    margin-bottom: 30px;
  }
  
  .shop-sort {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .shop-sort-box {
    width: 100%;
    flex-direction: column;
    align-items: flex-start;
  }
  
  .shop-sort .select {
    width: 100%;
  }
}

@media (max-width: 767px) {
  .shop-area {
    padding: 60px 0;
  }
  
  .product-img {
    height: 220px;
  }
  
  .pagination {
    gap: 5px;
  }
  
  .page-link {
    min-width: 40px;
    height: 40px;
    font-size: 14px;
  }
}

@media (max-width: 575px) {
  .shop-widget {
    padding: 20px;
  }
  
  .banner-content {
    padding: 20px;
  }
  
  .banner-content h4 {
    font-size: 18px;
  }
}
</style>
