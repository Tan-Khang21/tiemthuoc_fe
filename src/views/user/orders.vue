<template>
  <div class="orders-page page-container">
    <h2>📦 Đơn hàng của tôi</h2>

    <el-tabs v-model="activeTab">
      <el-tab-pane label="Đơn hàng hiện tại" name="current">
        <div v-loading="loading">
          <div v-if="currentOrders.length > 0">
            <el-card v-for="order in currentOrders" :key="order.maHD" style="margin-bottom: 15px">
              <template #header>
                <div style="display: flex; justify-content: space-between">
                  <span><strong>Mã ĐH:</strong> {{ order.maHD }}</span>
                  <el-tag :type="getStatusType(order.trangThaiGiaoHang)">
                    {{ getStatusText(order.trangThaiGiaoHang) }}
                  </el-tag>
                </div>
              </template>
              <p><strong>Ngày đặt:</strong> {{ formatDate(order.ngayLap) }}</p>
              <p><strong>Tổng tiền:</strong> {{ formatPrice(order.tongTien) }}đ</p>
              <p v-if="order.ghiChu"><strong>Ghi chú:</strong> {{ order.ghiChu }}</p>
            </el-card>
          </div>
          <el-empty v-else description="Không có đơn hàng nào" />
        </div>
      </el-tab-pane>

      <el-tab-pane label="Lịch sử đơn hàng" name="history">
        <div v-loading="loading">
          <div v-if="historyOrders.length > 0">
            <el-card v-for="order in historyOrders" :key="order.maHD" style="margin-bottom: 15px">
              <template #header>
                <div style="display: flex; justify-content: space-between">
                  <span><strong>Mã ĐH:</strong> {{ order.maHD }}</span>
                  <el-tag :type="getStatusType(order.trangThaiGiaoHang)">
                    {{ getStatusText(order.trangThaiGiaoHang) }}
                  </el-tag>
                </div>
              </template>
              <p><strong>Ngày đặt:</strong> {{ formatDate(order.ngayLap) }}</p>
              <p><strong>Tổng tiền:</strong> {{ formatPrice(order.tongTien) }}đ</p>
              <p v-if="order.ghiChu"><strong>Ghi chú:</strong> {{ order.ghiChu }}</p>
            </el-card>
          </div>
          <el-empty v-else description="Không có lịch sử đơn hàng" />
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '@/api';
import { useAuthStore } from '@/store';
import { ElMessage } from 'element-plus';

const authStore = useAuthStore();

const loading = ref(false);
const activeTab = ref('current');
const currentOrders = ref([]);
const historyOrders = ref([]);

onMounted(async () => {
  if (authStore.user && authStore.user.MAKH) {
    await loadOrders();
  }
});

const loadOrders = async () => {
  loading.value = true;
  try {
    const response = await api.hoadon.getHistoryByKhachHang(authStore.user.MAKH);
    currentOrders.value = response.data?.Current || [];
    historyOrders.value = response.data?.History || [];
  } catch (error) {
    console.error('Load orders error:', error);
    ElMessage.error('Lỗi khi tải danh sách đơn hàng');
  } finally {
    loading.value = false;
  }
};

const formatDate = (dateStr) => {
  return new Date(dateStr).toLocaleString('vi-VN');
};

const formatPrice = (price) => {
  return new Intl.NumberFormat('vi-VN').format(price);
};

const getStatusText = (status) => {
  const statusMap = {
    '-1': 'Đã hủy',
    '0': 'Đã đặt',
    '1': 'Đã xác nhận',
    '2': 'Đã giao',
    '3': 'Đã nhận',
  };
  return statusMap[status] || 'Không xác định';
};

const getStatusType = (status) => {
  const typeMap = {
    '-1': 'danger',
    '0': 'warning',
    '1': 'primary',
    '2': 'info',
    '3': 'success',
  };
  return typeMap[status] || '';
};
</script>

<style scoped>
.orders-page {
  padding: 20px 0;
}
</style>
