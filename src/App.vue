<template>
  <div id="app">
    <header>
      <h1>StudyCircle</h1>
      <nav>
        <router-link to="/">Home</router-link>
        <router-link to="/community">Communities</router-link>
        <router-link to="/courses">Courses</router-link>
        
        <!-- Login button for non-logged-in users -->
        <router-link v-if="!isLoggedIn" to="/login" class="login-link">Sign In</router-link>
        
        <!-- User menu dropdown for logged-in users -->
        <div v-else class="user-menu" @click="toggleUserMenu" v-click-outside="closeUserMenu">
          <div class="user-menu-trigger">
            <div class="user-avatar">
              <img 
                v-if="userProfile.currentProfile?.thumbnailImageURL" 
                :src="userProfile.currentProfile.thumbnailImageURL" 
                alt="Profile"
                @error="avatarError = true"
              />
              <span v-else class="avatar-initials">
                {{ getInitials() }}
              </span>
            </div>
            <span class="user-name">{{ getDisplayName() }}</span>
            <span class="dropdown-icon">▼</span>
          </div>
          
          <transition name="dropdown">
            <div v-if="showUserMenu" class="user-menu-dropdown">
              <router-link to="/profile" class="menu-item" @click="closeUserMenu">
                <span class="menu-icon">👤</span>
                <span>View Profile</span>
              </router-link>
              <div class="menu-divider"></div>
              <button @click="handleLogout" class="menu-item logout-item">
                <span class="menu-icon">🚪</span>
                <span>Sign Out</span>
              </button>
            </div>
          </transition>
        </div>
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
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useUserProfileStore } from '@/stores/userProfile'

const router = useRouter()
const auth = useAuthStore()
const userProfile = useUserProfileStore()

const isLoggedIn = computed(() => auth.isLoggedIn)
const showUserMenu = ref(false)
const avatarError = ref(false)

const getInitials = () => {
  if (userProfile.currentProfile?.displayName) {
    const name = userProfile.currentProfile.displayName
    const parts = name.trim().split(' ')
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    }
    return name[0].toUpperCase()
  }
  return '?'
}

const getDisplayName = () => {
  return userProfile.currentProfile?.displayName || 'User'
}

const toggleUserMenu = () => {
  showUserMenu.value = !showUserMenu.value
}

const closeUserMenu = () => {
  showUserMenu.value = false
}

const handleLogout = async () => {
  closeUserMenu()
  
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
  userProfile.clearProfile()
  router.push('/login')
}

// Load auth state and profile on app start
onMounted(async () => {
  auth.loadFromStorage()
  
  // If user is logged in, fetch their profile
  if (auth.isLoggedIn && auth.userId) {
    try {
      await userProfile.fetchProfileByUser(auth.userId)
    } catch (error) {
      console.error('Failed to load user profile:', error)
    }
  }
})

// Click outside directive (inline implementation)
const vClickOutside = {
  mounted(el: any, binding: any) {
    el.clickOutsideEvent = (event: Event) => {
      if (!(el === event.target || el.contains(event.target))) {
        binding.value()
      }
    }
    document.addEventListener('click', el.clickOutsideEvent)
  },
  unmounted(el: any) {
    document.removeEventListener('click', el.clickOutsideEvent)
  }
}
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

/* User Menu */
.user-menu {
  position: relative;
  cursor: pointer;
}

.user-menu-trigger {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  padding: 0.375rem 0.75rem;
  border-radius: 8px;
  transition: all 0.2s ease;
  background: #fafaf9;
  border: 2px solid #e7e5e4;
}

.user-menu-trigger:hover {
  background: #fef3c7;
  border-color: #d97706;
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  overflow: hidden;
  background: linear-gradient(135deg, #fde68a 0%, #fcd34d 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #e7e5e4;
  flex-shrink: 0;
}

.user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-initials {
  font-size: 0.875rem;
  font-weight: 700;
  color: #92400e;
  font-family: 'Sora', sans-serif;
}

.user-name {
  font-weight: 600;
  color: #1c1917;
  font-size: 0.9375rem;
  max-width: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dropdown-icon {
  font-size: 0.625rem;
  color: #78716c;
  transition: transform 0.2s ease;
}

.user-menu-trigger:hover .dropdown-icon {
  transform: translateY(1px);
}

.user-menu-dropdown {
  position: absolute;
  top: calc(100% + 0.5rem);
  right: 0;
  background: white;
  border: 2px solid #e7e5e4;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  min-width: 200px;
  overflow: hidden;
  z-index: 1000;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem 1.25rem;
  width: 100%;
  border: none;
  background: white;
  color: #1c1917;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.9375rem;
  font-weight: 500;
  text-align: left;
  font-family: inherit;
}

.menu-item:hover {
  background: #fef3c7;
}

.menu-icon {
  font-size: 1.125rem;
  flex-shrink: 0;
}

.menu-divider {
  height: 1px;
  background: #e7e5e4;
  margin: 0;
}

.logout-item {
  color: #7c2d12;
}

.logout-item:hover {
  background: #fef2f2;
}

/* Dropdown transition */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-8px);
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

  .user-menu-dropdown {
    right: auto;
    left: 50%;
    transform: translateX(-50%);
  }

  .user-name {
    max-width: 100px;
  }
  
  main {
    padding: 1rem;
  }
}
</style>