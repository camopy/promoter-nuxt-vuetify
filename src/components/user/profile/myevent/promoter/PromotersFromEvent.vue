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
  props: ['event'],
  computed: {
    promoters () {
      return this.$store.getters.loadedPromotersFromEvent
    },
    loading () {
      return this.$store.getters.loading
    }
  }
}
</script>