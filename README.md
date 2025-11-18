# Frontend Vue.js cho Nhà Thuốc MELON

## ✅ Đã hoàn thành

Dự án frontend Vue.js đã được xây dựng thành công dựa trên:
- **FE_QLTiemThuoc** (Frontend cũ) - Tham khảo các chức năng
- **BE_QLTiemThuoc** (Backend API) - Kết nối với các endpoints

### 1. Cấu trúc dự án
- ✅ Vite + Vue 3 + Element Plus + Tailwind CSS
- ✅ Pinia store quản lý state (thay thế Vuex)
- ✅ Vue Router với authentication guards
- ✅ Axios instance với interceptors

### 2. API Services (src/api/)
Đã tạo đầy đủ các services kết nối với Backend:
- thuoc, hoadon, phieunhap, khachhang, nhacungcap, taikhoan, thuocview

### 3. Views đã hoàn thành

#### Authentication
- ✅ Login, Register với validation

#### User (Khách hàng)
- ✅ Danh sách thuốc (tìm kiếm, lọc theo loại)
- ✅ Chi tiết thuốc
- ✅ Giỏ hàng (thêm/xóa/cập nhật số lượng)
- ✅ Đơn hàng (hiện tại & lịch sử)
- ✅ Profile

#### Admin (Quản trị)
- ✅ Quản lý thuốc (CRUD hoàn chỉnh)
- ⚠️ Các module khác (placeholder - cần phát triển)

## 🚀 Cài đặt và chạy

### Bước 1: Cài đặt dependencies
```bash
cd tiemthuoc_fe
npm install
```

### Bước 2: Cấu hình API URL
Kiểm tra file `src/api/axios.js`:
```javascript
baseURL: 'https://localhost:7283/api'
```

### Bước 3: Chạy ứng dụng
```bash
npm run dev
```

Ứng dụng: http://localhost:5173

## 📚 Tài liệu

Xem file **HUONG_DAN.md** để biết:
- Hướng dẫn chi tiết phát triển
- Danh sách API endpoints
- Ví dụ code cho các module
- Tips và best practices

## 🎯 Tính năng chính

### Khách hàng
✅ Xem và tìm kiếm thuốc
✅ Thêm vào giỏ hàng
✅ Đặt hàng online
✅ Xem lịch sử đơn hàng

### Quản trị
✅ Quản lý thuốc (CRUD)
⚠️ Quản lý NCC, Phiếu nhập, Hóa đơn, Kho (cần phát triển)

## 📦 Dependencies

- Vue 3.5.21
- Vue Router 4.5.1
- Pinia 2.1.7
- Element Plus 2.11.4
- Axios 1.12.2
- Tailwind CSS 4.1.13

## 🔧 Build & Deploy

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

---

**Tạo bởi GitHub Copilot - Chúc bạn phát triển thành công! 🎉**
