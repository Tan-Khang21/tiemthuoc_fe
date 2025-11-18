<template>
  <div class="user-layout">
    <!-- Header Area -->
    <header class="header">
      <!-- Header Top -->
      <div class="header-top">
        <div class="container">
          <div class="header-top-wrap">
            <div class="row">
              <div class="col-12 col-md-6 col-lg-6 col-xl-5">
                <div class="header-top-left">
                  <ul class="header-top-list">
                    <li><a href="mailto:info@example.com"><i class="far fa-envelopes"></i> info@example.com</a></li>
                    <li><a href="tel:+21236547898"><i class="far fa-headset"></i> +2 123 654 7898</a></li>
                    <li class="help"><a href="#"><i class="far fa-comment-question"></i> Cần hỗ trợ?</a></li>
                  </ul>
                </div>
              </div>
              <div class="col-12 col-md-6 col-lg-6 col-xl-7">
                <div class="header-top-right">
                  <ul class="header-top-list">
                    <li><a href="#"><i class="far fa-timer"></i> Ưu đãi hàng ngày</a></li>
                    <li>
                      <span>Theo dõi: </span>
                      <a href="#"><i class="fab fa-facebook"></i></a>
                      <a href="#"><i class="fab fa-x-twitter"></i></a>
                      <a href="#"><i class="fab fa-instagram"></i></a>
                      <a href="#"><i class="fab fa-linkedin"></i></a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- Header Top End -->

      <!-- Navbar -->
      <div class="main-navigation">
        <nav class="navbar navbar-expand-lg">
          <div class="container position-relative">
            <a class="navbar-brand" @click="$router.push('/user')" style="cursor: pointer;">
              <img src="@/assets/img/logo/logo.png" alt="logo" style="max-height: 50px;">
            </a>
            <div class="mobile-menu-right">
              <div class="mobile-menu-btn">
                <a href="#" class="nav-right-link search-box-outer"><i class="far fa-search"></i></a>
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
                  <a class="nav-link" :class="{ active: activeMenu === '5' }" @click="navigateTo('/user/profile')" style="cursor: pointer;">
                    <i class="far fa-user"></i> {{ authStore.user?.HoTen || 'Tài khoản' }}
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
                <a href="#" class="nav-right-link search-box-outer">
                  <i class="far fa-search"></i>
                </a>
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
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore, useCartStore } from '@/store';
import { ElMessage } from 'element-plus';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const cartStore = useCartStore();
const showMobileMenu = ref(false);

const activeMenu = computed(() => {
  const path = route.path;
  if (path === '/user') return '1';
  if (path === '/user/thuoc' || path.startsWith('/user/thuoc/')) return '2';
  if (path === '/user/cart') return '3';
  if (path === '/user/orders') return '4';
  if (path === '/user/profile') return '5';
  return '1';
});

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
}

.navbar-nav {
  gap: 5px;
}

.nav-link {
  color: #17181c;
  font-weight: 500;
  padding: 25px 18px;
  transition: all 0.3s;
  border-bottom: 3px solid transparent;
  display: flex;
  align-items: center;
  gap: 5px;
}

.nav-link:hover,
.nav-link.active {
  color: #0ecfe0;
  border-bottom-color: #0ecfe0;
}

.nav-right {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-left: 20px;
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

  .navbar-nav {
    flex-direction: column;
    gap: 0;
  }

  .nav-link {
    padding: 15px 0;
    border-bottom: 1px solid #f0f0f0;
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
