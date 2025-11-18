import { defineStore } from 'pinia';
import api from '@/api';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    isAuthenticated: false,
  }),

  getters: {
    isAdmin: (state) => {
      return state.user && (state.user.IsAdmin === true || state.user.MaNV);
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
          const userData = {
            MaTK: response.data.maTK || response.data.MaTK,
            TenDangNhap: response.data.tenDangNhap || response.data.TenDangNhap,
            Email: response.data.email || response.data.Email,
            MaKH: response.data.maKH || response.data.MaKH,
            MaNV: response.data.maNV || response.data.MaNV,
            VaiTro: response.data.vaiTro || response.data.VaiTro,
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
