<template>
  <div class="admin-thuoc">
    <el-card class="admin-card">
      <!-- Header removed per request; add button moved into search area -->

      <!-- Filters: search + type + add button (button moved into search area) -->
      <el-row :gutter="12" style="margin-bottom: 24px; background: #f9fafb; padding: 12px; border-radius: 8px; align-items:center">
        <el-col :span="14">
          <div style="margin-bottom: 4px; font-size: 12px; color: #6b7280; font-weight: 500; text-transform: uppercase">Tìm kiếm</div>
          <el-input
            class="search-input"
            v-model="searchKeyword"
            placeholder=" Nhập tên hoặc mã thuốc..."
            clearable
            size="medium"
            style="width:100%"
          />
        </el-col>
        <el-col :span="6">
          <div style="margin-bottom: 4px; font-size: 12px; color: #6b7280; font-weight: 500; text-transform: uppercase">Loại thuốc</div>
          <el-select
            v-model="selectedCategory"
            placeholder="Chọn loại thuốc..."
            clearable
            size="medium"
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
        <el-col :span="4" style="display:flex; justify-content:flex-end; align-items:center">
          <el-button v-if="isAdmin" type="primary" @click="addNewThuoc" size="medium" style="height:40px; padding:0 14px; display:inline-flex; align-items:center;">
            <span style="margin-right:8px; font-size:16px">➕</span>
            <span>Thêm thuốc mới</span>
          </el-button>
        </el-col>
      </el-row>

      <!-- Table -->
      <div style="background: #fff; border-radius: 8px; overflow: hidden">
      <el-table :data="pagedThuocList" v-loading="loading" stripe style="border: 1px solid #e5e7eb">
        <el-table-column prop="maThuoc" label="Mã thuốc" width="100" />
        <el-table-column prop="tenThuoc" label="Tên thuốc" min-width="200" />
        <el-table-column label="Ảnh" width="80">
          <template #default="{ row }">
            <img v-if="row.urlAnh" :src="getImageSrc(row.urlAnh)" alt="Ảnh thuốc" class="product-thumb" />
          </template>
        </el-table-column>
        <el-table-column label="Loại" width="150">
          <template #default="{ row }">
            {{ getCategoryName(row.maLoaiThuoc) }}
          </template>
        </el-table-column>
        <el-table-column label="Mô tả" min-width="200">
          <template #default="{ row }">
            {{ truncateText(row.moTa, 20) }}
          </template>
        </el-table-column>
        <el-table-column label="Thao tác" width="140" fixed="right">
          <template #default="{ row }">
            <div class="action-buttons-row">
              <el-tooltip content="Xem chi tiết" placement="top">
                <button class="btn-action btn-view" @click="viewDetails(row)">
                  <el-icon><View /></el-icon>
                </button>
              </el-tooltip>
              <el-tooltip v-if="isAdmin" content="Sửa" placement="top">
                <button class="btn-action btn-edit" @click="editThuoc(row)">
                  <el-icon><Edit /></el-icon>
                </button>
              </el-tooltip>
              <el-tooltip v-if="isAdmin" content="Xóa" placement="top">
                <button class="btn-action btn-delete" @click="deleteThuoc(row)">
                  <el-icon><Delete /></el-icon>
                </button>
              </el-tooltip>
            </div>
          </template>
        </el-table-column>
      </el-table>
      </div>

      <!-- Pagination -->
      <div style="margin-top: 16px; display: flex; justify-content: flex-end; align-items: center">
        <span style="font-size: 12px; color: #6b7280; margin-right: 16px">Tổng: {{ filteredThuocList.length }} thuốc</span>
        <el-pagination
          background
          :current-page="currentPage"
          :page-size="pageSize"
          :total="filteredThuocList.length"
          layout="prev, pager, next"
          @current-change="handlePageChange"
        />
      </div>

    </el-card>

    <!-- Add/Edit Dialog -->
    <el-dialog
      v-model="showAddDialog"
      :title="editingThuoc ? 'Chỉnh sửa thuốc' : 'Thêm thuốc mới'"
      width="90vw"
      :top="'6vh'"
      :append-to-body="true"
    >
      <el-form :model="formData" class="edit-form-container">
        <!-- Top section: image left, form fields right -->
        <div class="top-section" style="display:flex; gap:20px; align-items:flex-start">
          <div style="flex:0 0 320px; text-align:center; background:#f9fafb; border-radius:8px; padding:16px">
            <img v-if="formData.urlAnh" :src="getImageSrc(formData.urlAnh)" alt="Ảnh thuốc" style="max-width:100%; max-height:200px; border-radius:4px" />
            <div v-else style="width:100%; height:200px; background:#e5e7eb; border-radius:4px; display:flex; align-items:center; justify-content:center; color:#6b7280">
              <i class="el-icon-picture-outline" style="font-size:48px"></i>
            </div>
          </div>

          <div style="flex:1">
            <!-- Basic info fields - render differently for Add vs Edit -->
            <template v-if="!editingThuoc">
              <!-- Add mode: two columns, labels on top so inputs can use full width -->
              <div style="display:grid; grid-template-columns: 3fr 1fr; gap:16px; margin-bottom:16px">
                <el-form-item label="Tên thuốc" label-width="0" label-position="top">
                  <el-input v-model="formData.tenThuoc" size="small" style="width:100%" />
                </el-form-item>
                <el-form-item label="Loại thuốc" label-width="0" label-position="top">
                  <el-select v-model="formData.maLoaiThuoc" placeholder="Chọn loại thuốc" size="small" style="width:100%">
                    <el-option
                      v-for="cat in categories"
                      :key="cat.maLoaiThuoc"
                      :label="cat.tenLoaiThuoc"
                      :value="cat.maLoaiThuoc"
                    />
                  </el-select>
                </el-form-item>
              </div>
            </template>
            <template v-else>
              <!-- Edit mode: show Ma, Ten, Loai inline as before -->
              <div :style="basicInfoGridStyle">
                <el-form-item label=" Mã thuốc" label-width="100px">
                  <el-input v-model="formData.maThuoc" disabled size="small" style="width:100%" />
                </el-form-item>
                <el-form-item label=" Tên thuốc" label-width="100px">
                  <el-input v-model="formData.tenThuoc" size="small" style="width:100%" />
                </el-form-item>
                <el-form-item label=" Loại thuốc" label-width="100px">
                  <el-select v-model="formData.maLoaiThuoc" style="width: 100%" size="small">
                    <el-option
                      v-for="cat in categories"
                      :key="cat.maLoaiThuoc"
                      :label="cat.tenLoaiThuoc"
                      :value="cat.maLoaiThuoc"
                    />
                  </el-select>
                </el-form-item>
              </div>
            </template>

            <div style="margin-bottom:12px; display:flex; align-items:center; gap:12px;">
              <div style="min-width:120px; font-weight:600; color:#374151"> Nhà cung cấp</div>
              <el-select v-model="formData.maNCC" placeholder="Chọn nhà cung cấp" size="small" style="flex:1; min-width:0">
                <el-option v-for="s in suppliers" :key="s.maNCC" :label="s.tenNCC" :value="s.maNCC" />
              </el-select>
            </div>

            <!-- Other basic fields -->
            <div style="display:grid; grid-template-columns:2fr 1fr; gap:16px; margin-bottom:16px">
              <!-- Price list replaces single 'Đơn giá' field -->
              <div style="border-right: 1px solid #e5e7eb; padding-right: 16px;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px">
                  <strong> Giá thuốc (thêm nhiều hàng)</strong>
                  <el-button size="small" type="primary" @click="formData.giaThuocs.push({ maLoaiDonVi: unitTypes[0]?.maLoaiDonVi || '', soLuong: 1, donGia: 0, trangThai: true })">Thêm hàng</el-button>
                </div>

                <div v-if="formData.giaThuocs && formData.giaThuocs.length">
                  <div v-for="(row, idx) in formData.giaThuocs" :key="idx" style="display:flex; gap:8px; align-items:center; margin-bottom:8px">
                    <el-select v-model="row.maLoaiDonVi" placeholder="Loại đơn vị" size="small" style="flex:2">
                      <el-option v-for="u in unitTypes" :key="u.maLoaiDonVi" :label="u.tenLoaiDonVi" :value="u.maLoaiDonVi" />
                    </el-select>
                    <el-input-number v-model="row.soLuong" :min="1" size="small" style="flex:1" />
                    <el-input-number v-model="row.donGia" :min="0" size="small" style="flex:2" :controls="false" />
                    <el-switch v-model="row.trangThai" active-text="Áp dụng" inactive-text="Không" size="small" />
                    <el-button type="danger" size="small" icon="el-icon-delete" @click="formData.giaThuocs.splice(idx,1)"></el-button>
                  </div>
                </div>
                <div v-else style="color:#6b7280; font-size:13px">Chưa có giá nào. Nhấn "Thêm hàng" để thêm.</div>
              </div>

              <!-- Image selection area -->
              <div>
                <label class="detail-label" style="display:block; margin-bottom:8px"><strong> Ảnh thuốc</strong></label>

                <!-- Radio buttons for image choice -->
                <div style="display:flex; gap:12px; margin-bottom:8px">
                  <el-radio v-model="imageChoice" label="existing" size="small">Ảnh có sẵn</el-radio>
                  <el-radio v-model="imageChoice" label="upload" size="small">Upload</el-radio>
                  <el-radio v-model="imageChoice" label="url" size="small">URL</el-radio>
                </div>

                <!-- Existing images area -->
                <div v-if="imageChoice === 'existing'" style="margin-bottom:8px">
                  <el-select v-model="selectedExistingImage" placeholder="Chọn ảnh có sẵn" size="small" style="width:100%" @change="onExistingImageChange">
                    <el-option
                      v-for="img in existingImages"
                      :key="img"
                      :label="img"
                      :value="img"
                    />
                  </el-select>
                </div>

                <!-- Upload area -->
                <div v-if="imageChoice === 'upload'" style="margin-bottom:8px">
                  <el-upload
                    ref="uploadRef"
                    :on-change="onFileChange"
                    :auto-upload="false"
                    :show-file-list="false"
                    accept="image/*"
                    style="width:100%"
                  >
                    <el-button size="small" type="primary">Chọn file ảnh</el-button>
                  </el-upload>
                </div>

                <!-- URL input area (bind directly to formData.urlAnh so left image updates immediately) -->
                <div v-if="imageChoice === 'url'" style="margin-bottom:8px">
                  <el-input
                    v-model="formData.urlAnh"
                    placeholder="Nhập đường link ảnh (http://... hoặc https://...)"
                    size="small"
                  />
                </div>

                <!-- No small preview under URL — preview is shown on the left image only -->
              </div>
            </div>
          </div>
        </div>

        <!-- Detailed fields section -->
        <div style="margin-top:24px; padding-top:20px; border-top:1px solid #e5e7eb">
          <div style="display:flex; gap:20px; flex-wrap:wrap; margin-bottom:16px">
            <div style="flex:1 1 48%">
              <el-form-item label=" Thành phần" label-width="120px">
                <el-input v-model="formData.thanhPhan" type="textarea" :rows="3" size="small" />
              </el-form-item>
            </div>
            <div style="flex:1 1 48%">
              <el-form-item label=" Công dụng" label-width="120px">
                <el-input v-model="formData.congDung" type="textarea" :rows="3" size="small" />
              </el-form-item>
            </div>
          </div>

          <div style="display:flex; gap:20px; flex-wrap:wrap; margin-bottom:16px">
            <div style="flex:1 1 48%">
              <el-form-item label=" Cách dùng" label-width="120px">
                <el-input v-model="formData.cachDung" type="textarea" :rows="3" size="small" />
              </el-form-item>
            </div>
            <div style="flex:1 1 48%">
              <el-form-item label=" Lưu ý" label-width="120px">
                <el-input v-model="formData.luuY" type="textarea" :rows="3" size="small" />
              </el-form-item>
            </div>
          </div>

          <el-form-item label=" Mô tả" label-width="120px">
            <el-input v-model="formData.moTa" type="textarea" :rows="4" size="small" />
          </el-form-item>
        </div>
      </el-form>

      <template #footer>
        <div style="display:flex; justify-content:flex-end; gap:12px">
          <el-button @click="showAddDialog = false" size="default">Hủy</el-button>
          <el-button type="primary" @click="saveThuoc" :loading="saving" size="default">
            Lưu
          </el-button>
        </div>
      </template>
    </el-dialog>
    <el-dialog
      id="thuocDetailModal"
      class="thuoc-dialog"
      :title="detailsThuoc.tenThuoc || 'Chi tiết thuốc'"
      v-model="showDetailsDialog"
      width="90vw"
      :top="'6vh'"
      :append-to-body="true"
      :before-close="closeDetailsDialog"
    >
      <div v-if="loadingDetails" class="loading-center">
        <i class="el-icon-loading"></i>
        <span style="margin-left:8px">Đang tải...</span>
      </div>

      <div v-else class="modal-body">
        <!-- Top section: image left, small meta fields right -->
        <div class="top-section" style="display:flex; gap:20px; align-items:flex-start">
          <div style="flex:0 0 320px; text-align:center; background:#f9fafb; border-radius:8px; padding:16px; transition:all 0.3s ease; cursor:pointer" class="image-container" @mouseenter="$event.target.parentElement.classList.add('image-lifted')" @mouseleave="$event.target.parentElement.classList.remove('image-lifted')">
            <img class="detail-img" v-if="detailsThuoc.urlAnh" :src="getImageSrc(detailsThuoc.urlAnh)" alt="Ảnh thuốc" />
          </div>

          <div style="flex:1">
            <div class="detail-meta" style="background:#e3f2fd; color:#1976d2; padding:8px 12px; border-radius:6px; font-size:13px; font-weight:600; display:inline-block">Mã: {{ detailsThuoc.maThuoc }}</div>

            <div style="margin-top:16px">
              <div class="supplier-url-grid">
                <div style="background:#f3f4f6; padding:12px; border-radius:6px; border-left:3px solid #3b82f6">
                  <small class="form-label"><strong>Nhà cung cấp</strong></small>
                  <div class="form-control-plaintext" style="margin-top:6px; font-weight:500">{{ detailsThuoc.tenNCC || detailsThuoc.maNCC }}</div>
                </div>
                <div style="background:#f3f4f6; padding:12px; border-radius:6px; border-left:3px solid #10b981">
                  <small class="form-label"><strong>Url ảnh</strong></small>
                  <div class="form-control-plaintext">
                    <template v-if="detailsThuoc.urlAnh">
                      <el-tooltip placement="top" effect="dark">
                        <template #content>
                          {{ detailsThuoc.urlAnh }}
                        </template>
                        <span class="url-badge" @click="copyUrl(detailsThuoc.urlAnh)" :title="'Click để sao chép ' + detailsThuoc.urlAnh">
                          {{ truncateUrlDisplay(detailsThuoc.urlAnh, 30) }}
                          <i class="el-icon-document-copy" style="margin-left:6px"></i>
                          <span v-if="copiedUrl === detailsThuoc.urlAnh" class="copied-mark"> ✓</span>
                        </span>
                      </el-tooltip>
                    </template>
                    <template v-else>-</template>
                  </div>
                </div>
              </div>
            
              <!-- Price list shown under the image URL -->
              <div style="margin-top:16px; display:flex; gap:12px; align-items:flex-start;">
                <strong style="min-width:80px; padding-top:2px">Giá bán:</strong>
                <div class="thuoc-price-card" style="flex:0 0 420px">
                  <el-table class="thuoc-price-table" :data="detailsThuoc.giaThuocs || []" size="small" style="width:100%; margin-top:8px">
                    <el-table-column label="Đơn vị" width="140">
                      <template #default="{ row }">
                        {{ getUnitName(row.maLoaiDonVi) || row.tenLoaiDonVi || row.maLoaiDonVi }}
                      </template>
                    </el-table-column>
                    <el-table-column prop="soLuong" label="Số lượng" width="90" header-align="center" align="center"/>
                    <el-table-column prop="donGia" label="Đơn giá" width="140" header-align="right" align="right" :formatter="formatThuocPrice"/>
                    <el-table-column prop="soLuongCon" label="Tồn" width="90" header-align="center" align="center"/>
                    <el-table-column label="Trạng thái" width="140">
                      <template #default="{ row }">
                        <span :class="row.trangThai ? 'status-active' : 'status-off'">
                          {{ row.trangThai ? 'Áp dụng cả 2' : 'Chỉ áp dụng off' }}
                        </span>
                      </template>
                    </el-table-column>
                  </el-table>
                </div>
              </div>

            </div>
          </div>
        </div>

          <!-- Bottom section: descriptive fields -->
          <div class="bottom-section" style="margin-top:24px; padding-top:20px; border-top:1px solid #e5e7eb; display:block">
            <div style="display:flex; gap:20px; flex-wrap:wrap">
              <div style="flex:1 1 48%; background:#fef3c7; padding:14px; border-radius:6px; border-left:3px solid #f59e0b">
                <label class="detail-label" style="color:#92400e; margin-bottom:8px"><strong>📋 Thành phần</strong></label>
                <div class="detail-mota" style="color:#78350f; line-height:1.7">{{ detailsThuoc.thanhPhan || '—' }}</div>
              </div>
              <div style="flex:1 1 48%; background:#ecfdf5; padding:14px; border-radius:6px; border-left:3px solid #10b981">
                <label class="detail-label" style="color:#065f46; margin-bottom:8px"><strong>✨ Công dụng</strong></label>
                <div class="detail-mota" style="color:#047857; line-height:1.7">{{ detailsThuoc.congDung || '—' }}</div>
              </div>
            </div>

            <div style="display:flex; gap:20px; margin-top:14px; flex-wrap:wrap">
              <div style="flex:1 1 48%; background:#e0e7ff; padding:14px; border-radius:6px; border-left:3px solid #6366f1">
                <label class="detail-label" style="color:#3730a3; margin-bottom:8px"><strong>💊 Cách dùng</strong></label>
                <div class="detail-mota" style="color:#4f46e5; line-height:1.7">{{ detailsThuoc.cachDung || '—' }}</div>
              </div>
              <div style="flex:1 1 48%; background:#fce7f3; padding:14px; border-radius:6px; border-left:3px solid #ec4899">
                <label class="detail-label" style="color:#831843; margin-bottom:8px"><strong>⚠️ Lưu ý</strong></label>
                <div class="detail-mota" style="color:#be185d; line-height:1.7">{{ detailsThuoc.luuY || '—' }}</div>
              </div>
            </div>

            <div style="margin-top:14px; background:#f0f9ff; padding:14px; border-radius:6px; border-left:3px solid #0284c7">
              <label class="detail-label" style="color:#0c2d48; margin-bottom:8px"><strong>📝 Mô tả</strong></label>
              <div class="detail-mota" style="color:#0369a1; line-height:1.7">{{ detailsThuoc.moTa || '—' }}</div>
            </div>
          </div>

          <!-- Reviews Section -->
          <div class="reviews-section" style="margin-top:24px; padding-top:20px; border-top:1px solid #e5e7eb">
            <h4 class="section-title" style="color:#0d3d47; font-size:16px; margin-bottom:16px; font-weight:700">
              ⭐ Đánh giá sản phẩm
            </h4>
            
            <div class="rating-summary" style="display:flex; align-items:center; gap:16px; margin-bottom:20px; background:#fff9c4; padding:16px; border-radius:8px">
              <div class="average-score" style="text-align:center">
                <div style="font-size:32px; font-weight:800; color:#f59e0b; line-height:1">{{ averageRating }}</div>
                <div style="font-size:12px; color:#6b7280">trên 5</div>
              </div>
              <div class="stars-display">
                <el-rate 
                  :model-value="Number(averageRating)" 
                  disabled 
                  show-score 
                  text-color="#ff9900"
                  score-template="{value}"
                />
                <div style="font-size:13px; color:#4b5563; margin-top:4px">{{ reviews.length }} đánh giá</div>
              </div>
            </div>

            <div class="reviews-list" style="max-height: 300px; overflow-y: auto; padding-right: 8px;">
              <div v-if="reviews.length === 0" style="text-align:center; color:#9ca3af; padding:20px; font-style:italic">
                Chưa có đánh giá nào.
              </div>
              <div v-else v-for="review in reviews" :key="review.maDanhGia" class="review-item" style="border-bottom:1px solid #f3f4f6; padding:12px 0">
                <div style="display:flex; justify-content:space-between; margin-bottom:4px">
                  <strong style="color:#374151">{{ review.tenKhachHang || 'Khách hàng' }}</strong>
                  <span style="font-size:12px; color:#9ca3af">{{ formatDate(review.ngayDanhGia) }}</span>
                </div>
                <div style="margin-bottom:6px">
                  <el-rate :model-value="review.soSao" disabled size="small" />
                </div>
                <div style="color:#4b5563; font-size:14px; line-height:1.5">
                  {{ review.noiDung }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div style="display:flex; justify-content:flex-end; gap:12px; margin-top:20px; padding-top:16px; border-top:1px solid #e5e7eb">
          <el-button @click="showDetailsDialog = false" size="default">Đóng</el-button>
        </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import api from '@/api';
import { ElMessage, ElMessageBox } from 'element-plus';
import { View, Edit, Delete } from '@element-plus/icons-vue';
import { useAuthStore } from '@/store/auth';

const loading = ref(false);
const saving = ref(false);
const showAddDialog = ref(false);
const editingThuoc = ref(null);
const thuocList = ref([]);
const categories = ref([]);
const searchKeyword = ref('');
const selectedCategory = ref('');
// Pagination
const currentPage = ref(1);
const pageSize = ref(10);

// Auth store for role checking
const authStore = useAuthStore();

// Check if user is admin
const isAdmin = computed(() => {
  return authStore.user?.ChucVu === 1 || authStore.user?.ChucVu === '1' || 
         authStore.user?.isAdmin === true || authStore.user?.VaiTro === 'Admin';
});

// Image selection variables
const imageChoice = ref('upload'); // 'existing', 'upload', 'url'
const selectedExistingImage = ref('');
const imageUrl = ref('');
const existingImages = ref([]);
const uploadRef = ref(null);
const unitTypes = ref([]);
const suppliers = ref([]);

const formData = ref({
  maThuoc: '',
  tenThuoc: '',
  maLoaiThuoc: '',
  hoatChat: '',
  nuocSanXuat: '',
  donGiaSi: 0,
  urlAnh: '',
  giaThuocs: [],
  thanhPhan: '',
  congDung: '',
  cachDung: '',
  luuY: '',
  moTa: '',
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

// Reset to first page when filters change
watch([searchKeyword, selectedCategory], () => {
  currentPage.value = 1;
});

const pagedThuocList = computed(() => {
  const list = filteredThuocList.value || [];
  const start = (currentPage.value - 1) * pageSize.value;
  return list.slice(start, start + pageSize.value);
});

// Grid style for the top basic-info row: when adding (editingThuoc === null)
const basicInfoGridStyle = computed(() => {
  // If editing an existing item, keep balanced columns; when adding, make 'Mã thuốc' small and 'Tên thuốc' large
  const cols = editingThuoc.value ? '1fr 2fr 1fr' : '0.6fr 5fr 0.8fr';
  return `display: grid; grid-template-columns: ${cols}; gap: 16px; margin-bottom: 16px;`;
});

// Ensure current page is valid when filtered list or pageSize changes
watch([filteredThuocList, pageSize], ([list]) => {
  const total = Math.max(1, Math.ceil((list?.length || 0) / pageSize.value));
  if (currentPage.value > total) currentPage.value = total;
});

onMounted(async () => {
  await loadCategories();
  await loadThuocList();
  await loadExistingImages();
  await loadLoaiDonVi();
  await loadSuppliers();
});

const loadSuppliers = async () => {
  try {
    const resp = await api.nhacungcap.getAll();
    suppliers.value = resp.data?.data || resp.data || [];
  } catch (e) {
    console.error('Error loading suppliers', e);
    suppliers.value = [];
  }
};

const loadLoaiDonVi = async () => {
  try {
    const resp = await api.thuoc.getLoaiDonVi();
    unitTypes.value = resp.data?.data || resp.data || [];
  } catch (e) {
    console.error('Error loading unit types', e);
    unitTypes.value = [];
  }
};

const getUnitName = (ma) => {
  if (!ma) return '';
  const u = unitTypes.value.find(x => x.maLoaiDonVi === ma);
  return u ? u.tenLoaiDonVi : ma;
};

// Watch imageChoice to sync URL input
watch(imageChoice, (newChoice) => {
  if (newChoice === 'url') {
    // When switching to URL mode, populate from current formData
    imageUrl.value = formData.value.urlAnh || '';
  } else if (newChoice === 'existing') {
    imageUrl.value = '';
    // populate selectedExistingImage if available
    if (selectedExistingImage.value) formData.value.urlAnh = selectedExistingImage.value;
  } else {
    // upload mode: clear url input
    imageUrl.value = '';
  }
});

// URL input is bound directly to `formData.urlAnh`, so the main left image updates automatically.

const onUrlInput = (value) => {
  formData.value.urlAnh = value;
};

const loadCategories = async () => {
  try {
    const response = await api.thuoc.getTopLoaiThuoc();
    categories.value = response.data.data || [];
  } catch (error) {
    console.error('Load categories error:', error);
  }
};

const loadThuocList = async () => {
  loading.value = true;
  try {
    const response = await api.thuoc.getAll();
    thuocList.value = response.data.data || [];
  } catch (error) {
    ElMessage.error('Lỗi khi tải danh sách thuốc');
  } finally {
    loading.value = false;
  }
};

const getCategoryName = (maLoai) => {
  const cat = categories.value.find(c => c.maLoaiThuoc === maLoai);
  return cat ? cat.tenLoaiThuoc : maLoai;
};

// Preload product images from `src/assets/img/product` so we can map filenames to their built URLs.
const productImages = {};
const modules = import.meta.glob('../../assets/img/product/*', { eager: true, as: 'url' });
for (const p in modules) {
  const parts = p.split('/');
  const name = parts[parts.length - 1];
  productImages[name] = modules[p];
}

const getImageSrc = (url) => {
  if (!url) return '';
  const str = String(url).trim();
  if (str.startsWith('http://') || str.startsWith('https://') || str.startsWith('/')) {
    return str;
  }
  // Normalize filename
  const safe = str.replace(/\\/g, '/').split('/').pop();
  // Prefer preloaded product image URL
  if (productImages[safe]) return productImages[safe];
  // As a last resort, try resolving relative path (dev fallback)
  try {
    return new URL(encodeURI(`../assets/img/product/${safe}`), import.meta.url).href;
  } catch (e) {
    return `/assets/img/product/${encodeURIComponent(safe)}`;
  }
};

const truncateText = (text, maxWords) => {
  if (!text) return '';
  const words = text.split(' ');
  if (words.length <= maxWords) return text;
  return words.slice(0, maxWords).join(' ') + '...';
};

// Details dialog state
const showDetailsDialog = ref(false);
const detailsThuoc = ref({});
const loadingDetails = ref(false);

const viewDetails = async (thuoc) => {
  // Open dialog immediately so the user sees something and a spinner
  showDetailsDialog.value = true;
  loadingDetails.value = true;
  console.debug('[viewDetails] fetching details for', thuoc?.maThuoc);
  try {
    const resp = await api.thuoc.getById(thuoc.maThuoc);
    // API may return { data: { data: {...} } } or { data: {...} }
    const payload = resp?.data?.data ?? resp?.data ?? {};
    detailsThuoc.value = payload;
    console.debug('[viewDetails] loaded payload:', payload);
    await loadReviews(thuoc.maThuoc);
  } catch (error) {
    ElMessage.error('Lỗi khi tải chi tiết thuốc');
    console.error(error);
  } finally {
    loadingDetails.value = false;
  }
};

const reviews = ref([]);
const loadReviews = async (maThuoc) => {
  try {
    const response = await api.danhgiathuoc.getByThuoc(maThuoc);
    if (response.data && response.data.status === 1) {
      reviews.value = response.data.data;
    } else {
      reviews.value = [];
    }
  } catch (error) {
    console.error('Load reviews error:', error);
    reviews.value = [];
  }
};

const averageRating = computed(() => {
  if (detailsThuoc.value?.diemTrungBinh) return parseFloat(detailsThuoc.value.diemTrungBinh).toFixed(1);
  if (reviews.value.length > 0) {
    const total = reviews.value.reduce((acc, r) => acc + (r.soSao || 0), 0);
    return (total / reviews.value.length).toFixed(1);
  }
  return 0;
});

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

const closeDetailsDialog = () => {
  showDetailsDialog.value = false;
};

const addNewThuoc = () => {
  editingThuoc.value = null;
  formData.value = {
    maThuoc: '',
    tenThuoc: '',
    maLoaiThuoc: '',
    maNCC: '',
    hoatChat: '',
    nuocSanXuat: '',
    donGiaSi: 0,
    urlAnh: '',
    giaThuocs: [],
    thanhPhan: '',
    congDung: '',
    cachDung: '',
    luuY: '',
    moTa: '',
  };

  // Reset image selection
  imageChoice.value = 'upload';
  selectedExistingImage.value = '';
  imageUrl.value = '';

  showAddDialog.value = true;
};

// copy-to-clipboard for image URL
const copiedUrl = ref('');
const copyUrl = async (url) => {
  if (!url) return;
  try {
    await navigator.clipboard.writeText(url);
    copiedUrl.value = url;
    setTimeout(() => {
      if (copiedUrl.value === url) copiedUrl.value = '';
    }, 1500);
    ElMessage.success('Đã sao chép URL ảnh');
  } catch (e) {
    ElMessage.error('Không thể sao chép');
    console.error(e);
  }
};

const truncateUrlDisplay = (url, maxLen = 30) => {
  if (!url) return '';
  const s = String(url);
  if (s.length <= maxLen) return s;
  const head = s.slice(0, Math.max(8, Math.floor(maxLen * 0.6)));
  const tail = s.slice(-Math.max(6, Math.floor(maxLen * 0.3)));
  return `${head}...${tail}`;
};

// Image handling methods
const loadExistingImages = async () => {
  try {
    const response = await api.thuoc.getExistingImages();
    existingImages.value = response.data?.data || response.data || [];
  } catch (error) {
    console.error('Error loading existing images:', error);
    existingImages.value = [];
  }
};

const onExistingImageChange = (value) => {
  if (value) {
    formData.value.urlAnh = value;
  } else {
    formData.value.urlAnh = '';
  }
};

const onFileChange = (file) => {
  if (file && file.raw) {
    const reader = new FileReader();
    reader.onload = (e) => {
      // Note: File upload will be handled during save. We don't display a small right preview.
      // The main left image will reflect the saved/uploaded image after save.
    };
    reader.readAsDataURL(file.raw);
  }
};

const handlePageChange = (page) => {
  currentPage.value = page;
};

const editThuoc = async (thuoc) => {
  editingThuoc.value = thuoc;
  showAddDialog.value = true;
  try {
    const response = await api.thuoc.getById(thuoc.maThuoc);
    // API may return { data: { data: {...} } } or { data: {...} }
    const payload = response?.data?.data ?? response?.data ?? {};
    formData.value = { ...payload };
    // Ensure price rows exist as an array
      if (!Array.isArray(formData.value.giaThuocs)) formData.value.giaThuocs = payload.giaThuocs || [];
      // Normalize any old rows that used `tenLoaiDonVi` into `maLoaiDonVi` when possible
      formData.value.giaThuocs = formData.value.giaThuocs.map(row => {
        const r = { ...row };
        if (!r.maLoaiDonVi && r.tenLoaiDonVi) {
          const found = unitTypes.value.find(u => u.tenLoaiDonVi === r.tenLoaiDonVi);
          r.maLoaiDonVi = found ? found.maLoaiDonVi : '';
        }
        return r;
      });

    // Initialize image selection based on existing URL
    if (formData.value.urlAnh) {
      if (formData.value.urlAnh.startsWith('http') || formData.value.urlAnh.startsWith('https')) {
        imageChoice.value = 'url';
        imageUrl.value = formData.value.urlAnh;
      } else {
        // Check if it's an existing image
        const existingIndex = existingImages.value.indexOf(formData.value.urlAnh);
        if (existingIndex >= 0) {
          imageChoice.value = 'existing';
          selectedExistingImage.value = formData.value.urlAnh;
        } else {
          // Assume it's uploaded
          imageChoice.value = 'upload';
        }
      }
    } else {
      imageChoice.value = 'upload';
      selectedExistingImage.value = '';
      imageUrl.value = '';
    }
  } catch (error) {
    ElMessage.error('Lỗi khi tải chi tiết thuốc');
    // Fallback to table row data
    formData.value = { ...thuoc };
  }
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
      const resp = await api.thuoc.delete(thuoc.maThuoc);
      const apiResp = (resp && resp.data && typeof resp.data === 'object') ? resp.data : resp;
      if (apiResp && apiResp.status === -1) {
        ElMessage.error(apiResp.message || 'Xóa thất bại');
        return;
      }
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
    // client-side validation for required fields
    if (!formData.value.tenThuoc || !formData.value.maLoaiThuoc || !formData.value.maNCC) {
      ElMessage.error('Vui lòng điền: Tên thuốc, Loại thuốc và Nhà cung cấp.');
      saving.value = false;
      return;
    }
    // Always send multipart/form-data since backend uses [FromForm]
    const fd = new FormData();
    fd.append('MaLoaiThuoc', formData.value.maLoaiThuoc || '');
    fd.append('TenThuoc', formData.value.tenThuoc || '');
    fd.append('ThanhPhan', formData.value.thanhPhan || '');
    fd.append('MoTa', formData.value.moTa || '');
    fd.append('CongDung', formData.value.congDung || '');
    fd.append('CachDung', formData.value.cachDung || '');
    fd.append('LuuY', formData.value.luuY || '');
    fd.append('MaNCC', formData.value.maNCC || '');

    // Handle image based on choice
    const hasFile = imageChoice.value === 'upload' && uploadRef.value?.uploadFiles?.length > 0;
    if (hasFile) {
      const file = uploadRef.value.uploadFiles[0].raw;
      fd.append('FileAnh', file, file.name);
    } else {
      // For existing or URL, append UrlAnh
      const urlAnh = imageChoice.value === 'existing' ? selectedExistingImage.value || '' : (imageChoice.value === 'url' ? formData.value.urlAnh || '' : '');
      fd.append('UrlAnh', urlAnh);
    }

    const rows = formData.value.giaThuocs || [];
    for (let i = 0; i < rows.length; i++) {
      const r = rows[i] || {};
      fd.append(`GiaThuocs[${i}].MaLoaiDonVi`, r.maLoaiDonVi || '');
      // include MaGiaThuoc when present so backend can identify existing price rows
      fd.append(`GiaThuocs[${i}].MaGiaThuoc`, r.maGiaThuoc || '');
      fd.append(`GiaThuocs[${i}].SoLuong`, (r.soLuong ?? 1).toString());
      fd.append(`GiaThuocs[${i}].DonGia`, (r.donGia ?? 0).toString());
      fd.append(`GiaThuocs[${i}].TrangThai`, (r.trangThai ? 'true' : 'false'));
    }

    if (editingThuoc.value) {
      const resp = await api.thuoc.update(formData.value.maThuoc, fd);
      const apiResp = (resp && resp.data && typeof resp.data === 'object') ? resp.data : resp;
      if (apiResp && apiResp.status === -1) {
        ElMessage.error(apiResp.message || 'Cập nhật thất bại');
        return;
      }
      ElMessage.success('Cập nhật thành công');
    } else {
      const resp = await api.thuoc.create(fd);
      const apiResp = (resp && resp.data && typeof resp.data === 'object') ? resp.data : resp;
      if (apiResp && apiResp.status === -1) {
        ElMessage.error(apiResp.message || 'Thêm thất bại');
        return;
      }
      ElMessage.success('Thêm thành công');
    }

    showAddDialog.value = false;
    editingThuoc.value = null;
    // clear upload files if any
    try { uploadRef.value?.clearFiles && uploadRef.value.clearFiles(); } catch {}
    await loadThuocList();
  } catch (error) {
    ElMessage.error(error.message || 'Lưu thất bại');
  } finally {
    saving.value = false;
  }
};

const formatThuocPrice = (row) => {
  // Element Plus formatter can receive different args (cellValue, row, column, index),
  // try to find the price value defensively.
  const price = (row && (row.donGia ?? row)) ?? '';
  return price === '' ? '' : formatPrice(price) + ' đ';
};

const formatPrice = (price) => {
  return new Intl.NumberFormat('vi-VN').format(price);
};
</script>

<style scoped>
.admin-thuoc {
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

/* Action buttons row styling */
.action-buttons-row {
  display: flex;
  gap: 10px;
  align-items: center;
  justify-content: center;
  flex-wrap: nowrap;
}

.btn-action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0;
  padding: 8px 10px;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  white-space: nowrap;
  min-height: 36px;
  min-width: 36px;
  position: relative;
  overflow: hidden;
}

.btn-action .el-icon {
  font-size: 15px;
  display: flex;
  align-items: center;
}

.btn-action:before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  transform: translate(-50%, -50%);
  transition: width 0.6s, height 0.6s;
  z-index: -1;
}

.btn-action:active:before {
  width: 300px;
  height: 300px;
}

.btn-view {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.btn-view:hover {
  box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
  transform: translateY(-2px);
}

.btn-view:active {
  transform: translateY(0);
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
}

.btn-edit {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
}

.btn-edit:hover {
  box-shadow: 0 6px 20px rgba(245, 158, 11, 0.4);
  transform: translateY(-2px);
}

.btn-edit:active {
  transform: translateY(0);
  box-shadow: 0 2px 8px rgba(245, 158, 11, 0.3);
}

.btn-delete {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
}

.btn-delete:hover {
  box-shadow: 0 6px 20px rgba(239, 68, 68, 0.4);
  transform: translateY(-2px);
}

.btn-delete:active {
  transform: translateY(0);
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3);
}

/* Make the search input inner element match button height */
.search-input ::v-deep .el-input__inner {
  height: 40px;
  line-height: 40px;
}

.search-input ::v-deep .el-input__inner::placeholder {
  line-height: 40px;
}

.product-thumb {
  width: 50px;
  height: 50px;
  object-fit: cover;
  border-radius: 4px;
}

.thuoc-details-image {
  width: 200px;
  height: 200px;
  object-fit: cover;
  border-radius: 10px;
  border: 1px solid #e6eef0;
}

.thuoc-details {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.thuoc-top {
  display: flex;
  gap: 20px;
}

.thuoc-left {
  flex: 0 0 220px;
  text-align: center;
}

.thuoc-title {
  margin: 12px 0 6px;
  font-size: 20px;
  color: #0d3d47;
}

.thuoc-supplier {
  color: #6c757d;
  margin: 0;
}

.thuoc-right {
  flex: 1;
}

.thuoc-keyinfo .label {
  font-weight: 700;
  color: #0d3d47;
  margin-right: 6px;
}

.thuoc-keyinfo .value {
  color: #223;
}

.thuoc-bottom {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.thuoc-section h4 {
  margin: 0 0 6px;
  font-size: 16px;
  color: #0d3d47;
}

.pre-line {
  white-space: pre-line;
}

/* status badges */
.status-active {
  color: #155724;
  background: #d4edda;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
}
.status-off {
  color: #856404;
  background: #fff3cd;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
}

/* Styles adapted from provided template for the detail modal */
#thuocDetailModal .modal-body { font-size: 1rem; }
#thuocDetailModal .modal-close-x { background: transparent; border: 1px solid #444; border-radius: 3px; width: 28px; height: 18px; line-height: 14px; text-align: center; font-size: 14px; color: #222; }
#thuocDetailModal .modal-close-x:hover { background: #f8f9fa; }
#thuocDetailModal .detail-img { max-width: 100%; height: auto; object-fit: contain; display: block; max-height: 360px; border-radius:8px; }
#thuocDetailModal .form-control, #thuocDetailModal .form-select, #thuocDetailModal .form-control-plaintext { width: 100% !important; }
#thuocDetailModal .detail-ten { font-size: 1.5rem; font-weight: 600; margin: 0; }
#thuocDetailModal .detail-meta { color: #6c757d; margin-bottom: 0.5rem; }
#thuocDetailModal .detail-row { margin-bottom: 0.5rem; color: #212529; }
#thuocDetailModal .detail-mota { white-space: pre-wrap; color: #212529; }
@media (max-width: 767px) {
  #thuocDetailModal .detail-ten { font-size: 1.2rem; }
}
#thuocDetailModal .detail-ncc { padding-right: 1rem; }
#thuocDetailModal .detail-ncc .form-select, #thuocDetailModal .detail-ncc .edit-ncc { width: 100%; }
#thuocDetailModal .detail-urlanh small { display: inline-block; margin-left: .4rem; }

/* Price table responsive tweaks */
.thuoc-price-table {
  max-width: 100%;
}
.thuoc-price-table .el-table__header-wrapper,
.thuoc-price-table .el-table__body-wrapper {
  overflow: auto;
}
.thuoc-price-table .cell {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.thuoc-price-table .el-table__header th .cell {
  white-space: nowrap;
}
.thuoc-price-table .el-table__body td .cell {
  white-space: nowrap;
}
.thuoc-price-table .el-table__row {
  max-width: 100%;
}

/* Slightly smaller status badges to save space */
.status-active, .status-off {
  font-size: 11px;
  padding: 3px 6px;
}

/* Move dialog content a bit higher and limit body height to avoid large page scroll */
.thuoc-dialog .el-dialog__body {
  max-height: calc(78vh);
  overflow: auto;
}

.thuoc-dialog .el-dialog__header {
  padding-top: 10px;
  padding-bottom: 8px;
}

/* Ensure dialog overlays are above other panels in the admin layout */
.el-dialog__wrapper {
  z-index: 9999 !important;
}

.loading-center {
  text-align: center;
  padding: 28px 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #606f7b;
  font-size: 14px;
}
.loading-center .el-icon-loading {
  font-size: 18px;
}

/* Wider dialog with a max-width to keep it from becoming too wide on large screens */
.thuoc-dialog .el-dialog {
  width: 90vw !important;
  max-width: 1200px !important;
}

.thuoc-dialog .top-section {
  gap: 28px;
}

/* Fix price list block width to avoid pushing dialog wider */
.thuoc-price-block {
  width: 360px;
  min-width: 280px;
  max-width: 420px;
}

.thuoc-price-card {
  border: 1px solid #e9eef2;
  border-radius: 8px;
  padding: 8px;
  background: #fff;
  box-shadow: 0 1px 2px rgba(10,20,20,0.03);
}

.url-badge {
  display: inline-block;
  max-width: 340px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  cursor: pointer;
  color: #0d6efd;
}
.url-badge .el-icon-document-copy { font-size: 12px; color: #6c757d }

.supplier-row { display:flex; justify-content:space-between; gap: 24px; align-items:center; }
.supplier-row .supplier-info { flex:1; min-width: 180px }
.supplier-row .url-info { flex:0 0 48%; text-align:right }
.supplier-row .url-info .url-badge { max-width: 100%; }

/* Grid for supplier + url on same row with equal width */
.supplier-url-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  align-items: start;
}
@media (max-width: 767px) {
  .supplier-url-grid { grid-template-columns: 1fr; }
  .supplier-url-grid > div { text-align: left !important; }
}

.thuoc-price-table .el-table__body td { font-size: 14px; }
.thuoc-price-table .el-table__header th { font-weight: 600 }

.status-active {
  color: #fff;
  background: #28a745;
  padding: 6px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}
.status-off {
  color: #fff;
  background: #6c757d;
  padding: 6px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

/* Improve form label styling */
.form-label {
  display: block;
  margin-bottom: 6px;
  color: #333;
  font-size: 13px;
  line-height: 1.5;
}

.detail-label {
  display: block;
  margin-bottom: 8px;
  color: #333;
  font-size: 14px;
  line-height: 1.5;
}

.form-control-plaintext {
  padding: 6px 0;
  color: #555;
  font-size: 14px;
  line-height: 1.6;
}

.detail-mota {
  color: #555;
  font-size: 13px;
  line-height: 1.6;
  padding: 4px 0;
}

/* Admin card styling */
.admin-card {
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  box-shadow: 0 1px 3px rgba(0,0,0,0.08);
}
.admin-card :deep(.el-card__header) {
  border-bottom: 1px solid #f3f4f6 !important;
  background: #fafbfc;
}
.admin-card :deep(.el-card__body) {
  padding: 20px;
}

/* Table improvements */
.admin-thuoc :deep(.el-table__header-wrapper thead th) {
  background: #f9fafb !important;
  font-weight: 600;
  color: #374151;
  border-bottom: 2px solid #e5e7eb !important;
}
.admin-thuoc :deep(.el-table__row) {
  height: 52px !important;
}
.admin-thuoc :deep(.el-table__row:hover > td) {
  background-color: #f9fafb !important;
}
.admin-thuoc :deep(.el-table__body) td {
  padding: 12px 0 !important;
}
.admin-thuoc :deep(.product-thumb) {
  border-radius: 4px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.1);
}

/* Button improvements */
.admin-thuoc :deep(.el-button) {
  border-radius: 6px;
  font-weight: 500;
}
.admin-thuoc :deep(.el-button--primary) {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
}
.admin-thuoc :deep(.el-button--warning) {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
}

/* Input improvements */
.admin-thuoc :deep(.el-input__wrapper) {
  border-radius: 6px;
  box-shadow: inset 0 1px 2px rgba(0,0,0,0.05);
}
.admin-thuoc :deep(.el-input__wrapper:hover) {
  box-shadow: inset 0 1px 2px rgba(0,0,0,0.1) !important;
}

/* Select improvements */
.admin-thuoc :deep(.el-select__wrapper) {
  border-radius: 6px;
}

/* Detail image improvements */
.detail-img {
  max-width: 100%;
  max-height: 340px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  object-fit: contain;
  background: #fff;
  transition: all 0.3s ease;
}

.image-container {
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) !important;
}

.top-section.image-lifted .image-container {
  transform: translateY(-8px);
  box-shadow: 0 12px 24px rgba(0,0,0,0.15) !important;
}

.top-section.image-lifted .detail-img {
  box-shadow: 0 8px 16px rgba(0,0,0,0.2);
}

/* Dialog title styling */
.thuoc-dialog :deep(.el-dialog__title) {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
}

/* Action buttons styling */
.action-buttons {
  display: flex;
  gap: 8px;
  align-items: center;
}

.action-buttons .el-button {
  padding: 6px 12px;
  height: 32px;
  font-size: 12px;
  border-radius: 6px;
  font-weight: 500;
  transition: all 0.3s ease;
  border: none;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.btn-view {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%) !important;
  color: white !important;
  box-shadow: 0 2px 4px rgba(59, 130, 246, 0.25);
}

.btn-view:hover {
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.35) !important;
  transform: translateY(-1px);
}

.btn-edit {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%) !important;
  color: white !important;
  box-shadow: 0 2px 4px rgba(245, 158, 11, 0.25);
}

.btn-edit:hover {
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.35) !important;
  transform: translateY(-1px);
}

.btn-delete {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%) !important;
  color: white !important;
  box-shadow: 0 2px 4px rgba(239, 68, 68, 0.25);
}

.btn-delete:hover {
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.35) !important;
  transform: translateY(-1px);
}

.action-buttons .el-button i {
  font-size: 13px;
}

/* Edit form container styling */
.edit-form-container {
  font-size: 14px;
}

.edit-form-container .el-form-item {
  margin-bottom: 16px;
}

.edit-form-container .el-form-item__label {
  font-weight: 600;
  color: #374151;
  margin-bottom: 6px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.edit-form-container .el-input__wrapper,
.edit-form-container .el-textarea__inner,
.edit-form-container .el-select__wrapper {
  border-radius: 6px;
  box-shadow: inset 0 1px 2px rgba(0,0,0,0.05);
}

.edit-form-container .el-input__wrapper:hover,
.edit-form-container .el-textarea__inner:hover,
.edit-form-container .el-select__wrapper:hover {
  box-shadow: inset 0 1px 2px rgba(0,0,0,0.1);
}
</style>
