<template>
  <v-container>
    <v-layout row v-if="error">
      <v-flex xs12 sm6 offset-sm3>
        <app-alert @dismissed="onDismissed" :text="error.message"></app-alert>
      </v-flex>
    </v-layout>
    <v-layout row>
      <v-flex xs12 sm6 offset-sm3>
        <v-card>
          <v-card-text>
            <v-container>
              <v-form ref="form" v-model="valid" lazy-validation>                
                <v-layout row>
                  <v-flex xs12>
                    <v-text-field
                      name="email"
                      label="Email"
                      id="email"
                      v-model="email"
                      type="email"
                      required
                      :rules="emailRules"
                    ></v-text-field>
                  </v-flex>
                </v-layout>
                <v-layout row>
                  <v-flex xs12>
                    <v-text-field
                      name="password"
                      label="Senha"
                      id="password"
                      v-model="password"
                      type="password"
                      required
                      :rules="passwordRules"
                    ></v-text-field>
                  </v-flex>
                </v-layout>                
                <v-layout row>
                  <v-flex xs12 sm6>                     
                    <v-btn flat :disabled="!valid || loading" :loading="loading" @click="onSignin">
                      Entrar
                      <span slot="loader" class="custom-loader">
                        <v-icon light>cached</v-icon>
                      </span>
                    </v-btn>                    
                  </v-flex>
                  <v-spacer></v-spacer>
                  <v-flex xs12 sm6>                     
                    <v-btn flat @click="onSignup">
                      Criar conta                      
                    </v-btn>                    
                  </v-flex>
                </v-layout>
              </v-form>
            </v-container>
          </v-card-text>
        </v-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
export default {
  data () {
    return {
      valid: true,
      email: '',
      emailRules: [
        v => !!v || 'Digite seu email',
        v => /.+@.+/.test(v) || 'Insira um email válido'
      ],
      password: '',
      passwordRules: [
        v => !!v || 'Digite sua senha'
      ]
    }
  },

  computed: {
    user () {
      return this.$store.getters.user
    },
    error () {
      return this.$store.getters.error
    },
    loading () {
      return this.$store.getters.loading
    }
  },

  watch: {
    user (value) {
      if (value !== null & value !== undefined) {
        this.$router.push('/tasks')
      }
    }
  },

  methods: {
    onSignin () {
      if (this.$refs.form.validate()) {
        this.$store.dispatch('signUserIn', {email: this.email, password: this.password})
      }
    },
    onSignup () {
      this.$router.push('/signup')
    },
    onDismissed () {
      this.$store.dispatch('clearError')
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