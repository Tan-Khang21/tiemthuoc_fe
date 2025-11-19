<template>
  <div class="admin-nhacungcap">
    <el-card class="admin-card">
      <!-- Header removed per request; add button into search area -->

      <!-- Filters: search + add button (button moved into search row, search width reduced) -->
      <el-row :gutter="12" style="margin-bottom: 24px; background: #f9fafb; padding: 12px; border-radius: 8px; align-items:center">
        <el-col :span="18">
          <div style="margin-bottom: 4px; font-size: 12px; color: #6b7280; font-weight: 500; text-transform: uppercase">Tìm kiếm</div>
          <el-input
            class="search-input"
            v-model="searchKeyword"
            placeholder="🔍 Nhập tên hoặc mã nhà cung cấp..."
            clearable
            size="medium"
            style="width:100%"
          />
        </el-col>
        <el-col :span="6" style="display:flex; justify-content:flex-end; align-items:center">
          <el-button type="primary" @click="addNewNCC" size="medium" style="height:40px; padding:0 14px; display:inline-flex; align-items:center;">
            <span style="margin-right:8px; font-size:16px">➕</span>
            <span>Thêm nhà cung cấp</span>
          </el-button>
        </el-col>
      </el-row>

      <!-- Table -->
      <div style="background: #fff; border-radius: 8px; overflow: hidden">
        <el-table :data="pagedNCCList" v-loading="loading" stripe style="border: 1px solid #e5e7eb">
          <el-table-column prop="maNCC" label="Mã NCC" width="120" />
          <el-table-column prop="tenNCC" label="Tên nhà cung cấp" min-width="200" />
          <el-table-column prop="diaChi" label="Địa chỉ" min-width="250" />
          <el-table-column prop="dienThoai" label="Điện thoại" width="150" />
          <el-table-column prop="email" label="Email" min-width="200" />
          <el-table-column label="Thao tác" width="140" fixed="right">
            <template #default="scope">
              <div class="action-buttons" style="display:flex; gap:8px; justify-content:center; align-items:center;">
                <el-tooltip content="Sửa" placement="top">
                  <el-button size="small" type="primary" circle @click="editNCC(scope.row)">
                    <i class="fas fa-pencil-alt"></i>
                  </el-button>
                </el-tooltip>
                <el-tooltip content="Xóa" placement="top">
                  <el-button size="small" type="danger" circle @click="deleteNCC(scope.row)">
                    <i class="fas fa-trash-alt"></i>
                  </el-button>
                </el-tooltip>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- Pagination -->
      <div style="margin-top: 20px; text-align: center">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50]"
          :total="filteredNCCList.length"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- Add/Edit Dialog -->
    <el-dialog
      v-model="showDialog"
      :title="editingNCC ? 'Chỉnh sửa nhà cung cấp' : 'Thêm nhà cung cấp mới'"
      width="600px"
      :top="'10vh'"
      :append-to-body="true"
    >
      <el-form :model="formData" :rules="rules" ref="formRef" label-width="120px">
        <el-form-item label="Mã NCC" prop="maNCC">
          <el-input v-model="formData.maNCC" disabled placeholder="Mã sẽ được tạo tự động" />
        </el-form-item>
        <el-form-item label="Tên NCC" prop="tenNCC">
          <el-input v-model="formData.tenNCC" placeholder="Nhập tên nhà cung cấp" />
        </el-form-item>
        <el-form-item label="Địa chỉ">
          <el-input v-model="formData.diaChi" type="textarea" :rows="3" placeholder="Nhập địa chỉ" />
        </el-form-item>
        <el-form-item label="Điện thoại">
          <el-input v-model="formData.dienThoai" placeholder="Nhập số điện thoại" />
        </el-form-item>
        <el-form-item label="Email">
          <el-input v-model="formData.email" type="email" placeholder="Nhập email" />
        </el-form-item>
      </el-form>

      <template #footer>
        <div style="display: flex; justify-content: flex-end; gap: 12px">
          <el-button @click="showDialog = false">Hủy</el-button>
          <el-button type="primary" @click="saveNCC" :loading="saving">Lưu</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import api from '@/api/nhacungcap';

// Reactive data
const nccList = ref([]);
const loading = ref(false);
const searchKeyword = ref('');
const currentPage = ref(1);
const pageSize = ref(10);
const showDialog = ref(false);
const editingNCC = ref(null);
const saving = ref(false);
const formData = ref({
  maNCC: '',
  tenNCC: '',
  diaChi: '',
  dienThoai: '',
  email: ''
});
const formRef = ref(null);

// Validation rules
const rules = {
  maNCC: [
    { required: true, message: 'Vui lòng nhập mã nhà cung cấp', trigger: 'blur' }
  ],
  tenNCC: [
    { required: true, message: 'Vui lòng nhập tên nhà cung cấp', trigger: 'blur' }
  ]
};

// Computed
const filteredNCCList = computed(() => {
  let list = nccList.value;
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase();
    list = list.filter(ncc =>
      ncc.maNCC.toLowerCase().includes(keyword) ||
      ncc.tenNCC.toLowerCase().includes(keyword) ||
      (ncc.diaChi && ncc.diaChi.toLowerCase().includes(keyword)) ||
      (ncc.dienThoai && ncc.dienThoai.includes(keyword)) ||
      (ncc.email && ncc.email.toLowerCase().includes(keyword))
    );
  }
  return list;
});

// Paged list (10 items per page by default via `pageSize`)
const pagedNCCList = computed(() => {
  const list = filteredNCCList.value || [];
  const start = (currentPage.value - 1) * pageSize.value;
  return list.slice(start, start + pageSize.value);
});

// Reset page to 1 when search changes
watch(searchKeyword, () => {
  currentPage.value = 1;
});

// Ensure currentPage is within bounds when filtered list or pageSize changes
watch([filteredNCCList, pageSize], ([list]) => {
  const total = (list || []).length;
  const maxPage = Math.max(1, Math.ceil(total / pageSize.value));
  if (currentPage.value > maxPage) currentPage.value = maxPage;
});

// Methods
const loadNCCList = async () => {
  loading.value = true;
  try {
    const response = await api.getAll();
    nccList.value = response.data?.data || response.data || [];
  } catch (error) {
    ElMessage.error('Lỗi khi tải danh sách nhà cung cấp');
    console.error(error);
  } finally {
    loading.value = false;
  }
};

const addNewNCC = () => {
  editingNCC.value = null;
  formData.value = {
    maNCC: '',
    tenNCC: '',
    diaChi: '',
    dienThoai: '',
    email: ''
  };
  // Generate a MaNCC automatically (format: NCC + 6 random digits)
  formData.value.maNCC = generateMaNCC();
  showDialog.value = true;
};

const editNCC = (ncc) => {
  editingNCC.value = ncc;
  formData.value = { ...ncc };
  showDialog.value = true;
};

const deleteNCC = async (ncc) => {
  ElMessageBox.confirm(
    `Bạn có chắc muốn xóa nhà cung cấp "${ncc.tenNCC}"?`,
    'Xác nhận',
    {
      confirmButtonText: 'Xóa',
      cancelButtonText: 'Hủy',
      type: 'warning',
    }
  ).then(async () => {
    try {
      await api.delete(ncc.maNCC);
      ElMessage.success('Xóa thành công');
      await loadNCCList();
    } catch (error) {
      ElMessage.error('Xóa thất bại');
    }
  });
};

const saveNCC = async () => {
  if (!formRef.value) return;
  await formRef.value.validate(async (valid) => {
    if (!valid) return;
    saving.value = true;
    try {
      if (editingNCC.value) {
        const resp = await api.update(formData.value.maNCC, formData.value);
        const body = resp?.data ?? resp;
        if (body && body.status === -1) {
          ElMessage.error(body.message || 'Cập nhật không thành công');
          return;
        }
        ElMessage.success('Cập nhật thành công');
      } else {
        const resp = await api.create(formData.value);
        const body = resp?.data ?? resp;
        if (body && body.status === -1) {
          ElMessage.error(body.message || 'Thêm không thành công');
          return;
        }
        ElMessage.success('Thêm thành công');
      }
      showDialog.value = false;
      await loadNCCList();
    } catch (error) {
      ElMessage.error(error.message || 'Lưu thất bại');
    } finally {
      saving.value = false;
    }
  });
};

const handleSizeChange = (size) => {
  pageSize.value = size;
  currentPage.value = 1;
};

const handleCurrentChange = (page) => {
  currentPage.value = page;
};

// Lifecycle
onMounted(() => {
  loadNCCList();
});

// Helper to generate MaNCC
const generateMaNCC = () => {
  const prefix = 'NCC';
  const rand = Math.floor(100000 + Math.random() * 900000); // 6 digits
  return `${prefix}${rand}`;
};
</script>

<style scoped>
.admin-nhacungcap {
  padding: 12px 0;
}

.action-buttons .el-button {
  min-width: 36px;
  padding: 6px 8px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.action-buttons .el-button i {
  font-size: 14px;
}

/* Make the search input inner element match button height */
.search-input ::v-deep .el-input__inner {
  height: 40px;
  line-height: 40px;
}

.search-input ::v-deep .el-input__inner::placeholder {
  line-height: 40px;
}
</style>
