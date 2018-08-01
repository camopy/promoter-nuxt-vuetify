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
      <v-layout row wrap v-if="user">
        <v-flex xs12>
          <v-card>
            <v-card-title primary-title>
              <div>
                <h1>{{ user.name }}</h1>
              </div>
            </v-card-title>            
            <v-card-text>
              <div>{{user.email}}</div>
            </v-card-text> 
          </v-card>
        </v-flex>
      </v-layout>
    </v-slide-y-transition>
  </v-container>
</template>

<script>
export default {
  computed: {
    loading () {
      return this.$store.getters.loading
    },
    user () {
      return this.$store.getters.user
    }
  }
}
</script>
