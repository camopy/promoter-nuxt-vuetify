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
      <v-layout row wrap v-if="report">
        <v-flex xs12>
          <v-card>
            <v-card-title primary-title>
              <div>
                <h1>{{ report.name }} - {{ report.eventName }} - {{ report.promoterName }}</h1>
              </div>
            </v-card-title>
            <v-card-text>
              <div>{{formatDate(report.date)}}</div>
            </v-card-text>
            <v-card-text>
              <div>{{report.description}}</div>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <app-task-report-dialog :report="report" :label="'NÃO FEITA'"></app-task-report-dialog>
              <app-task-report-dialog :report="report" :label="'INCOMPLETA'"></app-task-report-dialog>
              <app-task-report-dialog :report="report" :label="'COMPLETA'"></app-task-report-dialog>
            </v-card-actions>
          </v-card>
        </v-flex>
      </v-layout>
    </v-slide-y-transition>
  </v-container>
</template>

<script>
export default {
  props: ['reportId'],
  computed: {
    report () {
      return this.$store.getters.loadedTaskReport(this.reportId)
    },
    loading () {
      return this.$store.getters.loading
    },
    userIsAuthenticated () {
      return this.$store.getters.user !== null && this.$store.getters.user !== undefined
    }
  },
  methods: {
    formatDate (date) {
      return this.$moment(date).format('L')
    }
  }
}
</script>
