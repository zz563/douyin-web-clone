import { request, uploadRequest } from '@/shared/api/http'

const VIDEO_PREFIX = '/video'

export function uploadVideo({ file, title, description }) {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('title', title.trim())
  if (description?.trim()) {
    formData.append('description', description.trim())
  }
  return uploadRequest(`${VIDEO_PREFIX}/upload`, formData)
}

export function getUserVideos(userId) {
  return request(`${VIDEO_PREFIX}/user/${userId}`)
}

export function getVideoUrl(videoId) {
  return request(`${VIDEO_PREFIX}/url/${videoId}`)
}

export function deleteVideo(videoId) {
  return request(`${VIDEO_PREFIX}/${videoId}`, { method: 'DELETE' })
}
