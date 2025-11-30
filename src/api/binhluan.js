import axios from './axios';

export default {
  // Lấy 1 bình luận và toàn bộ replies con
  getById(maBL) {
    return axios.get(`/BinhLuan/${maBL}`);
  },

  // Lấy toàn bộ cây bình luận theo sản phẩm
  getByThuoc(maThuoc) {
    return axios.get(`/BinhLuan/thuoc/${maThuoc}`);
  },

  // Lấy danh sách bình luận gốc kèm replies
  getRootsByThuoc(maThuoc) {
    return axios.get(`/BinhLuan/thuoc/${maThuoc}/roots`);
  },

  // Lấy danh sách bình luận chưa được trả lời theo sản phẩm
  getUnansweredByThuoc(maThuoc) {
    return axios.get(`/BinhLuan/thuoc/${maThuoc}/unanswered`);
  },

  // Lấy danh sách tất cả bình luận chưa được trả lời (Admin)
  getAllUnanswered() {
    return axios.get('/BinhLuan/unanswered');
  },

  // Lấy danh sách root kèm status (Admin dashboard)
  getRootsStatus() {
    return axios.get('/BinhLuan/roots/status');
  },

  // Tạo bình luận hoặc trả lời
  create(data) {
    return axios.post('/BinhLuan', data);
  },

  // Xóa bình luận
  delete(maBL) {
    return axios.delete(`/BinhLuan/${maBL}`);
  },
  
  // Lấy tất cả bình luận (cho admin - fallback if needed)
  getAll() {
    return axios.get('/BinhLuan');
  }
};
