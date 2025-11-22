<template>
  <el-card>
    <h3>📦 Quản lý kho</h3>

    <el-tabs v-model="activeTab">
      <el-tab-pane label="Chưa tách lẻ" name="chuaTachLe">
          <div class="controls">
            <el-select
              class="status-select"
              v-model="selectedChua"
              placeholder="Trạng thái"
              size="small"
              @change="fetchChuaTachLe"
              placement="bottom-start"
              :teleported="true"
              :popper-options="{
                modifiers: [
                  { name: 'flip', options: { fallbackPlacements: [] } },
                  { name: 'preventOverflow', options: { boundary: 'viewport' } }
                ]
              }"
              popper-class="kho-select-popper"
            >
              <el-option label="Tất cả" :value="'all'" />
              <el-option label="Lô đang dùng" :value="'1'" />
              <el-option label="Lô đã hết" :value="'0'" />
            </el-select>

            <el-select
              class="drug-select"
              v-model="selectedDrugChua"
              placeholder="Chọn thuốc"
              size="small"
              placement="bottom-start"
              :teleported="true"
              :popper-options="{
                modifiers: [
                  { name: 'flip', options: { fallbackPlacements: [] } },
                  { name: 'preventOverflow', options: { boundary: 'viewport' } }
                ]
              }"
              popper-class="kho-select-popper"
            >
              <el-option label="Tất cả" :value="'all'" />
              <el-option v-for="d in chuaDrugs" :key="d.maThuoc" :label="d.tenThuoc" :value="d.maThuoc" />
            </el-select>
           
             <el-select class="unit-select" v-model="selectedUnitChua" placeholder="Chọn đơn vị" size="small" placement="bottom-start" :teleported="true" :popper-options="{
                 modifiers: [
                   { name: 'flip', options: { fallbackPlacements: [] } },
                   { name: 'preventOverflow', options: { boundary: 'viewport' } }
                 ]
               }" popper-class="kho-select-popper">
               <el-option label="Tất cả" :value="'all'" />
               <el-option v-for="u in chuaUnits" :key="u.code" :label="u.name" :value="u.code" />
             </el-select>
            <el-tooltip content="Tách lô" placement="top">
              <el-button size="small" class="split-btn" @click="openSplitDialog">
                <i class="fas fa-cut"></i>
              </el-button>
            </el-tooltip>
          </div>

          <el-table :data="paginatedChua" style="width: 100%" v-loading="loadingChua" stripe>
          <el-table-column prop="maLo" label="Mã Lô" width="180" />
          <el-table-column prop="maThuoc" label="Mã Thuốc" width="90" />
          <el-table-column label="Tên Thuốc" min-width="420">
            <template #default="{ row }">
              <el-tooltip :content="row.tenThuoc" placement="top">
                <span>{{ truncateWords(row.tenThuoc, 15) }}</span>
              </el-tooltip>
            </template>
          </el-table-column>
          <el-table-column prop="tenLoaiDonViGoc" label="Đơn Vị" width="120" />
          <el-table-column prop="soLuongCon" label="Số Lượng" width="100" />
          <el-table-column label="Hạn sử dụng" width="140">
            <template #default="{ row }">
              <span>{{ formatDate(row.hanSuDung) }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="trangThaiSeal" label="Seal" width="90">
            <template #default="{ row }">
              <el-tag type="info" v-if="row.trangThaiSeal">Đóng</el-tag>
              <el-tag v-else>Thường</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="ghiChu" label="Ghi chú" width="160" />
          <el-table-column label="Thao Tác" width="120" align="center">
            <template #default="{ row }">
              <el-tooltip :content="(row.soLuongCon ?? row.soLuongConLe ?? 0) > 0 ? 'Đổi nhanh' : 'Lô đã hết'" placement="top">
                <el-button size="small" type="text" @click="quickChange(row)" :disabled="!canQuickChange(row)">
                  <i class="fas fa-sync-alt"></i>
                </el-button>
              </el-tooltip>
              <el-tooltip content="Xem" placement="top">
                <el-button size="small" type="text" @click="viewRow(row)">
                  <i class="fas fa-eye"></i>
                </el-button>
              </el-tooltip>
            </template>
          </el-table-column>
        </el-table>
        <div class="table-footer" v-if="filteredChuaList.length > pageSize">
          <el-pagination
            background
            layout="prev, pager, next"
            :total="filteredChuaList.length"
            :page-size="pageSize"
            v-model:current-page="pageChua"
            @current-change="(p) => (pageChua = p)"
            small
          />
        </div>
      </el-tab-pane>

      <el-tab-pane label="Đã tách lẻ" name="daTachLe">
        <div class="controls">
          <el-select
            class="status-select"
            v-model="selectedDa"
            placeholder="Trạng thái"
            size="small"
            @change="fetchDaTachLe"
            placement="bottom-start"
            :teleported="true"
            :popper-options="{
              modifiers: [
                { name: 'flip', options: { fallbackPlacements: [] } },
                { name: 'preventOverflow', options: { boundary: 'viewport' } }
              ]
            }"
            popper-class="kho-select-popper"
          >
            <el-option label="Tất cả" :value="'all'" />
            <el-option label="Lô đang dùng" :value="'1'" />
            <el-option label="Lô đã hết" :value="'0'" />
          </el-select>

          <el-select
            class="drug-select"
            v-model="selectedDrugDa"
            placeholder="Chọn thuốc"
            size="small"
            placement="bottom-start"
            :teleported="true"
            :popper-options="{
              modifiers: [
                { name: 'flip', options: { fallbackPlacements: [] } },
                { name: 'preventOverflow', options: { boundary: 'viewport' } }
              ]
            }"
            popper-class="kho-select-popper"
          >
            <el-option label="Tất cả" :value="'all'" />
            <el-option v-for="d in daDrugs" :key="d.maThuoc" :label="d.tenThuoc" :value="d.maThuoc" />
          </el-select>
         
           <el-select class="unit-select" v-model="selectedUnitDa" placeholder="Chọn đơn vị" size="small" placement="bottom-start" :teleported="true" :popper-options="{
               modifiers: [
                 { name: 'flip', options: { fallbackPlacements: [] } },
                 { name: 'preventOverflow', options: { boundary: 'viewport' } }
               ]
             }" popper-class="kho-select-popper">
             <el-option label="Tất cả" :value="'all'" />
             <el-option v-for="u in daUnits" :key="u.code" :label="u.name" :value="u.code" />
           </el-select>
          <el-button type="success" @click="openSplitDialog" size="small">
            <i class="fas fa-cut"></i>
            Tách lô
          </el-button>
        </div>

        <el-table :data="paginatedDa" style="width: 100%" v-loading="loadingDa" stripe>
          <el-table-column prop="maLo" label="Mã Lô" width="180" />
          <el-table-column prop="maThuoc" label="Mã Thuốc" width="90" />
          <el-table-column label="Tên Thuốc" min-width="420">
            <template #default="{ row }">
              <el-tooltip :content="row.tenThuoc" placement="top">
                <span>{{ truncateWords(row.tenThuoc, 15) }}</span>
              </el-tooltip>
            </template>
          </el-table-column>
          <el-table-column prop="tenLoaiDonViLe" label="Đơn Vị (lẻ)" width="140" />
          <el-table-column prop="soLuongConLe" label="Số Lượng (lẻ)" width="110" />
          <el-table-column label="Hạn sử dụng" width="140">
            <template #default="{ row }">
              <span>{{ formatDate(row.hanSuDung) }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="trangThaiSeal" label="Seal" width="90">
            <template #default="{ row }">
              <el-tag type="info" v-if="row.trangThaiSeal">Đóng</el-tag>
              <el-tag v-else>Thường</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="ghiChu" label="Ghi chú" width="260" />
          <el-table-column label="Thao Tác" width="120" align="center">
            <template #default="{ row }">
              <el-tooltip content="Đổi nhanh" placement="top">
                <el-button size="small" type="text" @click="quickChange(row)" :disabled="true">
                  <i class="fas fa-sync-alt"></i>
                </el-button>
              </el-tooltip>
              <el-tooltip content="Xem" placement="top">
                <el-button size="small" type="text" @click="viewRow(row)">
                  <i class="fas fa-eye"></i>
                </el-button>
              </el-tooltip>
            </template>
          </el-table-column>
        </el-table>
        <div class="table-footer" v-if="filteredDaList.length > pageSize">
          <el-pagination
            background
            layout="prev, pager, next"
            :total="filteredDaList.length"
            :page-size="pageSize"
            v-model:current-page="pageDa"
            @current-change="(p) => (pageDa = p)"
            small
          />
        </div>
      </el-tab-pane>
    </el-tabs>
        <el-dialog v-model="quickDialog" width="720px" :close-on-click-modal="false" title="Đổi nhanh số lượng">
          <template #default>
            <!-- Current lot info card -->
            <div class="quick-info-card">
              <div class="quick-info-row">
                <div class="quick-info-col">
                  <span class="quick-info-label">Mã Lô:</span>
                  <span class="quick-info-value">{{ quickRow && quickRow.maLo }}</span>
                </div>
                <div class="quick-info-col">
                  <span class="quick-info-label">Mã Thuốc:</span>
                  <span class="quick-info-value">{{ quickRow && quickRow.maThuoc }}</span>
                </div>
              </div>
              <div class="quick-info-row">
                <span class="quick-info-label">Tên Thuốc:</span>
                <span class="quick-info-value">{{ quickRow && quickRow.tenThuoc }}</span>
              </div>
              <div class="quick-info-row">
                <div class="quick-info-col">
                  <span class="quick-info-label">Đơn vị hiện tại:</span>
                  <span class="quick-info-value">{{ quickRow && (quickRow.tenLoaiDonViGoc || quickRow.tenLoaiDonViLe) }}</span>
                </div>
                <div class="quick-info-col">
                  <span class="quick-info-label">Số lượng hiện tại:</span>
                  <span class="quick-info-value">{{ quickRow && (quickRow.soLuongCon ?? quickRow.soLuongConLe) }}</span>
                </div>
              </div>
            </div>

            <!-- Form for input -->
            <div style="margin-top:4px; padding-top:8px; border-top:1px solid var(--el-border-color-light)">
              <el-form label-position="top" label-width="auto" :model="{ quickNewUnit, quickNewExpiry, quickExpiryOption }">
                <el-row :gutter="16">
                  <el-col :span="12">
                    <el-form-item label="Đơn vị mới">
                      <el-select v-model="quickNewUnit" placeholder="Chọn đơn vị" clearable style="width:100%">
                        <el-option v-for="u in quickUnits" :key="u.code" :label="`${u.name} (x${u.soLuong})`" :value="u.code" />
                      </el-select>
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="Hạn sử dụng mới">
                      <el-radio-group v-model="quickExpiryOption" size="small">
                        <el-radio-button label="3">3 tháng</el-radio-button>
                        <el-radio-button label="6">6 tháng</el-radio-button>
                        <el-radio-button label="9">9 tháng</el-radio-button>
                        <el-radio-button label="custom">Tùy chọn</el-radio-button>
                      </el-radio-group>
                    </el-form-item>
                  </el-col>
                </el-row>

                <el-row v-if="quickExpiryOption === 'custom'" :gutter="16" style="margin-top:-8px">
                  <el-col :span="12">
                    <el-form-item label="Chọn ngày" :error="quickExpiryError">
                      <el-date-picker v-model="quickNewExpiry" type="date" placeholder="Chọn ngày" style="width:100%" @change="validateQuickExpiry" />
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="Hạn hiện tại">
                      <el-input :value="quickCurrentExpiry ? formatDate(quickCurrentExpiry) : '-'" disabled style="width:100%" />
                    </el-form-item>
                  </el-col>
                </el-row>

                <el-row v-if="quickExpiryOption !== 'custom'" :gutter="16" style="margin-top:-8px">
                  <el-col :span="12">
                    <el-form-item label="Hạn sử dụng mới (tính toán)">
                      <el-input :value="quickNewExpiry ? formatDate(quickNewExpiry) : '-'" disabled style="width:100%" />
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="Hạn hiện tại">
                      <el-input :value="quickCurrentExpiry ? formatDate(quickCurrentExpiry) : '-'" disabled style="width:100%" />
                    </el-form-item>
                  </el-col>
                </el-row>

                <el-row v-if="quickSelectedConversion !== null" :gutter="16" style="margin-top:4px">
                  <el-col :span="24">
                    <div class="quick-conversion-box">
                      <i class="fas fa-exchange-alt"></i>
                      <span>Số lượng quy đổi: <strong>{{ quickSelectedConversion }}</strong></span>
                    </div>
                  </el-col>
                </el-row>
              </el-form>
            </div>
          </template>
          <template #footer>
            <el-button @click="quickDialog = false">Hủy</el-button>
            <el-button :loading="quickLoading" type="primary" @click="doQuickChange">Cập nhật</el-button>
          </template>
        </el-dialog>

    <!-- Split Lot Dialog -->
    <el-dialog v-model="splitDialog" title="Tách lô" width="900px" class="split-lot-dialog" top="2vh" :close-on-click-modal="false">
      <div class="split-container">
        <!-- Header Info -->
        <div class="split-header">
          <div class="header-title">
            <i class="fas fa-cut"></i>
            <span>Tạo phiếu quy đổi tách lô</span>
          </div>
        </div>

        <!-- Form Section -->
        <el-form :model="splitForm" label-width="120px" class="split-form">
          <!-- Employee Selection -->
          <div class="form-section">
            <h4 class="section-title">Thông tin chung</h4>
            <el-form-item label="Nhân viên" required>
              <el-input
                :value="(employeeFullName || splitUserDisplayName) || (authStore.user ? (authStore.user.HoTen || authStore.user.TenDangNhap || authStore.user.MaNV) : '')"
                disabled
              />
            </el-form-item>
            <el-form-item label="Ghi chú chung">
              <el-input 
                v-model="splitForm.ghiChu" 
                type="textarea" 
                :rows="3" 
                placeholder="Ghi chú cho toàn bộ phiếu quy đổi"
              />
            </el-form-item>
          </div>

          <!-- Items Section -->
          <div class="form-section">
            <div class="section-header">
              <h4 class="section-title">Danh sách thuốc tách lô</h4>
              <el-button type="primary" size="small" @click="addSplitItem">
                <i class="fas fa-plus"></i>
                Thêm thuốc
              </el-button>
            </div>

            <div class="items-container">
              <div 
                v-for="(item, index) in splitForm.items" 
                :key="index" 
                class="split-item-card"
              >
                <div class="item-header">
                  <span class="item-number">{{ index + 1 }}</span>
                  <el-button 
                    type="danger" 
                    size="small" 
                    text 
                    @click="removeSplitItem(index)"
                    v-if="splitForm.items.length > 1"
                  >
                    <i class="fas fa-trash"></i>
                  </el-button>
                </div>

                <div class="item-form">
                  <div class="form-row">
                    <el-form-item label="Thuốc" class="form-item-half">
                      <el-select v-model="item.maThuoc" filterable placeholder="Chọn thuốc" style="width:100%">
                        <el-option
                          v-for="d in allDrugs"
                          :key="d.maThuoc"
                          :label="d.tenThuoc"
                          :value="d.maThuoc"
                        />
                      </el-select>
                    </el-form-item>
                    <el-form-item label="Số lượng gốc" class="form-item-half">
                      <el-input-number v-model="item.soLuongGoc" :min="0" controls-position="right" />
                    </el-form-item>
                  </div>

                  <div class="form-row">
                    <el-form-item label="Tỷ lệ quy đổi" class="form-item-half">
                      <el-input-number v-model="item.tyLeQuyDoi" :min="0" :step="0.1" controls-position="right" />
                    </el-form-item>
                    <el-form-item label="Số lượng quy đổi" class="form-item-half">
                      <el-input-number v-model="item.soLuongQuyDoi" :min="0" controls-position="right" />
                    </el-form-item>
                  </div>

                  <div class="form-row">
                    <el-form-item label="Đơn vị gốc" class="form-item-half">
                      <el-input v-model="item.maLoaiDonViGoc" placeholder="Mã đơn vị gốc" />
                    </el-form-item>
                    <el-form-item label="Đơn vị mới" class="form-item-half">
                      <el-input v-model="item.maLoaiDonViMoi" placeholder="Mã đơn vị mới" />
                    </el-form-item>
                  </div>

                  <div class="form-row">
                    <el-form-item label="Hạn sử dụng mới" class="form-item-half">
                      <el-date-picker
                        v-model="item.hanSuDungMoi"
                        type="datetime"
                        placeholder="Chọn hạn sử dụng"
                        format="DD/MM/YYYY HH:mm"
                        value-format="YYYY-MM-DDTHH:mm:ss.sssZ"
                      />
                    </el-form-item>
                    <el-form-item label="Ghi chú" class="form-item-half">
                      <el-input v-model="item.ghiChu" placeholder="Ghi chú cho thuốc này" />
                    </el-form-item>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Form Actions -->
          <div class="form-actions">
            <el-button @click="splitDialog = false" size="large">Hủy</el-button>
            <el-button type="primary" @click="submitSplitForm" size="large" :loading="splitLoading">
              <i class="fas fa-save"></i>
              Tạo phiếu quy đổi
            </el-button>
          </div>
        </el-form>
      </div>
    </el-dialog>

    <el-dialog v-model="viewDialog" width="85%" title="Chi tiết lô" class="lot-detail-dialog" top="2vh" :close-on-click-modal="false">
      <template #default>
        <!-- Lot Information Card -->
        <div class="lot-info-header">
          <div class="lot-header-main">
            <div class="lot-code">
              <i class="fas fa-box"></i>
              <span>{{ viewRowData && viewRowData.maLo }}</span>
            </div>
            <div class="lot-drug">
              <span class="drug-code">{{ viewRowData && viewRowData.maThuoc }}</span>
              <span class="drug-name">{{ viewRowData && viewRowData.tenThuoc }}</span>
            </div>
          </div>
          <div class="lot-stats">
            <div class="stat-item">
              <div class="stat-label">Đơn vị</div>
              <div class="stat-value">{{ viewRowData && (viewRowData.tenLoaiDonViGoc || viewRowData.tenLoaiDonViLe) }}</div>
            </div>
            <div class="stat-item">
              <div class="stat-label">Số lượng</div>
              <div class="stat-value quantity">{{ viewRowData && (viewRowData.soLuongCon ?? viewRowData.soLuongConLe) }}</div>
            </div>
            <div class="stat-item">
              <div class="stat-label">Hạn sử dụng</div>
              <div class="stat-value expiry">{{ viewRowData && formatDate(viewRowData.hanSuDung) }}</div>
            </div>
          </div>
        </div>

        <!-- Additional Info -->
        <div class="lot-additional-info" v-if="viewRowData && viewRowData.ghiChu">
          <div class="info-label">
            <i class="fas fa-sticky-note"></i>
            Ghi chú
          </div>
          <div class="info-content">{{ viewRowData.ghiChu }}</div>
        </div>

        <!-- History Section -->
        <div class="history-section">
          <div class="section-header">
            <i class="fas fa-history"></i>
            <span>Lịch sử hoạt động</span>
          </div>
          <div class="history-content" v-loading="historyLoading">
            <div 
              class="history-horizontal" 
              v-if="lotHistory && lotHistory.length > 0"
              @mousedown="startDrag"
              @mousemove="onDrag"
              @mouseup="endDrag"
              @mouseleave="endDrag"
            >
              <div 
                v-for="(it, idx) in lotHistory" 
                :key="idx" 
                class="history-card"
                :style="{ borderLeftColor: getEventColor(it.Type||it.type) }"
              >
                <div class="card-header">
                  <div class="event-type">
                    <i :class="getEventIcon(it.Type||it.type)" :style="{ color: getEventColor(it.Type||it.type) }"></i>
                    <span>{{ getEventTypeName(it.Type||it.type) }}</span>
                  </div>
                  <div class="event-date">{{ formatDate((it.EventDate||it.eventDate)) }}</div>
                </div>
                
                <div class="card-content" v-if="(it.Phieu || it.phieu) && (it.ChiTiet || it.chiTiet)">
                  <div class="detail-row">
                    <span class="detail-label">Mã phiếu:</span>
                    <span class="detail-value">{{ getPhieuCode(it.Phieu||it.phieu) }}</span>
                  </div>
                  <div class="detail-items">
                    <div class="detail-item">
                      <span class="detail-label">Lô gốc:</span>
                      <span class="detail-value">{{ getLoGoc(it.ChiTiet||it.chiTiet) }}</span>
                    </div>
                    <div class="detail-item" v-if="getLoMoi(it.ChiTiet||it.chiTiet) !== '-'">
                      <span class="detail-label">Lô mới:</span>
                      <span class="detail-value">{{ getLoMoi(it.ChiTiet||it.chiTiet) }}</span>
                    </div>
                    <div class="detail-item">
                      <span class="detail-label">Mã thuốc:</span>
                      <span class="detail-value">{{ getMaThuoc(it.ChiTiet||it.chiTiet) }}</span>
                    </div>
                    <div class="detail-item" v-if="getSoLuong(it.ChiTiet||it.chiTiet) !== '-'">
                      <span class="detail-label">Số lượng:</span>
                      <span class="detail-value">{{ getSoLuong(it.ChiTiet||it.chiTiet) }}</span>
                    </div>
                  </div>
                </div>
                
                <div class="card-fallback" v-else>
                  <pre>{{ JSON.stringify(it, null, 2) }}</pre>
                </div>
              </div>
            </div>
            
            <div v-if="!lotHistory || lotHistory.length === 0" class="no-history">
              <i class="fas fa-inbox"></i>
              <span>Chưa có lịch sử hoạt động</span>
            </div>
          </div>
        </div>
      </template>
      <template #footer>
        <el-button type="primary" @click="closeView" size="large">Đóng</el-button>
      </template>
    </el-dialog>
  </el-card>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import api from '@/api/axios';
import { ElMessage } from 'element-plus';
import { useAuthStore } from '@/store';
import nhanvienApi from '@/api/nhanvien';

const activeTab = ref('chuaTachLe');

// Lists and loading
const chuaList = ref([]);
const daList = ref([]);
const loadingChua = ref(false);
const loadingDa = ref(false);

// Selected status filters: 'all' | '1' | '0'
// Default to '1' (Lô đang dùng) so page initially shows lots with SoLuongCon > 0
const selectedChua = ref('1');
const selectedDa = ref('1');

// Drug selects per tab (client-side filtering)
const selectedDrugChua = ref('all');
const selectedDrugDa = ref('all');

// Unit selects per tab
const selectedUnitChua = ref('all');
const selectedUnitDa = ref('all');

// Derive unique drug options from the lists
const chuaDrugs = computed(() => {
  const map = new Map();
  (chuaList.value || []).forEach((r) => {
    if (!map.has(r.maThuoc)) map.set(r.maThuoc, { maThuoc: r.maThuoc, tenThuoc: r.tenThuoc });
  });
  return Array.from(map.values());
});

const daDrugs = computed(() => {
  const map = new Map();
  (daList.value || []).forEach((r) => {
    if (!map.has(r.maThuoc)) map.set(r.maThuoc, { maThuoc: r.maThuoc, tenThuoc: r.tenThuoc });
  });
  return Array.from(map.values());
});

// Merge chuaDrugs + daDrugs to provide a full drug list for selects
const allDrugs = computed(() => {
  const map = new Map();
  (chuaDrugs.value || []).forEach((d) => { if (!map.has(d.maThuoc)) map.set(d.maThuoc, d); });
  (daDrugs.value || []).forEach((d) => { if (!map.has(d.maThuoc)) map.set(d.maThuoc, d); });
  return Array.from(map.values());
});

// Derive unique unit options
const chuaUnits = computed(() => {
  const map = new Map();
  (chuaList.value || []).forEach((r) => {
    if (r.donViGoc) map.set(r.donViGoc, { code: r.donViGoc, name: r.tenLoaiDonViGoc || r.donViGoc });
  });
  return Array.from(map.values());
});

const daUnits = computed(() => {
  const map = new Map();
  (daList.value || []).forEach((r) => {
    if (r.donViLe) map.set(r.donViLe, { code: r.donViLe, name: r.tenLoaiDonViLe || r.donViLe });
  });
  return Array.from(map.values());
});

// Per-drug unit options (fetched from /Thuoc/{maThuoc}/GiaThuocs)
const quickUnits = ref([]);

const fetchQuickUnits = async (maThuoc) => {
  try {
    if (!maThuoc) {
      quickUnits.value = [];
      return;
    }
    const res = await api.get(`/Thuoc/${maThuoc}/GiaThuocs`);
    const list = (res.data && res.data.data) || res.data || [];
    // Map API items to { code, name, soLuong }
    quickUnits.value = (list || []).map((it) => ({
      code: it.maLoaiDonVi || it.maLoaiDonViMoi || it.maLoaiDonViMoi,
      name: it.tenLoaiDonVi || it.tenLoaiDonViMoi || it.tenLoaiDonVi,
      soLuong: it.soLuong ?? 1,
    }));
  } catch (err) {
    console.error('fetchQuickUnits error', err);
    quickUnits.value = [];
  }
};

const quickSelectedConversion = computed(() => {
  const sel = quickUnits.value.find((u) => u.code === quickNewUnit.value);
  return sel ? sel.soLuong : null;
});

// Filtered lists for display
const filteredChuaList = computed(() => {
  let list = chuaList.value || [];
  if (selectedDrugChua.value && selectedDrugChua.value !== 'all') {
    list = list.filter((r) => r.maThuoc === selectedDrugChua.value);
  }
  if (selectedUnitChua.value && selectedUnitChua.value !== 'all') {
    list = list.filter((r) => r.donViGoc === selectedUnitChua.value);
  }
  return list;
});

const filteredDaList = computed(() => {
  let list = daList.value || [];
  if (selectedDrugDa.value && selectedDrugDa.value !== 'all') {
    list = list.filter((r) => r.maThuoc === selectedDrugDa.value);
  }
  if (selectedUnitDa.value && selectedUnitDa.value !== 'all') {
    list = list.filter((r) => r.donViLe === selectedUnitDa.value);
  }
  return list;
});

// Pagination state (10 rows per page)
const pageSize = 10;
const pageChua = ref(1);
const pageDa = ref(1);

const paginatedChua = computed(() => {
  const start = (pageChua.value - 1) * pageSize;
  return (filteredChuaList.value || []).slice(start, start + pageSize);
});

const paginatedDa = computed(() => {
  const start = (pageDa.value - 1) * pageSize;
  return (filteredDaList.value || []).slice(start, start + pageSize);
});

// Reset page to 1 when filters change (so user sees first page of results)
watch(() => filteredChuaList.value.length, (n) => { pageChua.value = 1; });
watch(() => filteredDaList.value.length, (n) => { pageDa.value = 1; });

// Expiry selection state (declare before watcher to avoid TDZ)
const quickExpiryOption = ref('custom'); // 'custom' | '3' | '6' | '9'
const quickCurrentExpiry = ref(null);
const quickExpiryError = ref('');

// Auto-calculate expiry when option changes
const calculateQuickExpiry = () => {
  if (quickExpiryOption.value === 'custom') {
    quickNewExpiry.value = quickCurrentExpiry.value ? new Date(quickCurrentExpiry.value) : null;
    return;
  }
  
  if (!quickCurrentExpiry.value) return;
  
  const months = parseInt(quickExpiryOption.value);
  const baseDate = new Date(quickCurrentExpiry.value);
  const newDate = new Date(baseDate);
  newDate.setMonth(newDate.getMonth() - months);
  quickNewExpiry.value = newDate;
  validateQuickExpiry();
};

watch(() => quickExpiryOption.value, calculateQuickExpiry);

const validateQuickExpiry = () => {
  quickExpiryError.value = '';
  if (!quickNewExpiry.value || !quickCurrentExpiry.value) return;
  
  const newTime = new Date(quickNewExpiry.value).getTime();
  const currentTime = new Date(quickCurrentExpiry.value).getTime();
  
  if (newTime > currentTime) {
    quickExpiryError.value = 'Hạn sử dụng mới không được lớn hơn hạn hiện tại';
  }
};

const fetchChuaTachLe = async () => {
  loadingChua.value = true;
  try {
    const params = {};
    if (selectedChua.value === '1' || selectedChua.value === '0') params.status = Number(selectedChua.value);
    const res = await api.get('/ThuocView/ChuaTachLe', { params });
    chuaList.value = res.data || [];
  } catch (err) {
    console.error(err);
    ElMessage.error('Lấy dữ liệu Chưa tách lẻ thất bại');
  } finally {
    loadingChua.value = false;
  }
};

const fetchDaTachLe = async () => {
  loadingDa.value = true;
  try {
    const params = {};
    if (selectedDa.value === '1' || selectedDa.value === '0') params.status = Number(selectedDa.value);
    const res = await api.get('/ThuocView/DaTachLe', { params });
    daList.value = res.data || [];
  } catch (err) {
    console.error(err);
    ElMessage.error('Lấy dữ liệu Đã tách lẻ thất bại');
  } finally {
    loadingDa.value = false;
  }
};

const formatDate = (d) => {
  if (!d) return '';
  try {
    const dt = new Date(d);
    return dt.toLocaleDateString();
  } catch (e) {
    return d;
  }
};

const truncateWords = (text, maxWords = 15) => {
  if (!text) return '';
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length <= maxWords) return text;
  return words.slice(0, maxWords).join(' ') + '...';
};

onMounted(() => {
  fetchChuaTachLe();
  fetchDaTachLe();
  // Prefetch employee full name early and set display name when available
  try {
    fetchEmployeeFullName().then((n) => {
      if (n) splitUserDisplayName.value = n;
    }).catch(() => {});
  } catch (e) {
    // ignore
  }
});



// Quick change and view dialogs
const quickDialog = ref(false);
const quickRow = ref(null);
const quickValue = ref(0);
const quickNewUnit = ref('');
const quickNewExpiry = ref(null);
const quickNote = ref('');
const quickLoading = ref(false);

const viewDialog = ref(false);
const viewRowData = ref(null);
const lotHistory = ref([]);
const historyLoading = ref(false);

const authStore = useAuthStore();

// Split lot form
const splitDialog = ref(false);
const splitLoading = ref(false);
const splitForm = ref({
  items: [{
    maThuoc: '',
    soLuongGoc: 0,
    tyLeQuyDoi: 0,
    soLuongQuyDoi: 0,
    maLoaiDonViGoc: '',
    maLoaiDonViMoi: '',
    hanSuDungMoi: '',
    ghiChu: ''
  }],
  maNV: '',
  ghiChu: ''
});

const splitUserDisplayName = ref('');
const employeeFullName = ref('');

// Fetch employee full name helper: prefer authStore.user.HoTen, otherwise fetch from API
const fetchEmployeeFullName = async (maNV) => {
  try {
    const u = authStore.user;
    // If auth store already has a full name, use it
    if (u && (u.HoTen || u.HoVaTen)) {
      employeeFullName.value = u.HoTen || u.HoVaTen;
      return employeeFullName.value;
    }

    // Determine maNV to query
    const id = maNV || (u && (u.MaNV || u.maNV || u.MaTK || u.maTK)) || '';
    if (!id) {
      // fallback to username
      employeeFullName.value = u ? (u.TenDangNhap || u.username || '') : '';
      return employeeFullName.value;
    }

    // call nhanvien API
    const res = await nhanvienApi.getById(id);
    const data = res?.data || res;
    const name = data?.HoTen || data?.hoTen || data?.HoVaTen || data?.hovaten || data?.Ten || data?.ten || data?.FullName || data?.fullName || '';
    employeeFullName.value = name || (u ? (u.TenDangNhap || u.username || '') : '');
    return employeeFullName.value;
  } catch (err) {
    const u = authStore.user;
    employeeFullName.value = u ? (u.HoTen || u.TenDangNhap || u.username || '') : '';
    return employeeFullName.value;
  }
};

// Drag scroll functionality
const isDragging = ref(false);
const startX = ref(0);
const scrollLeft = ref(0);

// Helper: can this row be quick-changed? (stock > 0)
const canQuickChange = (row) => {
  if (!row) return false;
  const qty = (row.soLuongCon ?? row.soLuongConLe ?? 0);
  return Number(qty) > 0;
};

const quickChange = async (row) => {
  // Guard: do not open for empty lots
  if (!canQuickChange(row)) {
    ElMessage.warning('Lô đã hết, không thể đổi nhanh');
    return;
  }
  // Only allow quick change on source (chua) rows — guard if needed
  quickRow.value = row;
  quickValue.value = row.soLuongCon ?? (row.soLuongConLe ?? 0);
  // fetch per-drug units and set default unit to matching one
  await fetchQuickUnits(row.maThuoc);
  const list = quickUnits.value || [];
  if (row.donViGoc && list.find((u) => u.code === row.donViGoc)) quickNewUnit.value = row.donViGoc;
  else if (row.donViLe && list.find((u) => u.code === row.donViLe)) quickNewUnit.value = row.donViLe;
  else quickNewUnit.value = list.length ? list[0].code : '';
  // default expiry to existing lot expiry
  quickCurrentExpiry.value = row.hanSuDung ? new Date(row.hanSuDung) : null;
  quickNewExpiry.value = quickCurrentExpiry.value ? new Date(quickCurrentExpiry.value) : null;
  quickNote.value = '';
  quickExpiryOption.value = 'custom';
  quickExpiryError.value = '';
  quickDialog.value = true;
};

const doQuickChange = () => {
  if (!quickRow.value) return;
  
  // Validate expiry before submit
  validateQuickExpiry();
  if (quickExpiryError.value) {
    ElMessage.error(quickExpiryError.value);
    return;
  }
  
  // Call backend quick-convert endpoint
  quickLoading.value = true;
  (async () => {
    try {
      const body = {
        maThuoc: quickRow.value.maThuoc,
        maLoaiDonViMoi: quickNewUnit.value || undefined,
        hanSuDungMoi: quickNewExpiry.value ? new Date(quickNewExpiry.value).toISOString() : undefined,
      };
      await api.post('/PhieuQuyDoi/QuickByMa', body);
      ElMessage.success('Đổi nhanh thành công');
      // Refresh lists
      await fetchChuaTachLe();
      await fetchDaTachLe();
      quickDialog.value = false;
    } catch (err) {
      console.error(err);
      ElMessage.error('Đổi nhanh thất bại');
    } finally {
      quickLoading.value = false;
    }
  })();
};

const viewRow = (row) => {
  viewRowData.value = row;
  // fetch history for this lot
  fetchLotHistory(row.maLo);
  viewDialog.value = true;
};

const closeView = () => {
  viewDialog.value = false;
};

const fetchLotHistory = async (maLo) => {
  historyLoading.value = true;
  lotHistory.value = [];
  try {
    const res = await api.get(`/ThuocView/LichSuLo/${maLo}`);
    lotHistory.value = res.data || [];
  } catch (err) {
    console.error('fetchLotHistory', err);
    ElMessage.error('Lấy lịch sử lô thất bại');
  } finally {
    historyLoading.value = false;
  }
};

// Helper functions for timeline display
const getEventColor = (type) => {
  const colors = {
    'PhieuQuyDoi': '#409eff',
    'PhieuNhap': '#67c23a',
    'PhieuXuat': '#f56c6c',
    'PhieuTon': '#e6a23c'
  };
  return colors[type] || '#909399';
};

const getEventIcon = (type) => {
  const icons = {
    'PhieuQuyDoi': 'fas fa-exchange-alt',
    'PhieuNhap': 'fas fa-plus-circle',
    'PhieuXuat': 'fas fa-minus-circle',
    'PhieuTon': 'fas fa-warehouse'
  };
  return icons[type] || 'fas fa-file';
};

const getEventTypeName = (type) => {
  const names = {
    'PhieuQuyDoi': 'Phiếu quy đổi',
    'PhieuNhap': 'Phiếu nhập',
    'PhieuXuat': 'Phiếu xuất',
    'PhieuTon': 'Phiếu tồn'
  };
  return names[type] || type || 'Sự kiện';
};

const getPhieuCode = (phieu) => {
  return phieu?.MaPhieuQD || phieu?.maPhieuQD || phieu?.MaPhieu || phieu?.maPhieu || phieu?.maPN || phieu?.MaPN || '-';
};

const getLoGoc = (chiTiet) => {
  return chiTiet?.MaLoGoc || chiTiet?.MaLo || chiTiet?.maLoGoc || chiTiet?.maLo || '-';
};

const getLoMoi = (chiTiet) => {
  return chiTiet?.MaLoMoi || chiTiet?.maLoMoi || '-';
};

const getMaThuoc = (chiTiet) => {
  return chiTiet?.MaThuoc || chiTiet?.maThuoc || '-';
};

const getSoLuong = (chiTiet) => {
  return chiTiet?.SoLuongQuyDoi ?? chiTiet?.soLuongQuyDoi ?? chiTiet?.soLuong ?? chiTiet?.SoLuong ?? '-';
};

// Drag scroll functions
const startDrag = (e) => {
  const container = e.currentTarget;
  isDragging.value = true;
  startX.value = e.pageX - container.offsetLeft;
  scrollLeft.value = container.scrollLeft;
  container.style.cursor = 'grabbing';
};

const onDrag = (e) => {
  if (!isDragging.value) return;
  e.preventDefault();
  const container = e.currentTarget;
  const x = e.pageX - container.offsetLeft;
  const walk = (x - startX.value) * 2; // Scroll speed multiplier
  container.scrollLeft = scrollLeft.value - walk;
};

const endDrag = (e) => {
  if (!isDragging.value) return;
  isDragging.value = false;
  const container = e.currentTarget;
  container.style.cursor = 'grab';
};

// Split lot functions
const openSplitDialog = async () => {
  splitForm.value = {
    items: [{
      maThuoc: '',
      soLuongGoc: 0,
      tyLeQuyDoi: 0,
      soLuongQuyDoi: 0,
      maLoaiDonViGoc: '',
      maLoaiDonViMoi: '',
      hanSuDungMoi: '',
      ghiChu: ''
    }],
    maNV: '',
    ghiChu: ''
  };
  // Prefill current logged-in employee (if available)
  try {
    const u = authStore.user;
    if (u) {
      const ma = u.MaNV || u.maNV || u.MaTK || u.maTK || '';
      splitForm.value.maNV = ma;
      // Fetch and set employee full name (uses cache if authStore has it)
      const name = await fetchEmployeeFullName(ma);
      splitUserDisplayName.value = name || (u.TenDangNhap || u.username || '');
    }
  } catch (e) {
    // ignore
  }
  splitDialog.value = true;
};

const addSplitItem = () => {
  splitForm.value.items.push({
    maThuoc: '',
    soLuongGoc: 0,
    tyLeQuyDoi: 0,
    soLuongQuyDoi: 0,
    maLoaiDonViGoc: '',
    maLoaiDonViMoi: '',
    hanSuDungMoi: '',
    ghiChu: ''
  });
};

const removeSplitItem = (index) => {
  if (splitForm.value.items.length > 1) {
    splitForm.value.items.splice(index, 1);
  }
};

const submitSplitForm = async () => {
  try {
    splitLoading.value = true;
    
    // Validate required fields
    if (!splitForm.value.maNV) {
      ElMessage.error('Vui lòng nhập mã nhân viên');
      return;
    }
    
    // Validate items
    for (let i = 0; i < splitForm.value.items.length; i++) {
      const item = splitForm.value.items[i];
      if (!item.maThuoc) {
        ElMessage.error(`Vui lòng nhập mã thuốc cho item ${i + 1}`);
        return;
      }
    }
    
    // Call API
    const response = await axios.post('/api/PhieuQuyDoi/Create', splitForm.value);
    
    if (response.data) {
      ElMessage.success('Tạo phiếu quy đổi thành công!');
      splitDialog.value = false;
      
      // Refresh data
      await fetchData();
    }
    
  } catch (error) {
    console.error('Error creating split lot:', error);
    ElMessage.error('Có lỗi xảy ra khi tạo phiếu quy đổi: ' + (error.response?.data?.message || error.message));
  } finally {
    splitLoading.value = false;
  }
};
</script>

<style scoped>
.controls {
  margin: 12px 0;
  display: flex;
  gap: 8px;
  align-items: center;
}

.status-select {
  min-width: 140px;
}

.drug-select {
  min-width: 220px;
}

/* Popper dropdown for kho selects: make it open below and match a reasonable width */
.kho-select-popper {
  min-width: 260px;
  max-width: 760px;
}

.table-footer {
  display: flex;
  justify-content: flex-end;
  padding-top: 8px;
}

/* Ensure quick dialog input sizing */
.quick-input {
  display: inline-block;
}
.quick-input .el-input-number {
  min-width: 140px;
}

/* Quick dialog redesign styles */
.quick-info-card {
  background-color: var(--el-fill-color-light);
  border: 1px solid var(--el-border-color-light);
  border-radius: 4px;
  padding: 12px;
}

.quick-info-row {
  display: flex;
  gap: 12px;
  margin-bottom: 8px;
  flex-wrap: wrap;
}

.quick-info-row:last-child {
  margin-bottom: 0;
}

.quick-info-col {
  flex: 1;
  min-width: 200px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.quick-info-label {
  font-size: 12px;
  font-weight: 500;
  color: var(--el-text-color-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.quick-info-value {
  font-size: 14px;
  font-weight: 500;
  color: var(--el-text-color-primary);
  word-break: break-word;
}

.quick-conversion-box {
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: var(--el-color-info-light-9);
  border-left: 3px solid var(--el-color-info);
  padding: 8px 12px;
  border-radius: 2px;
  font-size: 13px;
  color: var(--el-color-info);
}

.quick-conversion-box i {
  font-size: 14px;
}

/* Lot Detail Dialog Styles */
.lot-detail-dialog .el-dialog__body {
  padding: 20px;
  max-height: calc(90vh - 120px);
  overflow-y: auto;
}

.lot-info-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 12px;
}

.lot-header-main {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.lot-code {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 24px;
  font-weight: 700;
}

.lot-code i {
  font-size: 28px;
  opacity: 0.9;
}

.lot-drug {
  text-align: right;
  flex: 1;
  margin-left: 20px;
}

.drug-code {
  display: block;
  font-size: 14px;
  opacity: 0.8;
  margin-bottom: 4px;
}

.drug-name {
  display: block;
  font-size: 18px;
  font-weight: 600;
}

.lot-stats {
  display: flex;
  gap: 24px;
  padding-top: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
}

.stat-item {
  flex: 1;
  text-align: center;
}

.stat-label {
  font-size: 12px;
  opacity: 0.8;
  margin-bottom: 4px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-value {
  font-size: 16px;
  font-weight: 600;
}

.stat-value.quantity {
  color: #a8e6cf;
}

.stat-value.expiry {
  color: #ffd3a5;
}

.lot-additional-info {
  background-color: var(--el-fill-color-light);
  border-left: 4px solid var(--el-color-info);
  padding: 12px 16px;
  border-radius: 4px;
  margin-bottom: 12px;
}

.info-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: var(--el-color-info);
  margin-bottom: 8px;
}

.info-content {
  color: var(--el-text-color-regular);
  line-height: 1.5;
}

.history-section {
  margin-top: 12px;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin-bottom: 12px;
  padding-bottom: 6px;
  border-bottom: 2px solid var(--el-border-color-light);
}

.section-header i {
  color: var(--el-color-primary);
}

.history-content {
  padding: 10px;
  background-color: var(--el-fill-color-lighter);
  border-radius: 12px;
  height: 320px;
  overflow: hidden;
}

/* Horizontal History Layout */
.history-horizontal {
  display: flex;
  gap: 16px;
  overflow-x: auto;
  overflow-y: hidden;
  padding: 8px 0 16px 0;
  scrollbar-width: thin;
  scrollbar-color: var(--el-color-primary-light-7) var(--el-fill-color-light);
  cursor: grab;
  user-select: none;
  height: 100%;
  align-items: flex-start;
}

.history-horizontal:active {
  cursor: grabbing;
}

.history-horizontal::-webkit-scrollbar {
  height: 8px;
}

.history-horizontal::-webkit-scrollbar-track {
  background: var(--el-fill-color-light);
  border-radius: 4px;
}

.history-horizontal::-webkit-scrollbar-thumb {
  background: var(--el-color-primary-light-7);
  border-radius: 4px;
}

.history-horizontal::-webkit-scrollbar-thumb:hover {
  background: var(--el-color-primary-light-5);
}

.history-card {
  flex: 0 0 260px;
  background: white;
  border-radius: 12px;
  padding: 14px;
  border-left: 3px solid var(--el-color-primary);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.2s ease;
  border: 1px solid var(--el-border-color-lighter);
  height: auto;
  min-height: 280px;
  display: flex;
  flex-direction: column;
}

.history-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
  border-left-width: 4px;
}

.card-header {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 10px;
  border-bottom: 1px solid var(--el-border-color-lighter);
  padding-bottom: 6px;
}

.event-type {
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 600;
  font-size: 14px;
}

.event-type i {
  font-size: 18px;
}

.event-date {
  font-size: 11px;
  color: var(--el-text-color-secondary);
  background-color: var(--el-fill-color-light);
  padding: 3px 8px;
  border-radius: 8px;
  font-weight: 500;
}

.card-content {
  margin-top: 10px;
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.detail-row {
  display: flex;
  gap: 6px;
  margin-bottom: 8px;
  padding-bottom: 6px;
  border-bottom: 1px solid var(--el-border-color-lighter);
  align-items: center;
}

.detail-items {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  align-items: center;
}

.detail-label {
  font-size: 10px;
  font-weight: 600;
  color: var(--el-text-color-secondary);
  text-transform: uppercase;
  letter-spacing: 0.3px;
  flex-shrink: 0;
}

.detail-value {
  font-size: 12px;
  color: var(--el-text-color-primary);
  background-color: var(--el-fill-color-light);
  padding: 3px 6px;
  border-radius: 6px;
  font-family: monospace;
  text-align: right;
  word-break: break-word;
  font-weight: 500;
}

.card-fallback pre {
  background-color: var(--el-fill-color-lighter);
  padding: 12px;
  border-radius: 4px;
  font-size: 12px;
  line-height: 1.4;
  overflow-x: auto;
}

.no-history {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 40px 20px;
  color: var(--el-text-color-secondary);
  height: 100%;
}

.no-history i {
  font-size: 48px;
  opacity: 0.5;
}

.no-history span {
  font-size: 16px;
}

/* Split Lot Dialog Styles */
.split-lot-dialog .el-dialog__body {
  padding: 20px;
  max-height: calc(90vh - 120px);
  overflow-y: auto;
}

.split-container {
  max-width: 100%;
}

.split-header {
  background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
  color: white;
  padding: 16px 20px;
  border-radius: 8px;
  margin: -20px -20px 20px -20px;
}

.header-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 18px;
  font-weight: 600;
}

.header-title i {
  font-size: 20px;
}

.split-form {
  margin-top: 20px;
}

.form-section {
  margin-bottom: 24px;
  padding: 20px;
  background-color: var(--el-fill-color-lighter);
  border-radius: 8px;
  border-left: 4px solid var(--el-color-success);
}

.section-title {
  color: var(--el-text-color-primary);
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 16px 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.items-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.split-item-card {
  background: white;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  padding: 16px;
  position: relative;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.item-number {
  background: var(--el-color-success);
  color: white;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 14px;
}

.item-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.form-item-half {
  margin-bottom: 0;
}

.form-actions {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid var(--el-border-color-lighter);
}
</style>
