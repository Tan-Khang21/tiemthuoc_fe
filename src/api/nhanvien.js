import axios from './axios';

export default {
  // Lấy tất cả nhân viên
  getAll() {
    return axios.get('/NhanVien');
  },

  // Lấy nhân viên theo mã
  getById(maNV) {
    return axios.get(`/NhanVien/${maNV}`);
  },
};
