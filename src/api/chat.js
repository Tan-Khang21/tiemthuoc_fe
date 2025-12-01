import axiosClient from './axios';

const chatApi = {
  // Gửi tin nhắn
  sendMessage(data) {
    return axiosClient.post('/chat/messages', data);
  },

  // Lấy danh sách cuộc trò chuyện (Admin)
  getConversations(params) {
    return axiosClient.get('/chat/conversations', { params });
  },

  // Tạo mới cuộc trò chuyện (Admin/Test)
  createConversation(data) {
    return axiosClient.post('/chat/conversations', data);
  },

  // Lấy hoặc tạo cuộc trò chuyện theo khách (Customer)
  getConversationByCustomer(maKH) {
    return axiosClient.get(`/chat/conversations/by-kh/${maKH}`);
  },
  
};

export default chatApi;
