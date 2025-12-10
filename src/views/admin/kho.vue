<template>
  <el-card>
    <h3> Quản lý kho</h3>

    <el-tabs v-model="activeTab">
      <el-tab-pane label="Chưa tách lẻ" name="chuaTachLe">
          <div class="controls">
            <div class="control-with-label">
              <div class="control-label">Trạng thái</div>
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

            </div>

            <!-- removed: search moved next to unit select -->
           
            <div class="control-with-label">
              <div class="control-label">Loại thuốc</div>
              <el-select
                class="type-select"
                v-model="selectedTypeChua"
                placeholder="Loại thuốc"
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
              <el-option v-for="t in chuaTypes" :key="t.code" :label="t.name" :value="t.code" />
            </el-select>
            </div>
           
            <div class="control-with-label">
              <div class="control-label">Đơn vị</div>
              <el-select class="unit-select" v-model="selectedUnitChua" placeholder="Chọn đơn vị" size="small" placement="bottom-start" :teleported="true" :popper-options="{
                 modifiers: [
                   { name: 'flip', options: { fallbackPlacements: [] } },
                   { name: 'preventOverflow', options: { boundary: 'viewport' } }
                 ]
               }" popper-class="kho-select-popper">
               <el-option label="Tất cả" :value="'all'" />
               <el-option v-for="u in chuaUnits" :key="u.code" :label="u.name" :value="u.code" />
             </el-select>
            </div>
            <div class="control-with-label">
              <div class="control-label">Tìm kiếm</div>
              <el-input
                ref="searchChuaRef"
                class="search-input"
                v-model="searchChua"
                placeholder="Tìm theo tên / mã / code / mã lô / loại thuốc"
                clearable
                size="small"
                @clear="searchChua = ''"
              />
            </div>
            <div class="control-with-label control-action">
              <div class="control-label">Hành động</div>
              <div style="display:flex; gap:6px; align-items:center">
                    <el-button size="small" class="split-btn" @click="openSplitDialog">
                      <i class="fas fa-cut"></i>
                      Tách lô
                    </el-button>
                <el-button type="primary" size="small" @click="printChua">
                  <i class="fas fa-print"></i>
                  In
                </el-button>
                <el-button type="warning" size="small" @click="exportChua">
                  <i class="fas fa-file-excel"></i>
                  Xuất Excel
                </el-button>
              </div>
            </div>
          </div>

          <el-table :data="paginatedChua" style="width: 100%" v-loading="loadingChua" stripe :row-style="tableRowStyle">
          <el-table-column prop="maLo" label="Mã Lô" width="180" fixed="left" show-overflow-tooltip />
          <el-table-column prop="maThuoc" label="Mã Thuốc" width="90" />
          <el-table-column prop="code" label="Code" width="150" />
          <el-table-column prop="tenLoaiThuoc" label="Loại Thuốc" width="180" />
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
              <span :style="getExpiryStyle(row.hanSuDung)">{{ formatDate(row.hanSuDung) }}</span>
            </template>
          </el-table-column>
          
          <el-table-column prop="ghiChu" label="Ghi chú" width="160" />
          <el-table-column label="Thao Tác" width="120" align="center" fixed="right">
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
            <div class="control-with-label">
              <div class="control-label">Trạng thái</div>
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
            </div>

          <!-- removed: search moved next to unit select -->
           
            <div class="control-with-label">
              <div class="control-label">Loại thuốc</div>
              <el-select
                class="type-select"
              v-model="selectedTypeDa"
              placeholder="Loại thuốc"
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
              <el-option v-for="t in daTypes" :key="t.code" :label="t.name" :value="t.code" />
            </el-select>
            </div>
         
           <div class="control-with-label">
             <div class="control-label">Đơn vị</div>
             <el-select class="unit-select" v-model="selectedUnitDa" placeholder="Chọn đơn vị" size="small" placement="bottom-start" :teleported="true" :popper-options="{
                 modifiers: [
                   { name: 'flip', options: { fallbackPlacements: [] } },
                   { name: 'preventOverflow', options: { boundary: 'viewport' } }
                 ]
               }" popper-class="kho-select-popper">
               <el-option label="Tất cả" :value="'all'" />
               <el-option v-for="u in daUnits" :key="u.code" :label="u.name" :value="u.code" />
             </el-select>
           </div>
           <div class="control-with-label">
             <div class="control-label">Tìm kiếm</div>
             <el-input
               ref="searchDaRef"
               class="search-input"
               v-model="searchDa"
               placeholder="Tìm theo tên / mã / code / mã lô / loại thuốc"
               clearable
               size="small"
               @clear="searchDa = ''"
             />
           </div>
          <div class="control-with-label control-action">
            <div class="control-label">Hành động</div>
            <div style="display:flex; gap:6px; align-items:center">
              <el-tooltip content="Không thể tách lô ở tab 'Đã tách lẻ'" placement="top">
                <el-button type="success" size="small" :disabled="true">
                  <i class="fas fa-cut"></i>
                  Tách lô
                </el-button>
              </el-tooltip>
              <el-button type="primary" size="small" @click="printDa">
                <i class="fas fa-print"></i>
                In
              </el-button>
              <el-button type="warning" size="small" @click="exportDa">
                <i class="fas fa-file-excel"></i>
                Xuất Excel
              </el-button>
            </div>
          </div>
        </div>

        <el-table :data="paginatedDa" style="width: 100%" v-loading="loadingDa" stripe :row-style="tableRowStyle">
          <el-table-column prop="maLo" label="Mã Lô" width="180" fixed="left" show-overflow-tooltip />
          <el-table-column prop="maThuoc" label="Mã Thuốc" width="90" />
          <el-table-column prop="code" label="Code" width="160" />
          <el-table-column prop="tenLoaiThuoc" label="Loại Thuốc" width="180" />
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
              <span :style="getExpiryStyle(row.hanSuDung)">{{ formatDate(row.hanSuDung) }}</span>
            </template>
          </el-table-column>
          
          <el-table-column prop="ghiChu" label="Ghi chú" width="260" />
          <el-table-column label="Thao Tác" width="120" align="center" fixed="right">
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
                @click="handleHistoryClick(it)"
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
    
    <!-- Dialog: Chi tiết phiếu nhập -->
    <el-dialog v-model="phieuDialog" width="80%" title="Chi tiết phiếu nhập" :close-on-click-modal="false">
      <template #default>
        <div v-if="phieuLoading" style="text-align:center;padding:20px">Đang tải...</div>
        <div v-else-if="phieuDetail && phieuDetail.phieuNhap">
          <div style="margin-bottom:12px">
            <strong>Mã phiếu:</strong> {{ phieuDetail.phieuNhap.maPN }} &nbsp; 
            <strong>Ngày nhập:</strong> {{ formatDate(phieuDetail.phieuNhap.ngayNhap) }} &nbsp; 
            <strong>Nhà cung cấp:</strong> {{ phieuDetail.phieuNhap.tenNCC }} &nbsp; 
            <strong>Nhân viên:</strong> {{ phieuDetail.phieuNhap.tenNV }}
          </div>
          <el-table :data="phieuDetail.chiTiet || []" stripe style="width:100%">
            <el-table-column prop="maCTPN" label="Mã CTPN" width="160" />
            <el-table-column prop="maThuoc" label="Mã Thuốc" width="100" />
            <el-table-column label="Tên Thuốc" min-width="420" show-overflow-tooltip>
              <template #default="{ row }">{{ row.tenThuoc }}</template>
            </el-table-column>
            <el-table-column prop="tenLoaiDonVi" label="Đơn vị" width="120" />
            <el-table-column prop="soLuong" label="Số lượng" width="100" />
            <el-table-column prop="donGia" label="Đơn giá" width="120" />
            <el-table-column prop="thanhTien" label="Thành tiền" width="140" />
            <el-table-column prop="hanSuDung" label="Hạn sử dụng" width="140">
              <template #default="{ row }">{{ formatDate(row.hanSuDung) }}</template>
            </el-table-column>
            <el-table-column prop="maLo" label="Mã lô" width="180" />
          </el-table>
        </div>
        <div v-else>
          <div>Không có dữ liệu phiếu nhập</div>
        </div>
      </template>
      <template #footer>
        <el-button type="primary" @click="phieuDialog = false">Đóng</el-button>
      </template>
    </el-dialog>
  </el-card>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, watch, nextTick } from 'vue';
import api from '@/api/axios';
import { ElMessage } from 'element-plus';
import { useAuthStore } from '@/store';
import nhanvienApi from '@/api/nhanvien';

// Resolve logo assets (Vite) for print — primary favicon, fallback logo
const logoPrimary = (() => {
  try {
    return new URL('../../assets/img/logo/favicon.png', import.meta.url).href;
  } catch (e) {
    return '';
  }
})();
const logoFallback = (() => {
  try {
    return new URL('../../assets/img/logo/logo.png', import.meta.url).href;
  } catch (e) {
    return '';
  }
})();
const logoUrl = logoPrimary || logoFallback || '';

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

// Type selects per tab (loại thuốc)
const selectedTypeChua = ref('all');
const selectedTypeDa = ref('all');
// Text search per tab (search by tên thuốc / mã / loại)
const searchChua = ref('');
const searchDa = ref('');

// Refs cho ô tìm kiếm (để focus khi quét barcode)
const searchChuaRef = ref(null);
const searchDaRef = ref(null);

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

// Derive unique type options (maLoaiThuoc / tenLoaiThuoc)
const chuaTypes = computed(() => {
  const map = new Map();
  (chuaList.value || []).forEach((r) => {
    if (r.maLoaiThuoc) map.set(r.maLoaiThuoc, { code: r.maLoaiThuoc, name: r.tenLoaiThuoc || r.maLoaiThuoc });
  });
  return Array.from(map.values());
});

const daTypes = computed(() => {
  const map = new Map();
  (daList.value || []).forEach((r) => {
    if (r.maLoaiThuoc) map.set(r.maLoaiThuoc, { code: r.maLoaiThuoc, name: r.tenLoaiThuoc || r.maLoaiThuoc });
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
    const r = (res && res.data) ? res.data : res;
    // API sometimes returns { data: { giaThuocs: [...] } } or { giaThuocs: [...] }
    let list = [];
    if (r && r.data && Array.isArray(r.data.giaThuocs)) list = r.data.giaThuocs;
    else if (r && Array.isArray(r.giaThuocs)) list = r.giaThuocs;
    else if (Array.isArray(r)) list = r;

    // Map API items to { code, name, soLuong }
    quickUnits.value = (list || []).map((it) => ({
      code: it.maLoaiDonVi || it.maLoaiDonViMoi || it.maLoaiDonVi || it.maGiaThuoc || null,
      name: it.tenLoaiDonVi || it.tenLoaiDonViMoi || it.tenLoaiDonVi || it.tenDonVi || '',
      soLuong: (it.soLuong ?? it.SoLuong) ?? 1,
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
  if (searchChua.value && searchChua.value.trim() !== '') {
    const q = searchChua.value.trim().toLowerCase();
    list = list.filter((r) => {
      return (
        (r.tenThuoc || '').toString().toLowerCase().includes(q) ||
        (r.maThuoc || '').toString().toLowerCase().includes(q) ||
        (r.code || '').toString().toLowerCase().includes(q) ||
        (r.tenLoaiThuoc || '').toString().toLowerCase().includes(q) ||
        (r.maLoaiThuoc || '').toString().toLowerCase().includes(q) ||
        (r.maLo || '').toString().toLowerCase().includes(q)
      );
    });
  }
  if (selectedTypeChua.value && selectedTypeChua.value !== 'all') {
    list = list.filter((r) => (r.maLoaiThuoc || '').toString() === selectedTypeChua.value);
  }
  if (selectedUnitChua.value && selectedUnitChua.value !== 'all') {
    list = list.filter((r) => r.donViGoc === selectedUnitChua.value);
  }
  // sort by maThuoc then by hanSuDung (expiry) ascending
  list = list.slice().sort((a, b) => {
    const aCode = (a.maThuoc || '').toString().toLowerCase();
    const bCode = (b.maThuoc || '').toString().toLowerCase();
    if (aCode < bCode) return -1;
    if (aCode > bCode) return 1;
    const aDate = new Date(a.hanSuDung || a.HanSuDung || null);
    const bDate = new Date(b.hanSuDung || b.HanSuDung || null);
    const aTime = Number.isNaN(aDate.getTime()) ? 0 : aDate.getTime();
    const bTime = Number.isNaN(bDate.getTime()) ? 0 : bDate.getTime();
    return aTime - bTime;
  });
  return list;
});

const filteredDaList = computed(() => {
  let list = daList.value || [];
  if (searchDa.value && searchDa.value.trim() !== '') {
    const q = searchDa.value.trim().toLowerCase();
    list = list.filter((r) => {
      return (
        (r.tenThuoc || '').toString().toLowerCase().includes(q) ||
        (r.maThuoc || '').toString().toLowerCase().includes(q) ||
        (r.code || '').toString().toLowerCase().includes(q) ||
        (r.tenLoaiThuoc || '').toString().toLowerCase().includes(q) ||
        (r.maLoaiThuoc || '').toString().toLowerCase().includes(q) ||
        (r.maLo || '').toString().toLowerCase().includes(q)
      );
    });
  }
  if (selectedTypeDa.value && selectedTypeDa.value !== 'all') {
    list = list.filter((r) => (r.maLoaiThuoc || '').toString() === selectedTypeDa.value);
  }
  if (selectedUnitDa.value && selectedUnitDa.value !== 'all') {
    list = list.filter((r) => r.donViLe === selectedUnitDa.value);
  }
  // sort by maThuoc then by hanSuDung ascending
  list = list.slice().sort((a, b) => {
    const aCode = (a.maThuoc || '').toString().toLowerCase();
    const bCode = (b.maThuoc || '').toString().toLowerCase();
    if (aCode < bCode) return -1;
    if (aCode > bCode) return 1;
    const aDate = new Date(a.hanSuDung || a.HanSuDung || null);
    const bDate = new Date(b.hanSuDung || b.HanSuDung || null);
    const aTime = Number.isNaN(aDate.getTime()) ? 0 : aDate.getTime();
    const bTime = Number.isNaN(bDate.getTime()) ? 0 : bDate.getTime();
    return aTime - bTime;
  });
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

const getExpiryStyle = (d) => {
  if (!d) return {};
  try {
    const expiry = new Date(d);
    const now = new Date();
    const diffTime = expiry.getTime() - now.getTime();
    const diffDays = diffTime / (1000 * 3600 * 24);

    // Expired or within 10 days
    if (diffDays <= 10) {
      return { color: 'red', fontWeight: 'bold' };
    }
    
    // Within 2 months (approx 60 days)
    if (diffDays <= 60) {
      return { color: 'purple', fontWeight: 'bold' };
    }
    
    return {};
  } catch (e) {
    return {};
  }
};

const tableRowStyle = ({ row }) => {
  return getExpiryStyle(row.hanSuDung);
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
  
  // Barcode scanner listener - nhận quét mã khi không focus vào input
  document.addEventListener('keydown', handleBarcodeScanner);
});

onUnmounted(() => {
  document.removeEventListener('keydown', handleBarcodeScanner);
});

// Barcode scanner variables
let barcodeBuffer = '';
let barcodeTimeout = null;

const handleBarcodeScanner = (event) => {
  // Bỏ qua nếu đang focus vào input, textarea
  const activeElement = document.activeElement;
  const isInputFocused = activeElement && (
    activeElement.tagName === 'INPUT' || 
    activeElement.tagName === 'TEXTAREA' ||
    activeElement.isContentEditable
  );
  
  // Nếu đang focus vào input thì không xử lý (để input tự nhận)
  if (isInputFocused) {
    return;
  }
  
  // Nếu dialog đang mở thì không xử lý
  if (quickDialog.value || viewDialog.value || splitDialog.value) {
    return;
  }
  
  // Barcode scanner thường gửi ký tự rất nhanh và kết thúc bằng Enter
  if (event.key === 'Enter') {
    if (barcodeBuffer.length >= 3) {
      const scannedCode = barcodeBuffer;
      // Clear mã cũ trước, sau đó điền mã mới
      if (activeTab.value === 'chuaTachLe') {
        searchChua.value = '';
        nextTick(() => {
          searchChua.value = scannedCode;
          // Blur khỏi ô tìm kiếm để lần quét sau không bị nối tiếp
          if (searchChuaRef.value && searchChuaRef.value.blur) {
            searchChuaRef.value.blur();
          }
          // Blur input element bên trong
          document.activeElement?.blur();
        });
      } else if (activeTab.value === 'daTachLe') {
        searchDa.value = '';
        nextTick(() => {
          searchDa.value = scannedCode;
          // Blur khỏi ô tìm kiếm để lần quét sau không bị nối tiếp
          if (searchDaRef.value && searchDaRef.value.blur) {
            searchDaRef.value.blur();
          }
          // Blur input element bên trong
          document.activeElement?.blur();
        });
      }
      console.debug('[BarcodeScanner] Scanned code:', scannedCode);
    }
    barcodeBuffer = '';
    clearTimeout(barcodeTimeout);
    return;
  }
  
  // Chỉ nhận ký tự có thể in được (không phải Shift, Ctrl, etc.)
  if (event.key.length === 1 && !event.ctrlKey && !event.altKey && !event.metaKey) {
    barcodeBuffer += event.key;
    
    // Reset buffer sau 100ms nếu không có ký tự mới (người dùng gõ tay chậm)
    clearTimeout(barcodeTimeout);
    barcodeTimeout = setTimeout(() => {
      barcodeBuffer = '';
    }, 100);
  }
};

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
        maLoaiDonViGoc: quickRow.value.maLoaiDonViGoc || quickRow.value.donViGoc || quickRow.value.maLoaiDonVi || quickRow.value.maDonViGoc || undefined,
        maLoaiDonViMoi: quickNewUnit.value || undefined,
        hanSuDungMoi: quickNewExpiry.value ? new Date(quickNewExpiry.value).toISOString() : undefined,
        maLoGoc: quickRow.value.maLo || undefined,
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
    // New structure: { phieu: {...}, lichSu: [...] }
    if (res.data && res.data.lichSu) {
      lotHistory.value = res.data.lichSu || [];
      
      // Update viewRowData with fresh info from 'phieu' if available
      if (res.data.phieu && viewRowData.value) {
        // Merge fresh data but keep existing display names (tenThuoc, tenLoaiDonVi, etc.)
        // The API 'phieu' has: maLo, maThuoc, soLuongCon, hanSuDung, ghiChu, etc.
        viewRowData.value = {
          ...viewRowData.value,
          soLuongCon: res.data.phieu.soLuongCon ?? viewRowData.value.soLuongCon,
          soLuongConLe: res.data.phieu.soLuongCon ?? viewRowData.value.soLuongConLe, // update both just in case
          hanSuDung: res.data.phieu.hanSuDung || viewRowData.value.hanSuDung,
          ghiChu: res.data.phieu.ghiChu || viewRowData.value.ghiChu
        };
      }
    } else {
      // Fallback for old structure (array)
      lotHistory.value = Array.isArray(res.data) ? res.data : [];
    }
  } catch (err) {
    console.error('fetchLotHistory', err);
    ElMessage.error('Lấy lịch sử lô thất bại');
  } finally {
    historyLoading.value = false;
  }
};

// Dialog & fetch for PhieuNhap details
const phieuDialog = ref(false);
const phieuDetail = ref(null);
const phieuLoading = ref(false);

const fetchPhieuNhapByMaPN = async (maPN) => {
  if (!maPN) {
    ElMessage.error('Không có mã phiếu');
    return;
  }
  phieuLoading.value = true;
  phieuDetail.value = null;
  try {
    const res = await api.get('/PhieuNhap/GetChiTietPhieuNhapByMaPN', { params: { maPN } });
    phieuDetail.value = res.data?.data || res.data || null;
    phieuDialog.value = true;
  } catch (err) {
    console.error('fetchPhieuNhapByMaPN error', err);
    ElMessage.error('Lấy chi tiết phiếu nhập thất bại');
  } finally {
    phieuLoading.value = false;
  }
};

// Handle click on history item: show related data depending on event type
const handleHistoryClick = (it) => {
  const type = (it.Type || it.type || '').toString();
  // PhieuQuyDoi -> if current view is original, show the new-lot voucher/history; if current is new, show original
  if (/PhieuQuyDoi|QuyDoi/i.test(type)) {
    const chiTiet = it.ChiTiet || it.chiTiet || {};
    const loGoc = getLoGoc(chiTiet);
    const loMoi = getLoMoi(chiTiet);
    const currentLo = viewRowData.value?.maLo;

    // Determine target: if current is loGoc -> target loMoi; if current is loMoi -> target loGoc; otherwise default to loGoc
    let targetLo = null;
    if (currentLo && loGoc && currentLo.toString() === loGoc.toString() && loMoi && loMoi !== '-') targetLo = loMoi;
    else if (currentLo && loMoi && currentLo.toString() === loMoi.toString() && loGoc && loGoc !== '-') targetLo = loGoc;
    else targetLo = loGoc || loMoi;

    if (targetLo && targetLo !== '-') {
      // Try to find the lot in current lists first
      const findInLists = (maLo) => {
        const all = (chuaList.value || []).concat(daList.value || []);
        return all.find((r) => (r.maLo || '').toString() === maLo.toString());
      };

      const targetRow = findInLists(targetLo);
      if (targetRow) {
        viewRowData.value = targetRow;
      } else {
        // If not present locally, set minimal info so header shows maLo, and fetch history
        viewRowData.value = { maLo: targetLo };
      }
      fetchLotHistory(targetLo);
      ElMessage.info('Hiển thị thông tin cho lô: ' + targetLo);
    } else {
      ElMessage.warning('Không tìm thấy lô liên quan để hiển thị');
    }
    return;
  }

  // PhieuNhap -> fetch and show phieu details
  if (/PhieuNhap/i.test(type)) {
    const maPN = getPhieuCode(it.Phieu || it.phieu);
    if (maPN && maPN !== '-') {
      fetchPhieuNhapByMaPN(maPN);
    } else {
      ElMessage.warning('Không tìm thấy mã phiếu nhập');
    }
    return;
  }

  // fallback: try to show history by lo goc if present
  const lo = getLoGoc(it.ChiTiet || it.chiTiet);
  if (lo && lo !== '-') {
    fetchLotHistory(lo);
    ElMessage.info('Hiển thị lịch sử cho lô: ' + lo);
    return;
  }

  ElMessage.info('Không có hành động cho mục lịch sử này');
};

// Helpers: print and export CSV for the current filtered lists
const formatCell = (v) => (v === null || v === undefined ? '' : (typeof v === 'string' ? v : String(v)));

  const buildPrintableHtml = (list, title) => {
  const headers = ['Mã Lô','Mã Thuốc','Loại Thuốc','Tên Thuốc','Đơn Vị','Số Lượng','Hạn sử dụng','Ghi chú'];
  const rows = (list || []).map((r) => ([
    formatCell(r.maLo),
    formatCell(r.maThuoc),
    formatCell(r.tenLoaiThuoc),
    formatCell(r.tenThuoc),
    formatCell(r.tenLoaiDonViGoc || r.tenLoaiDonViLe),
    formatCell(r.soLuongCon ?? r.soLuongConLe ?? ''),
    formatCell(formatDate(r.hanSuDung)),
    formatCell(r.ghiChu || '')
  ]));

  const tableRows = [
    `<tr>${headers.map(h => `<th style="border:1px solid #ccc;padding:6px 8px;background:#f5f7fa">${h}</th>`).join('')}</tr>`,
    ...rows.map(cols => `<tr>${cols.map(c=>`<td style="border:1px solid #eee;padding:6px 8px">${c}</td>`).join('')}</tr>`)
  ].join('');

  return `<!doctype html><html><head><meta charset="utf-8"><title>${title}</title><style>body{font-family:Arial,Helvetica,sans-serif;font-size:12px}table{border-collapse:collapse;width:100%}</style></head><body><h3>${title}</h3><table>${tableRows}</table></body></html>`;
};

const printHtml = (html) => {
  const w = window.open('', '_blank');
  if (!w) { ElMessage.error('Trình duyệt chặn pop-up, vui lòng cho phép để in.'); return; }
  w.document.write(html);
  w.document.close();
  w.focus();
  setTimeout(() => { w.print(); }, 250);
};

const downloadCsv = (list, filename) => {
  const cols = ['MaLo','MaThuoc','TenLoaiThuoc','TenThuoc','DonVi','SoLuong','HanSuDung','GhiChu'];
  const lines = [cols.join(',')];
  (list || []).forEach((r) => {
    const vals = [
      `"${(r.maLo||'').toString().replace(/"/g,'""')}"`,
      `"${(r.maThuoc||'').toString().replace(/"/g,'""')}"`,
      `"${(r.tenLoaiThuoc||'').toString().replace(/"/g,'""')}"`,
      `"${(r.tenThuoc||'').toString().replace(/"/g,'""')}"`,
      `"${(r.tenLoaiDonViGoc||r.tenLoaiDonViLe||'').toString().replace(/"/g,'""')}"`,
      `"${(r.soLuongCon ?? r.soLuongConLe ?? '').toString().replace(/"/g,'""')}"`,
      `"${formatDate(r.hanSuDung)}"`,
      `"${(r.ghiChu||'').toString().replace(/"/g,'""')}"`
    ];
    lines.push(vals.join(','));
  });

  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

const printChua = async () => {
  const list = filteredChuaList.value || [];
  const totalQuantity = list.reduce((sum, r) => sum + (Number(r.soLuongCon) || 0), 0);
  const tableRows = list.map((r, idx) => `<tr><td class="text-center">${idx + 1}</td><td>${r.maLo || ''}</td><td class="text-center">${r.maThuoc || ''}</td><td>${r.tenLoaiThuoc || ''}</td><td>${r.tenThuoc || ''}</td><td class="text-center">${r.tenLoaiDonViGoc || ''}</td><td class="text-right">${r.soLuongCon ?? ''}</td><td class="text-center">${formatDate(r.hanSuDung) || ''}</td></tr>`).join('');
  
  // Fetch the employee full name from API
  const printerName = await fetchEmployeeFullName();
  console.log('Printer name:', printerName);
  
  const htmlContent = `
    <!DOCTYPE html>
    <html lang="vi">
    <head>
      <meta charset="UTF-8">
      <title>Danh sách Thuốc Chưa tách lẻ</title>
      <style>
        body { font-family: 'Times New Roman', serif; margin: 0; padding: 20px; font-size: 13px; line-height: 1.4; }
        .container { max-width: 1200px; margin: 0 auto; border: 2px solid #000; padding: 20px; }
        .header { border-bottom: 2px solid #000; padding-bottom: 15px; margin-bottom: 20px; display: flex; align-items: center; gap: 20px; }
        .logo { width: 80px; height: 80px; flex-shrink: 0; }
        .logo img { width: 100%; height: 100%; object-fit: contain; }
        .header-content { flex: 1; }
        .company-name { font-size: 26px; font-weight: bold; text-transform: uppercase; margin: 0; text-align: left; }
        .company-info { font-size: 12px; margin: 3px 0; text-align: left; }
        .title { font-size: 22px; font-weight: bold; text-transform: uppercase; margin: 20px 0; text-align: center; }
        .info-section { display: flex; justify-content: space-between; margin-bottom: 15px; font-size: 12px; }
        .info-label { font-weight: bold; }
        table { width: 100%; border-collapse: collapse; margin: 15px 0; }
        th, td { border: 1px solid #000; padding: 6px 8px; text-align: left; }
        th { background-color: #e8e8e8; font-weight: bold; text-align: center; font-size: 12px; }
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .total-section { margin: 15px 0; padding: 8px; border: 1px solid #000; background-color: #f5f5f5; }
        .total-row { font-weight: bold; font-size: 14px; }
        .signature-section { margin-top: 30px; display: flex; justify-content: space-between; }
        .signature-box { width: 30%; text-align: center; font-size: 12px; }
        .signature-line { border-top: 1px solid #000; margin-top: 35px; padding-top: 3px; }
        .print-info { margin-top: 15px; font-size: 11px; text-align: right; border-top: 1px dashed #000; padding-top: 5px; line-height: 1.6; }
        @media print { body { margin: 0; } .container { border: none; } }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">
            <img src="${logoUrl}" alt="Logo" />
          </div>
          <div class="header-content">
            <div class="company-name">NHÀ THUỐC MEDION</div>
            <div class="company-info">Địa chỉ: 140 Lê Trọng Tấn, Tân Phú, TP. Hồ Chí Minh</div>
            <div class="company-info">Điện thoại: (028) 1234-5678 | Email: medion@thuoc.com</div>
          </div>
        </div>
        <div class="title">DANH SÁCH THUỐC CHƯA TÁCH LẺ</div>
        <div class="info-section">
          <div><span class="info-label">Tổng số lô:</span> ${list.length}</div>
          <div><span class="info-label">Tổng số lượng:</span> ${totalQuantity}</div>
        </div>
        <table>
          <thead>
            <tr>
              <th style="width: 4%;">STT</th>
              <th style="width: 12%;">Mã Lô</th>
              <th style="width: 8%;">Mã Thuốc</th>
              <th style="width: 15%;">Loại Thuốc</th>
              <th style="width: 35%;">Tên Thuốc</th>
              <th style="width: 10%;">Đơn Vị</th>
              <th style="width: 8%;">Số Lượng</th>
              <th style="width: 12%;">Hạn sử dụng</th>
            </tr>
          </thead>
          <tbody>
            ${tableRows}
          </tbody>
        </table>
        <div class="total-section">
          <div class="total-row text-right">Tổng số lượng: ${totalQuantity}</div>
        </div>
        <div class="signature-section">
          <div class="signature-box"><div>Người lập danh sách</div><div class="signature-line">(Ký, ghi rõ họ tên)</div></div>
          <div class="signature-box"><div>Thủ kho</div><div class="signature-line">(Ký, ghi rõ họ tên)</div></div>
          <div class="signature-box"><div>Kế toán</div><div class="signature-line">(Ký, ghi rõ họ tên)</div></div>
        </div>
        <div class="print-info">
          <div>Người in: ${printerName}</div>
          <div>Thời gian in: ${new Date().toLocaleString('vi-VN')}</div>
        </div>
      </div>
    </body>
    </html>
  `;
  
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => { printWindow.print(); }, 250);
  }
};

const exportChua = () => {
  const list = filteredChuaList.value || [];
  downloadCsv(list, `kho-chua-${new Date().toISOString().slice(0,10)}.csv`);
};

const printDa = async () => {
  const list = filteredDaList.value || [];
  const totalQuantity = list.reduce((sum, r) => sum + (Number(r.soLuongConLe) || 0), 0);
  const tableRows = list.map((r, idx) => `<tr><td class="text-center">${idx + 1}</td><td>${r.maLo || ''}</td><td class="text-center">${r.maThuoc || ''}</td><td>${r.tenLoaiThuoc || ''}</td><td>${r.tenThuoc || ''}</td><td class="text-center">${r.tenLoaiDonViLe || ''}</td><td class="text-right">${r.soLuongConLe ?? ''}</td><td class="text-center">${formatDate(r.hanSuDung) || ''}</td></tr>`).join('');
  
  // Fetch the employee full name from API
  const printerName = await fetchEmployeeFullName();
  console.log('Printer name:', printerName);
  
  const htmlContent = `
    <!DOCTYPE html>
    <html lang="vi">
    <head>
      <meta charset="UTF-8">
      <title>Danh sách Thuốc Đã tách lẻ</title>
      <style>
        body { font-family: 'Times New Roman', serif; margin: 0; padding: 20px; font-size: 13px; line-height: 1.4; }
        .container { max-width: 1200px; margin: 0 auto; border: 2px solid #000; padding: 20px; }
        .header { border-bottom: 2px solid #000; padding-bottom: 15px; margin-bottom: 20px; display: flex; align-items: center; gap: 20px; }
        .logo { width: 80px; height: 80px; flex-shrink: 0; }
        .logo img { width: 100%; height: 100%; object-fit: contain; }
        .header-content { flex: 1; }
        .company-name { font-size: 26px; font-weight: bold; text-transform: uppercase; margin: 0; text-align: left; }
        .company-info { font-size: 12px; margin: 3px 0; text-align: left; }
        .title { font-size: 22px; font-weight: bold; text-transform: uppercase; margin: 20px 0; text-align: center; }
        .info-section { display: flex; justify-content: space-between; margin-bottom: 15px; font-size: 12px; }
        .info-label { font-weight: bold; }
        table { width: 100%; border-collapse: collapse; margin: 15px 0; }
        th, td { border: 1px solid #000; padding: 6px 8px; text-align: left; }
        th { background-color: #e8e8e8; font-weight: bold; text-align: center; font-size: 12px; }
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .total-section { margin: 15px 0; padding: 8px; border: 1px solid #000; background-color: #f5f5f5; }
        .total-row { font-weight: bold; font-size: 14px; }
        .signature-section { margin-top: 30px; display: flex; justify-content: space-between; }
        .signature-box { width: 30%; text-align: center; font-size: 12px; }
        .signature-line { border-top: 1px solid #000; margin-top: 35px; padding-top: 3px; }
        .print-info { margin-top: 15px; font-size: 11px; text-align: right; border-top: 1px dashed #000; padding-top: 5px; line-height: 1.6; }
        @media print { body { margin: 0; } .container { border: none; } }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">
            <img src="${logoUrl}" alt="Logo" />
          </div>
          <div class="header-content">
            <div class="company-name">NHÀ THUỐC MEDION</div>
            <div class="company-info">Địa chỉ: 140 Lê Trọng Tấn, Tân Phú, TP. Hồ Chí Minh</div>
            <div class="company-info">Điện thoại: (028) 1234-5678 | Email: medion@thuoc.com</div>
          </div>
        </div>
        <div class="title">DANH SÁCH THUỐC ĐÃ TÁCH LẺ</div>
        <div class="info-section">
          <div><span class="info-label">Tổng số lô:</span> ${list.length}</div>
          <div><span class="info-label">Tổng số lượng:</span> ${totalQuantity}</div>
        </div>
        <table>
          <thead>
            <tr>
              <th style="width: 4%;">STT</th>
              <th style="width: 12%;">Mã Lô</th>
              <th style="width: 8%;">Mã Thuốc</th>
              <th style="width: 15%;">Loại Thuốc</th>
              <th style="width: 35%;">Tên Thuốc</th>
              <th style="width: 10%;">Đơn Vị</th>
              <th style="width: 8%;">Số Lượng</th>
              <th style="width: 12%;">Hạn sử dụng</th>
            </tr>
          </thead>
          <tbody>
            ${tableRows}
          </tbody>
        </table>
        <div class="total-section">
          <div class="total-row text-right">Tổng số lượng: ${totalQuantity}</div>
        </div>
        <div class="signature-section">
          <div class="signature-box"><div>Người lập danh sách</div><div class="signature-line">(Ký, ghi rõ họ tên)</div></div>
          <div class="signature-box"><div>Thủ kho</div><div class="signature-line">(Ký, ghi rõ họ tên)</div></div>
          <div class="signature-box"><div>Kế toán</div><div class="signature-line">(Ký, ghi rõ họ tên)</div></div>
        </div>
        <div class="print-info">
          <div>Người in: ${printerName}</div>
          <div>Thời gian in: ${new Date().toLocaleString('vi-VN')}</div>
        </div>
      </div>
    </body>
    </html>
  `;
  
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => { printWindow.print(); }, 250);
  }
};

const exportDa = () => {
  const list = filteredDaList.value || [];
  downloadCsv(list, `kho-da-${new Date().toISOString().slice(0,10)}.csv`);
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
  align-items: flex-end;
  flex-wrap: nowrap;
  overflow-x: auto;
}

.control-with-label {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

.control-with-label:has(.search-input) {
  flex-grow: 1;
  flex-shrink: 1;
  min-width: 200px;
}

.control-label {
  font-size: 13px;
  color: var(--el-text-color-secondary);
  text-align: left;
  white-space: nowrap;
  flex-shrink: 0;
}

.control-action {
  margin-left: auto;
  justify-content: center;
  display: flex;
  align-items: center;
  gap: 6px;
}

.status-select { min-width: 130px; width: 130px; }
.type-select { min-width: 110px; width: 110px; }
.unit-select { min-width: 110px; width: 110px; }
.search-input { width: 100%; min-width: 200px; }
.control-action .el-button { white-space: nowrap; }

/* compact label styling for small screens */
@media (max-width: 980px) {
  .control-with-label { flex-direction: column; align-items: stretch; }
  .control-label { width: auto; margin-left: 6px; }
  .search-input { min-width: 100%; }
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

.history-card { cursor: pointer; }

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
