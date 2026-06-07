<template>
  <section class="video-list-panel">
    <div class="panel-head">
      <div>
        <h3 class="panel-title">我的视频</h3>
        <p class="panel-desc">按发布时间倒序展示，共 {{ total }} 条</p>
      </div>
      <el-button :loading="loading" @click="$emit('refresh')">
        <el-icon><Refresh /></el-icon>
        刷新
      </el-button>
    </div>

    <div v-loading="loading" class="list-body">
      <el-empty v-if="!loading && total === 0" description="还没有发布过视频">
        <template #image>
          <el-icon class="empty-icon"><VideoCamera /></el-icon>
        </template>
      </el-empty>

      <div v-else class="video-grid">
        <article
          v-for="video in videos"
          :key="video.videoId"
          class="video-card"
        >
          <div class="video-preview">
            <video
              v-if="videoUrls[video.videoId]"
              :src="videoUrls[video.videoId]"
              controls
              preload="metadata"
              class="video-player"
            />
            <div v-else class="video-placeholder">
              <el-button
                type="primary"
                link
                :loading="loadingUrls[video.videoId]"
                @click="onLoadPreview(video.videoId)"
              >
                加载预览
              </el-button>
            </div>
          </div>

          <div class="video-info">
            <h4 class="video-title" :title="video.title">{{ video.title }}</h4>
            <p v-if="video.description" class="video-desc">{{ video.description }}</p>
            <div class="video-meta">
              <span>{{ formatTime(video.createTime) }}</span>
              <span>{{ formatSize(video.size) }}</span>
              <span>{{ (video.format || 'mp4').toUpperCase() }}</span>
            </div>
            <div class="video-stats">
              <span><el-icon><View /></el-icon>{{ video.viewCount ?? 0 }}</span>
              <span><el-icon><Star /></el-icon>{{ video.likeCount ?? 0 }}</span>
            </div>
          </div>

          <div class="video-actions">
            <el-button
              type="danger"
              plain
              size="small"
              :loading="deletingId === video.videoId"
              @click="onDelete(video)"
            >
              删除
            </el-button>
          </div>
        </article>
      </div>

      <div v-if="total > 0" class="pagination-wrap">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="currentPageSize"
          :total="total"
          :page-sizes="[6, 12, 24]"
          layout="total, sizes, prev, pager, next, jumper"
          background
          @current-change="onPageChange"
          @size-change="onSizeChange"
        />
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, reactive, watch } from 'vue'
import { Refresh, VideoCamera, View, Star } from '@element-plus/icons-vue'
import { ElMessageBox } from 'element-plus'

const props = defineProps({
  videos: { type: Array, default: () => [] },
  total: { type: Number, default: 0 },
  loading: { type: Boolean, default: false },
  page: { type: Number, default: 1 },
  pageSize: { type: Number, default: 6 },
  videoUrls: { type: Object, default: () => ({}) },
  deletingId: { type: String, default: '' },
})

const emit = defineEmits([
  'refresh',
  'page-change',
  'size-change',
  'load-preview',
  'delete',
])

const loadingUrls = reactive({})

const currentPage = computed({
  get: () => props.page,
  set: (value) => emit('page-change', value),
})

const currentPageSize = computed({
  get: () => props.pageSize,
  set: (value) => emit('size-change', value),
})

watch(
  () => props.videos,
  (list) => {
    list.forEach((video) => {
      if (!props.videoUrls[video.videoId] && !loadingUrls[video.videoId]) {
        onLoadPreview(video.videoId)
      }
    })
  },
  { immediate: true },
)

function formatTime(value) {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString('zh-CN', { hour12: false })
}

function formatSize(bytes) {
  if (!bytes) return '-'
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

async function onLoadPreview(videoId) {
  loadingUrls[videoId] = true
  try {
    emit('load-preview', videoId)
  } finally {
    loadingUrls[videoId] = false
  }
}

function onPageChange(page) {
  emit('page-change', page)
}

function onSizeChange(size) {
  emit('size-change', size)
}

async function onDelete(video) {
  try {
    await ElMessageBox.confirm(
      `确定删除视频「${video.title}」吗？删除后无法恢复。`,
      '删除视频',
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning',
        confirmButtonClass: 'el-button--danger',
      },
    )
  } catch {
    return
  }

  emit('delete', video.videoId)
}
</script>

<style scoped>
.video-list-panel {
  padding: 24px;
  background: var(--dy-bg-elevated);
  border: 1px solid var(--dy-border);
  border-radius: var(--dy-radius-lg);
}

.panel-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
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

.list-body {
  min-height: 180px;
}

.empty-icon {
  font-size: 48px;
  color: var(--dy-text-muted);
}

.video-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.video-card {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid var(--dy-border);
  border-radius: var(--dy-radius);
}

.video-preview {
  aspect-ratio: 16 / 9;
  background: #000;
}

.video-player {
  width: 100%;
  height: 100%;
  object-fit: contain;
  background: #000;
}

.video-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.04);
}

.video-info {
  flex: 1;
  padding: 14px 14px 10px;
}

.video-title {
  margin: 0 0 8px;
  font-size: 15px;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.video-desc {
  margin: 0 0 10px;
  font-size: 13px;
  line-height: 1.5;
  color: var(--dy-text-secondary);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.video-meta,
.video-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  font-size: 12px;
  color: var(--dy-text-muted);
}

.video-stats {
  margin-top: 8px;
}

.video-stats span {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.video-actions {
  padding: 0 14px 14px;
}

.pagination-wrap {
  display: flex;
  justify-content: center;
  margin-top: 24px;
}
</style>
