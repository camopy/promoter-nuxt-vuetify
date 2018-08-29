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
                <h1>{{ report.name }} - {{ report.eventName }}</h1>
                <h2>
                  {{report.promoterName}}
                  <app-url-icon v-if="report.promoterFacebook" :url="'https://www.facebook.com/' + report.promoterFacebook" icon="fa-facebook"></app-url-icon>
                  <app-url-icon v-if="report.promoterInstagram" :url="'https://www.instagram.com/' + report.promoterInstagram" icon="fa-instagram"></app-url-icon>
                </h2>
              </div>
            </v-card-title>
            <v-card-text>
              <div>{{formatDate(report.date)}}</div>
            </v-card-text>
            <v-card-text>
              <div>{{report.description}}</div>
            </v-card-text>
            <v-card-actions v-if="userIsCrew">
              <v-spacer></v-spacer>
              <app-task-report-dialog :report="report" :label="'NÃO FEITA'"></app-task-report-dialog>
              <app-task-report-dialog :report="report" :label="'INCOMPLETA'"></app-task-report-dialog>
              <app-task-report-dialog :report="report" :label="'COMPLETA'"></app-task-report-dialog>
            </v-card-actions>
            <v-card-text v-else>
              <v-spacer></v-spacer>
              <div>{{report.status}}</div>
            </v-card-text>
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
    },
    userIsCrew () {
      return this.$store.getters.user.accountType === 'crew'
    }
  }
}
</script>
