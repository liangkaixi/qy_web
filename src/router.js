import { createRouter, createWebHistory } from 'vue-router'

import Home from './views/Home.vue'
import Login from './views/Login.vue'
import Register from './views/Register.vue'
import Basketball from './views/Basketball.vue'
import Badminton from './views/Badminton.vue'
import Volleyball from './views/Volleyball.vue'
import Fitness from './views/Fitness.vue'
import Reserve from './views/Reserve.vue'

const routes = [
  { path: '/', component: Home },
  { path: '/login', component: Login },
  { path: '/register', component: Register },
  { path: '/basketball', component: Basketball },
  { path: '/badminton', component: Badminton },
  { path: '/volleyball', component: Volleyball },
  { path: '/fitness', component: Fitness },
  { path: '/reserve/:type', component: Reserve },
  { path: '/reservation', component: () => import('./views/Reservation.vue') },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
