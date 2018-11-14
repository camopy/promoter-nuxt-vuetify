<template>
  <v-container fluid>
    <v-slide-y-transition mode="out-in">
      <v-layout row wrap v-if="task">
        <v-flex xs12>
          <v-card>
            <v-card-title primary-title>
              <div>
                <h1>{{ task.name }} - {{ task.eventName }}</h1>
              </div>
              <v-spacer></v-spacer>
              <app-task-edit-dialog v-if="userIsCreator" :task="task"></app-task-edit-dialog>
              <app-task-delete-dialog v-if="userIsCreator" :task="task"></app-task-delete-dialog>
            </v-card-title>
            <v-card-text>
              <div>{{formatDate(task.date)}}</div>
            </v-card-text>
            <v-card-text>
              <div>{{task.description}}</div>
            </v-card-text>
            <v-card-media
              :src="task.imageUrl"
              height="400px"
              contain
            ></v-card-media>
            <v-card-actions v-if="userIsAuthenticated && userIsPromoter">
              <v-spacer></v-spacer>
              <app-task-report-dialog :report="task" :label="'CONCLUIDA'"></app-task-report-dialog>
            </v-card-actions>
          </v-card>
        </v-flex>
      </v-layout>
    </v-slide-y-transition>
  </v-container>
</template>

<script>
import Date from '@/mixins/Date'
export default {
  mixins: [Date],
  props: ['id'],
  computed: {
    task () {
      return this.$store.getters.loadedTask(this.id)
    },
    userIsAuthenticated () {
      return this.$store.getters.user !== null && this.$store.getters.user !== undefined
    },
    userIsPromoter () {
      return this.$store.getters.user.accountType === 'promoter'
    },
    userIsCreator () {
      if (!this.userIsAuthenticated) {
        return false
      }
      return this.$store.getters.user.id === this.task.crewId
    }
  }
}
</script>
