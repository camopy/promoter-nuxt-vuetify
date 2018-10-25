<template>
  <v-dialog v-model="deleteEventDialog" width="800px">
    <v-btn fab accent slot="activator">
      <v-icon>delete</v-icon>
    </v-btn>
    <v-slide-y-transition mode="out-in">
      <v-layout row wrap v-if="event">
        <v-flex xs12>
          <v-card>
            <v-card-title
              class="grey py-4 title"
            >
              Deletar evento
            </v-card-title>
            <v-layout row wrap>
              <v-flex xs12>
                <v-card-text>
                  Você tem certeza que deseja deletar esse evento?
                </v-card-text>
              </v-flex>
            </v-layout>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn flat :disabled="loading" color="primary" @click="onCancel">Cancelar</v-btn>
              <v-btn flat :disabled="loading" :loading="loading" @click="onDeleteEvent">
                Deletar
                <span slot="loader" class="custom-loader">
                  <v-icon light>cached</v-icon>
                </span>
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-flex>
      </v-layout>
    </v-slide-y-transition>
  </v-dialog>
</template>

<script>
import Date from '@/mixins/Date'

export default {
  mixins: [Date],
  props: ['event'],
  computed: {
    loading () {
      return this.$store.getters.loading
    }
  },

  data () {
    return {
      deleteEventDialog: false,
      name: this.event.name,
      state: this.event.state,
      city: this.event.city,
      date: this.event.date,
      description: this.event.description,
      gift: this.event.gift,
      image: null,
      imageUrl: this.event.imageUrl,
      imagePath: this.event.imagePath
    }
  },

  methods: {
    onCancel () {
      this.deleteEventDialog = false
    },
    onDeleteEvent () {
      const eventData = {
        id: this.event.id,
        state: this.state,
        city: this.city,
        date: this.date,
        description: this.description,
        imageUrl: this.event.imageUrl,
        imagePath: this.event.imagePath,
        image: this.image
      }
      this.$store.dispatch('deleteEvent', eventData)
      .then(response => {
        this.deleteEventDialog = false
        this.image = null
        this.$router.go(-1)
      })
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