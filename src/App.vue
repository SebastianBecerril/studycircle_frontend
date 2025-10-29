<template>
  <div id="app">
    <header>
      <h1>StudyCircle Frontend</h1>
      <p>Welcome to your Vue.js application!</p>
    </header>
    
    <main>
      <HelloWorld msg="Hello Vue 3 + TypeScript + Vite!" />
      <ApiExample />
    </main>
  </div>
</template>

<script setup lang="ts">
import HelloWorld from './components/HelloWorld.vue'
import ApiExample from './components/ApiExample.vue'
</script>

<style scoped>
#app {
  max-width: 1280px;
  margin: 0 auto;
  padding: 2rem;
  text-align: center;
}

header {
  margin-bottom: 2rem;
}

h1 {
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

p {
  color: #7f8c8d;
  font-size: 1.1rem;
}
</style>
