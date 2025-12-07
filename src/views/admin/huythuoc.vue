<template>
  <el-card>
    <div class="page-header">
      <h3> Danh sách phiếu huỷ</h3>
    </div>

    <div style="margin-top:12px; display:flex; gap:12px; align-items:center; flex-wrap:nowrap; overflow-x:auto;">
      <el-date-picker v-model="fromDate" type="date" placeholder="Từ ngày" format="DD/MM/YYYY" value-format="YYYY-MM-DD" size="small" />
      <el-date-picker v-model="toDate" type="date" placeholder="Đến ngày" format="DD/MM/YYYY" value-format="YYYY-MM-DD" size="small" />
      <el-input v-model="searchQuery" size="small" placeholder="Tìm mã PH / PXH / nhân viên" clearable style="min-width:200px" />
    </div>

    <div style="margin-top:12px">
      <el-table :data="filteredPhieuHuyItems" stripe v-loading="loading" style="width:100%">
        <el-table-column prop="MaPH" label="Mã PH" width="180" />
        <el-table-column prop="MaPXH" label="Mã PXH" width="180" />
        <el-table-column prop="NgayHuy" label="Ngày huỷ" width="180">
          <template #default="{ row }">{{ formatDate(row.NgayHuy) }}</template>
        </el-table-column>
        <!-- Mã NV column hidden per request -->
        <el-table-column prop="NhanVienName" label="Người thực hiện" width="150" />
        <el-table-column prop="GhiChu" label="Ghi chú" min-width="200" />
        <el-table-column label="Tổng tiền" width="160" align="right">
          <template #default="{ row }">{{ row.TongTien != null ? row.TongTien.toLocaleString() : '-' }}</template>
        </el-table-column>
        <el-table-column label="Hành động" width="140" align="center">
          <template #default="{ row }">
            <el-button size="small" @click="() => openDetail(row)">Chi tiết</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-dialog v-model="detailDialog" title="Chi tiết phiếu huỷ" width="90%">
      <div v-if="detailLoading" style="padding:20px; text-align:center; color:#666">Đang tải...</div>
      <div v-else-if="detailItem">
        <el-descriptions column="2" border>
          <el-descriptions-item label="Mã PH">{{ detailItem.MaPH || detailItem.MaPh || detailItem.MaPH }}</el-descriptions-item>
          <el-descriptions-item label="Mã PXH">
            <span v-if="detailItem.MaPXH || detailItem.MaPxh" style="cursor:pointer; color:#0066cc; text-decoration:underline" @click="openPXHDetail(detailItem.MaPXH || detailItem.MaPxh)">{{ detailItem.MaPXH || detailItem.MaPxh }}</span>
            <span v-else>-</span>
          </el-descriptions-item>
          <el-descriptions-item label="Ngày huỷ">{{ formatDate(detailItem.NgayHuy) }}</el-descriptions-item>
          <el-descriptions-item label="Nhân viên">{{ detailItem.NhanVienName || detailItem.NhanVien || detailItem.MaNV || '' }}</el-descriptions-item>
          <el-descriptions-item label="Ghi chú" :span="2">{{ detailItem.GhiChu || '' }}</el-descriptions-item>
          <el-descriptions-item label="Tổng tiền" :span="2">{{ detailItem.TongTien != null ? detailItem.TongTien.toLocaleString() : '-' }}</el-descriptions-item>
        </el-descriptions>

        <div style="margin-top:12px">
          <el-table :data="detailChiTiets" style="width:100%" size="small" border>
            <el-table-column prop="maCTPH" label="Mã CT" width="180" />
              <el-table-column prop="maLo" label="Lô" width="180" />
              <el-table-column prop="tenThuoc" label="Tên thuốc" min-width="260"> 
                <template #default="{ row }">{{ row.tenThuoc || row.tenThuoc || '' }}</template>
              </el-table-column>
              <el-table-column prop="tenLoaiDonVi" label="Đơn vị" width="120"> 
                <template #default="{ row }">{{ row.tenLoaiDonVi || row.tenLoaiDonVi || '' }}</template>
              </el-table-column>
              <el-table-column prop="soLuong" label="Số lượng" width="120" />
            <el-table-column prop="donGia" label="Đơn giá" width="140">
              <template #default="{ row }">{{ row.donGia != null ? row.donGia.toLocaleString() : '' }}</template>
            </el-table-column>
            <el-table-column prop="thanhTien" label="Thành tiền" width="160">
              <template #default="{ row }">{{ row.thanhTien != null ? row.thanhTien.toLocaleString() : '' }}</template>
            </el-table-column>
            <el-table-column prop="ghiChu" label="Ghi chú" />
          </el-table>
          <div style="margin-top:8px; text-align:right; font-weight:600">
            Tổng cộng: <span style="color:#e60012">{{ (detailChiTiets || []).reduce((s, x) => s + (x.thanhTien || 0), 0).toLocaleString() }} đ</span>
          </div>
        </div>
      </div>
      <div v-else style="padding:20px; text-align:center; color:#666">Không có dữ liệu</div>
      <template #footer>
        <el-button @click="detailDialog = false">Đóng</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="pxhDetailDialog" title="Chi tiết phiếu xử lý hoàn hủy" width="90%">
      <div v-if="pxhLoading" style="padding:20px; text-align:center; color:#666">Đang tải...</div>
      <div v-else-if="pxhDetail">
        <el-descriptions column="2" border>
          <el-descriptions-item label="Mã PXH">{{ pxhDetail.Phieu?.maPXH || pxhDetail.maPXH || '' }}</el-descriptions-item>
          <el-descriptions-item label="Ngày tạo">{{ formatDate(pxhDetail.Phieu?.ngayTao || pxhDetail.ngayTao) }}</el-descriptions-item>
          <el-descriptions-item label="NV tạo">{{ pxhDetail.Phieu?.maNV_Tao || pxhDetail.maNV_Tao || '' }}</el-descriptions-item>
          <el-descriptions-item label="NV duyệt">{{ pxhDetail.Phieu?.maNV_Duyet || pxhDetail.maNV_Duyet || '' }}</el-descriptions-item>
          <el-descriptions-item label="Loại nguồn">{{ pxhDetail.Phieu?.loaiNguon ? 'Hoàn' : 'Hủy' }}</el-descriptions-item>
          <el-descriptions-item label="Trạng thái">{{ pxhDetail.Phieu?.trangThai === 1 ? 'Đã duyệt' : 'Chưa duyệt' }}</el-descriptions-item>
          <el-descriptions-item label="Ghi chú" :span="2">{{ pxhDetail.Phieu?.ghiChu || '' }}</el-descriptions-item>
        </el-descriptions>

        <div style="margin-top:12px">
          <h4>Chi tiết dòng</h4>
          <el-table :data="pxhChiTiets" style="width:100%" size="small" border>
            <el-table-column prop="maCTPXH" label="Mã CT" width="180" />
            <el-table-column prop="maLo" label="Lô" width="180" />
            <el-table-column prop="tenThuoc" label="Tên thuốc" min-width="260">
              <template #default="{ row }">{{ row.tenThuoc || '' }}</template>
            </el-table-column>
            <el-table-column prop="tenLoaiDonVi" label="Đơn vị" width="120">
              <template #default="{ row }">{{ row.tenLoaiDonVi || '' }}</template>
            </el-table-column>
            <el-table-column prop="soLuong" label="Số lượng" width="120" />
            <el-table-column prop="loaiXuLy" label="Loại xử lý" width="140">
              <template #default="{ row }">{{ row.loaiXuLy ? 'Hoàn' : 'Hủy' }}</template>
            </el-table-column>
          </el-table>
        </div>
      </div>
      <div v-else style="padding:20px; text-align:center; color:#666">Không có dữ liệu</div>
      <template #footer>
        <el-button @click="pxhDetailDialog = false">Đóng</el-button>
      </template>
    </el-dialog>
  </el-card>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import api from '@/api/axios';
import { ElMessage } from 'element-plus';

const phieuHuyItems = ref([]);
// Default date range: from = 1 month ago from today, to = today
const _now = new Date();
const _oneMonthAgo = new Date(_now.getFullYear(), _now.getMonth() - 1, _now.getDate());
const _iso = d => d ? d.toISOString().slice(0, 10) : null;
const fromDate = ref(_iso(_oneMonthAgo));
const toDate = ref(_iso(_now));
const searchQuery = ref('');

const filteredPhieuHuyItems = computed(() => {
  const q = (searchQuery.value || '').toString().trim().toLowerCase();
  const f = fromDate.value ? new Date(fromDate.value) : null;
  const t = toDate.value ? new Date(toDate.value) : null;
  return (phieuHuyItems.value || []).filter(item => {
    // date filter
    if (f || t) {
      const d = item?.NgayHuy ? new Date(item.NgayHuy) : null;
      if (d) {
        if (f && d < new Date(f.getFullYear(), f.getMonth(), f.getDate())) return false;
        if (t) {
          const tEnd = new Date(t.getFullYear(), t.getMonth(), t.getDate(), 23, 59, 59);
          if (d > tEnd) return false;
        }
      }
    }
    if (!q) return true;
    const hay = [item?.MaPH, item?.MaPXH, item?.NhanVienName, item?.MaNV].map(x => (x||'').toString().toLowerCase());
    return hay.some(s => s.includes(q));
  });
});
const loading = ref(false);
const detailDialog = ref(false);
const detailItem = ref(null);
const detailLoading = ref(false);
const detailChiTiets = ref([]);
const pxhDetailDialog = ref(false);
const pxhDetail = ref(null);
const pxhLoading = ref(false);
const pxhChiTiets = ref([]);

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

const openPXHDetail = async (maPXH) => {
  if (!maPXH) return;
  pxhLoading.value = true;
  pxhDetailDialog.value = true;
  pxhDetail.value = null;
  pxhChiTiets.value = [];
  try {
    const res = await api.get(`/PhieuXuLyHoanHuy/Details/${maPXH}`);
    const d = res?.data || res;
    pxhDetail.value = d || null;
    pxhChiTiets.value = Array.isArray(d?.ChiTiets) ? d.ChiTiets : (d?.ChiTiet || d?.ChiTiets || []);
  } catch (err) {
    console.error('fetch PXH details error', err);
    ElMessage.error('Không thể tải chi tiết phiếu xử lý hoàn hủy');
    pxhDetail.value = null;
    pxhChiTiets.value = [];
  } finally {
    pxhLoading.value = false;
  }
};

onMounted(() => {
  fetchPhieuHuy();
});
</script>

<style scoped>
.page-header h3 { margin: 0; }
</style>
