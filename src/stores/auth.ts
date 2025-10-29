import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface User {
  id: string
  username: string
  registrationDate: string
}

export interface Session {
  sessionId: string
  user: string
  expiryTime: string
}

export const useAuthStore = defineStore('auth', () => {
  // State
  const currentUser = ref<User | null>(null)
  const currentSession = ref<Session | null>(null)
  const isAuthenticated = ref(false)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const isLoggedIn = computed(() => isAuthenticated.value && currentUser.value !== null)
  const userId = computed(() => currentUser.value?.id || null)
  const username = computed(() => currentUser.value?.username || null)

  // Actions
  const setUser = (user: User) => {
    currentUser.value = user
    isAuthenticated.value = true
  }

  const setSession = (session: Session) => {
    currentSession.value = session
  }

  const clearAuth = () => {
    currentUser.value = null
    currentSession.value = null
    isAuthenticated.value = false
    error.value = null
  }

  const setLoading = (loading: boolean) => {
    isLoading.value = loading
  }

  const setError = (errorMessage: string | null) => {
    error.value = errorMessage
  }

  // Persist auth state to localStorage
  const saveToStorage = () => {
    if (currentUser.value && currentSession.value) {
      localStorage.setItem('user', JSON.stringify(currentUser.value))
      localStorage.setItem('session', JSON.stringify(currentSession.value))
    }
  }

  const loadFromStorage = () => {
    const storedUser = localStorage.getItem('user')
    const storedSession = localStorage.getItem('session')
    
    if (storedUser && storedSession) {
      try {
        currentUser.value = JSON.parse(storedUser)
        currentSession.value = JSON.parse(storedSession)
        isAuthenticated.value = true
      } catch (error) {
        console.error('Error loading auth from storage:', error)
        clearAuth()
      }
    }
  }

  const clearStorage = () => {
    localStorage.removeItem('user')
    localStorage.removeItem('session')
  }

  return {
    // State
    currentUser,
    currentSession,
    isAuthenticated,
    isLoading,
    error,
    
    // Getters
    isLoggedIn,
    userId,
    username,
    
    // Actions
    setUser,
    setSession,
    clearAuth,
    setLoading,
    setError,
    saveToStorage,
    loadFromStorage,
    clearStorage
  }
})
