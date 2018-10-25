import * as firebase from 'firebase'
import { db } from '../../main'
import * as moment from 'moment'

export default {
  state: {
    loadedEvents: [],
    loadedEventsFromUser: []
  },
  mutations: {
    setLoadedEvents (state, payload) {
      state.loadedEvents = payload
    },
    setLoadedEventsFromUser (state, payload) {
      state.loadedEventsFromUser = payload
    },
    createEvent (state, payload) {
      state.loadedEvents.push(payload)
      state.loadedEventsFromUser.push(payload)
    },
    updateEvent (state, payload) {
      const loadedEventsFromUser = state.loadedEventsFromUser
      loadedEventsFromUser.forEach((element, index) => {
        if (element.id === payload.id) {
          loadedEventsFromUser[index].state = payload.state
          loadedEventsFromUser[index].city = payload.city
          loadedEventsFromUser[index].date = payload.date
          loadedEventsFromUser[index].description = payload.description
          loadedEventsFromUser[index].imageUrl = payload.imageUrl
          loadedEventsFromUser[index].dateUpdated = payload.dateUpdated
        }
      })
      state.loadedEventsFromUser = loadedEventsFromUser

      const loadedEvents = state.loadedEvents
      loadedEvents.forEach((element, index) => {
        if (element.id === payload.id) {
          loadedEvents[index].state = payload.state
          loadedEvents[index].city = payload.city
          loadedEvents[index].date = payload.date
          loadedEvents[index].description = payload.description
          loadedEvents[index].imageUrl = payload.imageUrl
          loadedEvents[index].dateUpdated = payload.dateUpdated
        }
      })
      state.loadedEvents = loadedEvents
    },
    deleteEvent (state, payload) {
      const loadedEvents = state.loadedEvents
      loadedEvents.splice(loadedEvents.findIndex(event => event.id === payload.id), 1)

      const loadedEventsFromUser = state.loadedEventsFromUser
      loadedEventsFromUser.splice(loadedEventsFromUser.findIndex(event => event.id === payload.id), 1)
    },
    toogleRecruitingFromEvent (state, payload) {
      const recruiting = !payload.recruiting

      const loadedEventsFromUser = state.loadedEventsFromUser
      loadedEventsFromUser.forEach((element, index) => {
        if (element.id === payload.id) {
          loadedEventsFromUser[index].recruiting = recruiting
        }
      })
      state.loadedEventsFromUser = loadedEventsFromUser

      const loadedEvents = state.loadedEvents
      loadedEvents.forEach((element, index) => {
        if (element.id === payload.id) {
          loadedEvents[index].recruiting = recruiting
        }
      })
      state.loadedEvents = loadedEvents
    },
    updateEventStatus (state, payload) {
      const loadedEventsFromUser = state.loadedEventsFromUser
      loadedEventsFromUser.forEach((element, index) => {
        if (element.id === payload.id) {
          loadedEventsFromUser[index].status = payload.status
        }
      })
      state.loadedEventsFromUser = loadedEventsFromUser

      const loadedEvents = state.loadedEvents
      loadedEvents.forEach((element, index) => {
        if (element.id === payload.id) {
          loadedEvents[index].status = payload.status
        }
      })
      state.loadedEvents = loadedEvents
    }
  },
  actions: {
    loadEvents ({commit}, payload) {
      commit('setLoading', true)
      db.collection('events').get()
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
              recruiting: doc.data().recruiting,
              status: doc.data().status
            })
          })
          commit('setLoadedEvents', events)
          commit('setLoading', false)
        })
      .catch(function (error) {
        console.error('Error fetching events: ', error)
        commit('setLoading', false)
      })
    },
    createEvent ({commit, getters}, payload) {
      const event = {
        name: payload.name,
        state: payload.state,
        city: payload.city,
        date: payload.date,
        description: payload.description,
        gift: payload.gift,
        creatorId: getters.user.id,
        dateCreated: moment().toISOString(),
        imageUrl: '',
        imagePath: '',
        recruiting: false
      }
      let key
      commit('setLoading', true)
      return db.collection('events').add(event)
        .then(function (docRef) {
          key = docRef.id
          console.log('Event added with ID: ', key)
          return key
        })
        .then(key => {
          if (!payload.image) {
            commit('createEvent', {
              ...event,
              id: key
            })
            return Promise.reject(new Error('Event created'))
          }
          const filename = payload.image.name
          const ext = filename.slice(filename.lastIndexOf('.'))
          return firebase.storage().ref('events/' + key + '/' + key + '.' + ext).put(payload.image)
        })
        .then(fileData => {
          let imagePath = fileData.metadata.fullPath
          payload.imagePath = imagePath
          return firebase.storage().ref().child(imagePath).getDownloadURL()
        })
        .then(url => {
          return db.collection('events').doc(key).update({
            imageUrl: url,
            imagePath: payload.imagePath
          })
          .then(function () {
            console.log('Event successfully updated with imageUrl!')
            commit('setLoading', false)
            commit('createEvent', {
              ...event,
              id: key,
              imageUrl: url,
              imagePath: payload.imagePath
            })
          })
          .catch(function (error) {
            // The document probably doesn't exist.
            console.error('Error updating event: ', error)
            commit('setLoading', false)
            return error
          })
        })
        .catch(function (response) {
          if (response.message !== 'Event created') {
            console.error('Error adding event: ', response)
          }
          commit('setLoading', false)
          return response
        })
    },
    updateEvent ({commit, getters}, payload) {
      const updatedEvent = {
        state: payload.state,
        city: payload.city,
        date: payload.date,
        description: payload.description,
        imageUrl: payload.imageUrl,
        dateUpdated: moment().toISOString()
      }
      commit('setLoading', true)
      return db.collection('events').doc(payload.id).update(updatedEvent)
        .then(() => {
          if (!payload.image) {
            commit('updateEvent', {
              ...updatedEvent,
              id: payload.id
            })
            console.log('Event updated')
            return Promise.reject(new Error('Event updated'))
          }
          const filename = payload.image.name
          const ext = filename.slice(filename.lastIndexOf('.'))
          return firebase.storage().ref('events/' + payload.id + '/' + payload.id + '.' + ext).put(payload.image)
        })
        .then(fileData => {
          let imagePath = fileData.metadata.fullPath
          return firebase.storage().ref().child(imagePath).getDownloadURL()
        })
        .then(url => {
          return db.collection('events').doc(payload.id).update({
            imageUrl: url
          })
          .then(function () {
            console.log('Event successfully updated with imageUrl!')
            commit('setLoading', false)
            commit('updateEvent', {
              ...updatedEvent,
              id: payload.id,
              imageUrl: url
            })
          })
          .catch(function (error) {
            // The document probably doesn't exist.
            console.error('Error updating event: ', error)
            commit('setLoading', false)
            return error
          })
        })
        .catch(function (response) {
          if (response.message !== 'Event updated') {
            console.error('Error updating event: ', response)
          }
          commit('setLoading', false)
          return response
        })
    },
    deleteEvent ({commit, getters}, payload) {
      const event = {
        state: payload.state,
        city: payload.city,
        date: payload.date,
        description: payload.description,
        imageUrl: payload.imageUrl,
        imagePath: payload.imagePath,
        dateUpdated: moment().toISOString(),
        status: payload.status
      }

      if (event.status !== 'waiting') {
        return
      }

      commit('setLoading', true)
      const batch = db.batch()
      const promises = []

      const promoterPromise = db.collection('promoters').where('eventId', '==', payload.id).get()
      .then((querySnapshot) => {
        querySnapshot.forEach((promoter) => {
          batch.delete(promoter.ref)
        })
        console.log('Batch delete promoter')
      })
      .catch(function (error) {
        console.error('Error fetching promoters from event: ', error)
        return Promise.reject(error)
      })
      promises.push(promoterPromise)

      const taskPromise = db.collection('events/' + payload.id + '/tasks').get()
      .then((querySnapshot) => {
        querySnapshot.forEach((task) => {
          batch.delete(task.ref)
        })
        console.log('Batch delete task')

        let eventRef = db.collection('events').doc(payload.id)
        batch.delete(eventRef)
        console.log('Batch delete event')
      })
      .catch(function (error) {
        console.error('Error fetching tasks from event: ', error)
        return Promise.reject(error)
      })
      promises.push(taskPromise)

      Promise.all(promises).then(response => {
        batch.commit()
          .then(() => {
            if (!payload.imagePath) {
              commit('setLoading', false)
              commit('deleteEvent', {
                ...event,
                id: payload.id
              })
              console.log('Event deleted.')
            } else {
              firebase.storage().ref(payload.imagePath).delete()
              .then(function () {
                console.log('Event deleted.')
                console.log('Event image successfully deleted!')
                commit('setLoading', false)
                commit('deleteEvent', {
                  ...event,
                  id: payload.id
                })
              })
              .catch(function (error) {
                commit('setLoading', false)
                // The document probably doesn't exist.
                console.error('Error deleting event image: ', error)
                return error
              })
            }
          })
        .catch(error => {
          commit('setLoading', false)
          console.error('Error deleting event: ', error)
        })
      })
      .catch(error => {
        commit('setLoading', false)
        console.error('Error fetching data: ', error)
      })
    },
    toogleRecruitingFromEvent ({commit}, payload) {
      commit('setLoading', true)
      db.collection('events').doc(payload.id).update({recruiting: !payload.recruiting})
        .then(() => {
          commit('toogleRecruitingFromEvent', payload)
          commit('setLoading', false)
        })
      .catch(function (error) {
        console.error('Error updating recruiting status from event : ', error)
        commit('setLoading', false)
      })
    },
    updateEventStatus ({commit, getters}, payload) {
      commit('setLoading', true)
      const event = getters.loadedEvent(payload.id)
      if (event.status !== payload.status) {
        db.collection('events').doc(payload.id).update({status: payload.status})
          .then(() => {
            console.log('Event status updated!')
            commit('updateEventStatus', payload)
            commit('setLoading', false)
          })
        .catch(function (error) {
          console.error('Error updating event status : ', error)
          commit('setLoading', false)
        })
      }
    }
  },
  getters: {
    loadedEvents (state) {
      return state.loadedEvents
    },
    loadedEventsFromUser (state) {
      return state.loadedEventsFromUser
    },
    loadedEvent (state) {
      return (eventId) => {
        return state.loadedEvents.find((event) => {
          return event.id === eventId
        })
      }
    },
    loadedEventFromUser (state) {
      return (eventId) => {
        return state.loadedEventsFromUser.find((event) => {
          return event.id === eventId
        })
      }
    }
  }
}
