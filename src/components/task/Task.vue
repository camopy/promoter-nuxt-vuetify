<template>
  <v-container fluid>
    <v-layout row wrap v-if="loading">
      <v-flex xs12 class="text-xs-center">
        <v-progress-circular
          indeterminate
          color="primary"
        ></v-progress-circular>
      </v-flex>
    </v-layout>
    <v-slide-y-transition mode="out-in" v-else>
      <v-layout row wrap v-if="task">
        <v-flex xs12>
          <v-card>
            <v-card-title primary-title>
              <div>
                <h1>{{ task.name }} - {{ task.eventName }}</h1>
              </div>
            </v-card-title>
            <v-card-text>
              <div>{{formatDate(task.date)}}</div>
            </v-card-text>
            <v-card-text>
              <div>{{task.description}}</div>
            </v-card-text>
            <v-card-actions>
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
    loading () {
      return this.$store.getters.loading
    },
    userIsAuthenticated () {
      return this.$store.getters.user !== null && this.$store.getters.user !== undefined
    }
  }
}
</script>
