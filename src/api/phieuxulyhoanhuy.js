import axios from './axios';

export default {
  // Lấy danh sách phiếu xử lý huỷ với filter params
  list(params) {
    return axios.get('/PhieuXuLyHoanHuy', { params });
  },

  // Lấy chi tiết phiếu theo mã
  getById(maPXH) {
    return axios.get(`/PhieuXuLyHoanHuy/${maPXH}`);
  },

  // Thực hiện duyệt/ cập nhật trạng thái
  update(maPXH, data) {
    return axios.put(`/PhieuXuLyHoanHuy/${maPXH}`, data);
  },
};
