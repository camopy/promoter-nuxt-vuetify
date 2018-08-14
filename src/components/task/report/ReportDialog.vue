<template>
  <v-dialog persistent v-model="reportDialog">
    <v-btn accent slot="activator">
      {{label}}
    </v-btn>
    <v-card>
      <v-container fluid>
        <v-layout row wrap>
          <v-flex xs12>
            <v-card-title >Marcar tarefa como {{label}} ?</v-card-title>
          </v-flex>
        </v-layout>
        <v-divider></v-divider>
        <v-layout row wrap>
          <v-flex xs12>
            <v-card-actions>
              <v-btn
                class="red--text darken-1"
                flat
                @click="reportDialog = false">Cancelar
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
    'report',
    'label'
  ],
  data () {
    return {
      reportDialog: false
    }
  },
  methods: {
    onAgree () {
      switch (this.label) {
        case 'CONCLUIDA':
          this.report.status = 'done'
          break
        case 'NÃO FEITA':
          this.report.status = 'notdone'
          break
        case 'INCOMPLETA':
          this.report.status = 'incomplete'
          break
        case 'COMPLETA':
          this.report.status = 'complete'
          break
        default:
          console.log('Error selecting task report status')
          break
      }
      this.$store.dispatch('updateTaskReport', this.report)
      this.reportDialog = false
    }
  }
}
</script>
