import { createRouter, createWebHistory } from 'vue-router'

import Home from './views/Home.vue'
import Login from './views/Login.vue'
import Register from './views/Register.vue'
import Basketball from './views/Basketball.vue'
import Badminton from './views/Badminton.vue'
import Volleyball from './views/Volleyball.vue'
import Fitness from './views/Fitness.vue'
import Reservation from './views/Reservation.vue'
import Me from './views/Me.vue'
import MyTeams from './views/MyTeams.vue'
import MeEdit from './views/MeEdit.vue'
import Train from './views/Train.vue'
import MatchHall from './views/MatchHall.vue';

const routes = [
  { path: '/', component: Home },
  { path: '/login', component: Login },
  { path: '/register', component: Register },
  { path: '/basketball', component: Basketball },
  { path: '/badminton', component: Badminton },
  { path: '/volleyball', component: Volleyball },
  { path: '/fitness', component: Fitness },
  { path: '/reserve', component: Reservation },
  { path: '/reservation', component: () => import('./views/Reservation.vue') },
  { path: '/me', component: Me },
  { path: '/me/edit', component: MeEdit },
  { path: '/my-teams', component: MyTeams },
  { path: '/train', component: Train },
  {
    path: '/match',
    name: 'MatchHall',
    component: MatchHall
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
