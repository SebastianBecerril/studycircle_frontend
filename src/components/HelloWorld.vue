<template>
  <div class="hello">
    <h2>{{ msg }}</h2>
    
    <!-- API Demo Section -->
    <div class="api-demo">
      <h3>API Demo with Axios</h3>
      <div class="card">
        <button @click="loadStudyGroups" :disabled="isLoading" type="button">
          {{ isLoading ? 'Loading...' : 'Load Study Groups' }}
        </button>
        <button @click="count++" type="button">
          Count is {{ count }}
        </button>
      </div>
      
      <div v-if="hasError" class="error">
        Error: {{ error }}
      </div>
      
      <div v-if="studyGroups.length > 0" class="groups-list">
        <h4>Study Groups ({{ groupCount }})</h4>
        <div v-for="group in studyGroups" :key="group.id" class="group-item">
          <h5>{{ group.name }}</h5>
          <p>{{ group.description }}</p>
          <small>Subject: {{ group.subject }}</small>
        </div>
      </div>
    </div>
    
    <p>
      Edit
      <code>src/components/HelloWorld.vue</code> to test HMR
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useStudyGroups } from '@/composables/useStudyGroups'

defineProps<{ msg: string }>()

const count = ref(0)

// Use the study groups composable
const {
  studyGroups,
  isLoading,
  hasError,
  error,
  groupCount,
  fetchStudyGroups
} = useStudyGroups()

const loadStudyGroups = async () => {
  try {
    await fetchStudyGroups()
  } catch (err) {
    console.error('Failed to load study groups:', err)
  }
}
</script>

<style scoped>
.hello {
  margin: 2rem 0;
}

h2 {
  color: #2c3e50;
  margin-bottom: 1rem;
}

.card {
  padding: 2em;
  margin: 1rem 0;
}

button {
  border-radius: 8px;
  border: 1px solid transparent;
  padding: 0.6em 1.2em;
  font-size: 1em;
  font-weight: 500;
  font-family: inherit;
  background-color: #1a1a1a;
  color: white;
  cursor: pointer;
  transition: border-color 0.25s;
}

button:hover {
  border-color: #646cff;
}

button:focus,
button:focus-visible {
  outline: 4px auto -webkit-focus-ring-color;
}

code {
  background-color: #f4f4f4;
  padding: 0.2em 0.4em;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
}

.api-demo {
  margin: 2rem 0;
  padding: 1rem;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background-color: #fafafa;
}

.api-demo h3 {
  color: #2c3e50;
  margin-bottom: 1rem;
}

.error {
  color: #e74c3c;
  background-color: #fdf2f2;
  padding: 0.5rem;
  border-radius: 4px;
  margin: 1rem 0;
  border: 1px solid #fecaca;
}

.groups-list {
  margin-top: 1rem;
}

.group-item {
  background-color: white;
  padding: 1rem;
  margin: 0.5rem 0;
  border-radius: 6px;
  border: 1px solid #e0e0e0;
  text-align: left;
}

.group-item h5 {
  margin: 0 0 0.5rem 0;
  color: #2c3e50;
}

.group-item p {
  margin: 0 0 0.5rem 0;
  color: #7f8c8d;
}

.group-item small {
  color: #95a5a6;
  font-style: italic;
}
</style>
