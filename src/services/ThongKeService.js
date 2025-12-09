import api from '@/api/axios';

const API_URL = '/ThongKe';

export default {
    getThongKeNam(year) {
        return api.get(`${API_URL}/nam/${year}`);
    },
    getThongKeThang(month, year) {
        return api.get(`${API_URL}/thang/${month}/${year}`);
    },
    getTopSellingMedicines(year, topCount = 3) {
        return api.get(`${API_URL}/top-selling/${year}?topCount=${topCount}`);
    },
    getTopSellingMedicinesByMonth(month, year, topCount = 3) {
        return api.get(`${API_URL}/top-selling/${month}/${year}?topCount=${topCount}`);
    }
};
