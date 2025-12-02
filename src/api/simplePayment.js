import axios from './axios';

export default {
  create(data) {
    return axios.post('/SimplePayment/Create', data);
  },
};
