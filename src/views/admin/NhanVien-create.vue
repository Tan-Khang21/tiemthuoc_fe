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
                    format="DD/MM/YYYY"
                    value-format="YYYY-MM-DD"
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

            <!-- Account Section Divider -->
            <div class="section-divider">
              <span>Thông Tin Tài Khoản</span>
            </div>

            <!-- Row 5: Tên đăng nhập -->
            <div class="form-row">
              <div class="form-col full">
                <el-form-item label="Tên Đăng Nhập" prop="tenDangNhap">
                  <el-autocomplete
                    v-model="createFormData.tenDangNhap"
                    :fetch-suggestions="querySearch"
                    placeholder="Nhập tên đăng nhập"
                    @select="handleSelect"
                  >
                    <template #prefix>
                      <i class="fas fa-user-circle"></i>
                    </template>
                  </el-autocomplete>
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

    <!-- Success Dialog with Account Info -->
    <el-dialog
      v-model="showSuccessDialog"
      title="Tạo Nhân Viên Thành Công"
      width="90%"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      align-center
    >
      <div v-if="successData" class="success-content">
        <div class="success-icon">
          <i class="fas fa-check-circle"></i>
        </div>
        <div class="success-message">Nhân viên đã được tạo thành công!</div>

        <!-- Account Info Box -->
        <div class="account-info-box">
          <div class="info-section">
            <div class="info-label">Mã Nhân Viên:</div>
            <div class="info-value account-code">
              {{ successData.maNV }}
              <el-button 
                type="primary" 
                text 
                size="small" 
                @click="copyToClipboard(successData.maNV)"
              >
                <i class="fas fa-copy"></i>
              </el-button>
            </div>
          </div>

          <div class="divider"></div>

          <div class="info-section">
            <div class="info-label">Tên Đăng Nhập:</div>
            <div class="info-value username-field">
              <el-input 
                v-model="successData.tenDangNhap" 
                readonly
                style="width: 100%"
              >
                <template #append>
                  <el-button 
                    @click="copyToClipboard(successData.tenDangNhap)"
                    icon="DocumentCopy"
                  />
                </template>
              </el-input>
            </div>
          </div>

          <div class="info-section">
            <div class="info-label">Mật Khẩu Mặc Định:</div>
            <div class="info-value">
              <div class="password-field">
                <span class="password-display">{{ passwordVisible ? '123456' : '••••••' }}</span>
                <div class="button-group">
                  <el-button 
                    type="primary" 
                    text 
                    size="small" 
                    @click="passwordVisible = !passwordVisible"
                  >
                    <i :class="passwordVisible ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                  </el-button>
                  <el-button 
                    type="primary" 
                    text 
                    size="small" 
                    @click="copyToClipboard('123456')"
                  >
                    <i class="fas fa-copy"></i>
                  </el-button>
                </div>
              </div>
            </div>
          </div>

          <div class="info-section">
            <div class="info-label">Chức Vụ:</div>
            <div class="info-value">
              <el-tag :type="successData.chucVu === 1 ? 'danger' : 'success'">
                {{ successData.chucVu === 1 ? 'Admin' : 'Nhân Viên' }}
              </el-tag>
            </div>
          </div>

          <div class="info-section">
            <div class="info-label">Họ Tên:</div>
            <div class="info-value">{{ successData.hoTen }}</div>
          </div>

          <div class="info-section">
            <div class="info-label">Ngày Sinh:</div>
            <div class="info-value">{{ successData.ngaySinh ? new Date(successData.ngaySinh).toLocaleDateString('vi-VN') : 'N/A' }}</div>
          </div>

          <div class="info-section">
            <div class="info-label">Giới Tính:</div>
            <div class="info-value">{{ successData.gioiTinh }}</div>
          </div>

          <div class="info-section">
            <div class="info-label">Số Điện Thoại:</div>
            <div class="info-value">{{ successData.dienThoai }}</div>
          </div>

          <div class="info-section">
            <div class="info-label">Địa Chỉ:</div>
            <div class="info-value">{{ successData.diaChi }}</div>
          </div>
        </div>

        <!-- Warning Box -->
        <div class="warning-box">
          <i class="fas fa-exclamation-triangle"></i>
          <span>
            <strong>Lưu ý:</strong> Nhân viên phải đổi mật khẩu khi đăng nhập lần đầu tiên!
          </span>
        </div>
      </div>

      <template #footer>
        <el-button @click="copyAllInfo">
          <i class="fas fa-copy"></i> Sao Chép Tất Cả
        </el-button>
        <el-button type="primary" @click="confirmSuccess">
          Hoàn Thành
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
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
  chucVu: 2,
  tenDangNhap: ''
});
const createFormRef = ref(null);
const isSubmitting = ref(false);
const existingUsernames = ref([]);

// Success Dialog State
const showSuccessDialog = ref(false);
const successData = ref(null);
const passwordVisible = ref(false);

const createRules = {
  hoTen: [
    { required: true, message: 'Vui lòng nhập họ tên', trigger: 'blur' },
    { min: 3, message: 'Họ tên phải có ít nhất 3 ký tự', trigger: 'blur' }
  ],
  ngaySinh: [
    { required: true, message: 'Vui lòng chọn ngày sinh', trigger: 'change' }
  ],
  gioiTinh: [
    { required: true, message: 'Vui lòng chọn giới tính', trigger: 'change' }
  ],
  dienThoai: [
    { required: true, message: 'Vui lòng nhập số điện thoại', trigger: 'blur' },
    { pattern: /^\d{10,11}$/, message: 'Số điện thoại phải là 10-11 chữ số', trigger: 'blur' }
  ],
  diaChi: [
    { required: true, message: 'Vui lòng nhập địa chỉ', trigger: 'blur' },
    { min: 5, message: 'Địa chỉ phải có ít nhất 5 ký tự', trigger: 'blur' }
  ],
  chucVu: [
    { required: true, message: 'Vui lòng chọn chức vụ', trigger: 'change' }
  ],
  tenDangNhap: [
    { required: true, message: 'Vui lòng nhập tên đăng nhập', trigger: 'blur' },
    { min: 3, message: 'Tên đăng nhập phải có ít nhất 3 ký tự', trigger: 'blur' },
    { max: 50, message: 'Tên đăng nhập không quá 50 ký tự', trigger: 'blur' }
  ]
};

// Methods
const goBack = () => {
  router.push('/admin/nhanvien');
};

// Load existing usernames on component mount
const loadExistingUsernames = async () => {
  try {
    const response = await axios.get(`${API_URL}/NhanVien/usernames`);
    if (Array.isArray(response.data)) {
      existingUsernames.value = response.data;
    }
  } catch (error) {
    console.error('Error loading usernames:', error);
  }
};

const createStaff = async () => {
  if (!createFormRef.value) return;
  await createFormRef.value.validate();

  isSubmitting.value = true;
  try {
    // Format date to DD/MM/YYYY or send as ISO string
    const ngaySinh = createFormData.value.ngaySinh 
      ? new Date(createFormData.value.ngaySinh).toISOString().split('T')[0]
      : null;

    const payload = {
      hoTen: createFormData.value.hoTen,
      ngaySinh: ngaySinh,
      gioiTinh: createFormData.value.gioiTinh,
      dienThoai: createFormData.value.dienThoai,
      diaChi: createFormData.value.diaChi,
      chucVu: createFormData.value.chucVu,
      tenDangNhap: createFormData.value.tenDangNhap
    };

    const response = await axios.post(
      `${API_URL}/NhanVien/create-with-account`,
      payload
    );

    if (response.data.success && response.data.data) {
      // Set success data and show dialog
      successData.value = response.data.data;
      passwordVisible.value = false;
      showSuccessDialog.value = true;
      
      ElMessage.success('Nhân viên đã được tạo thành công!');
    } else {
      ElMessage.error(response.data.message || 'Lỗi khi tạo nhân viên');
    }
  } catch (error) {
    const errorMessage = error.response?.data?.message || 
                        error.response?.data?.error || 
                        error.message ||
                        'Lỗi không xác định';
    ElMessage.error('Lỗi khi tạo nhân viên: ' + errorMessage);
    console.error('Error:', error.response?.data || error);
  } finally {
    isSubmitting.value = false;
  }
};

// Copy to clipboard function
const copyToClipboard = (text) => {
  navigator.clipboard.writeText(text).then(() => {
    ElMessage.success('Đã sao chép!');
  }).catch(() => {
    ElMessage.error('Không thể sao chép!');
  });
};

// Copy all info function
const copyAllInfo = () => {
  if (!successData.value) return;
  
  const ngaySinhFormatted = successData.value.ngaySinh 
    ? new Date(successData.value.ngaySinh).toLocaleDateString('vi-VN')
    : 'N/A';

  const allInfo = `Mã Nhân Viên: ${successData.value.maNV}
Tên Đăng Nhập: ${successData.value.tenDangNhap}
Mật Khẩu: 123456
Chức Vụ: ${successData.value.chucVu === 1 ? 'Admin' : 'Nhân Viên'}
Họ Tên: ${successData.value.hoTen}
Ngày Sinh: ${ngaySinhFormatted}
Giới Tính: ${successData.value.gioiTinh}
Số Điện Thoại: ${successData.value.dienThoai}
Địa Chỉ: ${successData.value.diaChi}`;

  navigator.clipboard.writeText(allInfo).then(() => {
    ElMessage.success('Đã sao chép toàn bộ thông tin!');
  }).catch(() => {
    ElMessage.error('Không thể sao chép!');
  });
};

// Confirm and redirect
const confirmSuccess = () => {
  showSuccessDialog.value = false;
  successData.value = null;
  passwordVisible.value = false;
  router.push('/admin/nhanvien');
};

// Load usernames when component mounts
onMounted(() => {
  loadExistingUsernames();
});

// Autocomplete search function
const querySearch = (queryString, cb) => {
  const results = queryString
    ? existingUsernames.value.filter(username =>
        username.toLowerCase().includes(queryString.toLowerCase())
      )
    : existingUsernames.value;
  
  cb(results.map(username => ({ value: username })));
};

// Handle select from autocomplete
const handleSelect = (item) => {
  createFormData.value.tenDangNhap = item.value;
  ElMessage.warning(`Tên đăng nhập "${item.value}" đã được sử dụng. Vui lòng nhập tên khác!`);
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

.section-divider {
  grid-column: 1 / -1;
  display: flex;
  align-items: center;
  margin: 30px 0 20px 0;
  gap: 12px;
  font-weight: 600;
  color: #17a2b8;
  font-size: 15px;
}

.section-divider::before {
  content: '';
  flex: 1;
  height: 1px;
  background: linear-gradient(to right, #dee2e6, transparent);
}

.section-divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: linear-gradient(to left, #dee2e6, transparent);
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

/* Success Dialog Styles */
.success-content {
  padding: 15px 0;
  max-height: none;
  overflow-y: visible;
}

.success-icon {
  text-align: center;
  margin-bottom: 16px;
}

.success-icon i {
  font-size: 48px;
  color: #28a745;
}

.success-message {
  text-align: center;
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin-bottom: 20px;
}

.account-info-box {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border: 2px solid #dee2e6;
  border-radius: 12px;
  padding: 16px;
  margin: 16px 0;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

.info-section {
  margin-bottom: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-label {
  font-weight: 600;
  color: #495057;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-value {
  font-size: 13px;
  color: #212529;
  padding: 6px 8px;
  background: white;
  border-radius: 4px;
  border: 1px solid #dee2e6;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 32px;
  gap: 6px;
}

.account-code {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.username-field {
  display: block;
}

.password-field {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 4px;
}

.button-group {
  display: flex;
  gap: 2px;
  align-items: center;
}

.password-display {
  font-family: 'Courier New', monospace;
  letter-spacing: 2px;
  font-weight: 600;
}

.divider {
  display: none;
}

.warning-box {
  background: linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%);
  border: 1px solid #ffc107;
  border-radius: 8px;
  padding: 8px 12px;
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-top: 12px;
  font-size: 11px;
  color: #856404;
  grid-column: 1 / -1;
}

.warning-box i {
  color: #ff9800;
  font-size: 12px;
  flex-shrink: 0;
  margin-top: 1px;
}

.warning-box strong {
  font-weight: 600;
}

:deep(.el-dialog__header) {
  background: linear-gradient(135deg, #17a2b8 0%, #20b2aa 100%);
  padding: 20px;
}

:deep(.el-dialog__title) {
  color: white;
  font-weight: 700;
  font-size: 16px;
}

:deep(.el-dialog__close) {
  color: white;
}

:deep(.el-dialog__footer) {
  text-align: right;
  padding: 12px 16px;
  border-top: 1px solid #eee;
}

/* Responsive Dialog */
@media (max-width: 1400px) {
  .account-info-box {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 1000px) {
  .account-info-box {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 600px) {
  :deep(.el-dialog) {
    width: 95% !important;
  }

  .account-info-box {
    grid-template-columns: 1fr;
  }

  .info-label {
    font-size: 10px;
  }

  .info-value {
    font-size: 12px;
    padding: 5px 6px;
  }

  .warning-box {
    font-size: 10px;
    padding: 6px 8px;
  }
}
</style>
