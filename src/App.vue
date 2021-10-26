<template>
  <ScoreBoard/>
  <Submit/>
</template>

<script>
import Submit from './components/Submit.vue'
import ScoreBoard from './components/ScoreBoard.vue'

export default {
  name: 'App',
  components: {
    Submit,
    ScoreBoard
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
