const functions = require('firebase-functions');

const admin = require('firebase-admin');
admin.initializeApp();

const settings = {timestampsInSnapshots: true}
admin.firestore().settings(settings)

exports.onTaskReportCreated = functions.firestore
  .document('taskReports/{id}')
  .onCreate((snap, context) => {
    const data = snap.data();
    const eventId = data.eventId;
    const taskId = data.taskId;

    return admin.firestore().doc('events/' + eventId + '/tasks/' + taskId).get()
      .then(task => {
        if (task.exists) {
          taskReportsTotal = task.data().taskReportsTotal;
          return admin.firestore().doc('events/' + eventId + '/tasks/' + taskId).update({
            taskReportsTotal: taskReportsTotal + 1
          })
        }
        return false
      })
      .catch((error) => {
        console.error('Error updating task: ', error);
        return error;
      });
});

exports.onTaskReportUpdated = functions.firestore
  .document('taskReports/{id}')
  .onUpdate((change, context) => {
    const data = change.after.data()
    const eventId = data.eventId;
    const promoterId = data.promoterId;
    const taskId = data.taskId;
    const newStatus = data.status;

    const promises = []
    const batch = admin.firestore().batch();

    let taskDoc = admin.firestore().doc('events/' + eventId + '/tasks/' + taskId);
    let taskPromise = taskDoc.get()
      .then(task => {
        if (task.exists) {
          taskReportsDone = task.data().taskReportsDone;
          switch (newStatus) {
            case 'done':
              return batch.update(taskDoc, {
                taskReportsDone: taskReportsDone + 1
              });
            case 'notdone':
              taskReportsNotdone = task.data().taskReportsNotdone;
              return batch.update(taskDoc, {
                taskReportsDone: taskReportsDone - 1,
                taskReportsNotdone: taskReportsNotdone + 1
              });
            case 'incomplete':
              taskReportsIncomplete = task.data().taskReportsIncomplete;
              return batch.update(taskDoc, {
                taskReportsDone: taskReportsDone - 1,
                taskReportsIncomplete: taskReportsIncomplete + 1
              });
            case 'complete':
              taskReportsComplete = task.data().taskReportsComplete;
              return batch.update(taskDoc, {
                taskReportsDone: taskReportsDone - 1,
                taskReportsComplete: taskReportsComplete + 1
              });
          }
        }
        return false
      })
      .catch((error) => {
        console.error('Error updating task: ', error);
        return Promise.reject(error);
      });
      promises.push(taskPromise);

    let promoterDoc = admin.firestore().doc('promoters/' + promoterId + '_' + eventId);
    let promoterPromise = promoterDoc.get()
      .then(promoter => {
        if (promoter.exists) {
          taskReportsDone = promoter.data().taskReportsDone;
          switch (newStatus) {
            case 'done':
              return batch.update(promoterDoc, {
                taskReportsDone: taskReportsDone + 1
              })
            case 'notdone':
              taskReportsNotdone = promoter.data().taskReportsNotdone;
              return batch.update(promoterDoc, {
                taskReportsDone: taskReportsDone - 1,
                taskReportsNotdone: taskReportsNotdone + 1
              });
            case 'incomplete':
              taskReportsIncomplete = promoter.data().taskReportsIncomplete;
              return batch.update(promoterDoc, {
                taskReportsDone: taskReportsDone - 1,
                taskReportsIncomplete: taskReportsIncomplete + 1
              });
            case 'complete':
              taskReportsComplete = promoter.data().taskReportsComplete;
              return batch.update(promoterDoc, {
                taskReportsDone: taskReportsDone - 1,
                taskReportsComplete: taskReportsComplete + 1
              });
          }
        }
        return false
      })
      .catch((error) => {
        console.error('Error updating promoters: ', error);
        return Promise.reject(error);
      });
      promises.push(promoterPromise);

      return Promise.all(promises).then(response => {
        return batch.commit();
      })
      .catch(error => {
        console.error('Error onTaskReportUpdated cloud function: ', error)
        return error;
      });
});
