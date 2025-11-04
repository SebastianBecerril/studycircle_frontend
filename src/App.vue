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
  background: #ffffff;
  border-bottom: 2px solid #e7e5e4;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

header h1 {
  margin: 0;
  font-size: 1.75rem;
  font-weight: 800;
  color: #7c2d12;
  font-family: 'Sora', sans-serif;
  letter-spacing: -0.5px;
  position: relative;
  display: inline-block;
}

header h1::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 30%;
  height: 2px;
  background: linear-gradient(to right, #7c2d12, #1e3a8a);
  border-radius: 2px;
}

nav {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

nav a {
  color: #78716c;
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  transition: all 0.2s ease;
  font-weight: 500;
  position: relative;
}

nav a:hover {
  background-color: #fef3c7;
  color: #1c1917;
}

nav a.router-link-active {
  background: #7c2d12;
  color: white;
  box-shadow: 0 2px 4px rgba(124, 45, 18, 0.2);
}

.login-link {
  background: #1e3a8a !important;
  color: white !important;
  font-weight: 600;
  box-shadow: 0 2px 4px rgba(30, 58, 138, 0.2);
}

.login-link:hover {
  background: #1e40af !important;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(30, 58, 138, 0.3);
}

.logout-button {
  background: #292524;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.2s ease;
}

.logout-button:hover {
  background: #1c1917;
}

main {
  flex: 1;
  padding: 2rem;
  background: transparent;
}

footer {
  background: #ffffff;
  padding: 1rem 2rem;
  text-align: center;
  color: #78716c;
  border-top: 2px solid #e7e5e4;
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