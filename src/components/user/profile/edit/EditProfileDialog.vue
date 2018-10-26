<template>
  <v-dialog width="800px" v-model="editProfileDialog">
    <v-btn fab accent slot="activator">
      <v-icon>edit</v-icon>
    </v-btn>
    <v-card>
      <v-container fluid>
        <v-layout row wrap v-if="loading">
          <v-flex xs12 class="text-xs-center">
            <v-progress-circular
              indeterminate
              color="primary"
            ></v-progress-circular>
          </v-flex>
        </v-layout>
        <v-slide-y-transition mode="out-in" v-else>
          <v-layout row wrap v-if="user">
            <v-flex xs12>
              <v-card>
                <v-card-title primary-title>
                  <div>
                    <h1>{{ user.name }}</h1>
                  </div>
                </v-card-title>
                <v-card-text>
                  <div>{{user.email}}</div>
                  <v-form ref="form">
                    <v-layout row>
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
                    <v-layout row>
                      <v-flex xs12>
                        <v-text-field
                          prepend-icon="fab fa-facebook-square"
                          name="facebook"
                          v-model="facebook"
                          label="Facebook"
                        ></v-text-field>
                      </v-flex>
                    </v-layout>
                    <v-layout row>
                      <v-flex xs12>
                        <v-text-field
                          prepend-icon="fab fa-instagram"
                          name="instagram"
                          v-model="instagram"
                          label="Instagram"
                        ></v-text-field>
                      </v-flex>
                    </v-layout>
                  </v-form>
                </v-card-text>
                <v-divider></v-divider>
                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn flat :disabled="updating" class="red--text darken-1" @click="onCancel">Cancelar</v-btn>
                  <v-btn flat :disabled="updating" class="green--text darken-1" :loading="updating" @click="onAgree">
                    Confirmar
                    <span slot="loader" class="custom-loader">
                      <v-icon light>cached</v-icon>
                    </span>
                  </v-btn>
                </v-card-actions>
              </v-card>
            </v-flex>
          </v-layout>
        </v-slide-y-transition>
      </v-container>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  props: ['user'],
  data () {
    return {
      editProfileDialog: false,
      facebook: this.user.facebook || '',
      instagram: this.user.instagram || '',
      image: null,
      imageUrl: this.user.imageUrl || '',
      imagePath: this.user.imagePath || ''
    }
  },
  computed: {
    loading () {
      return this.$store.getters.loading
    },
    updating () {
      return this.$store.getters.updating
    }
  },
  methods: {
    onCancel () {
      this.editProfileDialog = false
      this.facebook = this.user.facebook
      this.instagram = this.user.instagram
      this.imageUrl = this.user.imageUrl
      this.imagePath = this.user.imagePath
    },
    onAgree () {
      // eslint-disable-next-line
      const facebookRegex = /(?:https?:\/\/)?(?:www\.)?(?:facebook|fb|m\.facebook)\.(?:com|me)\/(?:(?:\w)*#!\/)?(?:pages\/)?(?:[\w\-]*\/)*([\w\-\.]+)(?:\/)?/i
      // eslint-disable-next-line
      const instagramRegex = /(?:https?:\/\/)?(?:www\.)?(?:instagram|ig|m\.instagram)\.(?:com|me)\/(?:(?:\w)*#!\/)?(?:pages\/)?(?:[\w\-]*\/)*([\w\-\.]+)(?:\/)?/i
      const profileData = {
        id: this.user.id,
        facebook: this.facebook.indexOf('facebook.com/') !== -1 ? this.facebook.match(facebookRegex)[1] : this.facebook,
        instagram: this.instagram.indexOf('instagram.com/') !== -1 ? this.instagram.match(instagramRegex)[1] : this.instagram,
        image: this.image,
        imageUrl: this.imageUrl,
        imagePath: this.imagePath
      }
      this.$store.dispatch('updateUserProfile', profileData)
      .then(response => {
        this.editProfileDialog = false
        this.image = null
      })
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