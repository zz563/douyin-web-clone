import { createRouter, createWebHistory } from 'vue-router'


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', redirect: '/home' },
    {
      path: '/home',
      name: 'home',
      meta: { title: '推荐' },
      component: () => import('../views/HomeView.vue'),
    },
    {
      path: '/publish',
      name: 'publish',
      meta: { title: '发布视频' },
      component: () => import('../views/PublishVideoView.vue'),
    },
    {
      path: '/my-videos',
      name: 'my-videos',
      meta: { title: '我的视频' },
      component: () => import('../views/MyVideosView.vue'),
    },
  ],
})

export default router
