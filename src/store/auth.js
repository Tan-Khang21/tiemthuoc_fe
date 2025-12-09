import { defineStore } from 'pinia';
import api from '@/api';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    isAuthenticated: false,
  }),

  getters: {
    isAdmin: (state) => {
      // ChucVu is the source of truth: 1 = admin, 0 = staff
      // Ignore conflicting IsAdmin/VaiTro fields from backend as they're unreliable
      if (!state.user) return false;
      return state.user.ChucVu === 1 || state.user.ChucVu === '1';
    },
    hasCustomerInfo: (state) => {
      return state.user && state.user.HasCustomerInfo === true;
    },
    currentUser: (state) => state.user,
  },

  actions: {
    // Khởi tạo auth state từ localStorage
    initAuth() {
      const userData = localStorage.getItem('user');
      if (userData) {
        try {
          this.user = JSON.parse(userData);
          this.isAuthenticated = true;
        } catch (e) {
          this.logout();
        }
      }
    },

    // Đăng nhập
    async login(credentials) {
      try {
        const response = await api.taikhoan.login(credentials);
        console.log('Login response:', response);
        console.log('Login response.data:', response.data);
        
        // Backend trả về response.data chứa LoginResponse
        if (response.data) {
          // Lấy hoTen từ employee data hoặc từ response trực tiếp
          const employeeData = response.data.nhanVien || response.data.employee || response.data;
          const tenDangNhap = response.data.tenDangNhap || response.data.TenDangNhap;
          const userData = {
            MaTK: response.data.maTK || response.data.MaTK,
            TenDangNhap: tenDangNhap,
            HoTen: employeeData.hoTen || employeeData.HoTen || response.data.hoTen || response.data.HoTen || tenDangNhap,
            Email: response.data.email || response.data.Email,
            MaKH: response.data.maKH || response.data.MaKH,
            MaNV: response.data.maNV || response.data.MaNV || employeeData.maNV || employeeData.MaNV,
            VaiTro: response.data.vaiTro || response.data.VaiTro,
            ChucVu: response.data.chucVu !== undefined ? response.data.chucVu : (response.data.ChucVu !== undefined ? response.data.ChucVu : (employeeData.chucVu !== undefined ? employeeData.chucVu : employeeData.ChucVu)),
            HasCustomerInfo: response.data.hasCustomerInfo || response.data.HasCustomerInfo,
            IsAdmin: response.data.isAdmin || response.data.IsAdmin
          };
          
          console.log('User data to save:', userData);
          
          this.user = userData;
          this.isAuthenticated = true;
          localStorage.setItem('user', JSON.stringify(userData));
          
          return { 
            success: true, 
            data: userData,
            message: response.data.message || response.data.Message 
          };
        }
        return { success: false, message: 'Đăng nhập thất bại' };
      } catch (error) {
        console.error('Login error:', error);
        
        let errorMsg = 'Có lỗi xảy ra khi đăng nhập';
        
        if (error.response) {
          // Xử lý các dạng response khác nhau từ backend
          const data = error.response.data;
          
          if (typeof data === 'string') {
            errorMsg = data;
          } else if (data?.message) {
            errorMsg = data.message;
          } else if (data?.Message) {
            errorMsg = data.Message;
          } else if (data?.errors) {
            // Validation errors
            const firstError = Object.values(data.errors)[0];
            errorMsg = Array.isArray(firstError) ? firstError[0] : firstError;
          } else if (error.response.status === 401) {
            errorMsg = 'Tên đăng nhập hoặc mật khẩu không đúng!';
          } else if (error.response.status === 404) {
            errorMsg = 'Tài khoản không tồn tại!';
          } else if (error.response.status === 400) {
            errorMsg = 'Thông tin đăng nhập không hợp lệ!';
          }
        } else if (error.message) {
          errorMsg = error.message;
        }
        
        return { 
          success: false, 
          message: errorMsg
        };
      }
    },

    // Đăng ký
    async register(userData) {
      try {
        const response = await api.taikhoan.register(userData);
        console.log('Register response:', response);
        // Backend trả về { Message: "..." }
        if (response.data && response.data.Message) {
          return { success: true, message: response.data.Message };
        }
        return { success: true, message: 'Đăng ký thành công' };
      } catch (error) {
        console.error('Register error:', error);
        
        // Xử lý lỗi từ backend
        let errorMsg = 'Có lỗi xảy ra khi đăng ký';
        
        if (error.response) {
          // Backend trả về lỗi
          if (typeof error.response.data === 'string') {
            errorMsg = error.response.data;
          } else if (error.response.data?.message) {
            errorMsg = error.response.data.message;
          } else if (error.response.data?.Message) {
            errorMsg = error.response.data.Message;
          }
        } else if (error.message) {
          errorMsg = error.message;
        }
        
        return { 
          success: false, 
          message: errorMsg
        };
      }
    },

    // Đăng xuất
    logout() {
      this.user = null;
      this.isAuthenticated = false;
      localStorage.removeItem('user');
    },

    // Kiểm tra username
    async checkUsername(username) {
      try {
        const response = await api.taikhoan.checkUsername(username);
        return response;
      } catch (error) {
        console.error('Check username error:', error);
        return { exists: false };
      }
    },
  },
});
