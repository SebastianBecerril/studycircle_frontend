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
            Add Your Courses
          </router-link>
        </div>
      </div>
    </section>

    <!-- How It Works Section -->
    <section class="features-section">
      <h2 class="section-title">How It Works</h2>
      <div class="features-grid">
        <div class="feature-card">
          <div class="feature-icon">📚</div>
          <h3 class="feature-title">Add Your Courses</h3>
          <p class="feature-description">Enter your course schedule and sections to find classmates in your same classes.</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">👥</div>
          <h3 class="feature-title">Join Communities</h3>
          <p class="feature-description">Create or join study communities with your friends, clubs, or organizations.</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">📅</div>
          <h3 class="feature-title">Share Schedules</h3>
          <p class="feature-description">View shared schedules to see who's in your classes and coordinate study sessions.</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">💬</div>
          <h3 class="feature-title">Connect & Study</h3>
          <p class="feature-description">Post on community boards, find study partners, and build your study groups.</p>
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

  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useStores } from '@/composables/useStores'

// Access Pinia stores
const { auth, community, communityBoard, courseCatalog, userEnrollments } = useStores()

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

/* Features Section */
.features-section {
  padding: 4rem 2rem;
  background: #FFFFFF;
  position: relative;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  max-width: 1100px;
  margin: 0 auto;
}

.feature-card {
  background: #FAFAF9;
  border: 1px solid #E5E7EB;
  border-radius: 12px;
  padding: 2rem;
  text-align: center;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.feature-card::before {
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

.feature-card:hover::before {
  opacity: 1;
}

.feature-card:hover {
  border-color: #2E7D32;
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(46, 125, 50, 0.12), 0 0 0 1px rgba(46, 125, 50, 0.06);
  background: #FFFFFF;
}

.feature-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  display: block;
}

.feature-title {
  font-family: 'DM Serif Display', Georgia, serif;
  font-size: 1.375rem; /* 22px - H3 */
  font-weight: 400;
  color: #2E7D32;
  margin: 0 0 0.75rem 0;
  line-height: 1.3;
}

.feature-description {
  font-family: 'Inter', sans-serif;
  font-size: 0.9375rem;
  color: #0F172A;
  line-height: 1.6;
  margin: 0;
  opacity: 0.85;
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

  .features-section {
    padding: 3rem 1rem;
  }

  .features-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
}
</style>
