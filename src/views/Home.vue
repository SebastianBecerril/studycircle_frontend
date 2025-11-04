<template>
  <div class="home">
    <!-- Hero Section -->
    <section class="hero">
      <div class="hero-content">
        <h1 class="hero-title">Find Your Study Circle</h1>
        <p class="hero-subtitle">
          Connect with classmates, share schedules, and build study groups within your communities.
        </p>
        <div class="hero-actions">
          <router-link to="/community" class="btn btn-primary">
            Browse Communities
          </router-link>
          <router-link to="/classes" class="btn btn-secondary">
            Add Your Classes
          </router-link>
        </div>
      </div>
    </section>

    <!-- Quick Stats -->
    <section class="stats-section">
      <h2 class="section-title">Your Dashboard</h2>
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon communities-icon">👥</div>
          <div class="stat-content">
            <div class="stat-number">{{ community.communities.length }}</div>
            <div class="stat-label">Communities</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon posts-icon">💬</div>
          <div class="stat-content">
            <div class="stat-number">{{ communityBoard.posts.length }}</div>
            <div class="stat-label">Posts</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon courses-icon">📚</div>
          <div class="stat-content">
            <div class="stat-number">{{ courseCatalog.courses.length }}</div>
            <div class="stat-label">Courses</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon enrollments-icon">✓</div>
          <div class="stat-content">
            <div class="stat-number">{{ userEnrollments.enrollments.length }}</div>
            <div class="stat-label">Enrollments</div>
          </div>
        </div>
      </div>
    </section>

    <!-- API Status (Developer Tools) -->
    <section class="dev-section">
      <details class="dev-tools">
        <summary class="dev-tools-header">Developer Tools</summary>
        <div class="dev-tools-content">
          <div class="api-status">
            <h3>API Connection</h3>
            <p class="api-url">Backend: <code>{{ apiBaseUrl }}</code></p>
            <button @click="testConnection" :disabled="testing" class="btn btn-test">
              {{ testing ? 'Testing...' : 'Test Connection' }}
            </button>
            <div v-if="connectionStatus" class="status-message" :class="connectionStatus.includes('✅') ? 'success' : 'error'">
              {{ connectionStatus }}
            </div>
          </div>
          
          <div class="store-status">
            <h3>Store Status</h3>
            <div class="store-grid">
              <div class="store-item">
                <span class="store-label">Auth:</span>
                <span :class="auth.isLoggedIn ? 'badge-success' : 'badge-inactive'">
                  {{ auth.isLoggedIn ? 'Active' : 'Inactive' }}
                </span>
              </div>
              <div class="store-item">
                <span class="store-label">Profile:</span>
                <span :class="userProfile.hasProfile ? 'badge-success' : 'badge-inactive'">
                  {{ userProfile.hasProfile ? 'Active' : 'Inactive' }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </details>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useStores } from '@/composables/useStores'
import { studyCircleApi } from '@/services/studyCircleApi'

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
/* Modern Academic Design System */
.home {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0;
}

/* Hero Section */
.hero {
  background: linear-gradient(135deg, #7c2d12 0%, #92400e 100%);
  padding: 5rem 2rem;
  text-align: center;
  margin-bottom: 0;
  position: relative;
  box-shadow: 0 4px 20px rgba(124, 45, 18, 0.15);
}

.hero::after {
  content: '';
  position: absolute;
  bottom: -40px;
  left: 50%;
  transform: translateX(-50%);
  width: 80%;
  height: 40px;
  background: linear-gradient(180deg, rgba(124, 45, 18, 0.05) 0%, transparent 100%);
  border-radius: 0 0 50% 50%;
  pointer-events: none;
}

.hero-content {
  max-width: 700px;
  margin: 0 auto;
}

.hero-title {
  font-family: 'Sora', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: 3.5rem;
  font-weight: 800;
  color: #ffffff;
  margin: 0 0 1rem 0;
  letter-spacing: -1px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.hero-subtitle {
  font-size: 1.25rem;
  color: rgba(255, 255, 255, 0.9);
  margin: 0 0 2rem 0;
  line-height: 1.6;
  font-weight: 400;
}

.hero-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

/* Buttons */
.btn {
  padding: 0.875rem 2rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 1rem;
  text-decoration: none;
  transition: all 0.2s ease;
  border: 2px solid transparent;
  display: inline-block;
  font-family: 'Inter', sans-serif;
}

.btn-primary {
  background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%);
  color: #ffffff;
  box-shadow: 0 4px 12px rgba(30, 58, 138, 0.4);
  font-weight: 600;
  position: relative;
  overflow: hidden;
}

.btn-primary::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s ease;
}

.btn-primary:hover::before {
  left: 100%;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(30, 58, 138, 0.5);
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.2);
  color: #ffffff;
  border: 2px solid rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(10px);
  font-weight: 600;
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.3);
  border-color: rgba(255, 255, 255, 0.8);
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
}

.btn-test {
  background-color: #292524;
  color: #ffffff;
  padding: 0.625rem 1.25rem;
  font-size: 0.875rem;
}

.btn-test:hover:not(:disabled) {
  background-color: #1c1917;
  transform: translateY(-1px);
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

/* Stats Section */
.stats-section {
  padding: 4rem 2rem 3rem;
  background: linear-gradient(180deg, transparent 0%, rgba(255, 255, 255, 0.4) 100%);
  position: relative;
  margin-top: -20px;
}

.section-title {
  font-family: 'Sora', sans-serif;
  font-size: 2rem;
  font-weight: 700;
  color: #7c2d12;
  margin: 0 0 2rem 0;
  position: relative;
  padding-bottom: 1rem;
  text-align: center;
}

.section-title::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 80px;
  height: 4px;
  background: linear-gradient(to right, #7c2d12, #1e3a8a, #d97706);
  border-radius: 2px;
  box-shadow: 0 2px 4px rgba(124, 45, 18, 0.2);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 2rem;
  max-width: 1100px;
  margin: 0 auto;
}

.stat-card {
  background: linear-gradient(145deg, #ffffff 0%, #fefdfb 100%);
  border: 2px solid #e7e5e4;
  border-radius: 16px;
  padding: 2rem;
  display: flex;
  align-items: center;
  gap: 1.5rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #7c2d12 0%, #1e3a8a 50%, #d97706 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.stat-card::after {
  content: '';
  position: absolute;
  bottom: -50%;
  right: -10%;
  width: 150px;
  height: 150px;
  background: radial-gradient(circle, rgba(124, 45, 18, 0.03) 0%, transparent 70%);
  border-radius: 50%;
  pointer-events: none;
}

.stat-card:hover::before {
  opacity: 1;
}

.stat-card:hover {
  border-color: #7c2d12;
  transform: translateY(-6px) scale(1.02);
  box-shadow: 0 12px 24px rgba(124, 45, 18, 0.12), 0 0 0 1px rgba(124, 45, 18, 0.05);
}

.stat-icon {
  font-size: 2.75rem;
  width: 72px;
  height: 72px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 16px;
  flex-shrink: 0;
  position: relative;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transition: transform 0.3s ease;
}

.stat-card:hover .stat-icon {
  transform: scale(1.1) rotate(-5deg);
}

.communities-icon {
  background: linear-gradient(135deg, #fecaca 0%, #fca5a5 100%);
  color: #7c2d12;
  border: 2px solid #fee2e2;
}

.posts-icon {
  background: linear-gradient(135deg, #bfdbfe 0%, #93c5fd 100%);
  color: #1e3a8a;
  border: 2px solid #dbeafe;
}

.courses-icon {
  background: linear-gradient(135deg, #fde68a 0%, #fcd34d 100%);
  color: #92400e;
  border: 2px solid #fef3c7;
}

.enrollments-icon {
  background: linear-gradient(135deg, #fbcfe8 0%, #f9a8d4 100%);
  color: #be185d;
  border: 2px solid #fce7f3;
}

.stat-content {
  flex: 1;
}

.stat-number {
  font-family: 'Space Mono', monospace;
  font-size: 2.5rem;
  font-weight: 700;
  background: linear-gradient(135deg, #7c2d12 0%, #92400e 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1;
  margin-bottom: 0.5rem;
}

.stat-label {
  font-size: 0.8125rem;
  color: #78716c;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-weight: 600;
}

/* Developer Tools Section */
.dev-section {
  padding: 0 2rem 3rem;
  max-width: 1100px;
  margin: 0 auto;
}

.dev-tools {
  background: linear-gradient(145deg, #ffffff 0%, #fefdfb 100%);
  border: 2px solid #e7e5e4;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.dev-tools-header {
  padding: 1rem 1.5rem;
  font-weight: 600;
  color: #78716c;
  cursor: pointer;
  user-select: none;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  transition: background-color 0.2s;
}

.dev-tools-header:hover {
  background-color: #fafaf9;
}

.dev-tools-content {
  padding: 1.5rem;
  border-top: 1px solid #e7e5e4;
}

.api-status {
  background: #fafaf9;
  border: 1px solid #e7e5e4;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}

.api-status h3 {
  font-family: 'Sora', sans-serif;
  font-size: 1rem;
  font-weight: 600;
  color: #292524;
  margin: 0 0 1rem 0;
}

.api-url {
  color: #78716c;
  font-size: 0.875rem;
  margin: 0 0 1rem 0;
}

.api-url code {
  background: #fef3c7;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-family: 'Space Mono', monospace;
  color: #92400e;
  font-size: 0.8125rem;
  border: 1px solid #fde68a;
}

.status-message {
  margin-top: 1rem;
  padding: 0.875rem 1rem;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  border-left: 3px solid;
}

.status-message.success {
  background-color: #dbeafe;
  color: #1e3a8a;
  border-left-color: #1e3a8a;
}

.status-message.error {
  background-color: #fef2f2;
  color: #7c2d12;
  border-left-color: #7c2d12;
}

.store-status {
  background: #fafaf9;
  border: 1px solid #e7e5e4;
  border-radius: 8px;
  padding: 1.5rem;
}

.store-status h3 {
  font-family: 'Sora', sans-serif;
  font-size: 1rem;
  font-weight: 600;
  color: #292524;
  margin: 0 0 1rem 0;
}

.store-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
}

.store-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
}

.store-label {
  font-size: 0.875rem;
  color: #78716c;
  font-weight: 500;
}

.badge-success {
  background-color: #dbeafe;
  color: #1e3a8a;
  padding: 0.25rem 0.625rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border: 1px solid #93c5fd;
}

.badge-inactive {
  background-color: #ffffff;
  color: #78716c;
  padding: 0.25rem 0.625rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border: 1px solid #e7e5e4;
}

/* Responsive Design */
@media (max-width: 768px) {
  .hero {
    padding: 3rem 1.5rem;
  }

  .hero-title {
    font-size: 2rem;
  }

  .hero-subtitle {
    font-size: 1rem;
  }

  .hero-actions {
    flex-direction: column;
  }

  .btn {
    width: 100%;
    text-align: center;
  }

  .stats-section {
    padding: 0 1rem 2rem;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .dev-section {
    padding: 0 1rem 2rem;
  }

  .store-grid {
    grid-template-columns: 1fr;
  }
}
</style>
