<template>
  <v-dialog v-model="deleteTaskDialog" width="800px">
    <v-btn fab accent slot="activator">
      <v-icon>delete</v-icon>
    </v-btn>
    <v-slide-y-transition mode="out-in">
      <v-layout row wrap v-if="task">
        <v-flex xs12>
          <v-card>
            <v-card-title
              class="grey py-4 title"
            >
              Deletar missão
            </v-card-title>
            <v-layout row wrap>
              <v-flex xs12>
                <v-card-text>
                  Você tem certeza que deseja deletar essa missão?
                </v-card-text>
              </v-flex>
            </v-layout>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn flat :disabled="deleting" color="primary" @click="onCancel">Cancelar</v-btn>
              <v-btn flat :disabled="deleting" :loading="deleting" @click="onDeleteTask">
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
  props: ['task'],
  computed: {
    deleting () {
      return this.$store.getters.deleting
    }
  },

  data () {
    return {
      deleteTaskDialog: false,
      name: this.task.name,
      date: this.task.date,
      finalDate: this.task.finalDate,
      dateMenu: false,
      finalDateMenu: false,
      description: this.task.description,
      image: null,
      imageUrl: this.task.imageUrl,
      event: {name: this.task.eventName, id: this.task.eventId}
    }
  },

  methods: {
    onCancel () {
      this.deleteTaskDialog = false
    },
    onDeleteTask () {
      const taskData = {
        id: this.task.id,
        name: this.name,
        date: this.date,
        finalDate: this.finalDate,
        description: this.description,
        image: this.image,
        imageUrl: this.task.imageUrl,
        imagePath: this.task.imagePath,
        eventId: this.event.id,
        eventName: this.event.name
      }
      this.$store.dispatch('deleteTask', taskData)
      .then(response => {
        this.deleteTaskDialog = false
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