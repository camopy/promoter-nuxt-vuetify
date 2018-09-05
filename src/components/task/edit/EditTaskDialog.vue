<template>
  <v-dialog v-model="editTaskDialog" width="800px">
    <v-btn fab accent slot="activator">
      <v-icon>edit</v-icon>
    </v-btn>
    <v-slide-y-transition mode="out-in">
      <v-layout row wrap v-if="task">
        <v-flex xs12>
          <v-card>
            <v-card-title
              class="grey py-4 title"
            >
              Editar missão
            </v-card-title>
            <v-container grid-list-sm class="pa-4">
              <v-form ref="form" v-model="valid" lazy-validation>
                <v-layout row wrap>
                  <v-flex xs12 align-center justify-space-between>
                    <v-text-field
                      prepend-icon="assignment"
                      label="Nome"
                      v-model="name"
                      :rules="nameRules"
                      required
                    ></v-text-field>
                  </v-flex>
                  <v-flex xs12>
                    <v-overflow-btn
                      prepend-icon="event"
                      v-model="event"
                      :items="events"
                      label="Evento"
                      editable
                      item-text="name"
                      item-value="id"
                      return-object
                    ></v-overflow-btn>
                  </v-flex>
                  <v-flex xs6>
                      <v-menu
                        :close-on-content-click="false"
                        v-model="dateMenu"
                        :nudge-right="40"
                        lazy
                        transition="scale-transition"
                        offset-y
                        full-width
                        max-width="290px"
                        min-width="290px"
                      >
                        <v-text-field
                          slot="activator"
                          :value="computedDateFormatted"
                          label="Data"
                          prepend-icon="event"
                          :rules="dateRules"
                          required
                          readonly
                        ></v-text-field>
                        <v-date-picker v-model="date" no-title @input="dateMenu = false"></v-date-picker>
                      </v-menu>
                  </v-flex>
                  <v-flex xs6>
                      <v-menu
                        :close-on-content-click="false"
                        v-model="finalDateMenu"
                        :nudge-right="40"
                        lazy
                        transition="scale-transition"
                        offset-y
                        full-width
                        max-width="290px"
                        min-width="290px"
                      >
                        <v-text-field
                          slot="activator"
                          :value="computedFinalDateFormatted"
                          label="Data limite"
                          prepend-icon="event"
                          :rules="finalDateRules"
                          required
                          readonly
                        ></v-text-field>
                        <v-date-picker v-model="finalDate" no-title @input="finalDateMenu = false"></v-date-picker>
                      </v-menu>
                  </v-flex>
                  <v-flex xs12 sm8>
                    <v-textarea
                      prepend-icon="notes"
                      label="Descrição"
                      v-model="description"
                    ></v-textarea>
                  </v-flex>
                  <v-flex xs12 sm4 md3>
                    <input
                      type="file"
                      style="display:none"
                      ref="fileInput"
                      @change="onFilePicked"
                    >
                    <v-card>
                      <v-card-media
                        :src="imageUrl"
                        height="120px"
                        contain
                        @click="onPickFile"
                      ></v-card-media>
                    </v-card>
                  </v-flex>
                </v-layout>
              </v-form>
            </v-container>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn flat :disabled="loading" color="primary" @click="onCancel">Cancelar</v-btn>
              <v-btn flat :disabled="!valid || loading" :loading="loading" @click="onUpdateTask">
                Salvar
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
    computedDateFormatted () {
      return this.formatDate(this.date)
    },
    computedFinalDateFormatted () {
      return this.formatDate(this.finalDate)
    },
    events () {
      return this.$store.getters.loadedEventsFromUser
    },
    loading () {
      return this.$store.getters.loading
    }
  },

  data () {
    return {
      valid: true,
      editTaskDialog: false,
      name: this.task.name,
      nameRules: [
        v => !!v || 'Nome é obrigatório'
        // v => (v && v.length <= 10) || 'Name must be less than 10 characters'
      ],
      date: this.task.date,
      dateRules: [
        v => !!v || 'Data é obrigatório'
      ],
      finalDate: this.task.finalDate,
      finalDateRules: [
        v => !!v || 'Data limite é obrigatório'
      ],
      // dateFormatted: null,
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
      console.log(this.task)
      this.editTaskDialog = false
      this.name = this.task.name
      this.event = {name: this.task.eventName, id: this.task.eventId}
      this.date = this.task.date
      this.finalDate = this.task.finalDate
      this.description = this.task.description
      this.imageUrl = this.task.imageUrl
    },
    onUpdateTask () {
      if (this.$refs.form.validate()) {
        const taskData = {
          id: this.task.id,
          name: this.name,
          date: this.date,
          finalDate: this.finalDate,
          description: this.description,
          image: this.image,
          imageUrl: this.task.imageUrl,
          eventId: this.event.id,
          eventName: this.event.name
        }
        this.$store.dispatch('updateTask', taskData)
        .then(response => {
          this.editTaskDialog = false
          this.image = null
        })
      }
    },
    onPickFile () {
      this.$refs.fileInput.click()
    },
    onFilePicked (event) {
      const files = event.target.files
      let filename = files[0].name
      if (filename.lastIndexOf('.') <= 0) {
        return alert('Adicione um arquivo válido')
      }
      const fileReader = new FileReader()
      fileReader.addEventListener('load', () => {
        this.imageUrl = fileReader.result
      })
      fileReader.readAsDataURL(files[0])
      this.image = files[0]
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