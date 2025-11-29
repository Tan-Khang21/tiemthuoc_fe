<template>
  <div class="admin-page">
    <div class="page-header">
      <h2>Quản lý Nhóm Loại</h2>
      <p>Danh sách nhóm loại và các loại thuộc nhóm</p>
    </div>

    <div class="page-content">
      <el-card>
        <div style="display:flex; gap:12px; align-items:center; margin-bottom:12px;">
          <el-input v-model="search" placeholder="Tìm kiếm nhóm" clearable style="width:320px">
            <template #prefix>
              <i class="fas fa-search"></i>
            </template>
          </el-input>
          <el-button type="primary" @click="openCreate">Thêm mới</el-button>
        </div>

        <el-table :data="pagedList" style="width:100%" v-loading="loading" element-loading-text="Đang tải...">
          <el-table-column prop="maNhomLoai" label="Mã" width="140" />
          <el-table-column prop="tenNhomLoai" label="Tên nhóm" />
          <el-table-column label="Số loại" width="100" align="center">
            <template #default="{ row }">
              {{ (row.loai || []).length }}
            </template>
          </el-table-column>
          <el-table-column label="Thao tác" width="160" align="center">
            <template #default="{ row }">
              <el-tooltip content="Xem loại" placement="top">
                <el-button circle type="primary" size="mini" @click="viewTypes(row)">
                  <i class="fa fa-eye" aria-hidden="true"></i>
                </el-button>
              </el-tooltip>

              <el-tooltip content="Sửa" placement="top">
                <el-button circle type="warning" size="mini" @click="openEdit(row)" style="margin-left:8px">
                  <i class="fa fa-edit" aria-hidden="true"></i>
                </el-button>
              </el-tooltip>

              <el-tooltip content="Xóa" placement="top">
                <el-button circle type="danger" size="mini" @click="confirmDelete(row)" style="margin-left:8px">
                  <i class="fa fa-trash" aria-hidden="true"></i>
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

        <!-- Types detail dialog -->
        <el-dialog v-model="typesDialog" :title="`Chi tiết: ${currentGroup?.tenNhomLoai || ''}`" width="90vw" :top="'6vh'" class="types-detail-dialog">
          <div v-loading="typesLoading" class="types-content">
            <div class="types-top-section" style="display:flex; gap:28px; align-items:flex-start">
              <!-- Left: Group Info Card -->
              <div class="group-info-card" style="flex:0 0 300px">
                <el-card class="info-card-inner">
                  <div class="info-card-header">
                    <div class="group-name">{{ currentGroup?.tenNhomLoai }}</div>
                  </div>
                  <el-divider style="margin:12px 0"/>
                  <div class="info-stats">
                    <div class="stat-item">
                      <span class="stat-label">Số loại:</span>
                      <span class="stat-value">{{ currentTypes.length }}</span>
                    </div>
                    <div class="stat-item">
                      <span class="stat-label">Mã:</span>
                      <span class="stat-value">{{ currentGroup?.maNhomLoai }}</span>
                    </div>
                  </div>
                </el-card>
              </div>

              <!-- Right: Types Grid -->
              <div class="types-grid-section" style="flex:1">
                <div class="types-header">
                  <h4 style="margin:0 0 12px 0; color:#1f2937; font-weight:600">Danh sách loại thuốc</h4>
                  <div class="types-count-badge">{{ currentTypes.length }} loại</div>
                </div>

                <div v-if="currentTypes.length" class="types-list-container">
                  <div class="types-grid">
                    <div v-for="t in pagedTypes" :key="t.maLoaiThuoc" class="type-card">
                      <div class="type-card-inner no-icon">
                        <div class="type-info no-icon-info">
                          <div class="type-name">{{ t.tenLoaiThuoc }}</div>
                          <div class="type-code">{{ t.maLoaiThuoc }}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Pagination Controls -->
                  <div class="types-pagination">
                    <el-button 
                      :disabled="typesCurrentPage <= 1" 
                      @click="typesCurrentPage--"
                      type="primary"
                      plain
                      size="small"
                    >
                      <i class="fas fa-chevron-left"></i>
                      Trước
                    </el-button>
                    <span class="pagination-info">{{ typesCurrentPage }} / {{ typesTotalPages }}</span>
                    <el-button 
                      :disabled="typesCurrentPage >= typesTotalPages" 
                      @click="typesCurrentPage++"
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
                  <p>Không có loại thuốc trong nhóm này</p>
                </div>
              </div>
            </div>
          </div>

          <template #footer>
            <div style="display:flex; justify-content:flex-end; gap:12px">
              <el-button @click="typesDialog = false">Đóng</el-button>
            </div>
          </template>
        </el-dialog>

        <!-- Create / Edit Nhom Loai dialog -->
        <el-dialog v-model="createDialog" :title="isEditingGroup ? 'Sửa Nhóm Loại' : 'Thêm Nhóm Loại'" width="520px" :close-on-click-modal="false">
          <el-form label-width="120px" :model="editModel" style="padding-top:8px">
            <el-form-item label="Mã nhóm">
              <el-input v-model="editModel.maNhomLoai" :disabled="isEditingGroup" />
            </el-form-item>
            <el-form-item label="Tên nhóm">
              <el-input v-model="editModel.tenNhomLoai" />
            </el-form-item>
          </el-form>
          <template #footer>
            <div style="display:flex; justify-content:flex-end; gap:8px; margin-top:12px">
              <el-button @click="createDialog = false">Hủy</el-button>
              <el-button type="primary" :loading="createLoading" @click="saveGroup">Lưu</el-button>
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

const list = ref([]);
const loading = ref(false);
const search = ref('');

// Pagination
const currentPage = ref(1);
const pageSize = ref(10);

const fetchList = async () => {
  loading.value = true;
  try {
    const res = await axios.get('/NhomLoai/WithLoai');
    if (res && res.data && res.data.data) list.value = res.data.data;
    else if (res && res.data) list.value = res.data;
    else list.value = [];
  } catch (e) {
    console.error('Lỗi khi tải nhóm loại', e);
    ElMessage.error('Tải danh sách thất bại');
  } finally {
    loading.value = false;
  }
};

onMounted(() => fetchList());

const filteredList = computed(() => {
  if (!search.value) return list.value;
  const q = search.value.toLowerCase();
  return list.value.filter((r) => (r.tenNhomLoai || '').toLowerCase().includes(q) || (r.maNhomLoai || '').toLowerCase().includes(q));
});

watch(search, () => { currentPage.value = 1; });

watch(filteredList, (newVal) => {
  const maxPage = Math.max(1, Math.ceil(newVal.length / pageSize.value));
  if (currentPage.value > maxPage) currentPage.value = maxPage;
});

const pagedList = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  return filteredList.value.slice(start, start + pageSize.value);
});

const handlePageChange = (page) => { currentPage.value = page; };

// Types detail dialog
const typesDialog = ref(false);
const typesLoading = ref(false);
const currentGroup = ref(null);
const currentTypes = ref([]);
const typesPageSize = ref(5);
const typesCurrentPage = ref(1);

const pagedTypes = computed(() => {
  const start = (typesCurrentPage.value - 1) * typesPageSize.value;
  return currentTypes.value.slice(start, start + typesPageSize.value);
});

const typesTotalPages = computed(() => {
  return Math.max(1, Math.ceil(currentTypes.value.length / typesPageSize.value));
});

// Preload product images
const productImages = {};
try {
  const modules = import.meta.glob('../../assets/img/product/*', { eager: true, as: 'url' });
  for (const p in modules) {
    const parts = p.split('/');
    const name = parts[parts.length - 1];
    productImages[name] = modules[p];
  }
} catch (e) {
  // ignore
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

const viewTypes = async (row) => {
  if (!row || !row.maNhomLoai) return;
  typesLoading.value = true;
  typesCurrentPage.value = 1;
  currentGroup.value = row;
  try {
    const res = await axios.get(`/NhomLoai/Loai/${encodeURIComponent(row.maNhomLoai)}`);
    currentTypes.value = (res && res.data && res.data.data) ? res.data.data : [];
    typesDialog.value = true;
  } catch (e) {
    console.error('Lỗi tải loại thuốc', e);
    ElMessage.error('Tải danh sách thất bại');
  } finally {
    typesLoading.value = false;
  }
};

watch(typesDialog, (v) => {
  if (!v) {
    currentTypes.value = [];
    currentGroup.value = null;
    typesCurrentPage.value = 1;
    typesLoading.value = false;
  }
});
// Create / Edit Nhóm Loại state
const createDialog = ref(false);
const createLoading = ref(false);
const editModel = ref({ maNhomLoai: '', tenNhomLoai: '' });
const isEditingGroup = ref(false);

const generateMaNhom = () => {
  try {
    if (!list.value || !list.value.length) return 'NL001';
    const nums = list.value
      .map((r) => (r.maNhomLoai || '').toString().toUpperCase())
      .map((s) => {
        const m = s.match(/NL0*(\d+)$/i);
        return m ? parseInt(m[1], 10) : NaN;
      })
      .filter((n) => !isNaN(n));
    const max = nums.length ? Math.max(...nums) : 0;
    const next = max + 1;
    return 'NL' + String(next).padStart(3, '0');
  } catch (e) {
    return 'NL001';
  }
};

const openCreate = () => {
  isEditingGroup.value = false;
  editModel.value = { maNhomLoai: generateMaNhom(), tenNhomLoai: '' };
  createDialog.value = true;
};

const openEdit = (row) => {
  isEditingGroup.value = true;
  editModel.value = { maNhomLoai: row.maNhomLoai, tenNhomLoai: row.tenNhomLoai };
  createDialog.value = true;
};

const saveGroup = async () => {
  if (!editModel.value.maNhomLoai || !editModel.value.tenNhomLoai) {
    ElMessage.warning('Vui lòng điền đầy đủ Mã và Tên nhóm');
    return;
  }
  createLoading.value = true;
  try {
    const payload = { maNhomLoai: editModel.value.maNhomLoai, tenNhomLoai: editModel.value.tenNhomLoai };
    if (isEditingGroup.value) {
      const res = await axios.put(`/NhomLoai/${encodeURIComponent(editModel.value.maNhomLoai)}`, payload);
      if (res && res.data && res.data.status === -1) {
        ElMessage.warning(res.data.message || 'Không thể cập nhật');
      } else {
        ElMessage.success('Cập nhật thành công');
        createDialog.value = false;
        await fetchList();
      }
    } else {
      const res = await axios.post('/NhomLoai', payload);
      if (res && res.data && res.data.status === -1) {
        ElMessage.warning(res.data.message || 'Không thể thêm mới');
      } else {
        ElMessage.success('Thêm mới thành công');
        createDialog.value = false;
        await fetchList();
      }
    }
  } catch (e) {
    console.error('Lỗi lưu nhóm loại', e);
    ElMessage.error('Lưu thất bại');
  } finally {
    createLoading.value = false;
  }
};
const confirmDelete = (row) => { ElMessageBox.confirm(`Xóa nhóm loại "${row.tenNhomLoai}"?`, 'Xác nhận', { confirmButtonText: 'Xóa', cancelButtonText: 'Hủy', type: 'warning' }).then(async () => {
  try {
    await axios.delete(`/NhomLoai/${encodeURIComponent(row.maNhomLoai)}`);
    ElMessage.success('Xóa thành công');
    await fetchList();
  } catch (e) { console.error(e); ElMessage.error('Xóa thất bại'); }
}).catch(() => {});
};
</script>

<style scoped>
.admin-page { padding: 20px; }
.page-header { margin-bottom: 20px; }
.page-header h2 { color: #0d3d47; margin-bottom: 8px; }
.page-header p { color: #6c757d; margin: 0; }
.page-content { background: white; border-radius: 8px; }

/* Types Detail Dialog Styling */
.types-detail-dialog :deep(.el-dialog) {
  max-width: 1200px !important;
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.15) !important;
}

.types-detail-dialog :deep(.el-dialog__header) {
  border-bottom: 1px solid #f0f0f0;
  padding: 16px 20px;
  background: linear-gradient(135deg, #f5f7fa 0%, #ffffff 100%);
}

.types-detail-dialog :deep(.el-dialog__title) {
  font-size: 18px;
  font-weight: 600;
  color: #0d3d47;
}

.types-detail-dialog :deep(.el-dialog__body) {
  padding: 24px;
  max-height: calc(80vh - 120px);
  overflow-y: auto;
}

.types-content {
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

.group-name {
  font-size: 18px;
  font-weight: 700;
  color: #0d3d47;
  margin-bottom: 6px;
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

/* Types Grid Section */
.types-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.types-count-badge {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  box-shadow: 0 2px 6px rgba(59, 130, 246, 0.2);
}

.types-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 16px;
  margin-bottom: 12px;
}

.types-list-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.type-card {
  display: flex;
  flex-direction: column;
  height: 100%;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 10px;
  overflow: hidden;
}

.type-card:hover {
  transform: translateY(-6px);
}

.type-card-inner {
  background: white;
  border: 1px solid #e8eaed;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px;
  text-align: center;
  height: 100%;
}

.type-card:hover .type-card-inner {
  box-shadow: 0 8px 24px rgba(0,0,0,0.12);
  border-color: #3b82f6;
}

.type-icon-wrapper {
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
}

.type-icon {
  width: 100%;
  height: 100%;
  object-fit: contain;
  transition: transform 0.3s ease;
}

.type-card:hover .type-icon {
  transform: scale(1.1);
}

.type-icon-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f0f0f0 0%, #e5e5e5 100%);
  color: #bfbfbf;
  font-size: 40px;
  border-radius: 8px;
}

.type-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

/* Styles when no icon is shown */
.type-card-inner.no-icon { padding: 18px 14px; }
.type-info.no-icon-info { align-items: center; justify-content: center; }

.type-name { font-size: 15px; }

.type-name {
  font-weight: 600;
  color: #1f2937;
  font-size: 13px;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.type-code {
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
.types-pagination {
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

.types-pagination .el-button {
  height: 32px;
  font-size: 13px;
  font-weight: 500;
  border-radius: 6px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.types-pagination .el-button i {
  font-size: 12px;
}

.types-pagination .el-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
