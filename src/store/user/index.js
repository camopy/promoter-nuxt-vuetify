import * as firebase from 'firebase'
import { db } from '../../main'
import * as moment from 'moment'

export default {
  state: {
    user: null
  },
  mutations: {
    applyUserForEvent (state, payload) {
      if (state.user.eventsApplying.findIndex(event => event.id === payload) >= 0) {
        return
      }
      state.user.eventsApplying.push(payload)
    },
    unapplyUserFromEvent (state, payload) {
      const eventsApplying = state.user.eventsApplying
      eventsApplying.splice(eventsApplying.findIndex(event => event.id === payload), 1)
    },
    setUser (state, payload) {
      state.user = payload
    }
  },
  actions: {
    applyUserForEvent ({commit, getters}, payload) {
      commit('setLoading', true)
      const user = getters.user

      let eventDoc = db.collection('users/' + user.id + '/eventsApplying').doc(payload)
      let userDoc = db.collection('events/' + payload + '/usersApplying').doc(user.id)

      var batch = db.batch()
      let applyDate = moment().toISOString()
      batch.set(eventDoc, {status: 'pending', applyDate: applyDate})
      batch.set(userDoc, {status: 'pending', applyDate: applyDate})
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
      if (!user.eventsApplying) {
        return false
      } else {
        let eventDoc = db.collection('users/' + user.id + '/eventsApplying').doc(payload)
        let userDoc = db.collection('events/' + payload + '/usersApplying').doc(user.id)

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
              eventsApplying: [],
              accountType: payload.accountType,
              dateCreated: moment().toISOString()
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
          () => {
            commit('setLoading', false)
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
        eventsApplying: []
      })
    },
    fetchUserData ({commit, getters}) {
      commit('setLoading', true)
      db.collection('users').doc(getters.user.id).get()
        .then(function (doc) {
          if (doc.exists) {
            const updatedUser = {
              id: getters.user.id,
              name: doc.data().name,
              email: doc.data().email,
              accountType: doc.data().accountType,
              dateCreated: doc.data().dateCreated,
              eventsApplying: [],
              promotingEvents: []
            }
            return updatedUser
          } else {
            console.log('User not found!')
          }
        })
        .then(updatedUser => {
          if (updatedUser.accountType === 'promoter') {
            db.collection('users/' + updatedUser.id + '/eventsApplying').get()
              .then((querySnapshot) => {
                let eventsApplying = []
                querySnapshot.forEach((doc) => {
                  eventsApplying.push(doc.id)
                })
                updatedUser.eventsApplying = eventsApplying
                commit('setUser', updatedUser)
                commit('setLoading', false)
              })
            .catch(function (error) {
              console.log('Error getting eventsApplying:', error)
            })
          } else {
            commit('setUser', updatedUser)
            commit('setLoading', false)
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
