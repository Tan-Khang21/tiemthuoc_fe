// Export tất cả các API services
import thuocApi from './thuoc';
import hoadonApi from './hoadon';
import phieunhapApi from './phieunhap';
import khachhangApi from './khachhang';
import nhacungcapApi from './nhacungcap';
import nhanvienApi from './nhanvien';
import taikhoanApi from './taikhoan';
import thuocviewApi from './thuocview';
import phieuxulyApi from './phieuxulyhoanhuy';
import danhgiathuocApi from './danhgiathuoc';
import binhluanApi from './binhluan';
import simplePaymentApi from './simplePayment';
import chatApi from './chat';
import loaithuocApi from './loaithuoc';

export default {
  thuoc: thuocApi,
  hoadon: hoadonApi,
  phieunhap: phieunhapApi,
  khachhang: khachhangApi,
  nhacungcap: nhacungcapApi,
  nhanvien: nhanvienApi,
  taikhoan: taikhoanApi,
  thuocview: thuocviewApi,
  phieuxuly: phieuxulyApi,
  danhgiathuoc: danhgiathuocApi,
  binhluan: binhluanApi,
  simplePayment: simplePaymentApi,
  chat: chatApi,
  loaithuoc: loaithuocApi,
};
