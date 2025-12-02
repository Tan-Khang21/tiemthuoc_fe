<template>
  <el-card class="page-card">
    <el-tabs v-model="activeTab" style="margin-top:12px">
      <el-tab-pane label="Thuốc từ kho" name="kho">
        <!-- Kho tab: Sắp hết hạn -->
        <div class="kho-tab-content" style="margin-top:12px">
          <div class="filter-section" style="display:flex; gap:12px; align-items:flex-end; flex-wrap:wrap; padding:12px; background:#f5f7fa; border-radius:8px">
            <div style="display:flex; gap:8px; align-items:center">
              <span style="font-weight:600">Lọc theo:</span>
              <el-radio-group v-model="khoFilterMode" size="small" @change="fetchKhoList">
                <el-radio-button label="days">Ngày</el-radio-button>
                <el-radio-button label="months">Tháng</el-radio-button>
                <el-radio-button label="years">Năm</el-radio-button>
                <el-radio-button label="fromDate">Từ ngày</el-radio-button>
              </el-radio-group>
            </div>

            <div v-if="khoFilterMode === 'days'" style="display:flex; gap:8px; align-items:center">
              <label>Số ngày:</label>
              <el-input-number v-model="khoDays" :min="1" :max="365" size="small" @change="fetchKhoList" />
            </div>

            <div v-if="khoFilterMode === 'months'" style="display:flex; gap:8px; align-items:center">
              <label>Số tháng:</label>
              <el-input-number v-model="khoMonths" :min="1" :max="60" size="small" @change="fetchKhoList" />
            </div>

            <div v-if="khoFilterMode === 'years'" style="display:flex; gap:8px; align-items:center">
              <label>Số năm:</label>
              <el-input-number v-model="khoYears" :min="1" :max="10" size="small" @change="fetchKhoList" />
            </div>

            <div v-if="khoFilterMode === 'fromDate'" style="display:flex; gap:8px; align-items:center">
              <label>Từ ngày:</label>
              <el-date-picker v-model="khoFromDate" type="date" placeholder="Chọn ngày" format="DD/MM/YYYY" value-format="YYYY-MM-DD" size="small" @change="fetchKhoList" />
            </div>

            <div style="display:flex; gap:8px; align-items:center; min-width:260px">
              <el-input v-model="khoQuery" size="small" placeholder="Tìm mã lô / tên thuốc / đơn vị" clearable />
            </div>
            <el-button type="primary" @click="openCreateCancelDialog" size="small" style="margin-left:auto">Tạo phiếu yêu cầu huỷ</el-button>
          </div>

          <!-- Kho list table -->
          <div style="margin-top:12px">
            <el-table ref="khoTableRef" :data="khoPaginatedItems" stripe v-loading="khoLoading" style="width:100%" :row-style="tableRowStyle" :row-key="getRowKey" :reserve-selection="true" @selection-change="handleKhoSelectionChange">
              <el-table-column type="selection" width="56" />
              <el-table-column label="STT" width="50">
                <template #default="{ $index }">{{ (khoCurrentPage - 1) * pageSize + $index + 1 }}</template>
              </el-table-column>
              <el-table-column prop="maLo" label="Lô" width="160" />
              <el-table-column prop="maThuoc" label="Mã thuốc" width="90">
                <template #default="{ row }">
                  <el-tag size="small" type="warning">{{ row.maThuoc }}</el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="tenThuoc" label="Tên thuốc" min-width="250">
                <template #default="{ row }">
                  <div class="drug-name">{{ row.tenThuoc }}</div>
                </template>
              </el-table-column>
              <el-table-column prop="tenLoaiDonViGoc" label="Đơn vị" width="90" />
              <el-table-column prop="soLuongCon" label="SL" width="50">
                <template #default="{ row }">
                  <span style="font-weight:600; color:#28a745">{{ row.soLuongCon }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="hanSuDung" label="Hạn sử dụng" width="140">
                <template #default="{ row }">
                  {{ formatDate(row.hanSuDung) }}
                </template>
              </el-table-column>
              <el-table-column label="Còn lại" width="120">
                <template #default="{ row }">
                  <div style="font-size:12px">
                    <div>{{ row.ngayConLai }} ngày</div>
                    <div style="color:#999">({{ row.thangConLai }} tháng)</div>
                  </div>
                </template>
              </el-table-column>
              <el-table-column label="Hành động" width="120" align="center" fixed="right">
                <template #default="{ row }">
                  <el-button type="danger" size="small" @click="quickCancel(row)">
                    <i class="fas fa-times"></i> Huỷ nhanh
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
            
            <div style="margin-top:12px; display:flex; justify-content:flex-end" v-if="khoDisplayedItems.length > pageSize">
              <el-pagination
                background
                layout="prev, pager, next"
                :total="khoDisplayedItems.length"
                :page-size="pageSize"
                v-model:current-page="khoCurrentPage"
                @current-change="(p) => (khoCurrentPage = p)"
              />
            </div>
          </div>
        </div>
      </el-tab-pane>

      <el-tab-pane label="Thuốc từ hóa đơn" name="hoadon">
        <!-- Hóa đơn tab content -->
        <div style="padding:12px">
          <div class="hoadon-filters" style="margin-bottom:12px">
            <div style="display:flex; gap:8px; align-items:center">
              <span class="hoadon-label">Trạng thái :</span>
              <el-select v-model="hoadonStatus" placeholder="Chọn trạng thái" class="hoadon-select" @change="() => fetchHoaDonList(hoadonStatus)">
                <el-option label="Chưa hoàn tất xử lý huỷ" :value="-3" />
                <el-option label="Đã hoàn tất xử lý huỷ" :value="-2" />
                <el-option label="Huỷ" :value="-1" />
              </el-select>
            </div>
            <div style="display:flex; gap:8px; align-items:center">
              <el-input v-model="hoadonQuery" size="small" placeholder="Tìm mã HD / khách / nhân viên" clearable />
            </div>
            <el-button type="primary" size="small" @click="() => fetchHoaDonList(hoadonStatus)" style="margin-left:auto">Tìm</el-button>
          </div>

          <el-table :data="hoadonDisplayedItems" stripe v-loading="hoadonLoading" style="width:100%">
            <el-table-column prop="maHD" label="Mã HD" width="220" />
            <el-table-column prop="ngayLap" label="Ngày lập" width="160">
              <template #default="{ row }">{{ formatDate(row.ngayLap) }}</template>
            </el-table-column>
            <el-table-column prop="maKH" label="Mã KH" width="120" />
            <el-table-column prop="tenKH" label="Khách hàng" min-width="200" />
            <el-table-column label="Nhân viên tạo" width="180">
              <template #default="{ row }">{{ row.tenNV || row.TenNV || row.tenNguoiTao || row.maNV || '' }}</template>
            </el-table-column>
            <el-table-column prop="tongTien" label="Tổng tiền" width="140">
              <template #default="{ row }">{{ row.tongTien ? row.tongTien.toLocaleString() : '' }}</template>
            </el-table-column>
            <el-table-column label="Trạng thái" width="140">
              <template #default="{ row }">{{ statusLabel(row.trangThaiGiaoHang) }}</template>
            </el-table-column>
            <el-table-column label="Hành động" width="140" align="center" fixed="right">
              <template #default="{ row }">
                <el-button type="primary" size="small" @click="() => goToHoaDonDetail(row)">Chi tiết</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-tab-pane>

      <el-tab-pane label="Yêu cầu xử lý" name="yeucau">
        <div style="padding:12px">
          <div class="ycau-filters-grid" style="display:grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap:16px; margin-bottom:16px; padding:12px; background:#f5f7fa; border-radius:6px">
            <div class="yc-filter-field">
              <label style="display:block; font-size:13px; font-weight:600; color:var(--el-text-color-secondary); margin-bottom:6px">Từ ngày</label>
              <el-date-picker v-model="ycStart" type="datetime" placeholder="Từ ngày" format="DD/MM/YYYY" clearable size="small" style="width:100%" />
            </div>
            <div class="yc-filter-field">
              <label style="display:block; font-size:13px; font-weight:600; color:var(--el-text-color-secondary); margin-bottom:6px">Đến ngày</label>
              <el-date-picker v-model="ycEnd" type="datetime" placeholder="Đến ngày" format="DD/MM/YYYY" clearable size="small" style="width:100%" />
            </div>
            <div class="yc-filter-field">
              <label style="display:block; font-size:13px; font-weight:600; color:var(--el-text-color-secondary); margin-bottom:6px">Người tạo</label>
              <el-select v-model="ycMaNV" placeholder="Chọn nhân viên" size="small" style="width:100%">
                <el-option v-for="nv in nhanVienList" :key="nv.maNV || nv.maNv || nv.MaNV" :label="nv.hoTen || nv.HoTen || nv.TenNV || nv.tenNV" :value="nv.maNV || nv.maNv || nv.MaNV" />
              </el-select>
            </div>
            <div class="yc-filter-field">
              <label style="display:block; font-size:13px; font-weight:600; color:var(--el-text-color-secondary); margin-bottom:6px">Loại nguồn</label>
              <el-select v-model="ycLoaiNguon" placeholder="Kho" size="small" style="width:100%">
                <el-option label="Bất kỳ" :value="null" />
                <el-option label="Hoá đơn" :value="true" />
                <el-option label="Kho" :value="false" />
              </el-select>
            </div>
            <div class="yc-filter-field">
              <label style="display:block; font-size:13px; font-weight:600; color:var(--el-text-color-secondary); margin-bottom:6px">Tìm kiếm</label>
              <el-input v-model="ycQuery" size="small" placeholder="Mã PXH / HD / người tạo" clearable />
            </div>
          </div>

          <el-table :data="ycDisplayedItems" stripe v-loading="ycLoading" style="width:100%">
            <el-table-column prop="MaPXH" label="Mã PXH" width="220" />
            <el-table-column prop="NgayTao" label="Ngày tạo" width="200">
              <template #default="{ row }">{{ formatDate(row.NgayTao) }}</template>
            </el-table-column>
            <el-table-column prop="NhanVienTaoName" label="Người tạo" width="220" />
            <el-table-column prop="MaHD" label="Mã hoá đơn" width="220" />
            <el-table-column prop="LoaiNguon" label="Loại nguồn" width="120">
              <template #default="{ row }">{{ row.LoaiNguon ? 'Hoá đơn' : 'Kho' }}</template>
            </el-table-column>
            <el-table-column prop="LyDo" label="Lý do" min-width="200" />
            <el-table-column label="Hành động" width="220" align="center" fixed="right">
              <template #default="{ row }">
                <div class="action-buttons-row">
                  <el-button size="small" @click="() => openYeuCauDetail(row)">Chi tiết</el-button>
                  <el-button type="primary" size="small" @click="() => openYeuCauApprove(row)">Duyệt</el-button>
                </div>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-tab-pane>
      <el-tab-pane label="Đã duyệt" name="daduyet">
        <div style="padding:12px">
          <div class="ycau-filters-grid" style="margin-bottom:16px; padding:12px">
            <div class="yc-filter-field">
              <label style="display:block; font-size:13px; font-weight:600; color:var(--el-text-color-secondary); margin-bottom:6px">Từ ngày</label>
              <el-date-picker v-model="approvedStart" type="datetime" placeholder="Từ ngày" format="DD/MM/YYYY" clearable size="small" style="width:100%" />
            </div>
            <div class="yc-filter-field">
              <label style="display:block; font-size:13px; font-weight:600; color:var(--el-text-color-secondary); margin-bottom:6px">Đến ngày</label>
              <el-date-picker v-model="approvedEnd" type="datetime" placeholder="Đến ngày" format="DD/MM/YYYY" clearable size="small" style="width:100%" />
            </div>
            <div class="yc-filter-field">
              <label style="display:block; font-size:13px; font-weight:600; color:var(--el-text-color-secondary); margin-bottom:6px">Người tạo</label>
              <el-select v-model="approvedMaNV" placeholder="Chọn nhân viên" size="small" style="width:100%">
                <el-option v-for="nv in nhanVienList" :key="nv.maNV || nv.maNv || nv.MaNV" :label="nv.hoTen || nv.HoTen || nv.TenNV || nv.tenNV" :value="nv.maNV || nv.maNv || nv.MaNV" />
              </el-select>
            </div>
            <div class="yc-filter-field">
              <label style="display:block; font-size:13px; font-weight:600; color:var(--el-text-color-secondary); margin-bottom:6px">Loại nguồn</label>
              <el-select v-model="approvedLoaiNguon" placeholder="Bất kỳ" size="small" style="width:100%">
                <el-option label="Bất kỳ" :value="null" />
                <el-option label="Hoá đơn" :value="true" />
                <el-option label="Kho" :value="false" />
              </el-select>
            </div>
            <div class="yc-filter-field">
              <label style="display:block; font-size:13px; font-weight:600; color:var(--el-text-color-secondary); margin-bottom:6px">Tìm kiếm</label>
              <el-input v-model="approvedQuery" size="small" placeholder="Mã PXH / HD / người tạo" clearable />
            </div>
          </div>

          <el-table :data="approvedDisplayedItems" stripe v-loading="approvedLoading" style="width:100%">
            <el-table-column prop="MaPXH" label="Mã PXH" width="220" />
            <el-table-column prop="NgayTao" label="Ngày tạo" width="200">
              <template #default="{ row }">{{ formatDate(row.NgayTao || row.ngayTao) }}</template>
            </el-table-column>
            <el-table-column prop="MaNV_Tao" label="Người tạo" width="220" />
            <el-table-column prop="MaHD" label="Mã hoá đơn" width="220" />
            <el-table-column prop="LoaiNguon" label="Loại nguồn" width="120">
              <template #default="{ row }">{{ row.LoaiNguon ? 'Hoá đơn' : 'Kho' }}</template>
            </el-table-column>
            <el-table-column label="Hành động" width="220" align="center" fixed="right">
              <template #default="{ row }">
                <div class="action-buttons-row">
                  <el-button size="small" @click="() => openYeuCauDetail(row)">Chi tiết</el-button>
                  <el-button v-if="(row.trangthaitaophieuhuy === 0) || (row.trangthaitaophieuhuy == '0')" type="danger" size="small" @click="() => createCancelFromApproved(row)">Tạo phiếu huỷ</el-button>
                </div>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-tab-pane>
    </el-tabs>


    <!-- Detail Dialog -->
    <el-dialog v-model="detailDialog" width="700px" :close-on-click-modal="false">
      <template #title>
        <div style="display:flex; align-items:center; gap:12px">
          <h4 style="margin:0">Chi tiết thuốc</h4>
          <small style="color:#666">{{ detailItem?.MaThuoc || '' }}</small>
        </div>
      </template>
      <div v-if="detailItem">
        <el-descriptions column="2" border>
          <el-descriptions-item label="Mã thuốc">{{ detailItem.MaThuoc }}</el-descriptions-item>
          <el-descriptions-item label="Tên thuốc">{{ detailItem.TenThuoc }}</el-descriptions-item>
          <el-descriptions-item label="Lô">{{ detailItem.MaLo }}</el-descriptions-item>
          <el-descriptions-item label="Số lượng">{{ detailItem.SoLuong }} {{ detailItem.DonVi || '' }}</el-descriptions-item>
          <el-descriptions-item label="Ghi chú" :span="2">{{ detailItem.GhiChu || 'Không có' }}</el-descriptions-item>
        </el-descriptions>
      </div>
      <template #footer>
        <div style="text-align:right">
          <el-button @click="detailDialog = false">Đóng</el-button>
          <el-button type="primary" @click="goToEdit(detailItem)">Xử lý chi tiết</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- Yêu cầu xử lý Detail Dialog -->
    <el-dialog v-model="ycDetailDialog" title="Chi tiết yêu cầu xử lý" width="70%" :close-on-click-modal="true">
      <div v-if="ycDetailLoading" style="padding:20px; text-align:center; color:#666">Đang tải...</div>
      <div v-else-if="ycDetailPhieu">
        <div v-if="!ycEditMode">
          <el-descriptions column="2" border>
            <el-descriptions-item label="Mã PXH">{{ ycDetailPhieu.maPXH || ycDetailPhieu.MaPXH || '' }}</el-descriptions-item>
            <el-descriptions-item label="Ngày tạo">{{ formatDate(ycDetailPhieu.ngayTao || ycDetailPhieu.NgayTao) }}</el-descriptions-item>
            <el-descriptions-item label="Người tạo">{{ ycDetailPhieu.maNV_Tao || ycDetailPhieu.MaNV_Tao || '' }}</el-descriptions-item>
            <el-descriptions-item label="Loại nguồn">{{ (ycDetailPhieu.loaiNguon === true) ? 'Hoá đơn' : 'Kho' }}</el-descriptions-item>
            <el-descriptions-item label="Ghi chú" :span="2">{{ ycDetailPhieu.ghiChu || '' }}</el-descriptions-item>
          </el-descriptions>

          <el-table :data="ycDetailChiTiets" style="width:100%; margin-top:12px" size="small">
            <el-table-column prop="maLo" label="Lô" width="160" />
            <el-table-column prop="maThuoc" label="Mã thuốc" width="120" />
            <el-table-column prop="tenThuoc" label="Tên thuốc" min-width="220">
              <template #default="{ row }">
                {{ row.tenThuoc || row.TenThuoc || '' }}
              </template>
            </el-table-column>
            <el-table-column label="Đơn vị" width="120">
              <template #default="{ row }">
                {{ row.tenLoaiDonVi || row.tenLoaiDonViGoc || row.donVi || row.maLoaiDonVi || '' }}
              </template>
            </el-table-column>
            <el-table-column prop="soLuong" label="Số lượng" width="120" />
            <el-table-column prop="loaiXuLy" label="Loại xử lý" width="140">
              <template #default="{ row }">{{ row.loaiXuLy ? 'Nhập lại' : 'Huỷ' }}</template>
            </el-table-column>
          </el-table>
        </div>

        <div v-else>
          <el-form :model="ycEditPhieu" label-width="120px">
            <el-form-item label="Ghi chú">
              <el-input type="textarea" v-model="ycEditPhieu.ghiChu" :rows="2" />
            </el-form-item>
              <el-form-item label="Người duyệt">
                <el-select v-model="ycEditPhieu.maNV_Duyet" placeholder="Chọn người duyệt" size="small" style="width:320px" :disabled="true">
                  <el-option v-for="nv in nhanVienList" :key="nv.maNV || nv.MaNV" :label="nv.hoTen || nv.TenNV || nv.HoTen" :value="nv.maNV || nv.MaNV" />
                </el-select>
              </el-form-item>
          </el-form>

          <el-table :data="ycEditChiTiets" style="width:100%; margin-top:12px" size="small">
            <el-table-column prop="maCTPXH" label="Mã CT" width="180" />
            <el-table-column prop="maLo" label="Lô" width="160" />
            <el-table-column prop="maThuoc" label="Mã thuốc" width="120" />
            <el-table-column prop="tenThuoc" label="Tên thuốc" min-width="220">
              <template #default="{ row }">{{ row.tenThuoc || row.TenThuoc || '' }}</template>
            </el-table-column>
            <el-table-column label="Đơn vị" width="120">
              <template #default="{ row }">{{ row.tenLoaiDonVi || row.tenLoaiDonViGoc || row.donVi || row.maLoaiDonVi || '' }}</template>
            </el-table-column>
            <el-table-column label="Số lượng" width="140">
              <template #default="{ row, $index }">
                <el-input-number v-model="ycEditChiTiets[$index].soLuong" :min="0" :max="999999" size="small" />
              </template>
            </el-table-column>
            <el-table-column label="Loại xử lý" width="160">
              <template #default="{ row, $index }">
                <el-radio-group v-model="ycEditChiTiets[$index].loaiXuLy">
                  <el-radio :label="false">Huỷ</el-radio>
                  <el-radio :label="true">Nhập lại</el-radio>
                </el-radio-group>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
      <div v-else style="padding:20px; text-align:center; color:#666">Không có dữ liệu</div>
      <template #footer>
        <div style="text-align:right">
          <el-button @click="() => { ycEditMode = false; ycDetailDialog = false }">Đóng</el-button>
          <template v-if="!ycEditMode">
            <el-button type="primary" size="small" @click="startApprove">Duyệt</el-button>
          </template>
          <template v-else>
            <el-button size="small" @click="cancelApprove">Huỷ</el-button>
            <el-button type="success" :loading="ycApproveLoading" size="small" @click="submitApprove">Xác nhận duyệt</el-button>
          </template>
        </div>
      </template>
    </el-dialog>

    <!-- Quick Cancel Dialog -->
    <el-dialog v-model="cancelDialog" title="Xác nhận huỷ nhanh" width="500px" :close-on-click-modal="false">
      <div v-if="cancelItem">
        <el-alert title="Hành động này sẽ tạo phiếu huỷ cho toàn bộ số lượng còn lại của lô này." type="warning" :closable="false" show-icon style="margin-bottom:12px" />
        <el-descriptions :column="1" border size="small">
          <el-descriptions-item label="Thuốc">{{ cancelItem.tenThuoc }}</el-descriptions-item>
          <el-descriptions-item label="Lô">{{ cancelItem.maLo }}</el-descriptions-item>
          <el-descriptions-item label="Số lượng huỷ">{{ cancelItem.soLuongCon }} {{ cancelItem.tenLoaiDonViGoc }}</el-descriptions-item>
          <el-descriptions-item label="Hạn sử dụng">{{ formatDate(cancelItem.hanSuDung) }}</el-descriptions-item>
        </el-descriptions>
        <div style="margin-top:16px">
          <label style="display:block; margin-bottom:4px; font-weight:600">Lý do huỷ:</label>
          <el-input v-model="cancelReason" placeholder="Nhập lý do huỷ..." type="textarea" :rows="2" />
        </div>
      </div>
      <template #footer>
        <el-button @click="cancelDialog = false">Đóng</el-button>
        <el-button type="danger" :loading="cancelLoading" @click="submitQuickCancel">Xác nhận huỷ</el-button>
      </template>
    </el-dialog>

    <!-- Create Cancel Request Dialog -->
    <el-dialog v-model="createCancelDialog" title="Tạo phiếu yêu cầu huỷ" width="90%" :close-on-click-modal="false">
      <div v-if="createCancelItems.length">
        <el-table :data="createCancelItems" style="width:100%; table-layout: fixed" size="small" border>
          <el-table-column label="Lô" prop="maLo" width="160" />
          <el-table-column label="Mã thuốc" prop="maThuoc" width="120" />
          <el-table-column label="Tên thuốc" prop="tenThuoc" min-width="200" />
          <el-table-column label="Đơn vị" prop="tenLoaiDonViGoc" width="120">
            <template #default="{ row }">{{ row.tenLoaiDonViGoc || row.tenLoaiDonVi || row.donVi || '' }}</template>
          </el-table-column>
          <el-table-column label="Số lượng còn" prop="soLuongCon" width="120">
            <template #default="{ row }">
              <span class="so-luong">{{ row.soLuongCon }}</span>
            </template>
          </el-table-column>
          <el-table-column label="Hủy về" width="140">
            <template #default="{ row }">
              <span>{{ row.loaiXuLy ? 'Hoàn lại' : 'Huỷ' }}</span>
            </template>
          </el-table-column>
        </el-table>

        <div style="margin-top:12px">
          <label style="display:block; margin-bottom:6px; font-weight:600">Ghi chú</label>
          <el-input type="textarea" v-model="ghiChuCancel" :rows="3" placeholder="Ghi chú cho phiếu huỷ (tuỳ chọn)" />
        </div>
      </div>
      <div v-else style="padding:20px; text-align:center; color:#666">Chưa có lô nào được chọn.</div>

      <template #footer>
        <el-button @click="closeCreateCancelDialog">Đóng</el-button>
        <template v-if="approvedSourceMaPXH">
          <el-button type="danger" :loading="createCancelLoading" @click="submitConfirmCancelByPXH">Xác nhận huỷ</el-button>
        </template>
        <template v-else>
          <el-button type="primary" :loading="createCancelLoading" @click="submitCreateCancel">Tạo phiếu huỷ</el-button>
        </template>
      </template>
    </el-dialog>

    <!-- Invoice Detail Dialog -->
    <el-dialog v-model="invoiceDetailDialog" title="Chi tiết hóa đơn" width="80%" :close-on-click-modal="true" custom-class="tall-dialog">
      <div v-if="invoiceDetail">
        <div style="display:flex; gap:16px; margin-bottom:12px">
          <div style="padding:12px">
            <el-descriptions column="2" border>
              <el-descriptions-item label="Mã hoá đơn">{{ invoiceDetail.MaHD || invoiceDetail.maHD || '' }}</el-descriptions-item>
              <el-descriptions-item label="Ngày">{{ formatDate(invoiceDetail.NgayTao || invoiceDetail.Ngay || invoiceDetail.NgayLap) }}</el-descriptions-item>
              <el-descriptions-item label="Khách hàng">{{ invoiceDetail.TenKH || invoiceDetail.tenKH || invoiceDetail.KhachHang || '' }}</el-descriptions-item>
              <el-descriptions-item label="Nhân viên">{{ invoiceDetail.TenNV || invoiceDetail.tenNV || invoiceDetail.NhanVien || '' }}</el-descriptions-item>
            </el-descriptions>
          </div>
        </div>

        <el-table :data="invoiceItems" style="width:100%" size="small" border>
          <el-table-column prop="maLo" label="Lô" width="140" />
          <el-table-column prop="maThuoc" label="Mã thuốc" width="100" />
          <el-table-column prop="tenThuoc" label="Tên thuốc" min-width="200" />
          <el-table-column prop="soLuong" label="Số lượng" width="120" />
          <el-table-column prop="hanSuDung" label="Hạn sử dụng" width="140">
            <template #default="{ row }">{{ formatDate(row.hanSuDung) }}</template>
          </el-table-column>
        </el-table>
      </div>
      <div v-else style="padding:20px; text-align:center; color:#666">Đang tải...</div>
      <template #footer>
        <div style="text-align:right">
          <el-button @click="invoiceDetailDialog = false">Đóng</el-button>
          <el-button type="warning" @click="openInvoiceCancelDialog">Yêu cầu huỷ</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- Invoice Cancel Request Dialog -->
    <el-dialog v-model="invoiceCancelDialog" title="Tạo yêu cầu huỷ hoá đơn" width="80%" :close-on-click-modal="false" custom-class="tall-dialog">
      <div v-if="invoiceCancelItems.length">
        <div style="display:flex; gap:12px; align-items:center; margin-bottom:12px">
          <div style="font-weight:600">Loại xử lý:</div>
          <div style="color:#666">Chọn loại xử lý cho từng mục ở cột "Loại xử lý" bên dưới</div>
          <div style="margin-left:auto; min-width:320px">
            <label style="display:block; margin-bottom:6px; font-weight:600">Ghi chú</label>
            <el-input v-model="invoiceCancelNote" placeholder="Ghi chú cho yêu cầu (tùy chọn)" />
          </div>
        </div>

        <el-table :data="invoiceCancelItems" style="width:100%; table-layout: fixed" size="small" border :row-class-name="invoiceRowClass" :row-style="invoiceRowStyle">
          <el-table-column label="Lô" prop="maLo" width="140" />
          <el-table-column label="Mã thuốc" prop="maThuoc" width="80" />
          <el-table-column label="Tên thuốc" prop="tenThuoc" min-width="200" />
          <el-table-column label="Đơn vị" prop="tenLoaiDonVi" width="80" />
          <el-table-column label="SL hoá đơn" prop="soLuongCon" width="140" />
          <el-table-column label="Số lượng huỷ" prop="soLuong" width="140">
            <template #default="{ row }">
              <div style="font-weight:700; text-align:right">{{ row.soLuong }}</div>
            </template>
          </el-table-column>
          <el-table-column label="Hạn sử dụng" width="160">
            <template #default="{ row }">{{ formatDate(row.hanSuDung) }}</template>
          </el-table-column>
          <el-table-column label="Loại xử lý" width="200">
            <template #default="{ row, $index }">
              <el-radio-group v-model="invoiceCancelItems[$index].loaiXuLy">
                <el-radio :label="false">Huỷ</el-radio>
                <el-radio :label="true">Nhập lại</el-radio>
              </el-radio-group>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <div v-else style="padding:20px; text-align:center; color:#666">Không có mục nào để tạo yêu cầu.</div>
      <template #footer>
        <div style="text-align:right">
          <el-button @click="invoiceCancelDialog = false">Đóng</el-button>
          <el-button type="primary" :loading="invoiceCancelLoading" @click="submitInvoiceCancel">Gửi yêu cầu</el-button>
        </div>
      </template>
    </el-dialog>
  </el-card>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import api from '@/api/axios';
import hoadonApi from '@/api/hoadon';
import phieuxulyApi from '@/api/phieuxulyhoanhuy';
import { ElMessage } from 'element-plus';
import { useAuthStore } from '@/store/auth';

const authStore = useAuthStore();
const start = ref(null);
const end = ref(null);
const q = ref('');
const cancelMode = ref('hoadon');
const activeTab = ref('kho');
const filterStatus = ref('');
const filterLoDangDung = ref('');
const filterLoaiThuoc = ref('');
const filterDonVi = ref('');

const loDangDungOptions = ref([]);
const loaiThuocOptions = ref([]);
const donViOptions = ref([]);

const items = ref([]);
const loading = ref(false);

// Kho tab state
const khoFilterMode = ref('months');
const khoDays = ref(7);
const khoMonths = ref(1);
const khoYears = ref(1);
const khoFromDate = ref(null);
const khoItems = ref([]);
const khoLoading = ref(false);
const khoCurrentPage = ref(1);
const khoQuery = ref('');

const pageSize = 10;
const currentPage = ref(1);

// Selection state for kho table (checkbox column)
const selectedKhoRows = ref([]);
const getRowKey = (row) => {
  const lo = row.maLo || row.MaLo || '';
  const thuoc = row.maThuoc || row.MaThuoc || '';
  return `${lo}::${thuoc}`;
};
const handleKhoSelectionChange = (rows) => {
  selectedKhoRows.value = rows || [];
};

const detailDialog = ref(false);
const detailItem = ref(null);

// Quick Cancel state
const cancelDialog = ref(false);
const cancelItem = ref(null);
const cancelReason = ref('');
const cancelLoading = ref(false);

// Create cancel request dialog state
const createCancelDialog = ref(false);
const createCancelLoading = ref(false);
const createCancelItems = ref([]);
const khoTableRef = ref(null);
const ghiChuCancel = ref('');
const approvedSourceMaPXH = ref(null); // when creating cancel from an approved request

const openCreateCancelDialog = () => {
  // ensure this is a manual create (not from approved row)
  approvedSourceMaPXH.value = null;
  if (!selectedKhoRows.value || selectedKhoRows.value.length === 0) {
    ElMessage.warning('Vui lòng chọn ít nhất một lô để tạo phiếu huỷ');
    return;
  }
  createCancelItems.value = selectedKhoRows.value.map(r => {
    const soLuongCon = Number(r.soLuongCon || r.SoLuongCon || r.soLuong || r.SoLuong || r.soLuongTon || r.soLuongCon || 0) || 0;
    return {
      maLo: r.maLo || r.MaLo || r.Lo || r.lo || '',
      maThuoc: r.maThuoc || r.MaThuoc || r.maThuocGoc || r.MaThuocGoc || r.maThuocOriginal || '',
      tenThuoc: r.tenThuoc || r.TenThuoc || r.TenHang || r.tenHang || r.tenThuocGoc || r.TenThuocGoc || '',
      tenLoaiDonViGoc: r.tenLoaiDonViGoc || r.tenLoaiDonVi || r.TenLoaiDonVi || r.donVi || r.DonVi || '',
      hanSuDung: r.hanSuDung || r.HanSuDung || r.HSD || r.ngayHetHan || r.expiry || '',
      soLuongCon,
      soLuong: soLuongCon,
      loaiXuLy: false
    };
  });
  ghiChuCancel.value = '';
  createCancelDialog.value = true;
};

const removeCreateItem = (idx) => {
  createCancelItems.value.splice(idx, 1);
};

const submitCreateCancel = async () => {
  if (!createCancelItems.value || createCancelItems.value.length === 0) {
    ElMessage.warning('Chưa có lô nào trong danh sách huỷ');
    return;
  }
  for (const it of createCancelItems.value) {
    if (!it.soLuong || Number(it.soLuong) <= 0) {
      ElMessage.warning('Số lượng huỷ phải lớn hơn 0');
      return;
    }
    if (Number(it.soLuong) > Number(it.soLuongCon)) {
      ElMessage.warning('Số lượng huỷ không được lớn hơn số lượng còn lại');
      return;
    }
  }

  createCancelLoading.value = true;
  try {
    const payload = {
      maNV: authStore.user?.MaNV || authStore.user?.maNV || '',
      loaiNguon: false,
      maHD: null,
      ghiChu: ghiChuCancel.value || '',
      chiTiets: createCancelItems.value.map(it => ({ maLo: it.maLo, soLuong: Number(it.soLuong), loaiXuLy: !!it.loaiXuLy }))
    };

    await api.post('/PhieuXuLyHoanHuy/Create', payload);
    ElMessage.success('Tạo phiếu yêu cầu huỷ thành công');
    createCancelDialog.value = false;
    selectedKhoRows.value = [];
    if (khoTableRef.value && khoTableRef.value.clearSelection) khoTableRef.value.clearSelection();
    fetchKhoList();
  } catch (err) {
    console.error('submitCreateCancel error', err);
    ElMessage.error('Tạo phiếu huỷ thất bại: ' + (err.response?.data?.message || err.message));
  } finally {
    createCancelLoading.value = false;
  }
};

// HoaDon (hủy) tab state
const hoadonStatus = ref(-1); // default to -1 (hủy)
const hoadonItems = ref([]);
const hoadonLoading = ref(false);
const hoadonQuery = ref('');

const hoadonDisplayedItems = computed(() => {
  const q = (hoadonQuery.value || '').toString().trim().toLowerCase();
  const list = hoadonItems.value || [];
  if (!q) return list;
  return list.filter(i => {
    try {
      const maHD = (i.maHD || i.MaHD || '').toString().toLowerCase();
      const tenKH = (i.tenKH || i.TenKH || '').toString().toLowerCase();
      const tenNV = (i.tenNV || i.TenNV || '').toString().toLowerCase();
      return maHD.includes(q) || tenKH.includes(q) || tenNV.includes(q);
    } catch (e) { return false; }
  });
});

// Yêu cầu xử lý (PhieuXuLyHoanHuy)
const ycItems = ref([]);
const nhanVienList = ref([]);
const ycLoading = ref(false);
const ycQuery = ref('');
// default ycStart = first day of current month, ycEnd = now
const _now = new Date();
const _startOfMonth = new Date(_now.getFullYear(), _now.getMonth(), 1, 0, 0, 0);
const _fmt = (dt) => {
  if (!dt) return null;
  const d = new Date(dt);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  const ss = String(d.getSeconds()).padStart(2, '0');
  return `${y}-${m}-${day}T${hh}:${mm}:${ss}`;
};
// use Date objects for v-model so Element Plus displays properly
const ycStart = ref(_startOfMonth);
const ycEnd = ref(_now);
const ycMaNV = ref('');
// tri-state: null = any, true = hóa đơn, false = kho
const ycLoaiNguon = ref(null);
const ycTrangThai = ref(0);

// Approved tab state (Đã duyệt)
const approvedItems = ref([]);
const approvedLoading = ref(false);
const approvedQuery = ref('');
const approvedStart = ref(_startOfMonth);
const approvedEnd = ref(_now);
const approvedMaNV = ref('');
const approvedLoaiNguon = ref(null);

const fetchApprovedList = async () => {
  approvedLoading.value = true;
  approvedItems.value = [];
  try {
    const params = {};
    if (approvedStart.value) params.start = _fmt(approvedStart.value);
    if (approvedEnd.value) params.end = _fmt(approvedEnd.value);
    if (approvedMaNV.value && approvedMaNV.value.toString().trim() !== '') params.maNV_Tao = approvedMaNV.value.toString().trim();
    if (approvedLoaiNguon.value !== null && approvedLoaiNguon.value !== undefined) params.loaiNguon = approvedLoaiNguon.value;

    const res = await api.get('/PhieuXuLyHoanHuy/ApprovedWithCancelStatus', { params });
    const d = res?.data || res;
    approvedItems.value = Array.isArray(d) ? d : (d?.data || []);
  } catch (err) {
    console.error('fetchApprovedList error', err);
    ElMessage.error('Không thể tải danh sách đã duyệt');
    approvedItems.value = [];
  } finally {
    approvedLoading.value = false;
  }
};

let approvedFetchTimer = null;
const scheduleFetchApproved = (delay = 500) => {
  if (approvedFetchTimer) clearTimeout(approvedFetchTimer);
  approvedFetchTimer = setTimeout(() => {
    fetchApprovedList();
    approvedFetchTimer = null;
  }, delay);
};

const approvedDisplayedItems = computed(() => {
  const q = (approvedQuery.value || '').toString().trim().toLowerCase();
  const list = approvedItems.value || [];
  if (!q) return list;
  return list.filter(i => {
    try {
      const a = (i.MaPXH || i.maPXH || '').toString().toLowerCase();
      const b = (i.MaHD || i.maHD || '').toString().toLowerCase();
      const c = (i.MaNV_Tao || i.maNV_Tao || '').toString().toLowerCase();
      return a.includes(q) || b.includes(q) || c.includes(q);
    } catch (e) { return false; }
  });
});

const fetchYeuCauList = async () => {
  ycLoading.value = true;
  ycItems.value = [];
  try {
    const params = {};
    if (ycStart.value) params.start = _fmt(ycStart.value);
    if (ycEnd.value) params.end = _fmt(ycEnd.value);
    if (ycMaNV.value && ycMaNV.value.toString().trim() !== '') params.maNV_Tao = ycMaNV.value.toString().trim();
    if (ycLoaiNguon.value !== null && ycLoaiNguon.value !== undefined) params.loaiNguon = ycLoaiNguon.value;
    // ensure trangThai provided (default 0)
    params.trangThai = ycTrangThai.value ?? 0;

    const res = await phieuxulyApi.list(params);
    const d = res?.data || res;
    ycItems.value = Array.isArray(d) ? d : (d?.data || []);
  } catch (err) {
    console.error('fetchYeuCauList error', err);
    ElMessage.error('Không thể tải danh sách yêu cầu');
    ycItems.value = [];
  } finally {
    ycLoading.value = false;
  }
};

// debounce auto-fetch when filters change
let ycFetchTimer = null;
const scheduleFetchYeuCau = (delay = 500) => {
  if (ycFetchTimer) clearTimeout(ycFetchTimer);
  ycFetchTimer = setTimeout(() => {
    fetchYeuCauList();
    ycFetchTimer = null;
  }, delay);
};

// Yêu cầu xử lý detail state & fetch
const ycDetailDialog = ref(false);
const ycDetailLoading = ref(false);
const ycDetailPhieu = ref(null);
const ycDetailChiTiets = ref([]);

// approve/edit mode state for YC detail
const ycEditMode = ref(false);
const ycEditPhieu = ref(null);
const ycEditChiTiets = ref([]);
const ycApproveLoading = ref(false);

const openYeuCauDetail = async (row) => {
  if (!row) return;
  const maPXH = row.MaPXH || row.maPXH || row.MaPxh || row.maPxh || row.MaPxh;
  if (!maPXH) return;
  ycDetailLoading.value = true;
  ycDetailDialog.value = true;
  ycEditMode.value = false;
  ycDetailPhieu.value = null;
  ycDetailChiTiets.value = [];
  try {
    const res = await api.get(`/PhieuXuLyHoanHuy/Details/${maPXH}`);
    const d = res?.data || res;
    ycDetailPhieu.value = d?.Phieu || d?.phieu || null;
    ycDetailChiTiets.value = Array.isArray(d?.ChiTiets) ? d.ChiTiets : (d?.chiTiets || []);
  } catch (err) {
    console.error('openYeuCauDetail error', err);
    ElMessage.error('Không thể tải chi tiết yêu cầu');
  } finally {
    ycDetailLoading.value = false;
  }
};

// open detail and immediately enter approve mode
const openYeuCauApprove = async (row) => {
  try {
    await openYeuCauDetail(row);
    // if detail loaded, enter edit/approve mode
    if (ycDetailPhieu.value) startApprove();
  } catch (e) {
    console.error('openYeuCauApprove error', e);
    ElMessage.error('Không thể mở chế độ duyệt');
  }
};

// Create cancel request from an approved request (prefill createCancel dialog)
const createCancelFromApproved = async (row) => {
  if (!row) return;
  const maPXH = row.MaPXH || row.maPXH || row.MaPxh || row.maPxh || row.MaPxh;
  if (!maPXH) return;
  try {
    const res = await api.get(`/PhieuXuLyHoanHuy/Details/${maPXH}`);
    const d = res?.data || res;
    const chi = Array.isArray(d?.ChiTiets) ? d.ChiTiets : (d?.chiTiets || []);
    if (!chi || chi.length === 0) {
      ElMessage.warning('Không có mục để tạo phiếu huỷ');
      return;
    }
    // Map to createCancelItems shape
    // use broad fallbacks for fields returned by different APIs
    createCancelItems.value = chi.map(it => ({
      maLo: it.maLo || it.MaLo || it.Lo || it.lo || '',
      maThuoc: it.maThuoc || it.MaThuoc || it.maThuocGoc || it.MaThuocGoc || it.MaThuocOriginal || '',
      tenThuoc: it.tenThuoc || it.TenThuoc || it.TenHang || it.tenHang || it.tenThuocGoc || it.TenThuocGoc || '',
      tenLoaiDonViGoc: it.tenLoaiDonViGoc || it.tenLoaiDonVi || it.TenLoaiDonVi || it.donVi || it.DonVi || '',
      hanSuDung: it.hanSuDung || it.HanSuDung || it.HSD || it.ngayHetHan || it.expiry || null,
      soLuongCon: Number(it.soLuongCon || it.SoLuongCon || it.soLuong || it.SoLuong || it.slCon || 0) || 0,
      soLuong: Number(it.soLuong || it.SoLuong || it.soLuongCon || it.SoLuongCon || 0) || 0,
      loaiXuLy: (typeof it.loaiXuLy !== 'undefined') ? !!it.loaiXuLy : false
    }));
    // mark source so dialog shows confirm-for-PXH action
    approvedSourceMaPXH.value = maPXH;
    ghiChuCancel.value = d?.Phieu?.ghiChu || '';
    createCancelDialog.value = true;
  } catch (err) {
    console.error('createCancelFromApproved error', err);
    ElMessage.error('Không thể tạo phiếu huỷ từ yêu cầu đã duyệt');
  }
};

const closeCreateCancelDialog = () => {
  createCancelDialog.value = false;
  approvedSourceMaPXH.value = null;
  createCancelItems.value = [];
  ghiChuCancel.value = '';
};

const submitConfirmCancelByPXH = async () => {
  if (!approvedSourceMaPXH.value) {
    ElMessage.warning('Không có phiếu đã duyệt để xác nhận huỷ');
    return;
  }
  createCancelLoading.value = true;
  try {
    const payload = {
      maPXH: approvedSourceMaPXH.value,
      maNV: authStore.user?.MaNV || authStore.user?.maNV || '',
      ghiChu: ghiChuCancel.value || ''
    };
    await api.post('/PhieuHuy/CreateByPXH', payload);
    ElMessage.success('Xác nhận huỷ thành công');
    closeCreateCancelDialog();
    // refresh relevant lists
    fetchApprovedList();
    fetchKhoList();
  } catch (err) {
    console.error('submitConfirmCancelByPXH error', err);
    ElMessage.error('Xác nhận huỷ thất bại: ' + (err.response?.data?.message || err.message));
  } finally {
    createCancelLoading.value = false;
  }
};

const startApprove = () => {
  if (!ycDetailPhieu.value) return;
  ycEditMode.value = true;
  // shallow copy to allow editing without mutating original until confirmed
  ycEditPhieu.value = Object.assign({}, ycDetailPhieu.value);
  // default approver to currently logged-in user
  try {
    ycEditPhieu.value.maNV_Duyet = authStore.user?.MaNV || authStore.user?.maNV || ycEditPhieu.value.maNV_Duyet || '';
  } catch (e) {
    ycEditPhieu.value.maNV_Duyet = ycEditPhieu.value.maNV_Duyet || '';
  }
  ycEditChiTiets.value = (ycDetailChiTiets.value || []).map(it => Object.assign({}, it));
};


const cancelApprove = () => {
  ycEditMode.value = false;
  ycEditPhieu.value = null;
  ycEditChiTiets.value = [];
};

const submitApprove = async () => {
  if (!ycEditPhieu.value) return;
  ycApproveLoading.value = true;
  try {
    const payload = {
      maPXH: ycEditPhieu.value.maPXH || ycEditPhieu.value.MaPXH || ycEditPhieu.value.maPxh || '',
      ghiChu: ycEditPhieu.value.ghiChu || '',
      maNV_Duyet: ycEditPhieu.value.maNV_Duyet || ycEditPhieu.value.maNV_Duyet || '',
      chiTiets: (ycEditChiTiets.value || []).map(it => ({
        maCTPXH: it.maCTPXH || it.MaCTPXH || it.maCtpXh || '',
        soLuong: Number(it.soLuong || 0),
        loaiXuLy: !!it.loaiXuLy
      }))
    };

    await api.put('/PhieuXuLyHoanHuy/Update', payload);
    ElMessage.success('Duyệt phiếu thành công');
    ycEditMode.value = false;
    ycDetailDialog.value = false;
    // refresh list
    fetchYeuCauList();
  } catch (err) {
    console.error('submitApprove error', err);
    ElMessage.error('Duyệt thất bại: ' + (err.response?.data?.message || err.message));
  } finally {
    ycApproveLoading.value = false;
  }
};

// auto-fetch when user changes filters (small debounce)
watch([ycStart, ycEnd, ycMaNV, ycLoaiNguon, ycQuery], () => {
  // only auto-fetch when the tab is active
  if (activeTab.value === 'yeucau') scheduleFetchYeuCau(400);
});

// approved filters auto-fetch
watch([approvedStart, approvedEnd, approvedMaNV, approvedLoaiNguon, approvedQuery], () => {
  if (activeTab.value === 'daduyet') scheduleFetchApproved(400);
});

const ycDisplayedItems = computed(() => {
  const q = (ycQuery.value || '').toString().trim().toLowerCase();
  const list = ycItems.value || [];
  if (!q) return list;
  return list.filter(i => {
    try {
      const a = (i.MaPXH || '').toString().toLowerCase();
      const b = (i.MaHD || '').toString().toLowerCase();
      const c = (i.NhanVienTaoName || '').toString().toLowerCase();
      return a.includes(q) || b.includes(q) || c.includes(q);
    } catch (e) { return false; }
  });
});

const fetchHoaDonList = async (status) => {
  hoadonLoading.value = true;
  hoadonItems.value = [];
  try {
    const params = {};
    if (status !== undefined && status !== null) params.status = status;
    const res = await hoadonApi.search(params);
    const d = res?.data?.data || res?.data || res;
    hoadonItems.value = Array.isArray(d) ? d : (d?.Items || []);
  } catch (err) {
    console.error('fetchHoaDonList error', err);
    ElMessage.error('Không thể tải danh sách hoá đơn');
    hoadonItems.value = [];
  } finally {
    hoadonLoading.value = false;
  }
};

const goToHoaDonDetail = (row) => {
  if (!row || !row.maHD) return;
  fetchHoaDonDetail(row.maHD);
};

// Invoice detail dialog state
const invoiceDetailDialog = ref(false);
const invoiceDetail = ref(null);
const invoiceItems = ref([]);

const fetchHoaDonDetail = async (maHd) => {
  if (!maHd) return;
  invoiceDetailDialog.value = true; // show loading dialog
  invoiceDetail.value = null;
  invoiceItems.value = [];
  try {
    const res = await hoadonApi.getChiTiet(maHd);
    const d = res?.data?.data || res?.data || res;
    invoiceDetail.value = d?.invoice || d?.Invoice || null;
    invoiceItems.value = d?.items || d?.Items || [];
  } catch (err) {
    console.error('fetchHoaDonDetail error', err);
    ElMessage.error('Không thể tải chi tiết hoá đơn');
    invoiceDetail.value = null;
    invoiceItems.value = [];
  } finally {
    // keep dialog open to show error or content; user can close
  }
};

// Invoice cancel (request) state & actions
const invoiceCancelDialog = ref(false);
const invoiceCancelItems = ref([]);
const invoiceCancelLoading = ref(false);
// per-item loaiXuLy is stored on each invoiceCancelItems element
const invoiceCancelNote = ref('');

const openInvoiceCancelDialog = () => {
  if (!invoiceDetail.value) {
    ElMessage.warning('Không có hóa đơn để thao tác');
    return;
  }
  // prepare items from invoiceItems
  invoiceCancelItems.value = (invoiceItems.value || []).map(it => ({
    maLo: it.maLo || it.MaLo || '',
    maThuoc: it.maThuoc || it.MaThuoc || '',
    tenThuoc: it.tenThuoc || it.TenThuoc || '',
    tenLoaiDonVi: it.tenLoaiDonVi || it.TenLoaiDonVi || it.tenLoaiDonVi || '',
    soLuongCon: Number(it.soLuong || it.SoLuong || 0) || 0,
    // use invoice quantity as cancel quantity (read-only)
    soLuong: Number(it.soLuong || it.SoLuong || 0) || 0,
    hanSuDung: it.hanSuDung || it.HanSuDung || it.hanSuDung || null,
    loaiXuLy: false,
  }));
  invoiceCancelNote.value = '';
  invoiceCancelDialog.value = true;
};

const submitInvoiceCancel = async () => {
  if (!invoiceCancelItems.value || invoiceCancelItems.value.length === 0) {
    ElMessage.warning('Chưa có lô nào để huỷ');
    return;
  }
  for (const it of invoiceCancelItems.value) {
    if (!it.soLuong || Number(it.soLuong) <= 0) {
      ElMessage.warning('Số lượng huỷ phải lớn hơn 0');
      return;
    }
    if (Number(it.soLuong) > Number(it.soLuongCon)) {
      ElMessage.warning('Số lượng huỷ không được lớn hơn số lượng trên hoá đơn');
      return;
    }
  }

  invoiceCancelLoading.value = true;
  try {
    const payload = {
      maNV: authStore.user?.MaNV || authStore.user?.maNV || '',
      loaiNguon: true,
      maHD: invoiceDetail.value?.maHD || invoiceDetail.value?.MaHD || null,
      ghiChu: invoiceCancelNote.value || '',
      chiTiets: invoiceCancelItems.value.map(it => ({ maLo: it.maLo, soLuong: Number(it.soLuong), loaiXuLy: !!it.loaiXuLy }))
    };

    await api.post('/PhieuXuLyHoanHuy/Create', payload);
    ElMessage.success('Yêu cầu huỷ hoá đơn đã được gửi');
    invoiceCancelDialog.value = false;
    invoiceDetailDialog.value = false;
    // refresh lists
    fetchHoaDonList(hoadonStatus.value);
  } catch (err) {
    console.error('submitInvoiceCancel error', err);
    ElMessage.error('Gửi yêu cầu huỷ thất bại: ' + (err.response?.data?.message || err.message));
  } finally {
    invoiceCancelLoading.value = false;
  }
};

// Map numeric status codes to readable labels
const statusLabel = (s) => {
  if (s === -3) return 'Chưa hoàn tất xử lý huỷ';
  if (s === -2) return 'Đã hoàn tất xử lý huỷ';
  if (s === -1) return 'Huỷ';
  return (s || '').toString();
};

const setDefaultRange = () => {
  const today = new Date();
  const first = new Date(today.getFullYear(), today.getMonth(), 1);
  const fmt = (dt) => {
    const y = dt.getFullYear();
    const m = String(dt.getMonth() + 1).padStart(2, '0');
    const d = String(dt.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };
  start.value = fmt(first);
  end.value = fmt(today);
};

const formatDate = (d) => {
  if (!d) return '';
  try { return new Date(d).toLocaleDateString('vi-VN'); } catch { return d; }
};

const tableRowStyle = (arg) => {
  const row = (arg && arg.row) ? arg.row : arg;
  const hsd = row?.hanSuDung || row?.HanSuDung || row?.HanSuDungStr || row?.HSD || null;
  if (!hsd) return {};
  try {
    // try flexible parse for dd/MM/yyyy or ISO
    let expiry = null;
    const s = hsd.toString();
    if (s.includes('/')) {
      const p = s.split('/').map(x => x.trim());
      if (p.length === 3) {
        const day = Number(p[0]);
        const month = Number(p[1]) - 1;
        const year = Number(p[2]);
        expiry = new Date(year, month, day);
      }
    }
    if (!expiry) {
      const d = new Date(s);
      if (!isNaN(d.getTime())) expiry = d;
    }
    if (!expiry) return {};
    const now = new Date();
    const diffDays = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 3600 * 24));
    if (diffDays <= 10) {
      return { color: '#b91c1c', fontWeight: '700', background: 'rgba(220,38,38,0.04)' };
    }
    if (diffDays <= 90) {
      return { color: '#6f42c1', background: 'rgba(128,0,128,0.04)' };
    }
  } catch (e) {
    return {};
  }
  return {};
};

const fetchKhoList = async () => {
  khoLoading.value = true;
  khoItems.value = [];
  try {
    const params = {};
    if (khoFilterMode.value === 'days') params.days = khoDays.value;
    else if (khoFilterMode.value === 'months') params.months = khoMonths.value;
    else if (khoFilterMode.value === 'years') params.years = khoYears.value;
    else if (khoFilterMode.value === 'fromDate' && khoFromDate.value) params.fromDate = khoFromDate.value;

    const res = await api.get('/ThuocView/SapHetHan', { params });
    const d = res?.data?.data || res?.data || res;
    khoItems.value = Array.isArray(d) ? d : (d?.Items || []);
  } catch (err) {
    console.warn('fetchKhoList error', err);
    ElMessage.error('Không thể tải danh sách thuốc sắp hết hạn');
    khoItems.value = [];
  } finally {
    khoLoading.value = false;
  }
};

const khoDisplayedItems = computed(() => {
  const q = (khoQuery.value || '').toString().trim().toLowerCase();
  const list = khoItems.value || [];
  if (!q) return list;
  return list.filter(i => {
    try {
      const maLo = (i.maLo || i.MaLo || '').toString().toLowerCase();
      const ten = (i.tenThuoc || i.TenThuoc || '').toString().toLowerCase();
      const donvi = (i.tenLoaiDonViGoc || i.tenLoaiDonVi || i.donVi || '').toString().toLowerCase();
      return maLo.includes(q) || ten.includes(q) || donvi.includes(q);
    } catch (e) {
      return false;
    }
  });
});

const khoPaginatedItems = computed(() => {
  const list = khoDisplayedItems.value || [];
  const startIdx = (khoCurrentPage.value - 1) * pageSize;
  return list.slice(startIdx, startIdx + pageSize);
});

const fetchList = async () => {
  loading.value = true;
  items.value = [];
  try {
    const params = {
      start: start.value,
      end: end.value,
      q: q.value,
      mode: cancelMode.value,
      tab: activeTab.value,
      status: filterStatus.value,
      lo: filterLoDangDung.value,
      loai: filterLoaiThuoc.value,
      donvi: filterDonVi.value,
    };
    const res = await api.get('/Thuoc/CanXuLy', { params });
    const d = res?.data?.data || res?.data || res;
    items.value = Array.isArray(d) ? d : (d?.Items || []);

    const unique = (arr) => Array.from(new Set(arr.filter(Boolean)));
    loDangDungOptions.value = unique((items.value || []).map(i => i.MaLo || i.MaLoGoc || '').filter(Boolean));
    loaiThuocOptions.value = unique((items.value || []).map(i => i.LoaiThuoc || i.Loai || i.MaLoai || '').filter(Boolean));
    donViOptions.value = unique((items.value || []).map(i => i.DonVi || i.MaLoaiDonViGocName || '').filter(Boolean));
  } catch (err) {
    console.warn('fetchList error', err);
    items.value = [];
    ElMessage.error('Không thể tải danh sách');
  } finally {
    loading.value = false;
  }
};

const displayedItems = computed(() => {
  let list = items.value || [];
  if (activeTab.value === 'kho') {
    list = list.filter(i => Boolean(i.MaKho || i.KhoId || (i.Nguon && i.Nguon.toString().toLowerCase() === 'kho')));
  }
  if (activeTab.value === 'hoadon') {
    list = list.filter(i => Boolean(i.MaPhieu || i.SoHoaDon || (i.Nguon && i.Nguon.toString().toLowerCase() === 'hoadon')));
  }

  if (filterStatus.value) list = list.filter(i => (i.TrangThai || '').toString().toLowerCase().includes(filterStatus.value));
  if (filterLoDangDung.value) list = list.filter(i => (i.MaLo || i.MaLoGoc || '').toString() === filterLoDangDung.value);
  if (filterLoaiThuoc.value) list = list.filter(i => (i.LoaiThuoc || i.Loai || '').toString() === filterLoaiThuoc.value);
  if (filterDonVi.value) list = list.filter(i => (i.DonVi || i.MaLoaiDonViGocName || '').toString() === filterDonVi.value);

  if (q.value && q.value.toString().trim() !== '') {
    const term = q.value.toString().toLowerCase();
    list = list.filter(it => {
      try { return (it.TenThuoc + ' ' + it.MaThuoc + ' ' + (it.MaLo||'')).toLowerCase().includes(term); } catch { return false; }
    });
  }

  return list;
});

const paginatedItems = computed(() => {
  const list = displayedItems.value || [];
  const startIdx = (currentPage.value - 1) * pageSize;
  return list.slice(startIdx, startIdx + pageSize);
});

const refresh = () => {
  q.value = '';
  setDefaultRange();
  fetchList();
};

const viewItem = (row) => {
  detailItem.value = row;
  detailDialog.value = true;
};

const markHandled = async (row) => {
  try {
    await api.post(`/Thuoc/MarkHandled/${row.MaThuoc}`);
    ElMessage.success('Đã đánh dấu là đã xử lý');
    fetchList();
  } catch (err) {
    console.error('markHandled error', err);
    ElMessage.error('Không thể cập nhật trạng thái');
  }
};

const goToEdit = (row) => {
  if (!row) return;
  window.location.href = `#/admin/thuoc/${row.MaThuoc}`;
};

const quickCancel = (row) => {
  cancelItem.value = row;
  cancelReason.value = 'Hết hạn sử dụng';
  cancelDialog.value = true;
};

const submitQuickCancel = async () => {
  if (!cancelItem.value) return;
  if (!cancelReason.value) {
    ElMessage.warning('Vui lòng nhập lý do huỷ');
    return;
  }
  
  cancelLoading.value = true;
  try {
    const payload = {
      maNV: authStore.user?.MaNV || authStore.user?.maNV || '', // Fallback if needed
      maThuoc: cancelItem.value.maThuoc,
      maLoaiDonVi: cancelItem.value.maLoaiDonViGoc || cancelItem.value.donViGoc, // Ensure correct field mapping
      soLuong: cancelItem.value.soLuongCon,
      lyDo: cancelReason.value,
      maLo: cancelItem.value.maLo // Assuming API might need maLo to identify the specific batch
    };
    
    // Note: The user request specified /api/PhieuXuLyHoanHuy/QuickCreate
    // Adjusting to match the provided image/request exactly if possible, or standard convention
    await api.post('/PhieuXuLyHoanHuy/QuickCreate', payload);
    
    ElMessage.success('Huỷ nhanh thành công');
    cancelDialog.value = false;
    fetchKhoList(); // Refresh list
  } catch (err) {
    console.error('submitQuickCancel error', err);
    ElMessage.error('Huỷ nhanh thất bại: ' + (err.response?.data?.message || err.message));
  } finally {
    cancelLoading.value = false;
  }
};

onMounted(async () => {
  setDefaultRange();
  fetchKhoList();
  fetchList();
  // set default range for Yêu cầu xử lý: start = first day of this month, end = now
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
    ycStart.value = startOfMonth;
    ycEnd.value = now;
  } catch (e) {
    ycStart.value = null;
    ycEnd.value = null;
  }

    // Fetch employee list
    try {
      const response = await api.get('/NhanVien');
      // API returns fields like maNV / hoTen
      nhanVienList.value = Array.isArray(response?.data) ? response.data : (response?.data?.data || []);
    } catch (error) {
      console.error('Failed to load employee list:', error);
    }
});

watch([start, end], () => {
  if (start.value && end.value) fetchList();
});

watch(cancelMode, () => { fetchList(); });

watch(activeTab, () => {
  if (activeTab.value === 'kho') fetchKhoList();
  else if (activeTab.value === 'hoadon') fetchHoaDonList(hoadonStatus.value);
  else if (activeTab.value === 'yeucau') fetchYeuCauList();
  else if (activeTab.value === 'daduyet') fetchApprovedList();
  else fetchList();
});

watch([filterStatus, filterLoDangDung, filterLoaiThuoc, filterDonVi], () => {});

watch(() => displayedItems.value.length, () => { currentPage.value = 1; });

// Kho tab filters auto-fetch
watch([khoFilterMode, khoDays, khoMonths, khoYears, khoFromDate], () => {
  khoCurrentPage.value = 1;
  if (activeTab.value === 'kho') fetchKhoList();
});

// Reset kho pagination when search changes
watch(khoQuery, () => { khoCurrentPage.value = 1; });

// Row class helper for invoice items (colors by expiry)
const invoiceRowClass = (arg) => {
  const row = (arg && arg.row) ? arg.row : arg;
  const hsd = row?.hanSuDung || row?.HanSuDung || row?.HanSuDungStr || row?.HSD || null;
  if (!row || !hsd) return '';
  try {
    const expiry = parseDateFlexible(hsd) || new Date(hsd);
    if (!expiry || isNaN(expiry.getTime())) return '';
    const now = new Date();
    const diffDays = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 3600 * 24));
    if (diffDays <= 10) return 'expiry-red';
    if (diffDays <= 90) return 'expiry-purple';
  } catch (e) {
    return '';
  }
  return '';
};
// parse a date that may be ISO or dd/MM/yyyy and return a Date or null
const parseDateFlexible = (value) => {
  if (!value) return null;
  try {
    if (value instanceof Date) return value;
    const s = value.toString();
    // ISO-like
    if (s.includes('T') || s.includes('-')) {
      const d = new Date(s);
      if (!isNaN(d.getTime())) return d;
    }
    // dd/MM/yyyy
    if (s.includes('/')) {
      const parts = s.split('/').map(p => p.trim());
      if (parts.length === 3) {
        const day = Number(parts[0]);
        const month = Number(parts[1]) - 1;
        const year = Number(parts[2]);
        const d = new Date(year, month, day);
        if (!isNaN(d.getTime())) return d;
      }
    }
    // fallback
    const d2 = new Date(s);
    if (!isNaN(d2.getTime())) return d2;
  } catch (e) {}
  return null;
};

// row-style returns inline style object so it always applies
const invoiceRowStyle = (arg) => {
  const row = (arg && arg.row) ? arg.row : arg;
  const hsd = row?.hanSuDung || row?.HanSuDung || row?.HanSuDungStr || row?.HSD || null;
  if (!row || !hsd) return {};
  try {
    const expiry = parseDateFlexible(hsd);
    if (!expiry) return {};
    const now = new Date();
    const diffDays = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 3600 * 24));
    // debug: helps to inspect values in browser console when dialog open
    // console.debug(`[invoiceRowStyle]`, row.maCTHD || row.MaCTHD || row.maThuoc || row.MaThuoc, 'hsd=', hsd, 'diffDays=', diffDays);
    if (diffDays <= 10) {
      return { color: '#b91c1c', background: 'rgba(220,38,38,0.06)' };
    }
    if (diffDays <= 90) {
      return { color: '#6f42c1', background: 'rgba(128,0,128,0.06)' };
    }
  } catch (e) {
    return {};
  }
  return {};
};
</script>

<style scoped>


.controls { margin-top:12px; display:flex; gap:12px; align-items:center; flex-wrap:wrap }
.controls .field { min-width:180px; display:flex; gap:8px; align-items:center; flex: 0 1 260px }
.controls .label { font-weight:600; color:var(--el-text-color-secondary); flex:0 0 72px; margin-right:8px; white-space:nowrap }
.control-el { width:100%; box-sizing:border-box }

.drug-name { word-break: break-word; white-space: normal; overflow-wrap: anywhere; }
.so-luong { text-align: right; font-weight: 700 }

@media (max-width: 768px) {
  .controls .field { flex-direction:column; align-items:flex-start }
  .controls .label { margin-bottom:6px; flex:0 0 auto }
}

.yc-filters { display:flex; gap:12px; align-items:flex-start; flex-wrap:wrap }
.yc-field { display:flex; flex-direction:column; gap:6px; min-width:160px }
.yc-field label { font-size:13px; color:var(--el-text-color-secondary); }
.yc-search { min-width:260px }

/* New styles for the compact single-row Yêu cầu xử lý filters (card-like) */
.ycau-filters-grid {
  padding:10px;
  background:#fbfdfe;
  border-radius:8px;
  border:1px solid #eef3f7;
  display: grid;
  grid-template-columns: repeat(5, minmax(180px, 1fr));
  gap: 16px;
  align-items: start;
}
.ycau-filters-grid .yc-filter-field { display:flex; flex-direction:column }
.ycau-filters-grid .yc-filter-field label { text-transform:uppercase; font-size:12px; color:#6b7280; margin-bottom:6px }
.ycau-filters-grid .el-input__inner, .ycau-filters-grid .el-date-editor--date .el-input__inner {
  height:36px; padding:6px 10px; font-size:13px; border-radius:6px
}
.ycau-filters-grid .el-select .el-input__inner { height:36px }
.ycau-filters-grid .el-input__inner::placeholder { color:#9aa6b2 }

/* Action buttons row: keep two buttons on one horizontal line */
.action-buttons-row { display:flex; gap:8px; align-items:center; justify-content:center; white-space:nowrap }
.action-buttons-row .el-button { flex: 0 0 auto }
@media (max-width: 480px) {
  .action-buttons-row { flex-wrap:wrap; justify-content:flex-start }
}

@media (max-width:900px) {
  .ycau-filters-grid { grid-template-columns: repeat(2, minmax(120px, 1fr)) !important }
}

@media (max-width: 900px) {
  .yc-field { min-width:140px }
  .yc-search { min-width:200px }
}

/* Hoá đơn filter: keep on one line when possible */
.hoadon-filters { display:flex; gap:12px; align-items:center; flex-wrap:nowrap }
.hoadon-filters .hoadon-label { font-weight:600; white-space:nowrap }

@media (max-width: 560px) {
  .hoadon-filters { flex-wrap:wrap }
}

/* Make Hoá đơn select larger for readability and easier clicking */
.hoadon-filters .hoadon-select { min-width:240px }
.hoadon-filters .hoadon-select .el-input__inner { height:40px; font-size:14px; padding:6px 12px }
.hoadon-filters .hoadon-select .el-input__inner::placeholder { color: #888 }
</style>
<style scoped>
.page-card { margin-top: 0 !important; }
.page-header { margin-top: 0; }
.kho-tab-content { padding-top: 0; }
</style>

<style scoped>
/* Tall dialog variant to avoid inner page scrolling */
.tall-dialog .el-dialog__body {
  max-height: calc(100vh - 220px) !important;
  overflow: auto !important;
}
.tall-dialog .el-dialog__footer {
  position: sticky;
  bottom: 0;
  background: #fff;
  padding: 12px 24px;
  z-index: 10;
}
@media (max-width: 768px) {
  .tall-dialog .el-dialog__body { max-height: calc(100vh - 140px) !important }
}
</style>
<!-- Global styles for expiry highlighting (not scoped so they affect child-rendered table rows) -->
<style>
.expiry-red, .expiry-red td {
  background-color: rgba(220,38,38,0.06) !important;
  color: #b91c1c !important;
}
.expiry-red td * { color: #b91c1c !important }
.expiry-purple, .expiry-purple td {
  background-color: rgba(128,0,128,0.06) !important;
  color: #6f42c1 !important;
}
.expiry-purple td * { color: #6f42c1 !important }
</style>