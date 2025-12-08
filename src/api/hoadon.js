import axios from './axios';

export default {
  // Tìm kiếm hóa đơn theo khoảng thời gian
  search(params) {
    return axios.get('/HoaDon/Search', { params });
  },

  // Lấy chi tiết hóa đơn
  getChiTiet(maHd) {
    return axios.get(`/HoaDon/ChiTiet/${maHd}`);
  },

  // Lấy tổng hợp chi tiết hóa đơn
  getChiTietSummary(maHd) {
    return axios.get(`/HoaDon/ChiTiet/Summary/${maHd}`);
  },

  // Lấy lịch sử hóa đơn theo khách hàng
  getHistoryByKhachHang(maKh) {
    return axios.get(`/HoaDon/HistoryByKhachHang/${maKh}`);
  },

  // Tạo hóa đơn mới (trực tiếp)
  create(data) {
    return axios.post('/HoaDon/Create', data);
  },

  // Tạo hóa đơn online
  createOnline(data) {
    return axios.post('/HoaDon/CreateOnline', data);
  },

  // Gửi hóa đơn cho khách hàng
  sendToCustomer(maHd) {
    return axios.post(`/HoaDon/SendToCustomer/${maHd}`);
  },

  // Hủy hóa đơn
  cancel(maHd) {
    return axios.post(`/HoaDon/Cancel/${maHd}`);
  },
};
