import axios from './axios';

export default {
  // Lấy tất cả khách hàng
  getAll() {
    return axios.get('/KhachHang');
  },

  // Lấy chi tiết khách hàng
  getById(maKh) {
    return axios.get(`/KhachHang/${maKh}`);
  },

  // Tạo khách hàng mới
  create(data) {
    return axios.post('/KhachHang', data);
  },

  // Cập nhật khách hàng
  update(maKh, data) {
    return axios.put(`/KhachHang/${maKh}`, data);
  },

  // Xóa khách hàng
  delete(maKh) {
    return axios.delete(`/KhachHang/${maKh}`);
  },
};
