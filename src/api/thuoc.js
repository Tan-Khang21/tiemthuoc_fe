import axios from './axios';

export default {
  // Lấy danh sách thuốc
  getAll() {
    return axios.get('/Thuoc');
  },

  // Lấy danh sách thuốc có tồn kho
  getListThuocTonKho() {
    return axios.get('/Thuoc/ListThuocTonKho');
  },

  // Lấy thuốc theo loại (có tồn kho)
  getByLoaiTonKho(maLoaiThuoc) {
    return axios.get(`/Thuoc/ByLoaiTonKho/${maLoaiThuoc}`);
  },

  // Lấy thuốc theo loại (tất cả)
  getByLoai(maLoaiThuoc) {
    return axios.get(`/Thuoc/ByLoai/${maLoaiThuoc}`);
  },

  // Lấy chi tiết thuốc
  getById(maThuoc) {
    return axios.get(`/Thuoc/${maThuoc}`);
  },

  // Lấy top loại thuốc
  getTopLoaiThuoc() {
    return axios.get('/Thuoc/TopLoaiThuoc');
  },

  // Lấy loại đơn vị
  getLoaiDonVi() {
    return axios.get('/Thuoc/LoaiDonVi');
  },

  // Lấy giá thuốc
  getGiaThuocs(maThuoc) {
    return axios.get(`/Thuoc/${maThuoc}/GiaThuocs`);
  },

  // Tạo thuốc mới
  create(formData) {
    return axios.post('/Thuoc', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Cập nhật thuốc
  update(maThuoc, formData) {
    return axios.put(`/Thuoc/${maThuoc}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Xóa thuốc
  delete(maThuoc) {
    return axios.delete(`/Thuoc/${maThuoc}`);
  },
};
