<template>
  <div class="qr-scanner-container">
    <!-- Header -->
    <el-card class="header-card" shadow="hover">
      <div class="header-content">
        <div>
          <h2 style="margin: 0; color: #0d3d47; font-size: 24px;">
            <i class="fas fa-barcode"></i> Quét Mã Vạch
          </h2>
          <p style="margin: 8px 0 0 0; color: #6c757d;">Honeywell 1D - Symbol LS2208 (USB)</p>
        </div>
      </div>
    </el-card>

    <!-- Scanner Input Section -->
    <el-card class="scanner-card" shadow="hover">
      <template #header>
        <div style="font-weight: 600;">🔍 Khu Vực Quét Mã</div>
      </template>

      <div class="scanner-input-wrapper">
        <el-input
          ref="scannerInput"
          v-model="scannedCode"
          placeholder="Đặt con trỏ ở đây → Quét mã vạch bằng máy Honeywell"
          @keyup.enter="processScannedCode"
          @input="onInputChange"
          @keydown="onKeyDown"
          @keypress="onKeyPress"
          size="large"
          clearable
          autofocus
        />
        <p style="margin-top: 12px; color: #6c757d; font-size: 14px;">
          ℹ️ Máy quét tự động nhập dữ liệu và nhấn Enter
        </p>
      </div>
    </el-card>

    <!-- Manual Input Section (Optional) -->
    <el-card class="input-card" shadow="hover">
      <template #header>
        <div style="font-weight: 600;">⌨️ Nhập Thủ Công</div>
      </template>

      <div style="display: flex; gap: 12px; align-items: flex-end;">
        <el-input
          v-model="manualCode"
          placeholder="Hoặc nhập mã thủ công"
          @keyup.enter="processManualCode"
          style="flex: 1;"
          clearable
        />
        <el-button type="primary" @click="processManualCode">
          <i class="fas fa-plus"></i> Thêm
        </el-button>
      </div>
    </el-card>

    <!-- Result Section -->
    <el-card class="result-card" shadow="hover" v-if="lastScannedCode">
      <template #header>
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="font-weight: 600;">✅ Mã Vạch Cuối Cùng</span>
          <el-button type="danger" size="small" @click="clearResult" link>
            Xoá
          </el-button>
        </div>
      </template>

      <el-descriptions :column="1" border>
        <el-descriptions-item label="Mã Vạch">
          <span style="font-size: 18px; font-weight: bold; color: #17a2b8;">{{ lastScannedCode.code }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="Thời Gian Quét">
          {{ new Date(lastScannedCode.scannedAt).toLocaleString('vi-VN') }}
        </el-descriptions-item>
      </el-descriptions>
    </el-card>

    <!-- History Section -->
    <el-card class="history-card" shadow="hover">
      <template #header>
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="font-weight: 600;">📜 Lịch Sử Quét ({{ scannedCodes.length }})</span>
          <el-button type="danger" size="small" @click="clearHistory" link>
            Xoá Tất Cả
          </el-button>
        </div>
      </template>

      <el-table :data="scannedCodes" stripe max-height="500">
        <el-table-column prop="code" label="Mã Vạch" width="250">
          <template #default="{ row }">
            <el-tag type="info">{{ row.code }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="scannedAt" label="Thời Gian Quét" min-width="200">
          <template #default="{ row }">
            {{ new Date(row.scannedAt).toLocaleString('vi-VN') }}
          </template>
        </el-table-column>
        <el-table-column label="Hành Động" width="80" align="center">
          <template #default="{ row, $index }">
            <el-button 
              type="danger" 
              size="small" 
              @click="removeFromHistory($index)"
              link
            >
              <i class="fas fa-trash"></i>
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- Debug Log Section -->
    <el-card class="debug-card" shadow="hover">
      <template #header>
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="font-weight: 600;">🔧 Debug Log ({{ debugLog.length }})</span>
          <el-button type="danger" size="small" @click="debugLog = []" link>
            Xoá Log
          </el-button>
        </div>
      </template>

      <div style="background: #1e1e1e; color: #d4d4d4; padding: 12px; border-radius: 4px; font-family: monospace; max-height: 400px; overflow-y: auto;">
        <div 
          v-for="(log, index) in debugLog" 
          :key="index"
          :style="{
            color: log.type === 'error' ? '#f48771' : 
                   log.type === 'success' ? '#7ec699' : 
                   log.type === 'warning' ? '#dcdcaa' : 
                   log.type === 'input' ? '#4ec9b0' :
                   log.type === 'manual' ? '#569cd6' : '#d4d4d4'
          }"
          style="padding: 4px 0; font-size: 13px; line-height: 1.4;"
        >
          <span style="color: #808080;">[{{ log.time }}]</span> {{ log.message }}
        </div>
        <div v-if="debugLog.length === 0" style="color: #808080; padding: 20px; text-align: center;">
          Chưa có log nào...
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';

// States
const scannerInput = ref(null);
const scannedCode = ref('');
const manualCode = ref('');
const lastScannedCode = ref(null);
const scannedCodes = ref([]);
const debugLog = ref([]);

// Methods
const addLog = (message, type = 'info') => {
  const timestamp = new Date().toLocaleTimeString('vi-VN');
  const logEntry = {
    time: timestamp,
    message: message,
    type: type
  };
  
  debugLog.value.unshift(logEntry);
  
  // Giữ max 50 log entries
  if (debugLog.value.length > 50) {
    debugLog.value.pop();
  }
  
  // In ra console
  console.log(`[${type.toUpperCase()}] ${timestamp}: ${message}`);
};

const onInputChange = (value) => {
  addLog(`Input changed: ${value} (length: ${value.length})`, 'input');
};

const onKeyDown = (event) => {
  addLog(`KeyDown: key="${event.key}" code="${event.code}" char="${event.key.charCodeAt(0)}"`, 'key');
  
  // If Enter key pressed
  if (event.key === 'Enter') {
    addLog(`📍 Enter detected - Processing scanned code`, 'success');
  }
};

const onKeyPress = (event) => {
  addLog(`KeyPress: charCode=${event.charCode} char="${String.fromCharCode(event.charCode)}"`, 'key');
};

const processScannedCode = () => {
  const code = scannedCode.value.trim();
  
  addLog(`📥 Input received: "${code}"`, 'input');
  
  if (!code) {
    addLog('⚠️ Code is empty, skipping', 'warning');
    return;
  }

  addLog(`✅ Processing code: ${code}`, 'success');
  addToHistory(code);
  scannedCode.value = ''; // Clear input for next scan
  
  // Auto focus back to scanner input
  if (scannerInput.value) {
    scannerInput.value.focus();
    addLog('🔍 Focus restored to input', 'info');
  }
};

const processManualCode = () => {
  const code = manualCode.value.trim();
  
  addLog(`⌨️ Manual code entered: "${code}"`, 'manual');
  
  if (!code) {
    ElMessage.warning('Vui lòng nhập mã');
    addLog('⚠️ Manual code is empty', 'warning');
    return;
  }

  addToHistory(code);
  manualCode.value = '';
};

const addToHistory = (code) => {
  const result = {
    code: code,
    scannedAt: new Date().toISOString()
  };

  lastScannedCode.value = result;
  scannedCodes.value.unshift(result);

  // Keep only last 100 items
  if (scannedCodes.value.length > 100) {
    scannedCodes.value.pop();
  }

  addLog(`💾 Code saved to history (Total: ${scannedCodes.value.length})`, 'success');
  ElMessage.success(`✅ Quét thành công: ${code}`);
};

const clearResult = () => {
  lastScannedCode.value = null;
  addLog('🗑️ Last result cleared', 'info');
};

const removeFromHistory = (index) => {
  const removedCode = scannedCodes.value[index].code;
  scannedCodes.value.splice(index, 1);
  addLog(`🗑️ Removed: ${removedCode}`, 'info');
  ElMessage.success('Đã xoá');
};

const clearHistory = () => {
  if (scannedCodes.value.length === 0) {
    ElMessage.info('Lịch sử đã trống');
    addLog('ℹ️ History is already empty', 'info');
    return;
  }

  ElMessageBox.confirm('Xoá tất cả lịch sử quét?', 'Xác nhận', {
    confirmButtonText: 'Xoá',
    cancelButtonText: 'Hủy',
    type: 'warning',
  }).then(() => {
    const count = scannedCodes.value.length;
    scannedCodes.value = [];
    addLog(`🗑️ All history cleared (${count} items)`, 'info');
    ElMessage.success('Đã xoá lịch sử');
  }).catch(() => {});
};

// Lifecycle hook
onMounted(() => {
  addLog('🚀 QR Scanner mounted', 'success');
  
  // Focus input field after mount
  setTimeout(() => {
    if (scannerInput.value && scannerInput.value.$el) {
      const input = scannerInput.value.$el.querySelector('input');
      if (input) {
        input.focus();
        addLog('✅ Input focused - Ready for scanner input', 'success');
      }
    }
  }, 200);
});

// Initialize
if (typeof window !== 'undefined') {
  addLog('🚀 QR Scanner initialized', 'success');
  addLog('⏳ Waiting for barcode scanner input...', 'info');
  
  // Auto focus input after component mounted
  setTimeout(() => {
    if (scannerInput.value && scannerInput.value.$el) {
      scannerInput.value.$el.querySelector('input').focus();
      addLog('✅ Input focused and ready for scanner', 'success');
    }
  }, 100);
}
</script>

<style scoped>
.qr-scanner-container {
  padding: 24px;
  background: #f5f7fa;
  min-height: 100vh;
}

.header-card {
  margin-bottom: 24px;
  border-radius: 8px;
  border: none;
}

.header-card :deep(.el-card__body) {
  padding: 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.scanner-card {
  margin-bottom: 24px;
  border-radius: 8px;
  border: none;
}

.scanner-card :deep(.el-card__header) {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  border-bottom: none;
  padding: 16px 24px;
  color: white;
  font-weight: 600;
}

.scanner-input-wrapper {
  padding: 20px;
  background: #f9f9f9;
  border-radius: 8px;
}

.scanner-input-wrapper :deep(.el-input__inner) {
  font-size: 16px;
  padding: 12px;
}

.input-card {
  margin-bottom: 24px;
  border-radius: 8px;
  border: none;
}

.input-card :deep(.el-card__header) {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  border-bottom: none;
  padding: 16px 24px;
  color: white;
  font-weight: 600;
}

.result-card {
  margin-bottom: 24px;
  border-radius: 8px;
  border: none;
}

.result-card :deep(.el-card__header) {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
  border-bottom: none;
  padding: 16px 24px;
  color: white;
  font-weight: 600;
}

.history-card {
  border-radius: 8px;
  border: none;
}

.history-card :deep(.el-card__header) {
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
  border-bottom: none;
  padding: 16px 24px;
  color: white;
  font-weight: 600;
}

.history-card :deep(.el-table) {
  background: white;
}

.history-card :deep(.el-table__header th) {
  background-color: #f0f9ff;
  color: #0c3d47;
  font-weight: 600;
}

.history-card :deep(.el-table__row:hover > td) {
  background-color: #f5f7fa !important;
}

.debug-card {
  border-radius: 8px;
  border: none;
  margin-top: 24px;
}

.debug-card :deep(.el-card__header) {
  background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
  border-bottom: none;
  padding: 16px 24px;
  color: white;
  font-weight: 600;
}

.debug-card :deep(.el-card__body) {
  padding: 0;
}
</style>
