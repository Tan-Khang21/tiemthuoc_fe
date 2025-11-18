<template>
  <div class="admin-thuoc">
    <el-card>
      <template #header>
        <div style="display: flex; justify-content: space-between; align-items: center">
          <h3 style="margin: 0">💊 Quản lý thuốc</h3>
          <el-button type="primary" @click="showAddDialog = true">
            ➕ Thêm thuốc mới
          </el-button>
        </div>
      </template>

      <!-- Filters -->
      <el-row :gutter="20" style="margin-bottom: 20px">
        <el-col :span="12">
          <el-input
            v-model="searchKeyword"
            placeholder="Tìm kiếm thuốc..."
            clearable
          >
            <template #prefix>🔍</template>
          </el-input>
        </el-col>
        <el-col :span="12">
          <el-select
            v-model="selectedCategory"
            placeholder="Chọn loại thuốc"
            clearable
            style="width: 100%"
          >
            <el-option
              v-for="cat in categories"
              :key="cat.maLoaiThuoc"
              :label="cat.tenLoaiThuoc"
              :value="cat.maLoaiThuoc"
            />
          </el-select>
        </el-col>
      </el-row>

      <!-- Table -->
      <el-table :data="filteredThuocList" v-loading="loading" stripe>
        <el-table-column prop="maThuoc" label="Mã thuốc" width="100" />
        <el-table-column prop="tenThuoc" label="Tên thuốc" min-width="200" />
        <el-table-column prop="tenLoaiThuoc" label="Loại" width="150" />
        <el-table-column prop="hoatChat" label="Hoạt chất" width="150" />
        <el-table-column label="Đơn giá" width="120">
          <template #default="{ row }">
            {{ formatPrice(row.donGiaSi) }}đ
          </template>
        </el-table-column>
        <el-table-column label="Thao tác" width="200" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="editThuoc(row)">
              Sửa
            </el-button>
            <el-button size="small" type="danger" @click="deleteThuoc(row)">
              Xóa
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- Add/Edit Dialog -->
    <el-dialog
      v-model="showAddDialog"
      :title="editingThuoc ? 'Chỉnh sửa thuốc' : 'Thêm thuốc mới'"
      width="600px"
    >
      <el-form :model="formData" label-width="120px">
        <el-form-item label="Mã thuốc">
          <el-input v-model="formData.maThuoc" :disabled="editingThuoc" />
        </el-form-item>
        <el-form-item label="Tên thuốc">
          <el-input v-model="formData.tenThuoc" />
        </el-form-item>
        <el-form-item label="Loại thuốc">
          <el-select v-model="formData.maLoaiThuoc" style="width: 100%">
            <el-option
              v-for="cat in categories"
              :key="cat.maLoaiThuoc"
              :label="cat.tenLoaiThuoc"
              :value="cat.maLoaiThuoc"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="Hoạt chất">
          <el-input v-model="formData.hoatChat" />
        </el-form-item>
        <el-form-item label="Nước SX">
          <el-input v-model="formData.nuocSanXuat" />
        </el-form-item>
        <el-form-item label="Đơn giá">
          <el-input-number v-model="formData.donGiaSi" :min="0" />
        </el-form-item>
        <el-form-item label="URL ảnh">
          <el-input v-model="formData.urlAnh" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAddDialog = false">Hủy</el-button>
        <el-button type="primary" @click="saveThuoc" :loading="saving">
          Lưu
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import api from '@/api';
import { ElMessage, ElMessageBox } from 'element-plus';

const loading = ref(false);
const saving = ref(false);
const showAddDialog = ref(false);
const editingThuoc = ref(null);
const thuocList = ref([]);
const categories = ref([]);
const searchKeyword = ref('');
const selectedCategory = ref('');

const formData = ref({
  maThuoc: '',
  tenThuoc: '',
  maLoaiThuoc: '',
  hoatChat: '',
  nuocSanXuat: '',
  donGiaSi: 0,
  urlAnh: '',
});

const filteredThuocList = computed(() => {
  let list = thuocList.value;
  
  if (searchKeyword.value) {
    list = list.filter(t =>
      t.tenThuoc.toLowerCase().includes(searchKeyword.value.toLowerCase()) ||
      t.maThuoc.toLowerCase().includes(searchKeyword.value.toLowerCase())
    );
  }
  
  if (selectedCategory.value) {
    list = list.filter(t => t.maLoaiThuoc === selectedCategory.value);
  }
  
  return list;
});

onMounted(async () => {
  await loadCategories();
  await loadThuocList();
});

const loadCategories = async () => {
  try {
    const response = await api.thuoc.getTopLoaiThuoc();
    categories.value = response.data || [];
  } catch (error) {
    console.error('Load categories error:', error);
  }
};

const loadThuocList = async () => {
  loading.value = true;
  try {
    const response = await api.thuoc.getAll();
    thuocList.value = response.data || [];
  } catch (error) {
    ElMessage.error('Lỗi khi tải danh sách thuốc');
  } finally {
    loading.value = false;
  }
};

const editThuoc = (thuoc) => {
  editingThuoc.value = thuoc;
  formData.value = { ...thuoc };
  showAddDialog.value = true;
};

const deleteThuoc = async (thuoc) => {
  ElMessageBox.confirm(
    `Bạn có chắc muốn xóa thuốc "${thuoc.tenThuoc}"?`,
    'Xác nhận',
    {
      confirmButtonText: 'Xóa',
      cancelButtonText: 'Hủy',
      type: 'warning',
    }
  ).then(async () => {
    try {
      await api.thuoc.delete(thuoc.maThuoc);
      ElMessage.success('Xóa thành công');
      await loadThuocList();
    } catch (error) {
      ElMessage.error('Xóa thất bại');
    }
  });
};

const saveThuoc = async () => {
  saving.value = true;
  try {
    const formDataObj = new FormData();
    Object.keys(formData.value).forEach(key => {
      if (formData.value[key]) {
        formDataObj.append(key, formData.value[key]);
      }
    });

    if (editingThuoc.value) {
      await api.thuoc.update(formData.value.maThuoc, formDataObj);
      ElMessage.success('Cập nhật thành công');
    } else {
      await api.thuoc.create(formDataObj);
      ElMessage.success('Thêm thành công');
    }

    showAddDialog.value = false;
    editingThuoc.value = null;
    await loadThuocList();
  } catch (error) {
    ElMessage.error(error.message || 'Lưu thất bại');
  } finally {
    saving.value = false;
  }
};

const formatPrice = (price) => {
  return new Intl.NumberFormat('vi-VN').format(price);
};
</script>

<style scoped>
.admin-thuoc {
  /* Add custom styles */
}
</style>
