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
              recruiting: doc.data().recruiting
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
          return firebase.storage().ref().child(imagePath).getDownloadURL()
        })
        .then(url => {
          return db.collection('events').doc(key).update({
            imageUrl: url
          })
          .then(function () {
            console.log('Event successfully updated with imageUrl!')
            commit('setLoading', false)
            commit('createEvent', {
              ...event,
              id: key,
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
          if (response.message !== 'Event created') {
            console.error('Error adding event: ', response)
          }
          commit('setLoading', false)
          return response
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
