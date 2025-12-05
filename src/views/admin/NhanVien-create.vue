<template>
  <div class="nhanvien-create-container">
    <!-- Create Section -->
    <div class="create-section">
      <div class="create-header">
        <div class="header-content">
          <h1 class="header-title">
            <i class="fas fa-user-plus"></i> Thêm Nhân Viên Mới
          </h1>
          <p class="header-subtitle">Vui lòng nhập đầy đủ thông tin nhân viên</p>
        </div>
        <el-button text @click="goBack" class="btn-back">
          <i class="fas fa-arrow-left"></i> Quay Lại
        </el-button>
      </div>

      <div class="create-content">
        <!-- Info Box -->
        <div class="info-box">
          <i class="fas fa-info-circle"></i>
          <span>Mật khẩu mặc định sẽ được tạo là <strong>123456</strong>. Nhân viên có thể thay đổi mật khẩu sau khi đăng nhập lần đầu.</span>
        </div>

        <el-card class="create-card">
          <el-form
            ref="createFormRef"
            :model="createFormData"
            :rules="createRules"
            label-width="120px"
            label-position="top"
            @submit.prevent
          >
            <!-- Row 1: Họ tên, Giới tính -->
            <div class="form-row">
              <div class="form-col">
                <el-form-item label="Họ Tên" prop="hoTen">
                  <el-input
                    v-model="createFormData.hoTen"
                    placeholder="Nhập họ và tên"
                  >
                    <template #prefix>
                      <i class="fas fa-user"></i>
                    </template>
                  </el-input>
                </el-form-item>
              </div>
              <div class="form-col">
                <el-form-item label="Giới Tính" prop="gioiTinh">
                  <el-select v-model="createFormData.gioiTinh" placeholder="Chọn giới tính">
                    <el-option label="Nam" value="Nam" />
                    <el-option label="Nữ" value="Nữ" />
                    <el-option label="Khác" value="Khác" />
                  </el-select>
                </el-form-item>
              </div>
            </div>

            <!-- Row 2: Ngày sinh, Chức vụ -->
            <div class="form-row">
              <div class="form-col">
                <el-form-item label="Ngày Sinh" prop="ngaySinh">
                  <el-date-picker
                    v-model="createFormData.ngaySinh"
                    type="date"
                    placeholder="Chọn ngày sinh"
                    style="width: 100%"
                  />
                </el-form-item>
              </div>
              <div class="form-col">
                <el-form-item label="Chức Vụ" prop="chucVu">
                  <el-select v-model="createFormData.chucVu" placeholder="Chọn chức vụ">
                    <el-option label="Admin" :value="1" />
                    <el-option label="Nhân Viên" :value="2" />
                  </el-select>
                </el-form-item>
              </div>
            </div>

            <!-- Row 3: Số điện thoại -->
            <div class="form-row">
              <div class="form-col full">
                <el-form-item label="Số Điện Thoại" prop="dienThoai">
                  <el-input
                    v-model="createFormData.dienThoai"
                    placeholder="Nhập số điện thoại"
                  >
                    <template #prefix>
                      <i class="fas fa-phone"></i>
                    </template>
                  </el-input>
                </el-form-item>
              </div>
            </div>

            <!-- Row 4: Địa chỉ -->
            <div class="form-row">
              <div class="form-col full">
                <el-form-item label="Địa Chỉ" prop="diaChi">
                  <el-input
                    v-model="createFormData.diaChi"
                    type="textarea"
                    placeholder="Nhập địa chỉ"
                    :rows="3"
                  />
                </el-form-item>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="form-actions">
              <el-button class="btn-cancel" @click="goBack">Hủy</el-button>
              <el-button type="primary" class="btn-submit" @click="createStaff" :loading="isSubmitting">
                <i class="fas fa-check"></i> Thêm Nhân Viên
              </el-button>
            </div>
          </el-form>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import axios from 'axios';

const API_URL = 'https://localhost:7283/api';
const router = useRouter();

// Data
const createFormData = ref({
  hoTen: '',
  ngaySinh: null,
  gioiTinh: 'Nam',
  dienThoai: '',
  diaChi: '',
  chucVu: 2
});
const createFormRef = ref(null);
const isSubmitting = ref(false);

const createRules = {
  hoTen: [
    { required: true, message: 'Vui lòng nhập họ tên', trigger: 'blur' }
  ],
  ngaySinh: [
    { required: true, message: 'Vui lòng chọn ngày sinh', trigger: 'change' }
  ],
  gioiTinh: [
    { required: true, message: 'Vui lòng chọn giới tính', trigger: 'change' }
  ],
  dienThoai: [
    { required: true, message: 'Vui lòng nhập số điện thoại', trigger: 'blur' }
  ],
  diaChi: [
    { required: true, message: 'Vui lòng nhập địa chỉ', trigger: 'blur' }
  ],
  chucVu: [
    { required: true, message: 'Vui lòng chọn chức vụ', trigger: 'change' }
  ]
};

// Methods
const goBack = () => {
  router.push('/admin/nhanvien');
};

const createStaff = async () => {
  if (!createFormRef.value) return;
  await createFormRef.value.validate();

  isSubmitting.value = true;
  try {
    await axios.post(`${API_URL}/NhanVien`, createFormData.value);
    ElMessage.success({
      title: 'Thành công!',
      message: 'Thêm nhân viên thành công! Tài khoản đã được tạo với mật khẩu mặc định: 123456',
      duration: 4000
    });
    router.push('/admin/nhanvien');
  } catch (error) {
    ElMessage.error('Lỗi khi thêm nhân viên: ' + (error.response?.data?.message || error.message));
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<style scoped>
/* Create Section */
.nhanvien-create-container {
  padding: 30px;
  background: linear-gradient(135deg, #f5f7fa 0%, #e8eef5 100%);
  min-height: 100vh;
}

.create-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.create-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  padding: 25px 30px;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.header-content {
  flex: 1;
}

.header-title {
  font-size: 28px;
  font-weight: 700;
  color: #0d3d47;
  margin: 0 0 8px 0;
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-title i {
  color: #17a2b8;
  font-size: 32px;
}

.header-subtitle {
  font-size: 14px;
  color: #909399;
  margin: 0;
}

.create-header .btn-back {
  color: #909399 !important;
  font-size: 16px;
  transition: all 0.3s ease;
}

.create-header .btn-back:hover {
  color: #17a2b8 !important;
}

.create-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
  justify-content: center;
}

.info-box {
  background: linear-gradient(135deg, #e8f4f8 0%, #f0fafc 100%);
  border: 1px solid #b3e5fc;
  border-radius: 8px;
  padding: 16px 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
  color: #0d5a6b;
}

.info-box i {
  font-size: 18px;
  color: #17a2b8;
  flex-shrink: 0;
}

.info-box strong {
  color: #e6424e;
  font-weight: 600;
}

.create-card {
  width: 100%;
  max-width: 900px;
  margin: 0 auto;
  box-shadow: 0 2px 16px rgba(0, 0, 0, 0.1);
  border: 1px solid #ebeef5;
}

.create-card :deep(.el-card__body) {
  padding: 40px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-bottom: 16px;
}

.form-col {
  flex: 1;
}

.form-col.full {
  grid-column: 1 / -1;
}

.create-card :deep(.el-form-item) {
  margin-bottom: 20px;
}

.create-card :deep(.el-form-item__label) {
  font-weight: 600;
  color: #303133;
  font-size: 14px;
  margin-bottom: 8px;
}

.create-card :deep(.el-input__wrapper) {
  background: #f5f7fa;
  border: 1px solid #dcdfe6;
  border-radius: 6px;
  transition: all 0.3s ease;
}

.create-card :deep(.el-input__wrapper:hover) {
  border-color: #17a2b8;
}

.create-card :deep(.el-input__wrapper.is-focus) {
  border-color: #17a2b8;
  box-shadow: 0 0 0 2px rgba(23, 162, 184, 0.1);
}

.create-card :deep(.el-input__prefix) {
  color: #17a2b8;
}

.create-card :deep(.el-select__wrapper) {
  border-radius: 6px;
  transition: all 0.3s ease;
}

.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 40px;
  padding-top: 24px;
  border-top: 1px solid #ebeef5;
}

.btn-cancel {
  min-width: 120px;
  height: 40px;
  border-radius: 6px;
  font-weight: 500;
  border: 1px solid #dcdfe6;
  color: #606266;
  background: #fff;
  transition: all 0.3s ease;
}

.btn-cancel:hover {
  color: #303133;
  border-color: #b4b4b6;
}

.btn-submit {
  min-width: 150px;
  height: 40px;
  border-radius: 6px;
  font-weight: 500;
  background: linear-gradient(135deg, #17a2b8 0%, #20b2aa 100%);
  border: none;
  transition: all 0.3s ease;
}

.btn-submit:hover {
  background: linear-gradient(135deg, #0d8fa0 0%, #1fa399 100%);
  box-shadow: 0 4px 12px rgba(23, 162, 184, 0.3);
}

/* Responsive */
@media (max-width: 768px) {
  .nhanvien-create-container {
    padding: 16px;
  }

  .create-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .header-title {
    font-size: 22px;
  }

  .create-card :deep(.el-card__body) {
    padding: 24px;
  }

  .form-row {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .form-actions {
    flex-direction: column;
    gap: 10px;
  }

  .btn-cancel,
  .btn-submit {
    width: 100%;
  }
}
</style>
