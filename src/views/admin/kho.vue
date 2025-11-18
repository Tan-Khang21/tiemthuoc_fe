<template>
  <el-card>
    <h3>📦 Quản lý kho</h3>
    <el-tabs v-model="activeTab">
      <el-tab-pane label="Chưa tách lẻ" name="chuaTachLe">
        <p>Tính năng đang được phát triển...</p>
      </el-tab-pane>
      <el-tab-pane label="Đã tách lẻ" name="daTachLe">
        <p>Tính năng đang được phát triển...</p>
      </el-tab-pane>
    </el-tabs>
  </el-card>
</template>

<script setup>
import { ref } from 'vue';

const activeTab = ref('chuaTachLe');

// Implement kho management: load data from api.thuocview
</script>
