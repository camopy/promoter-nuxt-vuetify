<template>
  <v-container fluid>
    <v-layout v-if="loading">
      <v-flex xs12 class="text-xs-center">
        <v-progress-circular
          indeterminate
          color="primary"
        ></v-progress-circular>
      </v-flex>
    </v-layout>
    <v-slide-y-transition mode="out-in" v-else>
      <v-layout row wrap>
        <v-flex xs12>
          <v-card v-for="taskReport in taskReports" :key="taskReport.id" class="mb-2">
            <v-container fluid>
              <v-layout row>
                <v-flex xs7 sm8 md9>
                  <v-card-title primary-title>
                    <div>
                      <h1 class="mb-0">{{ taskReport.name }} - {{ taskReport.eventName }}</h1>
                    </div>
                  </v-card-title>
                  <v-card-actions>
                    <v-btn flat :to="'/taskReports/' + taskReport.id">
                      Ver Relatório
                    </v-btn>
                  </v-card-actions>
                </v-flex>
              </v-layout>
            </v-container>
          </v-card>
        </v-flex>
      </v-layout>
    </v-slide-y-transition>
  </v-container>
</template>

<script>
export default {
  props: ['eventId'],
  computed: {
    taskReports () {
      return this.$store.getters.loadedTaskReportsFromEvent
    },
    loading () {
      return this.$store.getters.loading
    }
  }
}
</script>