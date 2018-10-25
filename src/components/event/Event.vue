<template>
  <v-container fluid>
    <v-slide-y-transition mode="out-in">
      <v-layout row wrap v-if="event">
        <v-flex xs12>
          <v-card>
            <v-card-title primary-title>
              <div>
                <h1>{{ event.name }}</h1>
              </div>
              <v-spacer></v-spacer>
              <app-event-edit-dialog v-if="userIsCreator" :event="event"></app-event-edit-dialog>
              <app-event-delete-dialog v-if="userIsCreator && eventIsWaiting" :event="event"></app-event-delete-dialog>
            </v-card-title>
            <v-card-text>
              <div>{{formatDate(event.date)}} - {{event.city}}, {{event.state}}</div>
            </v-card-text>
            <v-card-media
              :src="event.imageUrl"
              height="400px"
              contain
            ></v-card-media>
            <v-card-text>
              <v-textarea
                :value="event.description"
                auto-grow
                readonly
              ></v-textarea>
              <div>Prêmio: {{event.gift}}</div>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <app-event-apply-dialog :event="event" v-if="userIsAuthenticated && !userIsCrew && !userWasDeclined && (eventIsRecruiting || userIsApplying || userIsPromoting)"></app-event-apply-dialog>
            </v-card-actions>
          </v-card>
        </v-flex>
      </v-layout>
    </v-slide-y-transition>
  </v-container>
</template>

<script>
import Date from '@/mixins/Date'
export default {
  mixins: [Date],
  props: ['id'],
  computed: {
    event () {
      return this.$store.getters.loadedEvent(this.id)
    },
    loading () {
      return this.$store.getters.loading
    },
    userIsAuthenticated () {
      return this.$store.getters.user !== null && this.$store.getters.user !== undefined
    },
    userIsCrew () {
      return this.$store.getters.user.accountType === 'crew'
    },
    eventIsRecruiting () {
      return this.event.recruiting
    },
    eventIsWaiting () {
      return this.event.status === 'waiting'
    },
    userIsApplying () {
      return this.$store.getters.user.events.findIndex(event => {
        return event.id === this.id && event.status === 'applying'
      }) >= 0
    },
    userIsPromoting () {
      return this.$store.getters.user.events.findIndex(event => {
        return event.id === this.id && event.status === 'promoting'
      }) >= 0
    },
    userWasDeclined () {
      return this.$store.getters.user.events.findIndex(event => {
        return event.id === this.id && event.status === 'declined'
      }) >= 0
    },
    userIsCreator () {
      if (!this.userIsAuthenticated) {
        return false
      }
      return this.$store.getters.user.id === this.event.creatorId
    }
  }
}
</script>
