import Vue from 'vue'
import Router from 'vue-router'
import Signup from '@/components/user/Signup'
import Signin from '@/components/user/Signin'
import Tasks from '@/components/task/Tasks'
import Events from '@/components/event/Events'
import Event from '@/components/event/Event'
import CrewList from '@/components/crew/CrewList'
import Crew from '@/components/crew/Crew'
import Promoters from '@/components/promoter/Promoters'
import Promoter from '@/components/promoter/Promoter'
import AuthGuard from './auth-guard'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Home',
      component: Tasks
    },
    {
      path: '/signup',
      name: 'Signup',
      component: Signup
    },
    {
      path: '/signin',
      name: 'Signin',
      component: Signin
    },
    {
      path: '/tasks',
      name: 'Tasks',
      component: Tasks,
      beforeEnter: AuthGuard
    },
    {
      path: '/events',
      name: 'Events',
      component: Events
    },
    {
      path: '/events/:id',
      name: 'Event',
      props: true,
      component: Event
    },
    {
      path: '/crew',
      name: 'CrewList',
      component: CrewList
    },
    {
      path: '/crew/:id',
      name: 'Crew',
      props: true,
      component: Crew
    },
    {
      path: '/promoters',
      name: 'Promoters',
      component: Promoters
    },
    {
      path: '/promoters/:id',
      name: 'Promoter',
      props: true,
      component: Promoter
    }
  ]
})
