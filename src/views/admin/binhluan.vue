<template>
  <div class="admin-binhluan">
    <el-card class="admin-card">
      <div class="card-header">
        <h3>Quản Lý Bình Luận & Hỏi Đáp</h3>
        <div class="header-actions">
          <el-input
            v-model="searchKeyword"
            placeholder="Tìm kiếm nội dung, sản phẩm..."
            prefix-icon="el-icon-search"
            clearable
            style="width: 300px; margin-right: 16px"
          />
          <el-checkbox v-model="filterUnanswered" label="Chỉ hiện chưa trả lời" border size="small" />
        </div>
      </div>

      <el-table :data="pagedComments" v-loading="loading" stripe style="width: 100%">
        <el-table-column label="Sản phẩm" min-width="180">
          <template #default="{ row }">
            <div class="product-info">
              <span class="product-name">{{ row.root.tenThuoc || row.root.maThuoc }}</span>
              <span class="product-sku">{{ row.root.maThuoc }}</span>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column label="Người hỏi" width="180">
          <template #default="{ row }">
            <div class="user-info">
              <span class="user-name">{{ row.root.tenNguoiBinhLuan || 'Khách hàng' }}</span>
              <span class="user-role" v-if="row.root.maNV">QTV</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="Câu hỏi gốc" min-width="300">
          <template #default="{ row }">
            <div class="comment-content">
              <p class="comment-text">{{ row.root.noiDung }}</p>
              <span class="comment-time">{{ formatTime(row.root.thoiGian) }}</span>
            </div>
            <div v-if="row.root.replies && row.root.replies.length > 0" class="replies-indicator">
              <el-tag size="small" type="info">{{ countReplies(row.root) }} phản hồi</el-tag>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="Trạng thái" width="140">
          <template #default="{ row }">
            <el-tag v-if="row.status === 1" type="success" size="small">Đã trả lời</el-tag>
            <el-tag v-else type="danger" size="small">Chưa trả lời</el-tag>
          </template>
        </el-table-column>

        <el-table-column label="Thao tác" width="150" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="viewAndReply(row)">
              <i class="fas fa-comments"></i> Chi tiết
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container">
        <el-pagination
          background
          layout="prev, pager, next"
          :total="filteredComments.length"
          :page-size="pageSize"
          :current-page="currentPage"
          @current-change="handlePageChange"
        />
      </div>
    </el-card>

    <!-- Detail/Reply Dialog -->
    <el-dialog
      v-model="showReplyDialog"
      title="Chi tiết thảo luận"
      width="700px"
      destroy-on-close
      top="5vh"
    >
      <div v-if="selectedThread" class="dialog-content">
        <div class="thread-container">
          <!-- Flat Comment List -->
          <div class="comment-list">
            <div 
              v-for="(comment, index) in flatComments" 
              :key="comment.maBL" 
              class="comment-item"
            >
              <div class="comment-card" :class="{ 'is-staff': comment.maNV, 'is-root': index === 0 }">
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
                     <!-- Only allow replying to the last comment -->
                     <el-button 
                        v-if="index === flatComments.length - 1" 
                        type="text" 
                        size="small" 
                        @click="prepareReply(comment)"
                      >
                        Trả lời
                      </el-button>
                     <el-button type="text" size="small" class="delete-btn" @click="confirmDelete(comment.maBL)">Xóa</el-button>
                  </div>
                </div>
                <div class="comment-body">
                  {{ comment.noiDung }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="reply-input-area" v-if="replyingToComment">
          <div class="reply-target-info">
            Đang trả lời: <strong>{{ replyingToComment.tenNguoiBinhLuan || 'Người dùng' }}</strong>
            <el-button type="text" size="small" @click="cancelReply" style="margin-left: 10px; color: #999">Hủy</el-button>
          </div>
          <el-input
            type="textarea"
            v-model="replyText"
            rows="3"
            placeholder="Nhập nội dung trả lời..."
            ref="replyInputRef"
          />
          <div class="dialog-actions">
            <el-button @click="cancelReply">Hủy</el-button>
            <el-button type="primary" @click="submitReply" :loading="submitting">Gửi trả lời</el-button>
          </div>
        </div>
        <!-- If no one is being replied to, and we are at the end of the list, show a button to reply to the last one? 
             Actually, the 'Trả lời' button on the last item triggers the form. 
             If the list is empty (impossible if root exists), or just root.
             We can also keep a generic button at bottom if needed, but per requirement "chỉ được trả lời cái cuối cùng", 
             the inline button on the last item is sufficient. 
        -->
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, watch } from 'vue';
import api from '@/api';
import { useAuthStore } from '@/store';
import { ElMessage, ElMessageBox } from 'element-plus';
// CommentNode no longer needed for recursive structure, we render inline or could use it as dumb component.
// But inline is easier for the flat list logic customization.

const authStore = useAuthStore();
const threads = ref([]); // List of { root: ..., status: ... }
const loading = ref(false);
const searchKeyword = ref('');
const currentPage = ref(1);
const pageSize = ref(10);
const filterUnanswered = ref(false);

const showReplyDialog = ref(false);
const selectedThread = ref(null);
const replyingToComment = ref(null);
const replyText = ref('');
const submitting = ref(false);
const replyInputRef = ref(null);

// Flattened comments for the selected thread
const flatComments = computed(() => {
  if (!selectedThread.value || !selectedThread.value.root) return [];
  const list = [];
  
  const traverse = (node) => {
    list.push(node);
    if (node.replies && node.replies.length > 0) {
      node.replies.forEach(child => traverse(child));
    }
  };
  
  traverse(selectedThread.value.root);
  
  // Sort by time
  return list.sort((a, b) => new Date(a.thoiGian) - new Date(b.thoiGian));
});

onMounted(async () => {
  await loadThreads();
});

const loadThreads = async () => {
  loading.value = true;
  try {
    const response = await api.binhluan.getRootsStatus();
    if (response.data && response.data.status === 1) {
      threads.value = response.data.data || [];
    } else {
      threads.value = [];
    }
  } catch (error) {
    console.error('Load threads error:', error);
    ElMessage.error('Không thể tải danh sách thảo luận');
  } finally {
    loading.value = false;
  }
};

const filteredComments = computed(() => {
  let list = threads.value;
  
  if (filterUnanswered.value) {
    // status 0 means unanswered in branch
    list = list.filter(item => item.status === 0);
  }

  if (!searchKeyword.value) return list;
  
  const keyword = searchKeyword.value.toLowerCase();
  return list.filter(item => 
    item.root.noiDung.toLowerCase().includes(keyword) ||
    (item.root.tenThuoc && item.root.tenThuoc.toLowerCase().includes(keyword)) ||
    (item.root.tenNguoiBinhLuan && item.root.tenNguoiBinhLuan.toLowerCase().includes(keyword))
  );
});

const pagedComments = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  return filteredComments.value.slice(start, start + pageSize.value);
});

const handlePageChange = (page) => {
  currentPage.value = page;
};

const formatTime = (dateString) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleString('vi-VN');
};

const countReplies = (comment) => {
  let count = 0;
  if (comment.replies) {
    count += comment.replies.length;
    comment.replies.forEach(c => {
      count += countReplies(c);
    });
  }
  return count;
};

const viewAndReply = (threadItem) => {
  selectedThread.value = threadItem;
  replyingToComment.value = null; // Reset reply target
  replyText.value = '';
  showReplyDialog.value = true;
};

const prepareReply = (comment) => {
  replyingToComment.value = comment;
  replyText.value = ''; // Optional: keep draft?
  // Focus input
  nextTick(() => {
    if (replyInputRef.value) {
      replyInputRef.value.focus();
    }
  });
};

const cancelReply = () => {
  replyingToComment.value = null;
  replyText.value = '';
};

const submitReply = async () => {
  if (!replyText.value.trim()) {
    ElMessage.warning('Vui lòng nhập nội dung trả lời');
    return;
  }
  
  if (!replyingToComment.value) {
      ElMessage.warning('Vui lòng chọn bình luận để trả lời');
      return;
  }

  submitting.value = true;
  try {
    const data = {
      maThuoc: selectedThread.value.root.maThuoc,
      maNV: authStore.user.MaNV,
      noiDung: replyText.value,
      traLoiChoBinhLuan: replyingToComment.value.maBL
    };

    const response = await api.binhluan.create(data);
    if (response.data && response.data.status === 1) {
      ElMessage.success('Đã gửi trả lời');
      
      // Reload threads to update tree and status
      await loadThreads();
      
      // Update selected thread view
      const updatedThread = threads.value.find(t => t.root.maBL === selectedThread.value.root.maBL);
      if (updatedThread) {
        selectedThread.value = updatedThread;
      }
      
      cancelReply();
    } else {
      ElMessage.error(response.data?.message || 'Có lỗi xảy ra');
    }
  } catch (error) {
    console.error(error);
    ElMessage.error('Có lỗi xảy ra');
  } finally {
    submitting.value = false;
  }
};

const confirmDelete = async (maBL) => {
  try {
    await ElMessageBox.confirm('Bạn có chắc chắn muốn xóa bình luận này? Tất cả câu trả lời con cũng sẽ bị xóa.', 'Xác nhận xóa', {
      confirmButtonText: 'Xóa',
      cancelButtonText: 'Hủy',
      type: 'warning'
    });

    const response = await api.binhluan.delete(maBL);
    if (response.data && response.data.data === true) {
      ElMessage.success('Đã xóa bình luận');
      
      // If we deleted the root itself, close dialog
      if (selectedThread.value && selectedThread.value.root.maBL === maBL) {
          showReplyDialog.value = false;
          await loadThreads();
          return;
      }

      await loadThreads();
      
      // Update view
      if (selectedThread.value) {
        const updatedThread = threads.value.find(t => t.root.maBL === selectedThread.value.root.maBL);
        if (updatedThread) {
          selectedThread.value = updatedThread;
        } else {
            // Thread might be gone if root was deleted (though handled above)
            showReplyDialog.value = false;
        }
      }
    } else {
      ElMessage.error('Xóa thất bại');
    }
  } catch (e) {
    if (e !== 'cancel') console.error(e);
  }
};
</script>

<style scoped>
.admin-binhluan {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.card-header h3 {
  margin: 0;
  color: #0d3d47;
}

.header-actions {
  display: flex;
  align-items: center;
}

.product-info, .user-info {
  display: flex;
  flex-direction: column;
}

.product-name, .user-name {
  font-weight: 600;
  color: #2c3e50;
}

.product-sku, .user-role {
  font-size: 12px;
  color: #999;
}
.user-role { color: #17a2b8; font-weight: 600; }

.comment-content .comment-text {
  margin: 0 0 5px;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.comment-time {
  font-size: 12px;
  color: #999;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

/* Dialog & Tree Styles */
.dialog-content {
  max-height: 70vh;
  display: flex;
  flex-direction: column;
}

.thread-container {
  flex: 1;
  overflow-y: auto;
  padding: 10px;
  background: #f9fafb;
  border-radius: 8px;
  margin-bottom: 15px;
  border: 1px solid #e5e7eb;
}

.comment-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.comment-item {
  /* No indentation for flat list */
  margin-left: 0 !important;
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

.reply-input-area {
  background: #fff;
  padding: 15px;
  border-top: 1px solid #e5e7eb;
  border-radius: 0 0 8px 8px;
}

.reply-target-info {
  font-size: 13px;
  color: #6b7280;
  margin-bottom: 8px;
}

.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 10px;
}

.reply-placeholder {
  text-align: center;
  padding: 10px;
}
</style>
