import { createRouter, createWebHashHistory } from 'vue-router'
import ScoreBoard from '../components/ScoreBoard.vue'
import FinalScoreBoard from '../components/FinalScoreBoard.vue'
import Submit from '../components/Submit.vue'

const routes = [
  {
    path: '/',
    redirect: { name: 'leaderboard' },
    name: 'home'
  },
  {
    path: '/leaderboard',
    name: 'leaderboard',
    component: ScoreBoard
  },
  {
    path: '/finalleaderboard',
    name: 'finalleaderboard',
    component: FinalScoreBoard
  },
  {
    path: '/submit',
    name: 'submit',
    component: Submit
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
