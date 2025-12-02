<template>
  <div class="chat-widget">
    <!-- Chat Button -->
    <div class="chat-button" @click="toggleChat" v-if="!isOpen">
      <el-badge :value="unreadCount" :hidden="unreadCount === 0" class="badge">
        <div class="chat-icon">
          <i class="fas fa-comment-dots"></i>
        </div>
      </el-badge>
    </div>

    <!-- Chat Window -->
    <transition name="slide-up">
      <div class="chat-window" v-if="isOpen">
        <div class="chat-header">
          <div class="header-title">
            <i class="fas fa-headset"></i>
            <span>Hỗ trợ trực tuyến</span>
          </div>
          <div class="header-actions">
            <i class="fas fa-minus" @click="toggleChat"></i>
          </div>
        </div>

        <div class="chat-body" ref="messagesContainer">
          <div v-if="!authStore.isAuthenticated" class="login-prompt">
            <p>Vui lòng đăng nhập để chat với nhân viên tư vấn.</p>
            <el-button type="primary" size="small" @click="$router.push('/login')">Đăng nhập</el-button>
          </div>
          <template v-else>
            <div v-if="loading" class="loading">
              <el-skeleton :rows="3" animated />
            </div>
            <template v-else>
              <div 
                v-for="(msg, index) in messages" 
                :key="index" 
                class="message-item"
                :class="{ 'sent': msg.laKhachGui, 'received': !msg.laKhachGui }"
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
              <div v-if="messages.length === 0" class="empty-chat">
                <p>Xin chào! Bạn cần hỗ trợ gì không?</p>
              </div>
            </template>
          </template>
        </div>

        <div class="chat-footer" v-if="authStore.isAuthenticated">
          <el-input
            v-model="newMessage"
            placeholder="Nhập tin nhắn..."
            @keyup.enter.exact="sendMessage"
          >
            <template #append>
              <el-button @click="sendMessage" :loading="sending">
                <i class="fas fa-paper-plane"></i>
              </el-button>
            </template>
          </el-input>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, nextTick, watch, onMounted } from 'vue';
import { useAuthStore } from '@/store';
import api from '@/api';
import { ElMessage } from 'element-plus';

const authStore = useAuthStore();
const isOpen = ref(false);
const messages = ref([]);
const newMessage = ref('');
const loading = ref(false);
const sending = ref(false);
const conversation = ref(null);
const unreadCount = ref(0);
const messagesContainer = ref(null);

const toggleChat = () => {
  isOpen.value = !isOpen.value;
  if (isOpen.value && authStore.isAuthenticated) {
    fetchConversation();
  }
};

const fetchConversation = async () => {
  if (!authStore.user?.MaKH) return;
  
  loading.value = true;
  try {
    const res = await api.chat.getConversationByCustomer(authStore.user.MaKH);
    if (res.data && res.data.data) {
      const data = res.data.data;
      conversation.value = data;
      if (data.messages) {
        messages.value = data.messages.sort((a, b) => new Date(a.thoiGian) - new Date(b.thoiGian));
      } else {
        messages.value = [];
      }
    }
  } catch (error) {
    console.error('Error fetching conversation:', error);
  } finally {
    loading.value = false;
    scrollToBottom();
  }
};

const sendMessage = async () => {
  if (!newMessage.value.trim()) return;
  
  sending.value = true;
  try {
    let convId = conversation.value?.maCuocTroChuyen;
    
    if (!convId) {
        await fetchConversation();
        convId = conversation.value?.maCuocTroChuyen;
    }

    if (!convId) {
        ElMessage.error('Không thể khởi tạo cuộc trò chuyện');
        return;
    }

    const payload = {
      maCuocTroChuyen: convId,
      laKhachGui: true,
      noiDung: newMessage.value
    };
    
    const res = await api.chat.sendMessage(payload);
    if (res.data && res.data.status === 1) {
      messages.value.push(res.data.data);
      newMessage.value = '';
      scrollToBottom();
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

const formatTime = (time) => {
  if (!time) return '';
  const date = new Date(time);
  return date.toLocaleString('vi-VN', { 
    hour: '2-digit', 
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
    }
  });
};

let pollInterval;
watch(isOpen, (val) => {
  if (val && authStore.isAuthenticated) {
    pollInterval = setInterval(fetchConversation, 10000);
  } else {
    clearInterval(pollInterval);
  }
});

</script>

<style scoped>
.chat-widget {
  position: fixed;
  bottom: 30px;
  right: 30px;
  z-index: 9999;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.chat-button {
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #0ecfe0 0%, #0a9cb0 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(14, 207, 224, 0.4);
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.chat-button:hover {
  transform: scale(1.1);
}

.chat-icon {
  color: white;
  font-size: 28px;
}

.chat-window {
  width: 350px;
  height: 500px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 5px 30px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid #eee;
}

.chat-header {
  background: linear-gradient(135deg, #0ecfe0 0%, #0a9cb0 100%);
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: white;
}

.header-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 600;
  font-size: 16px;
}

.header-actions i {
  cursor: pointer;
  padding: 5px;
  transition: opacity 0.2s;
}

.header-actions i:hover {
  opacity: 0.8;
}

.chat-body {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
  background-color: #f8f9fa;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.login-prompt {
  text-align: center;
  margin-top: 50px;
  color: #666;
}

.login-prompt p {
  margin-bottom: 16px;
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
  max-width: 80%;
}

.bubble {
  padding: 10px 14px;
  border-radius: 12px;
  font-size: 14px;
  line-height: 1.4;
  word-wrap: break-word;
}

.sent .bubble {
  background-color: #0ecfe0;
  color: white;
  border-bottom-right-radius: 2px;
}

.received .bubble {
  background-color: white;
  color: #333;
  border-bottom-left-radius: 2px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
}

.message-time {
  font-size: 10px;
  color: #999;
  margin-top: 4px;
  text-align: right;
}

.received .message-time {
  text-align: left;
}

.empty-chat {
  text-align: center;
  color: #999;
  margin-top: 20px;
  font-style: italic;
}

.chat-footer {
  padding: 12px;
  border-top: 1px solid #eee;
  background: white;
}

/* Transitions */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.slide-up-enter-from,
.slide-up-leave-to {
  opacity: 0;
  transform: translateY(20px) scale(0.95);
}

@media (max-width: 480px) {
  .chat-window {
    width: calc(100vw - 40px);
    height: 80vh;
    bottom: 20px;
    right: 20px;
  }
}
</style>
