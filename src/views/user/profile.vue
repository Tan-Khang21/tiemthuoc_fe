<template>
  <div class="profile-page page-container">
    <h2>👤 Thông tin tài khoản</h2>

    <el-card v-if="authStore.user">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="Tên đăng nhập">
          {{ authStore.user.USERNAME }}
        </el-descriptions-item>
        <el-descriptions-item label="Họ tên">
          {{ authStore.user.HoTen || 'N/A' }}
        </el-descriptions-item>
        <el-descriptions-item label="Email">
          {{ authStore.user.EMAIL || 'N/A' }}
        </el-descriptions-item>
        <el-descriptions-item label="Số điện thoại">
          {{ authStore.user.DienThoai || 'N/A' }}
        </el-descriptions-item>
        <el-descriptions-item label="Địa chỉ" :span="2">
          {{ authStore.user.DiaChi || 'N/A' }}
        </el-descriptions-item>
        <el-descriptions-item label="Quyền">
          {{ authStore.user.QUYEN === 'admin' ? 'Quản trị viên' : 'Khách hàng' }}
        </el-descriptions-item>
      </el-descriptions>
    </el-card>

    <el-card v-else style="margin-top: 20px">
      <el-empty description="Vui lòng đăng nhập để xem thông tin">
        <el-button type="primary" @click="$router.push('/login')">
          Đăng nhập
        </el-button>
      </el-empty>
    </el-card>
  </div>
</template>

<script setup>
import { useAuthStore } from '@/store';

const authStore = useAuthStore();
</script>

<style scoped>
.profile-page {
  padding: 20px 0;
}
</style>
