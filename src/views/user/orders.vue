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
              <div style="margin-top: 10px; display: flex; gap: 10px">
                <el-button type="primary" size="small" @click="viewOrderDetail(order.maHD)">
                  <i class="far fa-eye"></i> Xem chi tiết
                </el-button>
                <el-button type="success" size="small" @click="sendOrderEmail(order.maHD)" :loading="sendingEmailMap[order.maHD]">
                  <i class="far fa-envelope"></i> Gửi Email
                </el-button>
              </div>
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
              <div style="margin-top: 10px; display: flex; gap: 10px">
                <el-button type="primary" size="small" @click="viewOrderDetail(order.maHD)">
                  <i class="far fa-eye"></i> Xem chi tiết
                </el-button>
                <el-button type="success" size="small" @click="sendOrderEmail(order.maHD)" :loading="sendingEmailMap[order.maHD]">
                  <i class="far fa-envelope"></i> Gửi Email
                </el-button>
              </div>
            </el-card>
          </div>
          <el-empty v-else description="Không có lịch sử đơn hàng" />
        </div>
      </el-tab-pane>
    </el-tabs>

    <!-- Dialog chi tiết hóa đơn -->
    <el-dialog
      v-model="detailDialogVisible"
      title="Chi tiết hóa đơn"
      :close-on-click-modal="false"
      width="900px"
    >
      <div v-loading="detailLoading">
        <div v-if="orderDetail">
          <!-- Thông tin hóa đơn -->
          <div class="invoice-section">
            <h3 class="section-title">Thông tin đơn hàng</h3>
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">Mã hóa đơn:</span>
                <span class="info-value">{{ orderDetail.invoice.maHD }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Ngày lập:</span>
                <span class="info-value">{{ formatDate(orderDetail.invoice.ngayLap) }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Khách hàng:</span>
                <span class="info-value">{{ orderDetail.invoice.tenKH }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Điện thoại:</span>
                <span class="info-value">{{ orderDetail.invoice.dienThoaiKH }}</span>
              </div>
              <div class="info-item full-width">
                <span class="info-label">Địa chỉ:</span>
                <span class="info-value">{{ orderDetail.invoice.diaChiKH }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Trạng thái:</span>
                <el-tag :type="getStatusType(orderDetail.invoice.trangThaiGiaoHang)">
                  {{ orderDetail.invoice.trangThaiGiaoHangName }}
                </el-tag>
              </div>
              <div class="info-item">
                <span class="info-label">Nhân viên:</span>
                <span class="info-value">{{ orderDetail.invoice.tenNV || 'Đơn online' }}</span>
              </div>
              <div class="info-item full-width" v-if="orderDetail.invoice.ghiChu">
                <span class="info-label">Ghi chú:</span>
                <span class="info-value">{{ orderDetail.invoice.ghiChu }}</span>
              </div>
            </div>
          </div>

          <!-- Chi tiết sản phẩm -->
          <div class="product-section">
            <h3 class="section-title">Chi tiết sản phẩm</h3>
            <el-table :data="orderDetail.summary" border stripe>
              <el-table-column type="index" label="STT" width="60" align="center" />
              <el-table-column prop="tenThuoc" label="Tên thuốc" min-width="200" />
              <el-table-column prop="tenLoaiDonVi" label="Đơn vị" width="100" align="center">
                <template #default="{ row }">
                  {{ row.tenLoaiDonVi || 'N/A' }}
                </template>
              </el-table-column>
              <el-table-column prop="tongSoLuong" label="Số lượng" width="100" align="center" />
              <el-table-column prop="donGiaTrungBinh" label="Đơn giá" width="130" align="right">
                <template #default="{ row }">
                  {{ formatPrice(row.donGiaTrungBinh) }}đ
                </template>
              </el-table-column>
              <el-table-column prop="tongThanhTien" label="Thành tiền" width="150" align="right">
                <template #default="{ row }">
                  <strong>{{ formatPrice(row.tongThanhTien) }}đ</strong>
                </template>
              </el-table-column>
            </el-table>
          </div>

          <!-- Tổng tiền -->
          <div class="total-section">
            <span class="total-label">Tổng cộng:</span>
            <span class="total-amount">{{ formatPrice(orderDetail.invoice.tongTien) }}đ</span>
          </div>
        </div>
      </div>

      <template #footer>
        <el-button @click="detailDialogVisible = false">Đóng</el-button>
        <el-button type="success" @click="sendInvoiceToEmail" :loading="sendingEmail">
          <i class="far fa-envelope"></i> Gửi qua Email
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { ElMessage } from 'element-plus';

const loading = ref(false);
const activeTab = ref('current');
const currentOrders = ref([]);
const historyOrders = ref([]);
const detailDialogVisible = ref(false);
const detailLoading = ref(false);
const orderDetail = ref(null);
const sendingEmail = ref(false);
const sendingEmailMap = ref({});

onMounted(async () => {
  await loadOrders();
});

const loadOrders = async () => {
  loading.value = true;
  try {
    // Lấy mã khách hàng từ localStorage
    const userData = localStorage.getItem('user');
    if (!userData) {
      ElMessage.warning('Vui lòng đăng nhập để xem đơn hàng');
      loading.value = false;
      return;
    }

    const user = JSON.parse(userData);
    const maKH = user.MaKH || user.maKH;

    if (!maKH) {
      ElMessage.error('Không tìm thấy thông tin khách hàng');
      loading.value = false;
      return;
    }

    console.log('Loading orders for:', maKH);
    
    const response = await fetch(`https://localhost:7283/api/HoaDon/HistoryByKhachHang/${maKH}`);
    const result = await response.json();
    
    console.log('Orders result:', result);
    
    if (result.status === 1) {
      currentOrders.value = result.data?.current || [];
      historyOrders.value = result.data?.history || [];
    } else {
      ElMessage.error(result.message || 'Lỗi khi tải danh sách đơn hàng');
    }
  } catch (error) {
    console.error('Load orders error:', error);
    ElMessage.error('Lỗi khi tải danh sách đơn hàng');
  } finally {
    loading.value = false;
  }
};

const viewOrderDetail = async (maHD) => {
  detailDialogVisible.value = true;
  detailLoading.value = true;
  orderDetail.value = null;

  try {
    const response = await fetch(`https://localhost:7283/api/HoaDon/ChiTiet/Summary/${maHD}`);
    const result = await response.json();
    
    console.log('Order detail result:', result);
    
    if (result.status === 1 && result.data) {
      orderDetail.value = result.data;
    } else {
      ElMessage.error(result.message || 'Lỗi khi tải chi tiết hóa đơn');
      detailDialogVisible.value = false;
    }
  } catch (error) {
    console.error('Load order detail error:', error);
    ElMessage.error('Lỗi khi tải chi tiết hóa đơn');
    detailDialogVisible.value = false;
  } finally {
    detailLoading.value = false;
  }
};

const sendInvoiceToEmail = async () => {
  if (!orderDetail.value || !orderDetail.value.invoice) {
    ElMessage.error('Không tìm thấy thông tin hóa đơn');
    return;
  }

  const maHD = orderDetail.value.invoice.maHD;
  sendingEmail.value = true;

  try {
    const response = await fetch(`https://localhost:7283/api/HoaDon/SendToCustomer/${maHD}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'accept': '*/*'
      }
    });

    const result = await response.json();
    console.log('Send email result:', result);

    if (result.status === 1) {
      ElMessage.success('Đã gửi hóa đơn qua email thành công!');
    } else {
      ElMessage.error(result.message || 'Lỗi khi gửi email');
    }
  } catch (error) {
    console.error('Send email error:', error);
    ElMessage.error('Lỗi khi gửi email. Vui lòng thử lại sau.');
  } finally {
    sendingEmail.value = false;
  }
};

const sendOrderEmail = async (maHD) => {
  sendingEmailMap.value[maHD] = true;

  try {
    const response = await fetch(`https://localhost:7283/api/HoaDon/SendToCustomer/${maHD}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'accept': '*/*'
      }
    });

    const result = await response.json();
    console.log('Send email result:', result);

    if (result.status === 1) {
      ElMessage.success('Đã gửi hóa đơn qua email thành công!');
    } else {
      ElMessage.error(result.message || 'Lỗi khi gửi email');
    }
  } catch (error) {
    console.error('Send email error:', error);
    ElMessage.error('Lỗi khi gửi email. Vui lòng thử lại sau.');
  } finally {
    sendingEmailMap.value[maHD] = false;
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

/* Section Titles */
.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 2px solid #e5e5e5;
}

/* Invoice Section */
.invoice-section {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  border: 1px solid #e5e5e5;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.info-item.full-width {
  grid-column: 1 / -1;
}

.info-label {
  font-size: 13px;
  color: #666;
  font-weight: 500;
}

.info-value {
  font-size: 14px;
  color: #333;
  font-weight: 600;
}

/* Product Section */
.product-section {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  border: 1px solid #e5e5e5;
}

/* Total Section */
.total-section {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border: 1px solid #e5e5e5;
}

.total-label {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.total-amount {
  font-size: 24px;
  font-weight: 700;
  color: #0ecfe0;
}

/* Responsive */
@media (max-width: 768px) {
  .info-grid {
    grid-template-columns: 1fr;
  }
  
  .total-section {
    flex-direction: column;
    gap: 10px;
  }
}
</style>
