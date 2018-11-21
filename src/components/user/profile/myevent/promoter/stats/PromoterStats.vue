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
                <h1 class="mb-0">Missões</h1>
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
import PieChart from '../../../../../chart/Pie'

export default {
  props: ['promoterId'],
  components: { PieChart },
  computed: {
    loading () {
      return this.$store.getters.loading
    },
    promoter () {
      return this.$store.getters.loadedPromoterFromEvent(this.promoterId)
    },
    chartData () {
      return {
        labels: ['Completa', 'Incompleta', 'Não feita'],
        datasets: [
          {
            label: 'Task Status',
            backgroundColor: ['green', 'orange', 'red'],
            data: [this.promoter.taskReportsComplete, this.promoter.taskReportsIncomplete, this.promoter.taskReportsNotdone]
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
