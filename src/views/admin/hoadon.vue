<template>
  <el-card>

    <!-- Top row: toolbar (left) + filters (right) -->
    <div class="top-row">
      <div class="filters-row" role="region" aria-label="Bộ lọc hóa đơn">
        <el-date-picker
          v-model="startDate"
          type="date"
          class="filter-date"
          placeholder="Từ ngày"
          format="DD/MM/YYYY"
          value-format="YYYY-MM-DD"
          clearable
          size="small"
        />

        <el-date-picker
          v-model="endDate"
          type="date"
          class="filter-date"
          placeholder="Đến ngày"
          format="DD/MM/YYYY"
          value-format="YYYY-MM-DD"
          clearable
          size="small"
        />

        <el-select v-model="status" class="filter-small" placeholder="Đã nhận" clearable size="small">
          <el-option :value="null" label="Tất cả" />
          <el-option v-for="opt in statusOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
        </el-select>

        <el-select v-model="type" class="filter-small" placeholder="Loại" clearable size="small">
          <el-option value="" label="Tất cả" />
          <el-option value="HD" label="Hóa đơn trực tiếp" />
          <el-option value="HDOL" label="Hóa đơn online" />
        </el-select>

        <el-input v-model="searchKeyword" class="filter-search" placeholder="Tìm kiếm..." clearable size="small" />
      </div>

      <div class="toolbar-right" role="toolbar" aria-label="Hành động">
        <el-button type="primary" class="btn-create" @click="$router.push('/admin/hoadon/them')">➕</el-button>
        <el-button class="btn-export" type="info" @click="exportExcel" title="Xuất Excel" aria-label="Xuất Excel"><i class="fa fa-file" aria-hidden="true"></i></el-button>
        <el-button class="btn-print" @click="printList" title="In"><i class="fa fa-print"></i></el-button>
      </div>
    </div>

    <!-- Table results -->
    <div style="margin-top:18px">
      <el-table :data="pagedList" v-loading="loading" element-loading-text="Đang tải..." style="width:100%" :stripe="false">
        <el-table-column type="index" label="STT" width="60" fixed="left" />
        <el-table-column prop="MaHD" label="Mã HĐ" min-width="220" width="190" show-overflow-tooltip class-name="col-ellipsis" fixed="left" />
        <el-table-column prop="NgayLap" label="Ngày lập" width="120">
          <template #default="{ row }">{{ formatDate(row.NgayLap) }}</template>
        </el-table-column>
        <el-table-column prop="TenKH" label="Khách hàng" min-width="200" show-overflow-tooltip class-name="col-ellipsis" />
        <el-table-column prop="TenNV" label="Nhân viên" width="180" show-overflow-tooltip class-name="col-ellipsis" />
        <el-table-column prop="TongTien" label="Tổng tiền" width="120">
          <template #default="{ row }">{{ formatPrice(row.TongTien) }}</template>
        </el-table-column>
        <el-table-column prop="GhiChu" label="Ghi chú" min-width="180" show-overflow-tooltip class-name="col-ellipsis" />
        <el-table-column prop="TrangThaiGiaoHang" label="Trạng thái" width="140" show-overflow-tooltip>
          <template #default="{ row }">
            {{ mapStatus(row.TrangThaiGiaoHang) }}
          </template>
        </el-table-column>
        <!-- Actions: view / edit / delete -->
        <el-table-column label="Thao tác" width="140" fixed="right">
          <template #default="{ row }">
            <div class="table-actions">
              <el-button class="action-btn btn-view" circle size="small" @click="viewItem(row)" title="Xem"><i class="fa fa-eye"></i></el-button>
              <el-button v-if="isAdmin" class="action-btn btn-edit" circle size="small" @click="editItem(row)" title="Sửa"><i class="fa fa-edit"></i></el-button>
              <el-button v-if="isAdmin" class="action-btn btn-delete" circle size="small" @click="deleteItem(row)" title="Hủy/Xóa"><i class="fa fa-trash"></i></el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <div style="margin-top:12px; display:flex; justify-content:flex-end; align-items:center; gap:12px">
        <div>Tổng: <strong>{{ totalRows }}</strong> kết quả</div>
        <el-pagination :current-page.sync="currentPage" :page-size.sync="pageSize" :total="totalRows" layout="prev, pager, next, sizes" :page-sizes="[10,20,50]" @current-change="onPageChange" @size-change="onSizeChange" />
      </div>
    </div>
  </el-card>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import api from '@/api';
import { useAuthStore } from '@/store/auth';
import { numberToWords } from '@/utils/numberUtils';

const router = useRouter();
const authStore = useAuthStore();

// Resolve logo assets (Vite) for print — primary favicon, fallback logo
const logoPrimary = (() => {
  try { return new URL('../../assets/img/logo/favicon.png', import.meta.url).href; } catch (e) { return ''; }
})();
const logoFallback = (() => {
  try { return new URL('../../assets/img/logo/logo.png', import.meta.url).href; } catch (e) { return ''; }
})();

// Data
const list = ref([]);
const loading = ref(false);
const currentPage = ref(1);
const pageSize = ref(10);
const totalRows = ref(0);

const pagedList = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  return Array.isArray(list.value) ? list.value.slice(start, start + pageSize.value) : [];
});

// Filter state (default: 1 month ago from today -> today)
const now = new Date();
const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
const yyyy = oneMonthAgo.getFullYear();
const mm = String(oneMonthAgo.getMonth() + 1).padStart(2, '0');
const dd = String(oneMonthAgo.getDate()).padStart(2, '0');
// Use YYYY-MM-DD strings to match `value-format` on el-date-picker
const startDate = ref(`${yyyy}-${mm}-${dd}`);
const endDate = ref(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`);
const status = ref(null);
const type = ref('HD');
const searchKeyword = ref('');

// Example options (adjust to your backend values)
// Backend expects numeric status and 'loai' values like 'HD' or 'HDOL'
const statusOptions = [
  { value: -3, label: 'Chưa hoàn tất xử lý huỷ' },
  { value: -2, label: 'Đã hoàn tất xử lý huỷ' },
  { value: -1, label: 'Hủy' },
  { value: 0, label: 'Đã đặt' },
  { value: 1, label: 'Đã xác nhận' },
  { value: 2, label: 'Đã giao' },
  { value: 3, label: 'Đã nhận' },
];

// Check if user is admin (ChucVu is the source of truth)
const isAdmin = computed(() => {
  return authStore.user?.ChucVu === 1 || authStore.user?.ChucVu === '1';
});

const applyFilters = () => {
  // validate dates
  if (!startDate.value || !endDate.value) {
    // show all or prompt — here we require both
    ElMessage?.warning && ElMessage.warning('Vui lòng chọn cả Từ ngày và Đến ngày');
    return;
  }

  const params = {
    from: formatDateOnly(startDate.value),
    to: formatDateOnly(endDate.value),
  };
  if (status.value != null) params.status = status.value;
  if (type.value) params.loai = type.value;

  // call API
  loading.value = true;
  api.hoadon.search(params)
    .then(resp => {
      const apiResp = (resp && resp.data && typeof resp.data === 'object') ? resp.data : resp;
      // backend helper wraps response; it returns { status, message, data } in many endpoints
      const dataArr = apiResp && Array.isArray(apiResp) ? apiResp : (apiResp && apiResp.data) ? apiResp.data : (apiResp || []);
      // normalize response keys to match table props (server may return lowercase keys)
      const raw = Array.isArray(dataArr) ? dataArr : [];
      list.value = raw.map(it => ({
        MaHD: it.MaHD ?? it.maHD,
        NgayLap: it.NgayLap ?? it.ngayLap,
        MaKH: it.MaKH ?? it.maKH,
        TenKH: it.TenKH ?? it.tenKH,
        DiaChiKH: it.DiaChiKH ?? it.diaChiKH,
        DienThoaiKH: it.DienThoaiKH ?? it.dienThoaiKH,
        MaNV: it.MaNV ?? it.maNV,
        TenNV: it.TenNV ?? it.tenNV,
        TongTien: it.TongTien ?? it.tongTien,
        GhiChu: it.GhiChu ?? it.ghiChu,
        TrangThaiGiaoHang: it.TrangThaiGiaoHang ?? it.trangThaiGiaoHang,
      }));
      // apply client-side search keyword filtering (backend does not support free text search here)
      if (searchKeyword.value && searchKeyword.value.trim() !== '') {
        const kw = searchKeyword.value.trim().toLowerCase();
        list.value = list.value.filter(item => {
          return (item.MaHD && String(item.MaHD).toLowerCase().includes(kw)) ||
                 (item.TenKH && String(item.TenKH).toLowerCase().includes(kw)) ||
                 (item.TenNV && String(item.TenNV).toLowerCase().includes(kw));
        });
      }
      totalRows.value = list.value.length;
      currentPage.value = 1;
    })
    .catch(err => {
      console.error('search hoadon error', err);
      ElMessage?.error && ElMessage.error('Tìm hóa đơn thất bại');
    })
    .finally(() => { loading.value = false; });
};

const resetFilters = () => {
  startDate.value = null;
  endDate.value = null;
  status.value = null;
  type.value = null;
  searchKeyword.value = '';
  // Optionally reload list without filters
  console.log('Filters reset');
};

const onPageChange = (page) => { currentPage.value = page; };
const onSizeChange = (size) => { pageSize.value = size; currentPage.value = 1; };

// Utilities
const formatPrice = (v) => {
  if (v == null) return '';
  return Number(v).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
};

const formatDate = (v) => {
  if (!v) return '';
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return '';
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${dd}/${mm}/${yyyy}`;
};

const formatDateOnly = (v) => {
  if (!v) return '';
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return '';
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

const mapStatus = (s) => {
  if (s == null) return '';
  const opt = statusOptions.find(o => o.value === s);
  return opt ? opt.label : String(s);
};

// Actions: view / edit / delete (cancel)
const viewItem = (row) => {
  const id = row.MaHD || row.maHD;
  if (!id) return;
  router.push(`/admin/hoadon/${encodeURIComponent(id)}`);
};

const editItem = (row) => {
  const id = row.MaHD || row.maHD;
  if (!id) return;
  router.push({ path: '/admin/hoadon/them', query: { maHD: id } });
};

const deleteItem = (row) => {
  const id = row.MaHD || row.maHD;
  if (!id) return;
  ElMessageBox.confirm(`Bạn có chắc muốn hủy hóa đơn "${id}"?`, 'Xác nhận', {
    confirmButtonText: 'Hủy', cancelButtonText: 'Bỏ qua', type: 'warning'
  }).then(() => {
    loading.value = true;
    api.hoadon.cancel(id)
      .then(resp => {
        const r = (resp && resp.data) ? resp.data : resp;
        if (r && r.status === -1) {
          ElMessage.error(r.message || 'Hủy thất bại');
          return;
        }
        ElMessage.success('Hủy hóa đơn thành công');
        applyFilters();
      })
      .catch(err => {
        console.error('cancel hoadon err', err);
        ElMessage.error('Hủy thất bại');
      })
      .finally(() => { loading.value = false; });
  }).catch(() => {
    // cancel clicked
  });
};

// Export current list to CSV (Excel can open CSV)
const exportExcel = () => {
  try {
    const rows = Array.isArray(list.value) ? list.value : [];
    if (!rows.length) {
      ElMessage.info('Không có dữ liệu để xuất');
      return;
    }
    const title = 'DANH SÁCH HÓA ĐƠN';
    const summary = `Từ: ${formatDateOnly(startDate.value) || ''} — Đến: ${formatDateOnly(endDate.value) || ''} | Tổng: ${rows.length} HĐ`;
    const headers = ['Mã HĐ', 'Ngày lập', 'Khách hàng', 'Nhân viên', 'Tổng tiền', 'Ghi chú', 'Trạng thái'];
    const csvRows = [title, summary, '', headers.join(',')];
    rows.forEach(r => {
      const cols = [
        `"${r.MaHD ?? ''}"`,
        `"${formatDate(r.NgayLap) ?? ''}"`,
        `"${(r.TenKH ?? '').replace(/"/g, '""')}"`,
        `"${(r.TenNV ?? '').replace(/"/g, '""')}"`,
        `"${r.TongTien ?? ''}"`,
        `"${(r.GhiChu ?? '').replace(/"/g, '""')}"`,
        `"${mapStatus(r.TrangThaiGiaoHang) ?? ''}"`,
      ];
      csvRows.push(cols.join(','));
    });
    // Add BOM so Excel correctly handles UTF-8 Vietnamese characters
    const csvContent = '\ufeff' + csvRows.join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    const fileName = `HoaDon_${startDate.value || 'from'}_${endDate.value || 'to'}.csv`;
    link.setAttribute('download', fileName);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error('export csv err', err);
    ElMessage.error('Xuất Excel thất bại');
  }
};

// Print the current list in a layout similar to Phiếu Nhập
const printList = async () => {
  const rows = Array.isArray(list.value) ? list.value : [];
  const currentUser = authStore.currentUser;
  let tenNhanVien = currentUser?.TenDangNhap || '';
  if (currentUser?.MaNV) {
    try {
      const resp = await api.nhanvien.getById(currentUser.MaNV);
      const nv = resp && resp.data ? resp.data : resp;
      tenNhanVien = nv?.hoTen || nv?.tenNV || nv?.TenNV || nv?.hoVaTen || currentUser.TenDangNhap || '';
    } catch (err) {
      console.error('get nhanvien error', err);
    }
  }

  const totalAmount = rows.reduce((s, r) => s + (Number(r.TongTien || r.tongTien) || 0), 0);
  const totalCount = rows.length;

  const printWindow = window.open('', '_blank');
  if (!printWindow) { ElMessage.error('Không thể mở cửa sổ in'); return; }

  const html = `
    <!DOCTYPE html>
    <html lang="vi">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>Danh sách Hóa đơn</title>
      ${'<' + 'style>'}
        body{ font-family: 'Times New Roman', serif; margin:0; padding:20px; color:#111 }
        .container{ max-width:1100px; margin:0 auto }
        .header{ display:flex; align-items:center; gap:12px; border-bottom:2px solid #222; padding-bottom:10px; justify-content:center }
        .company-name{ font-size:28px; font-weight:700; text-transform:uppercase }
        .company-info{ font-size:12px }
        .title{ font-size:22px; text-align:center; font-weight:700; margin:18px 0 }
        .info { display:flex; justify-content:space-between; margin-bottom:12px }
        table{ width:100%; border-collapse: collapse }
        th,td{ border:1px solid #222; padding:8px; font-size:13px }
        th{ background:#f3f3f3 }
        .text-right{ text-align:right }
        .total-section{ margin-top:14px; border-top:1px dashed #333; padding-top:8px }
        .signature{ display:flex; justify-content:space-between; margin-top:28px }
        .print-info{ margin-top:18px; font-size:12px; text-align:right }
        @media print{ body{ margin:0 } }
      ${'</' + 'style>'}
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div style="display:flex;align-items:center;gap:12px;">
            <img src="${logoPrimary}" onerror="this.onerror=null;this.src='${logoFallback}'" style="width:86px;height:auto;flex:0 0 auto" />
            <div style="text-align:center;">
              <div class="company-name">NHÀ THUỐC MEDION</div>
              <div class="company-info">Địa chỉ: 140 Lê Trọng Tấn, Tân Phú, TP.HCM</div>
              <div class="company-info">Điện thoại: (028) 1234-5678</div>
              <div class="company-info">MST: 0123456789</div>
            </div>
          </div>
        </div>

        <div class="title">DANH SÁCH HÓA ĐƠN</div>

        <div class="info">
          <div>Từ: ${formatDateOnly(startDate.value) || ''} — Đến: ${formatDateOnly(endDate.value) || ''}</div>
          <div>Tổng: ${totalCount} hóa đơn</div>
        </div>

        <table>
          <thead>
            <tr>
              <th style="width:5%">STT</th>
              <th style="width:20%">Mã HĐ</th>
              <th style="width:12%">Ngày lập</th>
              <th style="width:20%">Khách hàng</th>
              <th style="width:16%">Nhân viên</th>
              <th style="width:12%" class="text-right">Tổng tiền</th>
              <th style="width:15%">Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            ${rows.map((r, i) => `
              <tr>
                <td class="text-center">${i + 1}</td>
                <td>${r.MaHD ?? r.maHD ?? ''}</td>
                <td class="text-center">${formatDate(r.NgayLap ?? r.ngayLap) || ''}</td>
                <td>${r.TenKH ?? r.tenKH ?? ''}</td>
                <td>${r.TenNV ?? r.tenNV ?? ''}</td>
                <td class="text-right">${formatPrice(r.TongTien ?? r.tongTien) || ''}</td>
                <td>${mapStatus(r.TrangThaiGiaoHang ?? r.trangThaiGiaoHang)}</td>
              </tr>`).join('')}
          </tbody>
        </table>

        <div class="total-section">
          <div class="text-right">Tổng tiền: <strong>${formatPrice(totalAmount)}</strong></div>
          <div class="text-right">Bằng chữ: <em>${numberToWords(Math.floor(totalAmount))} đồng</em></div>
        </div>

        <div class="signature">
          <div>Người lập</div>
          <div>Quản lý</div>
          <div>Kế toán</div>
        </div>

        <div class="print-info">In lúc: ${new Date().toLocaleString('vi-VN')} — In bởi: ${tenNhanVien}</div>
      </div>
    </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => printWindow.print(), 600);
};

// Run initial load with default dates
onMounted(() => {
  applyFilters();
});

// debounce helper
function debounce(fn, wait = 400) {
  let t = null;
  return (...args) => {
    if (t) clearTimeout(t);
    t = setTimeout(() => fn(...args), wait);
  };
}

const debouncedApply = debounce(() => applyFilters(), 450);

// Watch filters and auto-refresh list (debounced)
watch([startDate, endDate, status, type], () => {
  // only call when both dates exist; applyFilters handles validation
  debouncedApply();
});

// debounce search input separately to reduce frequency while typing
watch(searchKeyword, (nv, ov) => {
  debouncedApply();
});
</script>

<style scoped>
.filters-row {
  display: flex;
  gap: 6px;
  /* keep filters on a single line; shrink controls to fit */
  flex-wrap: nowrap;
  align-items: center;
  overflow-x: auto;
  max-width: 100%;
}
.filter-actions { display:flex; gap:8px; align-items:center; }

/* per-control sizing to keep date pickers fully visible */
.filters-row > * { flex: 0 0 auto; }
.filter-date { min-width: 120px; max-width: 180px; }
.filter-date .el-input__inner {
  height: 44px;
  padding: 6px 10px;
  border-radius: 6px;
  font-size: 13px;
  box-shadow: none;
}
.filter-date .el-input__inner::placeholder { color: #9aa3ad; }
.filter-small { min-width: 100px; max-width: 160px; }
/* make selects and the search input match height/padding */
.filter-small .el-input__inner,
.filter-search .el-input__inner {
  height: 42px;
  padding: 6px 10px;
  border-radius: 6px;
  font-size: 13px;
}
.filter-search { min-width: 160px; max-width: 420px; flex: 1 1 220px; }

/* Top row layout: filters take available space, buttons anchored right */
.top-row { display:flex; gap:12px; align-items:center; justify-content:space-between; flex-wrap:wrap }
.filters-row { flex: 1 1 640px; display:flex; gap:8px; align-items:center; min-width:0; overflow-x:auto }
.toolbar-right { display:flex; gap:8px; align-items:center; flex:0 0 auto }
.btn-create { background: linear-gradient(180deg,#2f9cff,#1877f2); color:#fff; border:0; padding:6px 10px }
.btn-export { background: linear-gradient(180deg,#2dbb2d,#1f9b1f); color:#fff; border:0; padding:6px 8px; min-width: 42px; display:inline-flex; align-items:center; justify-content:center }
.btn-print { background: linear-gradient(180deg,#9aa3ad,#6f7a80); color:#fff; border:0; padding:6px 10px }

/* Responsive adjustments */
@media (max-width: 900px) {
  .filters-row { gap: 6px; }
  .filter-date { min-width: 110px; }
  .filter-small { min-width: 90px; }
  .filter-search { min-width: 120px; }
}

/* Actions column buttons */
.table-actions { display:flex; gap:8px; align-items:center; justify-content:flex-end; }
.action-btn { display:inline-flex; align-items:center; justify-content:center; width:36px; height:36px; padding:0; border-radius:8px; color:#fff; }
.action-btn i { font-size:14px; }
.btn-view { background: linear-gradient(180deg,#2f9cff,#1877f2); border:0; }
.btn-edit { background: linear-gradient(180deg,#f6a21a,#f18807); border:0; }
.btn-delete { background: linear-gradient(180deg,#ff6b6b,#e23b3b); border:0; }
.action-btn:focus { box-shadow: none; }

/* Ellipsis for long cells to prevent horizontal table expansion */
.col-ellipsis .cell {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Prevent table body horizontal overflow; allow fixed actions column to remain visible */
.el-table__body-wrapper {
  overflow-x: hidden;
}
</style>
