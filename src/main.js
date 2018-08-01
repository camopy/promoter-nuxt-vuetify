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
import ApplyDialog from './components/event/apply/ApplyDialog'
import moment from 'moment'

Vue.use(Vuetify)

moment.locale('pt-br')
Vue.prototype.$moment = moment

Vue.config.productionTip = false

Vue.component('app-alert', AlertCmp)
Vue.component('app-event-apply-dialog', ApplyDialog)

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  components: { App },
  template: '<App/>',
  created () {
    firebase.initializeApp({
      apiKey: 'AIzaSyB6brmAMm-PoNBSSq1w3Zd64LoWTZ5ECTk',
      authDomain: 'promoter-dev.firebaseapp.com',
      databaseURL: 'https://promoter-dev.firebaseio.com',
      projectId: 'promoter-dev',
      storageBucket: 'promoter-dev.appspot.com',
      messagingSenderId: '958587428573'
    })
    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        this.$store.dispatch('autoSignIn', user)
        this.$store.dispatch('loadEventsFromUser', user)
        this.$store.dispatch('fetchUserData')
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
