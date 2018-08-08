import Vue from 'vue'
import Vuex from 'vuex'

import event from './event'
import promoter from './promoter'
import crew from './crew'
import task from './task'
import user from './user'
import shared from './shared'

Vue.use(Vuex)

export const store = new Vuex.Store({
  modules: {
    event: event,
    promoter: promoter,
    crew: crew,
    task: task,
    user: user,
    shared: shared
  }
})
