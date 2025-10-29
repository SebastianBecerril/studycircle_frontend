<template>
  <div class="home">
    <h2>Welcome to StudyCircle</h2>
    <p>Your study circle application is ready for development!</p>
    
    <!-- TODO: Add your main application content here -->
    <div class="api-status">
      <h3>API Status</h3>
      <p>Backend URL: {{ apiBaseUrl }}</p>
      <button @click="testConnection" :disabled="testing">
        {{ testing ? 'Testing...' : 'Test API Connection' }}
      </button>
      <div v-if="connectionStatus" class="status-message">
        {{ connectionStatus }}
      </div>
    </div>

    <!-- Pinia Stores Status -->
    <div class="stores-demo">
      <h3>Pinia Stores Status</h3>
      <div class="store-status">
        <div class="store-item">
          <strong>Auth Store:</strong> 
          <span :class="{ 'status-active': auth.isLoggedIn, 'status-inactive': !auth.isLoggedIn }">
            {{ auth.isLoggedIn ? 'Logged In' : 'Not Logged In' }}
          </span>
        </div>
        <div class="store-item">
          <strong>User Profile:</strong> 
          <span :class="{ 'status-active': userProfile.hasProfile, 'status-inactive': !userProfile.hasProfile }">
            {{ userProfile.hasProfile ? 'Profile Created' : 'No Profile' }}
          </span>
        </div>
        <div class="store-item">
          <strong>Communities:</strong> 
          <span class="status-info">{{ community.communities.length }} communities</span>
        </div>
        <div class="store-item">
          <strong>Posts:</strong> 
          <span class="status-info">{{ communityBoard.posts.length }} posts</span>
        </div>
        <div class="store-item">
          <strong>Courses:</strong> 
          <span class="status-info">{{ courseCatalog.courses.length }} courses</span>
        </div>
        <div class="store-item">
          <strong>Enrollments:</strong> 
          <span class="status-info">{{ userEnrollments.enrollments.length }} enrollments</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useStores } from '@/composables/useStores'
import { studyCircleApi } from '@/services/studyCircleApi'
import axios from 'axios'

const apiBaseUrl = 'http://localhost:8000/'
const testing = ref(false)
const connectionStatus = ref('')

// Access Pinia stores
const { auth, userProfile, community, communityBoard, courseCatalog, userEnrollments } = useStores()

const testConnection = async () => {
  testing.value = true
  connectionStatus.value = 'Testing API connection...'
  
  try {
    // Test using the corrected API service
    await studyCircleApi.getTerms()
    connectionStatus.value = '✅ API connection successful!'
  } catch (error: any) {
    console.error('API Error Details:', error)
    if (error.response) {
      connectionStatus.value = `❌ Backend responded with error: ${error.response.status} - ${error.response.data?.error || error.message}`
    } else {
      connectionStatus.value = `❌ API connection failed: ${error.message}`
    }
  } finally {
    testing.value = false
  }
}

// Initialize stores on component mount
onMounted(() => {
  // Load auth state from localStorage
  auth.loadFromStorage()
})
</script>

<style scoped>
.home {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.welcome-section {
  text-align: center;
  margin-bottom: 3rem;
}

.welcome-section h2 {
  font-size: 2.5rem;
  font-weight: 700;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 1rem;
}

.welcome-section p {
  color: #4a5568;
  font-size: 1.2rem;
  margin-bottom: 0;
}

.api-status {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  padding: 2rem;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  margin-bottom: 2rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.api-status h3 {
  color: #2d3748;
  margin-bottom: 1rem;
  font-size: 1.5rem;
  font-weight: 600;
}

.api-status p {
  color: #4a5568;
  margin-bottom: 1rem;
  font-size: 1rem;
}

button {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
}

button:disabled {
  background: #a0aec0;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.status-message {
  margin-top: 1rem;
  padding: 1rem;
  border-radius: 8px;
  font-weight: 500;
  border-left: 4px solid;
}

.status-message:has-text("✅") {
  background: linear-gradient(135deg, #c6f6d5 0%, #9ae6b4 100%);
  color: #22543d;
  border-left-color: #48bb78;
}

.status-message:has-text("❌") {
  background: linear-gradient(135deg, #fed7d7 0%, #feb2b2 100%);
  color: #742a2a;
  border-left-color: #f56565;
}

.stores-demo {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  padding: 2rem;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.stores-demo h3 {
  color: #2d3748;
  margin-bottom: 1.5rem;
  font-size: 1.5rem;
  font-weight: 600;
  text-align: center;
}

.store-status {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.store-item {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.store-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.store-item strong {
  color: #2d3748;
  font-size: 1rem;
  font-weight: 600;
}

.status-active {
  color: #38a169;
  font-weight: 600;
  background: linear-gradient(135deg, #c6f6d5 0%, #9ae6b4 100%);
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  display: inline-block;
  font-size: 0.875rem;
}

.status-inactive {
  color: #718096;
  font-weight: 500;
  background: linear-gradient(135deg, #e2e8f0 0%, #cbd5e0 100%);
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  display: inline-block;
  font-size: 0.875rem;
}

.status-info {
  color: #667eea;
  font-weight: 600;
  background: linear-gradient(135deg, #e6fffa 0%, #b2f5ea 100%);
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  display: inline-block;
  font-size: 0.875rem;
}

/* Responsive design */
@media (max-width: 768px) {
  .home {
    padding: 1rem;
  }
  
  .welcome-section h2 {
    font-size: 2rem;
  }
  
  .welcome-section p {
    font-size: 1rem;
  }
  
  .api-status, .stores-demo {
    padding: 1.5rem;
  }
  
  .store-status {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
}
</style>
