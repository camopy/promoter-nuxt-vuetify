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
          <transition-group name="list-complete" tag="p">
            <v-card v-for="event in events" :key="event.id" class="mb-2 list-complete-item">
              <v-container fluid>
                <v-layout row>
                  <v-flex xs5 sm4 md3>
                    <v-card-media
                      :src="event.imageUrl"
                      height="150px"
                    ></v-card-media>
                  </v-flex>
                  <v-flex xs7 sm8 md9>
                    <v-card-title primary-title>
                      <div>
                        <h1 class="mb-0">{{ event.name }}</h1>
                        <div>{{ event.date }}</div>
                      </div>
                    </v-card-title>
                    <v-card-actions>
                      <v-btn flat :to="'/events/' + event.id">
                        <!-- <v-icon left light>arrow_forward</v-icon> -->
                        Ver Evento
                      </v-btn>
                      <v-btn flat v-if="userIsCrew" :to="'/events/' + event.id + '/tasks'" @click="onViewTasks(event)">
                        <!-- <v-icon left light>arrow_forward</v-icon> -->
                        Missões
                      </v-btn>
                      <v-btn flat v-if="userIsCrew" :to="'/events/' + event.id + '/promoters'" @click="onViewPromoters(event)">
                        <!-- <v-icon left light>arrow_forward</v-icon> -->
                        Divulgadores
                      </v-btn>
                      <v-btn flat v-if="!userIsCrew" :to="'/events/' + event.id + '/taskReports'" @click="onViewTaskReports(event)">
                        <!-- <v-icon left light>arrow_forward</v-icon> -->
                        Relatórios
                      </v-btn>
                    </v-card-actions>
                  </v-flex>
                </v-layout>
              </v-container>
            </v-card>
          </transition-group>
        </v-flex>
      </v-layout>
    </v-slide-y-transition>
  </v-container>
</template>

<script>
export default {
  computed: {
    events () {
      return this.$store.getters.loadedEventsFromUser
    },
    loading () {
      return this.$store.getters.loading
    },
    userIsCrew () {
      return this.$store.getters.user.accountType === 'crew'
    }
  },
  methods: {
    onViewPromoters (event) {
      this.$store.dispatch('loadPromotersFromEvent', event)
    },
    onViewTasks (event) {
      this.$store.dispatch('loadTasksFromEvent', event)
    },
    onViewTaskReports (event) {
      this.$store.dispatch('loadTaskReportsFromEvent', event)
    }
  }
}
</script>

<style>
.list-complete-item {
  transition: all 1s;
  /* display: inline-block; */
  /* margin-right: 10px; */
}
.list-complete-enter, .list-complete-leave-to
/* .list-complete-leave-active below version 2.1.8 */ {
  opacity: 0;
  transform: translateY(30px);
}
.list-complete-leave-active {
  position: absolute;
}
</style>
