<template>
  <section class="upload-panel">
    <div class="panel-head">
      <h3 class="panel-title">发布视频</h3>
      <p class="panel-desc">选择本地视频文件，填写标题与描述后发布</p>
    </div>

    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-position="top"
      class="upload-form"
      @submit.prevent
    >
      <el-form-item label="视频文件" prop="file">
        <div
          class="file-picker"
          :class="{ 'has-file': !!form.file, dragging }"
          @dragover.prevent="dragging = true"
          @dragleave.prevent="dragging = false"
          @drop.prevent="onDrop"
          @click="openFileDialog"
        >
          <input
            ref="fileInputRef"
            type="file"
            accept="video/mp4,video/webm,video/quicktime,video/x-msvideo,video/x-matroska,video/x-flv,.mp4,.mov,.avi,.mkv,.webm,.flv"
            class="file-input"
            @change="onFileChange"
          />

          <template v-if="form.file">
            <el-icon class="file-icon"><VideoCamera /></el-icon>
            <div class="file-meta">
              <span class="file-name">{{ form.file.name }}</span>
              <span class="file-size">{{ formatSize(form.file.size) }}</span>
            </div>
            <el-button type="danger" link @click.stop="clearFile">移除</el-button>
          </template>

          <template v-else>
            <el-icon class="upload-icon"><UploadFilled /></el-icon>
            <p class="upload-tip">点击或拖拽视频到此处</p>
            <p class="upload-hint">支持 MP4、MOV、AVI、MKV、WEBM、FLV，最大 100MB</p>
          </template>
        </div>
      </el-form-item>

      <el-form-item label="视频标题" prop="title">
        <el-input
          v-model="form.title"
          maxlength="80"
          show-word-limit
          placeholder="请输入视频标题"
        />
      </el-form-item>

      <el-form-item label="视频描述" prop="description">
        <el-input
          v-model="form.description"
          type="textarea"
          :rows="3"
          maxlength="500"
          show-word-limit
          placeholder="介绍一下你的视频（可选）"
        />
      </el-form-item>

      <div class="form-actions">
        <el-button
          type="primary"
          :loading="uploading"
          :disabled="uploading"
          @click="submit"
        >
          {{ uploading ? `上传中 ${uploadProgress}%` : '发布视频' }}
        </el-button>
        <el-button :disabled="uploading" @click="resetForm">重置</el-button>
      </div>
    </el-form>
  </section>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { UploadFilled, VideoCamera } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import * as videoApi from '@/features/video/api'

const emit = defineEmits(['success'])

const formRef = ref(null)
const fileInputRef = ref(null)
const uploading = ref(false)
const uploadProgress = ref(0)
const dragging = ref(false)

const form = reactive({
  file: null,
  title: '',
  description: '',
})

const rules = {
  file: [{ required: true, message: '请选择视频文件', trigger: 'change' }],
  title: [
    { required: true, message: '请输入视频标题', trigger: 'blur' },
    { min: 1, max: 80, message: '标题长度 1-80 个字符', trigger: 'blur' },
  ],
}

const MAX_SIZE = 100 * 1024 * 1024
const ALLOWED_TYPES = [
  'video/mp4',
  'video/webm',
  'video/quicktime',
  'video/x-msvideo',
  'video/x-matroska',
  'video/x-flv',
]

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function validateFile(file) {
  if (!file) return '请选择视频文件'
  if (!file.type.startsWith('video/') && !ALLOWED_TYPES.includes(file.type)) {
    return '仅支持视频文件上传'
  }
  if (file.size > MAX_SIZE) {
    return '视频文件不能超过 100MB'
  }
  return null
}

function setFile(file) {
  const error = validateFile(file)
  if (error) {
    ElMessage.warning(error)
    return
  }
  form.file = file
  formRef.value?.validateField('file')
}

function openFileDialog() {
  fileInputRef.value?.click()
}

function onFileChange(event) {
  const file = event.target.files?.[0]
  if (file) setFile(file)
  event.target.value = ''
}

function onDrop(event) {
  dragging.value = false
  const file = event.dataTransfer.files?.[0]
  if (file) setFile(file)
}

function clearFile() {
  form.file = null
}

function resetForm() {
  form.file = null
  form.title = ''
  form.description = ''
  formRef.value?.clearValidate()
}

async function submit() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  uploading.value = true
  uploadProgress.value = 10

  const timer = window.setInterval(() => {
    if (uploadProgress.value < 90) {
      uploadProgress.value += 8
    }
  }, 300)

  try {
    const res = await videoApi.uploadVideo({
      file: form.file,
      title: form.title,
      description: form.description,
    })

    uploadProgress.value = 100

    if (res.isSuccess) {
      ElMessage.success(res.message || '发布成功')
      resetForm()
      emit('success', res.data)
    } else if (res.code === '401' || res.httpStatus === 401) {
      ElMessage.error('请先登录后再发布视频')
    } else {
      ElMessage.error(res.message || '发布失败')
    }
  } finally {
    window.clearInterval(timer)
    uploading.value = false
    uploadProgress.value = 0
  }
}
</script>

<style scoped>
.upload-panel {
  padding: 24px;
  background: var(--dy-bg-elevated);
  border: 1px solid var(--dy-border);
  border-radius: var(--dy-radius-lg);
}

.panel-head {
  margin-bottom: 20px;
}

.panel-title {
  margin: 0 0 6px;
  font-size: 18px;
  font-weight: 600;
}

.panel-desc {
  margin: 0;
  font-size: 13px;
  color: var(--dy-text-secondary);
}

.upload-form :deep(.el-form-item__label) {
  color: var(--dy-text-secondary);
}

.file-picker {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  min-height: 120px;
  padding: 20px;
  border: 1px dashed rgba(255, 255, 255, 0.18);
  border-radius: var(--dy-radius);
  background: rgba(255, 255, 255, 0.02);
  cursor: pointer;
  transition: border-color 0.2s, background 0.2s;
}

.file-picker:hover,
.file-picker.dragging {
  border-color: rgba(254, 44, 85, 0.6);
  background: rgba(254, 44, 85, 0.05);
}

.file-picker.has-file {
  min-height: auto;
  cursor: default;
}

.file-input {
  display: none;
}

.upload-icon,
.file-icon {
  font-size: 32px;
  color: var(--dy-text-muted);
}

.file-meta {
  flex: 1;
  min-width: 0;
}

.file-name {
  display: block;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-size {
  display: block;
  margin-top: 4px;
  font-size: 12px;
  color: var(--dy-text-muted);
}

.upload-tip {
  margin: 0;
  font-size: 14px;
}

.upload-hint {
  margin: 6px 0 0;
  font-size: 12px;
  color: var(--dy-text-muted);
}

.form-actions {
  display: flex;
  gap: 12px;
}
</style>
