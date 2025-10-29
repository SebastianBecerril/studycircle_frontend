<template>
  <div id="app">
    <header>
      <h1>StudyCircle</h1>
      <nav>
        <router-link to="/">Home</router-link>
        <router-link to="/community">Communities</router-link>
        <router-link to="/courses">Courses</router-link>
        <router-link v-if="!isLoggedIn" to="/login" class="login-link">Sign In</router-link>
        <button v-else @click="handleLogout" class="logout-button">Sign Out</button>
      </nav>
    </header>
    
    <main>
      <router-view />
    </main>
    
    <footer>
      <!-- TODO: Add footer content if needed -->
    </footer>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const auth = useAuthStore()

const isLoggedIn = computed(() => auth.isLoggedIn)

const handleLogout = async () => {
  if (auth.currentSession?.sessionId) {
    try {
      // Call the API logout function
      const { studyCircleApi } = await import('@/services/studyCircleApi')
      await studyCircleApi.logout(auth.currentSession.sessionId)
    } catch (error) {
      console.error('Logout error:', error)
    }
  }
  auth.clearAuth()
  auth.clearStorage()
  router.push('/login')
}

// Load auth state on app start
onMounted(() => {
  auth.loadFromStorage()
})
</script>

<style scoped>
#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: transparent;
}

header {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

header h1 {
  margin: 0;
  font-size: 1.75rem;
  font-weight: 700;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

nav {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

nav a {
  color: #4a5568;
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  transition: all 0.2s ease;
  font-weight: 500;
  position: relative;
}

nav a:hover {
  background-color: #f7fafc;
  color: #667eea;
  transform: translateY(-1px);
}

nav a.router-link-active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 2px 4px rgba(102, 126, 234, 0.3);
}

.login-link {
  background: linear-gradient(135deg, #48bb78 0%, #38a169 100%) !important;
  color: white !important;
  font-weight: 600;
  box-shadow: 0 2px 4px rgba(72, 187, 120, 0.3);
}

.login-link:hover {
  background: linear-gradient(135deg, #38a169 0%, #2f855a 100%) !important;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(72, 187, 120, 0.4);
}

.logout-button {
  background: linear-gradient(135deg, #f56565 0%, #e53e3e 100%);
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(245, 101, 101, 0.3);
}

.logout-button:hover {
  background: linear-gradient(135deg, #e53e3e 0%, #c53030 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(245, 101, 101, 0.4);
}

main {
  flex: 1;
  padding: 2rem;
  background: transparent;
}

footer {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  padding: 1rem 2rem;
  text-align: center;
  color: #718096;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
}

/* Responsive design */
@media (max-width: 768px) {
  header {
    padding: 1rem;
    flex-direction: column;
    gap: 1rem;
  }
  
  header h1 {
    font-size: 1.5rem;
  }
  
  nav {
    flex-wrap: wrap;
    justify-content: center;
  }
  
  main {
    padding: 1rem;
  }
}
</style>