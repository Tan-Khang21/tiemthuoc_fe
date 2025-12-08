import axios from './axios';

export default {
  // Get all categories
  getAll() {
    return axios.get('/LoaiThuoc');
  },

  // Get category by ID
  getById(maLoaiThuoc) {
    return axios.get(`/LoaiThuoc/${maLoaiThuoc}`);
  },

  // Create new category
  create(data) {
    return axios.post('/LoaiThuoc', data);
  },

  // Update category
  update(maLoaiThuoc, data) {
    return axios.put(`/LoaiThuoc/${maLoaiThuoc}`, data);
  },

  // Delete category
  delete(maLoaiThuoc) {
    return axios.delete(`/LoaiThuoc/${maLoaiThuoc}`);
  }
};
