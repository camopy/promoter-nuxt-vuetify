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
          <v-card v-for="task in tasks" :key="task.id" class="mb-2">
            <v-container fluid>
              <v-layout row>
                <v-flex xs7 sm8 md9>
                  <v-card-title primary-title>
                    <div>
                      <h1 class="mb-0">{{ task.name }}</h1>
                      <div>{{ task.date }}</div>
                    </div>
                  </v-card-title>
                  <v-card-actions>
                    <v-btn flat :to="'/tasks/' + task.id">
                      <!-- <v-icon left light>arrow_forward</v-icon> -->
                      Ver Missão
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
  computed: {
    tasks () {
      return this.$store.getters.loadedTasks
    },
    loading () {
      return this.$store.getters.loading
    }
  }
}
</script>
