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
  background: linear-gradient(180deg, #E8F5E9 0%, #F1F8F4 50%, #FAFAF9 100%);
  padding: 2rem;
}

.login-card {
  background: #FFFFFF;
  border-radius: 16px;
  box-shadow: 0 12px 40px rgba(46, 125, 50, 0.15);
  padding: 3rem;
  width: 100%;
  max-width: 440px;
  position: relative;
  overflow: hidden;
  border: 2px solid #E5E7EB;
}

.login-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #2E7D32 0%, #0D9488 100%);
}

.login-header {
  text-align: center;
  margin-bottom: 2rem;
}

.login-header h1 {
  font-family: 'DM Serif Display', Georgia, serif;
  color: #2E7D32;
  font-size: 2.25rem; /* 36px - H1 */
  font-weight: 400;
  margin: 0 0 0.5rem 0;
  letter-spacing: -0.5px;
  line-height: 1.2;
}

.subtitle {
  font-family: 'Inter', sans-serif;
  color: #0F172A;
  font-size: 1rem; /* 16px */
  margin: 0;
  font-weight: 400;
  line-height: 1.45;
}

.login-form {
  margin-bottom: 2rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  color: #0F172A;
  font-weight: 600;
  font-family: 'Inter', sans-serif;
  margin-bottom: 0.5rem;
  font-size: 0.875rem; /* 14px - Small */
  letter-spacing: 0.3px;
}

.form-input {
  width: 100%;
  padding: 0.875rem 1rem;
  border: 2px solid #E5E7EB;
  border-radius: 8px;
  font-size: 1rem; /* 16px */
  font-family: 'Inter', sans-serif;
  transition: all 0.2s ease;
  background-color: #F8FAFC;
}

.form-input:focus {
  outline: none;
  border-color: #2E7D32;
  background-color: white;
  box-shadow: 0 0 0 3px rgba(46, 125, 50, 0.1);
}

.form-input:disabled {
  background-color: #f8f9fa;
  cursor: not-allowed;
  opacity: 0.7;
}

.error-message {
  background-color: #FEE2E2;
  color: #991B1B;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  border: 1px solid #FCA5A5;
  border-left: 3px solid #EF4444;
  margin-bottom: 1rem;
  font-size: 0.875rem; /* 14px - Small */
  font-family: 'Inter', sans-serif;
}

.login-button {
  width: 100%;
  background: #2E7D32;
  color: #F8FAFC;
  border: none;
  padding: 1rem 2rem;
  border-radius: 8px;
  font-size: 1rem; /* 16px */
  font-family: 'Inter', sans-serif;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  position: relative;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(46, 125, 50, 0.3);
}

.login-button:hover:not(:disabled) {
  background: #256528;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(46, 125, 50, 0.4);
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
  border-top: 1px solid #E5E7EB;
}

.login-footer p {
  font-family: 'Inter', sans-serif;
  color: #0F172A;
  margin: 0;
  font-size: 0.875rem; /* 14px - Small */
}

.link-button {
  background: none;
  border: none;
  color: #0D9488;
  font-family: 'Inter', sans-serif;
  font-weight: 600;
  cursor: pointer;
  text-decoration: underline;
  font-size: inherit;
  padding: 0;
  transition: color 0.2s ease;
}

.link-button:hover {
  color: #0A7C72;
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
    font-size: 1.75rem; /* 28px - H2 on mobile */
  }
}
</style>
