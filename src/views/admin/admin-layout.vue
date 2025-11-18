<template>
  <div class="admin-layout">
    <el-container style="min-height: 100vh">
      <!-- Sidebar -->
      <el-aside width="280px" class="sidebar">
        <div class="logo">
          <i class="fas fa-hospital-symbol"></i>
          <h2>MEDION ADMIN</h2>
          <p>Quản Trị Hệ Thống</p>
        </div>
        <el-menu
          :default-active="activeMenu"
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
          <el-menu-item index="/admin/hoadon">
            <i class="fas fa-receipt"></i>
            <span>Hóa Đơn</span>
          </el-menu-item>
          <el-menu-item index="/admin/kho">
            <i class="fas fa-warehouse"></i>
            <span>Kho Thuốc</span>
          </el-menu-item>
        </el-menu>
        
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
              <h3>Dashboard</h3>
              <div class="breadcrumb">
                <i class="fas fa-home"></i>
                <span>{{ currentPageName }}</span>
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
import { computed } from 'vue';
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
    '/admin/kho': 'Kho Thuốc'
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
}

.logo {
  padding: 30px 20px;
  text-align: center;
  color: #0d3d47;
  border-bottom: 2px solid rgba(13, 61, 71, 0.1);
  background: rgba(255, 255, 255, 0.3);
}

.logo i {
  font-size: 40px;
  color: #17a2b8;
  margin-bottom: 10px;
}

.logo h2 {
  margin: 10px 0 5px;
  font-size: 22px;
  font-weight: 700;
  letter-spacing: 1px;
}

.logo p {
  margin: 0;
  font-size: 12px;
  color: #0d3d47;
  opacity: 0.8;
  font-weight: 500;
}

.admin-menu {
  border: none;
  padding: 20px 10px;
  flex: 1;
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
  gap: 12px;
}

.admin-menu .el-menu-item i {
  font-size: 18px;
  width: 20px;
  text-align: center;
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

.header-left h3 {
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
