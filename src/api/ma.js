import axios from './axios';

export default {
  // Tìm mã theo Code chính xác
  getByCode(code) {
    return axios.get('/Ma/ByCode', { params: { code } });
  },

  // Tìm kiếm mã (chứa)
  search(code) {
    return axios.get('/Ma/Search', { params: { code } });
  },

  // Lấy mã theo MaCode
  getByMa(maCode) {
    return axios.get(`/Ma/${maCode}`);
  },

  // Lấy tất cả mã
  getAll() {
    return axios.get('/Ma');
  },
};
