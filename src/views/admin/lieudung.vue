<template>
  <div class="admin-page">
    <div class="page-header">
      <h2>Quản lý Liều Dùng</h2>
      <p>Quản lý thông tin liều dùng thuốc</p>
    </div>

    <div class="page-content">
      <el-card>
        <div style="display:flex; gap:12px; align-items:center; margin-bottom:12px;">
          <el-input v-model="search" placeholder="Tìm kiếm liều dùng" clearable style="width:320px">
            <template #prefix>
              <i class="fas fa-search"></i>
            </template>
          </el-input>
          <el-button type="primary" @click="openCreate">Thêm mới</el-button>
        </div>

        <el-table :data="pagedList" style="width:100%" v-loading="loading" element-loading-text="Đang tải...">
          <el-table-column prop="maLD" label="Mã" width="120" />
          <el-table-column prop="tenLieuDung" label="Liều dùng" />
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

        <!-- Create / Edit dialog (centered) -->
        <el-dialog v-model="createDrawer" title="Thêm / Sửa Liều Dùng" width="520px" :close-on-click-modal="false">
          <el-form label-width="90px" style="padding-top:8px">
            <el-form-item label="Mã">
              <el-input v-model="newMaLD" disabled />
            </el-form-item>
            <el-form-item label="Liều dùng">
              <el-input v-model="newTen" />
            </el-form-item>
          </el-form>
          <template #footer>
            <div style="display:flex; justify-content:flex-end; gap:8px; margin-top:12px">
              <el-button @click="createDrawer = false">Hủy</el-button>
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
    const res = await axios.get('/LieuDung');
    if (res && res.data && res.data.data) {
      list.value = res.data.data;
    } else if (res && res.data) {
      list.value = res.data;
    } else {
      list.value = [];
    }
  } catch (err) {
    console.error('Loi khi tai danh sach lieudung', err);
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
  return list.value.filter((r) => (r.tenLieuDung || '').toLowerCase().includes(q) || (r.maLD || '').toLowerCase().includes(q));
});

// Reset page when search changes
watch(search, () => {
  currentPage.value = 1;
});

// Ensure currentPage is valid if filteredList shrinks
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

// Create / Edit drawer state
const createDrawer = ref(false);
const isEditing = ref(false);
const newMaLD = ref('');
const newTen = ref('');
const createLoading = ref(false);

const generateMaLD = () => {
  try {
    if (!list.value || !list.value.length) return 'LD001';
    const nums = list.value
      .map((r) => (r.maLD || '').toString().toUpperCase())
      .map((s) => {
        const m = s.match(/LD0*(\d+)$/i);
        return m ? parseInt(m[1], 10) : NaN;
      })
      .filter((n) => !isNaN(n));
    const max = nums.length ? Math.max(...nums) : 0;
    const next = max + 1;
    return 'LD' + String(next).padStart(3, '0');
  } catch (e) {
    return 'LD001';
  }
};

const openCreate = () => {
  isEditing.value = false;
  newMaLD.value = generateMaLD();
  newTen.value = '';
  createDrawer.value = true;
};

const openEdit = (row) => {
  isEditing.value = true;
  newMaLD.value = row.maLD;
  newTen.value = row.tenLieuDung;
  createDrawer.value = true;
};

const saveItem = async () => {
  if (!newMaLD.value || !newTen.value) {
    ElMessage.warning('Vui lòng nhập Mã và Tên liều dùng');
    return;
  }
  createLoading.value = true;
  try {
    const payload = { maLD: newMaLD.value, tenLieuDung: newTen.value };
    if (isEditing.value) {
      const res = await axios.put(`/LieuDung/${encodeURIComponent(newMaLD.value)}`, payload);
      if (res && res.data && res.data.status === -1) {
        ElMessage.warning('Liều dùng đang được dùng');
      } else {
        ElMessage.success('Cập nhật thành công');
        createDrawer.value = false;
        await fetchList();
      }
    } else {
      const res = await axios.post('/LieuDung', payload);
      if (res && res.data && res.data.status === -1) {
        ElMessage.warning('Liều dùng đang được dùng');
      } else {
        ElMessage.success('Thêm mới thành công');
        createDrawer.value = false;
        await fetchList();
      }
    }
  } catch (err) {
    console.error('Lỗi lưu', err);
    ElMessage.error('Lưu thất bại');
  } finally {
    createLoading.value = false;
  }
};

const confirmDelete = (row) => {
  ElMessageBox.confirm(`Xóa liều dùng "${row.tenLieuDung}"?`, 'Xác nhận', {
    confirmButtonText: 'Xóa',
    cancelButtonText: 'Hủy',
    type: 'warning',
  })
    .then(async () => {
      try {
        const res = await axios.delete(`/LieuDung/${encodeURIComponent(row.maLD)}`);
        if (res && res.data && res.data.status === -1) {
          ElMessage.warning('Liều dùng đang được dùng');
        } else {
          ElMessage.success('Xóa thành công');
          await fetchList();
        }
      } catch (e) {
        console.error('Lỗi xóa', e);
        ElMessage.error('Xóa thất bại');
      }
    })
    .catch(() => {});
};

// Reset form when drawer closed
watch(createDrawer, (val) => {
  if (!val) {
    newMaLD.value = '';
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
