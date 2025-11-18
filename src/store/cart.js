import { defineStore } from 'pinia';
import api from '@/api';

export const useCartStore = defineStore('cart', {
  state: () => ({
    items: [],
  }),

  getters: {
    // Tổng số lượng sản phẩm trong giỏ
    totalItems: (state) => {
      return state.items.reduce((total, item) => total + item.soLuong, 0);
    },

    // Tổng tiền
    totalAmount: (state) => {
      return state.items.reduce((total, item) => {
        return total + (item.donGia * item.soLuong);
      }, 0);
    },

    // Danh sách items trong giỏ
    cartItems: (state) => state.items,
  },

  actions: {
    // Khởi tạo giỏ hàng từ localStorage
    initCart() {
      const cartData = localStorage.getItem('cart');
      if (cartData) {
        try {
          this.items = JSON.parse(cartData);
        } catch (e) {
          this.items = [];
        }
      }
    },

    // Lưu giỏ hàng vào localStorage
    saveCart() {
      localStorage.setItem('cart', JSON.stringify(this.items));
    },

    // Thêm sản phẩm vào giỏ
    addToCart(product) {
      const existingItem = this.items.find(
        item => item.maThuoc === product.maThuoc && 
                item.donVi === product.donVi
      );

      if (existingItem) {
        existingItem.soLuong += product.soLuong || 1;
      } else {
        this.items.push({
          maThuoc: product.maThuoc,
          tenThuoc: product.tenThuoc,
          donGia: product.donGia,
          donVi: product.donVi,
          tenDonVi: product.tenDonVi,
          soLuong: product.soLuong || 1,
          urlAnh: product.urlAnh,
        });
      }

      this.saveCart();
    },

    // Cập nhật số lượng
    updateQuantity(maThuoc, donVi, soLuong) {
      const item = this.items.find(
        i => i.maThuoc === maThuoc && i.donVi === donVi
      );
      
      if (item) {
        item.soLuong = soLuong;
        if (item.soLuong <= 0) {
          this.removeFromCart(maThuoc, donVi);
        } else {
          this.saveCart();
        }
      }
    },

    // Xóa sản phẩm khỏi giỏ
    removeFromCart(maThuoc, donVi) {
      this.items = this.items.filter(
        item => !(item.maThuoc === maThuoc && item.donVi === donVi)
      );
      this.saveCart();
    },

    // Xóa toàn bộ giỏ hàng
    clearCart() {
      this.items = [];
      this.saveCart();
    },

    // Thanh toán (tạo hóa đơn online)
    async checkout(customerData) {
      try {
        const hoadonData = {
          maKH: customerData.maKH,
          ghiChu: customerData.ghiChu || '',
          items: this.items.map(item => ({
            maThuoc: item.maThuoc,
            soLuong: item.soLuong,
            donGia: item.donGia,
            donVi: item.donVi,
          })),
        };

        const response = await api.hoadon.createOnline(hoadonData);
        
        if (response.status === 1) {
          this.clearCart();
          return { success: true, data: response.data };
        }
        
        return { success: false, message: response.message || 'Đặt hàng thất bại' };
      } catch (error) {
        console.error('Checkout error:', error);
        return { 
          success: false, 
          message: error.message || 'Có lỗi xảy ra khi đặt hàng' 
        };
      }
    },
  },
});
