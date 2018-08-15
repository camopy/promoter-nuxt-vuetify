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
                      <v-flex xs12>
                        <v-text-field
                          prepend-icon="fa-facebook-square"
                          name="facebook"
                          v-model="facebook"
                          label="Facebook"
                        ></v-text-field>
                      </v-flex>
                    </v-layout>
                    <v-layout row>
                      <v-flex xs12>
                        <v-text-field
                          prepend-icon="fa-instagram"
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
                  <v-btn
                    class="red--text darken-1"
                    flat
                    @click="onCancel">Cancelar
                  </v-btn>
                  <v-btn
                    class="green--text darken-1"
                    flat
                    @click="onAgree">Confirmar
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
      facebook: this.user.facebook,
      instagram: this.user.instagram
    }
  },
  computed: {
    loading () {
      return this.$store.getters.loading
    }
  },
  methods: {
    onCancel () {
      this.editProfileDialog = false
      this.facebook = this.user.facebook
      this.instagram = this.user.instagram
    },
    onAgree () {
      // eslint-disable-next-line
      const facebookRegex = /(?:https?:\/\/)?(?:www\.)?(?:facebook|fb|m\.facebook)\.(?:com|me)\/(?:(?:\w)*#!\/)?(?:pages\/)?(?:[\w\-]*\/)*([\w\-\.]+)(?:\/)?/i
      // eslint-disable-next-line
      const instagramRegex = /(?:https?:\/\/)?(?:www\.)?(?:instagram|ig|m\.instagram)\.(?:com|me)\/(?:(?:\w)*#!\/)?(?:pages\/)?(?:[\w\-]*\/)*([\w\-\.]+)(?:\/)?/i
      const profileData = {
        facebook: this.facebook.indexOf('facebook.com/') !== -1 ? this.facebook.match(facebookRegex)[1] : this.facebook,
        instagram: this.instagram.indexOf('instagram.com/') !== -1 ? this.instagram.match(instagramRegex)[1] : this.instagram
      }
      this.$store.dispatch('updateUserProfile', profileData)
      this.editProfileDialog = false
    }
  }
}
</script>
