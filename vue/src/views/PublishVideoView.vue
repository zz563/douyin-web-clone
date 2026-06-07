<template>
  <MainLayout>
    <div class="publish-page">
      <template v-if="isLoggedIn">
        <VideoUploadPanel @success="onUploadSuccess" />
      </template>

      <AuthGate
        v-else
        title="登录后发布视频"
        description="上传视频需登录账号，请先登录或注册"
        @login="authVisible = true"
      />

      <AuthDialog v-model="authVisible" />
    </div>
  </MainLayout>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import MainLayout from '@/layout/MainLayout.vue'
import AuthDialog from '@/features/auth/components/AuthDialog.vue'
import AuthGate from '@/features/auth/components/AuthGate.vue'
import VideoUploadPanel from '@/features/video/components/VideoUploadPanel.vue'
import { useAuth } from '@/features/auth/composables/useAuth'

const router = useRouter()
const { isLoggedIn } = useAuth()
const authVisible = ref(false)

async function onUploadSuccess() {
  try {
    await ElMessageBox.confirm('视频发布成功，是否前往「我的视频」查看？', '发布成功', {
      confirmButtonText: '前往查看',
      cancelButtonText: '继续发布',
      type: 'success',
    })
    router.push('/my-videos')
  } catch {
    ElMessage.success('可继续发布更多视频')
  }
}
</script>

<style scoped>
.publish-page {
  max-width: 720px;
  margin: 0 auto;
}
</style>
