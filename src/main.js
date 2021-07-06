// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import * as firebase from 'firebase'
import router from './router'
import Vuetify from 'vuetify'
import 'vuetify/dist/vuetify.min.css'
import { store } from './store'
import AlertCmp from './components/Shared/Alert'
import UrlIconCmp from './components/Shared/UrlIcon'
import ApplyDialog from './components/event/apply/ApplyDialog'
import ReportDialog from './components/task/report/ReportDialog'
import EditProfileDialog from './components/user/profile/edit/EditProfileDialog'
import EditEventDialog from './components/event/edit/EditEventDialog'
import DeleteEventDialog from './components/event/delete/DeleteEventDialog'
import EditTaskDialog from './components/task/edit/EditTaskDialog'
import DeleteTaskDialog from './components/task/delete/DeleteTaskDialog'
import moment from 'moment'

Vue.use(Vuetify)

moment.locale('pt-br')
Vue.prototype.$moment = moment

Vue.config.productionTip = false

Vue.component('app-alert', AlertCmp)
Vue.component('app-url-icon', UrlIconCmp)
Vue.component('app-event-apply-dialog', ApplyDialog)
Vue.component('app-profile-edit-dialog', EditProfileDialog)
Vue.component('app-event-edit-dialog', EditEventDialog)
Vue.component('app-event-delete-dialog', DeleteEventDialog)
Vue.component('app-task-edit-dialog', EditTaskDialog)
Vue.component('app-task-delete-dialog', DeleteTaskDialog)
Vue.component('app-task-report-dialog', ReportDialog)

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  components: { App },
  template: '<App/>',
  created () {
    firebase.initializeApp({
      apiKey: 'removed-and-fb-project-deleted',
      authDomain: 'removed-and-fb-project-deleted',
      databaseURL: 'removed-and-fb-project-deleted',
      projectId: 'removed-and-fb-project-deleted',
      storageBucket: 'removed-and-fb-project-deleted',
      messagingSenderId: 'removed-and-fb-project-deleted'
    })
    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        // this.$store.dispatch('autoSignIn', user)
        this.$store.dispatch('fetchUserData', user)
        this.$store.dispatch('loadPromoters')
      }
    })
  }
})

export const db = firebase.firestore()
const settings = {timestampsInSnapshots: true}
db.settings(settings)

store.dispatch('loadEvents')
store.dispatch('loadCrew')
