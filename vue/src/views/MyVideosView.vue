<template>
  <MainLayout>
    <div class="my-videos-page">
      <template v-if="isLoggedIn">
        <MyVideoList
          :videos="pagedVideos"
          :total="total"
          :loading="loading"
          :page="page"
          :page-size="pageSize"
          :video-urls="videoUrls"
          :deleting-id="deletingId"
          @refresh="refreshList"
          @page-change="setPage"
          @size-change="setPageSize"
          @load-preview="loadVideoUrl"
          @delete="onDelete"
        />
      </template>

      <AuthGate
        v-else
        title="登录后管理你的视频"
        description="查看已发布视频、分页浏览与删除内容均需登录"
        @login="authVisible = true"
      />

      <AuthDialog v-model="authVisible" @success="onAuthSuccess" />
    </div>
  </MainLayout>
</template>

<script setup>
import { ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import MainLayout from '@/layout/MainLayout.vue'
import AuthDialog from '@/features/auth/components/AuthDialog.vue'
import AuthGate from '@/features/auth/components/AuthGate.vue'
import MyVideoList from '@/features/video/components/MyVideoList.vue'
import { useAuth } from '@/features/auth/composables/useAuth'
import { useMyVideos } from '@/features/video/composables/useMyVideos'

const { isLoggedIn, user } = useAuth()

const authVisible = ref(false)
const deletingId = ref('')

const {
  pagedVideos,
  loading,
  page,
  pageSize,
  total,
  videoUrls,
  fetchList,
  loadVideoUrl,
  removeVideo,
  setPage,
  setPageSize,
} = useMyVideos(() => user.value?.userId)

async function refreshList() {
  const res = await fetchList()
  if (!res.isSuccess && res.message) {
    ElMessage.error(res.message)
  }
}

async function onAuthSuccess() {
  authVisible.value = false
  await refreshList()
}

async function onDelete(videoId) {
  deletingId.value = videoId
  try {
    const res = await removeVideo(videoId)
    if (res.isSuccess) {
      ElMessage.success(res.message || '删除成功')
    } else if (res.code === '403') {
      ElMessage.error('只能删除自己发布的视频')
    } else {
      ElMessage.error(res.message || '删除失败')
    }
  } finally {
    deletingId.value = ''
  }
}

watch(
  isLoggedIn,
  (loggedIn) => {
    if (loggedIn) {
      refreshList()
    }
  },
  { immediate: true },
)
</script>

<style scoped>
.my-videos-page {
  max-width: 1080px;
  margin: 0 auto;
}
</style>
