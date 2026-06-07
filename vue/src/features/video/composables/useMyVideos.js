import { ref, computed } from 'vue'
import * as videoApi from '@/features/video/api'

export function useMyVideos(getUserId) {
  const allVideos = ref([])
  const loading = ref(false)
  const page = ref(1)
  const pageSize = ref(6)
  const total = ref(0)
  const videoUrls = ref({})

  const pagedVideos = computed(() => {
    const start = (page.value - 1) * pageSize.value
    return allVideos.value.slice(start, start + pageSize.value)
  })

  async function fetchList() {
    const userId = getUserId()
    if (!userId) {
      allVideos.value = []
      total.value = 0
      return { isSuccess: false, message: '请先登录' }
    }

    loading.value = true
    try {
      const res = await videoApi.getUserVideos(userId)
      if (!res.isSuccess) {
        allVideos.value = []
        total.value = 0
        return res
      }

      const list = (res.data || [])
        .filter((item) => item.status === 1)
        .sort((a, b) => new Date(b.createTime) - new Date(a.createTime))

      allVideos.value = list
      total.value = list.length

      const maxPage = Math.max(1, Math.ceil(total.value / pageSize.value))
      if (page.value > maxPage) {
        page.value = maxPage
      }

      return res
    } finally {
      loading.value = false
    }
  }

  async function loadVideoUrl(videoId) {
    if (videoUrls.value[videoId]) return videoUrls.value[videoId]

    const res = await videoApi.getVideoUrl(videoId)
    if (res.isSuccess && res.data?.url) {
      videoUrls.value = { ...videoUrls.value, [videoId]: res.data.url }
      return res.data.url
    }
    return null
  }

  async function removeVideo(videoId) {
    const res = await videoApi.deleteVideo(videoId)
    if (res.isSuccess) {
      allVideos.value = allVideos.value.filter((item) => item.videoId !== videoId)
      total.value = allVideos.value.length
      const { [videoId]: _, ...rest } = videoUrls.value
      videoUrls.value = rest

      const maxPage = Math.max(1, Math.ceil(total.value / pageSize.value))
      if (page.value > maxPage) {
        page.value = maxPage
      }
    }
    return res
  }

  function setPage(nextPage) {
    page.value = nextPage
  }

  function setPageSize(nextSize) {
    pageSize.value = nextSize
    page.value = 1
  }

  return {
    allVideos,
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
  }
}
