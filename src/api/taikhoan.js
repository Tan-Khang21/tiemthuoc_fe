import axios from './axios';

export default {
  // Đăng nhập
  login(data) {
    return axios.post('/TaiKhoan/Login', data);
  },

  // Đăng ký
  register(data) {
    return axios.post('/TaiKhoan', data);
  },

  // Kiểm tra username
  checkUsername(username) {
    return axios.get(`/TaiKhoan/CheckUsername?username=${username}`);
  },

  // Quên mật khẩu
  forgotPassword(data) {
    return axios.post('/TaiKhoan/ForgotPassword', data);
  },

  // Đổi mật khẩu
  changePassword(data) {
    return axios.post('/TaiKhoan/ChangePassword', data);
  },
};
