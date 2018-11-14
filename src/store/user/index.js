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

      return db.collection('promoters').doc(promoter.userId + '_' + promoter.eventId).set(promoter)
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
        return db.collection('promoters').doc(user.id + '_' + payload).delete()
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

      return db.collection('promoters').doc(user.id + '_' + payload.id)
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
              accountType: payload.accountType,
              facebook: '',
              instagram: '',
              imageUrl: '',
              imagePath: ''
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
              imageUrl: doc.data().imageUrl,
              imagePath: doc.data().imagePath,
              events: []
            }
            commit('setUser', updatedUser)
            return updatedUser
          } else {
            return Promise.reject(new Error('Usuário não encontrado'))
          }
        })
        .then(updatedUser => {
          if (updatedUser.accountType === 'promoter') {
            let promises = []
            const eventsPromise = db.collection('promoters').where('userId', '==', updatedUser.id)
              .onSnapshot((querySnapshot) => {
                let events = []
                querySnapshot.forEach((promoter) => {
                  if (promoter.data().status !== 'left' && promoter.data().status !== 'declined') {
                    events.push({
                      id: promoter.data().eventId,
                      name: promoter.data().eventName,
                      imageUrl: promoter.data().eventImageUrl,
                      status: promoter.data().status,
                      applyDate: promoter.data().applyDate,
                      updateDate: promoter.data().updateDate
                    })
                  }
                })
                commit('setLoadedEventsFromUser', events)
                updatedUser.events = events
                commit('setUser', updatedUser)
                return events
              }, function (error) {
                console.log('Error getting events:', error)
                return Promise.reject(error)
              })
            promises.push(eventsPromise)

            const taskReportsPromises = db.collection('taskReports')
              .where('promoterId', '==', updatedUser.id)
              .where('status', '==', 'notstarted')
              .onSnapshot((querySnapshot) => {
                const taskReports = []
                querySnapshot.forEach((doc) => {
                  taskReports.push({
                    ...doc.data(),
                    id: doc.id
                  })
                })
                commit('setLoadedTasks', taskReports)
                updatedUser.tasks = taskReports
                commit('setUser', updatedUser)
                return taskReports
              }, function (error) {
                console.error('Error fetching task reports: ', error)
                return Promise.reject(error)
              })
            promises.push(taskReportsPromises)

            Promise.all(promises).then(response => {
              // updatedUser.events = response[0]
              // updatedUser.tasks = response[1]
              // commit('setUser', updatedUser)
              // commit('setLoadedTasks', response[1])
              // commit('setLoadedEventsFromUser', response[0])
              commit('setLoading', false)
            })
            .catch(error => {
              commit('setLoading', false)
              console.error('Error fetching data: ', error)
            })
          } else {
            let promises = []
            const eventPromise = db.collection('events').where('creatorId', '==', updatedUser.id)
              .onSnapshot((querySnapshot) => {
                const events = []
                querySnapshot.forEach((event) => {
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
                })
                commit('setLoadedEventsFromUser', events)
                updatedUser.events = events
                commit('setUser', updatedUser)
                return events
              }, function (error) {
                console.error('Error fetching events from user: ', error)
                return Promise.reject(error)
              })
            promises.push(eventPromise)

            const taskReportPromise = db.collection('taskReports')
              .where('crewId', '==', updatedUser.id)
              .where('status', '==', 'done')
              .onSnapshot((querySnapshot) => {
                const taskReports = []
                querySnapshot.forEach(task => {
                  taskReports.push({
                    ...task.data(),
                    id: task.id
                  })
                })
                commit('setLoadedTaskReports', taskReports)
                return taskReports
              }, function (error) {
                console.error('Error fetching task reports: ', error)
                return Promise.reject(error)
              })
            promises.push(taskReportPromise)

            Promise.all(promises).then(response => {
              // updatedUser.events = response[0]
              // commit('setLoadedTaskReports', response[1])
              // commit('setLoadedEventsFromUser', response[0])
              // commit('setUser', updatedUser)
              commit('setLoading', false)
            })
            .catch(error => {
              commit('setLoading', false)
              console.error('Error fetching data: ', error)
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
      commit('setUpdating', true)
      const user = getters.user
      return db.collection('users').doc(user.id)
      .update({
        updateDate: moment().toISOString(),
        facebook: payload.facebook,
        instagram: payload.instagram,
        imageUrl: payload.imageUrl,
        imagePath: payload.imagePath
      })
      .then(function () {
        if (!payload.image) {
          commit('setUpdating', false)
          commit('setUser', {
            ...user,
            facebook: payload.facebook,
            instagram: payload.instagram
          })
          console.log('User profile updated')
          return Promise.reject(new Error('No image'))
        } else {
          const filename = payload.image.name
          const ext = filename.slice(filename.lastIndexOf('.'))
          return firebase.storage().ref('users/' + payload.id + '/profileImage' + ext).put(payload.image)
        }
      })
      .then(fileData => {
        let imagePath = fileData.metadata.fullPath
        payload.imagePath = imagePath
        return firebase.storage().ref().child(imagePath).getDownloadURL()
      })
      .then(url => {
        return db.collection('users/').doc(payload.id).update({
          imageUrl: url,
          imagePath: payload.imagePath
        })
        .then(function () {
          console.log('User profile successfully updated with imageUrl!')
          commit('setUpdating', false)
          commit('setUser', {
            ...user,
            facebook: payload.facebook,
            instagram: payload.instagram,
            imageUrl: url,
            imagePath: payload.imagePath
          })
        })
        .catch(function (error) {
          commit('setUpdating', false)
          // The document probably doesn't exist.
          console.error('Error updating user profile: ', error)
          return error
        })
      })
      .catch(function (error) {
        if (error.message !== 'No image') {
          console.error('Error updating user profile: ', error)
        }
        commit('setUpdating', false)
        return error
      })
    }
  },
  getters: {
    user (state) {
      return state.user
    }
  }
}
