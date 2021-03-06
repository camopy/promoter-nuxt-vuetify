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
          <v-switch :label="'Aceitar novos divulgadores'" v-model="event.recruiting" @click.stop="toogleRecruiting()"></v-switch>
        </v-flex>
        <v-flex xs12>
          <v-card v-for="promoter in promoters" :key="promoter.id" class="mb-2">
            <v-container fluid>
              <v-layout row>
                <v-flex xs5 sm4 md3>
                  <v-card-media
                    :src="promoter.imageUrl"
                    height="150px"
                  ></v-card-media>
                </v-flex>
                <v-flex xs7 sm8 md9>
                  <v-card-title primary-title>
                    <div>
                      <h1 class="mb-0">{{ promoter.name }}</h1>
                      <div>{{ promoter.email }}</div>
                    </div>
                  </v-card-title>
                  <v-card-actions>
                    <v-btn flat :to="'/promoters/' + promoter.id">
                      <!-- <v-icon left light>arrow_forward</v-icon> -->
                      Ver Divulgador
                    </v-btn>
                    <v-btn flat v-if="promoter.status === 'promoting'" :to="'/promoters/' + promoter.id + '/stats'">
                      Estatísticas
                    </v-btn>
                    <v-btn flat v-if="promoter.status === 'applying'" :disabled="updating" :loading="updating" class="green--text darken-1" @click="onAcceptPromoter(promoter)">
                      Aceitar
                      <span slot="loader" class="custom-loader">
                        <v-icon light>cached</v-icon>
                      </span>
                    </v-btn>
                    <v-btn flat v-if="promoter.status === 'applying'" :disabled="updating" :loading="updating" class="red--text darken-1" @click="onDeclinePromoter(promoter)">
                      Recusar
                      <span slot="loader" class="custom-loader">
                        <v-icon light>cached</v-icon>
                      </span>
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
    promoters () {
      return this.$store.getters.loadedPromotersFromEvent
    },
    loading () {
      return this.$store.getters.loading
    },
    updating () {
      return this.$store.getters.updating
    },
    event () {
      return this.$store.getters.loadedEventFromUser(this.eventId)
    }
  },
  methods: {
    onAcceptPromoter (promoter) {
      this.$store.dispatch('updatePromoterStatusFromEvent', {eventId: this.eventId, promoterId: promoter.id, status: 'promoting'})
    },
    onDeclinePromoter (promoter) {
      this.$store.dispatch('updatePromoterStatusFromEvent', {eventId: this.eventId, promoterId: promoter.id, status: 'declined'})
    },
    toogleRecruiting () {
      this.$store.dispatch('toogleRecruitingFromEvent', this.event)
    }
  }
}
</script>

<style>
  .custom-loader {
    animation: loader 1s infinite;
    display: flex;
  }
  @-moz-keyframes loader {
    from {
      transform: rotate(0);
    }
    to {
      transform: rotate(360deg);
    }
  }
  @-webkit-keyframes loader {
    from {
      transform: rotate(0);
    }
    to {
      transform: rotate(360deg);
    }
  }
  @-o-keyframes loader {
    from {
      transform: rotate(0);
    }
    to {
      transform: rotate(360deg);
    }
  }
  @keyframes loader {
    from {
      transform: rotate(0);
    }
    to {
      transform: rotate(360deg);
    }
  }
</style>