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

  // Tìm thuốc theo code (barcode)
  getByCode(code) {
    return axios.get(`/Thuoc/ByCode/${code}`);
  },

  // Tạo thuốc mới
  create(formData) {
    // Let the browser/axios set the Content-Type (with boundary) for FormData
    return axios.post('/Thuoc', formData);
  },

  // Cập nhật thuốc
  update(maThuoc, formData) {
    // Let the browser/axios set the Content-Type (with boundary) for FormData
    return axios.put(`/Thuoc/${maThuoc}`, formData);
  },

  // Xóa thuốc
  delete(maThuoc) {
    return axios.delete(`/Thuoc/${maThuoc}`);
  },

  // Upload ảnh sản phẩm
  uploadImage(formData) {
    return axios.post('/Images/UploadToProduct', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Lấy danh sách ảnh có sẵn
  getExistingImages() {
    return axios.get('/Images/List');
  },
};
