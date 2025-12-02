<template>
    <!-- Modern Header Card -->
    <el-card class="header-card" shadow="hover">
      <div class="header-content">
        <div class="header-left">
          <div class="invoice-title">
            <el-icon class="title-icon"><Document /></el-icon>
            <h2 class="title-text">Chi tiết Hóa đơn</h2>
            <el-tag class="invoice-code" type="info">{{ invoice.maHD || invoice.maHd || maHD }}</el-tag>
          </div>
          
          <div class="invoice-meta">
            <div class="meta-row">
              <div class="meta-item">
                <el-icon class="meta-icon"><Calendar /></el-icon>
                <div class="meta-content">
                  <span class="meta-label">Ngày lập</span>
                  <span class="meta-value">{{ formatDate(invoice.ngayLap || invoice.NgayLap) }}</span>
                </div>
              </div>
              
              <div class="meta-item">
                <el-icon class="meta-icon"><User /></el-icon>
                <div class="meta-content">
                  <span class="meta-label">Khách hàng</span>
                  <span class="meta-value">{{ invoice.tenKH || invoice.tenKh || invoice.TenKH }}</span>
                  <span class="meta-subvalue">{{ invoice.diaChiKH || invoice.DiaChiKH || invoice.diachiKH || invoice.diaChi || 'Không có địa chỉ' }}</span>
                </div>
              </div>
            </div>
            
            <div class="meta-row">
              <div class="meta-item">
                <el-icon class="meta-icon"><Avatar /></el-icon>
                <div class="meta-content">
                  <span class="meta-label">Nhân viên</span>
                  <span class="meta-value">{{ invoice.tenNV || invoice.TenNV || '' }}</span>
                </div>
              </div>
              
              <div class="meta-item">
                <el-icon class="meta-icon"><InfoFilled /></el-icon>
                <div class="meta-content">
                  <span class="meta-label">Trạng thái</span>
                  <el-tag class="status-tag" size="default" :type="getStatusTagType(invoice.trangThaiGiaoHang ?? invoice.TrangThaiGiaoHang)">
                    {{ mapStatus(invoice.trangThaiGiaoHang ?? invoice.TrangThaiGiaoHang) }}
                  </el-tag>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="header-actions">
          <el-button class="action-btn" type="primary" size="default" @click="printDetail">
            <el-icon><Printer /></el-icon>
            In hóa đơn
          </el-button>
          <el-button class="action-btn" size="default" @click="$router.back()">
            <el-icon><ArrowLeft /></el-icon>
            Quay lại
          </el-button>
        </div>
      </div>
    </el-card>

    <!-- View Mode Selector -->
    <el-card class="view-selector-card" shadow="never">
      <div class="view-selector">
        <div class="selector-left">
          <span class="selector-label">Chế độ xem:</span>
          <el-radio-group v-model="viewMode" class="view-mode-group">
            <el-radio-button label="khach">
              <el-icon><User /></el-icon>
              Khách hàng
            </el-radio-button>
            <el-radio-button label="nhanvien">
              <el-icon><Avatar /></el-icon>
              Nhân viên
            </el-radio-button>
          </el-radio-group>
        </div>
        
        <div class="selector-right">
          <el-tag class="display-mode-tag" type="info" effect="light">
            {{ viewMode === 'khach' ? 'Hiển thị tổng hợp' : 'Hiển thị chi tiết' }}
          </el-tag>
        </div>
      </div>
    </el-card>

    <!-- Data Table -->
    <el-card class="table-card" shadow="hover">
      <template #header>
        <div class="table-header">
          <h3 class="table-title">
            <el-icon><List /></el-icon>
            {{ isSummary ? 'Tổng hợp sản phẩm' : 'Chi tiết sản phẩm' }}
          </h3>
          <el-tag class="item-count" type="success" effect="light">
            {{ Math.floor(displayRows.length / 2) }} sản phẩm
          </el-tag>
        </div>
      </template>
      
      <el-table 
        :data="displayRows" 
        class="modern-table"
        v-loading="loading" 
        element-loading-text="Đang tải dữ liệu..." 
        :span-method="spanMethod" 
        :row-key="rowKey"
        stripe
        border>
        <el-table-column label="STT" width="90" align="center">
          <template #default="{ row }">
            <span v-if="row._rtype === 'item'">{{ row._origIndex + 1 }}</span>
            <span v-else>Liều dùng:</span>
          </template>
        </el-table-column>

        <template v-if="isSummary">
          <el-table-column prop="maThuoc" label="Mã thuốc" width="110">
            <template #default="{ row }">
              <span v-if="row._rtype === 'dose'" style="font-style:italic">Liều dùng: {{ row.__dose }}</span>
              <span v-else>{{ row.maThuoc }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="tenThuoc" label="Tên thuốc" min-width="240" show-overflow-tooltip>
            <template #default="{ row }">
              <span v-if="row._rtype === 'dose'">&nbsp;</span>
              <span v-else>{{ row.tenThuoc }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="tenLoaiDonVi" label="Đơn vị" width="120" />
          <el-table-column prop="tongSoLuong" label="Tổng SL" width="120" align="right" />
          <el-table-column prop="donGiaTrungBinh" label="Đơn giá TB" width="140" align="right" />
          <el-table-column prop="tongThanhTien" label="Thành tiền" width="160" align="right" />
          <el-table-column label="Hạn SD" width="140" align="center">
            <template #default="{ row }">
              <span v-if="row._rtype === 'dose'">&nbsp;</span>
              <span v-else>{{ formatDate(row.hanSuDungGanNhat || row.hanSuDung || row.HanSuDung || row.HanSuDungGanNhat) }}</span>
            </template>
          </el-table-column>
        </template>

        <template v-else>
          <el-table-column prop="maThuoc" label="Mã thuốc" width="140">
            <template #default="{ row }">
              <span v-if="row._rtype === 'dose'" style="font-style:italic">Liều dùng: {{ row.__dose }}</span>
              <span v-else>{{ row.maThuoc }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="tenThuoc" label="Tên thuốc" min-width="220" show-overflow-tooltip>
            <template #default="{ row }">
              <span v-if="row._rtype === 'dose'">&nbsp;</span>
              <span v-else>{{ row.tenThuoc }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="maLo" label="Mã lô" width="120">
            <template #default="{ row }">
              <span v-if="row._rtype === 'dose'">&nbsp;</span>
              <span v-else>{{ row.maLo }}</span>
            </template>
          </el-table-column>
          <el-table-column label="Hạn SD" width="140" align="center">
            <template #default="{ row }">
              <span v-if="row._rtype === 'dose'">&nbsp;</span>
              <span v-else>{{ formatDate(row.hanSuDung || row.HanSuDung) }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="soLuong" label="Số lượng" width="120" align="right" />
          <el-table-column prop="tenLoaiDonVi" label="Đơn vị" width="120" align="center" />
          <el-table-column prop="donGia" label="Đơn giá" width="120" align="right" />
          <el-table-column prop="thanhTien" label="Thành tiền" width="140" align="right" />
        </template>
      </el-table>
    </el-card>

    <!-- Footer Summary -->
    <el-card class="footer-card" shadow="hover">
      <div class="footer-content">
        <div class="note-section">
          <div class="note-header">
            <el-icon class="note-icon"><EditPen /></el-icon>
            <span class="note-label">Ghi chú</span>
          </div>
          <p class="note-text">{{ invoice.ghiChu || invoice.GhiChu || 'Không có ghi chú' }}</p>
        </div>
        
        <div class="total-section">
          <div class="total-container">
            <div class="total-label">Tổng thanh toán</div>
            <div class="total-amount">{{ formatPrice(invoice.tongTien || invoice.TongTien || 0) }}</div>
          </div>
        </div>
      </div>
    </el-card>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useRoute } from 'vue-router';
import { ElMessage } from 'element-plus';
import { Document, Calendar, User, Location, Phone, Avatar, InfoFilled, Printer, ArrowLeft, List, EditPen } from '@element-plus/icons-vue';
import api from '@/api';
import { numberToWords } from '@/utils/numberUtils';

const route = useRoute();
const maHD = route.params.maHD || route.params[0] || '';

const invoice = ref({});
const items = ref([]);
const summary = ref([]);
const viewMode = ref('khach');
const isSummary = computed(() => viewMode.value === 'khach');
const tableData = computed(() => (isSummary.value ? summary.value : items.value));

const sortedTableData = computed(() => {
  const src = Array.isArray(tableData.value) ? tableData.value.slice() : [];
  src.sort((a, b) => {
    const aCode = (a.maThuoc || '').toString().toLowerCase();
    const bCode = (b.maThuoc || '').toString().toLowerCase();
    if (aCode < bCode) return -1;
    if (aCode > bCode) return 1;
    const aDate = new Date(a.hanSuDung || a.HanSuDung || a.hanSuDungGanNhat || a.HanSuDungGanNhat || null);
    const bDate = new Date(b.hanSuDung || b.HanSuDung || b.hanSuDungGanNhat || b.HanSuDungGanNhat || null);
    const aTime = Number.isNaN(aDate.getTime()) ? 0 : aDate.getTime();
    const bTime = Number.isNaN(bDate.getTime()) ? 0 : bDate.getTime();
    return aTime - bTime;
  });
  return src;
});

const loading = ref(false);

const displayRows = computed(() => {
  const src = Array.isArray(sortedTableData.value) ? sortedTableData.value : [];
  const out = [];
  src.forEach((it, idx) => {
    out.push(Object.assign({ _rtype: 'item', _origIndex: idx }, it));
    // API may return the dosage field under several names. prefer `tenLD` (seen in summary responses),
    // fallback to older names used previously (`tenLieuDung`, `TenLieuDung`, `tenLieu`).
    const doseText = it.tenLD || it.tenLieuDung || it.TenLieuDung || it.tenLieu || '';
    out.push({ _rtype: 'dose', _origIndex: idx, __dose: doseText });
  });
  return out;
});

const rowKey = (row) => `${row._rtype}_${row._origIndex}_${row.maThuoc || ''}`;

const spanMethod = ({ row, column, rowIndex, columnIndex }) => {
  if (!row || row._rtype !== 'dose') return [1, 1];
  const totalCols = isSummary.value ? 8 : 9;
  if (columnIndex === 0) return [1, 1];
  if (columnIndex === 1) return [1, totalCols - 1];
  return [0, 0];
};

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

const statusOptions = [
  { value: -3, label: 'Chưa hoàn tất xử lý huỷ', type: 'danger' },
  { value: -2, label: 'Đã hoàn tất xử lý huỷ', type: 'danger' },
  { value: -1, label: 'Huỷ', type: 'danger' },
  { value: 0, label: 'Đã đặt', type: 'info' },
  { value: 1, label: 'Đã xác nhận', type: '' },
  { value: 2, label: 'Đã giao', type: 'warning' },
  { value: 3, label: 'Đã nhận', type: 'success' },
];

const mapStatus = (s) => {
  if (s == null) return '';
  const opt = statusOptions.find(o => o.value === s);
  return opt ? opt.label : String(s);
};

const getStatusTagType = (s) => {
  if (s == null) return 'info';
  const opt = statusOptions.find(o => o.value === s);
  return opt ? opt.type : 'info';
};

const loadChiTiet = async () => {
  if (!maHD) return;
  loading.value = true;
  try {
    const resp = await api.hoadon.getChiTiet(maHD);
    const r = (resp && resp.data && typeof resp.data === 'object') ? resp.data : resp;
    const data = r && r.data ? r.data : r;
    invoice.value = (data && data.invoice) ? data.invoice : (data || {});
    items.value = (data && data.items && Array.isArray(data.items)) ? data.items : [];
  } catch (err) {
    console.error('load invoice detail err', err);
    ElMessage.error('Không thể tải chi tiết hóa đơn');
  } finally {
    loading.value = false;
  }
};

const loadSummary = async () => {
  if (!maHD) return;
  loading.value = true;
  try {
    const resp = await api.hoadon.getChiTietSummary(maHD);
    const r = (resp && resp.data && typeof resp.data === 'object') ? resp.data : resp;
    const data = r && r.data ? r.data : r;
    invoice.value = (data && data.invoice) ? data.invoice : (data || {});
    summary.value = (data && data.summary && Array.isArray(data.summary)) ? data.summary : [];
  } catch (err) {
    console.error('load invoice summary err', err);
    ElMessage.error('Không thể tải tổng hợp hóa đơn');
  } finally {
    loading.value = false;
  }
};

const loadData = async () => { if (isSummary.value) await loadSummary(); else await loadChiTiet(); };

const printDetail = () => {
  // Build print page similar to `phieunhap-detail.vue` layout
  const rows = displayRows.value || [];
  const itemsOnly = rows.filter(r => r._rtype === 'item');
  const totalAmount = invoice.value.tongTien || invoice.value.TongTien || itemsOnly.reduce((s, r) => s + (Number(r.thanhTien || r.ThanhTien || r.tongThanhTien || 0) || 0), 0);

  // resolve username for print (use invoice.tenNV if available)
  let tenNhanVien = invoice.value.tenNV || invoice.value.TenNV || '';

  // resolve logos (use Vite asset resolution if available)
  let logoPrimary = '/assets/img/logo/favicon.png';
  let logoFallback = '/assets/img/logo/logo.png';
  try {
    logoPrimary = new URL('../../assets/img/logo/favicon.png', import.meta.url).href;
    try { logoFallback = new URL('../../assets/img/logo/logo.png', import.meta.url).href; } catch (e) { /* ignore */ }
  } catch (e) { /* ignore */ }

  const printWindow = window.open('', '_blank');

  // determine printed-by and time (prefer current user from localStorage, fallback to invoice.tenNV)
  const userStr = localStorage.getItem('user');
  let printedBy = tenNhanVien || '';
  try {
    if (userStr) {
      const u = JSON.parse(userStr);
      printedBy = printedBy || u?.hoTen || u?.tenNV || u?.TenNV || u?.TenDangNhap || u?.username || '';
    }
  } catch (e) { /* ignore parse errors */ }
  const printedAt = new Date().toLocaleString('vi-VN');

  // Table body generation: include dose rows as separate rows with colspan
  const tbody = (() => {
    let html = '';
    let idx = 0;
    for (const r of rows) {
      if (r._rtype === 'item') {
        idx += 1;
        const it = r;
        if (isSummary.value) {
          html += `\n<tr>\n<td class="text-center">${idx}</td>\n<td>${it.maThuoc||''}</td>\n<td>${it.tenThuoc||''}</td>\n<td class="text-center">${it.tenLoaiDonVi||''}</td>\n<td class="text-center">${it.tongSoLuong||''}</td>\n<td class="text-right">${formatPrice(it.donGiaTrungBinh)||''}</td>\n<td class="text-right">${formatPrice(it.tongThanhTien)||''}</td>\n<td class="text-center">${formatDate(it.hanSuDungGanNhat)||''}</td>\n</tr>`;
        } else {
          html += `\n<tr>\n<td class="text-center">${idx}</td>\n<td>${it.maThuoc||''}</td>\n<td>${it.tenThuoc||''}</td>\n<td class="text-center">${it.tenLoaiDonVi||''}</td>\n<td class="text-center">${it.soLuong||''}</td>\n<td class="text-right">${formatPrice(it.donGia||it.DonGia)||''}</td>\n<td class="text-right">${formatPrice(it.thanhTien||it.ThanhTien)||''}</td>\n<td class="text-center">${formatDate(it.hanSuDung||it.HanSuDung)||''}</td>\n</tr>`;
        }
      } else if (r._rtype === 'dose') {
        const safeDose = r.__dose || '';
        html += `\n<tr>\n<td colspan="7">Liều dùng: ${safeDose}</td>\n</tr>`;
      }
    }
    return html;
  })();

  const title = isSummary.value ? 'TỔNG HỢP HÓA ĐƠN' : 'CHI TIẾT HÓA ĐƠN';

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="vi">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Hóa đơn - ${maHD}</title>
      <style>
        body { font-family: 'Times New Roman', serif; margin: 0; padding: 20px; font-size: 13px; }
        .container { max-width: 900px; margin: 0 auto; border: 2px solid #000; padding: 16px; }
        .header { display:flex; gap:12px; align-items:center; justify-content:center; border-bottom: 2px solid #000; padding-bottom: 8px; margin-bottom: 12px; }
        .logo-small { width:100px; max-height:100px; object-fit:contain; margin-right:12px; }
        .company-name { font-size: 20px; font-weight: bold; text-transform: uppercase; margin: 0; }
        .company-info { font-size: 12px; margin: 2px 0; }
        .title { font-size: 18px; font-weight: bold; text-transform: uppercase; margin: 12px 0; text-align: center; }
        .info-section { display:flex; justify-content:space-between; margin-bottom: 12px; }
        table { width:100%; border-collapse: collapse; }
        th, td { border:1px solid #000; padding:6px; vertical-align: top; }
        th { background:#f0f0f0; text-align:center; }
        .text-center { text-align:center; }
        .text-right { text-align:right; }
        .total-section { margin-top:12px; text-align:right; }
        .signature-section { margin-top:24px; display:flex; justify-content:space-between; }
        .signature-box { width:30%; text-align:center; }
        @media print { body { margin:0; } .container { border:none; } }
        .print-info { margin-top: 12px; font-size: 12px; text-align: right; border-top: 1px dashed #000; padding-top: 8px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <img src="${logoPrimary}" class="logo-small" onerror="if(this.dataset.fallback=='1'){this.style.display='none';}else{this.dataset.fallback='1'; this.src='${logoFallback}';}" />
          <div>
            <div class="company-name">NHÀ THUỐC MEDION</div>
            <div class="company-info">Địa chỉ: 140 Lê Trọng Tấn, Tây Thạnh, Tân Phú, TP.HCM</div>
            <div class="company-info">Điện thoại: 0123-456-789</div>
          </div>
        </div>

        <div class="title">${title}</div>

        <div class="info-section">
          <div>
            <div><strong>Mã HĐ:</strong> ${maHD}</div>
            <div><strong>Ngày:</strong> ${formatDate(invoice.value.ngayLap||invoice.value.NgayLap)||''}</div>
            <div><strong>Khách:</strong> ${invoice.value.tenKH||''}</div>
          </div>
          <div>
            <div><strong>Nhân viên:</strong> ${tenNhanVien}</div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th style="width:5%">STT</th>
              <th style="width:10%">Mã thuốc</th>
              <th style="width:40%">Tên thuốc</th>
              <th style="width:10%">Đơn vị</th>
              <th style="width:8%">SL</th>
              <th style="width:12%">Đơn giá</th>
              <th style="width:15%">Thành tiền</th>
              <th style="width:12%">Hạn SD</th>
            </tr>
          </thead>
          <tbody>
            ${tbody}
          </tbody>
        </table>

        <div class="total-section">
          <div><strong>Tổng cộng:</strong> ${formatPrice(totalAmount)}</div>
          <div><strong>Bằng chữ:</strong> ${numberToWords(Math.floor(totalAmount))} đồng</div>
        </div>

        <div class="signature-section">
          <div class="signature-box">Người lập<br/><div class="signature-line">(Ký, ghi rõ họ tên)</div></div>
          <div class="signature-box">Người giao<br/><div class="signature-line">(Ký, ghi rõ họ tên)</div></div>
          <div class="signature-box">Người nhận<br/><div class="signature-line">(Ký, ghi rõ họ tên)</div></div>
        </div>

        <div class="print-info">
          <div>Thời gian in: ${printedAt}</div>
          <div>Người in: ${printedBy}</div>
        </div>
      </div>
    </body>
    </html>
  `;

  printWindow.document.write(htmlContent);
  printWindow.document.close();
  printWindow.print();
};

onMounted(()=>{ loadData(); });
watch(viewMode, ()=>{ loadData(); });
</script>

<style scoped>
.invoice-detail-container {
  padding: 24px;
}

/* Header Card */
.header-card {
  margin-bottom: 24px;
  border-radius: 16px;
  border: none;
  overflow: hidden;
}

.header-card :deep(.el-card__body) {
  padding: 32px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 32px;
}

/* Invoice Title */
.invoice-title {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
}

.title-icon {
  font-size: 28px;
  color: rgba(255, 255, 255, 0.9);
}

.title-text {
  margin: 0;
  font-size: 28px;
  font-weight: 700;
  color: white;
}

.invoice-code {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  font-weight: 600;
  font-size: 14px;
  padding: 8px 16px;
}

/* Meta Information */
.invoice-meta {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.meta-row {
  display: flex;
  gap: 32px;
  flex-wrap: wrap;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 200px;
}

.meta-icon {
  font-size: 18px;
  color: rgba(255, 255, 255, 0.8);
  width: 20px;
  text-align: center;
}

.meta-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.meta-label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.meta-value {
  font-size: 15px;
  color: white;
  font-weight: 600;
}

.meta-subvalue {
  font-size: 13px;
  color: rgba(255,255,255,0.9);
  margin-top: 4px;
  display: block;
  font-weight: 500;
}

.status-tag {
  margin-top: 2px;
  font-weight: 600;
}

/* Header Actions */
.header-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-self: flex-start;
}

.action-btn {
  min-width: 140px;
  height: 40px;
  font-weight: 600;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
}

.action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25);
}

/* View Selector Card */
.view-selector-card {
  margin-bottom: 24px;
  border-radius: 16px;
  border: none;
}

.view-selector-card :deep(.el-card__body) {
  padding: 20px 32px;
  background: white;
}

.view-selector {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.selector-left {
  display: flex;
  align-items: center;
  gap: 20px;
}

.selector-label {
  font-size: 16px;
  font-weight: 600;
  color: #2d3748;
}

.view-mode-group :deep(.el-radio-button) {
  margin-right: 0;
}

.view-mode-group :deep(.el-radio-button__inner) {
  padding: 12px 20px;
  border-radius: 12px;
  font-weight: 600;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.view-mode-group :deep(.el-radio-button__original-radio:checked + .el-radio-button__inner) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-color: #667eea;
  color: white;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.display-mode-tag {
  font-weight: 600;
  padding: 8px 16px;
  border-radius: 20px;
}

/* Table Card */
.table-card {
  margin-bottom: 24px;
  border-radius: 16px;
  border: none;
  overflow: hidden;
}

.table-card :deep(.el-card__header) {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  border-bottom: none;
  padding: 20px 32px;
}

.table-card :deep(.el-card__body) {
  padding: 0;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.table-title {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: white;
  display: flex;
  align-items: center;
  gap: 12px;
}

.item-count {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  font-weight: 600;
}

/* Modern Table */
.modern-table :deep(.el-table__header) {
  background: linear-gradient(135deg, #2d3748 0%, #4a5568 100%);
}

.modern-table :deep(.el-table th) {
  background: transparent !important;
  color: white;
  font-weight: 600;
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: none;
}

.modern-table :deep(.el-table td) {
  border-bottom: 1px solid #e2e8f0;
  padding: 16px 12px;
}

.modern-table :deep(.el-table__row:hover > td) {
  background-color: #f7fafc !important;
}

.modern-table :deep(.el-table--striped .el-table__body tr.el-table__row--striped td) {
  background-color: #f8fafc;
}

/* Footer Card */
.footer-card {
  border-radius: 16px;
  border: none;
  overflow: hidden;
}

.footer-card :deep(.el-card__body) {
  padding: 32px;
  background: linear-gradient(135deg, #1a202c 0%, #2d3748 100%);
  color: white;
}

.footer-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 32px;
}

/* Note Section */
.note-section {
  flex: 1;
}

.note-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.note-icon {
  font-size: 18px;
  color: rgba(255, 255, 255, 0.8);
}

.note-label {
  font-size: 16px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
}

.note-text {
  margin: 0;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.6;
  font-style: italic;
}

/* Total Section */
.total-section {
  display: flex;
  align-items: center;
}

.total-container {
  text-align: right;
}

.total-label {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 8px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.total-amount {
  font-size: 28px;
  font-weight: 800;
  color: #48bb78;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* Responsive Design */
@media (max-width: 768px) {
  .invoice-detail-container {
    padding: 16px;
  }
  
  .header-content {
    flex-direction: column;
    gap: 24px;
  }
  
  .header-actions {
    flex-direction: row;
    align-self: stretch;
  }
  
  .meta-row {
    flex-direction: column;
    gap: 16px;
  }
  
  .view-selector {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }
  
  .footer-content {
    flex-direction: column;
    gap: 24px;
  }
  
  .total-container {
    text-align: left;
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .invoice-detail-container {
    background: linear-gradient(135deg, #1a202c 0%, #2d3748 100%);
  }
}
</style>
