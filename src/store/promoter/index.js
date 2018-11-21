import { db } from '../../main'
import * as moment from 'moment'

export default {
  state: {
    loadedPromoters: [],
    loadedPromotersFromEvent: []
  },
  mutations: {
    setLoadedPromoters (state, payload) {
      state.loadedPromoters = payload
    },
    setLoadedPromotersFromEvent (state, payload) {
      state.loadedPromotersFromEvent = payload
    },
    setPromoterStatusFromEvent (state, payload) {
      const loadedPromotersFromEvent = state.loadedPromotersFromEvent
      loadedPromotersFromEvent.forEach((element, index) => {
        if (element.id === payload.id) {
          loadedPromotersFromEvent[index].status = payload.status
        }
      })
      state.loadedPromotersFromEvent = loadedPromotersFromEvent
    }
  },
  actions: {
    loadPromoters ({commit}, payload) {
      commit('setLoading', true)
      db.collection('users').where('accountType', '==', 'promoter')
        .onSnapshot((querySnapshot) => {
          const promoters = []
          querySnapshot.forEach((doc) => {
            promoters.push({
              id: doc.id,
              name: doc.data().name,
              email: doc.data().email,
              dateCreated: doc.data().dateCreated,
              instagram: doc.data().instagram,
              facebook: doc.data().facebook,
              imageUrl: doc.data().imageUrl,
              imagePath: doc.data().imagePath
            })
          })
          commit('setLoadedPromoters', promoters)
          commit('setLoading', false)
        }, function (error) {
          console.error('Error fetching users by accountType: ', error)
          commit('setLoading', false)
        })
    },
    loadPromotersFromEvent ({commit}, payload) {
      commit('setLoading', true)
      db.collection('promoters').where('eventId', '==', payload.id)
        .onSnapshot((querySnapshot) => {
          const promoters = []
          querySnapshot.forEach((doc) => {
            promoters.push({
              id: doc.data().userId,
              name: doc.data().userName,
              status: doc.data().status,
              applyDate: doc.data().applyDate,
              updateDate: doc.data().updateDate,
              taskReportsDone: doc.data().taskReportsDone,
              taskReportsNotdone: doc.data().taskReportsNotdone,
              taskReportsIncomplete: doc.data().taskReportsIncomplete,
              taskReportsComplete: doc.data().taskReportsComplete
            })
          })
          commit('setLoadedPromotersFromEvent', promoters)
          commit('setLoading', false)
        }, function (error) {
          console.error('Error fetching events from user: ', error)
          commit('setLoading', false)
        })
    },
    updatePromoterStatusFromEvent ({commit}, payload) {
      commit('setLoading', true)

      db.collection('promoters').doc(payload.promoterId + '_' + payload.eventId)
        .update({status: payload.status, updateDate: moment().toISOString()})
        .then(() => {
          commit('setLoading', false)
          commit('setPromoterStatusFromEvent', {id: payload.promoterId, status: payload.status})
          console.log('User accepted to event.')
        })
        .catch(error => {
          commit('setLoading', false)
          console.error('Error accepting user to event: ', error)
        })
    }
  },
  getters: {
    loadedPromoters (state) {
      return state.loadedPromoters
    },
    loadedPromoter (state) {
      return (promoterId) => {
        return state.loadedPromoters.find((promoter) => {
          return promoter.id === promoterId
        })
      }
    },
    loadedPromotersFromEvent (state) {
      return state.loadedPromotersFromEvent
    },
    loadedPromoterFromEvent (state) {
      return (promoterId) => {
        return state.loadedPromotersFromEvent.find((promoter) => {
          return promoter.id === promoterId
        })
      }
    }
  }
}
