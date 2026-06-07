<template>
  <section class="login-gate">
    <el-icon class="gate-icon"><Lock /></el-icon>
    <h2>{{ title }}</h2>
    <p>{{ description }}</p>
    <el-button type="primary" @click="$emit('login')">登录 / 注册</el-button>
  </section>
</template>

<script setup>
import { Lock } from '@element-plus/icons-vue'

defineProps({
  title: { type: String, default: '请先登录' },
  description: { type: String, default: '该功能需要登录后使用' },
})

defineEmits(['login'])
</script>

<style scoped>
.login-gate {
  max-width: 420px;
  margin: 80px auto 0;
  padding: 48px 32px;
  text-align: center;
  background: var(--dy-bg-elevated);
  border: 1px solid var(--dy-border);
  border-radius: var(--dy-radius-lg);
}

.gate-icon {
  font-size: 40px;
  color: var(--dy-text-muted);
  margin-bottom: 16px;
}

.login-gate h2 {
  margin: 0 0 10px;
  font-size: 20px;
}

.login-gate p {
  margin: 0 0 24px;
  font-size: 14px;
  color: var(--dy-text-secondary);
}
</style>
