<template>
  <div class="comment-node" :style="{ marginLeft: depth > 0 ? '20px' : '0' }">
    <div class="comment-card" :class="{ 'is-staff': comment.maNV, 'is-root': depth === 0 }">
      <div class="comment-header">
        <div class="user-meta">
          <span class="avatar" :class="{ 'staff-avatar': comment.maNV }">
            {{ (comment.tenNguoiBinhLuan || (comment.maNV ? 'QTV' : 'K')).charAt(0).toUpperCase() }}
          </span>
          <span class="username">
            {{ comment.tenNguoiBinhLuan || (comment.maNV ? 'Quản trị viên' : 'Khách hàng') }}
            <span v-if="comment.maNV" class="badge">QTV</span>
          </span>
          <span class="time">{{ formatTime(comment.thoiGian) }}</span>
        </div>
        <div class="actions">
           <el-button type="text" size="small" @click="$emit('reply', comment)">Trả lời</el-button>
           <el-button type="text" size="small" class="delete-btn" @click="$emit('delete', comment.maBL)">Xóa</el-button>
        </div>
      </div>
      <div class="comment-body">
        {{ comment.noiDung }}
      </div>
    </div>
    
    <!-- Recursive Children -->
    <div v-if="comment.replies && comment.replies.length > 0" class="comment-children">
      <CommentNode 
        v-for="child in comment.replies" 
        :key="child.maBL" 
        :comment="child" 
        :depth="depth + 1"
        @reply="$emit('reply', $event)"
        @delete="$emit('delete', $event)"
      />
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';

defineOptions({
  name: 'CommentNode'
});

const props = defineProps({
  comment: Object,
  depth: {
    type: Number,
    default: 0
  }
});

const emit = defineEmits(['reply', 'delete']);

const formatTime = (dateString) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleString('vi-VN');
};
</script>

<style scoped>
.comment-node {
  margin-top: 10px;
  position: relative;
}

.comment-node::before {
  content: '';
  position: absolute;
  left: -12px;
  top: 20px;
  width: 12px;
  height: 1px;
  background: #dcdfe6;
  display: none; 
}

.comment-card {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 12px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
}

.comment-card.is-root {
  border-left: 4px solid #0ecfe0;
  background: #fff;
}

.comment-card.is-staff {
  background: #f0f9ff;
  border-color: #bae6fd;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
}

.user-meta {
  display: flex;
  align-items: center;
  gap: 8px;
}

.avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  color: #6b7280;
}

.avatar.staff-avatar {
  background: #0ea5e9;
  color: #fff;
}

.username {
  font-weight: 600;
  font-size: 14px;
  color: #374151;
}

.badge {
  background: #0ea5e9;
  color: #fff;
  font-size: 10px;
  padding: 1px 4px;
  border-radius: 4px;
  margin-left: 4px;
}

.time {
  font-size: 12px;
  color: #9ca3af;
  margin-left: 4px;
}

.comment-body {
  font-size: 14px;
  color: #4b5563;
  line-height: 1.5;
}

.delete-btn {
  color: #ef4444;
}

.delete-btn:hover {
  color: #dc2626;
}
</style>
