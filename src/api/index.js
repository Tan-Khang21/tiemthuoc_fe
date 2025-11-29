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
};
