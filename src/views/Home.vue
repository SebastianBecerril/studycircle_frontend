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
          <router-link to="/courses" class="btn btn-secondary">
            Add Your Classes
          </router-link>
        </div>
      </div>
    </section>

    <!-- Quick Stats -->
    <section class="stats-section">
      <h2 class="section-title">Platform Statistics</h2>
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
  background: linear-gradient(135deg, #2E7D32 0%, #256528 100%);
  padding: 5rem 2rem;
  text-align: center;
  margin-bottom: 0;
  position: relative;
  box-shadow: 0 4px 20px rgba(46, 125, 50, 0.25);
}

.hero::after {
  content: '';
  position: absolute;
  bottom: -40px;
  left: 50%;
  transform: translateX(-50%);
  width: 80%;
  height: 40px;
  background: linear-gradient(180deg, rgba(46, 125, 50, 0.06) 0%, transparent 100%);
  border-radius: 0 0 50% 50%;
  pointer-events: none;
}

.hero-content {
  max-width: 700px;
  margin: 0 auto;
}

.hero-title {
  font-family: 'DM Serif Display', Georgia, serif;
  font-size: 2.25rem; /* 36px */
  font-weight: 400;
  color: #F8FAFC;
  margin: 0 0 1rem 0;
  letter-spacing: -0.5px;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  line-height: 1.2;
}

.hero-subtitle {
  font-family: 'Inter', sans-serif;
  font-size: 1rem; /* 16px */
  color: #F8FAFC;
  margin: 0 0 2rem 0;
  line-height: 1.45;
  font-weight: 400;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
  opacity: 0.95;
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
  font-size: 1rem; /* 16px */
  text-decoration: none;
  transition: all 0.2s ease;
  border: 2px solid transparent;
  display: inline-block;
  font-family: 'Inter', sans-serif;
  line-height: 1.45;
}

.btn-primary {
  background: #2E7D32;
  color: #F8FAFC;
  box-shadow: 0 4px 12px rgba(46, 125, 50, 0.3);
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
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.15), transparent);
  transition: left 0.5s ease;
}

.btn-primary:hover::before {
  left: 100%;
}

.btn-primary:hover {
  background: #256528;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(46, 125, 50, 0.4);
}

.btn-secondary {
  background: #0D9488;
  color: #F8FAFC;
  border: 2px solid transparent;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(13, 148, 136, 0.25);
}

.btn-secondary:hover {
  background: #0A7C72;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(13, 148, 136, 0.35);
}

.btn-test {
  background-color: #1F2937;
  color: #F8FAFC;
  padding: 0.625rem 1.25rem;
  font-size: 0.875rem; /* 14px - Small */
}

.btn-test:hover:not(:disabled) {
  background-color: #0F172A;
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
  font-family: 'DM Serif Display', Georgia, serif;
  font-size: 1.75rem; /* 28px - H2 */
  font-weight: 400;
  color: #2E7D32;
  margin: 0 0 2rem 0;
  position: relative;
  padding-bottom: 1rem;
  text-align: center;
  line-height: 1.3;
}

.section-title::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 80px;
  height: 3px;
  background: linear-gradient(to right, #2E7D32, #0D9488);
  border-radius: 2px;
  box-shadow: 0 2px 4px rgba(46, 125, 50, 0.2);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 2rem;
  max-width: 1100px;
  margin: 0 auto;
}

.stat-card {
  background: #FFFFFF;
  border: 1px solid #E5E7EB;
  border-radius: 12px;
  padding: 2rem;
  display: flex;
  align-items: center;
  gap: 1.5rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #2E7D32 0%, #0D9488 100%);
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
  background: radial-gradient(circle, rgba(46, 125, 50, 0.04) 0%, transparent 70%);
  border-radius: 50%;
  pointer-events: none;
}

.stat-card:hover::before {
  opacity: 1;
}

.stat-card:hover {
  border-color: #2E7D32;
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(46, 125, 50, 0.12), 0 0 0 1px rgba(46, 125, 50, 0.06);
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
  background: linear-gradient(135deg, #C8E6C9 0%, #A5D6A7 100%);
  color: #256528;
  border: 2px solid #E8F5E9;
}

.posts-icon {
  background: linear-gradient(135deg, #99F6E4 0%, #5EEAD4 100%);
  color: #0A7C72;
  border: 2px solid #CCFBF1;
}

.courses-icon {
  background: linear-gradient(135deg, #FFE0B2 0%, #FFCC80 100%);
  color: #E65100;
  border: 2px solid #FFF3E0;
}

.enrollments-icon {
  background: linear-gradient(135deg, #B3E5FC 0%, #81D4FA 100%);
  color: #01579B;
  border: 2px solid #E1F5FE;
}

.stat-content {
  flex: 1;
}

.stat-number {
  font-family: 'Space Mono', monospace;
  font-size: 2.5rem;
  font-weight: 700;
  color: #2E7D32;
  line-height: 1;
  margin-bottom: 0.5rem;
}

.stat-label {
  font-family: 'Inter', sans-serif;
  font-size: 0.8125rem; /* 13px - Code/Meta */
  color: #0F172A;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  font-weight: 600;
}

/* Developer Tools Section */
.dev-section {
  padding: 0 2rem 3rem;
  max-width: 1100px;
  margin: 0 auto;
}

.dev-tools {
  background: #FFFFFF;
  border: 1px solid #E5E7EB;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.dev-tools-header {
  padding: 1rem 1.5rem;
  font-weight: 600;
  color: #0F172A;
  cursor: pointer;
  user-select: none;
  font-size: 0.875rem; /* 14px - Small */
  text-transform: uppercase;
  letter-spacing: 0.5px;
  transition: background-color 0.2s;
  font-family: 'Inter', sans-serif;
}

.dev-tools-header:hover {
  background-color: #F8FAFC;
}

.dev-tools-content {
  padding: 1.5rem;
  border-top: 1px solid #E5E7EB;
}

.api-status {
  background: #F8FAFC;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}

.api-status h3 {
  font-family: 'DM Serif Display', Georgia, serif;
  font-size: 1.375rem; /* 22px - H3 */
  font-weight: 400;
  color: #0F172A;
  margin: 0 0 1rem 0;
  line-height: 1.4;
}

.api-url {
  color: #0F172A;
  font-size: 0.875rem; /* 14px - Small */
  margin: 0 0 1rem 0;
  font-family: 'Inter', sans-serif;
}

.api-url code {
  background: #E8F5E9;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-family: 'Space Mono', monospace;
  color: #256528;
  font-size: 0.8125rem; /* 13px - Code/Meta */
  border: 1px solid #C8E6C9;
}

.status-message {
  margin-top: 1rem;
  padding: 0.875rem 1rem;
  border-radius: 6px;
  font-size: 0.875rem; /* 14px - Small */
  font-weight: 500;
  border-left: 3px solid;
  font-family: 'Inter', sans-serif;
  line-height: 1.45;
}

.status-message.success {
  background-color: #DCFCE7;
  color: #166534;
  border-left-color: #22C55E;
}

.status-message.error {
  background-color: #FEE2E2;
  color: #991B1B;
  border-left-color: #EF4444;
}

.store-status {
  background: #F8FAFC;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  padding: 1.5rem;
}

.store-status h3 {
  font-family: 'DM Serif Display', Georgia, serif;
  font-size: 1.375rem; /* 22px - H3 */
  font-weight: 400;
  color: #0F172A;
  margin: 0 0 1rem 0;
  line-height: 1.4;
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
  font-family: 'Inter', sans-serif;
  font-size: 0.875rem; /* 14px - Small */
  color: #0F172A;
  font-weight: 500;
}

.badge-success {
  background-color: #DCFCE7;
  color: #166534;
  padding: 0.25rem 0.625rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border: 1px solid #22C55E;
  font-family: 'Inter', sans-serif;
}

.badge-inactive {
  background-color: #F8FAFC;
  color: #64748B;
  padding: 0.25rem 0.625rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border: 1px solid #E5E7EB;
  font-family: 'Inter', sans-serif;
}

/* Responsive Design */
@media (max-width: 768px) {
  .hero {
    padding: 3rem 1.5rem;
  }

  .hero-title {
    font-size: 1.75rem; /* 28px on mobile */
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
