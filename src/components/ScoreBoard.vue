<template>
  <h1>This is a score board</h1>
  <p>{{ name }}</p>
</template>

<script>
export default {
    computed: {
        name: {
            get: function () {
                return 'Hello ' + String(4) 
            }
        }
    } 
}
</script>