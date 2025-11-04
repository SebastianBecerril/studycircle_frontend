<template>
  <div class="profile-page">
    <div class="placeholder-content">
      <div class="icon-placeholder">👤</div>
      <h1>Your Profile</h1>
      <p class="subtitle">Manage your account and personal information</p>
      <div class="features-preview">
        <div class="feature-item">
          <span class="feature-icon">✓</span>
          <span>Edit display name & bio</span>
        </div>
        <div class="feature-item">
          <span class="feature-icon">✓</span>
          <span>Upload profile picture</span>
        </div>
        <div class="feature-item">
          <span class="feature-icon">✓</span>
          <span>Privacy settings</span>
        </div>
      </div>
      <p class="coming-soon">Coming soon...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
// Profile setup page - to be implemented
</script>

<style scoped>
.profile-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 4rem 2rem;
  min-height: 60vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.placeholder-content {
  text-align: center;
  background: linear-gradient(145deg, #ffffff 0%, #fefdfb 100%);
  border-radius: 20px;
  padding: 4rem 3rem;
  border: 2px solid #e7e5e4;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
}

.icon-placeholder {
  font-size: 5rem;
  margin-bottom: 1.5rem;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

h1 {
  font-family: 'Sora', sans-serif;
  font-size: 2.5rem;
  font-weight: 800;
  color: #7c2d12;
  margin: 0 0 1rem 0;
}

.subtitle {
  color: #78716c;
  font-size: 1.125rem;
  margin: 0 0 2rem 0;
}

.features-preview {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 2rem;
  align-items: center;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: #1c1917;
  font-weight: 500;
}

.feature-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background: linear-gradient(135deg, #fbcfe8 0%, #f9a8d4 100%);
  border-radius: 50%;
  color: #be185d;
  font-size: 0.875rem;
  font-weight: 700;
}

.coming-soon {
  color: #78716c;
  font-style: italic;
  margin: 0;
  font-size: 0.875rem;
}
</style>
