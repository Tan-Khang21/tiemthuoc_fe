import axios from './axios';

export default {
  // Lấy tất cả nhà cung cấp
  getAll() {
    return axios.get('/NhaCungCap');
  },

  // Lấy chi tiết nhà cung cấp
  getById(maNcc) {
    return axios.get(`/NhaCungCap/${maNcc}`);
  },

  // Tạo nhà cung cấp mới
  create(data) {
    return axios.post('/NhaCungCap', data);
  },

  // Cập nhật nhà cung cấp
  update(maNcc, data) {
    return axios.put(`/NhaCungCap/${maNcc}`, data);
  },

  // Xóa nhà cung cấp
  delete(maNcc) {
    return axios.delete(`/NhaCungCap/${maNcc}`);
  },
};
