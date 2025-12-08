<template>
  <div class="orders-page page-container">
    <h2>Đơn hàng của tôi</h2>

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
                <el-button 
                  v-if="order.trangThaiGiaoHang != -1 && order.trangThaiGiaoHang != -3"
                  type="success" 
                  size="small" 
                  @click="sendOrderEmail(order.maHD)" 
                  :loading="sendingEmailMap[order.maHD]"
                >
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
            <el-card v-for="order in paginatedHistoryOrders" :key="order.maHD" style="margin-bottom: 15px">
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
                <el-button 
                  v-if="order.trangThaiGiaoHang != -1 && order.trangThaiGiaoHang != -3"
                  type="success" 
                  size="small" 
                  @click="sendOrderEmail(order.maHD)" 
                  :loading="sendingEmailMap[order.maHD]"
                >
                  <i class="far fa-envelope"></i> Gửi Email
                </el-button>
              </div>
            </el-card>
            
            <!-- Pagination -->
            <div class="pagination-container">
              <el-pagination
                v-model:current-page="currentPage"
                v-model:page-size="pageSize"
                :page-sizes="[5, 10, 20, 50]"
                :total="historyOrders.length"
                layout="total, sizes, prev, pager, next, jumper"
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
              />
            </div>
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
      width="90%"
      top="5vh"
      class="compact-dialog"
    >
      <div v-loading="detailLoading">
        <div v-if="orderDetail">
          <!-- Thông tin hóa đơn -->
          <div class="invoice-section">
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
                <span class="info-label">Trạng thái:</span>
                <el-tag :type="getStatusType(orderDetail.invoice.trangThaiGiaoHang)" size="small">
                  {{ orderDetail.invoice.trangThaiGiaoHangName }}
                </el-tag>
              </div>
              <div class="info-item">
                <span class="info-label">Nhân viên:</span>
                <span class="info-value">{{ orderDetail.invoice.tenNV || 'Đơn online' }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Khách hàng:</span>
                <span class="info-value">{{ orderDetail.invoice.tenKH }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Điện thoại:</span>
                <span class="info-value">{{ orderDetail.invoice.dienThoaiKH }}</span>
              </div>
              <div class="info-item" :class="{ 'full-width': orderDetail.invoice.ghiChu }">
                <span class="info-label">Địa chỉ:</span>
                <span class="info-value">{{ orderDetail.invoice.diaChiKH }}</span>
              </div>
              <div class="info-item" v-if="orderDetail.invoice.ghiChu">
                <span class="info-label">Ghi chú:</span>
                <span class="info-value">{{ orderDetail.invoice.ghiChu }}</span>
              </div>
            </div>
          </div>

          <!-- Chi tiết sản phẩm -->
          <div class="product-section">
            <el-table :data="orderDetail.summary" border stripe size="small" max-height="350" class="compact-table">
              <el-table-column type="index" label="STT" width="50" align="center" />
              <el-table-column prop="tenThuoc" label="Tên thuốc" min-width="200" />
              <el-table-column prop="tenLoaiDonVi" label="ĐV" width="70" align="center">
                <template #default="{ row }">
                  {{ row.tenLoaiDonVi || 'N/A' }}
                </template>
              </el-table-column>
              <el-table-column prop="tongSoLuong" label="SL" width="60" align="center" />
              <el-table-column prop="donGiaTrungBinh" label="Đơn giá" width="110" align="right">
                <template #default="{ row }">
                  {{ formatPrice(row.donGiaTrungBinh) }}đ
                </template>
              </el-table-column>
              <el-table-column prop="tongThanhTien" label="Thành tiền" width="120" align="right">
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
        <div style="display: flex; justify-content: space-between; width: 100%">
          <div>
            <el-button 
              v-if="orderDetail && orderDetail.invoice.trangThaiGiaoHang === 0" 
              type="danger" 
              @click="cancelOrder" 
              :loading="cancelingOrder"
            >
              <i class="far fa-times-circle"></i> Hủy đơn hàng
            </el-button>
          </div>
          <div>
            <el-button @click="detailDialogVisible = false">Đóng</el-button>
            <el-button 
              v-if="orderDetail && orderDetail.invoice.trangThaiGiaoHang != -1 && orderDetail.invoice.trangThaiGiaoHang != -3"
              type="success" 
              @click="sendInvoiceToEmail" 
              :loading="sendingEmail"
            >
              <i class="far fa-envelope"></i> Gửi Email
            </el-button>
          </div>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';

const loading = ref(false);
const activeTab = ref('current');
const currentOrders = ref([]);
const historyOrders = ref([]);
const detailDialogVisible = ref(false);
const detailLoading = ref(false);
const orderDetail = ref(null);
const sendingEmail = ref(false);
const sendingEmailMap = ref({});
const cancelingOrder = ref(false);

// Pagination
const currentPage = ref(1);
const pageSize = ref(10);

// Computed property for paginated history orders
const paginatedHistoryOrders = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return historyOrders.value.slice(start, end);
});

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

const cancelOrder = async () => {
  if (!orderDetail.value || !orderDetail.value.invoice) {
    ElMessage.error('Không tìm thấy thông tin đơn hàng');
    return;
  }

  const maHD = orderDetail.value.invoice.maHD;
  const currentStatus = orderDetail.value.invoice.trangThaiGiaoHang;

  if (currentStatus !== 0) {
    ElMessage.warning('Chỉ có thể hủy đơn hàng ở trạng thái "Đã đặt"');
    return;
  }

  try {
    await ElMessageBox.confirm(
      'Bạn có chắc chắn muốn hủy đơn hàng này?',
      'Xác nhận hủy đơn',
      {
        confirmButtonText: 'Hủy đơn',
        cancelButtonText: 'Không',
        type: 'warning',
      }
    );

    cancelingOrder.value = true;

    const response = await fetch('https://localhost:7283/api/HoaDon/UpdateStatus', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        maHD: maHD,
        trangThaiGiaoHang: -1
      })
    });

    const result = await response.json();

    if (result.status === 1) {
      ElMessage.success('Đã hủy đơn hàng thành công');
      
      // Gửi email thông báo hủy đơn hàng
      try {
        const emailResponse = await fetch(`https://localhost:7283/api/HoaDon/SendToCustomer/${maHD}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (emailResponse.ok) {
          ElMessage.success('Đã gửi email thông báo hủy đơn hàng');
        } else {
          console.warn('Không thể gửi email thông báo');
        }
      } catch (emailError) {
        console.error('Send email error:', emailError);
        // Không hiển thị lỗi email cho người dùng vì đơn hàng đã được hủy thành công
      }
      
      detailDialogVisible.value = false;
      await loadOrders(); // Reload danh sách đơn hàng
    } else {
      ElMessage.error(result.message || 'Không thể hủy đơn hàng');
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Cancel order error:', error);
      ElMessage.error('Có lỗi xảy ra khi hủy đơn hàng');
    }
  } finally {
    cancelingOrder.value = false;
  }
};

const getStatusText = (status) => {
  const statusMap = {
    '-1': 'Đã hủy',
    '0': 'Đã đặt',
    '1': 'Đã xác nhận',
    '2': 'Đã giao',
    '3': 'Đã nhận',
  };
  return statusMap[status] || 'Đã hủy';
};

const getStatusType = (status) => {
  const typeMap = {
    '-1': 'danger',
    '0': 'warning',
    '1': 'primary',
    '2': 'info',
    '3': 'success',
  };
  return typeMap[status] || 'danger';
};

const handleSizeChange = (val) => {
  pageSize.value = val;
  currentPage.value = 1; // Reset to first page when changing page size
};

const handleCurrentChange = (val) => {
  currentPage.value = val;
};
</script>

<style scoped>
.orders-page {
  padding: 20px 0;
}

/* Compact Dialog */
:deep(.compact-dialog .el-dialog) {
  max-height: 90vh;
  display: flex;
  flex-direction: column;
}

:deep(.compact-dialog .el-dialog__body) {
  padding: 8px 15px;
  overflow: visible;
  flex: 1;
}

:deep(.compact-dialog .el-dialog__header) {
  padding: 12px 15px;
  margin-bottom: 0;
}

:deep(.compact-dialog .el-dialog__footer) {
  padding: 10px 15px;
  margin-top: 0;
}

/* Section Titles */
.section-title {
  font-size: 13px;
  font-weight: 600;
  color: #333;
  margin-bottom: 6px;
  padding-bottom: 4px;
  border-bottom: 1px solid #e5e5e5;
}

/* Invoice Section */
.invoice-section {
  background: #f8f9fa;
  padding: 8px 10px;
  border-radius: 4px;
  margin-bottom: 8px;
  border: 1px solid #e5e5e5;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 6px 10px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.info-item.full-width {
  grid-column: 1 / -1;
}

.info-label {
  font-size: 11px;
  color: #666;
  font-weight: 500;
  white-space: nowrap;
}

.info-value {
  font-size: 12px;
  color: #333;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Product Section */
.product-section {
  background: #fff;
  padding: 0;
  border-radius: 4px;
  margin-bottom: 8px;
  border: 1px solid #e5e5e5;
}

/* Compact Table */
:deep(.compact-table) {
  font-size: 12px;
}

:deep(.compact-table .el-table__cell) {
  padding: 4px 0;
}

:deep(.compact-table .el-table__header .el-table__cell) {
  background-color: #f5f7fa;
  font-weight: 600;
  padding: 6px 0;
}

:deep(.compact-table .el-table__body-wrapper) {
  max-height: 350px;
}

/* Total Section */
.total-section {
  background: #e8f5e9;
  padding: 8px 12px;
  border-radius: 4px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border: 1px solid #4caf50;
}

.total-label {
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.total-amount {
  font-size: 18px;
  font-weight: 700;
  color: #2e7d32;
}

/* Pagination */
.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
  padding: 20px 0;
}

/* Responsive */
@media (max-width: 1024px) {
  .info-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .info-grid {
    grid-template-columns: 1fr;
  }
  
  .info-item {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .total-section {
    flex-direction: column;
    gap: 6px;
  }
  
  .pagination-container {
    padding: 15px 0;
  }
  
  :deep(.compact-dialog) {
    width: 95% !important;
  }
}
</style>
