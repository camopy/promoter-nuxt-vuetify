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
    fetchUserData ({commit}, payload) {
      commit('setLoading', true)
      db.collection('users').doc(payload.uid).get()
        .then(function (doc) {
          if (doc.exists) {
            const updatedUser = {
              id: payload.uid,
              name: doc.data().name,
              email: doc.data().email,
              accountType: doc.data().accountType,
              dateCreated: doc.data().dateCreated,
              events: []
            }
            return updatedUser
          } else {
            return Promise.reject(new Error('Usuário não encontrado'))
          }
        })
        .then(updatedUser => {
          if (updatedUser.accountType === 'promoter') {
            db.collection('users/' + updatedUser.id + '/events').get()
              .then((querySnapshot) => {
                let events = []
                let tasks = []
                var promises = []
                querySnapshot.forEach((event) => {
                  const taskReport = {}
                  events.push({
                    id: event.id,
                    name: event.data().name,
                    status: event.data().status,
                    applyDate: event.data().applyDate,
                    updateDate: event.data().updateDate
                  })
                  taskReport.eventId = event.id
                  taskReport.eventName = event.data().name
                  taskReport.promoterId = updatedUser.id
                  taskReport.promoterName = updatedUser.name
                  if (event.data().status === 'promoting') {
                    const promise = db.collection('users/' + updatedUser.id + '/events/' + event.id + '/taskReports')
                      .where('status', '==', 'notstarted').get()
                      .then(querySnapshot => {
                        querySnapshot.forEach((doc) => {
                          tasks.push({
                            ...taskReport,
                            id: doc.id,
                            name: doc.data().name,
                            status: doc.data().status,
                            description: doc.data().description,
                            date: doc.data().date,
                            finalDate: doc.data().finalDate,
                            eventId: doc.ref.parent.parent.id
                          })
                        })
                      })
                      .catch(function (error) {
                        // console.error('Error fetching tasks: ', error)
                        return Promise.reject(error)
                      })
                    promises.push(promise)
                  }
                })
                Promise.all(promises).then(() => {
                  updatedUser.events = events
                  updatedUser.tasks = tasks
                  commit('setUser', updatedUser)
                  commit('setLoadedTasks', tasks)
                  commit('setLoading', false)
                })
                .catch(error => {
                  commit('setLoading', false)
                  console.error('Error fetching tasks: ', error)
                })
              })
            .catch(function (error) {
              console.log('Error getting events:', error)
              commit('setLoading', false)
            })
          } else {
            db.collection('events').where('creatorId', '==', updatedUser.id).get()
              .then((querySnapshot) => {
                const events = []
                const promoterPromises = []
                const tasks = []
                querySnapshot.forEach((event) => {
                  const taskReport = {}
                  events.push({
                    id: event.id,
                    name: event.data().name,
                    state: event.data().state,
                    city: event.data().city,
                    date: event.data().date,
                    description: event.data().description,
                    gift: event.data().gift,
                    imageUrl: event.data().imageUrl,
                    creatorId: event.data().creatorId,
                    dateCreated: event.data().dateCreated,
                    recruiting: event.data().recruiting,
                    status: event.data().status
                  })
                  if (event.data().status === 'promoting') {
                    taskReport.eventId = event.id
                    taskReport.eventName = event.data().name
                    const promoterPromise = event.ref.collection('promoters').where('status', '==', 'promoting').get()
                      .then(querySnapshot => {
                        const taskPromises = []
                        querySnapshot.forEach(promoter => {
                          taskReport.promoterId = promoter.id
                          taskReport.promoterName = promoter.data().name
                          const taskPromise = db.collection('users/' + promoter.id + '/events/' + promoter.ref.parent.parent.id + '/taskReports')
                            .where('status', '==', 'done').get()
                            .then(querySnapshot => {
                              querySnapshot.forEach(task => {
                                tasks.push({
                                  ...taskReport,
                                  id: task.id,
                                  name: task.data().name,
                                  description: task.data().description,
                                  date: task.data().date,
                                  finalDate: task.data().finalDate,
                                  status: task.data().status
                                })
                              })
                            })
                          taskPromises.push(taskPromise)
                        })
                        return Promise.all(taskPromises)
                      })
                      .catch(function (error) {
                        console.error('Error fetching promoters from events: ', error)
                        commit('setLoading', false)
                      })
                    promoterPromises.push(promoterPromise)
                  }
                })
                Promise.all(promoterPromises).then(() => {
                  updatedUser.events = events
                  commit('setLoadedTaskReports', tasks)
                  commit('setLoadedEventsFromUser', events)
                  commit('setUser', updatedUser)
                  commit('setLoading', false)
                })
              })
            .catch(function (error) {
              console.error('Error fetching events from user: ', error)
              commit('setLoading', false)
            })
          }
        })
      .catch(function (error) {
        console.log('Error getting user:', error)
        commit('setLoading', false)
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
