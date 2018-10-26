<template>
  <v-dialog v-model="editEventDialog" width="800px">
    <v-btn fab accent slot="activator">
      <v-icon>edit</v-icon>
    </v-btn>
    <v-slide-y-transition mode="out-in">
      <v-layout row wrap v-if="event">
        <v-flex xs12>
          <v-card>
            <v-card-title
              class="grey py-4 title"
            >
              Editar evento
            </v-card-title>
            <v-container grid-list-sm class="pa-4">
              <v-form ref="form" v-model="valid" lazy-validation>
                <v-layout row wrap v-if="event">
                  <v-flex xs12 align-center justify-space-between>
                    <v-text-field
                      prepend-icon="event"
                      label="Nome"
                      v-model="name"
                      disabled
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
                      disabled
                    ></v-text-field>
                  </v-flex>
                </v-layout>
              </v-form>
            </v-container>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn flat :disabled="updating" color="primary" @click="onCancel">Cancelar</v-btn>
              <v-btn flat :disabled="!valid || updating" :loading="updating" @click="onUpdateEvent">
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
  props: ['event'],
  computed: {
    updating () {
      return this.$store.getters.updating
    },
    computedDateFormatted () {
      return this.formatDate(this.date)
    }
  },
  data () {
    return {
      valid: true,
      editEventDialog: false,
      name: this.event.name,
      state: this.event.state,
      stateRules: [
        v => !!v || 'Estado é obrigatório'
      ],
      city: this.event.city,
      cityRules: [
        v => !!v || 'Cidade é obrigatório'
      ],
      date: this.event.date,
      dateRules: [
        v => !!v || 'Data é obrigatório'
      ],
      dateMenu: false,
      description: this.event.description,
      gift: this.event.gift,
      image: null,
      imageUrl: this.event.imageUrl,
      imagePath: this.event.imagePath
    }
  },

  methods: {
    onCancel () {
      this.editEventDialog = false
      this.state = this.event.state
      this.city = this.event.city
      this.date = this.event.date
      this.description = this.event.description
      this.imageUrl = this.event.imageUrl
      this.imagePath = this.event.imagePath
    },
    onUpdateEvent () {
      if (this.$refs.form.validate()) {
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
        this.$store.dispatch('updateEvent', eventData)
        .then(response => {
          this.editEventDialog = false
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