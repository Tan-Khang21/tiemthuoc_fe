<template>
  <div class="admin-page">
    <div class="page-header">
      <h2>Quản lý Loại Đơn Vị</h2>
      <p>Quản lý thông tin loại đơn vị thuốc</p>
    </div>

    <div class="page-content">
      <el-card>
        <div style="display:flex; gap:12px; align-items:center; margin-bottom:12px;">
          <el-input v-model="search" placeholder="Tìm kiếm loại đơn vị" clearable style="width:320px">
            <template #prefix>
              <i class="fas fa-search"></i>
            </template>
          </el-input>
          <el-button type="primary" @click="openCreate">Thêm mới</el-button>
        </div>

        <el-table :data="pagedList" style="width:100%" v-loading="loading" element-loading-text="Đang tải...">
          <el-table-column prop="maLoaiDonVi" label="Mã" width="140" />
          <el-table-column prop="tenLoaiDonVi" label="Loại đơn vị" />
          <el-table-column label="Thao tác" width="120" align="center">
            <template #default="{ row }">
              <el-tooltip content="Sửa" placement="top">
                <el-button circle type="primary" @click="openEdit(row)">
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

        <!-- Create / Edit dialog -->
        <el-dialog v-model="createDialog" title="Thêm / Sửa Loại Đơn Vị" width="520px" :close-on-click-modal="false">
          <el-form label-width="120px" style="padding-top:8px">
            <el-form-item label="Mã">
              <el-input v-model="newMa" disabled />
            </el-form-item>
            <el-form-item label="Tên loại">
              <el-input v-model="newTen" />
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
import { Edit, Delete } from '@element-plus/icons-vue';

const list = ref([]);
const loading = ref(false);
const search = ref('');

// Pagination
const currentPage = ref(1);
const pageSize = ref(10);

const fetchList = async () => {
  loading.value = true;
  try {
    // Use the aggregated endpoint that returns unit types for Thuoc
    const res = await axios.get('/Thuoc/LoaiDonVi');
    if (res && res.data && res.data.data) {
      list.value = res.data.data;
    } else if (res && res.data) {
      list.value = res.data;
    } else {
      list.value = [];
    }
  } catch (err) {
    console.error('Lỗi khi tải loại đơn vị', err);
    ElMessage.error('Tải danh sách thất bại');
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchList();
});

const filteredList = computed(() => {
  if (!search.value) return list.value;
  const q = search.value.toLowerCase();
  return list.value.filter((r) => (r.tenLoaiDonVi || '').toLowerCase().includes(q) || (r.maLoaiDonVi || '').toLowerCase().includes(q));
});

watch(search, () => {
  currentPage.value = 1;
});

watch(filteredList, (newVal) => {
  const maxPage = Math.max(1, Math.ceil(newVal.length / pageSize.value));
  if (currentPage.value > maxPage) currentPage.value = maxPage;
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
const createLoading = ref(false);

const generateMa = () => {
  try {
    if (!list.value || !list.value.length) return 'LDV001';
    const nums = list.value
      .map((r) => (r.maLoaiDonVi || '').toString().toUpperCase())
      .map((s) => {
        const m = s.match(/LDV0*(\d+)$/i);
        return m ? parseInt(m[1], 10) : NaN;
      })
      .filter((n) => !isNaN(n));
    const max = nums.length ? Math.max(...nums) : 0;
    const next = max + 1;
    return 'LDV' + String(next).padStart(3, '0');
  } catch (e) {
    return 'LDV001';
  }
};

const openCreate = () => {
  isEditing.value = false;
  newMa.value = generateMa();
  newTen.value = '';
  createDialog.value = true;
};

const openEdit = (row) => {
  isEditing.value = true;
  newMa.value = row.maLoaiDonVi;
  newTen.value = row.tenLoaiDonVi;
  createDialog.value = true;
};

const saveItem = async () => {
  if (!newMa.value || !newTen.value) {
    ElMessage.warning('Vui lòng nhập Mã và Tên');
    return;
  }
  createLoading.value = true;
  try {
    const payload = { maLoaiDonVi: newMa.value, tenLoaiDonVi: newTen.value };
    if (isEditing.value) {
      const res = await axios.put(`/LoaiDonVi/${encodeURIComponent(newMa.value)}`, payload);
      if (res && res.data && res.data.status === -1) {
        ElMessage.warning('Loại đơn vị đang được dùng');
      } else {
        ElMessage.success('Cập nhật thành công');
        createDialog.value = false;
        await fetchList();
      }
    } else {
      const res = await axios.post('/LoaiDonVi', payload);
      if (res && res.data && res.data.status === -1) {
        ElMessage.warning('Loại đơn vị đang được dùng');
      } else {
        ElMessage.success('Thêm mới thành công');
        createDialog.value = false;
        await fetchList();
      }
    }
  } catch (e) {
    console.error('Lỗi lưu loại đơn vị', e);
    ElMessage.error('Lưu thất bại');
  } finally {
    createLoading.value = false;
  }
};

const confirmDelete = (row) => {
  ElMessageBox.confirm(`Xóa loại đơn vị "${row.tenLoaiDonVi}"?`, 'Xác nhận', {
    confirmButtonText: 'Xóa',
    cancelButtonText: 'Hủy',
    type: 'warning',
  })
    .then(async () => {
      try {
        const res = await axios.delete(`/LoaiDonVi/${encodeURIComponent(row.maLoaiDonVi)}`);
        if (res && res.data && res.data.status === -1) {
          ElMessage.warning('Loại đơn vị đang được dùng');
        } else {
          ElMessage.success('Xóa thành công');
          await fetchList();
        }
      } catch (e) {
        console.error('Lỗi xóa loại đơn vị', e);
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
</style>