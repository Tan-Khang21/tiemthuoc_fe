import axios from 'axios';

const API_URL = 'https://localhost:7283/api/ThongKe';

export default {
    getThongKeNam(year) {
        return axios.get(`${API_URL}/nam/${year}`);
    },
    getThongKeThang(month, year) {
        return axios.get(`${API_URL}/thang/${month}/${year}`);
    }
};
