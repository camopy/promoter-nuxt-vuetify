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
                      name="name"
                      label="Nome"
                      id="name"
                      v-model="name"
                      required
                      :rules="nameRules"
                    ></v-text-field>
                  </v-flex>
                </v-layout>
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
                  <v-flex xs12>
                    <v-text-field
                      name="confirmPassword"
                      label="Confirme a senha"
                      id="confirmPassword"
                      v-model="confirmPassword"
                      type="password"
                      required
                      :rules="[comparePasswords]"
                    ></v-text-field>
                  </v-flex>
                </v-layout>
                <v-layout row>
                  <v-flex xs12>
                    <v-radio-group v-model="accountType" :rules="accountTypeRules" row>
                      <v-radio label="Divulgador" value="promoter"></v-radio>
                      <v-radio label="Organização" value="crew"></v-radio>
                    </v-radio-group>
                  </v-flex>
                </v-layout>
                <v-layout row>
                  <v-flex xs12>
                    <v-btn flat :disabled="!valid || loading" :loading="loading" @click="onSignup">
                      Registrar
                      <span slot="loader" class="custom-loader">
                        <v-icon light>cached</v-icon>
                      </span>
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
      name: '',
      nameRules: [
        v => !!v || 'Nome é obrigatório'
        // v => (v && v.length <= 10) || 'Name must be less than 10 characters'
      ],
      email: '',
      emailRules: [
        v => !!v || 'Email é obrigatório',
        v => /.+@.+/.test(v) || 'Insira um email válido'
      ],
      password: '',
      passwordRules: [
        v => !!v || 'Digite uma senha'
      ],
      confirmPassword: '',
      accountType: '',
      accountTypeRules: [
        v => !!v || 'Selecione uma das opções acima'
      ]
    }
  },

  computed: {
    comparePasswords () {
      return this.password !== this.confirmPassword ? 'As senhas estão diferentes' : true
    },
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
        this.$router.push('/events')
      }
    }
  },

  methods: {
    onSignup () {
      if (this.$refs.form.validate()) {
        this.$store.dispatch('signUserUp', {
          name: this.name,
          email: this.email,
          password: this.password,
          accountType: this.accountType})
      }
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