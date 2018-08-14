import Vue from 'vue'
import Router from 'vue-router'
import Signup from '@/components/user/Signup'
import Signin from '@/components/user/Signin'
import Tasks from '@/components/task/Tasks'
import Task from '@/components/task/Task'
import Events from '@/components/event/Events'
import Event from '@/components/event/Event'
import CrewList from '@/components/crew/CrewList'
import Crew from '@/components/crew/Crew'
import Promoters from '@/components/promoter/Promoters'
import Promoter from '@/components/promoter/Promoter'
import Profile from '@/components/user/profile/Profile'
import MyEvents from '@/components/user/profile/myevent/MyEvents'
import PromotersFromEvent from '@/components/user/profile/myevent/promoter/PromotersFromEvent'
import TasksFromEvent from '@/components/user/profile/myevent/task/TasksFromEvent'
import TaskReports from '@/components/task/report/TaskReports'
import TaskReport from '@/components/task/report/TaskReport'
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
      path: '/tasks/:id',
      name: 'Task',
      component: Task,
      props: true,
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
    },
    {
      path: '/profile',
      name: 'Profile',
      component: Profile,
      beforeEnter: AuthGuard
    },
    {
      path: '/myevents',
      name: 'MyEvents',
      component: MyEvents,
      beforeEnter: AuthGuard
    },
    {
      path: '/events/:eventId/promoters',
      name: 'PromotersFromEvent',
      props: true,
      component: PromotersFromEvent,
      beforeEnter: AuthGuard
    },
    {
      path: '/events/:eventId/tasks',
      name: 'TasksFromEvent',
      props: true,
      component: TasksFromEvent,
      beforeEnter: AuthGuard
    },
    {
      path: '/taskReports/',
      name: 'TaskReports',
      component: TaskReports,
      beforeEnter: AuthGuard
    },
    {
      path: '/taskReports/:reportId',
      name: 'TaskReport',
      props: true,
      component: TaskReport,
      beforeEnter: AuthGuard
    }
  ]
})
