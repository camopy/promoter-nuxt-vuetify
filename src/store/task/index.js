import * as firebase from 'firebase'
import { db } from '../../main'
import * as moment from 'moment'

export default {
  state: {
    loadedTasks: [],
    loadedTasksFromEvent: []
  },
  mutations: {
    createTask (state, payload) {
      state.loadedTasks.push(payload)
    },
    setLoadedTasks (state, payload) {
      state.loadedTasks = payload
    },
    setLoadedTasksFromEvent (state, payload) {
      state.loadedTasksFromEvent = payload
    }
  },
  actions: {
    createTask ({commit, getters}, payload) {
      const task = {
        name: payload.name,
        date: payload.date,
        finalDate: payload.finalDate,
        description: payload.description,
        creatorId: getters.user.id,
        dateCreated: moment().toISOString(),
        status: 'waiting'
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
            console.error('Error updating task: ', error)
          })
        })
        .catch(function (error) {
          if (error.message !== 'No image') {
            console.error('Error adding task: ', error)
          }
        })
    },
    loadTasksFromEvent ({commit}, payload) {
      commit('setLoading', true)
      db.collection('events').doc(payload.id).collection('tasks').get()
        .then((querySnapshot) => {
          const tasks = []
          querySnapshot.forEach((doc) => {
            tasks.push({
              id: doc.id,
              name: doc.data().name,
              description: doc.data().description,
              date: doc.data().date,
              finalDate: doc.data().finalDate,
              status: doc.data().status
            })
          })
          commit('setLoadedTasksFromEvent', tasks)
          commit('setLoading', false)
        })
      .catch(function (error) {
        console.error('Error fetching tasks from event: ', error)
        commit('setLoading', false)
      })
    },
    releaseTask ({commit}, payload) {
      commit('setLoading', true)
      db.collection('events').doc(payload.eventId).collection('promoters').where('status', '==', 'promoting').get()
        .then((querySnapshot) => {
          const batch = db.batch()
          querySnapshot.forEach((promoter) => {
            console.log(payload)
            let taskDoc = db.collection('users/' + promoter.id + '/events/' + payload.eventId + '/tasks').doc(payload.task.id)
            batch.set(taskDoc, {
              ...payload.task,
              status: 'unfinished'})
          })
          batch.commit()
            .then(() => {
              commit('setLoading', false)
              console.log('Task released.')
            })
          .catch(error => {
            commit('setLoading', false)
            console.error('Error releasing task: ', error)
          })
        })
      .catch(function (error) {
        console.error('Error fetching events from user: ', error)
        commit('setLoading', false)
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
    },
    loadedTasksFromEvent (state) {
      return state.loadedTasksFromEvent
    }
  }
}
