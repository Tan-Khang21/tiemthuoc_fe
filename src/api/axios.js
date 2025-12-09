import axios from 'axios';

// Tạo axios instance với base URL của API backend
const instance = axios.create({
  baseURL: 'https://kltn-l679.onrender.com/api',
  timeout: 30000,
});

// Helper function: Kiểm tra token còn hạn không
function isTokenExpired(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
}

// Request interceptor - thêm JWT token vào header nếu có
instance.interceptors.request.use(
  (config) => {
    // Lấy token từ localStorage (key 'token')
    const token = localStorage.getItem('token');
    if (token) {
      // Kiểm tra token còn hạn không
      if (isTokenExpired(token)) {
        // Token hết hạn - xóa và redirect
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
        return Promise.reject(new Error('Token expired'));
      }
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - xử lý response và error
instance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      const status = error.response.status;
      
      // 401 Unauthorized - Token không hợp lệ hoặc hết hạn
      if (status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
      }
      
      // 403 Forbidden - Không có quyền truy cập
      if (status === 403) {
        console.error('Không có quyền truy cập tài nguyên này');
        // Có thể hiển thị thông báo lỗi ở đây
      }
    }
    return Promise.reject(error);
  }
);

export default instance;
