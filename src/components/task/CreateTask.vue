<template>
  <v-dialog v-model="dialog" width="800px">
    <v-card>
      <v-card-title
        class="grey py-4 title"
      >
        Criar uma nova missão
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
                  @click="onPickFile"
                ></v-card-media>
              </v-card>
            </v-flex>
          </v-layout>
        </v-form>
      </v-container>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn flat color="primary" @click="dialog = false">Cancelar</v-btn>
        <v-btn flat :disabled="!valid" @click="onCreateTask">Salvar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>

export default {
  props: ['visible'],

  computed: {
    dialog: {
      get () {
        return this.visible
      },
      set (value) {
        if (!value) {
          this.$emit('close')
          this.$refs.form.reset()
        }
      }
    },
    computedDateFormatted () {
      return this.formatDate(this.date)
    },
    computedFinalDateFormatted () {
      return this.formatDate(this.finalDate)
    },
    events () {
      return this.$store.getters.loadedEventsFromUser
    }
  },

  // watch: {
  //   date (val) {
  //     this.dateFormatted = this.formatDate(this.date)
  //   }
  // },

  data: () => ({
    valid: true,
    name: '',
    nameRules: [
      v => !!v || 'Nome é obrigatório'
      // v => (v && v.length <= 10) || 'Name must be less than 10 characters'
    ],
    date: '',
    dateRules: [
      v => !!v || 'Data é obrigatório'
    ],
    finalDate: '',
    finalDateRules: [
      v => !!v || 'Data limite é obrigatório'
    ],
    // dateFormatted: null,
    dateMenu: false,
    finalDateMenu: false,
    description: '',
    image: null,
    imageUrl: '',
    event: ''
  }),

  methods: {
    onCreateTask () {
      if (this.$refs.form.validate()) {
        const taskData = {
          name: this.name,
          date: this.date,
          finalDate: this.finalDate,
          description: this.description,
          image: this.image,
          eventId: this.event.id
        }
        this.$store.dispatch('createTask', taskData)
        this.dialog = false
      }
    },
    formatDate (date) {
      if (!date) return null

      const [year, month, day] = date.split('-')
      return `${month}/${day}/${year}`
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