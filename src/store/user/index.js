import * as firebase from 'firebase'
import { db } from '../../main'
import * as moment from 'moment'

export default {
  state: {
    user: null
  },
  mutations: {
    applyUserForEvent (state, payload) {
      const index = state.user.events.findIndex(event => event.id === payload.id)
      if (index >= 0) {
        state.user.events[index].status = 'applying'
        return
      }
      state.user.events.push(payload)
    },
    unapplyUserFromEvent (state, payload) {
      const events = state.user.events
      events.splice(events.findIndex(event => event.id === payload), 1)
    },
    updateUserStatusFromEvent (state, payload) {
      const events = state.user.events
      events.forEach((element, index) => {
        if (element.id === payload.id) {
          events[index].status = payload.status
        }
      })
      state.user.events = events
    },
    setUser (state, payload) {
      state.user = payload
    }
  },
  actions: {
    applyUserForEvent ({commit, getters}, payload) {
      commit('setLoading', true)
      const user = getters.user

      let eventDoc = db.collection('users/' + user.id + '/events').doc(payload.id)
      let userDoc = db.collection('events/' + payload.id + '/promoters').doc(user.id)

      var batch = db.batch()
      const applyDate = moment().toISOString()
      batch.set(eventDoc, {status: 'applying', applyDate: applyDate, name: payload.name})
      batch.set(userDoc, {status: 'applying', applyDate: applyDate, name: user.name})
      batch.commit()
        .then(() => {
          commit('setLoading', false)
          commit('applyUserForEvent', {id: payload.id, status: 'applying'})
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
      if (!user.events) {
        return false
      } else {
        let eventDoc = db.collection('users/' + user.id + '/events').doc(payload)
        let userDoc = db.collection('events/' + payload + '/promoters').doc(user.id)

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
    updateUserStatusFromEvent ({commit, getters}, payload) {
      commit('setLoading', true)
      const user = getters.user

      let eventDoc = db.collection('users/' + user.id + '/events').doc(payload.id)
      let userDoc = db.collection('events/' + payload.id + '/promoters').doc(user.id)

      var batch = db.batch()
      const updateDate = moment().toISOString()
      batch.update(eventDoc, {status: payload.status, updateDate: updateDate})
      batch.update(userDoc, {status: payload.status, updateDate: updateDate})
      batch.commit()
        .then(() => {
          commit('setLoading', false)
          commit('updateUserStatusFromEvent', {id: payload.id, status: payload.status})
          console.log('User status updated.')
        })
      .catch(error => {
        commit('setLoading', false)
        console.error('Error updating user status: ', error)
      })
    },
    signUserUp ({commit}, payload) {
      commit('setLoading', true)
      commit('clearError')
      firebase.auth().createUserWithEmailAndPassword(payload.email, payload.password)
        .then(
          auth => {
            const newUser = {
              id: auth.user.uid,
              events: [],
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
        events: []
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
              events: []
            }
            return updatedUser
          } else {
            console.log('User not found!')
          }
        })
        .then(updatedUser => {
          if (updatedUser.accountType === 'promoter') {
            db.collection('users/' + updatedUser.id + '/events').get()
              .then((querySnapshot) => {
                let events = []
                querySnapshot.forEach((doc) => {
                  events.push({
                    id: doc.id,
                    name: doc.data().name,
                    status: doc.data().status,
                    applyDate: doc.data().applyDate,
                    updateDate: doc.data().updateDate
                  })
                })
                updatedUser.events = events
                commit('setUser', updatedUser)
                return events
              })
              .then(events => {
                if (events) {
                  const eventsPromoting = events.filter(event => event.status === 'promoting')
                  const tasks = []
                  const promises = []
                  eventsPromoting.forEach((event) => {
                    const promise = db.collection('events/' + event.id + '/tasks').get()
                      .then((querySnapshot) => {
                        querySnapshot.forEach((doc) => {
                          tasks.push({
                            id: doc.id,
                            name: doc.data().name,
                            date: doc.data().date,
                            finalDate: doc.data().finalDate,
                            description: doc.data().description,
                            imageUrl: doc.data().imageUrl,
                            creatorId: doc.data().creatorId,
                            dateCreated: doc.data().dateCreated
                          })
                        })
                      })
                    .catch(function (error) {
                      console.error('Error fetching tasks: ', error)
                      commit('setLoading', false)
                    })
                    promises.push(promise)
                  })
                  Promise.all(promises).then(() => {
                    commit('setLoadedTasks', tasks)
                    commit('setLoading', false)
                  })
                } else {
                  commit('setLoading', false)
                }
              })
            .catch(function (error) {
              console.log('Error getting events:', error)
            })
          } else {
            db.collection('events').where('creatorId', '==', updatedUser.id).get()
              .then((querySnapshot) => {
                const events = []
                querySnapshot.forEach((doc) => {
                  events.push({
                    id: doc.id,
                    name: doc.data().name,
                    state: doc.data().state,
                    city: doc.data().city,
                    date: doc.data().date,
                    description: doc.data().description,
                    gift: doc.data().gift,
                    imageUrl: doc.data().imageUrl,
                    creatorId: doc.data().creatorId,
                    dateCreated: doc.data().dateCreated,
                    recruiting: doc.data().recruiting
                  })
                })
                updatedUser.events = events
                commit('setLoadedEventsFromUser', events)
                commit('setUser', updatedUser)
                commit('setLoading', false)
              })
            .catch(function (error) {
              console.error('Error fetching events from user: ', error)
              commit('setLoading', false)
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
