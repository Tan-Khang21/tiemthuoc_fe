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

  // Lấy chi tiết phiếu nhập
  getChiTietByMaPN(maPN) {
    return axios.get('/PhieuNhap/GetChiTietPhieuNhapByMaPN', {
      params: { maPN },
    });
  },
};
