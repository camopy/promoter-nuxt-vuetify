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
      <v-layout row wrap v-if="promoter">
        <v-flex xs12>
          <v-card>
            <v-card-title primary-title>
              <div>
                <h1>{{ promoter.name }}</h1>
              </div>
            </v-card-title>
            <v-card-media
              :src="promoter.imageUrl"
              height="400px"
              contain
            ></v-card-media>
            <v-card-text>
              <div>
                {{promoter.email}}
                <app-url-icon v-if="promoter.facebook" :url="'https://www.facebook.com/' + promoter.facebook" icon="fab fa-facebook"></app-url-icon>
                <app-url-icon v-if="promoter.instagram" :url="'https://www.instagram.com/' + promoter.instagram" icon="fab fa-instagram"></app-url-icon>
              </div>
            </v-card-text>
          </v-card>
        </v-flex>
      </v-layout>
    </v-slide-y-transition>
  </v-container>
</template>

<script>
export default {
  props: ['id'],
  computed: {
    promoter () {
      return this.$store.getters.loadedPromoter(this.id)
    },
    loading () {
      return this.$store.getters.loading
    }
  }
}
</script>
