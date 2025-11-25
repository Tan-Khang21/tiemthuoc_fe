<template>
  <div class="invoice-detail-container">
    <!-- Modern Header Card -->
    <el-card class="header-card" shadow="hover">
      <div class="header-content">
        <div class="header-left">
          <div class="invoice-title">
            <el-icon class="title-icon"><Document /></el-icon>
            <h2 class="title-text">Tạo Hóa đơn mới</h2>
            <el-tag class="invoice-code" type="success" effect="light">Mới</el-tag>
          </div>

          <div class="invoice-meta">
            <!-- Row 1: Ngày lập + Nhân viên -->
            <div class="meta-row">
              <div class="meta-item">
                <el-icon class="meta-icon"><Calendar /></el-icon>
                <div class="meta-content">
                  <span class="meta-label">Ngày lập</span>
                  <el-date-picker v-model="form.ngayLap" type="date" placeholder="Chọn ngày" format="DD/MM/YYYY" value-format="YYYY-MM-DD" class="form-input" />
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
                  <el-input v-model="form.tenKH" placeholder="Nhập tên khách hàng" class="form-input" clearable />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="header-actions">
          <el-button class="action-btn" size="default" @click="$router.back()">Hủy</el-button>
        </div>
      </div>
    </el-card>

    <!-- Quick-split dialog (two-column layout like screenshot) -->
    <el-dialog title="Tách nhanh thuốc" v-model="tachDialog" width="820px" :close-on-click-modal="false">
      <el-row :gutter="24">
        <el-col :span="12">
          <el-form label-position="top" label-width="auto">
            <el-form-item label="Đơn vị mới">
              <el-select v-model="tachNewUnit" placeholder="Chọn đơn vị" clearable style="width:100%">
                <el-option
                  v-for="g in (items[tachIndex]?.giaThuocs || [])"
                  :key="g.maGiaThuoc"
                  :label="g.tenLoaiDonVi + (g.soLuong ? ' (' + g.soLuong + ')' : '')"
                  :value="g.maLoaiDonVi"
                />
              </el-select>
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

        <el-table :data="items" class="modern-table" stripe style="width:100%">
        <!-- "Mã thuốc" column removed per request -->
        <el-table-column label="Tên thuốc" min-width="200">
          <template #default="{ row, $index }">
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
          </template>
        </el-table-column>
        <el-table-column label="Đơn vị" width="140" align="center">
          <template #default="{ row }">
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
              <el-input-number v-model="row.soLuong" :min="0" size="small" @change="recalcRow(row)" controls-position="right" style="width:78px" />
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
            <el-input v-model="row.tenLD" size="small" placeholder="Ví dụ: 2 viên/ngày" clearable />
          </template>
        </el-table-column>
        <el-table-column label="Hành động" width="140" align="center" fixed="right">
          <template #default="{ row, $index }">
            <div class="action-buttons">
              <el-button type="primary" size="small" link title="Tách" @click="tachItem($index)">
                <el-icon><CopyDocument /></el-icon>
              </el-button>

              <el-popconfirm title="Xuất / huỷ thuốc?" @confirm="xuatItem($index)" confirm-button-text="Xuất" cancel-button-text="Hủy">
                <template #reference>
                  <el-button type="warning" size="small" link title="Xuất (huỷ)">
                    <el-icon><Upload /></el-icon>
                  </el-button>
                </template>
              </el-popconfirm>

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
          <el-button class="action-btn add-btn" type="primary" size="default" @click="addEmptyItem">
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
        <el-button size="default" @click="$router.back()">Hủy</el-button>
        <el-button type="primary" size="default" @click="submitInvoice">
          <el-icon><Check /></el-icon>
          Lưu hóa đơn
        </el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { Document, Calendar, User, Avatar, InfoFilled, Printer, List, Search, Plus, Close, Delete, EditPen, Check, Phone, CopyDocument, Upload } from '@element-plus/icons-vue';
import api from '@/api';
import http from '@/api/axios';
import { useAuthStore } from '@/store/auth';
import { numberToWords } from '@/utils/numberUtils';

const router = useRouter();
// Pinia auth store instance used to read logged-in employee
const auth = useAuthStore();

const form = ref({
  ngayLap: new Date().toISOString().slice(0,10),
  tenKH: '',
  soDienThoai: '',
  tenNV: '',
  ghiChu: ''
});

const items = ref([]);

const newItemSearch = ref('');

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

const loadGiaThuocsForMedicine = async (m) => {
  if (!m || m.giaThuocs) return;
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

// Tach (quick-split) flow: open dialog to choose new unit and expiry, call API then split locally
const tachIndex = ref(-1);
const tachDialog = ref(false);
const tachLoading = ref(false);
const tachNewUnit = ref('');
const tachNewExpiry = ref(null);
const tachExpiryOption = ref('custom');

const applyTachExpiryOption = (opt) => {
  tachExpiryOption.value = opt;
  if (opt === 'custom') return;
  const months = Number(opt) || 0;
  const d = new Date();
  d.setMonth(d.getMonth() + months);
  tachNewExpiry.value = d;
};

const tachItem = (idx) => {
  const row = items.value[idx];
  if (!row) return;
  // Always open dialog; allow user to quick-split even if soLuong <= 1
  tachIndex.value = idx;
  // prefill unit & expiry from the row's giaThuocs or current values
  tachNewUnit.value = row.giaThuocs && row.giaThuocs.length ? (row.giaThuocs.find(g => g.trangThai) || row.giaThuocs[0]).maLoaiDonVi : '';
  tachNewExpiry.value = row.hanSuDung ? new Date(row.hanSuDung) : null;
  tachDialog.value = true;
};

const doTachSubmit = async () => {
  if (tachIndex.value < 0) return;
  const row = items.value[tachIndex.value];
  if (!row) return;
  if (!tachNewUnit.value) { ElMessage.error('Vui lòng chọn đơn vị mới'); return; }

  // Build API body
    const body = {
      maThuoc: row.maThuoc,
      maLoaiDonViMoi: tachNewUnit.value,
      hanSuDungMoi: tachNewExpiry.value ? new Date(tachNewExpiry.value).toISOString() : undefined,
    };

  tachLoading.value = true;
  try {
    await http.post('/PhieuQuyDoi/QuickByMa', body);
    // on success, perform local split
    const q = Number(row.soLuong) || 0;
    // prepare new row object copying selected giaThuoc info
    const g = (row.giaThuocs || []).find(x => x.maLoaiDonVi === tachNewUnit.value) || null;
    const newRow = {
      maThuoc: row.maThuoc,
      tenThuoc: row.tenThuoc,
      tenLoaiDonVi: g?.tenLoaiDonVi || row.tenLoaiDonVi || '',
      maGiaThuoc: g?.maGiaThuoc || '',
      soLuongCon: g?.soLuongCon ?? g?.soLuong ?? 0,
      hanSuDung: tachNewExpiry.value ? new Date(tachNewExpiry.value).toISOString().slice(0,10) : (g?.nearestHanSuDung || ''),
      soLuong: 1,
      donGia: g?.donGia || row.donGia || 0,
      thanhTien: (g?.donGia || row.donGia || 0) * 1,
      tenLD: row.tenLD || '',
      thanhPhan: row.thanhPhan || ''
    };

    if (q > 1) {
      row.soLuong = q - 1;
      recalcRow(row);
      items.value.splice(tachIndex.value + 1, 0, newRow);
    } else {
      // replace the original row with the new row when original quantity <= 1
      items.value.splice(tachIndex.value, 1, newRow);
    }
    ElMessage.success('Tách nhanh thành công');
    tachDialog.value = false;
  } catch (err) {
    console.error('doTachSubmit err', err);
    ElMessage.error('Tách nhanh thất bại');
  } finally {
    tachLoading.value = false;
  }
};

const xuatItem = (idx) => {
  const row = items.value[idx];
  if (!row) return;
  // perform export/cancel action: mark as cancelled and remove from list
  // here we remove the item and show message; adapt to real API if needed
  items.value.splice(idx, 1);
  ElMessage.success('Đã xuất / huỷ thuốc');
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

const submitInvoice = async () => {
  // basic validation
  if (!form.value.tenKH) { ElMessage.warning('Vui lòng nhập tên khách hàng'); return; }
  if (!items.value.length) { ElMessage.warning('Vui lòng thêm ít nhất 1 mặt hàng'); return; }

  const payload = {
    ngayLap: form.value.ngayLap,
    tenKH: form.value.tenKH,
    soDienThoai: form.value.soDienThoai,
    tenNV: form.value.tenNV,
    ghiChu: form.value.ghiChu,
    items: items.value.map(it => ({
      maThuoc: it.maThuoc, tenThuoc: it.tenThuoc, tenLoaiDonVi: it.tenLoaiDonVi, soLuongCon: it.soLuongCon,
      hanSuDung: it.hanSuDung, soLuong: it.soLuong, donGia: it.donGia,
      thanhTien: it.thanhTien, tenLD: it.tenLD
    })),
    tongTien: totalAmount.value
  };

  try {
    const resp = await api.hoadon.create(payload);
    const r = (resp && resp.data) ? resp.data : resp;
    if (r && (r.status === -1 || r.error)) {
      ElMessage.error(r.message || 'Tạo hóa đơn thất bại');
      return;
    }
    ElMessage.success('Tạo hóa đơn thành công');
    // redirect to detail page if id returned
    const maHD = r && (r.maHD || r.MaHD || r.data && (r.data.maHD || r.data.MaHD)) ? (r.maHD || r.MaHD || r.data.maHD || r.data.MaHD) : null;
    if (maHD) router.push(`/admin/hoadon/${encodeURIComponent(maHD)}`);
    else router.back();
  } catch (err) {
    console.error('create hoadon err', err);
    ElMessage.error('Lỗi khi tạo hóa đơn');
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
  // Load medicines list first
  await loadMedicines();
  
  // populate current employee name from auth store (fallback to localStorage)
  try {
    if (!auth.user) auth.initAuth();
    const u = auth.currentUser || auth.user || null;
    let name = null;
    if (u) {
      name = u.HoTen || u.hoTen || u.tenNV || u.TenNV || null;
      const ma = u.MaNV || u.maNV;
      // if name missing or a placeholder, fetch authoritative name from API
      if (ma && ( !name || isPlaceholderName(name) )) {
        const fetched = await fetchEmployeeById(ma);
        if (fetched) name = fetched;
      }
    } else {
      const ustr = localStorage.getItem('user');
      if (ustr) {
        const uu = JSON.parse(ustr);
        name = uu?.hoTen || uu?.HoTen || uu?.tenNV || uu?.TenNV || null;
        const ma = uu?.MaNV || uu?.maNV;
        if (ma && ( !name || isPlaceholderName(name) )) {
          const fetched = await fetchEmployeeById(ma);
          if (fetched) name = fetched;
        }
      }
    }
    if (name) form.value.tenNV = name;
    console.log('hoadon-create init auth.user ->', auth.user, 'form.tenNV ->', form.value.tenNV);
  } catch (e) { console.error('hoadon-create init auth error', e); }
});

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
    customers.value = resp && resp.data ? resp.data : resp || [];
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
    form.value.tenKH = form.value.tenKH || '';
    return;
  }

  if (!customers.value.length) await fetchCustomers();

  // match by phone contains; also allow matching by last digits
  matchedCustomers.value = customers.value.filter(c => {
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
    form.value.tenKH = c.hoTen || '';
    // optionally fill phone to normalized value
    form.value.soDienThoai = c.dienThoai || form.value.soDienThoai;
  }
};

// Autocomplete fetch for el-autocomplete
const querySearch = async (queryString, cb) => {
  const q = (queryString || '').trim();
  if (!customers.value.length) await fetchCustomers();
  if (!q) {
    cb([]);
    return;
  }

  const lower = q.toLowerCase().replace(/\D/g, '');
  const results = customers.value.filter(c => {
    const name = (c.hoTen || '').toLowerCase();
    const phone = (c.dienThoai || '').toString();
    return (phone && phone.includes(q)) || (name && name.includes(q.toLowerCase())) || (phone.replace(/\D/g, '').endsWith(lower));
  }).map(c => ({ makh: c.makh, hoTen: c.hoTen, dienThoai: c.dienThoai }));

  cb(results);
};

const onSelectSuggestion = (item) => {
  if (!item) return;
  form.value.tenKH = item.hoTen || '';
  form.value.soDienThoai = item.dienThoai || form.value.soDienThoai;
  selectedCustomer.value = item.makh || '';
};

</script>

<style scoped>
/* Main Container */
.invoice-detail-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
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

</style>
