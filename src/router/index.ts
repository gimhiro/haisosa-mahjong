import { createRouter, createWebHashHistory } from 'vue-router'
import HomeView from '../views/HomeView/index.vue'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/game',
      name: 'game',
      component: () => import('../views/GameView.vue'),
    },
    {
      path: '/four-player',
      name: 'four-player',
      component: () => import('../views/FourPlayerGameView/index.vue'),
    },
  ],
})

export default router
