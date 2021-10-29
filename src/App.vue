<template>
  <div id="nav">
    <router-link to="/leaderboard">Leaderboard</router-link> |
    <router-link to="/finalleaderboard">Final leaderboard</router-link> |
    <router-link to="/submit">Evaluate your service</router-link>
  </div>
  <router-view/>
</template>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

#nav {
  padding: 30px;
  font-size: 20px;
  text-align: left;
}

#nav a {
  font-weight: bold;
  color: #2c3e50;
}

#nav a.router-link-exact-active {
  color: #b12f35;
}
</style>
