<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-header">
        <h1>StudyCircle</h1>
        <p class="subtitle">Connect with your academic community</p>
      </div>

      <form @submit.prevent="handleSubmit" class="login-form">
        <div class="form-group">
          <label for="username">Username</label>
          <input
            id="username"
            v-model="form.username"
            type="text"
            required
            :disabled="isLoading"
            placeholder="Enter your username"
            class="form-input"
          />
        </div>

        <div class="form-group">
          <label for="password">Password</label>
          <input
            id="password"
            v-model="form.password"
            type="password"
            required
            :disabled="isLoading"
            placeholder="Enter your password"
            class="form-input"
          />
        </div>

        <div v-if="error" class="error-message">
          {{ error }}
        </div>

        <button 
          type="submit" 
          :disabled="isLoading || !isFormValid"
          class="login-button"
        >
          <span v-if="isLoading" class="loading-spinner"></span>
          {{ isLoading ? 'Signing in...' : 'Sign In' }}
        </button>
      </form>

      <div class="login-footer">
        <p>Don't have an account? 
          <button @click="toggleMode" class="link-button">
            {{ isLoginMode ? 'Create one' : 'Sign in instead' }}
          </button>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { studyCircleApi } from '@/services/studyCircleApi'

const router = useRouter()
const auth = useAuthStore()

// Form state
const form = ref({
  username: '',
  password: ''
})

const isLoginMode = ref(true)
const isLoading = ref(false)
const error = ref('')

// Computed
const isFormValid = computed(() => {
  return form.value.username.trim() !== '' && form.value.password.trim() !== ''
})

// Methods
const toggleMode = () => {
  isLoginMode.value = !isLoginMode.value
  error.value = ''
  form.value = { username: '', password: '' }
}

const handleSubmit = async () => {
  if (!isFormValid.value) return

  isLoading.value = true
  error.value = ''

  try {
    if (isLoginMode.value) {
      // Login
      const response = await studyCircleApi.login(form.value.username, form.value.password)
      
      // Update auth store
      auth.setUser({
        id: response.user,
        username: form.value.username,
        registrationDate: new Date().toISOString()
      })
      
      auth.setSession({
        sessionId: response.sessionId,
        user: response.user,
        expiryTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
      })
      
      auth.saveToStorage()
      
      // Redirect to home
      router.push('/')
    } else {
      // Register
      const response = await studyCircleApi.register(form.value.username, form.value.password)
      
      // Auto-login after registration
      const loginResponse = await studyCircleApi.login(form.value.username, form.value.password)
      
      auth.setUser({
        id: loginResponse.user,
        username: form.value.username,
        registrationDate: new Date().toISOString()
      })
      
      auth.setSession({
        sessionId: loginResponse.sessionId,
        user: loginResponse.user,
        expiryTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      })
      
      auth.saveToStorage()
      
      // Redirect to profile setup
      router.push('/profile')
    }
  } catch (err: any) {
    error.value = err.response?.data?.error || 'An error occurred. Please try again.'
    console.error('Auth error:', err)
  } finally {
    isLoading.value = false
  }
}

// Check if already logged in
onMounted(() => {
  auth.loadFromStorage()
  if (auth.isLoggedIn) {
    router.push('/')
  }
})
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem;
}

.login-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  padding: 3rem;
  width: 100%;
  max-width: 400px;
  position: relative;
  overflow: hidden;
}

.login-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #667eea, #764ba2);
}

.login-header {
  text-align: center;
  margin-bottom: 2rem;
}

.login-header h1 {
  color: #2c3e50;
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  letter-spacing: -0.5px;
}

.subtitle {
  color: #7f8c8d;
  font-size: 1rem;
  margin: 0;
  font-weight: 400;
}

.login-form {
  margin-bottom: 2rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  color: #2c3e50;
  font-weight: 600;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}

.form-input {
  width: 100%;
  padding: 0.875rem 1rem;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.2s ease;
  background-color: #fafbfc;
}

.form-input:focus {
  outline: none;
  border-color: #667eea;
  background-color: white;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-input:disabled {
  background-color: #f8f9fa;
  cursor: not-allowed;
  opacity: 0.7;
}

.error-message {
  background-color: #f8d7da;
  color: #721c24;
  padding: 0.75rem 1rem;
  border-radius: 6px;
  border: 1px solid #f5c6cb;
  margin-bottom: 1rem;
  font-size: 0.9rem;
}

.login-button {
  width: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  position: relative;
  overflow: hidden;
}

.login-button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
}

.login-button:active:not(:disabled) {
  transform: translateY(0);
}

.login-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.login-footer {
  text-align: center;
  padding-top: 1rem;
  border-top: 1px solid #e9ecef;
}

.login-footer p {
  color: #6c757d;
  margin: 0;
  font-size: 0.9rem;
}

.link-button {
  background: none;
  border: none;
  color: #667eea;
  font-weight: 600;
  cursor: pointer;
  text-decoration: underline;
  font-size: inherit;
  padding: 0;
}

.link-button:hover {
  color: #764ba2;
}

/* Responsive design */
@media (max-width: 480px) {
  .login-container {
    padding: 1rem;
  }
  
  .login-card {
    padding: 2rem;
  }
  
  .login-header h1 {
    font-size: 2rem;
  }
}
</style>
