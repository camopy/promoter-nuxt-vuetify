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
      <v-layout row wrap v-if="crew">
        <v-flex xs12>
          <v-card>
            <v-card-title primary-title>
              <div>
                <h1>{{ crew.name }}</h1>
              </div>
            </v-card-title>
            <v-card-media
              :src="crew.imageUrl"
              height="400px"
              contain
            ></v-card-media>
            <v-card-text>
              <div>
                {{crew.email}}
                <app-url-icon v-if="crew.facebook" :url="'https://www.facebook.com/' + crew.facebook" icon="fab fa-facebook"></app-url-icon>
                <app-url-icon v-if="crew.instagram" :url="'https://www.instagram.com/' + crew.instagram" icon="fab fa-instagram"></app-url-icon>
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
    crew () {
      return this.$store.getters.loadedCrew(this.id)
    },
    loading () {
      return this.$store.getters.loading
    }
  }
}
</script>
