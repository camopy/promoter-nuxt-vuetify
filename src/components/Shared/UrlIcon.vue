<template>
  <v-icon @click="visitUrl()">{{icon}}</v-icon>
</template>

<script>
export default {
  props: ['url', 'icon'],
  methods: {
    visitUrl () {
      window.open(this.url, '_blank')
    }
  }
}
</script>