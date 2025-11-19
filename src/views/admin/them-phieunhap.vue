<template>
  <div class="add-phieunhap-container">
    <el-card class="main-card" shadow="never">
      <template #header>
        <div class="card-header">
          <div class="header-left">
            <el-icon class="header-icon"><Plus /></el-icon>
            <div>
              <h3>{{ form.maPN ? 'Sửa Phiếu Nhập' : 'Thêm Phiếu Nhập Hàng' }}</h3>
              <p class="header-desc">{{ form.maPN ? 'Chỉnh sửa phiếu nhập' : 'Tạo phiếu nhập mới cho nhà thuốc' }}</p>
            </div>
          </div>
          <div class="header-right">
            <el-tag type="info" size="small">
              <el-icon><User /></el-icon>
              {{ tenNhanVien || 'Chưa xác định' }}
            </el-tag>
          </div>
        </div>
      </template>

      <el-form :model="form" ref="formRef" label-width="120px" class="phieu-form">
        <el-divider>Thông tin phiếu nhập</el-divider>
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="Ngày nhập" required>
              <el-input :value="currentDateFormatted" readonly style="width:100%" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="Nhà cung cấp" required>
              <el-select
                v-model="form.maNCC"
                :disabled="savedMode"
                placeholder="Chọn hoặc nhập nhà cung cấp"
                filterable
                clearable
                allow-create
                style="width:100%"
              >
                <el-option
                  v-for="n in nccList"
                  :key="n.maNCC || n.MaNCC || n.id"
                  :label="formatSupplierLabel(n)"
                  :value="n.maNCC || n.MaNCC || n.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="Nhân viên nhập">
              <el-input v-model="tenNhanVien" readonly style="width:100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="Ghi chú">
              <el-input
                v-model="form.ghiChu"
                type="textarea"
                :rows="2"
                placeholder="Nhập ghi chú cho phiếu nhập (tùy chọn)"
                maxlength="500"
                show-word-limit
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-divider>Danh sách mặt hàng</el-divider>
        <div class="items-section">
          <el-table
            :data="form.items"
            border
            size="small"
            :fit="true"
            :default-expand-all="true"
            style="width:100%; margin-top: 16px;"
            empty-text="Chưa có mặt hàng nào"
          >
            <el-table-column type="index" label="STT" width="60" align="center" header-class-name="col-header" />
            <el-table-column label="Thuốc" min-width="140" required header-class-name="col-header">
              <template #default="{ row, $index }">
                <div class="item-two-lines">
                  <el-select
                    v-model="row.maThuoc"
                    :disabled="savedMode"
                    filterable
                    remote
                    reserve-keyword
                    placeholder="Chọn thuốc"
                    :remote-method="remoteSearchMedicine"
                    :loading="medLoading"
                    :value-key="'maThuoc'"
                    @change="onMedicineChange(row)"
                    clearable
                    class="item-top-select"
                  >
                    <el-option
                      v-for="m in filteredMedicines"
                      :key="m.maThuoc"
                      :label="m.tenThuoc"
                      :value="m.maThuoc"
                    >
                      <div class="medicine-option">
                        <div class="medicine-option-name">{{ m.tenThuoc }}</div>
                        <div class="medicine-option-ingredient">{{ (m.thanhPhan || '').slice(0, 80) }}</div>
                      </div>
                    </el-option>
                  </el-select>
                </div>
              </template>
            </el-table-column>
            <!-- expanded row shows Hạn sử dụng (left) and Ghi chú (right spanning) -->
            <el-table-column type="expand">
              <template #default="{ row }">
                <div class="expanded-row">
                  <div class="expanded-left">
                    <el-form-item label="Hạn sử dụng" class="no-label">
                      <el-date-picker
                        v-model="row.hanSuDung"
                        :disabled="savedMode"
                        type="date"
                        placeholder="Hạn sử dụng"
                        format="DD/MM/YYYY"
                        value-format="YYYY-MM-DD"
                        style="width:100%"
                      />
                    </el-form-item>
                  </div>
                  <div class="expanded-right">
                    <el-form-item label="Ghi chú" class="no-label">
                      <el-input v-model="row.ghiChu" :disabled="savedMode" placeholder="Ghi chú" maxlength="200" class="note-control" />
                    </el-form-item>
                  </div>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="Đơn vị nhập" min-width="80" header-class-name="col-header">
              <template #default="{ row }">
                <el-select
                  v-model="row.maLoaiDonViNhap"
                  :disabled="savedMode"
                  placeholder="Chọn đơn vị"
                  clearable
                  filterable
                  style="width:100%"
                  @change="onUnitChange(row)"
                >
                  <el-option
                    v-for="g in row.giaThuocs || []"
                    :key="g.maGiaThuoc || g.maLoaiDonVi"
                    :label="g.tenLoaiDonVi + (g.soLuong ? ' ('+ g.soLuong +')' : '')"
                    :value="g.maLoaiDonVi"
                  />
                </el-select>
              </template>
            </el-table-column>
            <el-table-column label="SL Còn" width="70" align="center" header-class-name="col-header">
              <template #default="{ row }">
                <span class="remaining-text">{{ getRemaining(row) }}</span>
              </template>
            </el-table-column>
            <el-table-column label="Giá bán" width="120" align="right" header-class-name="col-header">
              <template #default="{ row }">
                <span class="price-text" style="display:block; text-align:right">
                  {{ (row.donGiaBan != null) ? formatPrice(row.donGiaBan) : (row.donGia != null ? formatPrice(row.donGia) : '-') }}
                </span>
              </template>
            </el-table-column>
            <el-table-column label="Số lượng" width="110" required header-class-name="col-header">
              <template #default="{ row }">
                <el-input-number
                  v-model="row.soLuong"
                  :disabled="savedMode"
                  :min="1"
                  :max="9999"
                  controls-position="right"
                  style="width:100%"
                />
              </template>
            </el-table-column>
            <el-table-column label="Đơn giá (VNĐ)" min-width="100" required header-class-name="col-header">
              <template #default="{ row }">
                <el-input-number
                  v-model="row.donGia"
                  :disabled="savedMode"
                  :min="0"
                  :step="1000"
                  :precision="0"
                  controls-position="right"
                  style="width:100%"
                />
              </template>
            </el-table-column>
            <el-table-column label="Thành tiền" min-width="90" header-class-name="col-header">
              <template #default="{ row }">
                <span class="price-text" style="display:block; text-align:right">{{ formatPrice(row.thanhTien) }}</span>
              </template>
            </el-table-column>
            <!-- Thành tiền, Hạn sử dụng, Ghi chú are rendered inside the Thuốc cell (second-line) -->
            <el-table-column label="Thao tác" width="70" align="center" header-class-name="col-header">
              <template #default="{ row, $index }">
                <el-button
                  v-if="!savedMode"
                  size="small"
                  type="danger"
                  circle
                  @click="removeItem($index)"
                  :icon="Delete"
                  title="Xóa"
                />
              </template>
            </el-table-column>
          </el-table>

          <div class="items-footer">
            <el-button v-if="!savedMode" type="primary" size="small" @click="addItem" :icon="Plus">
              Thêm mặt hàng
            </el-button>
          </div>

          <div class="total-section" v-if="form.items.length > 0">
            <el-divider />
            <div class="total-row">
              <div class="total-label">Tổng tiền phiếu nhập:</div>
              <div class="total-amount">{{ formatPrice(totalAmount) }}</div>
            </div>
          </div>
        </div>

        <el-divider />
        <div class="form-actions">
          <el-button @click="$router.back()" size="large" :icon="ArrowLeft">
            Quay lại
          </el-button>
          <el-button
            v-if="!savedMode"
            type="primary"
            size="large"
            @click="save"
            :loading="saving"
            :icon="Check"
          >
            Lưu phiếu nhập
          </el-button>
          <el-button v-else type="warning" size="large" @click="savedMode = false">
            Chỉnh sửa lại
          </el-button>
          <el-button v-if="savedMode" type="primary" size="large" @click="printPhieu" :icon="Printer">
            In phiếu
          </el-button>
        </div>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import api from '@/api';
import { ElMessage } from 'element-plus';
import { useRoute, useRouter } from 'vue-router';
import { numberToWords } from '@/utils/numberUtils';
import { useAuthStore } from '@/store/auth';
import { Plus, Delete, Check, ArrowLeft, User, Printer } from '@element-plus/icons-vue';

const formRef = ref(null);
const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const saving = ref(false);
const tenNhanVien = ref('');

// when true the form is locked/read-only after a successful save
const savedMode = ref(false);

const nccList = ref([]);
const medicines = ref([]);
const filteredMedicines = ref([]);
const medLoading = ref(false);

const form = ref({
  maPN: '',
  ngayNhap: new Date(),
  maNCC: null,
  maNV: authStore.currentUser?.MaNV || '',
  tongTien: 0,
  ghiChu: '',
  items: [ { maCTPN: '', maThuoc: null, soLuong: 1, donGia: 0, donGiaBan: null, thanhTien: 0, hanSuDung: null, maLoaiDonViNhap: '', ghiChu: '' } ],
});

const formatPrice = (v) => {
  if (!v && v !== 0) return '';
  return Number(v).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
};

const currentDateFormatted = computed(() => {
  const d = form.value.ngayNhap ? new Date(form.value.ngayNhap) : new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
});

const totalAmount = computed(() => {
  return form.value.items.reduce((sum, item) => sum + (item.thanhTien || 0), 0);
});

watch(() => form.value.items, (newItems) => {
  newItems.forEach(item => {
    item.thanhTien = (item.soLuong || 0) * (item.donGia || 0);
  });
  form.value.tongTien = totalAmount.value;
}, { deep: true });

const loadSuppliers = async () => {
  try {
    const resp = await api.nhacungcap.getAll();
    // Some APIs return { status, message, data: [...] } while others return an array directly.
    const raw = (resp && resp.data && resp.data.data) ? resp.data.data : (resp.data || []);
    // normalize supplier objects to common keys: maNCC, tenNCC, sdt
    nccList.value = (Array.isArray(raw) ? raw : []).map(s => ({
      maNCC: s.maNCC || s.MaNCC || s.id || null,
      tenNCC: s.tenNCC || s.TenNCC || s.ten || s.name || '',
      sdt: s.sdt || s.SDT || s.phone || s.soDienThoai || '' ,
      raw: s
    }));
  } catch (err) {
    console.error(err);
  }
};

const formatSupplierLabel = (s) => {
  const name = s?.tenNCC || s?.TenNCC || s?.ten || s?.name || '';
  const phone = s?.sdt || s?.SDT || s?.phone || s?.soDienThoai || '';
  return phone ? `${name} — ${phone}` : name;
};

const loadMedicines = async () => {
  try {
    const resp = await api.thuoc.getAll();
    // API may return { status, message, data: [...] } or array directly
    const raw = (resp && resp.data && resp.data.data) ? resp.data.data : (resp.data || []);
    medicines.value = (Array.isArray(raw) ? raw : []).map(m => ({
      maThuoc: m.maThuoc || m.MaThuoc || m.id || null,
      tenThuoc: m.tenThuoc || m.TenThuoc || m.ten || m.name || '',
      thanhPhan: m.thanhPhan || m.ThanhPhan || m.thanhPhanDescription || m.moTa || '',
      urlAnh: m.urlAnh || m.UrlAnh || m.image || '',
      soLuongCon: m.soLuongCon ?? m.soLuongTon ?? m.tonKho ?? m.ton ?? null,
      raw: m
    }));
    // initialize filtered list
    filteredMedicines.value = [...medicines.value];
  } catch (err) {
    console.error(err);
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

const addItem = () => {
  const newItem = { maCTPN: '', maThuoc: null, soLuong: 1, donGia: 0, donGiaBan: null, thanhTien: 0, hanSuDung: null, maLoaiDonViNhap: '', ghiChu: '' };
  // push then re-assign to ensure reactivity updates UI in all cases
  form.value.items.push(newItem);
  form.value.items = Array.isArray(form.value.items) ? [...form.value.items] : [newItem];
  // debug feedback in console
  console.log('addItem called, items count =', form.value.items.length);
};

const removeItem = (idx) => {
  form.value.items.splice(idx, 1);
};

const onMedicineChange = (row) => {
  if (!row.maThuoc) return;
  // find selected medicine in loaded list and populate some display fields
  const m = medicines.value.find(t => t.maThuoc === row.maThuoc);
  if (m) {
    // set remaining stock on row from medicine root if present
    row.soLuongCon = m.soLuongCon ?? row.soLuongCon ?? 0;
  }

  // load unit/pricing info for this medicine
  api.thuoc.getGiaThuocs(row.maThuoc).then((resp) => {
    // support both {status,message,data:[...]} and direct array
    const raw = (resp && resp.data && resp.data.data) ? resp.data.data : (resp.data || resp);
    const list = Array.isArray(raw) ? raw : [];
    // normalize entries
    row.giaThuocs = list.map(x => ({
      maGiaThuoc: x.maGiaThuoc || x.MaGiaThuoc || null,
      maLoaiDonVi: x.maLoaiDonVi || x.maLoaiDonVi || x.maLoaiDonVi || x.maLoaiDonVi || x.maLoaiDonVi || x.maLoaiDonVi || x.maLoaiDonVi || x.maLoaiDonVi || x.maLoaiDonVi || x.maLoaiDonVi || x.maLoaiDonVi || x.maLoaiDonVi || x.maLoaiDonVi || x.maLoaiDonVi || x.maLoaiDonVi || x.maLoaiDonVi || x.maLoaiDonVi || x.maLoaiDonVi || x.maLoaiDonVi || x.maLoaiDonVi || x.maLoaiDonVi || x.maLoaiDonVi || x.maLoaiDonVi || x.maLoaiDonVi || x.maLoaiDonVi || x.maLoaiDonVi || x.maLoaiDonVi || x.maLoaiDonVi || x.maLoaiDonVi || x.maLoaiDonVi || x.maLoaiDonVi || x.maLoaiDonVi || x.maLoaiDonVi || x.maLoaiDonVi,
      tenLoaiDonVi: x.tenLoaiDonVi || x.tenLoaiDonVi || x.tenLoaiDonVi || x.tenLoaiDonVi || x.tenLoaiDonVi || x.tenLoaiDonVi || x.tenLoaiDonVi || x.tenLoaiDonVi || x.tenLoaiDonVi || x.tenLoaiDonVi || x.tenLoaiDonVi || x.tenLoaiDonVi || x.tenLoaiDonVi || x.tenLoaiDonVi || x.tenLoaiDonVi || x.tenLoaiDonVi || x.tenLoaiDonVi || x.tenLoaiDonVi || x.tenLoaiDonVi || x.tenLoaiDonVi || x.tenLoaiDonVi || x.tenLoaiDonVi || x.tenLoaiDonVi || x.tenLoaiDonVi || x.tenLoaiDonVi || x.tenLoaiDonVi || x.tenLoaiDonVi || x.tenLoaiDonVi || x.tenLoaiDonVi || x.tenLoaiDonVi || x.tenLoaiDonVi || x.tenLoaiDonVi || x.tenLoaiDonVi || x.tenLoaiDonVi,
      soLuong: x.soLuong ?? x.SoLuong ?? null,
      donGia: x.donGia ?? x.DonGia ?? 0,
      trangThai: x.trangThai ?? x.TrangThai ?? true,
      soLuongCon: x.soLuongCon ?? x.SoLuongCon ?? 0,
      raw: x
    }));

    // pick default option: first active (trangThai true) or first available
    const first = row.giaThuocs.find(g => g.trangThai) || row.giaThuocs[0];
    if (first) {
      row.maLoaiDonViNhap = first.maLoaiDonVi;
      // Set display-only selling price (Giá bán) but do NOT overwrite user-editable `donGia`
      row.donGiaBan = first.donGia ?? row.donGiaBan ?? null;
      row.soLuongCon = first.soLuongCon ?? row.soLuongCon ?? 0;
    }
  }).catch((err) => {
    console.error('getGiaThuocs error', err);
  });
};

const onUnitChange = (row) => {
  if (!row || !row.maLoaiDonViNhap) return;
  const g = (row.giaThuocs || []).find(x => x.maLoaiDonVi === row.maLoaiDonViNhap);
  if (g) {
    // Put the unit's price into donGiaBan (display-only) and leave donGia for user input
    row.donGiaBan = g.donGia ?? row.donGiaBan ?? null;
    row.soLuongCon = g.soLuongCon ?? row.soLuongCon ?? 0;
  }
};

const filterMedicine = (query, option) => {
  // defensive: option can be undefined in some select internals
  if (!query) return true;
  if (!option) return false;
  try {
    const q = String(query || '').toLowerCase();
    const label = String(option.label ?? option.value ?? '').toLowerCase();
    // try to find the medicine object by matching the option value or label
    const med = medicines.value.find(t => {
      const v = String(t.maThuoc || t.MaThuoc || '');
      const name = String(t.tenThuoc || '');
      return (v && String(option.value) && v === String(option.value)) || (name && option.label && name === option.label);
    });

    if (med) {
      const nameMatch = (med.tenThuoc || '').toLowerCase().includes(q);
      const ingredMatch = (med.thanhPhan || '').toLowerCase().includes(q);
      const codeMatch = (med.maThuoc || '').toLowerCase().includes(q);
      return nameMatch || ingredMatch || codeMatch || label.includes(q);
    }

    return label.includes(q);
  } catch (err) {
    console.warn('filterMedicine error', err, option);
    return false;
  }
};

const truncate = (s, n = 80) => {
  if (!s) return '';
  return s.length > n ? s.slice(0, n - 1) + '…' : s;
};

const getMedicineNameById = (id) => {
  if (!id) return '';
  const m = medicines.value.find(x => x.maThuoc === id || x.MaThuoc === id);
  return m ? (m.tenThuoc || m.TenThuoc || '') : String(id);
};

const getMedicineMeta = (row) => {
  // Prefer displaying selected unit + remaining stock; fallback to ingredient summary
  try {
    if (row && row.giaThuocs && row.maLoaiDonViNhap) {
      const g = (row.giaThuocs || []).find(x => x.maLoaiDonVi === row.maLoaiDonViNhap || x.maGiaThuoc === row.maLoaiDonViNhap);
      if (g) {
        const unit = g.tenLoaiDonVi || g.tenLoai || '';
        const qty = g.soLuong ? `(${g.soLuong})` : '';
        const remain = (g.soLuongCon != null) ? `${g.soLuongCon}` : (row.soLuongCon != null ? String(row.soLuongCon) : '-');
        return `${unit} ${qty} — SL Còn ${remain}`.trim();
      }
    }
    // fallback: show truncated thành phần from medicines list
    const m = medicines.value.find(x => x.maThuoc === row.maThuoc || x.MaThuoc === row.maThuoc);
    if (m) return truncate(m.thanhPhan || m.ThanhPhan || '', 60);
    return '';
  } catch (err) {
    return '';
  }
};

const getRemaining = (row) => {
  if (row == null) return '-';
  if (row.soLuongCon != null && row.soLuongCon !== '') return row.soLuongCon;
  // try to find in loaded medicines
  const m = medicines.value.find(t => (t.maThuoc === row.maThuoc) || (t.MaThuoc === row.maThuoc));
  if (m) return m.soLuongCon ?? m.soLuongTon ?? m.soLuong ?? m.tonKho ?? m.ton ?? '-';
  return '-';
};

const loadTenNhanVien = async () => {
  const currentUser = authStore.currentUser;
  if (currentUser?.MaNV) {
    try {
      const resp = await api.nhanvien.getById(currentUser.MaNV);
      const nv = resp.data;
      tenNhanVien.value = nv?.hoTen || nv?.tenNV || nv?.TenNV || nv?.hoVaTen || currentUser.TenDangNhap || '';
    } catch (err) {
      console.error('Không lấy được thông tin nhân viên:', err);
      tenNhanVien.value = currentUser?.TenDangNhap || '';
    }
  }
};

const save = async () => {
  if (!form.value.maNCC) {
    ElMessage.error('Vui lòng chọn nhà cung cấp');
    return;
  }
  saving.value = true;
  const data = {
    maPN: form.value.maPN,
    ngayNhap: (form.value.ngayNhap ? new Date(form.value.ngayNhap).toISOString() : new Date().toISOString()),
    maNCC: form.value.maNCC,
    maNV: form.value.maNV,
    tongTien: form.value.tongTien,
    ghiChu: form.value.ghiChu,
    chiTietPhieuNhaps: form.value.items.map(item => ({
      maCTPN: item.maCTPN,
      maThuoc: item.maThuoc,
      soLuong: Number(item.soLuong) || 0,
      donGia: Number(item.donGia) || 0,
      thanhTien: Number(item.thanhTien) || 0,
      hanSuDung: item.hanSuDung ? new Date(item.hanSuDung).toISOString() : null,
      maLoaiDonViNhap: item.maLoaiDonViNhap,
      ghiChu: item.ghiChu
    }))
  };

  try {
    // If editing an existing phiếu (maPN present) call the update endpoint (PUT)
    if (form.value.maPN) {
      const resp = await api.phieunhap.updatePhieuNhap(form.value.maPN, data);
      const apiResp = (resp && resp.data && typeof resp.data === 'object') ? resp.data : resp;
      if (apiResp && apiResp.status === -1) {
        ElMessage.error(apiResp.message || 'Lỗi khi cập nhật phiếu nhập');
        return;
      }
      ElMessage.success('Cập nhật phiếu nhập thành công');
      // keep user on the page but lock the form for review
      savedMode.value = true;
    } else {
      const resp = await api.phieunhap.addPhieuNhap(data);
      const apiResp = (resp && resp.data && typeof resp.data === 'object') ? resp.data : resp;
      if (apiResp && apiResp.status === -1) {
        ElMessage.error(apiResp.message || 'Lỗi khi lưu phiếu nhập');
        return;
      }
      ElMessage.success('Thêm phiếu nhập thành công');
      // keep user on the page but lock the form for review
      savedMode.value = true;
    }
  } catch (err) {
    console.error(err);
    ElMessage.error('Không thể lưu phiếu nhập');
  } finally {
    saving.value = false;
  }
};

const printPhieu = () => {
  try {
    const p = form.value || {};

    // prepare rows with readable unit/name
    const rows = (p.items || []).map((it, idx) => {
      const name = getMedicineNameById(it.maThuoc) || it.maThuoc || '';
      // attempt to find unit name from item.giaThuocs if present
      const unitObj = (it.giaThuocs || []).find(g => g.maLoaiDonVi === it.maLoaiDonViNhap || g.maGiaThuoc === it.maLoaiDonViNhap);
      const unitName = unitObj ? (unitObj.tenLoaiDonVi || unitObj.tenLoai || unitObj.maLoaiDonVi) : (it.maLoaiDonViNhap || '');
      return {
        idx: idx + 1,
        maThuoc: it.maThuoc || '',
        name,
        unitName,
        donGia: Number(it.donGia) || 0,
        soLuong: Number(it.soLuong) || 0,
        thanhTien: Number(it.thanhTien) || 0
      };
    });

    const itemsHtml = rows.map(r => (`
      <tr>
        <td class="text-center">${r.idx}</td>
        <td class="text-center">${r.maThuoc}</td>
        <td>${r.name}</td>
        <td class="text-center">${r.unitName}</td>
        <td class="text-center">${r.soLuong}</td>
        <td class="text-right">${formatPrice(r.donGia)}</td>
        <td class="text-right">${formatPrice(r.thanhTien)}</td>
      </tr>
    `)).join('');

    const totalWords = numberToWords(Math.floor(p.tongTien || 0));
    const itemCount = rows.length;
    const totalQuantity = rows.reduce((s, r) => s + (Number(r.soLuong) || 0), 0);
    const printedBy = tenNhanVien.value || authStore.currentUser?.TenDangNhap || authStore.currentUser?.ten || authStore.currentUser?.HoTen || '';
    const printTime = new Date().toLocaleString('vi-VN');

    // resolve logo: prefer an on-page logo element, then project asset (Vite-resolved), then public fallback
    let logoPrimary = '';
    let logoFallback = '';
    try {
      // if the app's page has an img with id `app-logo`, use it (useful when header already loads logo)
      const el = document && document.getElementById && document.getElementById('app-logo');
      if (el && el.src) {
        logoPrimary = el.src;
      }
    } catch (e) {
      // ignore
    }
    try {
      // attempt to resolve the asset path at build time (Vite will rewrite this to a valid url)
      const resolved = new URL('../../assets/img/logo/favicon.png', import.meta.url).href;
      if (!logoPrimary) logoPrimary = resolved;
      logoFallback = new URL('../../assets/img/logo/logo.png', import.meta.url).href;
    } catch (e) {
      // leave empty; fallback to public path
      if (!logoPrimary) logoPrimary = '/assets/img/logo/favicon.png';
      if (!logoFallback) logoFallback = '/assets/img/logo/logo.png';
    }

    const html = `
      <!DOCTYPE html>
      <html lang="vi">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Phiếu Nhập - ${p.maPN || ''}</title>
        <style>
          body { font-family: 'Times New Roman', serif; margin: 0; padding: 20px; font-size: 14px; line-height: 1.4; }
          .container { max-width: 800px; margin: 0 auto; border: 2px solid #000; padding: 20px; }
          .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 20px; display:flex; gap:12px; align-items:center; justify-content:center; }
          .logo-small { width:90px; height:90px; object-fit:contain; margin-right:10px; }
          .company-name { font-size: 22px; font-weight: bold; text-transform: uppercase; margin: 0; }
          .company-info { font-size: 12px; margin: 4px 0; }
          .title { font-size: 20px; font-weight: bold; text-transform: uppercase; margin: 16px 0; text-align: center; }
          .info-section { display: flex; justify-content: space-between; margin-bottom: 16px; }
          .info-group { flex: 1; margin: 0 8px; }
          .info-label { font-weight: bold; display: inline-block; width: 120px; }
          table { width: 100%; border-collapse: collapse; margin: 12px 0; table-layout: fixed; }
          th, td { border: 1px solid #000; padding: 8px; text-align: left; vertical-align: top; font-size:13px; word-break: break-word; white-space: normal; overflow-wrap: anywhere; }
          th { background-color: #f0f0f0; font-weight: bold; text-align: center; }
          .text-center { text-align: center; }
          .text-right { text-align: right; }
          .total-section { margin: 12px 0; padding: 10px; border: 1px solid #000; background-color: #f9f9f9; }
          .total-label { font-weight: bold; font-size: 16px; }
          .total-amount { font-weight: bold; font-size: 18px; color: #d32f2f; }
          .total-words { font-weight: bold; font-size: 14px; color: #0f172a; }
          .signature-section { margin-top: 28px; display: flex; justify-content: space-between; }
          .signature-box { width: 30%; text-align: center; }
          .signature-line { border-top: 1px solid #000; margin-top: 40px; padding-top: 5px; }
          .print-info { margin-top: 12px; font-size: 12px; text-align: right; border-top: 1px dashed #000; padding-top: 10px; }
          @media print { body { margin: 0; } .container { border: none; } }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
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
              <div><span class="info-label">Mã phiếu:</span> ${p.maPN || ''}</div>
              <div><span class="info-label">Ngày nhập:</span> ${p.ngayNhap ? new Date(p.ngayNhap).toLocaleString('vi-VN') : ''}</div>
              <div><span class="info-label">Nhà cung cấp:</span> ${(nccList.value.find(x=> (x.maNCC||x.MaNCC)==p.maNCC)?.tenNCC||p.maNCC||'')}</div>
            </div>
            <div class="info-group">
              <div><span class="info-label">Nhân viên:</span> ${tenNhanVien.value || p.maNV || ''}</div>
              <div><span class="info-label">Số mặt hàng:</span> ${itemCount}</div>
              <div><span class="info-label">Tổng số lượng:</span> ${totalQuantity}</div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th style="width:5%">STT</th>
                <th style="width:12%">Mã thuốc</th>
                <th style="width:33%">Tên thuốc</th>
                <th style="width:10%">Đơn vị</th>
                <th style="width:8%">Số lượng</th>
                <th style="width:12%">Đơn giá</th>
                <th style="width:20%">Thành tiền</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <div class="total-section">
            <div class="text-right">
              <span class="total-label">Tổng cộng: </span>
              <span class="total-amount">${formatPrice(p.tongTien || 0)}</span>
            </div>
            <div class="text-right" style="margin-top:10px;">
              <span class="total-label">Bằng chữ: </span>
              <span class="total-words">${totalWords || 'Không'} đồng</span>
            </div>
            <div class="text-right" style="margin-top:10px;">
              <span class="total-label">Số lượng hàng: </span>
              <span class="total-words">${itemCount} mặt hàng</span>
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
            <div>Thời gian in: ${printTime}</div>
            <div>Nhân viên in: ${printedBy}</div>
          </div>
        </div>
      </body>
      </html>
    `;

    const w = window.open('', '_blank');
    w.document.write(html);
    w.document.close();
    w.focus();
    // slight delay to let images load in some browsers
    setTimeout(() => { try { w.print(); } catch (e) { console.error(e); } }, 400);
  } catch (err) {
    console.error('printPhieu error', err);
    ElMessage.error('Không thể in phiếu');
  }
};

onMounted(async () => {
  // load reference data first
  await Promise.all([loadSuppliers(), loadMedicines(), loadTenNhanVien()]);

  // if page loaded with maPN (edit mode) load details and prefill form
  const maPN = route.query.maPN;
  if (maPN) {
    try {
      const resp = await api.phieunhap.getChiTietByMaPN(maPN);
      const payload = resp && resp.data && resp.data.data ? resp.data.data : (resp.data || resp);
      // payload may contain phieuNhap and chiTiet arrays
      const rawPhieu = payload.phieuNhap || payload.PhieuNhap || payload.phieu || payload || null;
      const rawItems = payload.chiTiet || payload.ChiTiet || payload.chiTietPN || payload.items || [];

      if (rawPhieu) {
        form.value.maPN = rawPhieu.maPN || rawPhieu.MaPN || rawPhieu.maPhieu || form.value.maPN;
        form.value.ngayNhap = rawPhieu.ngayNhap || rawPhieu.NgayNhap || form.value.ngayNhap;
        form.value.maNCC = rawPhieu.maNCC || rawPhieu.MaNCC || rawPhieu.maNhaCungCap || form.value.maNCC;
        form.value.maNV = rawPhieu.maNV || rawPhieu.MaNV || form.value.maNV;
        form.value.tongTien = rawPhieu.tongTien || rawPhieu.TongTien || form.value.tongTien;
        form.value.ghiChu = rawPhieu.ghiChu || rawPhieu.GhiChu || rawPhieu.note || form.value.ghiChu;
      }

      // map items into expected shape
      const items = Array.isArray(rawItems) ? rawItems.map(it => ({
        maCTPN: it.maCTPN || it.MaCTPN || it.MACTPN || it.id || '',
        maThuoc: it.maThuoc || it.MaThuoc || it.MA_THUOC || null,
        soLuong: (it.soLuong !== undefined) ? it.soLuong : (it.SoLuong !== undefined ? it.SoLuong : 1),
        donGia: (it.donGia !== undefined) ? it.donGia : (it.DonGia !== undefined ? it.DonGia : 0),
        donGiaBan: (it.donGiaBan !== undefined) ? it.donGiaBan : (it.DonGiaBan !== undefined ? it.DonGiaBan : null),
        thanhTien: (it.thanhTien !== undefined) ? it.thanhTien : ((it.ThanhTien !== undefined) ? it.ThanhTien : ((it.soLuong || it.SoLuong) && (it.donGia || it.DonGia) ? (it.soLuong || it.SoLuong) * (it.donGia || it.DonGia) : 0)),
        hanSuDung: it.hanSuDung || it.HanSuDung || it.hanSuDungStr || null,
        maLoaiDonViNhap: it.maLoaiDonViNhap || it.MaLoaiDonVi || it.maLoaiDonVi || it.maDonVi || '',
        ghiChu: it.ghiChu || it.GhiChu || it.note || '',
        giaThuocs: []
      })) : [];

      form.value.items = items.length ? items : form.value.items;

      // For each item, load giaThuocs so unit dropdown and donGiaBan are available
      await Promise.all(form.value.items.map(async (row) => {
        if (!row.maThuoc) return;
        try {
          const r = await api.thuoc.getGiaThuocs(row.maThuoc);
          const rawList = (r && r.data && r.data.data) ? r.data.data : (r.data || r);
          const list = Array.isArray(rawList) ? rawList : [];
          row.giaThuocs = list.map(x => ({
            maGiaThuoc: x.maGiaThuoc || x.MaGiaThuoc || null,
            maLoaiDonVi: x.maLoaiDonVi || x.MaLoaiDonVi || x.maLoaiDonVi || '',
            tenLoaiDonVi: x.tenLoaiDonVi || x.TenLoaiDonVi || x.tenLoai || '',
            soLuong: x.soLuong ?? x.SoLuong ?? null,
            donGia: x.donGia ?? x.DonGia ?? 0,
            trangThai: x.trangThai ?? x.TrangThai ?? true,
            soLuongCon: x.soLuongCon ?? x.SoLuongCon ?? 0,
            raw: x
          }));
          // if incoming item had selected unit, ensure it is set and update donGiaBan
          if (row.maLoaiDonViNhap) {
            const sel = row.giaThuocs.find(g => g.maLoaiDonVi === row.maLoaiDonViNhap || g.maGiaThuoc === row.maLoaiDonViNhap);
            if (sel) {
              row.maLoaiDonViNhap = sel.maLoaiDonVi;
              row.donGiaBan = sel.donGia ?? row.donGiaBan ?? null;
              row.soLuongCon = sel.soLuongCon ?? row.soLuongCon ?? 0;
            }
          } else {
            // pick default if available
            const first = row.giaThuocs.find(g => g.trangThai) || row.giaThuocs[0];
            if (first) {
              row.maLoaiDonViNhap = first.maLoaiDonVi;
              row.donGiaBan = first.donGia ?? row.donGiaBan ?? null;
              row.soLuongCon = first.soLuongCon ?? row.soLuongCon ?? 0;
            }
          }
        } catch (err) {
          console.error('load giaThuocs for edit error', err);
        }
      }));

    } catch (err) {
      console.error('Không tải được chi tiết phiếu nhập:', err);
      ElMessage.error('Không tải được chi tiết phiếu nhập');
    }
  }
});
</script>

<style scoped>
.add-phieunhap-container {
  padding: 20px;
  background: #f5f7fa;
  min-height: 100vh;
}

.add-phieunhap-container {
  padding: 12px;
  background: #f5f7fa;
  min-height: 100vh;
}
.main-card {
  max-width: 1400px;
  margin: 0 auto;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 12px 12px 0 0;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.header-icon {
  font-size: 20px;
  color: #fff;
}

.header-left h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.header-desc {
  margin: 2px 0 0 0;
  font-size: 12px;
  opacity: 0.9;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.phieu-form {
  padding: 16px;
}
.items-header {
  display: flex;
  justify-content: flex-end;
}

.items-footer {
  display: flex;
  justify-content: flex-end;
  margin-top: 8px;
}

.remaining-text {
  display: block;
  text-align: center;
}

/* Make table inputs and pickers use full cell width and reduce padding to avoid horizontal scroll */
.items-section .el-table th,
.items-section .el-table td {
  padding: 6px 8px;
}
.items-section .el-input,
.items-section .el-input .el-input__inner,
.items-section .el-input-number,
.items-section .el-date-editor,
.items-section .el-select {
  width: 100% !important;
  box-sizing: border-box !important;
}

@media (max-width: 1200px) {
  .main-card {
    padding: 8px;
    max-width: 100%;
  }
  .phieu-form {
    padding: 8px;
  }
  .items-section .el-table th,
  .items-section .el-table td {
    padding: 6px 6px;
  }
}

/* Dropdown option formatting: show name (left column) + ingredient (right column, truncated) */
:deep(.medicine-option) {
  display: flex;
  flex-direction: row;
  gap: 12px;
  align-items: flex-start;
}
:deep(.medicine-option-name) {
  font-weight: 600;
  color: #111827;
  flex: 0 0 40%;
  max-width: 40%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
:deep(.medicine-option-ingredient) {
  font-size: 13px;
  color: #6b7280;
  flex: 1 1 auto;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Two-line item in table cell: top is control, bottom is small meta line */
.item-two-lines {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.item-two-lines .item-top-select {
  width: 100%;
}
.item-bottom-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.item-bottom-info .bottom-name {
  font-weight: 600;
  font-size: 13px;
  color: #111827;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.item-bottom-info .bottom-meta {
  font-size: 12px;
  color: #6b7280;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.bottom-controls {
  display: flex;
  gap: 12px;
  align-items: center;
  margin-top: 4px;
}
.bottom-controls .bottom-price {
  min-width: 120px;
  text-align: left;
}
.bottom-controls .small-control {
  width: 220px;
  box-sizing: border-box;
}
@media (max-width: 900px) {
  .bottom-controls {
    flex-direction: column;
    gap: 6px;
  }
  .bottom-controls .small-control {
    width: 100% !important;
  }
}
.expanded-row {
  display: flex;
  gap: 12px;
  padding: 6px 6px 0 6px;
}
.expanded-left {
  width: 420px;
}
.expanded-right {
  flex: 1 1 auto;
}
.note-control {
  width: 300px;
  box-sizing: border-box;
}
/* hide expand icon (we auto-expand rows) */
:deep(.el-table__expand-icon) {
  display: none !important;
}

.price-text {
  font-weight: 600;
  color: #1f2937;
}

.total-section {
  margin-top: 20px;
}

.total-row {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 16px;
  padding: 16px 0;
  font-size: 16px;
}

.total-label {
  font-weight: 600;
  color: #374151;
}

.total-amount {
  font-weight: 700;
  font-size: 18px;
  color: #dc2626;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 24px;
  border-top: 1px solid #e5e7eb;
}

/* Bold table headers and form labels for clarity */
:deep(.col-header) {
  font-weight: 700;
  color: #0f172a;
}

.phieu-form :deep(.el-form-item__label) {
  font-weight: 700;
  color: #111827;
}

@media (max-width: 900px) {
  .bottom-controls {
    flex-direction: column;
    gap: 6px;
  }
  .bottom-controls .small-control {
    width: 100% !important;
  }
  .expanded-left {
    width: 100% !important;
  }
  .note-control {
    width: 100% !important;
  }
  .expanded-row {
    flex-direction: column;
    gap: 6px;
  }
}
</style>
