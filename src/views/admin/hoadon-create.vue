<template>
    <!-- Modern Header Card -->
    <el-card class="header-card" shadow="hover">
      <div class="header-content">
        <div class="header-left">
          <div class="invoice-title">
            <el-icon class="title-icon"><Document /></el-icon>
            <h2 class="title-text">{{ confirmMode ? 'Xác nhận hóa đơn' : 'Tạo Hóa đơn mới' }}</h2>
            <el-tag class="invoice-code" type="success" effect="light">{{ confirmMode ? (form.maHD || route.query.maHD || '---') : 'Mới' }}</el-tag>
          </div>

          <div class="invoice-meta">
            <!-- Row 1: Ngày lập + Nhân viên -->
            <div class="meta-row">
              <div class="meta-item">
                <el-icon class="meta-icon"><Calendar /></el-icon>
                <div class="meta-content">
                  <span class="meta-label">Ngày lập</span>
                  <el-date-picker v-model="form.ngayLap" type="date" placeholder="Chọn ngày" format="DD/MM/YYYY" value-format="YYYY-MM-DD" class="form-input" :disabled="confirmMode" />
                </div>
              </div>

              <div class="meta-item">
                <el-icon class="meta-icon"><Avatar /></el-icon>
                <div class="meta-content">
                  <span class="meta-label">Nhân viên</span>
                  <el-input v-model="form.tenNV" placeholder="Tên nhân viên" class="form-input" clearable :disabled="true" />
                </div>
              </div>
            </div>

            <!-- Row 2: Số điện thoại + Khách hàng -->
            <div class="meta-row">
              <div class="meta-item">
                <el-icon class="meta-icon"><Phone /></el-icon>
                <div class="meta-content">
                  <span class="meta-label">Số điện thoại</span>
                  <el-autocomplete
                    v-model="form.soDienThoai"
                    :fetch-suggestions="querySearch"
                    placeholder="Nhập số điện thoại để tìm khách"
                    @select="onSelectSuggestion"
                    @input="onPhoneInput"
                    clearable
                    class="form-input"
                    size="small"
                    popper-class="customer-suggestions"
                    :disabled="confirmMode"
                  >
                    <template #default="{ item }">
                      <div style="display:flex;justify-content:space-between;gap:12px;">
                        <div style="font-weight:600">{{ item.hoTen }}</div>
                        <div style="color:#666">{{ item.dienThoai }}</div>
                      </div>
                    </template>
                  </el-autocomplete>
                </div>
              </div>

              <div class="meta-item">
                <el-icon class="meta-icon"><User /></el-icon>
                <div class="meta-content">
                  <span class="meta-label">Khách hàng *</span>
                  <el-input v-model="form.tenKH" placeholder="Nhập tên khách hàng" class="form-input" clearable :disabled="confirmMode" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="header-actions">
          <el-button v-if="!confirmMode" class="action-btn" size="default" @click="$router.back()">Hủy</el-button>
        </div>
      </div>
      <div style="margin-top:12px">
        <el-alert v-if="confirmMode" title="Chế độ Xác nhận: thông tin chỉ hiển thị và không thể chỉnh sửa." type="info" show-icon />
      </div>
    </el-card>

    <!-- Quick-split dialog (two-column layout like screenshot) -->
    <el-dialog title="Tách nhanh thuốc" v-model="tachDialog" width="820px" :close-on-click-modal="false">
      <el-row :gutter="24">
        <el-col :span="12">
          <el-form label-position="top" label-width="auto">
            <el-form-item label="Đơn vị đích (Hiện tại)">
              <el-input :value="tachTargetUnitName" disabled />
            </el-form-item>

            <el-form-item label="Đơn vị nguồn (Tách từ)">
              <div style="display:flex;gap:8px;align-items:center">
                <el-select v-model="tachNewUnit" placeholder="Chọn đơn vị nguồn" clearable style="flex:1 1 auto; min-width:220px">
                  <el-option
                    v-for="g in (items[tachIndex]?.giaThuocs || [])"
                    :key="g.maGiaThuoc"
                    :label="g.tenLoaiDonVi + (g.soLuong ? ' (' + g.soLuong + ')' : '')"
                    :value="g.maLoaiDonVi"
                  />
                </el-select>
                <div style="flex:0 0 72px; display:flex; justify-content:center;">
                  <el-input-number :model-value="tachSourceSoLuong" disabled size="small" controls-position="right" style="width:72px; text-align:center" />
                </div>
              </div>
            </el-form-item>

            <el-form-item label="Chọn ngày">
              <el-date-picker v-model="tachNewExpiry" type="date" placeholder="Chọn ngày" format="DD/MM/YYYY" value-format="YYYY-MM-DD" style="width:100%" />
            </el-form-item>
          </el-form>
        </el-col>

        <el-col :span="12">
          <el-form label-position="top" label-width="auto">
            <el-form-item label="Hạn sử dụng mới">
              <el-radio-group v-model="tachExpiryOption" size="small">
                <el-radio-button label="3" @click="applyTachExpiryOption('3')">3 tháng</el-radio-button>
                <el-radio-button label="6" @click="applyTachExpiryOption('6')">6 tháng</el-radio-button>
                <el-radio-button label="9" @click="applyTachExpiryOption('9')">9 tháng</el-radio-button>
                <el-radio-button label="custom" @click="applyTachExpiryOption('custom')">Tùy chọn</el-radio-button>
              </el-radio-group>
            </el-form-item>

            <el-form-item label="Hạn hiện tại">
              <el-input :value="(items[tachIndex] && items[tachIndex].hanSuDung) ? new Date(items[tachIndex].hanSuDung).toLocaleDateString('en-GB') : ''" disabled style="width:100%" />
            </el-form-item>
          </el-form>
        </el-col>
      </el-row>

      <template #footer>
        <div style="display:flex;justify-content:flex-end;gap:12px">
          <el-button @click="tachDialog = false">Hủy</el-button>
          <el-button type="primary" :loading="tachLoading" @click="doTachSubmit">Cập nhật</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- Quick-cancel dialog -->
    <el-dialog title="Hủy thuốc nhanh" v-model="huyDialog" width="500px" :close-on-click-modal="false">
      <el-form label-position="top">
        <el-form-item label="Số lượng hủy">
          <el-input-number v-model="huyForm.soLuong" :min="1" style="width:100%" />
        </el-form-item>
        <el-form-item label="Lý do hủy">
          <el-input v-model="huyForm.lyDo" type="textarea" :rows="3" placeholder="Nhập lý do hủy (ví dụ: Hỏng, Hết hạn...)" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div style="display:flex;justify-content:flex-end;gap:12px">
          <el-button @click="huyDialog = false">Đóng</el-button>
          <el-button type="danger" :loading="huyLoading" @click="doHuySubmit">Xác nhận hủy</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- Table: items (editable rows) -->
    <el-card class="table-card" shadow="hover">
        <template #header>
          <div class="table-header">
            <h3 class="table-title">
              <el-icon><List /></el-icon>
              Danh sách mặt hàng
            </h3>
          </div>
        </template>

        <!-- Scan Input Row - HIDDEN -->
        <div style="display: none;">
          <el-input
            v-model="scanCodeValue"
            placeholder="Quét mã vạch hoặc nhập tay..."
            size="large"
            @keyup.enter="processScanCode"
            clearable
            autofocus
          />
        </div>

        <!-- Error Message -->
        <div v-if="scanError" style="display: none; padding: 12px 16px; background: #fff1f0; color: #c41d7f; border-bottom: 1px solid #ffccc7; display: flex; gap: 8px; align-items: center;">
          <span style="font-size: 16px;">❌</span>
          <span>{{ scanError }}</span>
        </div>

        <el-table :data="items" class="modern-table" stripe style="width:100%">
        <el-table-column label="Tên thuốc" min-width="200">
          <template #default="{ row, $index }">
            <div v-if="!confirmMode">
              <el-select
                v-model="row.maThuoc"
                filterable
                remote
                reserve-keyword
                placeholder="Chọn thuốc"
                :remote-method="remoteSearchMedicine"
                :loading="medLoading"
                :value-key="'maThuoc'"
                @change="() => onMedicineChange(row, $index)"
                clearable
              >
                <el-option
                  v-for="m in filteredMedicines"
                  :key="m.maThuoc"
                  :label="m.tenThuoc"
                  :value="m.maThuoc"
                >
                  <div class="medicine-option">
                    <div class="medicine-option-left">{{ m.tenThuoc }}</div>
                    <div class="medicine-option-right">{{ (m.thanhPhan || '').slice(0, 150) }}</div>
                  </div>
                </el-option>
              </el-select>
            </div>
            <div v-else>
              {{ row.tenThuoc || '—' }}
            </div>
          </template>
        </el-table-column>
        <el-table-column label="Đơn vị" width="140" align="center">
          <template #default="{ row }">
            <div v-if="!confirmMode">
              <div v-if="row.giaThuocs && row.giaThuocs.length">
                <el-select v-model="row.maGiaThuoc" placeholder="Đơn vị" size="small" style="width:100%" @change="() => onGiaChange(row)">
                  <el-option
                    v-for="g in row.giaThuocs"
                    :key="g.maGiaThuoc"
                    :label="g.tenLoaiDonVi + (g.soLuong ? ' (' + g.soLuong + ')' : '')"
                    :value="g.maGiaThuoc"
                  />
                </el-select>
              </div>
              <div v-else>
                <div>{{ row.tenLoaiDonVi || row.tenDonVi || '—' }}</div>
              </div>
            </div>
            <div v-else>
              <div>{{ row.tenLoaiDonVi || row.tenDonVi || '—' }}</div>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="SL Còn" width="90" align="center">
          <template #default="{ row }">
            <div>{{ row.soLuongCon ?? row.soLuongTon ?? 0 }}</div>
          </template>
        </el-table-column>
        <el-table-column label="Hạn SD" width="140" align="center">
          <template #default="{ row }">
            <div class="cell-han">
              <el-date-picker
                v-model="row.hanSuDung"
                type="date"
                placeholder="dd/mm/yyyy"
                format="DD/MM/YYYY"
                value-format="YYYY-MM-DD"
                size="small"
                style="width:110px"
              />
            </div>
          </template>
        </el-table-column>
        <el-table-column label="SL" width="100" align="center">
          <template #default="{ row }">
            <div class="cell-sl">
              <el-input-number v-model="row.soLuong" :min="0" size="small" @change="recalcRow(row)" controls-position="right" style="width:78px" :disabled="confirmMode" />
            </div>
          </template>
        </el-table-column>
        <el-table-column label="Đơn giá" width="130" align="right">
          <template #default="{ row }">
            <div class="price-cell">{{ formatPrice(row.donGia) }}</div>
          </template>
        </el-table-column>
        <el-table-column label="Thành tiền" width="150" align="right">
          <template #default="{ row }">
            <span class="amount-cell">{{ formatPrice(row.thanhTien) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="Liều dùng" min-width="180">
          <template #default="{ row }">
            <el-autocomplete
              v-model="row.tenLD"
              size="small"
              :fetch-suggestions="querySearchLieuDung"
              placeholder="Ví dụ: 2 viên/ngày"
              clearable
              style="width:100%"
            />
          </template>
        </el-table-column>
        <el-table-column label="Hành động" width="140" align="center" fixed="right">
          <template #default="{ row, $index }">
            <div class="action-buttons">
              <el-button type="primary" size="small" link title="Tách" @click="tachItem($index)">
                <el-icon><CopyDocument /></el-icon>
              </el-button>

              <el-button type="warning" size="small" link title="Xuất (huỷ)" @click="openHuyDialog($index)">
                <el-icon><Upload /></el-icon>
              </el-button>

              <el-popconfirm title="Xóa dòng này?" @confirm="removeItem($index)" confirm-button-text="Xóa" cancel-button-text="Hủy">
                <template #reference>
                  <el-button type="danger" size="small" link title="Xóa">
                    <el-icon><Delete /></el-icon>
                  </el-button>
                </template>
              </el-popconfirm>
            </div>
          </template>
        </el-table-column>
        </el-table>

        <!-- Add-button below table -->
        <div style="display:flex;justify-content:flex-start;padding:12px 16px;border-top:1px solid rgba(0,0,0,0.04);background:#fff;">
          <el-button class="action-btn add-btn" type="primary" size="default" @click="addEmptyItem" :disabled="confirmMode">
            <el-icon><Plus /></el-icon>
            Thêm mặt hàng
          </el-button>
        </div>
    </el-card>

    <!-- Footer Summary -->
    <el-card class="footer-card" shadow="hover">
      <div class="footer-content">
        <div class="note-section">
          <div class="note-header">
            <el-icon class="note-icon"><EditPen /></el-icon>
            <span class="note-label">Ghi chú</span>
          </div>
          <el-input
            type="textarea"
            v-model="form.ghiChu"
            placeholder="Không có ghi chú"
            class="note-textarea"
            :autosize="{ minRows: 4, maxRows: 8 }"
            :disabled="confirmMode"
          />
        </div>

        <div class="total-section">
          <div class="total-container">
            <div class="total-label">Tổng thành tiền</div>
            <div class="total-amount">{{ formatPrice(totalAmount) }}</div>
            <div class="total-words">{{ totalInWords }}</div>
          </div>
        </div>
      </div>

      <div style="display:flex;justify-content:flex-end;gap:12px;margin-top:24px;border-top:1px solid rgba(255,255,255,0.1);padding-top:16px">
        <el-button size="default" @click="onCancel">Hủy</el-button>
        <template v-if="!confirmMode">
          <el-button type="success" size="default" @click="payWithQR" :loading="qrLoading">
            <el-icon><FullScreen /></el-icon>
            Thanh toán QR
          </el-button>
          <el-button type="primary" size="default" @click="() => submitInvoice(1)">
            <el-icon><Check /></el-icon>
            Lưu hóa đơn (Tiền mặt)
          </el-button>
        </template>
        <template v-else>
          <el-button type="primary" size="default" @click="$router.back()">Quay lại</el-button>
          <el-button type="success" size="default" :loading="confirmLoading" @click="confirmInvoiceOnline">
            <el-icon><Check /></el-icon>
            Xác nhận hóa đơn
          </el-button>
        </template>
      </div>
    </el-card>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { ElMessage } from 'element-plus';
import { Document, Calendar, User, Avatar, InfoFilled, Printer, List, Search, Plus, Close, Delete, EditPen, Check, Phone, CopyDocument, Upload, FullScreen } from '@element-plus/icons-vue';
import api from '@/api';
import http from '@/api/axios';
import { useAuthStore } from '@/store/auth';
import { numberToWords } from '@/utils/numberUtils';

const router = useRouter();
const route = useRoute();
// Pinia auth store instance used to read logged-in employee
const auth = useAuthStore();

const form = ref({
  ngayLap: new Date().toISOString().slice(0,10),
  maKH: '', // Add maKH to store selected customer ID
  tenKH: '',
  soDienThoai: '',
  tenNV: '',
  ghiChu: '',
  TrangThaiGiaoHang: 0 // default to 'Đã đặt' when creating a new invoice
});

const items = ref([]);

const newItemSearch = ref('');

// Scan medicine by code
const scanLoading = ref(false);
const scanCodeValue = ref('');
const scannedMedicine = ref(null);
const scanError = ref('');

// Medicine list for select
const medicines = ref([]);
const filteredMedicines = ref([]);
const medLoading = ref(false);

const loadMedicines = async () => {
  try {
    const resp = await api.thuoc.getAll();
    const raw = (resp && resp.data && resp.data.data) ? resp.data.data : (resp.data || resp || []);
    medicines.value = (Array.isArray(raw) ? raw : []).map(m => ({
      maThuoc: m.maThuoc || m.MaThuoc || m.id || null,
      tenThuoc: m.tenThuoc || m.TenThuoc || m.ten || m.name || '',
      thanhPhan: m.thanhPhan || m.ThanhPhan || m.moTa || '',
      tenLoaiDonVi: m.tenLoaiDonVi || m.tenDonVi || '',
      soLuongCon: m.soLuongCon ?? m.soLuongTon ?? 0,
      giaBan: m.giaBan || m.donGia || 0,
      hanSuDung: m.hanSuDung || '',
      raw: m
    }));
    filteredMedicines.value = [...medicines.value];
  } catch (err) {
    console.error('loadMedicines err:', err);
  }
};

const remoteSearchMedicine = (query) => {
  medLoading.value = true;
  const q = String(query || '').toLowerCase().trim();
  if (!q) {
    filteredMedicines.value = [...medicines.value];
    medLoading.value = false;
    return;
  }
  filteredMedicines.value = medicines.value.filter(m => {
    return (m.tenThuoc || '').toLowerCase().includes(q) || (m.thanhPhan || '').toLowerCase().includes(q) || (m.maThuoc || '').toLowerCase().includes(q);
  });
  medLoading.value = false;
};

const loadGiaThuocsForMedicine = async (m, force = false) => {
  if (!m || (m.giaThuocs && !force)) return;
  try {
    const resp = await api.thuoc.getGiaThuocs(m.maThuoc);
    const r = resp && resp.data ? resp.data : resp;
    const raw = (r && r.data && r.data.giaThuocs) ? r.data.giaThuocs : (r && r.giaThuocs) ? r.giaThuocs : [];
    m.giaThuocs = (Array.isArray(raw) ? raw : []).map(g => ({
      maGiaThuoc: g.maGiaThuoc || g.MaGiaThuoc || null,
      maLoaiDonVi: g.maLoaiDonVi || g.MaLoaiDonVi || null,
      tenLoaiDonVi: g.tenLoaiDonVi || g.TenLoaiDonVi || g.tenDonVi || '',
      soLuong: g.soLuong ?? g.SoLuong ?? 1,
      donGia: g.donGia ?? g.DonGia ?? 0,
      trangThai: typeof g.trangThai === 'boolean' ? g.trangThai : (g.trangThai === 'true' || g.TrangThai === true),
      soLuongCon: g.soLuongCon ?? g.soLuongTon ?? 0,
      nearestHanSuDung: g.nearestHanSuDung || g.NearestHanSuDung || g.hanSuDung || null,
      raw: g
    }));
  } catch (err) {
    console.error('loadGiaThuocsForMedicine err:', err);
    m.giaThuocs = [];
  }
};

const onMedicineChange = async (row, rowIndex) => {
  if (!row.maThuoc) return;
  const m = medicines.value.find(t => t.maThuoc === row.maThuoc);
  if (m) {
    row.tenThuoc = m.tenThuoc || '';
    row.thanhPhan = m.thanhPhan || '';
    // load giaThuocs for this medicine (if not loaded)
    await loadGiaThuocsForMedicine(m);
    // attach unit/prices list to the row so selection is per-row
    row.giaThuocs = m.giaThuocs || [];
    // pick default active price (trangThai === true) or first available
    const sel = row.giaThuocs.find(g => g.trangThai) || row.giaThuocs[0] || null;
    if (sel) {
      row.maGiaThuoc = sel.maGiaThuoc;
      row.tenLoaiDonVi = sel.tenLoaiDonVi || '';
      row.soLuongCon = sel.soLuongCon ?? sel.soLuong ?? 0;
      row.donGia = sel.donGia || 0;
      row.hanSuDung = sel.nearestHanSuDung || '';
    } else {
      row.maGiaThuoc = '';
      row.tenLoaiDonVi = m.tenLoaiDonVi || '';
      row.soLuongCon = m.soLuongCon ?? 0;
      row.donGia = m.giaBan || 0;
      row.hanSuDung = m.hanSuDung || '';
    }
    recalcRow(row);
  }
};

const onGiaChange = (row) => {
  if (!row || !row.maGiaThuoc || !row.giaThuocs) return;
  const g = row.giaThuocs.find(x => x.maGiaThuoc === row.maGiaThuoc);
  if (g) {
    row.tenLoaiDonVi = g.tenLoaiDonVi || row.tenLoaiDonVi;
    row.soLuongCon = g.soLuongCon ?? g.soLuong ?? 0;
    row.donGia = g.donGia || 0;
    row.hanSuDung = g.nearestHanSuDung || row.hanSuDung;
    recalcRow(row);
  }
};

const addEmptyItem = () => {
  items.value.push({ maThuoc: '', tenThuoc: '', tenLoaiDonVi: '', soLuongCon: 0, hanSuDung: '', soLuong: 1, donGia: 0, thanhTien: 0, tenLD: '' });
};

const removeItem = (idx) => { items.value.splice(idx, 1); };

// Scan by barcode code
const processScanCode = async () => {
  const code = (scanCodeValue.value || '').trim();
  if (!code) {
    scanError.value = 'Vui lòng nhập mã vạch';
    return;
  }

  scanError.value = '';
  scanLoading.value = true;
  scannedMedicine.value = null;

  try {
    // Call API: GET /api/Thuoc/ByCode/{code}
    const resp = await api.thuoc.getByCode(code);
    const r = resp && resp.data ? resp.data : resp;
    const results = r && r.data && Array.isArray(r.data) ? r.data : [];

    if (results.length === 0) {
      scanError.value = `Không tìm thấy thuốc với mã vạch: ${code}`;
      scannedMedicine.value = null;
      return;
    }

    // Use first result
    const found = results[0];
    scannedMedicine.value = {
      maThuoc: found.maThuoc,
      tenThuoc: found.tenThuoc,
      code: found.code
    };

    scanError.value = '';
    
    // Auto add to items after 500ms
    setTimeout(() => {
      addScannedMedicine();
    }, 500);
  } catch (err) {
    console.error('processScanCode err', err);
    scanError.value = 'Lỗi quét mã vạch: ' + (err.message || 'Không xác định');
    scannedMedicine.value = null;
  } finally {
    scanLoading.value = false;
  }
};

const addScannedMedicine = async () => {
  if (!scannedMedicine.value) return;

  // Lưu lại thông tin và clear ngay để tránh gọi nhiều lần
  const scannedInfo = { ...scannedMedicine.value };
  scannedMedicine.value = null;

  const { maThuoc } = scannedInfo;

  // Find medicine in list
  let medicine = medicines.value.find(m => m.maThuoc === maThuoc);
  
  // If not in list, try to load it
  if (!medicine) {
    try {
      const resp = await api.thuoc.getById(maThuoc);
      const r = resp && resp.data ? resp.data : resp;
      const m = r && r.data ? r.data : r;
      medicine = {
        maThuoc: m.maThuoc || m.MaThuoc || '',
        tenThuoc: m.tenThuoc || m.TenThuoc || '',
        thanhPhan: m.thanhPhan || m.ThanhPhan || '',
        tenLoaiDonVi: m.tenLoaiDonVi || '',
        soLuongCon: m.soLuongCon ?? 0,
        giaBan: m.giaBan || 0,
        hanSuDung: m.hanSuDung || '',
        raw: m
      };
    } catch (e) {
      console.error('load medicine err', e);
      ElMessage.error('Không thể tải thông tin thuốc');
      return;
    }
  }

  // Create new row
  const newRow = {
    maThuoc: medicine.maThuoc,
    tenThuoc: medicine.tenThuoc || '',
    thanhPhan: medicine.thanhPhan || '',
    tenLoaiDonVi: medicine.tenLoaiDonVi || '',
    soLuongCon: medicine.soLuongCon ?? 0,
    hanSuDung: medicine.hanSuDung || '',
    soLuong: 1,
    donGia: medicine.giaBan || 0,
    thanhTien: medicine.giaBan || 0,
    maGiaThuoc: null,
    tenLD: '',
    giaThuocs: [],
    raw: medicine.raw
  };

  // Load giaThuocs for this medicine
  await loadGiaThuocsForMedicine(medicine);
  newRow.giaThuocs = medicine.giaThuocs || [];

  // Auto-select default unit
  const sel = newRow.giaThuocs.find(g => g.trangThai) || newRow.giaThuocs[0] || null;
  if (sel) {
    newRow.maGiaThuoc = sel.maGiaThuoc;
    newRow.tenLoaiDonVi = sel.tenLoaiDonVi || '';
    newRow.soLuongCon = sel.soLuongCon ?? sel.soLuong ?? 0;
    newRow.donGia = sel.donGia || 0;
    newRow.hanSuDung = sel.nearestHanSuDung || '';
  }

  recalcRow(newRow);
  items.value.push(newRow);

  // Clear after add - chỉ hiển thị 1 thông báo
  ElMessage.success(`Đã thêm: ${medicine.tenThuoc}`);
  scanCodeValue.value = '';
  scanError.value = '';
};

// Tach (quick-split) flow: open dialog to choose new unit and expiry, call API then split locally
const tachIndex = ref(-1);
const tachDialog = ref(false);
const tachLoading = ref(false);
const tachNewUnit = ref('');
const tachTargetUnitName = ref('');
const tachNewExpiry = ref(null);
const tachExpiryOption = ref('custom');

const applyTachExpiryOption = (opt) => {
  tachExpiryOption.value = opt;
  if (opt === 'custom') return;
  const months = Number(opt) || 0;
  const d = new Date();
  d.setMonth(d.getMonth() + months);
  // Format to YYYY-MM-DD to match value-format of date-picker
  tachNewExpiry.value = d.toISOString().split('T')[0];
};

// Display SL còn for selected source unit in tach dialog
const tachSourceSoLuong = computed(() => {
  const idx = tachIndex.value;
  const ma = tachNewUnit.value;
  if (idx == null || idx < 0) return null;
  const list = (items.value[idx] && items.value[idx].giaThuocs) ? items.value[idx].giaThuocs : [];
  if (!ma) return null;
  const g = list.find(x => x.maLoaiDonVi === ma || x.maGiaThuoc === ma);
  const q = g ? (g.soLuongCon ?? g.soLuong ?? 0) : null;
  return q;
});
const tachSourceSoLuongDisplay = computed(() => {
  const v = tachSourceSoLuong.value;
  return v == null ? 'SL còn' : String(v);
});

const tachItem = (idx) => {
  const row = items.value[idx];
  if (!row) return;
  // Always open dialog; allow user to quick-split even if soLuong <= 1
  tachIndex.value = idx;
  
  // Set target unit name for display
  tachTargetUnitName.value = row.tenLoaiDonVi || 'Đơn vị hiện tại';
  
  // Reset source unit selection (user must choose)
  tachNewUnit.value = '';
  
  // Use existing string value (YYYY-MM-DD)
  tachNewExpiry.value = row.hanSuDung || '';
  tachDialog.value = true;
};

const doTachSubmit = async () => {
  if (tachIndex.value < 0) return;
  const row = items.value[tachIndex.value];
  if (!row) return;
  if (!tachNewUnit.value) { ElMessage.error('Vui lòng chọn đơn vị nguồn'); return; }

  // Determine Target Unit (Current Row's Unit)
  const currentGiaThuoc = (row.giaThuocs || []).find(g => g.maGiaThuoc === row.maGiaThuoc);
  const targetUnitId = currentGiaThuoc?.maLoaiDonVi;

  if (!targetUnitId) {
    ElMessage.error('Không xác định được đơn vị hiện tại');
    return;
  }

  // Build API body
  // maLoaiDonViGoc: Source Unit (Selected in Dialog)
  // maLoaiDonViMoi: Target Unit (Current Row)
  const body = {
    maThuoc: row.maThuoc,
    maLoaiDonViGoc: tachNewUnit.value,
    maLoaiDonViMoi: targetUnitId,
    hanSuDungMoi: tachNewExpiry.value ? new Date(tachNewExpiry.value).toISOString() : undefined,
    maLoGoc: null
  };

  tachLoading.value = true;
  try {
    await http.post('/PhieuQuyDoi/QuickByMa', body);
    
    // On success, refresh the medicine data to update quantities
    const m = medicines.value.find(t => t.maThuoc === row.maThuoc);
    if (m) {
      await loadGiaThuocsForMedicine(m, true);
      
      // Update the current row's data with new quantities
      row.giaThuocs = m.giaThuocs || [];
      const g = row.giaThuocs.find(x => x.maGiaThuoc === row.maGiaThuoc);
      if (g) {
        row.soLuongCon = g.soLuongCon ?? g.soLuongTon ?? 0;
        // Optionally update expiry if it changed or if we want to reflect the nearest one
        // row.hanSuDung = g.nearestHanSuDung || row.hanSuDung; 
      }
      
      // Also update any other rows that might be using the same medicine
      items.value.forEach(item => {
        if (item.maThuoc === row.maThuoc && item !== row) {
          item.giaThuocs = m.giaThuocs || [];
          const ig = item.giaThuocs.find(x => x.maGiaThuoc === item.maGiaThuoc);
          if (ig) {
            item.soLuongCon = ig.soLuongCon ?? ig.soLuongTon ?? 0;
          }
        }
      });
    }

    ElMessage.success('Tách nhanh thành công');
    tachDialog.value = false;
  } catch (err) {
    console.error('doTachSubmit err', err);
    const msg = (err.response && err.response.data && err.response.data.message) ? err.response.data.message : 'Tách nhanh thất bại';
    ElMessage.error(msg);
  } finally {
    tachLoading.value = false;
  }
};

const xuatItem = (idx) => {
  // Legacy function, kept if needed or redirected
  openHuyDialog(idx);
};

// Huy (Quick Cancel) flow
const huyDialog = ref(false);
const huyLoading = ref(false);
const huyIndex = ref(-1);
const huyForm = ref({ soLuong: 1, lyDo: '' });

const openHuyDialog = (idx) => {
  const row = items.value[idx];
  if (!row || !row.maThuoc) {
    ElMessage.warning('Vui lòng chọn thuốc trước khi hủy');
    return;
  }
  huyIndex.value = idx;
  huyForm.value = { soLuong: 1, lyDo: '' };
  huyDialog.value = true;
};

const doHuySubmit = async () => {
  if (huyIndex.value < 0) return;
  const row = items.value[huyIndex.value];
  if (!row) return;

  if (!huyForm.value.lyDo) {
    ElMessage.warning('Vui lòng nhập lý do hủy');
    return;
  }

  // Find unit ID
  let maLoaiDonVi = null;
  if (row.giaThuocs && row.giaThuocs.length) {
    const g = row.giaThuocs.find(x => x.maGiaThuoc === row.maGiaThuoc);
    if (g) maLoaiDonVi = g.maLoaiDonVi;
  }
  // Fallback if not found in giaThuocs (rare)
  if (!maLoaiDonVi && row.raw) maLoaiDonVi = row.raw.maLoaiDonVi || row.raw.maDonVi;

  const user = auth.user || auth.currentUser;
  const maNV = user?.MaNV || user?.maNV || '';

  const payload = {
    maNV: maNV,
    maThuoc: row.maThuoc,
    maLoaiDonVi: maLoaiDonVi,
    soLuong: huyForm.value.soLuong,
    lyDo: huyForm.value.lyDo
  };

  huyLoading.value = true;
  try {
    await http.post('/PhieuXuLyHoanHuy/QuickCreate', payload);
    ElMessage.success('Hủy thuốc thành công');
    huyDialog.value = false;
    
    // Refresh data to update quantity
    const m = medicines.value.find(t => t.maThuoc === row.maThuoc);
    if (m) {
      await loadGiaThuocsForMedicine(m, true);
      // Update local rows
      items.value.forEach(item => {
        if (item.maThuoc === row.maThuoc) {
          item.giaThuocs = m.giaThuocs || [];
          const ig = item.giaThuocs.find(x => x.maGiaThuoc === item.maGiaThuoc);
          if (ig) {
            item.soLuongCon = ig.soLuongCon ?? ig.soLuongTon ?? 0;
          }
        }
      });
    }
  } catch (err) {
    console.error('doHuySubmit err', err);
    const msg = (err.response && err.response.data && err.response.data.message) ? err.response.data.message : 'Hủy thuốc thất bại';
    ElMessage.error(msg);
  } finally {
    huyLoading.value = false;
  }
};

const recalcRow = (row) => {
  const q = Number(row.soLuong) || 0;
  const p = Number(row.donGia) || 0;
  row.thanhTien = q * p;
};

const totalAmount = computed(() => items.value.reduce((s, r) => s + (Number(r.thanhTien) || 0), 0));
const totalInWords = computed(() => numberToWords(Math.floor(totalAmount.value)) + ' đồng');

const formatPrice = (v) => {
  if (v == null || v === '') return '';
  return Number(v).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
};

// Helper to ensure maKH is set if possible
const ensureMaKH = async () => {
  if (form.value.maKH) return; // Already set
  const phone = (form.value.soDienThoai || '').trim();
  if (!phone) return;

  // Ensure customers are loaded
  if (!customers.value.length) await fetchCustomers();

  // Try to find exact match by phone
  const match = customers.value.find(c => c.dienThoai === phone);
  if (match) {
    form.value.maKH = match.makh;
    // Update other fields if empty
    if (!form.value.tenKH) form.value.tenKH = match.hoTen;
  }
};

const submitInvoice = async (paymentMethod = 1, orderCode = null) => {
  // basic validation
  if (!form.value.tenKH) { ElMessage.warning('Vui lòng nhập tên khách hàng'); return; }
  if (!items.value.length) { ElMessage.warning('Vui lòng thêm ít nhất 1 mặt hàng'); return; }

  // Try to resolve maKH if missing
  await ensureMaKH();

  const user = auth.user || auth.currentUser;
  const maNV = user?.MaNV || user?.maNV || '';

  const payload = {
    maKH: form.value.maKH || null, // Send maKH if available
    maNV: maNV,
    ngayLap: form.value.ngayLap,
    tenKH: form.value.tenKH,
    soDienThoai: form.value.soDienThoai,
    tenNV: form.value.tenNV,
    ghiChu: form.value.ghiChu,
    TrangThaiGiaoHang: form.value.TrangThaiGiaoHang ?? 0,
    trangThaiGiaoHang: form.value.TrangThaiGiaoHang ?? 0,
    items: items.value.map(it => ({
      maThuoc: it.maThuoc, 
      tenThuoc: it.tenThuoc, 
      tenLoaiDonVi: it.tenLoaiDonVi, 
      soLuongCon: it.soLuongCon,
      hanSuDung: it.hanSuDung ? it.hanSuDung : null, 
      soLuong: it.soLuong, 
      donGia: it.donGia,
      thanhTien: it.thanhTien, 
      tenLD: it.tenLD
    })),
    tongTien: totalAmount.value,
    paymentMethod: paymentMethod,
    orderCode: orderCode
  };

  try {
    const resp = await api.hoadon.create(payload);
    const r = (resp && resp.data) ? resp.data : resp;

    if (r && (r.status === -1 || r.error)) {
      ElMessage.error(r.message || 'Tạo hóa đơn thất bại');
      return;
    }
    
    // Check if response contains a paymentUrl (unexpected for Cash)
    if (r.paymentUrl || r.checkoutUrl || (r.data && (r.data.paymentUrl || r.data.checkoutUrl))) {
       console.warn('Unexpected payment URL in Cash invoice response:', r);
       // If we are forcing Cash (paymentMethod=1), we should probably ignore this URL 
       // unless the backend explicitly failed the cash creation and returned a redirect.
       // But let's see the log first.
    }

    ElMessage.success('Tạo hóa đơn thành công');
    // Clear draft if exists
    localStorage.removeItem('invoice_draft');
    
    // redirect to detail page if id returned
    let maHD = null;
    if (r) {
      // Direct properties
      if (r.maHD || r.MaHD) maHD = r.maHD || r.MaHD;
      else if (r.id || r.Id) maHD = r.id || r.Id;
      
      // Nested data
      else if (r.data) {
        if (typeof r.data === 'string') maHD = r.data;
        else if (typeof r.data === 'object') {
          if (r.data.maHD || r.data.MaHD) maHD = r.data.maHD || r.data.MaHD;
          else if (r.data.id || r.data.Id) maHD = r.data.id || r.data.Id;
          else if (r.data.invoice && (r.data.invoice.maHD || r.data.invoice.MaHD)) maHD = r.data.invoice.maHD || r.data.invoice.MaHD;
        }
      }
    }

    if (maHD && typeof maHD === 'string' && maHD.startsWith('http')) {
       console.warn('maHD looks like a URL, ignoring:', maHD);
       maHD = null;
    }

    if (maHD) {
      router.push(`/admin/hoadon/${encodeURIComponent(maHD)}`);
    } else {
      // Fallback to list
      // Suppress warning since the operation was successful
      router.push('/admin/hoadon');
    }
  } catch (err) {
    console.error('create hoadon err', err);
    ElMessage.error('Lỗi khi tạo hóa đơn');
  }
};

// --- QR Payment Flow ---
const qrLoading = ref(false);
const confirmLoading = ref(false);

const saveDraft = () => {
  const draft = {
    form: form.value,
    items: items.value
  };
  localStorage.setItem('invoice_draft', JSON.stringify(draft));
};

const restoreDraft = () => {
  const draftStr = localStorage.getItem('invoice_draft');
  if (draftStr) {
    try {
      const draft = JSON.parse(draftStr);
      if (draft.form) form.value = { ...form.value, ...draft.form };
      if (draft.items) items.value = draft.items;
      // Re-calculate totals or side effects if needed
      items.value.forEach(row => recalcRow(row));
    } catch (e) {
      console.error('Error restoring draft', e);
    }
  }
};

const payWithQR = async () => {
  if (!form.value.tenKH) { ElMessage.warning('Vui lòng nhập tên khách hàng'); return; }
  if (!items.value.length) { ElMessage.warning('Vui lòng thêm ít nhất 1 mặt hàng'); return; }

  // Try to resolve maKH if missing before saving draft
  await ensureMaKH();

  qrLoading.value = true;
  saveDraft(); // Save state before redirect

  const returnUrl = window.location.origin + window.location.pathname + '?paymentResult=success';
  const cancelUrl = window.location.origin + window.location.pathname + '?paymentResult=cancel';

  // PayOS requires description max 25 chars
  // Create a short description: "HD " + customer name, then truncate
  let desc = `HD ${form.value.tenKH}`;
  // Remove accents/diacritics to be safe and ensure standard characters (optional but good for banking APIs)
  desc = desc.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  // Truncate to 25 chars
  if (desc.length > 25) {
    desc = desc.slice(0, 25);
  }

  const payload = {
    amount: totalAmount.value,
    description: desc,
    returnUrl: returnUrl,
    cancelUrl: cancelUrl
  };

  try {
    const resp = await http.post('/SimplePayment/Create', payload);
    const r = resp.data || resp;

    // Extract URL based on observed structure: r.data.paymentUrl
    let checkoutUrl = null;
    if (r.data && r.data.paymentUrl) {
      checkoutUrl = r.data.paymentUrl;
    } else if (r.checkoutUrl) {
      checkoutUrl = r.checkoutUrl;
    } else if (r.url) {
      checkoutUrl = r.url;
    } else if (typeof r.data === 'string') {
      checkoutUrl = r.data;
    }
    
    if (checkoutUrl && typeof checkoutUrl === 'string') {
      window.location.href = checkoutUrl;
    } else {
      console.error('Invalid checkoutUrl:', checkoutUrl);
      ElMessage.error('Không nhận được link thanh toán');
      qrLoading.value = false;
    }
  } catch (err) {
    console.error('QR payment err', err);
    ElMessage.error('Lỗi khởi tạo thanh toán QR');
    qrLoading.value = false;
  }
};

// helper: fetch employee full name by id
const fetchEmployeeById = async (maNV) => {
  if (!maNV) return null;
  try {
    const resp = await api.nhanvien.getById(maNV);
    const d = resp && resp.data ? resp.data : resp;
    return d?.hoTen || d?.HoTen || null;
  } catch (err) {
    console.error('fetch employee err', err);
    return null;
  }
};

// Detect placeholder or unknown names returned from some auth payloads
const isPlaceholderName = (name) => {
  if (!name) return true;
  const s = String(name).trim().toLowerCase();
  // common placeholder values to treat as missing
  if (!s) return true;
  if (s === 'không xác định' || s === 'khong xac dinh' || s === 'unknown') return true;
  if (/không.*xác.*định/.test(s)) return true;
  return false;
};

onMounted(async () => {
  // Check for payment return
  if (route.query.paymentResult) {
    restoreDraft();
    if (route.query.paymentResult === 'success') {
      // Auto submit invoice with QR payment method (2) and orderCode
      const orderCode = route.query.orderCode || route.query.order_code || null;
      // Đợi submitInvoice hoàn tất - nó sẽ tự redirect đến trang chi tiết hóa đơn
      await submitInvoice(2, orderCode);
      // Không cần clean URL vì submitInvoice đã redirect
      return; 
    } else if (route.query.paymentResult === 'cancel') {
      ElMessage.info('Đã hủy thanh toán QR. Bạn có thể tiếp tục chỉnh sửa.');
      // Chỉ clean URL khi cancel
      router.replace({ query: null });
    }
  }

  // Load medicines and dosages
  await Promise.all([loadMedicines(), loadLieuDung()]);
  
  // populate current employee name from auth store - always fetch from API by MaNV like them-phieunhap.vue
  try {
    if (!auth.user) auth.initAuth();
    const u = auth.currentUser || auth.user || null;
    let name = null;
    const maNV = u?.MaNV || u?.maNV;
    
    // Always fetch from API by MaNV to get actual employee name (not TenDangNhap)
    if (maNV) {
      const fetched = await fetchEmployeeById(maNV);
      if (fetched) {
        name = fetched;
      }
    }
    
    // Fallback to localStorage if auth.user not available
    if (!name) {
      const ustr = localStorage.getItem('user');
      if (ustr) {
        const uu = JSON.parse(ustr);
        const ma = uu?.MaNV || uu?.maNV;
        if (ma) {
          const fetched = await fetchEmployeeById(ma);
          if (fetched) name = fetched;
        }
      }
    }
    
    if (name) form.value.tenNV = name;
  } catch (e) { /* ignore */ }

  // If page opened with maHD (edit/view), load invoice data
  const maHDq = route.query.maHD || route.query.mahd || route.query.MaHD;
  if (maHDq) {
    await loadInvoice(maHDq);
    confirmMode.value = (route.query.confirm === '1' || route.query.confirm === 'true' || route.query.confirm === 1 || route.query.confirm === true);
  } 

  // Add global listener for barcode scanner
  window.addEventListener('keypress', handleGlobalKeyPress);
});

// Global keyboard listener for barcode scanner - defined at script level for proper cleanup
let scannedBuffer = '';
let scannerTimeoutId = null;

const handleGlobalKeyPress = (e) => {
  // Ignore if confirmMode
  if (confirmMode.value) return;
  
  // Check if target is not an input/textarea (to avoid interference)
  const target = e.target;
  if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
    // If it's our scan input, let it handle normally
    if (target === document.activeElement && target.placeholder?.includes('Quét')) {
      return;
    }
  }

  if (e.key === 'Enter' && scannedBuffer.trim()) {
    // Scanner data complete
    scanCodeValue.value = scannedBuffer.trim();
    processScanCode();
    scannedBuffer = '';
    e.preventDefault();
  } else if (e.key === 'Enter') {
    // Clear buffer on Enter if empty
    scannedBuffer = '';
  } else if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
    // Collect printable characters
    scannedBuffer += e.key;
    
    // Clear buffer if no Enter within 2 seconds (timeout)
    if (scannerTimeoutId) clearTimeout(scannerTimeoutId);
    scannerTimeoutId = setTimeout(() => {
      scannedBuffer = '';
    }, 2000);
  }
};

// Cleanup on unmount - must be at script level, not inside onMounted
onUnmounted(() => {
  window.removeEventListener('keypress', handleGlobalKeyPress);
  if (scannerTimeoutId) clearTimeout(scannerTimeoutId);
});


const confirmInvoiceOnline = async () => {
  if (!confirmMode.value) return;
  if (!form.value.maHD) { ElMessage.warning('Không có mã hóa đơn để xác nhận'); return; }
  const user = auth.user || auth.currentUser || auth.currentUser?.value || {};
  const maNV = form.value.maNV || user?.MaNV || user?.maNV || user?.MaTK || '';

  // Build items payload with robust mappings
  const bodyItems = items.value.map(it => {
    const maThuoc = it.maThuoc || it.MaThuoc || it.raw?.maThuoc || it.raw?.MaThuoc || '';

    // Determine donVi: prefer explicit maLoaiDonVi, else try to resolve from selected giaThuoc
    let donViVal = '';
    if (it.maLoaiDonVi) donViVal = it.maLoaiDonVi;
    else if (it.maGiaThuoc && Array.isArray(it.giaThuocs) && it.giaThuocs.length) {
      const gsel = it.giaThuocs.find(x => x.maGiaThuoc === it.maGiaThuoc) || it.giaThuocs[0];
      donViVal = gsel?.maLoaiDonVi || it.maGiaThuoc || it.tenLoaiDonVi || '';
    } else if (it.maGiaThuoc) donViVal = it.maGiaThuoc;
    else donViVal = it.tenLoaiDonVi || it.raw?.maLoaiDonVi || '';

    // Determine maLD: prefer explicit maLD, else try to map from tenLD via lieuDungList
    let maLDVal = it.maLD || it.MaLD || it.raw?.maLD || null;
    if (!maLDVal && it.tenLD) {
      const found = lieuDungList.value.find(x => (x.value || '').toString().trim() === (it.tenLD || '').toString().trim());
      if (found) maLDVal = found.maLD || null;
    }

    return {
      maThuoc: maThuoc,
      donVi: donViVal,
      soLuong: Number(it.soLuong) || 0,
      donGia: Number(it.donGia) || 0,
      maLD: maLDVal || null,
      hanSuDung: it.hanSuDung ? (new Date(it.hanSuDung)).toISOString() : null
    };
  });

  const payload = {
    maHD: form.value.maHD || route.query.maHD || null,
    maNV: maNV,
    ghiChu: form.value.ghiChu || form.value.GhiChu || route.query.ghiChu || '',
    items: bodyItems
  };

  console.debug('ConfirmOnline payload', payload);

  confirmLoading.value = true;
  try {
    let resp;
    if (api.hoadon && typeof api.hoadon.confirmOnline === 'function') {
      resp = await api.hoadon.confirmOnline(payload);
    } else {
      resp = await http.post('/HoaDon/ConfirmOnline', payload);
    }
    const r = resp && resp.data ? resp.data : resp;
    if (r && (r.status === -1 || r.error)) {
      ElMessage.error(r.message || 'Xác nhận thất bại');
    } else {
      ElMessage.success('Xác nhận hóa đơn thành công');
      // redirect to invoice detail or list
      const id = payload.maHD;
      if (id) router.push(`/admin/hoadon/${encodeURIComponent(id)}`);
      else router.back();
    }
  } catch (err) {
    console.error('confirmInvoiceOnline err', err);
    ElMessage.error('Lỗi khi gọi API xác nhận');
  } finally {
    confirmLoading.value = false;
  }
};

// Called when user clicks the top-left "Hủy" button in the footer.
// When in confirmMode we should call the UpdateStatus API with trangThaiGiaoHang = -1 and include maNV.
const onCancel = async () => {
  if (!confirmMode.value) {
    return router.back();
  }

  // confirmMode: ask user to confirm cancellation
  try {
    // simple confirm dialog
    const ok = window.confirm('Bạn có chắc muốn hủy hóa đơn này? Hành động này sẽ báo về server.');
    if (!ok) return;

    if (!form.value.maHD) {
      ElMessage.warning('Không có mã hóa đơn để hủy');
      return;
    }

    const user = auth.user || auth.currentUser || {};
    const maNV = form.value.maNV || user?.MaNV || user?.maNV || user?.MaTK || '';

    const body = {
      maHD: form.value.maHD,
      trangThaiGiaoHang: -1,
      maNV: maNV
    };

    confirmLoading.value = true;
    // prefer api wrapper if available
    if (api.hoadon && typeof api.hoadon.updateStatus === 'function') {
      await api.hoadon.updateStatus(body);
    } else {
      await http.patch('/HoaDon/UpdateStatus', body);
    }

    ElMessage.success('Hủy hóa đơn thành công');
    // go back to list
    router.back();
  } catch (err) {
    console.error('cancelInvoiceOnline err', err);
    const msg = (err?.response?.data?.message) || (err?.message) || 'Lỗi khi hủy hóa đơn';
    ElMessage.error(msg);
  } finally {
    confirmLoading.value = false;
  }
};

// update when MaNV changes
watch(() => auth.user?.MaNV || auth.user?.maNV, async (ma) => {
  if (ma) {
    const name = await fetchEmployeeById(ma);
    if (name) form.value.tenNV = name;
  }
});

// simple search helper (placeholder): call API to pre-fill item data if exact match
const searchMedicines = async () => {
  const q = (newItemSearch.value || '').trim();
  if (!q) return ElMessage.info('Nhập mã hoặc tên thuốc để tìm');
  try {
    const resp = await (api.thuoc && api.thuoc.search ? api.thuoc.search({ q }) : Promise.resolve([]));
    const r = resp && resp.data ? resp.data : resp;
    if (Array.isArray(r) && r.length) {
      const t = r[0];
      items.value.push({ maThuoc: t.maThuoc || t.MaThuoc || '', tenThuoc: t.tenThuoc || t.TenThuoc || t.ten || '', tenLoaiDonVi: t.tenLoaiDonVi || t.tenDonVi || '', soLuongCon: t.soLuongCon ?? t.soLuongTon ?? 0, hanSuDung: t.hanSuDung || '', soLuong: 1, donGia: t.giaBan || t.donGia || 0, thanhTien: Number(t.giaBan || t.donGia || 0), tenLD: '' });
      newItemSearch.value = '';
    } else {
      ElMessage.info('Không tìm thấy thuốc phù hợp');
    }
  } catch (err) {
    console.error('search thuoc err', err);
    ElMessage.error('Tìm thuốc thất bại');
  }
};

// --- Customer lookup by phone ---
const customers = ref([]);
const matchedCustomers = ref([]);
const selectedCustomer = ref('');

const fetchCustomers = async () => {
  try {
    const resp = await api.khachhang.getAll();
    // Đảm bảo customers.value luôn là mảng
    let data = resp?.data ?? resp;
    if (data && typeof data === 'object' && !Array.isArray(data)) {
      // Nếu data là object với key data bên trong (nested)
      data = data.data || data.items || data.result || [];
    }
    customers.value = Array.isArray(data) ? data : [];
  } catch (err) {
    console.error('fetch customers err', err);
    customers.value = [];
  }
};

const onPhoneInput = async () => {
  const q = (form.value.soDienThoai || '').trim();
  if (!q) {
    matchedCustomers.value = [];
    selectedCustomer.value = '';
    form.value.maKH = ''; // Clear maKH
    form.value.tenKH = form.value.tenKH || '';
    return;
  }

  if (!Array.isArray(customers.value) || !customers.value.length) await fetchCustomers();

  // Đảm bảo customers.value là mảng trước khi filter
  const customerList = Array.isArray(customers.value) ? customers.value : [];
  // match by phone contains; also allow matching by last digits
  matchedCustomers.value = customerList.filter(c => {
    const d = (c.dienThoai || '').toString();
    return d && (d.includes(q) || d.endsWith(q) || d.replace(/\D/g, '').includes(q.replace(/\D/g, '')));
  });

  // if an exact unique match, auto-select
  if (matchedCustomers.value.length === 1) {
    selectedCustomer.value = matchedCustomers.value[0].makh;
    onSelectCustomer(selectedCustomer.value);
  }
};

const onSelectCustomer = (maKh) => {
  const c = customers.value.find(x => x.makh === maKh);
  if (c) {
    form.value.maKH = c.makh; // Set maKH
    form.value.tenKH = c.hoTen || '';
    // optionally fill phone to normalized value
    form.value.soDienThoai = c.dienThoai || form.value.soDienThoai;
  }
};

// Autocomplete fetch for el-autocomplete
const querySearch = async (queryString, cb) => {
  const q = (queryString || '').trim();
  if (!Array.isArray(customers.value) || !customers.value.length) await fetchCustomers();
  if (!q) {
    cb([]);
    return;
  }

  // Đảm bảo customers.value là mảng trước khi filter
  const customerList = Array.isArray(customers.value) ? customers.value : [];
  const lower = q.toLowerCase().replace(/\D/g, '');
  const results = customerList.filter(c => {
    const name = (c.hoTen || '').toLowerCase();
    const phone = (c.dienThoai || '').toString();
    return (phone && phone.includes(q)) || (name && name.includes(q.toLowerCase())) || (phone.replace(/\D/g, '').endsWith(lower));
  }).map(c => ({ makh: c.makh, hoTen: c.hoTen, dienThoai: c.dienThoai }));

  cb(results);
};

const onSelectSuggestion = (item) => {
  if (!item) return;
  form.value.maKH = item.makh || ''; // Set maKH
  form.value.tenKH = item.hoTen || '';
  form.value.soDienThoai = item.dienThoai || form.value.soDienThoai;
  selectedCustomer.value = item.makh || '';
};

// --- Dosage (Lieu Dung) Suggestions ---
const lieuDungList = ref([]);

const loadLieuDung = async () => {
  try {
    const resp = await http.get('/LieuDung');
    const d = resp.data || resp;
    if (d && d.data && Array.isArray(d.data)) {
      lieuDungList.value = d.data.map(x => ({ value: x.tenLieuDung, maLD: x.maLD || x.MaLD || null }));
    }
  } catch (err) {
    console.error('loadLieuDung err', err);
  }
};

const querySearchLieuDung = (queryString, cb) => {
  const results = queryString
    ? lieuDungList.value.filter(i => i.value.toLowerCase().includes(queryString.toLowerCase()))
    : lieuDungList.value;
  cb(results);
};

// Confirmation mode: when opened from list to "confirm" an existing invoice
const confirmMode = ref(false);

const loadInvoice = async (maHD) => {
  if (!maHD) return;
  try {
    let resp;
    // Prefer detailed endpoint /HoaDon/ChiTiet/:maHD if available
    if (api.hoadon && typeof api.hoadon.getChiTiet === 'function') {
      resp = await api.hoadon.getChiTiet(maHD);
    } else {
      // Try direct ChiTiet path
      try {
        resp = await http.get(`/HoaDon/ChiTiet/${encodeURIComponent(maHD)}`);
      } catch (e) {
        // fallback to other endpoints
        if (api.hoadon && typeof api.hoadon.getById === 'function') {
          resp = await api.hoadon.getById(maHD);
        } else if (api.hoadon && typeof api.hoadon.get === 'function') {
          resp = await api.hoadon.get(maHD);
        } else {
          resp = await http.get(`/HoaDon/Details/${encodeURIComponent(maHD)}`);
        }
      }
    }

    const r = resp && resp.data ? resp.data : resp;
    // Normalize payload shape (sometimes the API wraps in { data: ... })
    const inv = (r && r.data && typeof r.data === 'object') ? (r.data || r) : r;

    // If the API returns { invoice: {...}, items: [...] } use invoice as the source for header fields
    const src = inv.invoice || inv;

    // Map main fields from src
    form.value.ngayLap = src.NgayLap || src.ngayLap || form.value.ngayLap;
    form.value.maHD = src.MaHD || src.maHD || src.maHd || form.value.maHD || route.query.maHD || route.query.mahd || null;
    form.value.maKH = src.MaKH || src.maKH || src.maKh || form.value.maKH;
    form.value.tenKH = src.TenKH || src.tenKH || src.tenKh || form.value.tenKH;
    form.value.soDienThoai = src.DienThoaiKH || src.dienThoaiKH || src.soDienThoai || form.value.soDienThoai;
    form.value.tenNV = src.TenNV || src.tenNV || form.value.tenNV;
    form.value.ghiChu = src.GhiChu || src.ghiChu || src.ghi || form.value.ghiChu;

    // Map items: try several common property names (prefer top-level items when present)
    const rawItems = inv.items || inv.chiTietHoaDons || inv.chiTiet || inv.data?.items || inv.data?.chiTiet || inv.data || [];
    const arr = Array.isArray(rawItems) ? rawItems : [];
    items.value = arr.map(it => ({
      maThuoc: it.maThuoc || it.MaThuoc || it.maThu || it.productCode || '',
      tenThuoc: it.tenThuoc || it.TenThuoc || it.ten || it.productName || '',
      tenLoaiDonVi: it.tenLoaiDonVi || it.TenLoaiDonVi || it.donVi || it.donGiaDonVi || '',
      soLuongCon: it.soLuongCon ?? it.soLuongTon ?? it.soLuong ?? it.SoLuong ?? 0,
      hanSuDung: it.hanSuDung || it.HanSuDung || it.hsd || '',
      soLuong: it.soLuong || it.SoLuong || it.quantity || 1,
      donGia: it.donGia || it.DonGia || it.price || 0,
      thanhTien: Number(it.thanhTien || it.ThanhTien || ( (it.soLuong||0) * (it.donGia||0) ) || 0),
      maGiaThuoc: it.maGiaThuoc || it.MaGiaThuoc || null,
      tenLD: it.tenLD || it.lieuDung || '' ,
      giaThuocs: [],
      raw: it
    }));
    // Recalculate rows
    items.value.forEach(rw => recalcRow(rw));
    // Fetch giaThuocs for each unique medicine so SL Còn displays correctly
    try {
      const uniqueMa = Array.from(new Set(items.value.map(x => x.maThuoc).filter(Boolean)));
      await Promise.all(uniqueMa.map(async (ma) => {
        try {
          const respG = await api.thuoc.getGiaThuocs(ma);
          const rg = respG && respG.data ? respG.data : respG;
          const rawG = (rg && rg.data && rg.data.giaThuocs) ? rg.data.giaThuocs : (rg && rg.giaThuocs) ? rg.giaThuocs : (Array.isArray(rg) ? rg : []);
          const mapped = (Array.isArray(rawG) ? rawG : []).map(g => ({
            maGiaThuoc: g.maGiaThuoc || g.MaGiaThuoc || null,
            maLoaiDonVi: g.maLoaiDonVi || g.MaLoaiDonVi || null,
            tenLoaiDonVi: g.tenLoaiDonVi || g.TenLoaiDonVi || g.tenDonVi || '',
            soLuong: g.soLuong ?? g.SoLuong ?? 1,
            donGia: g.donGia ?? g.DonGia ?? 0,
            trangThai: typeof g.trangThai === 'boolean' ? g.trangThai : (g.trangThai === 'true' || g.TrangThai === true),
            soLuongCon: g.soLuongCon ?? g.soLuongTon ?? 0,
            nearestHanSuDung: g.nearestHanSuDung || g.NearestHanSuDung || g.hanSuDung || null,
            raw: g
          }));

          // attach to matching items
          items.value.forEach(it => {
            if (!it.maThuoc || it.maThuoc !== ma) return;
            it.giaThuocs = mapped;
            // try to match item's maLoaiDonVi -> maLoaiDonVi may be in item.maLoaiDonVi
            const preferMaLoai = it.maLoaiDonVi || it.maLoaiDonVi || null;
            let sel = null;
            if (preferMaLoai) sel = mapped.find(x => x.maLoaiDonVi === preferMaLoai || x.maGiaThuoc === preferMaLoai);
            if (!sel) sel = mapped.find(x => x.trangThai) || mapped[0] || null;
            if (sel) {
              it.soLuongCon = sel.soLuongCon ?? sel.soLuong ?? it.soLuongCon;
              it.maGiaThuoc = it.maGiaThuoc || sel.maGiaThuoc;
              it.tenLoaiDonVi = it.tenLoaiDonVi || sel.tenLoaiDonVi;
              it.donGia = it.donGia || sel.donGia;
              // If item has no explicit hanSuDung, use nearestHanSuDung from giaThuoc
              it.hanSuDung = it.hanSuDung || sel.nearestHanSuDung || it.hanSuDung || '';
            }
          });
        } catch (e) {
          console.error('load giaThuocs for', ma, e);
        }
      }));
    } catch (e) {
      console.error('load giaThuocs batch err', e);
    }
  } catch (err) {
    console.error('loadInvoice err', err);
  }
};

</script>

<style scoped>

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
  flex: 1 1 45%;
  min-width: 260px;
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
  gap: 8px;
  flex: 1;
}

.meta-label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.form-input {
  width: 100%;
}

.note-full {
  flex: 1 1 100%;
}

.form-input :deep(.el-input__inner),
.form-input :deep(.el-input__wrapper) {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.2);
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

/* Search Card */
.search-card {
  margin-bottom: 24px;
  border-radius: 16px;
  border: none;
}

.search-card :deep(.el-card__body) {
  padding: 16px 24px;
  background: white;
}

.search-container {
  display: flex;
  gap: 12px;
  align-items: center;
}

.search-icon {
  font-size: 18px;
  color: #667eea;
  flex: 0 0 20px;
}

.search-input {
  flex: 1;
  min-width: 0;
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

.add-btn {
  background: rgba(255, 255, 255, 0.2) !important;
  border-color: rgba(255, 255, 255, 0.4) !important;
  color: white !important;
  font-weight: 600;
  border-radius: 8px;
}

.add-btn:hover {
  background: rgba(255, 255, 255, 0.3) !important;
}

/* When add button lives inside the table card (which is white), make it visible */
.table-card .add-btn {
  background: #ffffff !important;
  color: #1f2937 !important;
  border-color: rgba(0,0,0,0.06) !important;
  box-shadow: 0 6px 18px rgba(16,24,40,0.06) !important;
}

.table-card .add-btn:hover {
  background: #f7fafc !important;
  color: #111827 !important;
}

/* Modern Table */
.modern-table :deep(.el-table__header) {
  background: linear-gradient(135deg, #2d3748 0%, #4a5568 100%);
}

.modern-table :deep(.el-table th) {
  background: transparent !important;
  color: white;
  font-weight: 600;
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.modern-table :deep(.el-table td) {
  border-bottom: 1px solid #e2e8f0;
  padding: 14px 12px;
  font-size: 13px;
}

.modern-table :deep(.el-table__row:hover > td) {
  background-color: #f7fafc !important;
}

.modern-table :deep(.el-table--striped .el-table__body tr.el-table__row--striped td) {
  background-color: #f8fafc;
}

.amount-cell {
  font-weight: 600;
  color: #2d3748;
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
  padding: 12px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  border-left: 3px solid #48bb78;
}

.note-textarea {
  width: 100%;
}
.note-textarea :deep(.el-textarea__inner) {
  background: rgba(255,255,255,0.06);
  color: white;
  border-radius: 8px;
  padding: 12px;
  border: 1px solid rgba(255,255,255,0.08);
}
.note-textarea :deep(.el-textarea__inner)::placeholder {
  color: rgba(255,255,255,0.5);
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
  font-size: 13px;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 8px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.total-amount {
  font-size: 32px;
  font-weight: 800;
  color: #48bb78;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  margin-bottom: 8px;
}

.total-words {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  font-style: italic;
}

/* Responsive Design */
@media (max-width: 1200px) {
  .header-content {
    flex-direction: column;
    gap: 24px;
  }

  .footer-content {
    flex-direction: column-reverse;
    gap: 24px;
  }
}

@media (max-width: 768px) {
  .invoice-detail-container {
    padding: 16px;
  }

  .header-card :deep(.el-card__body) {
    padding: 20px;
  }

  .table-card :deep(.el-card__header) {
    padding: 16px 20px;
  }

  .meta-row {
    flex-direction: column;
    gap: 12px;
  }

  .meta-item {
    min-width: 100%;
  }

  .header-actions {
    flex-direction: row;
    align-self: stretch;
    width: 100%;
  }

  .action-btn {
    flex: 1;
  }

  .search-container {
    flex-direction: column;
  }

  .search-input {
    width: 100%;
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .invoice-detail-container {
    background: linear-gradient(135deg, #1a202c 0%, #2d3748 100%);
  }
}

/* Suggestion item styles: fixed-width name column so thành phần lines up */
.medicine-option {
  display: flex;
  gap: 12px;
  align-items: center;
  width: 100%;
}
.medicine-option-left {
  font-weight: 600;
  color: #222;
  flex: 0 0 320px; /* fixed width so ingredient column aligns */
  max-width: 320px;
  white-space: nowrap; /* single-line with ellipsis */
  overflow: hidden;
  text-overflow: ellipsis;
}
.medicine-option-right {
  color: #666;
  font-size: 13px;
  flex: 1 1 auto;
  min-width: 120px;
  white-space: normal;
  overflow: hidden;
  text-overflow: ellipsis;
  text-align: left;
}

/* Ensure styles apply inside Element Plus dropdown (popper root outside scoped DOM) */
:deep(.el-select-dropdown__item) .medicine-option {
  padding: 8px 12px;
}
:deep(.el-select-dropdown__item) .medicine-option-left {
  flex: 0 0 320px;
  max-width: 320px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
:deep(.el-select-dropdown__item) .medicine-option-right {
  flex: 1 1 auto;
  min-width: 120px;
}
  
/* Small helpers for Hạn SD and SL cell layout */
.cell-han {
  display: flex;
  justify-content: center;
  align-items: center;
}
.cell-han :deep(.el-date-editor),
.cell-han :deep(.el-input__inner) {
  width: 110px !important;
  margin: 0 auto;
  display: block;
}
.cell-sl {
  display: flex;
  justify-content: center;
  align-items: center;
}
.cell-sl :deep(.el-input-number),
.cell-sl :deep(.el-input-number__wrapper),
.cell-sl :deep(.el-input-number__input),
.cell-sl :deep(.el-input-number__inner) {
  width: 78px !important;
  margin: 0 auto;
  display: block;
  text-align: center;
}

.action-buttons {
  display: flex;
  gap: 6px;
  justify-content: center;
  align-items: center;
}
.action-buttons :deep(.el-button) {
  padding: 6px;
}

/* Scan Dialog Styles */
.scan-input-field {
  margin: 20px 0;
}
.scan-input-field :deep(.el-input__inner),
.scan-input-field :deep(.el-input__wrapper) {
  font-size: 16px;
  padding: 12px;
  border-radius: 8px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Chỉ áp dụng spin cho loading icon của Element Plus, không áp dụng cho toàn bộ button */
.el-button.is-loading .el-icon.is-loading {
  animation: spin 2s linear infinite;
}

/* Tắt animation cho các icon thường trong button khi loading */
.el-button.is-loading > .el-icon:not(.is-loading) {
  animation: none !important;
}

</style>
