<template>
  <div class="admin-phieunhap-detail">
    <el-card class="admin-card">
      <template #header>
        <div class="detail-header">
          <div class="detail-header-left">
            <h3>Chi tiết Phiếu Nhập</h3>
            <div class="detail-sub">Mã phiếu: <strong>{{ selected?.maPN }}</strong></div>
          </div>
          <div class="detail-header-actions">
            <el-button type="default" @click="goBack">
              <template #icon>
                <el-icon><ArrowLeft /></el-icon>
              </template>
              Quay lại
            </el-button>
            <el-tooltip content="Sao chép mã phiếu" placement="top">
              <el-button type="primary" @click="copyMaPN">
                <template #icon>
                  <el-icon><CopyDocument /></el-icon>
                </template>
                Sao chép
              </el-button>
            </el-tooltip>
            <el-tooltip content="In phiếu" placement="top">
              <el-button type="success" @click="doPrint">
                <template #icon>
                  <el-icon><Printer /></el-icon>
                </template>
                In
              </el-button>
            </el-tooltip>
          </div>
        </div>
      </template>

      <div v-loading="loading" element-loading-text="Đang tải...">
        <div class="top-section">
          <div class="meta-left">
            <div class="meta-card">
              <span class="label">Ngày nhập</span>
              <span class="value">{{ formatDateOnly(selected?.ngayNhap) }}</span>
            </div>
            <div class="meta-card">
              <span class="label">Nhà cung cấp</span>
              <span class="value">{{ selected?.tenNCC }}</span>
            </div>
            <div class="meta-card">
              <span class="label">Nhân viên</span>
              <span class="value">{{ selected?.tenNV }}</span>
            </div>
          </div>
          <div class="meta-right">
            <div class="total-highlight">
              <span class="label">Tổng tiền</span>
              <span class="value">{{ formatPrice(totalAmount) }}</span>
              <div class="muted">{{ detailItems.length }} mặt hàng</div>
            </div>
          </div>
        </div>

        <el-table :data="detailItems" style="width:100%; margin-top:20px">
          <el-table-column prop="maCTPN" label="Mã CTPN" width="160" />
          <el-table-column prop="maLo" label="Mã lô" width="140" />
          <el-table-column prop="tenThuoc" label="Tên thuốc" width="360" />
          <el-table-column prop="tenLoaiDonVi" label="Loại đơn vị" width="120" />
          <el-table-column prop="soLuong" label="Số lượng" width="100" />
          <el-table-column prop="donGia" label="Đơn giá" width="120">
            <template #default="{ row }">{{ formatPrice(row.donGia) }}</template>
          </el-table-column>
          <el-table-column prop="thanhTien" label="Thành tiền" width="140">
            <template #default="{ row }">{{ formatPrice(row.thanhTien) }}</template>
          </el-table-column>
          <el-table-column label="Hạn sử dụng" width="140">
            <template #default="{ row }">{{ formatDateOnly(row.hanSuDung) }}</template>
          </el-table-column>
          <el-table-column prop="ghiChu" label="Ghi chú" width="200" />
        </el-table>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/store/auth';
import { ArrowLeft, CopyDocument, Printer } from '@element-plus/icons-vue';
import api from '@/api';
import { numberToWords } from '@/utils/numberUtils';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const maPN = route.params.maPN || route.query.maPN || '';
const loading = ref(false);
const selected = ref(null);
const detailItems = ref([]);

const totalAmount = computed(() => {
  if (!Array.isArray(detailItems.value)) return 0;
  return detailItems.value.reduce((acc, it) => {
    const v = (it && (Number(it.thanhTien) || Number(it.thanhTien) === 0)) ? Number(it.thanhTien) : ((it && it.soLuong && it.donGia) ? Number(it.soLuong) * Number(it.donGia) : 0);
    return acc + (Number.isFinite(v) ? v : 0);
  }, 0);
});

const formatDateOnly = (v) => {
  if (!v) return '';
  const d = typeof v === 'string' ? new Date(v) : v;
  if (Number.isNaN(d.getTime())) return '';
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

const formatPrice = (v) => {
  if (!v && v !== 0) return '';
  return Number(v).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
};

const copyMaPN = () => {
  if (selected.value && selected.value.maPN) {
    navigator.clipboard.writeText(selected.value.maPN).then(() => {
      ElMessage.success('Đã sao chép mã phiếu');
    }).catch(() => {
      ElMessage.error('Không thể sao chép');
    });
  }
};

const doPrint = async () => {
  const currentUser = authStore.currentUser;
  console.log('Current user:', currentUser); // Debug log
  console.log('User properties:', Object.keys(currentUser || {})); // Debug log

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
  // resolve logo for print: prefer Vite-resolved asset `favicon.png`, fallback to `logo.png` or public path
  let logoPrimary = '/assets/img/logo/favicon.png';
  let logoFallback = '/assets/img/logo/logo.png';
  try {
    logoPrimary = new URL('../../assets/img/logo/favicon.png', import.meta.url).href;
    try { logoFallback = new URL('../../assets/img/logo/logo.png', import.meta.url).href; } catch (e) { /* ignore */ }
  } catch (e) {
    // use public path defaults
  }

  const printWindow = window.open('', '_blank');
  const htmlContent = `
    <!DOCTYPE html>
    <html lang="vi">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Phiếu Nhập - ${selected.value?.maPN || ''}</title>
      <style>
        body { font-family: 'Times New Roman', serif; margin: 0; padding: 20px; font-size: 14px; line-height: 1.4; }
        .container { max-width: 800px; margin: 0 auto; border: 2px solid #000; padding: 20px; }
        .header { display:flex; gap:12px; align-items:center; justify-content:center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 20px; }
        .logo-small { width:120px; max-height:120px; object-fit:contain; margin-right:12px; }
        .company-name { font-size: 26px; font-weight: bold; text-transform: uppercase; margin: 0; }
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
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header" style="display:flex; gap:12px; align-items:center; justify-content:center;">
          <img src="${logoPrimary}" class="logo-small" onerror="if(this.dataset.fallback=='1'){this.style.display='none';}else{this.dataset.fallback='1'; this.src='${logoFallback}';}" />
          <div>
            <div class="company-name">NHÀ THUỐC MEDION</div>
            <div class="company-info">Địa chỉ: 140 Lê Trọng Tấn, Tân Phú, Thành phố Hồ Chí Minh</div>
            <div class="company-info">Điện thoại: (028) 1234-5678 | Email: medion@thuoc.com</div>
            <div class="company-info">MST: 0123456789</div>
          </div>
        </div>

        <div class="title">PHIẾU NHẬP HÀNG</div>

        <div class="info-section">
          <div class="info-group">
            <div><span class="info-label">Mã phiếu:</span> ${selected.value?.maPN || ''}</div>
            <div><span class="info-label">Ngày nhập:</span> ${formatDateOnly(selected.value?.ngayNhap) || ''}</div>
          </div>
          <div class="info-group">
            <div><span class="info-label">Nhà cung cấp:</span> ${selected.value?.tenNCC || ''}</div>
            <div><span class="info-label">Nhân viên nhập:</span> ${selected.value?.tenNV || ''}</div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th style="width: 5%;">STT</th>
              <th style="width: 10%;">Mã thuốc</th>
              <th style="width: 25%;">Tên thuốc</th>
              <th style="width: 10%;">Đơn vị</th>
              <th style="width: 8%;">Số lượng</th>
              <th style="width: 12%;">Đơn giá</th>
              <th style="width: 15%;">Thành tiền</th>
              <th style="width: 15%;">Hạn dùng</th>
            </tr>
          </thead>
          <tbody>
            ${detailItems.value.map((item, index) => `
              <tr>
                <td class="text-center">${index + 1}</td>
                <td>${item.maThuoc || ''}</td>
                <td>${item.tenThuoc || ''}</td>
                <td class="text-center">${item.tenLoaiDonVi || ''}</td>
                <td class="text-center">${item.soLuong || ''}</td>
                <td class="text-right">${formatPrice(item.donGia) || ''}</td>
                <td class="text-right">${formatPrice(item.thanhTien) || ''}</td>
                <td class="text-center">${formatDateOnly(item.hanSuDung) || ''}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="total-section">
          <div class="text-right">
            <span class="total-label">Tổng cộng: </span>
            <span class="total-amount">${formatPrice(totalAmount.value) || ''}</span>
          </div>
          <div class="text-right" style="margin-top: 10px;">
            <span class="total-label">Bằng chữ: </span>
            <span class="total-words">${numberToWords(Math.floor(totalAmount.value))} đồng</span>
          </div>
          <div class="text-right" style="margin-top: 10px;">
            <span class="total-label">Số lượng hàng: </span>
            <span class="total-words">${detailItems.value.length} mặt hàng</span>
          </div>
        </div>

        <div class="signature-section">
          <div class="signature-box">
            <div>Người lập phiếu</div>
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

const normalizePhieu = (p) => {
  if (!p) return null;
  return {
    maPN: p.maPN || p.MaPN || p.MaPhieu || p.MAPN || '',
    ngayNhap: p.ngayNhap || p.NgayNhap || p.NgayNhapStr || p.ngayNhapStr || p.NgayNhap || null,
    tenNV: p.tenNV || p.TenNV || p.hoTen || p.HoTen || p.nguoiLap || '',
    tenNCC: p.tenNCC || p.TenNCC || p.tenNhaCungCap || p.TenNhaCungCap || p.tenNCC || '',
    tongTien: p.tongTien || p.TongTien || p.tongTienVND || p.TongTienVND || p.tongTien || 0,
    ghiChu: p.ghiChu || p.GhiChu || p.note || p.ghi_chu || '',
    __raw: p,
  };
};

const normalizeItem = (it) => {
  if (!it) return null;
  const maCTPN = it.maCTPN || it.MaCTPN || it.MACTPN || it.maCT || it.MaCT || '';
  const maThuoc = it.maThuoc || it.MaThuoc || it.MA_THUOC || '';
  const tenThuoc = it.tenThuoc || it.TenThuoc || it.TEN_THUOC || it.ten || '';
  const tenLoaiDonVi = it.tenLoaiDonVi || it.tenLoaiDon || it.TenLoaiDonVi || it.tenDonVi || it.loaiDonVi || it.tenLoai || '';
  const maLo = it.maLo || it.MaLo || it.MaLO || it.maLoThuoc || '';
  const hanSuDung = it.hanSuDung || it.HanSuDung || it.hanSuDungStr || it.HSD || null;
  const soLuong = (it.soLuong !== undefined) ? it.soLuong : ((it.SoLuong !== undefined) ? it.SoLuong : ((it.soLuongCon !== undefined) ? it.soLuongCon : 0));
  const donGia = (it.donGia !== undefined) ? it.donGia : ((it.DonGia !== undefined) ? it.DonGia : 0);
  const thanhTien = (it.thanhTien !== undefined) ? it.thanhTien : ((it.ThanhTien !== undefined) ? it.ThanhTien : ((soLuong !== undefined && donGia !== undefined) ? soLuong * donGia : 0));
  const ghiChu = it.ghiChu || it.GhiChu || it.note || it.ghi_chu || '';
  return {
    maCTPN,
    maThuoc,
    tenThuoc,
    tenLoaiDonVi,
    maLo,
    hanSuDung,
    soLuong,
    donGia,
    thanhTien,
    ghiChu,
    __raw: it,
  };
};

const loadDetail = async () => {
  if (!maPN) return;
  loading.value = true;
  try {
    const resp = await api.phieunhap.getChiTietByMaPN(decodeURIComponent(maPN));
    const payload = resp && resp.data && resp.data.data ? resp.data.data : (resp.data || {});
    const rawPhieu = payload.phieuNhap || payload.PhieuNhap || payload.phieu || payload || null;
    const rawItems = payload.chiTiet || payload.ChiTiet || payload.chiTietPN || [];
    selected.value = normalizePhieu(rawPhieu) || normalizePhieu({ maPN }) || null;
    detailItems.value = Array.isArray(rawItems) ? rawItems.map(normalizeItem) : [];
  } catch (err) {
    console.error(err);
    ElMessage.error('Không lấy được chi tiết phiếu nhập');
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadDetail();
});

const goBack = () => router.back();
</script>

<style scoped>
.admin-phieunhap-detail { padding: 20px; display: flex; justify-content: center; }
.admin-card { border-radius: 12px; overflow: hidden; border: none; box-shadow: 0 4px 20px rgba(0,0,0,0.05); max-width: 1200px; width: 100%; }

/* Khi sidebar đóng, tăng độ rộng */
.admin-layout.sidebar-collapsed .admin-card {
  max-width: 1400px;
}

.detail-header { display: flex; justify-content: space-between; align-items: center; }
.detail-header-left h3 { margin: 0; font-size: 20px; font-weight: 700; color: #1e293b; }
.detail-sub { color: #64748b; font-size: 14px; margin-top: 4px; }
.detail-header-actions { display: flex; gap: 12px; }

.top-section { display: flex; gap: 24px; margin-bottom: 24px; flex-wrap: wrap; justify-content: center; }
.meta-left { flex: 1; display: flex; gap: 16px; flex-wrap: wrap; justify-content: center; }
.meta-right { min-width: 250px; display: flex; justify-content: center; }

.meta-card {
  background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 16px;
  flex: 1; min-width: 160px; display: flex; flex-direction: column; align-items: center; text-align: center;
}
.meta-card .label { font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; color: #64748b; margin-bottom: 8px; font-weight: 600; }
.meta-card .value { font-size: 16px; font-weight: 600; color: #0f172a; }

.total-highlight {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white; border-radius: 12px; padding: 20px;
  display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center;
  height: 100%; box-shadow: 0 10px 15px -3px rgba(59, 130, 246, 0.3); width: 100%;
}
.total-highlight .label { font-size: 13px; opacity: 0.9; margin-bottom: 4px; font-weight: 500; }
.total-highlight .value { font-size: 28px; font-weight: 800; letter-spacing: -0.5px; }
.total-highlight .muted { font-size: 13px; opacity: 0.8; margin-top: 4px; }

.detail-total { border-top: 1px solid #e2e8f0; padding-top: 16px; color: #0f172a; display: flex; justify-content: center; }

@media print {
  .admin-phieunhap-detail { padding: 0; }
  .detail-header-actions, .admin-card { box-shadow: none; border: none; }
}
</style>
