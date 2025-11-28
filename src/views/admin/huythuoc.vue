<template>
  <el-card>
    <div class="page-header">
      <h3> Danh sách phiếu huỷ</h3>
      <p class="subtitle">Danh sách các phiếu huỷ đã tạo</p>
    </div>

    <div style="margin-top:12px; display:flex; gap:12px; align-items:center">
      <el-button type="primary" size="small" @click="fetchPhieuHuy">Tải lại</el-button>
      <el-button size="small" @click="() => { phieuHuyItems = []; }">Xóa bộ nhớ</el-button>
      <div style="margin-left:auto; color:var(--el-text-color-secondary)">Tổng: {{ phieuHuyItems.length }}</div>
    </div>

    <div style="margin-top:12px">
      <el-table :data="phieuHuyItems" stripe v-loading="loading" style="width:100%">
        <el-table-column prop="MaPH" label="Mã PH" width="220" />
        <el-table-column prop="MaPXH" label="Mã PXH" width="220" />
        <el-table-column prop="NgayHuy" label="Ngày huỷ" width="200">
          <template #default="{ row }">{{ formatDate(row.NgayHuy) }}</template>
        </el-table-column>
        <el-table-column prop="MaNV" label="Mã NV" width="140" />
        <el-table-column prop="NhanVienName" label="Người thực hiện" width="220" />
        <el-table-column prop="GhiChu" label="Ghi chú" min-width="240" />
        <el-table-column label="Hành động" width="140" align="center">
          <template #default="{ row }">
            <el-button size="small" @click="() => openDetail(row)">Chi tiết</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-dialog v-model="detailDialog" title="Chi tiết phiếu huỷ" width="60%">
      <div v-if="detailLoading" style="padding:20px; text-align:center; color:#666">Đang tải...</div>
      <div v-else-if="detailItem">
        <el-descriptions column="2" border>
          <el-descriptions-item label="Mã PH">{{ detailItem.MaPH || detailItem.MaPh || detailItem.MaPH }}</el-descriptions-item>
          <el-descriptions-item label="Mã PXH">{{ detailItem.MaPXH || detailItem.MaPxh || '' }}</el-descriptions-item>
          <el-descriptions-item label="Ngày huỷ">{{ formatDate(detailItem.NgayHuy) }}</el-descriptions-item>
          <el-descriptions-item label="Nhân viên">{{ detailItem.NhanVienName || detailItem.NhanVien || detailItem.MaNV || '' }}</el-descriptions-item>
          <el-descriptions-item label="Ghi chú" :span="2">{{ detailItem.GhiChu || '' }}</el-descriptions-item>
        </el-descriptions>

        <div style="margin-top:12px">
          <h4 style="margin:0 0 8px 0">Chi tiết dòng</h4>
          <el-table :data="detailChiTiets" style="width:100%" size="small" border>
            <el-table-column prop="maCTPH" label="Mã CT" width="200" />
            <el-table-column prop="maLo" label="Lô" width="220" />
            <el-table-column prop="soLuong" label="Số lượng" width="120" />
            <el-table-column prop="donGia" label="Đơn giá" width="140">
              <template #default="{ row }">{{ row.donGia != null ? row.donGia.toLocaleString() : '' }}</template>
            </el-table-column>
            <el-table-column prop="thanhTien" label="Thành tiền" width="160">
              <template #default="{ row }">{{ row.thanhTien != null ? row.thanhTien.toLocaleString() : '' }}</template>
            </el-table-column>
            <el-table-column prop="ghiChu" label="Ghi chú" />
          </el-table>
        </div>
      </div>
      <div v-else style="padding:20px; text-align:center; color:#666">Không có dữ liệu</div>
      <template #footer>
        <el-button @click="detailDialog = false">Đóng</el-button>
      </template>
    </el-dialog>
  </el-card>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '@/api/axios';
import { ElMessage } from 'element-plus';

const phieuHuyItems = ref([]);
const loading = ref(false);
const detailDialog = ref(false);
const detailItem = ref(null);
const detailLoading = ref(false);
const detailChiTiets = ref([]);

const formatDate = (d) => {
  if (!d) return '';
  try { return new Date(d).toLocaleString('vi-VN'); } catch { return d; }
};

const fetchPhieuHuy = async () => {
  loading.value = true;
  try {
    const res = await api.get('/PhieuHuy');
    const data = res?.data ?? res;
    phieuHuyItems.value = Array.isArray(data) ? data : (data?.data || []);
  } catch (err) {
    console.error('fetchPhieuHuy error', err);
    ElMessage.error('Không thể tải danh sách phiếu huỷ');
    phieuHuyItems.value = [];
  } finally {
    loading.value = false;
  }
};

const openDetail = async (row) => {
  if (!row) return;
  const maPH = row.MaPH || row.MaPh || row.MaPhu || row.MaPH;
  if (!maPH) return;
  detailLoading.value = true;
  detailDialog.value = true;
  detailItem.value = null;
  detailChiTiets.value = [];
  try {
    const res = await api.get(`/PhieuHuy/Details/${maPH}`);
    const d = res?.data || res;
    detailItem.value = d || null;
    detailChiTiets.value = Array.isArray(d?.ChiTiets) ? d.ChiTiets : (d?.ChiTiet || d?.ChiTiets || []);
  } catch (err) {
    console.error('fetch PhieuHuy details error', err);
    ElMessage.error('Không thể tải chi tiết phiếu huỷ');
    detailItem.value = null;
    detailChiTiets.value = [];
  } finally {
    detailLoading.value = false;
  }
};

onMounted(() => {
  fetchPhieuHuy();
});
</script>

<style scoped>
.page-header h3 { margin: 0; }
.subtitle { color: var(--el-text-color-secondary); margin-top:6px }
</style>
