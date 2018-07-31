import * as firebase from 'firebase'
import { db } from '../../main'

export default {
  state: {
    user: null
  },
  mutations: {
    applyUserForEvent (state, payload) {
      if (state.user.eventsApplied.findIndex(event => event.id === payload) >= 0) {
        return
      }
      state.user.eventsApplied.push(payload)
    },
    unapplyUserFromEvent (state, payload) {
      const eventsApplied = state.user.eventsApplied
      eventsApplied.splice(eventsApplied.findIndex(event => event.id === payload), 1)
    },
    setUser (state, payload) {
      state.user = payload
    }
  },
  actions: {
    applyUserForEvent ({commit, getters}, payload) {
      commit('setLoading', true)
      const user = getters.user

      let eventDoc = db.collection('users/' + user.id + '/eventsApplied').doc(payload)
      let userDoc = db.collection('events/' + payload + '/appliedUsers').doc(user.id)

      var batch = db.batch()
      batch.set(eventDoc, {status: 'pending'})
      batch.set(userDoc, {status: 'pending'})
      batch.commit()
        .then(() => {
          commit('setLoading', false)
          commit('applyUserForEvent', payload)
          console.log('User applied to event.')
        })
      .catch(error => {
        commit('setLoading', false)
        console.error('Error applying user to event: ', error)
      })
    },
    unapplyUserFromEvent ({commit, getters}, payload) {
      commit('setLoading', true)
      const user = getters.user
      if (!user.eventsApplied) {
        return false
      } else {
        let eventDoc = db.collection('users/' + user.id + '/eventsApplied').doc(payload)
        let userDoc = db.collection('events/' + payload + '/appliedUsers').doc(user.id)

        var batch = db.batch()
        batch.delete(userDoc)
        batch.delete(eventDoc)
        batch.commit()
          .then(() => {
            commit('setLoading', false)
            commit('unapplyUserFromEvent', payload)
            console.log('User removed from event.')
          })
        .catch(error => {
          commit('setLoading', false)
          console.error('Error removing user from event: ', error)
        })
      }
    },
    signUserUp ({commit}, payload) {
      commit('setLoading', true)
      commit('clearError')
      firebase.auth().createUserWithEmailAndPassword(payload.email, payload.password)
        .then(
          auth => {
            const newUser = {
              id: auth.user.uid,
              promotingEvents: [],
              eventsApplied: [],
              accountType: payload.accountType
            }
            commit('setUser', newUser)

            const newDoc = {
              name: payload.name,
              email: payload.email,
              accountType: payload.accountType
            }
            db.collection('users').doc(auth.user.uid).set(newDoc)
              .then(function () {
                commit('setLoading', false)
                console.log('User added')
              })
              .catch(function (error) {
                commit('setLoading', false)
                console.error('Error adding user: ', error)
              })
          }
        )
        .catch(
          error => {
            commit('setLoading', false)
            commit('setError', error)
            console.log(error)
          }
        )
    },
    signUserIn ({commit}, payload) {
      commit('setLoading', true)
      commit('clearError')
      firebase.auth().signInWithEmailAndPassword(payload.email, payload.password)
        .then(
          auth => {
            db.collection('users').doc(auth.user.uid).get().then(function (doc) {
              commit('setLoading', false)
              if (doc.exists) {
                console.log('Document data:', doc.data())
                const newUser = {
                  id: auth.user.uid,
                  promotingEvents: [],
                  eventsApplied: [],
                  accountType: doc.data().accountType
                }
                commit('setUser', newUser)
              } else {
                console.log('User not found!')
              }
            }).catch(function (error) {
              console.log('Error getting user:', error)
            })
          }
        )
        .catch(
          error => {
            commit('setLoading', false)
            commit('setError', error)
            console.log(error)
          }
        )
    },
    autoSignIn ({commit}, payload) {
      commit('setUser', {
        id: payload.uid,
        promotingEvents: [],
        eventsApplied: []
      })
    },
    fetchUserData ({commit, getters}) {
      commit('setLoading', true)
      db.collection('users').doc(getters.user.id).get()
        .then(function (doc) {
          if (doc.exists) {
            const updatedUser = {
              id: getters.user.id,
              accountType: doc.data().accountType,
              eventsApplied: [],
              promotingEvents: []
            }
            return updatedUser
          } else {
            console.log('User not found!')
          }
        })
        .then(updatedUser => {
          if (updatedUser.accountType === 'promoter') {
            db.collection('users/' + updatedUser.id + '/eventsApplied').get()
              .then((querySnapshot) => {
                let eventsApplied = []
                querySnapshot.forEach((doc) => {
                  eventsApplied.push(doc.id)
                })
                updatedUser.eventsApplied = eventsApplied
                commit('setUser', updatedUser)
                commit('setLoading', false)
              })
            .catch(function (error) {
              console.log('Error getting eventsApplied:', error)
            })
          }
        })
      .catch(function (error) {
        console.log('Error getting user:', error)
      })
    },
    logout ({commit}) {
      firebase.auth().signOut()
      commit('setUser', null)
    }
  },
  getters: {
    user (state) {
      return state.user
    }
  }
}
