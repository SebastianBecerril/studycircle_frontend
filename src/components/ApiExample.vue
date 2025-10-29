<template>
  <div class="api-example">
    <h3>Direct Axios Usage Example</h3>
    
    <div class="form-group">
      <input 
        v-model="apiUrl" 
        placeholder="Enter API URL (e.g., https://jsonplaceholder.typicode.com/posts/1)"
        class="url-input"
      />
      <button @click="makeRequest" :disabled="loading">
        {{ loading ? 'Loading...' : 'Make Request' }}
      </button>
    </div>
    
    <div v-if="error" class="error">
      <strong>Error:</strong> {{ error }}
    </div>
    
    <div v-if="response" class="response">
      <h4>Response:</h4>
      <pre>{{ JSON.stringify(response, null, 2) }}</pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import axios from 'axios'

const apiUrl = ref('https://jsonplaceholder.typicode.com/posts/1')
const response = ref(null)
const error = ref('')
const loading = ref(false)

const makeRequest = async () => {
  if (!apiUrl.value) return
  
  try {
    loading.value = true
    error.value = ''
    response.value = null
    
    const result = await axios.get(apiUrl.value)
    response.value = result.data
  } catch (err: any) {
    error.value = err.message || 'An error occurred'
    console.error('API Error:', err)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.api-example {
  margin: 2rem 0;
  padding: 1rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  background-color: #f9f9f9;
}

.form-group {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  align-items: center;
}

.url-input {
  flex: 1;
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 1rem;
}

button {
  padding: 0.5rem 1rem;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
}

button:disabled {
  background-color: #6c757d;
  cursor: not-allowed;
}

button:hover:not(:disabled) {
  background-color: #0056b3;
}

.error {
  color: #dc3545;
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
  padding: 0.75rem;
  border-radius: 4px;
  margin: 1rem 0;
}

.response {
  margin-top: 1rem;
}

.response h4 {
  margin-bottom: 0.5rem;
  color: #333;
}

pre {
  background-color: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 4px;
  padding: 1rem;
  overflow-x: auto;
  font-size: 0.9rem;
  line-height: 1.4;
}
</style>
