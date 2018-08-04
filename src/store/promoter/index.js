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
      db.collection('users').where('accountType', '==', 'promoter').get()
        .then((querySnapshot) => {
          const promoters = []
          querySnapshot.forEach((doc) => {
            promoters.push({
              id: doc.id,
              name: doc.data().name,
              email: doc.data().email,
              dateCreated: doc.data().dateCreated
            })
          })
          commit('setLoadedPromoters', promoters)
          commit('setLoading', false)
        })
      .catch(function (error) {
        console.error('Error fetching users by accountType: ', error)
        commit('setLoading', false)
      })
    },
    loadPromotersFromEvent ({commit}, payload) {
      commit('setLoading', true)
      db.collection('events').doc(payload.id).collection('promoters').get()
        .then((querySnapshot) => {
          const promoters = []
          querySnapshot.forEach((doc) => {
            promoters.push({
              id: doc.id,
              name: doc.data().name,
              status: doc.data().status,
              applyDate: doc.data().applyDate
            })
          })
          commit('setLoadedPromotersFromEvent', promoters)
          commit('setLoading', false)
        })
      .catch(function (error) {
        console.error('Error fetching events from user: ', error)
        commit('setLoading', false)
      })
    },
    updatePromoterStatusFromEvent ({commit}, payload) {
      commit('setLoading', true)
      let eventDoc = db.collection('users/' + payload.promoterId + '/events').doc(payload.eventId)
      let userDoc = db.collection('events/' + payload.eventId + '/promoters').doc(payload.promoterId)

      var batch = db.batch()
      const updateDate = moment().toISOString()
      batch.update(eventDoc, {status: payload.status, updateDate: updateDate})
      batch.update(userDoc, {status: payload.status, updateDate: updateDate})
      batch.commit()
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
    }
  }
}
