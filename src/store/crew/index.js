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
      db.collection('users').where('accountType', '==', 'crew').orderBy('name')
        .onSnapshot((querySnapshot) => {
          const crew = []
          querySnapshot.forEach((doc) => {
            crew.push({
              id: doc.id,
              name: doc.data().name,
              email: doc.data().email,
              dateCreated: doc.data().dateCreated,
              facebook: doc.data().facebook,
              instagram: doc.data().instagram,
              imageUrl: doc.data().imageUrl,
              imagePath: doc.data().imagePath
            })
          })
          commit('setLoadedCrewList', crew)
          commit('setLoading', false)
        }, function (error) {
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
