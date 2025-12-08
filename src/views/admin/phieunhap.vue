<template>
  <div class="admin-phieunhap">
    <el-card class="admin-card">
      <template #header>
        <div class="header-content">
          <h3>Danh sách Phiếu Nhập</h3>
          <el-button type="primary" @click="addNew" :icon="Plus">
            Thêm mới
          </el-button>
        </div>
      </template>

      <!-- Search and Filter Row -->
      <div class="filter-container">
        <div class="filter-group">
          <div class="filter-item">
            <label class="filter-label">Từ ngày</label>
            <el-date-picker
              v-model="startDate"
              type="date"
              placeholder="Chọn ngày"
              format="DD/MM/YYYY"
              size="small"
              class="filter-input"
            />
          </div>
          <div class="filter-item">
            <label class="filter-label">Đến ngày</label>
            <el-date-picker
              v-model="endDate"
              type="date"
              placeholder="Chọn ngày"
              format="DD/MM/YYYY"
              size="small"
              class="filter-input"
            />
          </div>
          <div class="filter-item">
            <label class="filter-label">Nhà cung cấp</label>
            <el-select
              v-model="supplierFilter"
              placeholder="Chọn..."
              clearable
              size="small"
              class="filter-input"
            >
              <el-option
                v-for="supplier in suppliers"
                :key="supplier.maNCC || supplier.id || supplier.MaNCC"
                :label="supplier.tenNCC || supplier.tenNhaCungCap || supplier.TenNCC || supplier.ten || ''"
                :value="supplier.maNCC || supplier.id || supplier.MaNCC"
              />
            </el-select>
          </div>
          <div class="filter-item">
            <label class="filter-label">Nhân viên</label>
            <el-select
              v-model="employeeFilter"
              placeholder="Chọn..."
              clearable
              size="small"
              class="filter-input"
            >
              <el-option
                v-for="employee in employees"
                :key="employee.maNV || employee.id || employee.MaNV"
                :label="employee.tenNV || employee.hoTen || employee.hoTen || employee.ten || ''"
                :value="employee.maNV || employee.id || employee.MaNV"
              />
            </el-select>
          </div>
          <div class="filter-item">
            <label class="filter-label">Tìm kiếm</label>
            <el-input
              v-model="searchKeyword"
              placeholder="Mã phiếu, nhà cung cấp..."
              size="small"
              class="filter-input"
              clearable
            />
          </div>
        </div>
        <div class="filter-actions">
          <el-button
            type="success"
            @click="exportExcel"
            :icon="Document"
            size="small"
            class="action-btn export-btn"
          >
            Xuất Excel
          </el-button>
          <el-button
            type="info"
            @click="printList"
            :icon="Printer"
            size="small"
            class="action-btn print-btn"
          >
            In
          </el-button>
        </div>
      </div>

      <!-- Table -->
      <el-table
        :data="pagedList"
        style="width: 100%"
        v-loading="loading"
        element-loading-text="Đang tải..."
      >
        <el-table-column prop="maPN" label="Mã phiếu" width="200" />
        <el-table-column label="Ngày nhập" width="120">
          <template #default="{ row }">
            {{ formatDateOnly(row.ngayNhap) }}
          </template>
        </el-table-column>
        <el-table-column prop="tenNCC" label="Nhà cung cấp" />
        <el-table-column prop="tenNV" label="Nhân viên" width="160" />
        <el-table-column prop="tongTien" label="Tổng tiền" width="180" />
        <el-table-column label="Thao tác" width="220">
          <template #default="scope">
            <div class="table-action-cell">
              <el-button
                class="table-btn btn-view"
                size="small"
                circle
                @click="openDetail(scope.row)"
                :icon="View"
                title="Xem"
              ></el-button>
              <el-button
                v-if="isAdmin"
                class="table-btn btn-edit"
                size="small"
                circle
                @click="editItem(scope.row)"
                :icon="Edit"
                title="Sửa"
              ></el-button>
              <el-button
                v-if="isAdmin"
                class="table-btn btn-delete"
                size="small"
                circle
                @click="deleteItem(scope.row)"
                :icon="Delete"
                title="Xóa"
              ></el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <!-- Pagination -->
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 50]"
        :total="total"
        layout="total, sizes, prev, pager, next"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </el-card>

    <!-- Detail view moved to separate route: /admin/phieunhap/:maPN -->
  </div>
</template>

    

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import api from '@/api';
import { ElMessageBox, ElMessage } from 'element-plus';
import { View, Edit, Delete, Plus, Printer, Document } from '@element-plus/icons-vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/store/auth';
import { numberToWords } from '@/utils/numberUtils';

// Resolve logo assets (Vite) for print — primary favicon, fallback logo
const logoPrimary = (() => {
  try {
    return new URL('../../assets/img/logo/favicon.png', import.meta.url).href;
  } catch (e) {
    return '';
  }
})();
const logoFallback = (() => {
  try {
    return new URL('../../assets/img/logo/logo.png', import.meta.url).href;
  } catch (e) {
    return '';
  }
})();

const list = ref([]);
const filteredList = ref([]);
// default start = 1 month ago from today, end = today
const now = new Date();
const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
const startDate = ref(oneMonthAgo);
const endDate = ref(new Date());
const searchKeyword = ref('');
const supplierFilter = ref(null);
const employeeFilter = ref('');
const currentPage = ref(1);
const pageSize = ref(10);
const router = useRouter();
const authStore = useAuthStore();
const suppliers = ref([]);
const employees = ref([]);
const total = ref(0);
const loading = ref(false);
const supplierLoading = ref(false);
const employeeLoading = ref(false);

// Check if user is admin (ChucVu is the source of truth)
const isAdmin = computed(() => {
  return authStore.user?.ChucVu === 1 || authStore.user?.ChucVu === '1';
});

// format date param as YYYY-MM-DD (API expects date strings like 2025-11-01)
const formatDateParam = (d) => {
  if (!d) return undefined;
  const dt = typeof d === 'string' ? new Date(d) : d instanceof Date ? d : new Date(d);
  if (Number.isNaN(dt.getTime())) return undefined;
  const mm = String(dt.getMonth() + 1).padStart(2, '0');
  const dd = String(dt.getDate()).padStart(2, '0');
  return `${dt.getFullYear()}-${mm}-${dd}`;
};

// Sort helper: sort by `maPN` (alphanumeric, numeric-aware)
const sortByDateDesc = (arr) => {
  if (!Array.isArray(arr)) return;
  arr.sort((a, b) => {
    const maA = (a && (a.maPN || a.MaPN || '')).toString();
    const maB = (b && (b.maPN || b.MaPN || '')).toString();
    // Descending: compare maB to maA so larger maPN come first.
    return maB.localeCompare(maA, undefined, { numeric: true, sensitivity: 'base' });
  });
};

const loadList = async () => {
  loading.value = true;
  const params = {};
  const s = formatDateParam(startDate.value);
  const e = formatDateParam(endDate.value);
  if (s) params.startDate = s;
  if (e) params.endDate = e;
  if (employeeFilter.value) params.maNV = employeeFilter.value;
  if (supplierFilter.value) params.maNCC = supplierFilter.value;

  try {
    const resp = await api.phieunhap.getByDateRange(params);
    if (resp && resp.data) {
      // backend returns { status, message, data: [...] }
      const dataArr = (resp.data && resp.data.data) ? resp.data.data : (resp.data || []);
      list.value = Array.isArray(dataArr) ? dataArr : [];
      // initialize filtered list and pagination total
      filteredList.value = Array.isArray(list.value) ? list.value.slice() : [];
      // sort by date desc (newest first)
      sortByDateDesc(filteredList.value);
      total.value = filteredList.value.length;
    }
  } catch (err) {
    console.error(err);
    list.value = [];
  } finally {
    loading.value = false;
  }
};

const loadSuppliers = async () => {
  supplierLoading.value = true;
  try {
    const resp = await api.nhacungcap.getAll();
    // backend responses use a wrapper { status, message, data: [...] }
    suppliers.value = (resp && resp.data && resp.data.data) ? resp.data.data : (resp.data || []);
    // normalize supplier objects so template can reliably read `maNCC`/`tenNCC`
    if (Array.isArray(suppliers.value) && suppliers.value.length > 0) {
      suppliers.value = suppliers.value.map(s => ({
        id: s.id || s.maNCC || s.MaNCC || null,
        maNCC: s.maNCC || s.MaNCC || s.id || null,
        tenNCC: s.tenNCC || s.tenNhaCungCap || s.TenNCC || s.ten || '',
        __raw: s,
      }));
    }
  } catch (err) {
    console.error(err);
    // Fallback mock data for demonstration
    suppliers.value = [
      { id: 1, tenNCC: 'Công ty Dược ABC' },
      { id: 2, tenNCC: 'Nhà thuốc XYZ' },
      { id: 3, tenNCC: 'Dược phẩm DEF' }
    ];
  } finally {
    supplierLoading.value = false;
  }
};

const loadEmployees = async () => {
  employeeLoading.value = true;
    try {
    const resp = await api.nhanvien.getAll();
    // some endpoints return array directly or wrapped in { data: [...] }
    employees.value = (resp && resp.data && resp.data.data) ? resp.data.data : (resp.data || []);
    // Normalize different backend shapes to a consistent structure used in the template
    if (Array.isArray(employees.value) && employees.value.length > 0) {
      employees.value = employees.value.map(e => ({
        id: e.id || e.maNV || e.MaNV || e.MANV || null,
        maNV: e.maNV || e.MaNV || e.MANV || e.id || null,
        tenNV: e.tenNV || e.hoTen || e.hoten || e.TenNV || e.Ten || '' ,
        // keep raw object in case other fields needed
        __raw: e,
      }));
    }
  } catch (err) {
    console.error(err);
    // Fallback mock data for demonstration
    employees.value = [
      { id: 1, tenNV: 'Nguyễn Văn A' },
      { id: 2, tenNV: 'Trần Thị B' },
      { id: 3, tenNV: 'Lê Văn C' }
    ];
  } finally {
    employeeLoading.value = false;
  }
};

const formatPrice = (v) => {
  if (!v && v !== 0) return '';
  return Number(v).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
};

const formatDate = (v) => {
  if (!v) return '';
  const d = typeof v === 'string' ? new Date(v) : v;
  return d.toLocaleString();
};

// Format date to YYYY-MM-DD (drop time portion)
const formatDateOnly = (v) => {
  if (!v) return '';
  const d = typeof v === 'string' ? new Date(v) : v;
  if (Number.isNaN(d.getTime())) return '';
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

const onSearch = () => {
  const q = (searchKeyword.value || '').toLowerCase().trim();
  const sup = supplierFilter.value;
  const emp = (employeeFilter.value || '').toLowerCase().trim();

  filteredList.value = list.value.filter((x) => {
    // filter by search keyword (maPN or tenNCC)
    let matchQ = true;
    if (q) {
      matchQ = (x.maPN || '').toLowerCase().includes(q) || (x.tenNCC || x.TenNCC || '').toLowerCase().includes(q);
    }

    // filter by supplier selection
    let matchSup = true;
    if (sup) {
      matchSup = (x.maNCC || x.MaNCC || x.nhaCungCap || '').toString() === sup.toString() || (x.tenNCC || x.TenNCC || '').toLowerCase().includes((sup && suppliers.value.find(s=> (s.maNCC||s.MaNCC)==sup)?.tenNCC || '').toLowerCase());
    }

    // filter by employee (try multiple possible field names)
    let matchEmp = true;
    if (emp) {
      const empFields = [(x.nhanVien || x.tenNV || x.TenNV || x.maNV || x.MaNV || x.nguoiLap || x.createdBy || '')].map(v => (v||'').toString().toLowerCase());
      matchEmp = empFields.some(f => f.includes(emp));
    }

    return matchQ && matchSup && matchEmp;
  });
  // sort results newest-first
  sortByDateDesc(filteredList.value);
  currentPage.value = 1;
  // update total for pagination
  total.value = filteredList.value.length;
};

// debounce search when typing
let searchTimeout = null;
watch(searchKeyword, (nv) => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    onSearch();
  }, 350);
});

const pagedList = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  return filteredList.value.slice(start, start + pageSize.value);
});

const onPageChange = (page) => {
  currentPage.value = page;
};

const openDetail = (row) => {
  const key = (row && (row.maPN || row.MaPN || row.id)) || row || '';
  if (!key) return;
  // navigate by route name + params — route is defined to capture the full param (including slashes)
  router.push({ name: 'admin-phieunhap-detail', params: { maPN: key } });
};

const editPhieuNhap = (row) => {
  const router = useRouter();
  router.push({ path: '/admin/phieunhap/them', query: { maPN: row.maPN } });
};

const deletePhieuNhap = (row) => {
  ElMessageBox.confirm('Xóa phiếu nhập này? (tạm thời backend không hỗ trợ)', 'Xác nhận', {
    type: 'warning',
  }).then(() => {
    ElMessage.warning('Chức năng xóa chưa được hỗ trợ bởi backend.');
  });
};

onMounted(() => {
  loadSuppliers();
  loadEmployees();
  loadList();
});

watch([startDate, endDate, supplierFilter, employeeFilter], () => {
  loadList();
});

const addNew = () => {
  router.push('/admin/phieunhap/them');
};

const editItem = (item) => {
  const key = item && (item.maPN || item.MaPN || item.id);
  if (!key) {
    ElMessage.error('Không xác định mã phiếu để sửa');
    return;
  }
  // Reuse the "Thêm phiếu nhập" page for editing by passing maPN in query
  router.push({ path: '/admin/phieunhap/them', query: { maPN: key } });
};

const deleteItem = async (item) => {
  const key = item && (item.maPN || item.MaPN || item.id || item);
  if (!key) {
    ElMessage.error('Không xác định mã phiếu để xóa');
    return;
  }

  try {
    await ElMessageBox.confirm('Bạn có chắc chắn muốn xóa phiếu nhập này?', 'Xác nhận xóa', {
      confirmButtonText: 'Xóa',
      cancelButtonText: 'Hủy',
      type: 'warning',
    });

    // Call backend DELETE by maPN (encoded inside API wrapper)
    const resp = await api.phieunhap.deletePhieuNhap(key);
    const apiResp = (resp && resp.data && typeof resp.data === 'object') ? resp.data : resp;

    if (apiResp && apiResp.status === -1) {
      // Backend indicated failure and provided a message
      ElMessage.error(apiResp.message || 'Xóa phiếu nhập thất bại');
      return;
    }

    ElMessage.success('Xóa phiếu nhập thành công');
    // refresh list after deletion
    loadList();
  } catch (err) {
    // If user canceled the confirm dialog, do nothing
    if (err && err !== 'cancel') {
      console.error('deleteItem error', err);
      ElMessage.error((err && err.message) ? err.message : 'Xóa phiếu nhập thất bại');
    }
  }
};

const handleSizeChange = (size) => {
  pageSize.value = size;
  loadList();
};

const handleCurrentChange = (page) => {
  currentPage.value = page;
  loadList();
};

const exportExcel = () => {
  const totalAmount = filteredList.value.reduce((sum, row) => sum + (Number(row.tongTien) || 0), 0);
  const totalCount = filteredList.value.length;

  const title = 'DANH SÁCH PHIẾU NHẬP';
  const summary = `Từ ngày: ${formatDateOnly(startDate.value) || ''}, Đến ngày: ${formatDateOnly(endDate.value) || ''}, Tổng số phiếu: ${totalCount}, Tổng tiền: ${formatPrice(totalAmount)}`;
  const headers = ['Mã phiếu', 'Ngày nhập', 'Nhà cung cấp', 'Nhân viên', 'Tổng tiền', 'Ghi chú'];

  const csvContent = '\ufeff' + [
    title,
    summary,
    '',
    headers.join(','),
    ...filteredList.value.map(row => [
      row.maPN || '',
      formatDateOnly(row.ngayNhap) || '',
      row.tenNCC || '',
      row.tenNV || '',
      formatPrice(row.tongTien) || '',
      row.ghiChu || row.GhiChu || ''
    ].join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'danh-sach-phieu-nhap.csv';
  link.click();
  ElMessage.success('Đã xuất file Excel');
};

const printList = async () => {
  const currentUser = authStore.currentUser;
  console.log('Current user:', currentUser);
  console.log('User properties:', Object.keys(currentUser || {}));

  let tenNhanVien = currentUser?.TenDangNhap || '';
  if (currentUser?.MaNV) {
    try {
      const resp = await api.nhanvien.getById(currentUser.MaNV);
      const nv = resp.data;
      tenNhanVien = nv?.hoTen || nv?.tenNV || nv?.TenNV || nv?.hoVaTen || currentUser.TenDangNhap || '';
    } catch (err) {
      console.error('Không lấy được thông tin nhân viên:', err);
    }
  }

  // Tính tổng tiền
  const totalAmount = filteredList.value.reduce((sum, row) => sum + (Number(row.tongTien) || 0), 0);

  const printWindow = window.open('', '_blank');
  const htmlContent = `
    <!DOCTYPE html>
    <html lang="vi">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Danh sách Phiếu Nhập</title>
      ${'<' + 'style>'}
        body { font-family: 'Times New Roman', serif; margin: 0; padding: 20px; font-size: 14px; line-height: 1.4; }
        .container { max-width: 1000px; margin: 0 auto; border: 2px solid #000; padding: 20px; }
        .header { display:flex; align-items:center; justify-content:center; gap:8px; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 20px; }
        .company-name { font-size: 28px; font-weight: bold; text-transform: uppercase; margin: 0; }
        .company-info { font-size: 12px; margin: 5px 0; }
        .title { font-size: 24px; font-weight: bold; text-transform: uppercase; margin: 20px 0; text-align: center; }
        .info-section { display: flex; justify-content: space-between; margin-bottom: 20px; }
        .info-group { flex: 1; margin: 0 10px; }
        .info-label { font-weight: bold; display: inline-block; width: 120px; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { border: 1px solid #000; padding: 8px; text-align: left; vertical-align: top; }
        th { background-color: #f0f0f0; font-weight: bold; text-align: center; }
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .total-section { margin: 20px 0; padding: 10px; border: 1px solid #000; background-color: #f9f9f9; }
        .total-label { font-weight: bold; font-size: 16px; }
        .total-amount { font-weight: bold; font-size: 18px; color: #d32f2f; }
        .total-words { font-weight: bold; font-size: 16px; color: #0f172a; }
        .signature-section { margin-top: 40px; display: flex; justify-content: space-between; }
        .signature-box { width: 30%; text-align: center; }
        .signature-line { border-top: 1px solid #000; margin-top: 40px; padding-top: 5px; }
        .print-info { margin-top: 20px; font-size: 12px; text-align: right; border-top: 1px dashed #000; padding-top: 10px; }
        @media print { body { margin: 0; } .container { border: none; } }
      ${'</' + 'style>'}
    </head>
    <body>
      <div class="container">
        <div class="header">
                <img src="${logoPrimary}" onerror="this.onerror=null;this.src='${logoFallback}'" style="width:86px;height:auto;margin-right:6px;flex:0 0 auto;" />
                <div style="flex:0 1 auto;min-width:0;text-align:left;">
                  <div class="company-name">NHÀ THUỐC MEDION</div>
                  <div class="company-info">Địa chỉ: 140 Lê Trọng Tấn, Tân Phú, Thành phố Hồ Chí Minh</div>
                  <div class="company-info">Điện thoại: (028) 1234-5678 | Email: medion@thuoc.com</div>
                  <div class="company-info">MST: 0123456789</div>
                </div>
              </div>

        <div class="title">DANH SÁCH PHIẾU NHẬP</div>

        <div class="info-section">
          <div class="info-group">
            <div><span class="info-label">Từ ngày:</span> ${formatDateOnly(startDate.value) || ''}</div>
            <div><span class="info-label">Đến ngày:</span> ${formatDateOnly(endDate.value) || ''}</div>
          </div>
          <div class="info-group">
            <div><span class="info-label">Tổng số phiếu:</span> ${filteredList.value.length}</div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th style="width: 5%;">STT</th>
              <th style="width: 15%;">Mã phiếu</th>
              <th style="width: 15%;">Ngày nhập</th>
              <th style="width: 25%;">Nhà cung cấp</th>
              <th style="width: 20%;">Nhân viên</th>
              <th style="width: 20%;">Tổng tiền</th>
            </tr>
          </thead>
          <tbody>
            ${filteredList.value.map((row, index) => `
              <tr>
                <td class="text-center">${index + 1}</td>
                <td>${row.maPN || ''}</td>
                <td class="text-center">${formatDateOnly(row.ngayNhap) || ''}</td>
                <td>${row.tenNCC || ''}</td>
                <td>${row.tenNV || ''}</td>
                <td class="text-right">${formatPrice(row.tongTien) || ''}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="total-section">
          <div class="text-right">
            <span class="total-label">Tổng cộng: </span>
            <span class="total-amount">${formatPrice(totalAmount) || ''}</span>
          </div>
          <div class="text-right" style="margin-top: 10px;">
            <span class="total-label">Bằng chữ: </span>
            <span class="total-words">${numberToWords(Math.floor(totalAmount))} đồng</span>
          </div>
        </div>

        <div class="signature-section">
          <div class="signature-box">
            <div>Người lập danh sách</div>
            <div class="signature-line">(Ký, ghi rõ họ tên)</div>
          </div>
          <div class="signature-box">
            <div>Thủ kho</div>
            <div class="signature-line">(Ký, ghi rõ họ tên)</div>
          </div>
          <div class="signature-box">
            <div>Kế toán</div>
            <div class="signature-line">(Ký, ghi rõ họ tên)</div>
          </div>
        </div>

        <div class="print-info">
          <div>Thời gian in: ${new Date().toLocaleString('vi-VN')}</div>
          <div>Nhân viên in: ${tenNhanVien}</div>
        </div>
      </div>
    </body>
    </html>
  `;
  printWindow.document.write(htmlContent);
  printWindow.document.close();
  printWindow.print();
};
</script>

<style scoped>
.admin-phieunhap { padding: 12px 0; }

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-content h3 {
  margin: 0;
}

/* Filter Container - Clean, modern design */
.filter-container {
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 12px 16px;
  margin-bottom: 20px;
  display: flex;
  align-items: flex-end;
  gap: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  flex-wrap: nowrap;
}

.filter-group {
  display: flex;
  gap: 10px;
  align-items: flex-end;
  flex-wrap: nowrap;
  flex: 1;
  min-width: 0;
}

.filter-item {
  display: flex;
  flex-direction: column;
  gap: 3px;
  flex: 0 0 auto;
  min-width: 130px;
}

.filter-item:nth-child(1),
.filter-item:nth-child(2) {
  min-width: 95px;
}

/* Ô tìm kiếm (item thứ 5) - tự động giãn rộng khi có không gian */
.filter-item:nth-child(5) {
  flex: 1 1 auto;
  min-width: 180px;
}

.filter-label {
  font-size: 11px;
  font-weight: 600;
  color: #334155;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  line-height: 1;
  white-space: nowrap;
}

.filter-input {
  width: 100% !important;
}

.filter-input :deep(.el-input__wrapper),
.filter-input :deep(.el-date-editor__wrapper),
.filter-input :deep(.el-select__wrapper) {
  height: 34px !important;
  background: white;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  transition: all 0.3s ease;
  padding: 0 6px !important;
}

.filter-item:nth-child(1) .filter-input :deep(.el-input__wrapper),
.filter-item:nth-child(1) .filter-input :deep(.el-date-editor__wrapper),
.filter-item:nth-child(2) .filter-input :deep(.el-input__wrapper),
.filter-item:nth-child(2) .filter-input :deep(.el-date-editor__wrapper) {
  padding: 0 4px !important;
}

.filter-input :deep(.el-input__wrapper:hover),
.filter-input :deep(.el-date-editor__wrapper:hover),
.filter-input :deep(.el-select__wrapper:hover) {
  border-color: #94a3b8;
  background: #f8fafc;
}

.filter-input :deep(.el-input__wrapper.is-focus),
.filter-input :deep(.el-date-editor__wrapper.is-focus),
.filter-input :deep(.el-select__wrapper.is-focus) {
  border-color: #17a2b8;
  box-shadow: 0 0 0 2px rgba(23, 162, 184, 0.1);
  background: white;
}

.filter-input :deep(.el-input__inner),
.filter-input :deep(.el-date-editor__editor),
.filter-input :deep(.el-select .el-input__inner) {
  height: 34px !important;
  line-height: 34px !important;
  font-size: 11px;
  color: #334155;
}

.filter-item:nth-child(1) .filter-input :deep(.el-date-editor__editor),
.filter-item:nth-child(2) .filter-input :deep(.el-date-editor__editor) {
  font-size: 10px;
}

.filter-input :deep(.el-input__inner::placeholder),
.filter-input :deep(.el-date-editor__editor::placeholder) {
  color: #94a3b8;
}

.filter-actions {
  display: flex;
  gap: 8px;
  flex: 0 0 auto;
  flex-wrap: nowrap;
  align-items: flex-end;
}

.action-btn {
  height: 34px !important;
  padding: 0 12px !important;
  border-radius: 6px !important;
  font-weight: 500;
  font-size: 11px;
  display: inline-flex !important;
  align-items: center;
  gap: 5px;
  transition: all 0.3s ease;
  border: none !important;
  white-space: nowrap;
  flex: 0 0 auto;
}

.export-btn {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%) !important;
  color: white !important;
}

.export-btn:hover {
  background: linear-gradient(135deg, #059669 0%, #047857 100%) !important;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3) !important;
}

.print-btn {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%) !important;
  color: white !important;
}

.print-btn:hover {
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%) !important;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3) !important;
}

/* Responsive design */
@media (max-width: 1400px) {
  .filter-item {
    min-width: 130px;
  }
}

@media (max-width: 1024px) {
  .filter-container {
    padding: 12px 16px;
    gap: 8px;
  }

  .filter-group {
    gap: 8px;
    flex: 0 0 100%;
    margin-bottom: 8px;
  }

  .filter-actions {
    flex: 0 0 100%;
    gap: 6px;
  }

  .filter-item {
    min-width: 120px;
    flex: 1 1 auto;
  }

  .action-btn {
    height: 36px !important;
    padding: 0 12px !important;
    font-size: 11px;
    flex: 1;
    justify-content: center;
  }
}

@media (max-width: 768px) {
  .filter-item {
    min-width: 100%;
    flex: 0 0 calc(50% - 6px);
  }

  .filter-actions {
    flex: 0 0 100%;
  }

  .action-btn {
    flex: 1;
    justify-content: center;
  }
}

.action-buttons-row { display:flex; gap:8px; align-items:center; }
.btn-action { background: #fff; border-radius:6px; width:36px; height:36px; display:flex; align-items:center; justify-content:center; box-shadow: 0 1px 2px rgba(0,0,0,0.06); border: 1px solid #e8eef2; cursor:pointer; }
.btn-action .el-icon { font-size:16px; }
.btn-view { background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; }
.btn-edit { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; }
.btn-delete { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; }

.table-btn { 
  width: 72px !important;
  height: 48px !important;
  padding: 0 8px !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  border-radius: 10px !important;
  box-shadow: 0 6px 12px rgba(16,24,40,0.06);
  color: #fff !important;
  border: none !important;
}
.table-btn .el-icon { font-size: 24px !important; }
.table-btn svg { width: 24px !important; height: 24px !important; }
.table-btn:hover { transform: translateY(-1px); }
.table-btn.btn-view { background: linear-gradient(135deg,#3b82f6 0%,#2563eb 100%) !important; }
.table-btn.btn-edit { background: linear-gradient(135deg,#f59e0b 0%,#d97706 100%) !important; }
.table-btn.btn-delete { background: linear-gradient(135deg,#ef4444 0%,#dc2626 100%) !important; }

.table-action-cell { display:flex; gap:8px; align-items:center; }
</style>

