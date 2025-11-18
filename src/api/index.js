// Export tất cả các API services
import thuocApi from './thuoc';
import hoadonApi from './hoadon';
import phieunhapApi from './phieunhap';
import khachhangApi from './khachhang';
import nhacungcapApi from './nhacungcap';
import taikhoanApi from './taikhoan';
import thuocviewApi from './thuocview';

export default {
  thuoc: thuocApi,
  hoadon: hoadonApi,
  phieunhap: phieunhapApi,
  khachhang: khachhangApi,
  nhacungcap: nhacungcapApi,
  taikhoan: taikhoanApi,
  thuocview: thuocviewApi,
};
