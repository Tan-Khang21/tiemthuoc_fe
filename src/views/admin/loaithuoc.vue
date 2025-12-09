<template>
  <div class="admin-page">
    <div class="page-header">
      <h2>Quản lý Loại Thuốc</h2>
      <p>Quản lý thông tin loại thuốc</p>
    </div>

    <div class="page-content">
      <el-card>
        <div style="display:flex; gap:12px; align-items:center; margin-bottom:12px;">
          <el-input v-model="search" placeholder="Tìm kiếm loại thuốc" clearable style="width:320px">
            <template #prefix>
              <i class="fas fa-search"></i>
            </template>
          </el-input>
          <el-select v-model="selectedGroup" clearable placeholder="Nhóm loại" style="width:220px">
            <el-option label="Tất cả" :value="''" />
            <el-option v-for="g in groups" :key="g.maNhomLoai" :label="g.tenNhomLoai" :value="g.maNhomLoai" />
          </el-select>
          <el-button type="primary" @click="openCreate">Thêm mới</el-button>
        </div>

        <el-table :data="pagedList" style="width:100%" v-loading="loading" element-loading-text="Đang tải...">
          <el-table-column prop="maLoaiThuoc" label="Mã" width="120" />
          <el-table-column prop="tenLoaiThuoc" label="Loại thuốc" />
          <el-table-column prop="tenNhomLoai" label="Nhóm" width="220" />
          <el-table-column prop="soLuongThuoc" label="Số lượng" width="100" align="center" />
          <el-table-column label="Thao tác" width="160" align="center">
            <template #default="{ row }">
              <el-tooltip content="Xem" placement="top">
                <el-button circle type="info" @click="viewDetail(row)">
                  <el-icon><View /></el-icon>
                </el-button>
              </el-tooltip>

              <el-tooltip content="Sửa" placement="top">
                <el-button circle type="primary" style="margin-left:8px" @click="openEdit(row)">
                  <el-icon><Edit /></el-icon>
                </el-button>
              </el-tooltip>
              <el-tooltip content="Xóa" placement="top">
                <el-button circle type="danger" style="margin-left:8px" @click="confirmDelete(row)">
                  <el-icon><Delete /></el-icon>
                </el-button>
              </el-tooltip>
            </template>
          </el-table-column>
        </el-table>

        <div v-if="!loading && !filteredList.length" style="margin-top:12px; color:#6c757d">Không có dữ liệu.</div>

        <div style="display:flex; justify-content:flex-end; margin-top:12px;">
          <el-pagination
            v-if="filteredList.length"
            :current-page="currentPage"
            :page-size="pageSize"
            :total="filteredList.length"
            layout="prev, pager, next"
            @current-change="handlePageChange"
          />
        </div>

        <!-- Detail dialog: Chi tiết Loại Thuốc with modern layout -->
        <el-dialog v-model="detailDialog" :title="`Chi tiết: ${detailData.loai?.tenLoaiThuoc || ''}`" width="90vw" :top="'6vh'" class="detail-dialog">
          <div v-loading="detailLoading" class="detail-content">
            <div class="detail-top-section" style="display:flex; gap:28px; align-items:flex-start">
              <!-- Left: Category Info Card -->
              <div class="detail-info-card" style="flex:0 0 300px">
                <el-card class="info-card-inner">
                  <div class="info-card-header">
                    <div class="category-name">{{ detailData.loai?.tenLoaiThuoc }}</div>
                    <div class="group-name">{{ detailData.tenNhomLoai }}</div>
                  </div>
                  <el-divider style="margin:12px 0"/>
                  <div class="info-stats">
                    <div class="stat-item">
                      <span class="stat-label">Số loại:</span>
                      <span class="stat-value">{{ (detailData.thuocs || []).length }}</span>
                    </div>
                    <div class="stat-item">
                      <span class="stat-label">Mã:</span>
                      <span class="stat-value">{{ detailData.loai?.maLoaiThuoc }}</span>
                    </div>
                  </div>
                </el-card>
              </div>

              <!-- Right: Drug List Grid -->
              <div class="detail-drugs-section" style="flex:1">
                <div class="drugs-header">
                  <h4 style="margin:0 0 12px 0; color:#1f2937; font-weight:600">Danh sách thuốc</h4>
                  <div class="drug-count-badge">{{ (detailData.thuocs || []).length }} thuốc</div>
                </div>

                <div v-if="(detailData.thuocs || []).length" class="drugs-list-container">
                  <div class="drugs-grid">
                    <div v-for="t in pagedDetailDrugs" :key="t.maThuoc" class="drug-card">
                      <div class="drug-card-inner">
                        <div class="drug-image-wrapper">
                          <img v-if="t.urlAnh" :src="getImageSrc(t.urlAnh)" :alt="t.tenThuoc" class="drug-image" />
                          <div v-else class="drug-image-placeholder">
                            <i class="fas fa-image"></i>
                          </div>
                        </div>
                        <div class="drug-info">
                          <div class="drug-name">{{ t.tenThuoc }}</div>
                          <div class="drug-code">{{ t.maThuoc }}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Pagination Controls -->
                  <div class="drugs-pagination">
                    <el-button 
                      :disabled="detailCurrentPage <= 1" 
                      @click="detailCurrentPage--"
                      type="primary"
                      plain
                      size="small"
                    >
                      <i class="fas fa-chevron-left"></i>
                      Trước
                    </el-button>
                    <span class="pagination-info">{{ detailCurrentPage }} / {{ detailTotalPages }}</span>
                    <el-button 
                      :disabled="detailCurrentPage >= detailTotalPages" 
                      @click="detailCurrentPage++"
                      type="primary"
                      plain
                      size="small"
                    >
                      Tiếp
                      <i class="fas fa-chevron-right"></i>
                    </el-button>
                  </div>
                </div>
                <div v-else class="empty-state">
                  <i class="fas fa-inbox"></i>
                  <p>Không có thuốc trong loại này</p>
                </div>
              </div>
            </div>
          </div>

          <template #footer>
            <div style="display:flex; justify-content:flex-end; gap:12px">
              <el-button @click="detailDialog = false">Đóng</el-button>
            </div>
          </template>
        </el-dialog>

        <el-dialog v-model="createDialog" title="Thêm / Sửa Loại Thuốc" width="520px" :close-on-click-modal="false">
          <el-form label-width="120px" style="padding-top:8px">
            <el-form-item label="Mã">
              <el-input v-model="newMa" disabled />
            </el-form-item>
            <el-form-item label="Tên loại">
              <el-input v-model="newTen" />
            </el-form-item>
            <el-form-item label="Nhóm loại">
              <el-select v-model="newGroup" placeholder="Chọn nhóm loại">
                <el-option v-for="g in groups" :key="g.maNhomLoai" :label="g.tenNhomLoai" :value="g.maNhomLoai" />
              </el-select>
            </el-form-item>
          </el-form>
          <template #footer>
            <div style="display:flex; justify-content:flex-end; gap:8px; margin-top:12px">
              <el-button @click="createDialog = false">Hủy</el-button>
              <el-button type="primary" :loading="createLoading" @click="saveItem">Lưu</el-button>
            </div>
          </template>
        </el-dialog>

      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import axios from '@/api/axios';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Edit, Delete, View } from '@element-plus/icons-vue';

const list = ref([]);
const groups = ref([]);
const selectedGroup = ref('');
const loading = ref(false);
const search = ref('');

// Pagination
const currentPage = ref(1);
const pageSize = ref(10);

const fetchList = async () => {
  loading.value = true;
  try {
    // Use the aggregated endpoint that provides top loại thuốc with group and counts
    const res = await axios.get('/Thuoc/TopLoaiThuoc');
    if (res && res.data && res.data.data) {
      list.value = res.data.data;
    } else if (res && res.data) {
      list.value = res.data;
    } else {
      list.value = [];
    }
  } catch (err) {
    console.error('Lỗi khi tải loại thuốc', err);
    ElMessage.error('Tải danh sách thất bại');
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchList();
  fetchGroups();
});

const fetchGroups = async () => {
  try {
    const res = await axios.get('/NhomLoai/WithLoai');
    if (res && res.data && res.data.data) {
      groups.value = res.data.data;
    } else if (res && res.data) {
      groups.value = res.data;
    } else {
      groups.value = [];
    }
  } catch (e) {
    console.error('Lỗi khi tải nhóm loại', e);
  }
};

const filteredList = computed(() => {
  let data = list.value;
  // filter by search
  if (search.value) {
    const q = search.value.toLowerCase();
    data = data.filter((r) => (r.tenLoaiThuoc || '').toLowerCase().includes(q) || (r.maLoaiThuoc || '').toLowerCase().includes(q));
  }
  // filter by selected group
  if (selectedGroup.value) {
    data = data.filter((r) => (r.maNhomLoai || r.maNhomLoai === 0) ? r.maNhomLoai === selectedGroup.value : r.maNhomLoai === selectedGroup.value);
  }
  return data;
});

watch(search, () => {
  currentPage.value = 1;
});

watch(filteredList, (newVal) => {
  const maxPage = Math.max(1, Math.ceil(newVal.length / pageSize.value));
  if (currentPage.value > maxPage) currentPage.value = maxPage;
});

watch(selectedGroup, () => {
  currentPage.value = 1;
});

const pagedList = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  return filteredList.value.slice(start, start + pageSize.value);
});

const handlePageChange = (page) => {
  currentPage.value = page;
};

// Dialog state
const createDialog = ref(false);
const isEditing = ref(false);
const newMa = ref('');
const newTen = ref('');
const newGroup = ref('');
const createLoading = ref(false);

// Detail dialog state
const detailDialog = ref(false);
const detailLoading = ref(false);
const detailData = ref({ loai: {}, tenNhomLoai: '', thuocs: [] });
const detailPageSize = ref(5); // Show 5 drugs per page
const detailCurrentPage = ref(1); // Current page for drug list

const imageUrl = (u) => {
  if (!u) return '';
  if (/^https?:\/\//i.test(u)) return u;
  try {
    const base = (axios.defaults && axios.defaults.baseURL) ? axios.defaults.baseURL.replace(/\/api\/?$/, '') : '';
    return base ? `${base}/${u}` : u;
  } catch (e) {
    return u;
  }
};

// Preload product images like `thuoc.vue` so thumbnails resolve correctly
const productImages = {};
try {
  const modules = import.meta.glob('../../assets/img/product/*', { eager: true, as: 'url' });
  for (const p in modules) {
    const parts = p.split('/');
    const name = parts[parts.length - 1];
    productImages[name] = modules[p];
  }
} catch (e) {
  // ignore if bundler doesn't support eager glob in this environment
}

const getImageSrc = (url) => {
  if (!url) return '';
  const str = String(url).trim();
  if (str.startsWith('http://') || str.startsWith('https://') || str.startsWith('/')) {
    return str;
  }
  const safe = str.replace(/\\/g, '/').split('/').pop();
  if (productImages[safe]) return productImages[safe];
  try {
    return new URL(encodeURI(`../assets/img/product/${safe}`), import.meta.url).href;
  } catch (e) {
    return `/assets/img/product/${encodeURIComponent(safe)}`;
  }
};

const viewDetail = async (row) => {
  if (!row || !row.maLoaiThuoc) return;
  detailLoading.value = true;
  detailCurrentPage.value = 1; // Reset to first page when opening dialog
  try {
    const res = await axios.get(`/LoaiThuoc/${encodeURIComponent(row.maLoaiThuoc)}/Details`);
    detailData.value = (res && res.data && res.data.data) ? res.data.data : { loai: {}, tenNhomLoai: '', thuocs: [] };
    detailDialog.value = true;
  } catch (e) {
    console.error('Lỗi tải chi tiết loại thuốc', e);
    ElMessage.error('Tải chi tiết thất bại');
  } finally {
    detailLoading.value = false;
  }
};

// Computed for paginated drug list
const pagedDetailDrugs = computed(() => {
  const drugs = detailData.value.thuocs || [];
  const start = (detailCurrentPage.value - 1) * detailPageSize.value;
  return drugs.slice(start, start + detailPageSize.value);
});

// Total pages for drug list
const detailTotalPages = computed(() => {
  const drugs = detailData.value.thuocs || [];
  return Math.max(1, Math.ceil(drugs.length / detailPageSize.value));
});

watch(detailDialog, (v) => {
  if (!v) {
    detailData.value = { loai: {}, tenNhomLoai: '', thuocs: [] };
    detailLoading.value = false;
    detailCurrentPage.value = 1; // Reset page when closing
  }
});

const generateMa = () => {
  try {
    if (!list.value || !list.value.length) return 'LT001';
    const nums = list.value
      .map((r) => (r.maLoaiThuoc || '').toString().toUpperCase())
      .map((s) => {
        const m = s.match(/LT0*(\d+)$/i);
        return m ? parseInt(m[1], 10) : NaN;
      })
      .filter((n) => !isNaN(n));
    const max = nums.length ? Math.max(...nums) : 0;
    const next = max + 1;
    return 'LT' + String(next).padStart(3, '0');
  } catch (e) {
    return 'LT001';
  }
};

const openCreate = () => {
  isEditing.value = false;
  newMa.value = generateMa();
  newTen.value = '';
  // default group to currently selected group in list (if any)
  newGroup.value = selectedGroup.value || '';
  createDialog.value = true;
};

const openEdit = (row) => {
  isEditing.value = true;
  newMa.value = row.maLoaiThuoc;
  newTen.value = row.tenLoaiThuoc;
  newGroup.value = row.maNhomLoai || '';
  createDialog.value = true;
};

const saveItem = async () => {
  if (!newMa.value || !newTen.value || !newGroup.value) {
    ElMessage.warning('Vui lòng nhập Mã và Tên');
    return;
  }
  createLoading.value = true;
  try {
    const payload = { maLoaiThuoc: newMa.value, tenLoaiThuoc: newTen.value, maNhomLoai: newGroup.value };
    if (isEditing.value) {
      const res = await axios.put(`/LoaiThuoc/${encodeURIComponent(newMa.value)}`, payload);
      if (res && res.data && res.data.status === -1) {
        ElMessage.warning('Loại thuốc đang được dùng');
      } else {
        ElMessage.success('Cập nhật thành công');
        createDialog.value = false;
        await fetchList();
      }
    } else {
      const res = await axios.post('/LoaiThuoc', payload);
      if (res && res.data && res.data.status === -1) {
        ElMessage.warning('Loại thuốc đang được dùng');
      } else {
        ElMessage.success('Thêm mới thành công');
        createDialog.value = false;
        await fetchList();
      }
    }
  } catch (e) {
    console.error('Lỗi lưu loại thuốc', e);
    ElMessage.error('Lưu thất bại');
  } finally {
    createLoading.value = false;
  }
};

const confirmDelete = (row) => {
  ElMessageBox.confirm(`Xóa loại thuốc \"${row.tenLoaiThuoc}\"?`, 'Xác nhận', {
    confirmButtonText: 'Xóa',
    cancelButtonText: 'Hủy',
    type: 'warning',
  })
    .then(async () => {
      try {
        const res = await axios.delete(`/LoaiThuoc/${encodeURIComponent(row.maLoaiThuoc)}`);
        if (res && res.data && res.data.status === -1) {
          ElMessage.warning('Loại thuốc đang được dùng');
        } else {
          ElMessage.success('Xóa thành công');
          await fetchList();
        }
      } catch (e) {
        console.error('Lỗi xóa loại thuốc', e);
        ElMessage.error('Xóa thất bại');
      }
    })
    .catch(() => {});
};

watch(createDialog, (val) => {
  if (!val) {
    newMa.value = '';
    newTen.value = '';
    isEditing.value = false;
    createLoading.value = false;
  }
});
</script>

<style scoped>
.admin-page {
  padding: 20px;
}

.page-header {
  margin-bottom: 20px;
}

.page-header h2 {
  color: #0d3d47;
  margin-bottom: 8px;
}

.page-header p {
  color: #6c757d;
  margin: 0;
}

.page-content {
  background: white;
  border-radius: 8px;
}

.product-thumb {
  width: 64px;
  height: 64px;
  object-fit: cover;
  border-radius: 6px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.08);
}

/* Detail Dialog Styling */
.detail-dialog :deep(.el-dialog) {
  max-width: 1200px !important;
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.15) !important;
}

.detail-dialog :deep(.el-dialog__header) {
  border-bottom: 1px solid #f0f0f0;
  padding: 16px 20px;
  background: linear-gradient(135deg, #f5f7fa 0%, #ffffff 100%);
}

.detail-dialog :deep(.el-dialog__title) {
  font-size: 18px;
  font-weight: 600;
  color: #0d3d47;
}

.detail-dialog :deep(.el-dialog__body) {
  padding: 24px;
  max-height: calc(80vh - 120px);
  overflow-y: auto;
}

.detail-content {
  font-size: 14px;
}

/* Info Card Styling */
.info-card-inner {
  background: linear-gradient(135deg, #f5f7fa 0%, #ffffff 100%);
  border: 1px solid #e8eaed;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}

.info-card-inner :deep(.el-card__body) {
  padding: 20px;
}

.info-card-header {
  margin-bottom: 12px;
}

.category-name {
  font-size: 18px;
  font-weight: 700;
  color: #0d3d47;
  margin-bottom: 6px;
}

.group-name {
  font-size: 13px;
  color: #6c757d;
  font-weight: 500;
}

.info-stats {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.stat-item:last-child {
  border-bottom: none;
}

.stat-label {
  color: #6c757d;
  font-weight: 500;
}

.stat-value {
  color: #0d3d47;
  font-weight: 600;
  font-size: 15px;
}

/* Drugs Section Styling */
.drugs-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.drug-count-badge {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  box-shadow: 0 2px 6px rgba(59, 130, 246, 0.2);
}

.drugs-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 16px;
  margin-bottom: 12px;
}

.drugs-list-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.drug-card {
  display: flex;
  flex-direction: column;
  height: 100%;
  cursor: pointer;
  border-radius: 10px;
  overflow: hidden;
}


.drug-card-inner {
  background: white;
  border: 1px solid #e8eaed;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  display: flex;
  flex-direction: column;
  height: 100%;
}

.drug-card:hover .drug-card-inner {
  box-shadow: 0 8px 24px rgba(0,0,0,0.12);
  border-color: #3b82f6;
}

.drug-image-wrapper {
  width: 100%;
  height: 140px;
  background: #f9fafb;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-bottom: 1px solid #e8eaed;
}

.drug-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}



.drug-image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f0f0f0 0%, #e5e5e5 100%);
  color: #bfbfbf;
  font-size: 32px;
}

.drug-info {
  padding: 12px 14px;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.drug-name {
  font-weight: 600;
  color: #1f2937;
  font-size: 13px;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin-bottom: 6px;
}

.drug-code {
  font-size: 11px;
  color: #6c757d;
  font-weight: 500;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 20px;
  text-align: center;
  color: #9ca3af;
}

.empty-state i {
  font-size: 48px;
  margin-bottom: 12px;
  opacity: 0.4;
}

.empty-state p {
  font-size: 14px;
  margin: 0;
  color: #6c757d;
}

/* Pagination Controls */
.drugs-pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
  padding: 16px 0;
  border-top: 1px solid #e8eaed;
  margin-top: 8px;
}

.pagination-info {
  font-size: 13px;
  font-weight: 500;
  color: #6c757d;
  min-width: 60px;
  text-align: center;
}

.drugs-pagination .el-button {
  height: 32px;
  font-size: 13px;
  font-weight: 500;
  border-radius: 6px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.drugs-pagination .el-button i {
  font-size: 12px;
}

.drugs-pagination .el-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
