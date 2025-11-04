import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue')
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('../views/Profile.vue')
  },
  {
    path: '/community',
    name: 'Community',
    component: () => import('../views/Community.vue')
  },
  {
    path: '/community/:id',
    name: 'CommunityBoard',
    component: () => import('../views/CommunityBoard.vue')
  },
  {
    path: '/community/:id/schedule',
    name: 'CommunitySchedule',
    component: () => import('../views/CommunitySchedule.vue')
  },
  {
    path: '/courses',
    name: 'Courses',
    component: () => import('../views/Courses.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
