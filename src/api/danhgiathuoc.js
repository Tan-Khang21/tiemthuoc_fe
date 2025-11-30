import axios from "./axios";

export default {
  // 1. Lấy 1 đánh giá
  getById(maDanhGia) {
    return axios.get(`/DanhGiaThuoc/${maDanhGia}`);
  },

  // 2. Lấy danh sách đánh giá của 1 thuốc
  getByThuoc(maThuoc) {
    return axios.get(`/DanhGiaThuoc/thuoc/${maThuoc}`);
  },

  // 3. Lấy danh sách đánh giá của 1 khách
  getByKhachHang(maKh) {
    return axios.get(`/DanhGiaThuoc/khachhang/${maKh}`);
  },

  // 4. Danh sách sản phẩm khách có thể đánh giá
  getEligible(maKh) {
    return axios.get(`/DanhGiaThuoc/eligible/${maKh}`);
  },

  // 5. Tạo mới hoặc cập nhật (upsert)
  upsert(data) {
    return axios.post("/DanhGiaThuoc", data);
  },

  // 6. Cập nhật theo mã đánh giá
  update(maDanhGia, data) {
    return axios.put(`/DanhGiaThuoc/${maDanhGia}`, data);
  },

  // 7. Xóa đánh giá
  delete(maDanhGia) {
    return axios.delete(`/DanhGiaThuoc/${maDanhGia}`);
  },
};
