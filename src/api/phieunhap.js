import axios from './axios';

export default {
  // Lấy phiếu nhập theo khoảng thời gian
  getByDateRange(params) {
    return axios.get('/PhieuNhap/GetByDateRange', { params });
  },

  // Thêm phiếu nhập
  addPhieuNhap(data) {
    return axios.post('/PhieuNhap/AddPhieuNhap', data);
  },

  // Cập nhật phiếu nhập (PUT /PhieuNhap/UpdatePhieuNhap/{maPN})
  updatePhieuNhap(maPN, data) {
    // ensure maPN is URL-encoded (slashes become %2F, etc.)
    const encoded = encodeURIComponent(String(maPN || ''));
    return axios.put(`/PhieuNhap/UpdatePhieuNhap/${encoded}`, data);
  },

  // Lấy chi tiết phiếu nhập
  getChiTietByMaPN(maPN) {
    return axios.get('/PhieuNhap/GetChiTietPhieuNhapByMaPN', {
      params: { maPN },
    });
  },

  // Xóa phiếu nhập theo mã (DELETE /PhieuNhap/DeletePhieuNhap/{maPN})
  deletePhieuNhap(maPN) {
    const encoded = encodeURIComponent(String(maPN || ''));
    return axios.delete(`/PhieuNhap/DeletePhieuNhap/${encoded}`);
  },
};
