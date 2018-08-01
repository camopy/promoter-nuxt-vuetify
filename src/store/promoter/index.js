import { db } from '../../main'

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
      db.collection('events').doc(payload.id).collection('usersApplying').get()
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
