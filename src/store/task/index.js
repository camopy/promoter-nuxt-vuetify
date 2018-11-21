import * as firebase from 'firebase'
import { db } from '../../main'
import * as moment from 'moment'

export default {
  state: {
    loadedTasks: [],
    loadedTasksFromEvent: [],
    loadedTaskReports: [],
    loadedTaskReportsFromEvent: []
  },
  mutations: {
    createTask (state, payload) {
      state.loadedTasks.push(payload)
    },
    updateTask (state, payload) {
      const loadedTasksFromEvent = state.loadedTasksFromEvent
      loadedTasksFromEvent.forEach((element, index) => {
        if (element.id === payload.id) {
          loadedTasksFromEvent[index].name = payload.name
          loadedTasksFromEvent[index].eventName = payload.eventName
          loadedTasksFromEvent[index].date = payload.date
          loadedTasksFromEvent[index].finalDate = payload.finalDate
          loadedTasksFromEvent[index].description = payload.description
          loadedTasksFromEvent[index].imageUrl = payload.imageUrl
          loadedTasksFromEvent[index].dateUpdated = payload.dateUpdated
        }
      })
      state.loadedTasksFromEvent = loadedTasksFromEvent

      const loadedTasks = state.loadedTasks
      loadedTasks.forEach((element, index) => {
        if (element.id === payload.id) {
          loadedTasks[index].name = payload.name
          loadedTasks[index].eventName = payload.eventName
          loadedTasks[index].date = payload.date
          loadedTasks[index].finalDate = payload.finalDate
          loadedTasks[index].description = payload.description
          loadedTasks[index].imageUrl = payload.imageUrl
          loadedTasks[index].dateUpdated = payload.dateUpdated
        }
      })
      state.loadedTasks = loadedTasks
    },
    deleteTask (state, payload) {
      const loadedTasksFromEvent = state.loadedTasksFromEvent
      loadedTasksFromEvent.splice(loadedTasksFromEvent.findIndex(task => task.id === payload.id), 1)
    },
    setLoadedTasks (state, payload) {
      state.loadedTasks = payload
    },
    setLoadedTasksFromEvent (state, payload) {
      state.loadedTasksFromEvent = payload
    },
    setLoadedTaskReports (state, payload) {
      state.loadedTaskReports = payload
    },
    setLoadedTaskReportsFromEvent (state, payload) {
      state.loadedTaskReportsFromEvent = payload
    },
    updateTaskReport (state, payload) {
      const loadedTasks = state.loadedTasks
      loadedTasks.splice(loadedTasks.findIndex(report => report.id === payload.id), 1)

      const loadedTaskReports = state.loadedTaskReports
      loadedTaskReports.splice(loadedTaskReports.findIndex(report => report.id === payload.id), 1)
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
        imageUrl: '',
        imagePath: '',
        status: 'waiting',
        taskReportsTotal: 0,
        taskReportsDone: 0,
        taskReportsNotdone: 0,
        taskReportsIncomplete: 0,
        taskReportsComplete: 0
      }
      let key
      commit('setCreating', true)
      return db.collection('events/' + payload.eventId + '/tasks').add(task)
        .then(function (docRef) {
          key = docRef.id
          console.log('Task added with ID: ', key)
          return key
        })
        .then(key => {
          if (!payload.image) {
            commit('createTask', {
              ...task,
              eventId: payload.eventId,
              eventName: payload.eventName,
              id: key
            })
            return Promise.reject(new Error('No image'))
          } else {
            const filename = payload.image.name
            const ext = filename.slice(filename.lastIndexOf('.'))
            return firebase.storage().ref('events/' + payload.eventId + '/tasks/' + key + '/' + key + ext).put(payload.image)
          }
        })
        .then(fileData => {
          let imagePath = fileData.metadata.fullPath
          payload.imagePath = imagePath
          return firebase.storage().ref().child(imagePath).getDownloadURL()
        })
        .then(url => {
          return db.collection('events/' + payload.eventId + '/tasks').doc(key).update({
            imageUrl: url,
            imagePath: payload.imagePath
          })
          .then(function () {
            console.log('Task successfully updated with imageUrl!')
            commit('setCreating', false)
            commit('createTask', {
              ...task,
              id: key,
              eventId: payload.eventId,
              eventName: payload.eventName,
              imageUrl: url,
              imagePath: payload.imagePath
            })
          })
          .catch(function (error) {
            commit('setCreating', false)
            // The document probably doesn't exist.
            console.error('Error updating task: ', error)
            return error
          })
        })
        .catch(function (error) {
          if (error.message !== 'No image') {
            console.error('Error adding task: ', error)
          }
          commit('setCreating', false)
          return error
        })
    },
    updateTask ({commit, getters}, payload) {
      const updatedTask = {
        name: payload.name,
        date: payload.date,
        finalDate: payload.finalDate,
        description: payload.description,
        dateUpdated: moment().toISOString(),
        imageUrl: payload.imageUrl,
        imagePath: payload.imagePath
      }
      commit('setUpdating', true)
      return db.collection('events/' + payload.eventId + '/tasks').doc(payload.id).update(updatedTask)
        .then(function (docRef) {
          if (!payload.image) {
            commit('updateTask', {
              ...updatedTask,
              eventName: payload.eventName,
              id: payload.id
            })
            console.log('Task updated!')
            return Promise.reject(new Error('No image'))
          } else {
            const filename = payload.image.name
            const ext = filename.slice(filename.lastIndexOf('.'))
            return firebase.storage().ref('events/' + payload.eventId + '/tasks/' + payload.id + '/' + payload.id + ext).put(payload.image)
          }
        })
        .then(fileData => {
          let imagePath = fileData.metadata.fullPath
          payload.imagePath = imagePath
          return firebase.storage().ref().child(imagePath).getDownloadURL()
        })
        .then(url => {
          return db.collection('events/' + payload.eventId + '/tasks').doc(payload.id).update({
            imageUrl: url,
            imagePath: payload.imagePath
          })
          .then(function () {
            console.log('Task successfully updated with imageUrl!')
            commit('setUpdating', false)
            commit('updateTask', {
              ...updatedTask,
              id: payload.id,
              eventName: payload.eventName,
              imageUrl: url,
              imagePath: payload.imagePath
            })
          })
          .catch(function (error) {
            commit('setUpdating', false)
            // The document probably doesn't exist.
            console.error('Error updating task: ', error)
            return error
          })
        })
        .catch(function (error) {
          if (error.message !== 'No image') {
            console.error('Error updating task: ', error)
          }
          commit('setUpdating', false)
          return error
        })
    },
    deleteTask ({commit, getters}, payload) {
      const task = {
        name: payload.name,
        date: payload.date,
        finalDate: payload.finalDate,
        description: payload.description,
        dateUpdated: moment().toISOString(),
        imageUrl: payload.imageUrl,
        imagePath: payload.imagePath
      }
      commit('setDeleting', true)
      return db.collection('events/' + payload.eventId + '/tasks').doc(payload.id).delete()
        .then(function (docRef) {
          if (!payload.imagePath) {
            commit('setDeleting', false)
            commit('deleteTask', {
              ...task,
              id: payload.id
            })
            console.log('Task successfully deleted!')
          } else {
            return firebase.storage().ref(payload.imagePath).delete()
            .then(function () {
              console.log('Task successfully deleted!')
              console.log('Task image successfully deleted!')
              commit('setDeleting', false)
              commit('deleteTask', {
                ...task,
                id: payload.id
              })
            })
            .catch(function (error) {
              commit('setDeleting', false)
              // The document probably doesn't exist.
              console.error('Error deleting task image: ', error)
              return error
            })
          }
        })
        .catch(function (error) {
          console.error('Error deleting task: ', error)
          commit('setDeleting', false)
          return error
        })
    },
    loadTasksFromEvent ({commit}, payload) {
      commit('setLoading', true)
      return db.collection('events').doc(payload.id).collection('tasks')
        .onSnapshot((querySnapshot) => {
          const tasks = []
          querySnapshot.forEach((doc) => {
            tasks.push({
              id: doc.id,
              name: doc.data().name,
              description: doc.data().description,
              date: doc.data().date,
              finalDate: doc.data().finalDate,
              status: doc.data().status,
              imageUrl: doc.data().imageUrl,
              imagePath: doc.data().imagePath,
              eventName: payload.name,
              eventId: payload.id,
              taskReportsTotal: doc.data().taskReportsTotal,
              taskReportsDone: doc.data().taskReportsDone,
              taskReportsNotdone: doc.data().taskReportsNotdone,
              taskReportsIncomplete: doc.data().taskReportsIncomplete,
              taskReportsComplete: doc.data().taskReportsComplete
            })
          })
          commit('setLoadedTasksFromEvent', tasks)
          commit('setLoadedTasks', tasks)
          commit('setLoading', false)
        }, function (error) {
          console.error('Error fetching tasks from event: ', error)
          commit('setLoading', false)
        })
    },
    releaseTask ({commit, getters, dispatch}, payload) {
      commit('setLoading', true)
      const user = getters.user
      db.collection('promoters').where('eventId', '==', payload.eventId)
        .where('status', '==', 'promoting').get()
        .then((querySnapshot) => {
          const batch = db.batch()
          const promises = []
          querySnapshot.forEach((promoter) => {
            let taskReportDoc = db.collection('taskReports').doc(promoter.id + '_' + payload.task.id)
            const taskReportPromise = taskReportDoc.get().then(function (taskReport) {
              if (!taskReport.exists) {
                delete payload.task.taskReportsTotal
                delete payload.task.taskReportsDone
                delete payload.task.taskReportsComplete
                delete payload.task.taskReportsIncomplete
                delete payload.task.taskReportsNotdone
                batch.set(taskReportDoc, {
                  ...payload.task,
                  taskId: payload.task.id,
                  promoterId: promoter.data().userId,
                  promoterName: promoter.data().userName,
                  eventId: payload.eventId,
                  crewId: user.id,
                  status: 'notstarted'
                })
              }
            })
            .catch(function (error) {
              console.log('Error getting taskReport:', error)
              return Promise.reject(error)
            })
            promises.push(taskReportPromise)
          })

          Promise.all(promises).then(response => {
            batch.commit()
            .then(() => {
              db.collection('events/' + payload.eventId + '/tasks/').doc(payload.task.id)
              .update({status: 'released'})
              .then(() => {
                dispatch('updateEventStatus', {id: payload.eventId, status: 'promoting'})
                commit('setLoading', false)
                console.log('Task released.')
              })
              .catch(function (error) {
                console.log('Error updating task status:', error)
                commit('setLoading', false)
              })
            })
            .catch(error => {
              commit('setLoading', false)
              console.error('Error releasing task: ', error)
            })
          })
          .catch(error => {
            commit('setLoading', false)
            console.error('Error fetching data: ', error)
          })
        })
        .catch(function (error) {
          console.error('Error fetching events from user: ', error)
          commit('setLoading', false)
        })
    },
    updateTaskReport ({commit}, payload) {
      commit('setLoading', true)
      return db.collection('taskReports').doc(payload.id)
        .update({
          status: payload.status
        })
        .then(() => {
          commit('setLoading', false)
          console.log('Task report updated as: ' + payload.status)
          commit('updateTaskReport', payload)
        })
        .catch(error => {
          commit('setLoading', false)
          console.log('Error updating task report:' + error)
        })
    },
    loadTaskReportsFromEvent ({commit, getters}, payload) {
      commit('setLoading', true)
      const user = getters.user
      db.collection('taskReports').where('promoterId', '==', user.id)
        .where('eventId', '==', payload.id)
        .onSnapshot((querySnapshot) => {
          const taskReports = []
          querySnapshot.forEach((report) => {
            taskReports.push({
              id: report.id,
              ...report.data()
            })
          })
          commit('setLoadedTaskReportsFromEvent', taskReports)
          commit('setLoadedTaskReports', taskReports)
          commit('setLoading', false)
        }, function (error) {
          console.error('Error fetching task reports from event: ', error)
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
    },
    loadedTaskReports (state) {
      return state.loadedTaskReports
    },
    loadedTaskReport (state) {
      return (reportId) => {
        return state.loadedTaskReports.find((report) => {
          return report.id === reportId
        })
      }
    },
    loadedTaskReportsFromEvent (state) {
      return state.loadedTaskReportsFromEvent
    }
  }
}
