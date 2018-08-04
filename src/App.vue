<template>
  <v-app id="inspire" dark>
    <v-navigation-drawer
      :clipped="$vuetify.breakpoint.lgAndUp"
      v-model="drawer"
      fixed
      app
    >
      <v-list dense>
        <template v-for="item in items">
          <v-layout
            v-if="item.heading"
            :key="item.heading"
            row
            align-center
          >
            <v-flex xs6>
              <v-subheader v-if="item.heading">
                {{ item.heading }}
              </v-subheader>
            </v-flex>
            <v-flex xs6 class="text-xs-center">
              <a href="#!" class="body-2 black--text">EDIT</a>
            </v-flex>
          </v-layout>
          <v-list-group
            v-else-if="item.children"
            v-model="item.model"
            :key="item.text"
            :prepend-icon="item.model ? item.icon : item['icon-alt']"
            append-icon=""
          >
            <v-list-tile slot="activator">
              <v-list-tile-content>
                <v-list-tile-title>
                  {{ item.text }}
                </v-list-tile-title>
              </v-list-tile-content>
            </v-list-tile>
            <v-list-tile
              v-for="(child, i) in item.children"
              :key="i"
              :to="child.to"
            >
              <v-list-tile-action v-if="child.icon">
                <v-icon>{{ child.icon }}</v-icon>
              </v-list-tile-action>
              <v-list-tile-content>
                <v-list-tile-title>
                  {{ child.text }}
                </v-list-tile-title>
              </v-list-tile-content>
            </v-list-tile>
          </v-list-group>
          <v-list-tile v-else :key="item.text" :to="item.to">
            <v-list-tile-action>
              <v-icon>{{ item.icon }}</v-icon>
            </v-list-tile-action>
            <v-list-tile-content>
              <v-list-tile-title>
                {{ item.text }}
              </v-list-tile-title>
            </v-list-tile-content>
          </v-list-tile>
        </template>
        <v-list-tile
          v-if="userIsAuthenticated"
          @click="onLogout"
        >
          <v-list-tile-action>
            <v-icon>exit_to_app</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title>
              Sair
            </v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
      </v-list>
    </v-navigation-drawer>
    <v-toolbar
      :clipped-left="$vuetify.breakpoint.lgAndUp"
      color="blue darken-3"
      dark
      app
      fixed
    >
      <v-toolbar-title style="width: 300px" class="ml-0 pl-3">
        <v-toolbar-side-icon @click.stop="drawer = !drawer"></v-toolbar-side-icon>
        <span class="hidden-sm-and-down">Promote</span>
      </v-toolbar-title>
      <v-text-field
        flat
        solo-inverted
        hide-details
        prepend-inner-icon="search"
        label="Search"
        class="hidden-sm-and-down"
      ></v-text-field>
      <v-spacer></v-spacer>
      <v-btn icon>
        <v-icon>apps</v-icon>
      </v-btn>
      <v-btn icon>
        <v-icon>notifications</v-icon>
      </v-btn>
      <v-btn icon large>
        <v-avatar size="32px" tile>
          <img
            src="https://cdn.vuetifyjs.com/images/logos/logo.svg"
            alt="Vuetify"
          >
        </v-avatar>
      </v-btn>
    </v-toolbar>
    <v-content>
      <v-container fluid>
        <v-layout justify-center align-center>
          <router-view></router-view>          
        </v-layout>
      </v-container>
    </v-content>
    <v-btn
      fab
      bottom
      right
      color="pink"
      dark
      fixed
      @click.stop="dialog = !dialog"
      v-if="userIsAuthenticated && userIsCrew"
    >
      <v-icon>add</v-icon>
    </v-btn>
    <CreateEvent :visible="dialog" @close="dialog=false"></CreateEvent>
  </v-app>
</template>

<script>
  import CreateEvent from '@/components/event/CreateEvent'

  export default {
    components: {
      CreateEvent
    },
    data: () => ({
      dialog: false,
      drawer: null
    }),
    computed: {
      items () {
        let items = [
          { icon: 'event_available', text: 'Eventos', to: '/events' },
          { icon: 'group', text: 'Organizações', to: '/crew' },
          { icon: 'directions_walk', text: 'Entrar', to: '/signin' }
        ]
        if (this.userIsAuthenticated && this.userIsCrew) {
          items = [
            { icon: 'assignment', text: 'Missões', to: '/tasks' },
            { icon: 'event_available', text: 'Eventos', to: '/events' },
            { icon: 'group', text: 'Organizações', to: '/crew' },
            { icon: 'person', text: 'Divulgadores', to: '/promoters' },
            {
              icon: 'keyboard_arrow_up',
              'icon-alt': 'keyboard_arrow_down',
              text: 'Meu Painel',
              model: true,
              children: [
                { icon: 'portrait', text: 'Perfil', to: '/profile' },
                { icon: 'event_notes', text: 'Meus Eventos', to: '/myevents' }
              ]
            }
          ]
        } else if (this.userIsAuthenticated) {
          items = [
            { icon: 'assignment', text: 'Missões', to: '/tasks' },
            { icon: 'event_available', text: 'Eventos', to: '/events' },
            { icon: 'group', text: 'Organizações', to: '/crew' },
            { icon: 'person', text: 'Divulgadores', to: '/promoters' },
            {
              icon: 'keyboard_arrow_up',
              'icon-alt': 'keyboard_arrow_down',
              text: 'Meu Painel',
              model: true,
              children: [
                { icon: 'portrait', text: 'Perfil', to: '/profile' }
              ]
            }
          ]
        }
        return items
      },
      userIsAuthenticated () {
        return this.$store.getters.user !== null && this.$store.getters.user !== undefined
      },
      userIsCrew () {
        return this.$store.getters.user.accountType === 'crew'
      }
    },
    props: {
      source: String
    },
    methods: {
      onLogout () {
        this.$store.dispatch('logout')
        this.$router.push('/signin')
      }
    }
  }
</script>