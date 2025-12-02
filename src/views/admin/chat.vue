<template>
  <div class="chat-container">
    <!-- Sidebar: Conversation List -->
    <div class="conversation-list">
      <div class="list-header">
        <h3>Trò chuyện</h3>
      </div>
      
      <div class="list-content" v-loading="loadingConversations">
        <div 
          v-for="conv in conversations" 
          :key="conv.maCuocTroChuyen"
          class="conversation-item"
          :class="{ active: currentConversation && currentConversation.maCuocTroChuyen === conv.maCuocTroChuyen, unread: conv.chuaTraLoi }"
          @click="selectConversation(conv)"
        >
          <div class="avatar">
            <el-avatar :size="40">{{ getAvatarText(conv.tenKH) }}</el-avatar>
          </div>
          <div class="info">
            <div class="name-time">
              <span class="name">
                {{ conv.tenKH }}
                <span v-if="conv.chuaTraLoi" class="unread-dot">●</span>
              </span>
              <span class="time">{{ formatTime(conv.lastThoiGian) }}</span>
            </div>
            <div class="last-message text-truncate">
              {{ conv.lastNoiDung || 'Chưa có tin nhắn' }}
            </div>
          </div>
        </div>
        <el-empty v-if="conversations.length === 0" description="Không có cuộc trò chuyện nào" />
      </div>
    </div>

    <!-- Main: Chat Window -->
    <div class="chat-window">
      <template v-if="currentConversation">
        <div class="chat-header">
          <div class="header-info">
            <h3>{{ currentConversation.tenKH }}</h3>
            <span class="status">Khách hàng</span>
          </div>
        </div>

        <div class="messages-area" ref="messagesContainer">
          <div v-if="loadingMessages" class="loading-messages">
            <el-skeleton :rows="5" animated />
          </div>
          <template v-else>
            <div 
              v-for="(msg, index) in messages" 
              :key="index" 
              class="message-item"
              :class="{ 'sent': !msg.laKhachGui, 'received': msg.laKhachGui }"
            >
              <div class="message-content">
                <div class="bubble">
                  {{ msg.noiDung }}
                </div>
                <div class="message-time">
                  {{ formatTime(msg.thoiGian) }}
                </div>
              </div>
            </div>
            <el-empty v-if="messages.length === 0" description="Chưa có tin nhắn nào" />
          </template>
        </div>

        <div class="input-area">
          <el-input
            v-model="newMessage"
            type="textarea"
            :rows="2"
            placeholder="Nhập tin nhắn..."
            @keyup.enter.exact="sendMessage"
          />
          <el-button type="primary" icon="Position" @click="sendMessage" :loading="sending">
            Gửi
          </el-button>
        </div>
      </template>
      <div v-else class="no-selection">
        <el-empty description="Chọn một cuộc trò chuyện để bắt đầu" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, watch } from 'vue';
import { useAuthStore } from '@/store/auth';
import api from '@/api';
import { ElMessage } from 'element-plus';
import { Search, Position } from '@element-plus/icons-vue';

const authStore = useAuthStore();
const conversations = ref([]);
const currentConversation = ref(null);
const messages = ref([]);
const newMessage = ref('');
const loadingConversations = ref(false);
const loadingMessages = ref(false);
const sending = ref(false);
const messagesContainer = ref(null);

const formatTime = (time) => {
  if (!time) return '';
  const date = new Date(time);
  const now = new Date();
  
  // If today, show time only
  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString('vi-VN', { 
      hour: '2-digit', 
      minute: '2-digit'
    });
  }
  
  // Else show date
  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit'
  });
};

// Fetch conversations
const fetchConversations = async () => {
  loadingConversations.value = true;
  try {
    const params = {
      skip: 0,
      take: 50,
    };
    const res = await api.chat.getConversations(params);
    if (res.data && res.data.data) {
      conversations.value = res.data.data;
    }
  } catch (error) {
    console.error('Error fetching conversations:', error);
    ElMessage.error('Không thể tải danh sách cuộc trò chuyện');
  } finally {
    loadingConversations.value = false;
  }
};

// Select conversation
const selectConversation = async (conv) => {
  currentConversation.value = conv;
  loadingMessages.value = true;
  messages.value = []; // Clear previous messages
  
  try {
    // Use getConversationByCustomer to fetch details including messages
    if (conv.maKH) {
      const res = await api.chat.getConversationByCustomer(conv.maKH);
      if (res.data && res.data.data) {
        const data = res.data.data;
        // Update conversation info with full details
        currentConversation.value = { ...conv, ...data };
        
        if (data.messages) {
          messages.value = data.messages.sort((a, b) => new Date(a.thoiGian) - new Date(b.thoiGian));
        } else {
          messages.value = [];
        }
      }
    } else {
      // Fallback if no maKH (shouldn't happen for valid conversations)
      console.warn('Conversation missing maKH:', conv);
    }
  } catch (error) {
    console.error('Error fetching messages:', error);
    ElMessage.error('Không thể tải tin nhắn');
  } finally {
    loadingMessages.value = false;
    scrollToBottom();
  }
};

// Send message
const sendMessage = async () => {
  if (!newMessage.value.trim() || !currentConversation.value) return;
  
  sending.value = true;
  try {
    const payload = {
      maCuocTroChuyen: currentConversation.value.maCuocTroChuyen,
      laKhachGui: false,
      maNV: authStore.user.MaNV || 'NV001', 
      noiDung: newMessage.value
    };
    
    const res = await api.chat.sendMessage(payload);
    if (res.data && res.data.status === 1) {
      const sentMsg = res.data.data;
      messages.value.push(sentMsg);
      newMessage.value = '';
      scrollToBottom();
      
      const convIndex = conversations.value.findIndex(c => c.maCuocTroChuyen === currentConversation.value.maCuocTroChuyen);
      if (convIndex !== -1) {
        conversations.value[convIndex].lastNoiDung = sentMsg.noiDung;
        conversations.value[convIndex].lastThoiGian = sentMsg.thoiGian;
        const updatedConv = conversations.value.splice(convIndex, 1)[0];
        conversations.value.unshift(updatedConv);
      }
    } else {
      ElMessage.error(res.data?.message || 'Gửi tin nhắn thất bại');
    }
  } catch (error) {
    console.error('Error sending message:', error);
    ElMessage.error('Gửi tin nhắn thất bại');
  } finally {
    sending.value = false;
  }
};


const getAvatarText = (name) => {
  if (!name) return 'KH';
  const parts = name.split(' ');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
    }
  });
};

onMounted(() => {
  fetchConversations();
});
</script>

<style scoped>
.chat-container {
  display: flex;
  height: calc(100vh - 100px); 
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.conversation-list {
  width: 300px;
  border-right: 1px solid #eee;
  display: flex;
  flex-direction: column;
}

.list-header {
  padding: 20px;
  border-bottom: 1px solid #f0f0f0;
  background-color: #fff;
}

.list-header h3 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #1a1a1a;
}

.list-content {
  flex: 1;
  overflow-y: auto;
}

.conversation-item {
  display: flex;
  padding: 16px 20px;
  cursor: pointer;
  transition: all 0.2s ease;
  border-bottom: 1px solid #f9f9f9;
  align-items: center;
}

.conversation-item:hover {
  background-color: #f5f7fa;
}

.conversation-item.active {
  background-color: #e6f7ff;
  border-right: 3px solid #1890ff;
}

.conversation-item.unread {
  background-color: #fff1f0;
}

.conversation-item.unread.active {
  background-color: #e6f7ff;
}

.avatar {
  margin-right: 16px;
}

.info {
  flex: 1;
  min-width: 0; 
}

.name-time {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.name {
  font-size: 15px;
  font-weight: 500;
  color: #333;
  display: flex;
  align-items: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
  margin-right: 8px;
}

.time {
  font-size: 12px;
  color: #999;
  white-space: nowrap;
  flex-shrink: 0;
}

.last-message {
  font-size: 13px;
  color: #666;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.5;
}

.unread .name {
  font-weight: 700;
  color: #000;
}

.unread .last-message {
  color: #333;
  font-weight: 500;
}

.chat-window {
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: #fff;
}

.chat-header {
  padding: 16px 24px;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  align-items: center;
  background-color: #fff;
  box-shadow: 0 1px 2px rgba(0,0,0,0.03);
  z-index: 1;
}

.header-info h3 {
  margin: 0 0 4px 0;
  font-size: 18px;
  font-weight: 600;
  color: #1a1a1a;
}

.status {
  font-size: 12px;
  color: #52c41a;
  display: flex;
  align-items: center;
}

.status::before {
  content: '';
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: #52c41a;
  margin-right: 6px;
}

.messages-area {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
  background-color: #f0f2f5;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.message-item {
  display: flex;
  margin-bottom: 4px;
}

.message-item.sent {
  justify-content: flex-end;
}

.message-item.received {
  justify-content: flex-start;
}

.message-content {
  max-width: 65%;
  display: flex;
  flex-direction: column;
}

.sent .message-content {
  align-items: flex-end;
}

.bubble {
  padding: 12px 16px;
  border-radius: 12px;
  font-size: 14px;
  line-height: 1.5;
  word-wrap: break-word;
  position: relative;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
}

.sent .bubble {
  background-color: #1890ff;
  color: #fff;
  border-bottom-right-radius: 4px;
}

.received .bubble {
  background-color: #fff;
  color: #333;
  border-bottom-left-radius: 4px;
}

.message-time {
  font-size: 11px;
  color: #999;
  margin-top: 6px;
  padding: 0 4px;
}

.input-area {
  padding: 20px;
  border-top: 1px solid #f0f0f0;
  display: flex;
  gap: 16px;
  align-items: flex-end;
  background-color: #fff;
}

.no-selection {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f0f2f5;
  flex-direction: column;
  color: #999;
}

.text-truncate {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.unread-dot {
  color: #ff4d4f;
  font-size: 20px;
  line-height: 10px;
  margin-left: 6px;
  display: inline-block;
  vertical-align: middle;
}
</style>
