import * as firebase from 'firebase'
import { db } from '../../main'
import * as moment from 'moment'

export default {
  state: {
    user: null
  },
  mutations: {
    applyUserForEvent (state, payload) {
      const index = state.user.events.findIndex(event => event.id === payload.eventId)
      if (index >= 0) {
        state.user.events[index].status = 'applying'
        return
      }
      state.user.events.push({id: payload.eventId, name: payload.eventName, status: 'applying', imageUrl: payload.eventImageUrl})
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

      const promoter = {
        userId: user.id,
        userName: user.name,
        eventId: payload.id,
        eventName: payload.name,
        eventImageUrl: payload.imageUrl,
        applyDate: moment().toISOString(),
        status: 'applying'
      }

      db.collection('promoters').doc(promoter.userId + '_' + promoter.eventId).set(promoter)
        .then(function (docRef) {
          commit('setLoading', false)
          commit('applyUserForEvent', promoter)
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
        db.collection('promoters').doc(user.id + '_' + payload).delete()
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

      db.collection('promoters').doc(user.id + '_' + payload.id)
        .update({status: payload.status, updateDate: moment().toISOString()})
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
              facebook: doc.data().facebook,
              instagram: doc.data().instagram,
              events: []
            }
            return updatedUser
          } else {
            return Promise.reject(new Error('Usuário não encontrado'))
          }
        })
        .then(updatedUser => {
          if (updatedUser.accountType === 'promoter') {
            db.collection('promoters').where('userId', '==', updatedUser.id).get()
              .then((querySnapshot) => {
                let events = []
                let tasks = []
                var promises = []
                querySnapshot.forEach((promoter) => {
                  if (promoter.data().status !== 'left' && promoter.data().status !== 'declined') {
                    const taskReport = {}
                    events.push({
                      id: promoter.data().eventId,
                      name: promoter.data().eventName,
                      imageUrl: promoter.data().eventImageUrl,
                      status: promoter.data().status,
                      applyDate: promoter.data().applyDate,
                      updateDate: promoter.data().updateDate
                    })
                    taskReport.eventId = promoter.data().eventId
                    taskReport.eventName = promoter.data().eventName
                    taskReport.promoterId = promoter.data().userId
                    taskReport.promoterName = promoter.data().userName
                    if (promoter.data().status === 'promoting') {
                      const promise = db.collection('users/' + updatedUser.id + '/events/' + promoter.data().eventId + '/taskReports')
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
                              imageUrl: doc.data().imageUrl,
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
                  }
                })
                Promise.all(promises).then(() => {
                  updatedUser.events = events
                  updatedUser.tasks = tasks
                  commit('setUser', updatedUser)
                  commit('setLoadedTasks', tasks)
                  commit('setLoadedEventsFromUser', events)
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
                    // const promoterPromise = db.collection('promoters').where('eventId', '==', event.id).get()
                      .then(querySnapshot => {
                        const taskPromises = []
                        querySnapshot.forEach(promoter => {
                          taskReport.promoterId = promoter.id
                          taskReport.promoterName = promoter.data().name
                          taskReport.promoterFacebook = promoter.data().facebook
                          taskReport.promoterInstagram = promoter.data().instagram
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
    },
    updateUserProfile ({commit, getters}, payload) {
      commit('setLoading', true)
      const user = getters.user
      db.collection('users').doc(user.id)
      .update({
        updateDate: moment().toISOString(),
        facebook: payload.facebook,
        instagram: payload.instagram
      })
      .then(function () {
        commit('setLoading', false)
        commit('setUser', {
          ...user,
          facebook: payload.facebook,
          instagram: payload.instagram
        })
        console.log('User profile updated')
      })
      .catch(function (error) {
        commit('setLoading', false)
        console.error('Error updating user profile: ', error)
      })
    }
  },
  getters: {
    user (state) {
      return state.user
    }
  }
}
