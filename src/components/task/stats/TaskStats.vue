<template>
  <v-container fluid>
    <v-layout>
      <v-flex xs12 class="text-xs-center">
        <v-progress-circular
          indeterminate
          color="primary"
          v-if="loading"
        ></v-progress-circular>
      </v-flex>
    </v-layout>
    <v-slide-y-transition mode="out-in">
      <v-layout row wrap>
        <v-flex xs12>
          <v-card class="mb-2">
            <v-card-title primary-title>
              <div>
                <h1 class="mb-0">Status</h1>
              </div>
            </v-card-title>
            <v-container fluid>
              <pie-chart :data="chartData" :options="chartOptions" />
            </v-container>
          </v-card>
        </v-flex>
      </v-layout>
    </v-slide-y-transition>
  </v-container>
</template>

<script>
import PieChart from '../../chart/Pie'

export default {
  props: ['taskId'],
  components: { PieChart },
  computed: {
    loading () {
      return this.$store.getters.loading
    },
    task () {
      return this.$store.getters.loadedTask(this.taskId)
    },
    chartData () {
      return {
        labels: ['Completa', 'Incompleta', 'Não feita'],
        datasets: [
          {
            label: 'Task Status',
            backgroundColor: ['green', 'orange', 'red'],
            data: [this.task.taskReportsComplete, this.task.taskReportsIncomplete, this.task.taskReportsNotdone]
          }
        ]
      }
    },
    chartOptions () {
      return {
        responsive: true,
        maintainAspectRatio: false
      }
    }
  }
}
</script>
