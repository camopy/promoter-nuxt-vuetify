import * as firebase from 'firebase'
import { db } from '../../main'
import * as moment from 'moment'

export default {
  state: {
    loadedTasks: []
  },
  mutations: {
    createTask (state, payload) {
      state.loadedTasks.push(payload)
    }
  },
  actions: {
    loadTasks ({commit}, payload) {
      commit('setLoading', true)
      db.collection('tasks').get()
        .then((querySnapshot) => {
          const tasks = []
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
          commit('setLoadedTasks', tasks)
          commit('setLoading', false)
        })
      .catch(function (error) {
        console.error('Error fetching tasks: ', error)
        commit('setLoading', false)
      })
    },
    createTask ({commit, getters}, payload) {
      const task = {
        name: payload.name,
        date: payload.date,
        finalDate: payload.finalDate,
        description: payload.description,
        creatorId: getters.user.id,
        dateCreated: moment().toISOString()
      }
      let key
      db.collection('events/' + payload.eventId + '/tasks').add(task)
        .then(function (docRef) {
          key = docRef.id
          console.log('Task added with ID: ', key)
          return key
        })
        .then(key => {
          if (!payload.image) {
            commit('createTask', {
              ...task,
              id: key
            })
            return Promise.reject(new Error('No image'))
          } else {
            const filename = payload.image.name
            const ext = filename.slice(filename.lastIndexOf('.'))
            return firebase.storage().ref('events/' + payload.eventId + '/tasks/' + key + '/' + key + '.' + ext).put(payload.image)
          }
        })
        .then(fileData => {
          let imagePath = fileData.metadata.fullPath
          return firebase.storage().ref().child(imagePath).getDownloadURL()
        })
        .then(url => {
          return db.collection('events/' + payload.eventId + '/tasks').doc(key).update({
            imageUrl: url
          })
          .then(function () {
            console.log('Task successfully updated with imageUrl!')
            commit('createTask', {
              ...task,
              id: key,
              imageUrl: url
            })
          })
          .catch(function (error) {
            // The document probably doesn't exist.
            console.error('Error updating event: ', error)
          })
        })
        .catch(function (error) {
          if (error.message !== 'No image') {
            console.error('Error adding event: ', error)
          }
        })
    }
  },
  getters: {
    loadedTasks (state) {
      return state.loadedTasks
    },
    loadedTask (state) {
      return (taskId) => {
        return state.loadedTasks.find((task) => {
          return task.id === taskId
        })
      }
    }
  }
}
