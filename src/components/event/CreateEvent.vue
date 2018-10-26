<template>
  <v-dialog v-model="dialog" width="800px">
    <v-card>
      <v-card-title
        class="grey py-4 title"
      >
        Criar um novo evento
      </v-card-title>
      <v-container grid-list-sm class="pa-4">
        <v-form ref="form" v-model="valid" lazy-validation>
          <v-layout row wrap>
            <v-flex xs12 align-center justify-space-between>
              <v-text-field
                prepend-icon="event"
                label="Nome"
                v-model="name"
                :rules="nameRules"
                required
              ></v-text-field>
            </v-flex>
            <v-flex xs4>
              <v-text-field
                prepend-icon="domain"
                label="Estado"
                v-model="state"
                :rules="stateRules"
                required
              ></v-text-field>
            </v-flex>
            <v-flex xs4>
              <v-text-field
                prepend-icon="location_city"
                label="Cidade"
                v-model="city"
                :rules="cityRules"
                required
              ></v-text-field>
            </v-flex>
            <v-flex xs4>
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
            <v-flex xs12>
              <v-text-field
                prepend-icon="whatshot"
                label="Prêmio"
                v-model="gift"
              ></v-text-field>
            </v-flex>
          </v-layout>
        </v-form>
      </v-container>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn flat :disabled="creating" color="primary" @click="dialog = false">Cancelar</v-btn>
        <v-btn flat :disabled="!valid || creating" :loading="creating" @click="onCreateEvent">
          Salvar
          <span slot="loader" class="custom-loader">
            <v-icon light>cached</v-icon>
          </span>
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import Date from '@/mixins/Date'

export default {
  mixins: [Date],
  props: ['visible'],

  computed: {
    dialog: {
      get () {
        return this.visible
      },
      set (value) {
        if (!value) {
          this.$emit('close')
          this.$refs.fileInput.value = ''
          this.image = null
          this.imageUrl = ''
          this.$refs.form.reset()
          this.gift = ''
          this.description = ''
          this.date = ''
        }
      }
    },
    creating () {
      return this.$store.getters.creating
    },
    computedDateFormatted () {
      return this.formatDate(this.date)
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
    state: '',
    stateRules: [
      v => !!v || 'Estado é obrigatório'
    ],
    city: '',
    cityRules: [
      v => !!v || 'Cidade é obrigatório'
    ],
    date: '',
    dateRules: [
      v => !!v || 'Data é obrigatório'
    ],
    // dateFormatted: null,
    dateMenu: false,
    description: '',
    gift: '',
    image: null,
    imageUrl: ''
  }),

  methods: {
    onCreateEvent () {
      if (this.$refs.form.validate()) {
        const eventData = {
          name: this.name,
          state: this.state,
          city: this.city,
          date: this.date,
          description: this.description,
          image: this.image,
          gift: this.gift
        }
        this.$store.dispatch('createEvent', eventData)
        .then(response => {
          this.dialog = false
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