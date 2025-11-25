<template>
  <el-card>
    <div class="page-header">
      <h3>Thuốc cần xử lý</h3>
    </div>

    <el-tabs v-model="activeTab" style="margin-top:12px">
      <el-tab-pane label="Thuốc từ kho" name="kho">
        <!-- Kho tab: Sắp hết hạn -->
        <div class="kho-tab-content" style="margin-top:12px">
          <div class="filter-section" style="display:flex; gap:12px; align-items:flex-end; flex-wrap:wrap; padding:12px; background:#f5f7fa; border-radius:8px">
            <div style="display:flex; gap:8px; align-items:center">
              <span style="font-weight:600">Lọc theo:</span>
              <el-radio-group v-model="khoFilterMode" size="small" @change="fetchKhoList">
                <el-radio-button label="days">Ngày</el-radio-button>
                <el-radio-button label="months">Tháng</el-radio-button>
                <el-radio-button label="years">Năm</el-radio-button>
                <el-radio-button label="fromDate">Từ ngày</el-radio-button>
              </el-radio-group>
            </div>

            <div v-if="khoFilterMode === 'days'" style="display:flex; gap:8px; align-items:center">
              <label>Số ngày:</label>
              <el-input-number v-model="khoDays" :min="1" :max="365" size="small" @change="fetchKhoList" />
            </div>

            <div v-if="khoFilterMode === 'months'" style="display:flex; gap:8px; align-items:center">
              <label>Số tháng:</label>
              <el-input-number v-model="khoMonths" :min="1" :max="60" size="small" @change="fetchKhoList" />
            </div>

            <div v-if="khoFilterMode === 'years'" style="display:flex; gap:8px; align-items:center">
              <label>Số năm:</label>
              <el-input-number v-model="khoYears" :min="1" :max="10" size="small" @change="fetchKhoList" />
            </div>

            <div v-if="khoFilterMode === 'fromDate'" style="display:flex; gap:8px; align-items:center">
              <label>Từ ngày:</label>
              <el-date-picker v-model="khoFromDate" type="date" placeholder="Chọn ngày" format="DD/MM/YYYY" value-format="YYYY-MM-DD" size="small" @change="fetchKhoList" />
            </div>

            <el-button type="primary" @click="fetchKhoList" size="small" style="margin-left:auto">Áp dụng</el-button>
          </div>

          <!-- Kho list table -->
          <div style="margin-top:12px">
            <el-table :data="khoDisplayedItems" stripe v-loading="khoLoading" style="width:100%">
              <el-table-column label="STT" width="60">
                <template #default="{ $index }">{{ $index + 1 }}</template>
              </el-table-column>
              <el-table-column prop="maLo" label="Lô" width="160" />
              <el-table-column prop="maThuoc" label="Mã thuốc" width="120">
                <template #default="{ row }">
                  <el-tag size="small" type="warning">{{ row.maThuoc }}</el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="tenThuoc" label="Tên thuốc" min-width="250">
                <template #default="{ row }">
                  <div class="drug-name">{{ row.tenThuoc }}</div>
                </template>
              </el-table-column>
              <el-table-column prop="tenLoaiDonViGoc" label="Đơn vị" width="100" />
              <el-table-column prop="soLuongCon" label="Số lượng" width="100">
                <template #default="{ row }">
                  <span style="font-weight:600; color:#28a745">{{ row.soLuongCon }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="hanSuDung" label="Hạn sử dụng" width="140">
                <template #default="{ row }">
                  {{ formatDate(row.hanSuDung) }}
                </template>
              </el-table-column>
              <el-table-column label="Còn lại" width="120">
                <template #default="{ row }">
                  <div style="font-size:12px">
                    <div>{{ row.ngayConLai }} ngày</div>
                    <div style="color:#999">({{ row.thangConLai }} tháng)</div>
                  </div>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </div>
      </el-tab-pane>

      <el-tab-pane label="Thuốc từ hóa đơn" name="hoadon">
        <!-- Hóa đơn tab content -->
        <div style="padding:20px; text-align:center; color:#999">
          Chức năng này đang phát triển...
        </div>
      </el-tab-pane>
    </el-tabs>


    <!-- Detail Dialog -->
    <el-dialog v-model="detailDialog" width="700px" :close-on-click-modal="false">
      <template #title>
        <div style="display:flex; align-items:center; gap:12px">
          <h4 style="margin:0">Chi tiết thuốc</h4>
          <small style="color:#666">{{ detailItem?.MaThuoc || '' }}</small>
        </div>
      </template>
      <div v-if="detailItem">
        <el-descriptions column="2" border>
          <el-descriptions-item label="Mã thuốc">{{ detailItem.MaThuoc }}</el-descriptions-item>
          <el-descriptions-item label="Tên thuốc">{{ detailItem.TenThuoc }}</el-descriptions-item>
          <el-descriptions-item label="Lô">{{ detailItem.MaLo }}</el-descriptions-item>
          <el-descriptions-item label="Số lượng">{{ detailItem.SoLuong }} {{ detailItem.DonVi || '' }}</el-descriptions-item>
          <el-descriptions-item label="Ghi chú" :span="2">{{ detailItem.GhiChu || 'Không có' }}</el-descriptions-item>
        </el-descriptions>
      </div>
      <template #footer>
        <div style="text-align:right">
          <el-button @click="detailDialog = false">Đóng</el-button>
          <el-button type="primary" @click="goToEdit(detailItem)">Xử lý chi tiết</el-button>
        </div>
      </template>
    </el-dialog>
  </el-card>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import api from '@/api/axios';
import { ElMessage } from 'element-plus';

const start = ref(null);
const end = ref(null);
const q = ref('');
const cancelMode = ref('hoadon');
const activeTab = ref('kho');
const filterStatus = ref('');
const filterLoDangDung = ref('');
const filterLoaiThuoc = ref('');
const filterDonVi = ref('');

const loDangDungOptions = ref([]);
const loaiThuocOptions = ref([]);
const donViOptions = ref([]);

const items = ref([]);
const loading = ref(false);

// Kho tab state
const khoFilterMode = ref('months');
const khoDays = ref(7);
const khoMonths = ref(1);
const khoYears = ref(1);
const khoFromDate = ref(null);
const khoItems = ref([]);
const khoLoading = ref(false);

const pageSize = 10;
const currentPage = ref(1);

const detailDialog = ref(false);
const detailItem = ref(null);

const setDefaultRange = () => {
  const today = new Date();
  const first = new Date(today.getFullYear(), today.getMonth(), 1);
  const fmt = (dt) => {
    const y = dt.getFullYear();
    const m = String(dt.getMonth() + 1).padStart(2, '0');
    const d = String(dt.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };
  start.value = fmt(first);
  end.value = fmt(today);
};

const formatDate = (d) => {
  if (!d) return '';
  try { return new Date(d).toLocaleDateString('vi-VN'); } catch { return d; }
};

const fetchKhoList = async () => {
  khoLoading.value = true;
  khoItems.value = [];
  try {
    const params = {};
    if (khoFilterMode.value === 'days') params.days = khoDays.value;
    else if (khoFilterMode.value === 'months') params.months = khoMonths.value;
    else if (khoFilterMode.value === 'years') params.years = khoYears.value;
    else if (khoFilterMode.value === 'fromDate' && khoFromDate.value) params.fromDate = khoFromDate.value;

    const res = await api.get('/ThuocView/SapHetHan', { params });
    const d = res?.data?.data || res?.data || res;
    khoItems.value = Array.isArray(d) ? d : (d?.Items || []);
  } catch (err) {
    console.warn('fetchKhoList error', err);
    ElMessage.error('Không thể tải danh sách thuốc sắp hết hạn');
    khoItems.value = [];
  } finally {
    khoLoading.value = false;
  }
};

const khoDisplayedItems = computed(() => {
  return khoItems.value || [];
});

const fetchList = async () => {
  loading.value = true;
  items.value = [];
  try {
    const params = {
      start: start.value,
      end: end.value,
      q: q.value,
      mode: cancelMode.value,
      tab: activeTab.value,
      status: filterStatus.value,
      lo: filterLoDangDung.value,
      loai: filterLoaiThuoc.value,
      donvi: filterDonVi.value,
    };
    const res = await api.get('/Thuoc/CanXuLy', { params });
    const d = res?.data?.data || res?.data || res;
    items.value = Array.isArray(d) ? d : (d?.Items || []);

    const unique = (arr) => Array.from(new Set(arr.filter(Boolean)));
    loDangDungOptions.value = unique((items.value || []).map(i => i.MaLo || i.MaLoGoc || '').filter(Boolean));
    loaiThuocOptions.value = unique((items.value || []).map(i => i.LoaiThuoc || i.Loai || i.MaLoai || '').filter(Boolean));
    donViOptions.value = unique((items.value || []).map(i => i.DonVi || i.MaLoaiDonViGocName || '').filter(Boolean));
  } catch (err) {
    console.warn('fetchList error', err);
    items.value = [];
    ElMessage.error('Không thể tải danh sách');
  } finally {
    loading.value = false;
  }
};

const displayedItems = computed(() => {
  let list = items.value || [];
  if (activeTab.value === 'kho') {
    list = list.filter(i => Boolean(i.MaKho || i.KhoId || (i.Nguon && i.Nguon.toString().toLowerCase() === 'kho')));
  }
  if (activeTab.value === 'hoadon') {
    list = list.filter(i => Boolean(i.MaPhieu || i.SoHoaDon || (i.Nguon && i.Nguon.toString().toLowerCase() === 'hoadon')));
  }

  if (filterStatus.value) list = list.filter(i => (i.TrangThai || '').toString().toLowerCase().includes(filterStatus.value));
  if (filterLoDangDung.value) list = list.filter(i => (i.MaLo || i.MaLoGoc || '').toString() === filterLoDangDung.value);
  if (filterLoaiThuoc.value) list = list.filter(i => (i.LoaiThuoc || i.Loai || '').toString() === filterLoaiThuoc.value);
  if (filterDonVi.value) list = list.filter(i => (i.DonVi || i.MaLoaiDonViGocName || '').toString() === filterDonVi.value);

  if (q.value && q.value.toString().trim() !== '') {
    const term = q.value.toString().toLowerCase();
    list = list.filter(it => {
      try { return (it.TenThuoc + ' ' + it.MaThuoc + ' ' + (it.MaLo||'')).toLowerCase().includes(term); } catch { return false; }
    });
  }

  return list;
});

const paginatedItems = computed(() => {
  const list = displayedItems.value || [];
  const startIdx = (currentPage.value - 1) * pageSize;
  return list.slice(startIdx, startIdx + pageSize);
});

const refresh = () => {
  q.value = '';
  setDefaultRange();
  fetchList();
};

const viewItem = (row) => {
  detailItem.value = row;
  detailDialog.value = true;
};

const markHandled = async (row) => {
  try {
    await api.post(`/Thuoc/MarkHandled/${row.MaThuoc}`);
    ElMessage.success('Đã đánh dấu là đã xử lý');
    fetchList();
  } catch (err) {
    console.error('markHandled error', err);
    ElMessage.error('Không thể cập nhật trạng thái');
  }
};

const goToEdit = (row) => {
  if (!row) return;
  window.location.href = `#/admin/thuoc/${row.MaThuoc}`;
};

onMounted(() => {
  setDefaultRange();
  fetchKhoList();
  fetchList();
});

watch([start, end], () => {
  if (start.value && end.value) fetchList();
});

watch(cancelMode, () => { fetchList(); });

watch(activeTab, () => {
  if (activeTab.value === 'kho') fetchKhoList();
  else fetchList();
});

watch([filterStatus, filterLoDangDung, filterLoaiThuoc, filterDonVi], () => {});

watch(() => displayedItems.value.length, () => { currentPage.value = 1; });

// Kho tab filters auto-fetch
watch([khoFilterMode, khoDays, khoMonths, khoYears, khoFromDate], () => {
  if (activeTab.value === 'kho') fetchKhoList();
});
</script>

<style scoped>
.page-header h3 { margin: 0 }

.controls { margin-top:12px; display:flex; gap:12px; align-items:center; flex-wrap:wrap }
.controls .field { min-width:180px; display:flex; gap:8px; align-items:center; flex: 0 1 260px }
.controls .label { font-weight:600; color:var(--el-text-color-secondary); flex:0 0 72px; margin-right:8px; white-space:nowrap }
.control-el { width:100%; box-sizing:border-box }

.drug-name { word-break: break-word; white-space: normal; overflow-wrap: anywhere; }
.so-luong { text-align: right; font-weight: 700 }

@media (max-width: 768px) {
  .controls .field { flex-direction:column; align-items:flex-start }
  .controls .label { margin-bottom:6px; flex:0 0 auto }
}
</style>