import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'quiz', component: () => import('@/pages/QuizPage.vue') },
  ],
})

export default router
