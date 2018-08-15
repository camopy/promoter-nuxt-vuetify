import { db } from '../../main'

export default {
  state: {
    loadedCrewList: []
  },
  mutations: {
    setLoadedCrewList (state, payload) {
      state.loadedCrewList = payload
    }
  },
  actions: {
    loadCrew ({commit}, payload) {
      commit('setLoading', true)
      db.collection('users').where('accountType', '==', 'crew').get()
        .then((querySnapshot) => {
          const crew = []
          querySnapshot.forEach((doc) => {
            crew.push({
              id: doc.id,
              name: doc.data().name,
              email: doc.data().email,
              dateCreated: doc.data().dateCreated,
              facebook: doc.data().facebook,
              instagram: doc.data().instagram
            })
          })
          commit('setLoadedCrewList', crew)
          commit('setLoading', false)
        })
      .catch(function (error) {
        console.error('Error fetching users by accountType: ', error)
        commit('setLoading', false)
      })
    }
  },
  getters: {
    loadedCrewList (state) {
      return state.loadedCrewList
    },
    loadedCrew (state) {
      return (crewId) => {
        return state.loadedCrewList.find((crew) => {
          return crew.id === crewId
        })
      }
    }
  }
}
