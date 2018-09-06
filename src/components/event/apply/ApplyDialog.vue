<template>
  <v-dialog persistent v-model="applyDialog">
    <v-btn accent slot="activator">
      {{ userIsPromoting ? 'Sair' : (userIsApplying ? 'Cancelar' : 'Aplicar')}}
    </v-btn>
    <v-card>
      <v-container fluid>
        <v-layout row wrap>
          <v-flex xs12>
            <v-card-title v-if="userIsPromoting">Sair da divulgação?</v-card-title>
            <v-card-title v-else-if="userIsApplying">Cancelar aplicação?</v-card-title>
            <v-card-title v-else>Aplicar para divulgar?</v-card-title>
          </v-flex>
        </v-layout>
        <v-divider></v-divider>
        <v-layout row wrap>
          <v-flex xs12>
            <v-card-text v-if="userIsPromoting">
              Ao sair da divulgação, você perderá todos os pontos adiquiridos neste evento
            </v-card-text>
          </v-flex>
        </v-layout>
        <v-layout row wrap>
          <v-flex xs12>
            <v-card-actions>
              <v-btn
                class="red--text darken-1"
                flat
                @click="applyDialog = false">Cancelar
              </v-btn>
              <v-btn
                class="green--text darken-1"
                flat
                @click="onAgree">Confirmar
              </v-btn>
            </v-card-actions>
          </v-flex>
        </v-layout>
      </v-container>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  props: [
    'event'
  ],
  data () {
    return {
      applyDialog: false
    }
  },
  computed: {
    userIsPromoting () {
      return this.$store.getters.user.events.findIndex(event => {
        return event.id === this.event.id && event.status === 'promoting'
      }) >= 0
    },
    userIsApplying () {
      return this.$store.getters.user.events.findIndex(event => {
        return event.id === this.event.id && event.status === 'applying'
      }) >= 0
    }
  },
  methods: {
    onAgree () {
      if (this.userIsApplying) {
        this.$store.dispatch('unapplyUserFromEvent', this.event.id)
      } else if (this.userIsPromoting) {
        this.$store.dispatch('updateUserStatusFromEvent', {id: this.event.id, status: 'left'})
      } else {
        this.$store.dispatch('applyUserForEvent', {id: this.event.id, name: this.event.name, imageUrl: this.event.imageUrl})
      }
      this.applyDialog = false
    }
  }
}
</script>
