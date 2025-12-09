<template>
  <el-card>
    <div class="page-header">
      <h3> Quy đổi thuốc</h3>
    </div>

    <!-- Details dialog -->
    <el-dialog v-model="detailDialog" width="85%" max-width="1000px" class="detail-dialog" :close-on-click-modal="false">
      <template #header>
        <div class="dialog-header">
          <div class="dialog-title-container">
            <el-icon class="dialog-icon"><Document /></el-icon>
            <div class="dialog-title-text">
              <h3>Chi tiết phiếu quy đổi</h3>
              <p v-if="detailData?.Phieu?.MaPhieuQD">{{ detailData.Phieu.MaPhieuQD }}</p>
            </div>
          </div>
          <el-button type="info" :icon="Close" circle size="small" @click="detailDialog = false" class="close-btn" />
        </div>
      </template>
      
      <div v-loading="detailLoading" class="dialog-body">
        <div v-if="detailData && detailData.Phieu" class="detail-content">
          <!-- Phiếu Info Card -->
          <el-card class="info-card" shadow="hover">
            <template #header>
              <div class="card-header">
                <el-icon class="card-icon"><InfoFilled /></el-icon>
                <span class="card-title">Thông tin phiếu</span>
                <el-tag type="success" size="small">Đã quy đổi</el-tag>
              </div>
            </template>
            <div class="info-grid">
              <div class="info-item">
                <div class="info-label">
                  <el-icon><Document /></el-icon>
                  Mã phiếu
                </div>
                <div class="info-value code-value">{{ detailData.Phieu.MaPhieuQD }}</div>
              </div>
              <div class="info-item">
                <div class="info-label">
                  <el-icon><Calendar /></el-icon>
                  Ngày quy đổi
                </div>
                <div class="info-value">{{ formatDate(detailData.Phieu.NgayQuyDoi) }}</div>
              </div>
              <div class="info-item">
                <div class="info-label">
                  <el-icon><User /></el-icon>
                  Nhân viên thực hiện
                </div>
                <div class="info-value employee-name">{{ detailData.Phieu.NhanVienName }}</div>
              </div>
              <div class="info-item full-width">
                <div class="info-label">
                  <el-icon><EditPen /></el-icon>
                  Ghi chú
                </div>
                <div class="info-value note-value">{{ detailData.Phieu.GhiChu || 'Không có ghi chú đặc biệt' }}</div>
              </div>
            </div>
          </el-card>

          <!-- Chi tiết Table Card -->
          <el-card class="table-card" shadow="hover">
            <template #header>
              <div class="card-header">
                <el-icon class="card-icon"><List /></el-icon>
                <span class="card-title">Chi tiết quy đổi thuốc</span>
                <el-tag type="info" size="small">{{ (detailData.ChiTiets || []).length }} mục</el-tag>
              </div>
            </template>
            <div class="table-container">
              <el-table :data="detailData.ChiTiets || []" class="details-table" stripe border>
                <el-table-column type="index" label="STT" width="60" align="center" />
                <el-table-column prop="MaThuoc" label="Mã thuốc" width="120" align="center">
                  <template #default="{ row }">
                    <el-tag size="small" type="warning">{{ row.MaThuoc }}</el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="TenThuoc" label="Tên thuốc" min-width="250">
                  <template #default="{ row }">
                    <div class="drug-name">{{ row.TenThuoc }}</div>
                  </template>
                </el-table-column>
                <el-table-column label="Lô hàng" width="320">
                  <template #default="{ row }">
                    <div class="lot-info">
                      <div class="lot-item">
                        <span class="lot-label">Gốc:</span>
                        <el-tag size="small" class="lot-tag">{{ row.MaLoGoc }}</el-tag>
                      </div>
                      <el-icon class="arrow-icon"><Right /></el-icon>
                      <div class="lot-item">
                        <span class="lot-label">Mới:</span>
                        <el-tag size="small" type="success" class="lot-tag">{{ row.MaLoMoi }}</el-tag>
                      </div>
                    </div>
                  </template>
                </el-table-column>
                <el-table-column label="Số lượng & Đơn vị" width="280">
                  <template #default="{ row }">
                    <div class="quantity-info">
                      <div class="quantity-row">
                        <span class="qty-label">Gốc:</span>
                        <span class="qty-number">{{ row.SoLuongGoc }}</span>
                        <el-tag size="small" type="info">{{ row.MaLoaiDonViGocName }}</el-tag>
                      </div>
                      <div class="conversion-arrow">
                        <el-icon><ArrowDown /></el-icon>
                        <span class="ratio">{{ row.TyLeQuyDoi }}:1</span>
                      </div>
                      <div class="quantity-row">
                        <span class="qty-label">Mới:</span>
                        <span class="qty-number highlight">{{ row.SoLuongQuyDoi }}</span>
                        <el-tag size="small" type="success">{{ row.MaLoaiDonViMoiName }}</el-tag>
                      </div>
                    </div>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </el-card>
        </div>
        
        <div v-else class="no-data">
          <el-icon class="no-data-icon"><DocumentRemove /></el-icon>
          <h4>Không có dữ liệu</h4>
          <p>Không thể tải thông tin chi tiết phiếu quy đổi</p>
        </div>
      </div>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button type="info" :icon="Close" @click="detailDialog = false">Đóng</el-button>
          <el-button type="primary" :icon="Printer" @click="printDetails">In phiếu</el-button>
        </div>
      </template>
    </el-dialog>

    <div class="controls">
      <div class="control-with-label">
        <div class="control-label">Từ ngày</div>
        <el-date-picker class="date-input" v-model="start" type="date" placeholder="Từ ngày" format="DD/MM/YYYY" value-format="YYYY-MM-DD" />
      </div>

      <div class="control-with-label">
        <div class="control-label">Đến ngày</div>
        <el-date-picker class="date-input" v-model="end" type="date" placeholder="Đến ngày" format="DD/MM/YYYY" value-format="YYYY-MM-DD" />
      </div>

      <div class="control-with-label">
        <div class="control-label">Mã NV</div>
        <el-select class="employee-select" v-model="filterMaNV" placeholder="Chọn nhân viên" clearable>
          <el-option v-for="e in employees" :key="e.MaNV" :label="e.HoTen || e.MaNV" :value="e.MaNV" />
        </el-select>
      </div>

      <div class="control-with-label search-control">
        <div class="control-label">Mã Lô</div>
        <el-input class="search-input" v-model="searchMaLo" placeholder="Tìm theo mã lô" clearable />
      </div>

      <div class="control-action">
        <el-button type="warning" @click="exportCsv" :disabled="displayedItems.length===0">
          <i class="fas fa-file-excel"></i>
          Xuất CSV
        </el-button>
      </div>
    </div>

    <div style="margin-top:12px">
      <el-table :data="paginatedItems" stripe v-loading="loading" style="width:100%">
        <el-table-column label="STT" width="80">
          <template #default="{ row, $index }">{{ (currentPage - 1) * pageSize + ($index + 1) }}</template>
        </el-table-column>
        <el-table-column prop="MaPhieuQD" label="Mã phiếu" width="220" />
        <el-table-column prop="NgayQuyDoi" label="Ngày quy đổi" width="160">
          <template #default="{ row }">{{ formatDate(row.NgayQuyDoi) }}</template>
        </el-table-column>
        <el-table-column prop="NhanVienName" label="Nhân viên" width="300" />
        <el-table-column prop="GhiChu" label="Ghi chú" />
        <el-table-column label="Thao tác" width="120">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="viewDetails(row.MaPhieuQD)">Xem</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div style="margin-top:12px; display:flex; justify-content:flex-end; align-items:center">
        <div>
          <el-pagination
            background
            layout="prev, pager, next"
            :total="displayedItems.length"
            :page-size="pageSize"
            v-model:current-page="currentPage"
            @current-change="(p) => (currentPage = p)"
            small
          />
        </div>
      </div>
    </div>
  </el-card>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue';
import nhanvienApi from '@/api/nhanvien';
import api from '@/api/axios';
import { ElMessage } from 'element-plus';
import { 
  Document, 
  Close, 
  InfoFilled, 
  Calendar, 
  User, 
  EditPen, 
  List, 
  Right, 
  ArrowDown, 
  DocumentRemove, 
  Printer 
} from '@element-plus/icons-vue';

const start = ref(null);
const end = ref(null);
const filterMaNV = ref('');
const searchMaLo = ref('');
const employees = ref([]);
const items = ref([]);
const loading = ref(false);
// pagination
const pageSize = 10;
const currentPage = ref(1);


const formatDate = (d) => {
  if (!d) return '';
  try { return new Date(d).toLocaleDateString(); } catch { return d; }
};

// Set default range: from first day of current month to today
const setDefaultRange = () => {
  const today = new Date();
  // Start from 1 month ago (same date, but one month back)
  const oneMonthAgo = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
  const fmt = (dt) => {
    const y = dt.getFullYear();
    const m = String(dt.getMonth() + 1).padStart(2, '0');
    const d = String(dt.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };
  start.value = fmt(oneMonthAgo);
  end.value = fmt(today);
};

const fetchList = async () => {
  if (!start.value || !end.value) {
    ElMessage.warning('Vui lòng chọn cả Từ ngày và Đến ngày');
    return;
  }
  loading.value = true;
  items.value = [];
  try {
    const params = { start: start.value, end: end.value };
    if (filterMaNV.value && filterMaNV.value.toString().trim() !== '') params.maNV = filterMaNV.value.toString().trim();
    const res = await api.get('/PhieuQuyDoi/List', { params });
    const d = res?.data?.data || res?.data || res;
    items.value = (d && d.Items) ? d.Items : (Array.isArray(d) ? d : []);
  } catch (err) {
    console.error('fetchList error', err);
    ElMessage.error('Lấy danh sách phiếu quy đổi thất bại');
  } finally {
    loading.value = false;
  }
};

const displayedItems = computed(() => {
  const list = items.value || [];
  const q = (searchMaLo.value || '').toString().trim().toLowerCase();
  if (!q) return list;
  return list.filter((it) => {
    try { return JSON.stringify(it).toLowerCase().includes(q); } catch (e) { return false; }
  });
});

const paginatedItems = computed(() => {
  const list = displayedItems.value || [];
  const startIdx = (currentPage.value - 1) * pageSize;
  return list.slice(startIdx, startIdx + pageSize);
});

const exportCsv = () => {
  const cols = ['MaPhieuQD','NgayQuyDoi','NhanVienName','GhiChu'];
  const lines = [cols.join(',')];
  const exportList = displayedItems.value || [];
  exportList.forEach((r) => {
    const vals = [
      `"${(r.MaPhieuQD||'').toString().replace(/"/g,'""')}"`,
      `"${(r.NgayQuyDoi||'').toString()}"`,
      `"${(r.NhanVienName||'').toString().replace(/"/g,'""')}"`,
      `"${(r.GhiChu||'').toString().replace(/"/g,'""')}"`
    ];
    lines.push(vals.join(','));
  });
  // Use CRLF for Windows Excel and prepend UTF-8 BOM so Excel recognizes UTF-8 correctly
  const csvContent = lines.join('\r\n');
  const bom = '\uFEFF';
  const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `phieu-quydoi-${start.value || ''}_to_${end.value || ''}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};

// details dialog state and loader
const detailDialog = ref(false);
const detailData = ref(null);
const detailLoading = ref(false);

const viewDetails = async (id) => {
  if (!id) return;
  detailLoading.value = true;
  detailData.value = null;
  try {
    const res = await api.get(`/PhieuQuyDoi/Details/${id}`);
    const d = res?.data?.data || res?.data || res;
    // API returns { Phieu, ChiTiets }
    detailData.value = d || null;
    detailDialog.value = true;
  } catch (err) {
    console.error('viewDetails error', err);
    ElMessage.error('Lấy chi tiết thất bại');
  } finally {
    detailLoading.value = false;
  }
};

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

const printDetails = () => {
  if (!detailData.value || !detailData.value.Phieu) return;

  const phieu = detailData.value.Phieu;
  const chiTiets = detailData.value.ChiTiets || [];
  const logoUrl = logoPrimary || logoFallback || '';

  // Create HTML content for print
  const printContent = `
    <!DOCTYPE html>
    <html lang="vi">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Phiếu quy đổi - ${phieu.MaPhieuQD}</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Segoe UI', Arial, sans-serif;
          color: #333;
          background: white;
        }
        
        .print-container {
          width: 210mm;
          height: 297mm;
          margin: 0 auto;
          padding: 20mm;
          background: white;
          color: #000;
        }
        
        /* Header */
        .header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 2px solid #667eea;
          padding-bottom: 15px;
          margin-bottom: 20px;
        }
        
        .logo-section {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        
        .logo-section img {
          width: 50px;
          height: 50px;
          object-fit: contain;
        }
        
        .pharmacy-info h1 {
          font-size: 24px;
          font-weight: 700;
          color: #667eea;
          margin: 0;
        }
        
        .pharmacy-info p {
          font-size: 12px;
          color: #666;
          margin: 2px 0;
        }
        
        .document-title {
          text-align: right;
          font-weight: 600;
          color: #667eea;
          font-size: 18px;
        }
        
        .document-code {
          text-align: right;
          font-size: 13px;
          color: #666;
          margin-top: 4px;
          font-family: 'Courier New', monospace;
        }
        
        /* Content Sections */
        .section {
          margin-bottom: 20px;
        }
        
        .section-title {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 8px 12px;
          font-weight: 600;
          font-size: 13px;
          border-radius: 4px;
          margin-bottom: 12px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .info-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
          margin-bottom: 12px;
        }
        
        .info-item {
          border: 1px solid #e0e0e0;
          padding: 8px 12px;
          border-radius: 4px;
          background: #f8f9fa;
        }
        
        .info-label {
          font-weight: 600;
          font-size: 11px;
          color: #666;
          text-transform: uppercase;
          letter-spacing: 0.3px;
          margin-bottom: 4px;
        }
        
        .info-value {
          font-size: 13px;
          color: #333;
          font-weight: 500;
        }
        
        .info-value.code {
          font-family: 'Courier New', monospace;
          color: #17a2b8;
          font-weight: 600;
        }
        
        /* Table */
        .details-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 12px;
          font-size: 12px;
        }
        
        .details-table thead {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }
        
        .details-table th {
          padding: 8px;
          text-align: left;
          font-weight: 600;
          border: 1px solid #667eea;
          font-size: 11px;
        }
        
        .details-table td {
          padding: 8px;
          border: 1px solid #ddd;
          text-align: left;
        }
        
        .details-table tbody tr:nth-child(even) {
          background: #f8f9fa;
        }
        
        .details-table tbody tr:hover {
          background: #e3f2fd;
        }
        
        .stt { text-align: center; width: 30px; }
        .ma-thuoc { font-family: 'Courier New', monospace; color: #17a2b8; font-weight: 600; }
        .so-luong { text-align: right; font-weight: 600; }
        
        /* Summary */
        .summary {
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
          border: 1px solid #e0e0e0;
          padding: 12px;
          border-radius: 4px;
          margin-top: 20px;
        }
        
        .summary-row {
          display: flex;
          justify-content: space-between;
          margin: 6px 0;
          font-size: 12px;
        }
        
        .summary-row.total {
          font-weight: 700;
          font-size: 13px;
          color: #667eea;
          border-top: 2px solid #667eea;
          padding-top: 8px;
          margin-top: 8px;
        }
        
        /* Footer */
        .footer {
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #ddd;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
          font-size: 11px;
          text-align: center;
        }
        
        .footer-section h4 {
          font-weight: 600;
          margin-bottom: 30px;
          font-size: 12px;
        }
        
        .footer-section p {
          margin: 2px 0;
          color: #666;
        }
        
        /* Notes */
        .notes {
          background: #fff3cd;
          border-left: 4px solid #ffc107;
          padding: 10px 12px;
          margin-top: 15px;
          border-radius: 4px;
          font-size: 11px;
          color: #856404;
        }
        
        .notes-label {
          font-weight: 600;
          margin-bottom: 4px;
        }
        
        /* Print Styles */
        @media print {
          body {
            margin: 0;
            padding: 0;
          }
          
          .print-container {
            width: 100%;
            height: 100%;
            padding: 0;
            margin: 0;
            page-break-after: avoid;
          }
        }
        
        @page {
          size: A4;
          margin: 0;
        }
      </style>
    </head>
    <body>
      <div class="print-container">
        <!-- Header -->
        <div class="header">
          <div class="logo-section">
            ${logoUrl ? `<img src="${logoUrl}" alt="Logo" />` : ''}
            <div class="pharmacy-info">
              <h1>TIỆM THUỐC TÂY MEDION</h1>
              <p>Chuyên cung cấp thuốc chất lượng cao</p>
              <p>Hotline: 1900-XXXX-XX | Website: medion.vn</p>
            </div>
          </div>
          <div>
            <div class="document-title">PHIẾU QUY ĐỔI THUỐC</div>
            <div class="document-code">${phieu.MaPhieuQD}</div>
          </div>
        </div>
        
        <!-- Information Section -->
        <div class="section">
          <div class="section-title">Thông tin chung</div>
          <div class="info-grid">
            <div class="info-item">
              <div class="info-label">Mã phiếu</div>
              <div class="info-value code">${phieu.MaPhieuQD}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Ngày quy đổi</div>
              <div class="info-value">${formatDate(phieu.NgayQuyDoi)}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Nhân viên thực hiện</div>
              <div class="info-value">${phieu.NhanVienName || 'N/A'}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Trạng thái</div>
              <div class="info-value" style="color: #28a745; font-weight: 700;">✓ Đã quy đổi</div>
            </div>
          </div>
        </div>
        
        <!-- Details Section -->
        <div class="section">
          <div class="section-title">Chi tiết quy đổi (${chiTiets.length} mục)</div>
          <table class="details-table">
            <thead>
              <tr>
                <th class="stt">STT</th>
                <th>Mã thuốc</th>
                <th>Tên thuốc</th>
                <th>Lô gốc</th>
                <th>Lô mới</th>
                <th>Số lượng gốc</th>
                <th>Tỉ lệ</th>
                <th>Số lượng mới</th>
              </tr>
            </thead>
            <tbody>
              ${chiTiets.map((item, idx) => `
                <tr>
                  <td class="stt">${idx + 1}</td>
                  <td class="ma-thuoc">${item.MaThuoc}</td>
                  <td>${item.TenThuoc}</td>
                  <td>${item.MaLoGoc}</td>
                  <td>${item.MaLoMoi}</td>
                  <td class="so-luong">${item.SoLuongGoc} ${item.MaLoaiDonViGocName || ''}</td>
                  <td style="text-align: center; font-weight: 600;">${item.TyLeQuyDoi}:1</td>
                  <td class="so-luong" style="color: #28a745; font-weight: 700;">${item.SoLuongQuyDoi} ${item.MaLoaiDonViMoiName || ''}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        
        <!-- Summary -->
        <div class="summary">
          <div class="summary-row">
            <span>Tổng số mục:</span>
            <strong>${chiTiets.length}</strong>
          </div>
          <div class="summary-row total">
            <span>Tổng số lượng quy đổi:</span>
            <strong>${chiTiets.reduce((sum, item) => sum + (item.SoLuongQuyDoi || 0), 0)} đơn vị</strong>
          </div>
        </div>
        
        <!-- Notes -->
        ${phieu.GhiChu ? `
          <div class="notes">
            <div class="notes-label">Ghi chú:</div>
            <div>${phieu.GhiChu}</div>
          </div>
        ` : ''}
        
        <!-- Footer -->
        <div class="footer">
          <div class="footer-section">
            <h4>Nhân viên thực hiện</h4>
            <p>${phieu.NhanVienName || '________________________'}</p>
            <p style="margin-top: 25px; font-size: 10px; color: #999;">(Ký và ghi rõ họ tên)</p>
          </div>
          <div class="footer-section">
            <h4>Người duyệt</h4>
            <p>________________________</p>
            <p style="margin-top: 25px; font-size: 10px; color: #999;">(Ký và ghi rõ họ tên)</p>
          </div>
          <div class="footer-section">
            <h4>Ngày in: ${new Date().toLocaleDateString('vi-VN')}</h4>
            <p>________________________</p>
            <p style="margin-top: 25px; font-size: 10px; color: #999;">(Dấu của cơ quan)</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  // Open print window
  const printWindow = window.open('', '_blank');
  printWindow.document.write(printContent);
  printWindow.document.close();
  
  // Wait for content to load, then trigger print
  setTimeout(() => {
    printWindow.focus();
    printWindow.print();
  }, 500);
};

onMounted(() => {
  setDefaultRange();
  fetchList();
  // load employees for MaNV select
  (async () => {
    try {
      const res = await nhanvienApi.getAll();
      const d = res?.data || res;
      // API may return array or { data: [...] }
      const list = Array.isArray(d) ? d : (d?.data && Array.isArray(d.data) ? d.data : (d?.Items && Array.isArray(d.Items) ? d.Items : []));
      employees.value = list.map((it) => ({ MaNV: it.MaNV || it.maNV || it.Ma || it.id || '', HoTen: it.HoTen || it.hoTen || it.HoVaTen || it.hovaten || it.Ten || it.ten || it.TenDangNhap || it.username || '' }));
    } catch (err) {
      console.error('load employees error', err);
    }
  })();
});

// auto-refresh when filters change (start/end/maNV)
watch([start, end, filterMaNV], () => {
  // only fetch when start and end are set
  if (start.value && end.value) fetchList();
});

// reset to first page when displayed items change
watch(() => displayedItems.value.length, () => { currentPage.value = 1; });
</script>

<style scoped>
.page-header h3 { margin: 0; }

/* Controls Layout */
.controls {
  margin: 12px 0;
  display: flex;
  gap: 8px;
  align-items: flex-end;
  flex-wrap: nowrap;
  overflow-x: auto;
}

.control-with-label {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

.control-with-label.search-control {
  flex-grow: 1;
  flex-shrink: 1;
  min-width: 180px;
}

.control-label {
  font-size: 13px;
  color: var(--el-text-color-secondary);
  text-align: left;
  white-space: nowrap;
  flex-shrink: 0;
}

.control-action {
  margin-left: auto;
  justify-content: center;
  display: flex;
  align-items: center;
  gap: 6px;
}

.date-input { min-width: 140px; width: 140px; }
.employee-select { min-width: 150px; width: 150px; }
.search-input { width: 100%; min-width: 180px; }
.control-action .el-button { white-space: nowrap; }

/* When sidebar overlaps, ensure header and controls remain visible */
.page-header, .controls { position:relative; z-index:2 }

/* add a small left offset so labels don't sit under a fixed sidebar */
.page-header { padding-left: 16px }
.controls { padding-left: 8px }

/* removed fixed left margin — layout should be controlled by app shell, not this view */

/* Detail Dialog Styles */
.detail-dialog :deep(.el-dialog) {
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
  max-height: 95vh;
  margin-top: 0;
  display: flex;
  flex-direction: column;
}

/* Force the dialog wrapper to align to the top of the viewport so the
   whole dialog appears higher (not increasing its height). This overrides
   Element Plus default centering. */
.detail-dialog :deep(.el-dialog__wrapper) {
  align-items: flex-start !important;
  padding-top: 10px !important;
}

.detail-dialog :deep(.el-dialog__header) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 0;
  margin: 0;
  border-bottom: none;
}

.dialog-header {
  padding: 2px 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: white;
}

.dialog-title-container {
  display: flex;
  align-items: center;
  gap: 16px;
}

.dialog-icon {
  font-size: 32px;
  opacity: 0.9;
}

.dialog-title-text h3 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
}

.dialog-title-text p {
  margin: 0;
  font-size: 14px;
  opacity: 0.8;
  font-family: 'Monaco', monospace;
}

.close-btn {
  background: rgba(255, 255, 255, 0.2) !important;
  border: 1px solid rgba(255, 255, 255, 0.3) !important;
  color: white !important;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.3) !important;
  transform: rotate(90deg);
}

.dialog-body {
  padding: 4px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  min-height: 300px;
  max-height: 80vh;
  overflow-y: auto;
}

.detail-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

/* Info Card */
.info-card {
  border-radius: 16px;
  border: none;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.info-card :deep(.el-card__header) {
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  border-bottom: 1px solid #e9ecef;
  padding: 6px 16px;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.card-icon {
  font-size: 20px;
  color: #667eea;
}

.card-title {
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
  margin-right: auto;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
  gap: 4px;
  padding: 6px 8px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.info-item.full-width {
  grid-column: 1 / -1;
}

.info-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 600;
  color: #6c757d;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-label .el-icon {
  font-size: 16px;
  color: #667eea;
}

.info-value {
  font-size: 14px;
  color: #2c3e50;
  font-weight: 500;
  padding: 6px 8px;
  background: #f8f9fa;
  border-radius: 6px;
  border-left: 4px solid #667eea;
}

.code-value {
  font-family: 'Monaco', 'Menlo', monospace;
  background: #e8f4f8;
  border-left-color: #17a2b8;
  color: #17a2b8;
  font-weight: 600;
}

.employee-name {
  background: #e8f5e8;
  border-left-color: #28a745;
  color: #28a745;
}

.note-value {
  background: #fff3cd;
  border-left-color: #ffc107;
  color: #856404;
  font-style: italic;
}

/* Table Card */
.table-card {
  border-radius: 16px;
  border: none;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.table-card :deep(.el-card__header) {
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  border-bottom: 2px solid #e9ecef;
  padding: 10px 20px;
}

.table-container {
  padding: 0;
  max-height: 400px;
  overflow-y: auto;
}

.details-table {
  border-radius: 0;
}

.details-table :deep(.el-table__header) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.details-table :deep(.el-table th) {
  background: transparent;
  color: white;
  font-weight: 600;
  font-size: 13px;
  text-align: center;
  border-bottom: none;
}

.details-table :deep(.el-table td) {
  padding: 8px 4px;
  vertical-align: middle;
}

.details-table :deep(.el-table__row:nth-child(even)) {
  background-color: #f8f9fa;
}

.details-table :deep(.el-table__row:hover) {
  background-color: #e3f2fd !important;
}

.drug-name {
  font-weight: 500;
  color: #2c3e50;
  line-height: 1.35;
  white-space: normal;
  word-break: break-word;
  overflow-wrap: anywhere;
  display: block;
}

/* Lot Info Styling */
.lot-info {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 8px;
}

.lot-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.lot-label {
  font-size: 11px;
  color: #6c757d;
  font-weight: 600;
}

.lot-tag {
  font-family: 'Monaco', monospace;
  min-width: 80px;
  text-align: center;
}

.arrow-icon {
  font-size: 16px;
  color: #667eea;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 0.6; }
  50% { opacity: 1; }
}

/* Quantity Info Styling */
.quantity-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 8px;
  background: #f8f9fa;
  border-radius: 8px;
}

.quantity-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.qty-label {
  font-size: 11px;
  color: #6c757d;
  font-weight: 600;
  min-width: 30px;
}

.qty-number {
  font-weight: 700;
  font-size: 14px;
  color: #495057;
  min-width: 40px;
  text-align: right;
}

.qty-number.highlight {
  color: #28a745;
  font-size: 16px;
}

.conversion-arrow {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  margin: 4px 0;
}

.conversion-arrow .el-icon {
  color: #667eea;
}

.ratio {
  font-size: 11px;
  font-weight: 600;
  color: #667eea;
  background: white;
  padding: 2px 6px;
  border-radius: 4px;
  border: 1px solid #667eea;
}

/* No Data State */
.no-data {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  text-align: center;
  color: #6c757d;
}

.no-data-icon {
  font-size: 64px;
  margin-bottom: 16px;
  opacity: 0.3;
}

.no-data h4 {
  margin: 0 0 8px 0;
  font-size: 18px;
  color: #495057;
}

.no-data p {
  margin: 0;
  font-size: 14px;
}

/* Dialog Footer */
.dialog-footer {
  padding: 16px 20px;
  background: #f8f9fa;
  border-top: 2px solid #e9ecef;
  display: flex;
  justify-content: center;
  gap: 12px;
}

.dialog-footer .el-button {
  padding: 10px 20px;
  font-weight: 600;
  border-radius: 6px;
  transition: all 0.3s ease;
}

.dialog-footer .el-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
}

/* Responsive Design */
@media (max-width: 768px) {
  .detail-dialog :deep(.el-dialog) {
    width: 90% !important;
    margin: 0.5vh auto;
    max-height: 99vh;
  }
  
  .dialog-header {
    padding: 6px 8px;
  }
  
  .dialog-body {
    padding: 6px;
    max-height: 70vh;
  }
  
  .info-grid {
    grid-template-columns: 1fr;
    gap: 16px;
    padding: 20px;
  }
  
  .details-table :deep(.el-table) {
    font-size: 12px;
  }
  
  .dialog-footer {
    padding: 16px 20px;
  }
}
</style>

<!-- Global override for teleported Element Plus dialog wrapper -->
<style>
/* Element Plus teleports dialog wrapper to <body>, so scoped styles here won't apply.
   Use a global rule to pin the dialog higher (align to top) without increasing height. */
.el-dialog__wrapper {
  align-items: flex-start !important;
  padding-top: 10px !important;
}

/* Target the specific dialog instance (it has the `detail-dialog` class) and
   reduce its margin so it sits near the top. Use !important to override JS-set
   inline margins or library defaults. */
.el-dialog.detail-dialog {
  margin: 20px auto !important;
  top: 0 !important;
  transform: none !important;
}

/* Make sure the dialog itself doesn't add extra top margin in the wrapper */
.el-dialog__wrapper .el-dialog {
  margin-top: 0 !important;
}

@media (max-width: 768px) {
  .el-dialog__wrapper { padding-top: 4px !important; }
  .el-dialog.detail-dialog { margin: 4px auto !important; }
}
</style>
