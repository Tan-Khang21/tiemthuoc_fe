import axios from 'axios';

// Tạo axios instance với base URL của API backend
const instance = axios.create({
  baseURL: 'https://localhost:7283/api', // Thay đổi URL này theo cấu hình của bạn
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - thêm token vào header nếu có
instance.interceptors.request.use(
  (config) => {
    const user = localStorage.getItem('user');
    if (user) {
      const userData = JSON.parse(user);
      if (userData.token) {
        config.headers.Authorization = `Bearer ${userData.token}`;
      }
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
    // Trả về response nguyên bản, không extract data
    return response;
  },
  (error) => {
    if (error.response) {
      // Server trả về error response
      if (error.response.status === 401) {
        // Unauthorized - clear user data và redirect to login
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
      return Promise.reject(error.response.data || error.response);
    }
    return Promise.reject(error);
  }
);

export default instance;
