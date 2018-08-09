<template>
  <v-dialog persistent v-model="doneDialog">
    <v-btn accent slot="activator">
      Concluir
    </v-btn>
    <v-card>
      <v-container fluid>
        <v-layout row wrap>
          <v-flex xs12>
            <v-card-title >Marcar tarefa como conclída?</v-card-title>
          </v-flex>
        </v-layout>
        <v-divider></v-divider>
        <v-layout row wrap>
          <v-flex xs12>
            <v-card-actions>
              <v-btn
                class="red--text darken-1"
                flat
                @click="doneDialog = false">Cancelar
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
    'task'
  ],
  data () {
    return {
      doneDialog: false
    }
  },
  methods: {
    onAgree () {
      this.$store.dispatch('markTaskAsDone', {id: this.task.id, name: this.event.name})
      this.doneDialog = false
    }
  }
}
</script>
