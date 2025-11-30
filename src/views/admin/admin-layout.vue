<template>
  <div class="admin-layout" :class="{ 'sidebar-collapsed': collapsed }" :style="{ '--sidebar-width': sidebarWidth }">
    <el-container style="min-height: 100vh">
      <!-- Sidebar -->
      <el-aside :width="sidebarWidth" :class="['sidebar', { collapsed }]">
        <el-tooltip placement="right" effect="dark">
          <template #content>
            <div style="text-align:left; line-height:1.2">
              <strong style="display:block; font-size:14px; color:#0d3d47">MEDION ADMIN</strong>
              <span style="font-size:12px; color:#6c757d">Quản Trị Hệ Thống</span>
            </div>
          </template>
          <div class="logo logo-with-img" slot="reference">
            <img class="logo-img" :src="logoImage" alt="Medion Logo" />
            <h2>MEDION ADMIN</h2>
            <p>Quản Trị Hệ Thống</p>
          </div>
        </el-tooltip>
        <div class="menu-list">
          <el-menu
            :default-active="activeMenu"
            :default-openeds="['sub-tonghop']"
            :unique-opened="false"
            class="admin-menu"
            background-color="transparent"
            text-color="#0d3d47"
            active-text-color="#17a2b8"
            router
          >
            <el-menu-item index="/admin/thuoc">
              <i class="fas fa-pills"></i>
              <span>Quản Lý Thuốc</span>
            </el-menu-item>
            <el-menu-item index="/admin/nhacungcap">
              <i class="fas fa-building"></i>
              <span>Nhà Cung Cấp</span>
            </el-menu-item>
            <el-menu-item index="/admin/phieunhap">
              <i class="fas fa-file-import"></i>
              <span>Phiếu Nhập</span>
            </el-menu-item>
            <el-menu-item index="/admin/binhluan">
              <i class="fas fa-comments"></i>
              <span>Bình Luận</span>
            </el-menu-item>
            <!-- Hóa Đơn submenu: Hóa đơn / Xử lý hóa đơn online -->
            <div class="menu-item-custom" @click="hoadonOpen = !hoadonOpen" style="margin-bottom:6px">
              <i class="fas fa-receipt"></i>
              <span>Hóa Đơn</span>
              <i :class="['fas', hoadonOpen ? 'fa-chevron-up' : 'fa-chevron-down']" style="margin-left: auto"></i>
            </div>
            <div v-show="hoadonOpen" class="custom-submenu">
              <div
                class="submenu-item"
                :class="{ 'is-active': activeMenu === '/admin/hoadon' }"
                @click="goToPage('/admin/hoadon')"
              >
                <i class="fas fa-file-invoice"></i>
                <span>Hóa đơn</span>
              </div>
              <div
                class="submenu-item"
                :class="{ 'is-active': activeMenu === '/admin/hoadon/online' }"
                @click="goToPage('/admin/hoadon/online')"
              >
                <i class="fas fa-globe"></i>
                <span>Xử lý hóa đơn online</span>
              </div>
            </div>
            <!-- Kho Thuốc with submenu: Kho Thuốc / Quy đổi / Hủy thuốc -->
            <div class="menu-item-custom" @click="khoOpen = !khoOpen" style="margin-bottom:6px">
              <i class="fas fa-warehouse"></i>
              <span>Kho Thuốc</span>
              <i :class="['fas', khoOpen ? 'fa-chevron-up' : 'fa-chevron-down']" style="margin-left: auto"></i>
            </div>
            <div v-show="khoOpen" class="custom-submenu">
              <div
                class="submenu-item"
                :class="{ 'is-active': activeMenu === '/admin/kho' }"
                @click="goToPage('/admin/kho')"
              >
                <i class="fas fa-boxes"></i>
                <span>Kho Thuốc</span>
              </div>
              <div
                class="submenu-item"
                :class="{ 'is-active': activeMenu === '/admin/quydoi' }"
                @click="goToPage('/admin/quydoi')"
              >
                <i class="fas fa-exchange-alt"></i>
                <span>Quy đổi</span>
              </div>
              <div
                class="submenu-item"
                :class="{ 'is-active': activeMenu === '/admin/thuoc-can-xu-ly' }"
                @click="goToPage('/admin/thuoc-can-xu-ly')"
              >
                <i class="fas fa-exclamation-triangle"></i>
                <span>Thuốc cần xử lý</span>
              </div>
              <div
                class="submenu-item"
                :class="{ 'is-active': activeMenu === '/admin/huythuoc' }"
                @click="goToPage('/admin/huythuoc')"
              >
                <i class="fas fa-trash-alt"></i>
                <span>Hủy thuốc</span>
              </div>
            </div>
          </el-menu>

          <!-- Custom Tổng Hợp toggle placed under Kho Thuốc -->
          <div class="menu-item-custom" @click="toggleSummary" style="margin-bottom:6px">
            <i class="fas fa-chart-pie"></i>
            <span>Tổng Hợp</span>
            <i :class="['fas', summaryOpen ? 'fa-chevron-up' : 'fa-chevron-down']" style="margin-left: auto"></i>
          </div>

          <!-- Custom submenu items -->
          <div v-show="summaryOpen" class="custom-submenu">
            <div
              class="submenu-item"
              :class="{ 'is-active': activeMenu === '/admin/lieudung' }"
              @click="goToPage('/admin/lieudung')"
            >
              <i class="fas fa-capsules"></i>
              <span>Liều dùng</span>
            </div>
            <div
              class="submenu-item"
              :class="{ 'is-active': activeMenu === '/admin/loaidonvi' }"
              @click="goToPage('/admin/loaidonvi')"
            >
              <i class="fas fa-layer-group"></i>
              <span>Loại đơn vị</span>
            </div>
            <div
              class="submenu-item"
              :class="{ 'is-active': activeMenu === '/admin/loaithuoc' }"
              @click="goToPage('/admin/loaithuoc')"
            >
              <i class="fas fa-tags"></i>
              <span>Loại thuốc</span>
            </div>
            <div
              class="submenu-item"
              :class="{ 'is-active': activeMenu === '/admin/nhomloai' }"
              @click="goToPage('/admin/nhomloai')"
            >
              <i class="fas fa-sitemap"></i>
              <span>Nhóm loại</span>
            </div>
          </div>
        </div>
          <div class="sidebar-footer">
            <div class="user-info">
              <div class="avatar">
                <i class="fas fa-user-shield"></i>
              </div>
              <div class="user-details">
                <p class="user-name">{{ authStore.user?.TenDangNhap || 'Admin' }}</p>
                <p class="user-role">Quản Trị Viên</p>
              </div>
            </div>
          </div>
      </el-aside>

      <!-- Main Content -->
      <el-container>
        <el-header class="header" height="70px">
          <div class="header-content">
            <div class="header-left">
              <el-button class="collapse-toggle" type="text" @click="toggleCollapse">
                <i class="fas fa-bars"></i>
              </el-button>
              <div class="header-title">
                <h3>Dashboard</h3>
                <div class="breadcrumb">
                  <i class="fas fa-home"></i>
                  <span>{{ currentPageName }}</span>
                </div>
              </div>
            </div>
            <div class="header-right">
              <el-button class="btn-user" @click="goToUser">
                <i class="fas fa-store"></i>
                Trang Khách Hàng
              </el-button>
              <el-button class="btn-logout" @click="handleLogout">
                <i class="fas fa-sign-out-alt"></i>
                Đăng Xuất
              </el-button>
            </div>
          </div>
        </el-header>

        <el-main class="main-content">
          <router-view />
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import logoImg from '@/assets/img/logo/logo.png';
// Load logo images from `src/assets/img/logo/` if present.
const logoModules = import.meta.glob('../../assets/img/logo/*', { eager: true, as: 'url' });
const logoList = Object.values(logoModules || {});
const logoImage = logoList.length ? logoList[0] : logoImg;
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/store';
import { ElMessage } from 'element-plus';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const activeMenu = computed(() => route.path);

const currentPageName = computed(() => {
  const names = {
    '/admin/thuoc': 'Quản Lý Thuốc',
    '/admin/nhacungcap': 'Nhà Cung Cấp',
    '/admin/phieunhap': 'Phiếu Nhập',
    '/admin/hoadon': 'Hóa Đơn',
    '/admin/kho': 'Kho Thuốc',
        '/admin/nhomloai': 'Nhóm Loại',
    '/admin/lieudung': 'Liều Dùng',
    '/admin/loaidonvi': 'Loại Đơn Vị',
    '/admin/loaithuoc': 'Loại Thuốc',
    '/admin/thuoc-can-xu-ly': 'Thuốc cần xử lý',
    '/admin/binhluan': 'Bình Luận & Hỏi Đáp'
  };
  return names[route.path] || 'Admin';
});

const goToUser = () => {
  router.push('/user');
};

const handleLogout = () => {
  authStore.logout();
  ElMessage.success('Đã đăng xuất');
  router.push('/login');
};

// Sidebar collapse state
const collapsed = ref(false);
const sidebarWidth = computed(() => (collapsed.value ? '70px' : '280px'));
const toggleCollapse = () => {
  collapsed.value = !collapsed.value;
};

// Summary toggle state
const summaryOpen = ref(false); // Hidden by default
const toggleSummary = () => {
  summaryOpen.value = !summaryOpen.value;
  console.log('Toggle summary clicked, summaryOpen is now:', summaryOpen.value);
};

// Kho submenu state
const khoOpen = ref(false);

// Hoá Đơn submenu state
const hoadonOpen = ref(false);

const goToPage = (path) => {
  router.push(path);
};
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.admin-layout {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

/* Sidebar */
.sidebar {
  background: linear-gradient(180deg, #c8e9ee 0%, #a8dde6 100%);
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  transition: width 260ms cubic-bezier(.4,0,.2,1);
  overflow-y: auto;
}

.logo {
  padding: 20px 10px;
  text-align: center;
  color: #0d3d47;
  border-bottom: 2px solid rgba(13, 61, 71, 0.1);
  background: rgba(255, 255, 255, 0.3);
  transition: padding 260ms cubic-bezier(.4,0,.2,1), border 260ms ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.sidebar.collapsed .logo {
  /* remove horizontal padding so content centers exactly inside narrow sidebar */
  padding: 14px 0;
  border-bottom: none;
  justify-content: center;
  align-items: center;
  text-align: center;
}

.logo i {
  font-size: 40px;
  color: #17a2b8;
  margin-bottom: 10px;
}

.logo-img {
  display: block;
  width: 72px;
  height: 72px;
  object-fit: contain;
  margin: 0 auto 12px;
  transition: width 260ms cubic-bezier(.4,0,.2,1), margin 260ms cubic-bezier(.4,0,.2,1);
}

.sidebar.collapsed .logo-img {
  width: 44px;
  height: 44px;
  margin: 0 auto 4px;
}

.logo h2 {
  margin: 10px 0 5px;
  font-size: 22px;
  font-weight: 700;
  letter-spacing: 1px;
  display: inline-block;
  transition: opacity 220ms ease, transform 220ms ease, max-width 260ms ease;
}

.logo p {
  margin: 0;
  font-size: 12px;
  color: #0d3d47;
  opacity: 0.8;
  font-weight: 500;
  transition: opacity 220ms ease, transform 220ms ease, max-width 260ms ease;
}

.collapse-btn {
  position: absolute;
  right: 10px;
  top: 12px;
  width: 34px;
  height: 34px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #0d3d47;
}

.sidebar.collapsed .logo h2,
.sidebar.collapsed .logo p,
.sidebar.collapsed .admin-menu span,
.sidebar.collapsed .menu-item-custom span,
.sidebar.collapsed .sidebar-footer {
  opacity: 0;
  transform: translateX(-6px);
  /* keep inline-block so opacity transition works; limit width for animation */
  max-width: 0;
  overflow: hidden;
  position: absolute;
  pointer-events: none;
}

.sidebar.collapsed .logo i {
  margin-bottom: 0;
}

.sidebar.collapsed .admin-menu .el-menu-item {
  justify-content: center;
  padding-left: 0;
  padding-right: 0;
}

.sidebar.collapsed .admin-menu .el-menu-item i {
  margin-right: 0;
}

.sidebar.collapsed .menu-item-custom {
  justify-content: center;
  padding-left: 0;
  padding-right: 0;
}

.sidebar.collapsed .menu-item-custom i:first-child {
  margin-right: 0;
}

/* Header hamburger toggle */
.collapse-toggle {
  margin-right: 8px;
  width: 36px;
  height: 36px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  color: #0d3d47;
  padding-left: 4px;
}

.collapse-toggle i {
  font-size: 16px;
}

.admin-menu {
  border: none;
  padding: 0; /* padding moved to .menu-list */
}

.menu-list {
  flex: 1;
  padding: 20px 10px 0 10px;
  overflow: auto;
}

.admin-menu .el-menu-item {
  margin-bottom: 8px;
  border-radius: 12px;
  height: 50px;
  line-height: 50px;
  font-weight: 500;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  padding-left: 16px;
}

.admin-menu .el-menu-item i {
  font-size: 18px;
  width: 20px;
  text-align: center;
  margin-right: 4px;
}

.admin-menu .el-menu-item span {
  display: inline-block;
  white-space: nowrap;
  transition: opacity 220ms ease, transform 220ms ease, max-width 260ms ease;
  max-width: 240px;
  overflow: hidden;
}

.admin-menu .el-menu-item:hover {
  background: rgba(255, 255, 255, 0.5);
  transform: translateX(5px);
}

.admin-menu .el-menu-item.is-active {
  background: white;
  color: #17a2b8;
  box-shadow: 0 4px 12px rgba(23, 162, 184, 0.2);
  font-weight: 600;
}

.sidebar-footer {
  padding: 15px;
  border-top: 2px solid rgba(13, 61, 71, 0.1);
  background: rgba(255, 255, 255, 0.3);
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.avatar {
  width: 45px;
  height: 45px;
  background: linear-gradient(135deg, #17a2b8 0%, #138496 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.avatar i {
  font-size: 20px;
  color: white;
}

.user-details {
  flex: 1;
  min-width: 0;
}

.user-name {
  font-weight: 600;
  font-size: 14px;
  color: #0d3d47;
  margin: 0 0 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-role {
  font-size: 11px;
  color: #17a2b8;
  margin: 0;
  font-weight: 500;
}

/* Header */
.header {
  background: white;
  border-bottom: 2px solid #c8e9ee;
  padding: 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.header-content {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 30px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-title {
  display: flex;
  flex-direction: column;
}

.header-title h3 {
  margin: 0 0 5px;
  color: #0d3d47;
  font-size: 24px;
  font-weight: 700;
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #6c757d;
}

.breadcrumb i {
  color: #17a2b8;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.btn-user,
.btn-logout {
  height: 40px;
  padding: 0 20px;
  border-radius: 10px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
  border: none;
}

.btn-user {
  background: linear-gradient(135deg, #c8e9ee 0%, #a8dde6 100%);
  color: #0d3d47;
}

.btn-user:hover {
  background: linear-gradient(135deg, #a8dde6 0%, #88cdd8 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(168, 221, 230, 0.4);
}

.btn-logout {
  background: linear-gradient(135deg, #17a2b8 0%, #138496 100%);
  color: white;
}

.btn-logout:hover {
  background: linear-gradient(135deg, #138496 0%, #0f6b7a 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(23, 162, 184, 0.4);
}

/* Main Content */
.main-content {
  background: #f5f7fa;
  padding: 25px;
  min-height: calc(100vh - 70px);
}

/* Custom menu item styling - match Element Plus menu item */
.menu-item-custom {
  height: 50px;
  line-height: 50px;
  display: flex;
  align-items: center;
  padding: 0 20px 0 12px;
  margin: 0 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
  color: #0d3d47;
  border-radius: 12px;
  position: relative;
  box-sizing: border-box;
}

.menu-item-custom:hover {
  background: rgba(255, 255, 255, 0.5);
  color: #17a2b8;
  transform: translateX(5px);
}

.menu-item-custom i:first-child {
  font-size: 18px;
  width: 20px;
  text-align: center;
  margin-right: 4px;
  display: inline-block;
}

.menu-item-custom span {
  flex: 1;
  font-size: 15px;
  line-height: normal;
}

.menu-item-custom i:last-child {
  font-size: 12px;
  margin-left: auto;
  transition: transform 0.3s ease;
}

.custom-submenu {
  padding: 0;
  margin: -5px 10px 0 10px;
  background: rgba(255, 255, 255, 0.1);
  border-left: 3px solid #17a2b8;
  margin-left: 30px;
  border-radius: 0 8px 8px 0;
  padding-right: 0;
}

.submenu-item {
  height: 45px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 20px;
  margin: 4px 0;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.2);
  color: #0d3d47;
}

.submenu-item:hover {
  background: rgba(255, 255, 255, 0.6);
  color: #17a2b8;
  transform: translateX(5px);
}

/* active style for submenu items to match el-menu-item.is-active */
.submenu-item.is-active {
  background: white;
  color: #17a2b8;
  box-shadow: 0 4px 12px rgba(23, 162, 184, 0.2);
  font-weight: 600;
}

.submenu-item.is-active i {
  color: #17a2b8;
}

.submenu-item i {
  font-size: 16px;
  width: 18px;
  text-align: center;
}

.submenu-item span {
  font-size: 14px;
}

/* Responsive */
@media (max-width: 768px) {
  .sidebar {
    width: 70px !important;
  }
  
  .logo h2,
  .logo p,
  .admin-menu span,
  .sidebar-footer {
    display: none;
  }
  
  .admin-menu .el-menu-item {
    justify-content: center;
  }
  
  .header-left h3 {
    font-size: 18px;
  }
  
  .breadcrumb {
    display: none;
  }
}
</style>

<!-- Global overrides to fix top-gap when scrolling -->
<style>
/* Quick global override to prevent unexpected top gap when scrolling */
html, body, #app {
  padding-top: 0 !important;
  margin: 0 !important;
}
body[style] {
  padding-top: 0 !important;
  margin-top: 0 !important;
}
/* Keep theme navbar fixed when needed, but make admin header sticky
   so toggling classes doesn't remove it from document flow and cause
   a gap/slide effect when the page is overscrolled. */
.navbar.fixed-top {
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  right: 0 !important;
  z-index: 1030 !important;
}

/* Admin header: use sticky so it remains in flow and won't create gaps */
.header {
  position: sticky;
  top: 0;
  z-index: 1030;
  background: white; /* ensure background covers content when sticky */
}

.header.fixed-top {
  /* if JS toggles .fixed-top, keep header sticky instead of changing to fixed */
  position: sticky !important;
  top: 0 !important;
}
/* Prevent transform-based scroll wrappers from displaying a visible gap */
html, body {
  transform: none !important;
}
</style>
