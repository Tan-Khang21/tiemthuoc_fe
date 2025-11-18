import axios from './axios';

export default {
  // Lấy thuốc chưa tách lẻ
  getChuaTachLe() {
    return axios.get('/ThuocView/ChuaTachLe');
  },

  // Lấy thuốc đã tách lẻ
  getDaTachLe() {
    return axios.get('/ThuocView/DaTachLe');
  },

  // Lấy tổng số lượng còn
  getTongSoLuongCon() {
    return axios.get('/ThuocView/TongSoLuongCon');
  },
};
