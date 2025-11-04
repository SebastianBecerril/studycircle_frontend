<template>
  <div class="profile-page">
    <!-- Loading State -->
    <div v-if="isLoading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>Loading profile...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error && !userProfile.currentProfile" class="error-container">
      <div class="error-icon">⚠️</div>
      <h2>Could Not Load Profile</h2>
      <p>{{ error }}</p>
      <button @click="retryFetch" class="retry-btn">Try Again</button>
    </div>

    <!-- Profile Content -->
    <div v-else class="profile-content">
      <!-- Header -->
      <div class="profile-header">
        <h1>Your Profile</h1>
        <p class="header-subtitle">Manage your display name, bio, and profile picture</p>
      </div>

      <!-- No Profile State - Create Profile -->
      <div v-if="!userProfile.currentProfile" class="create-profile-section">
        <div class="create-profile-card">
          <div class="profile-icon-large">👤</div>
          <h2>Create Your Profile</h2>
          <p>Set up your profile to personalize your StudyCircle experience. Your display name will be shown to community members.</p>
          
          <form @submit.prevent="handleCreateProfile" class="create-form">
            <div class="form-group">
              <label for="createDisplayName">Display Name *</label>
              <input
                id="createDisplayName"
                v-model="createForm.displayName"
                type="text"
                required
                placeholder="e.g., Sarah Johnson"
                class="form-input"
                minlength="2"
                maxlength="50"
              />
              <span class="input-hint">This is how you'll appear to other members</span>
            </div>

            <div v-if="createError" class="error-message">
              {{ createError }}
              <button type="button" @click="createError = ''" class="error-close">×</button>
            </div>

            <button 
              type="submit" 
              class="submit-btn"
              :disabled="userProfile.isLoading || !createForm.displayName.trim()"
            >
              <span v-if="userProfile.isLoading" class="loading-spinner"></span>
              <span v-else>Create Profile</span>
            </button>
          </form>
        </div>
      </div>

      <!-- Existing Profile - View/Edit -->
      <div v-else class="profile-view-section">
        <!-- Profile Display Card -->
        <div class="profile-display-card">
          <div class="profile-avatar-section">
            <div class="profile-avatar">
              <img 
                v-if="userProfile.currentProfile.thumbnailImageURL" 
                :src="userProfile.currentProfile.thumbnailImageURL" 
                alt="Profile picture"
                @error="imageLoadError"
              />
              <span v-else class="avatar-placeholder">
                {{ getInitials(userProfile.currentProfile.displayName) }}
              </span>
            </div>
            <button @click="showEditAvatar = true" class="edit-avatar-btn">
              📷 Change Picture
            </button>
          </div>

          <div class="profile-info-section">
            <div class="info-group">
              <label class="info-label">Display Name</label>
              <div class="info-value-row">
                <p class="info-value">{{ userProfile.currentProfile.displayName }}</p>
                <button @click="showEditName = true" class="edit-icon-btn" title="Edit display name">
                  ✏️
                </button>
              </div>
            </div>

            <div class="info-group">
              <label class="info-label">Bio</label>
              <div class="info-value-row">
                <p class="info-value bio-text">
                  {{ userProfile.currentProfile.bio || 'No bio added yet' }}
                </p>
                <button @click="showEditBio = true" class="edit-icon-btn" title="Edit bio">
                  ✏️
                </button>
              </div>
            </div>

            <div class="info-group">
              <label class="info-label">User ID</label>
              <p class="info-value user-id">{{ auth.userId?.slice(0, 16) }}...</p>
            </div>
          </div>
        </div>

        <!-- Edit Display Name Modal -->
        <div v-if="showEditName" class="modal-overlay" @click="closeEditName">
          <div class="modal-content" @click.stop>
            <div class="modal-header">
              <h2>Edit Display Name</h2>
              <button @click="closeEditName" class="close-btn">×</button>
            </div>
            
            <form @submit.prevent="handleUpdateDisplayName" class="edit-form">
              <div class="form-group">
                <label for="editDisplayName">Display Name *</label>
                <input
                  id="editDisplayName"
                  v-model="editNameForm"
                  type="text"
                  required
                  placeholder="e.g., Sarah Johnson"
                  class="form-input"
                  minlength="2"
                  maxlength="50"
                />
                <span class="input-hint">Minimum 2 characters, maximum 50</span>
              </div>

              <div v-if="editError" class="error-message">
                {{ editError }}
                <button type="button" @click="editError = ''" class="error-close">×</button>
              </div>

              <div class="form-actions">
                <button type="button" @click="closeEditName" class="cancel-btn">
                  Cancel
                </button>
                <button 
                  type="submit" 
                  class="submit-btn"
                  :disabled="userProfile.isLoading || !editNameForm.trim()"
                >
                  <span v-if="userProfile.isLoading" class="loading-spinner"></span>
                  <span v-else>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        <!-- Edit Bio Modal -->
        <div v-if="showEditBio" class="modal-overlay" @click="closeEditBio">
          <div class="modal-content" @click.stop>
            <div class="modal-header">
              <h2>Edit Bio</h2>
              <button @click="closeEditBio" class="close-btn">×</button>
            </div>
            
            <form @submit.prevent="handleUpdateBio" class="edit-form">
              <div class="form-group">
                <label for="editBio">Bio</label>
                <textarea
                  id="editBio"
                  v-model="editBioForm"
                  placeholder="Tell us a bit about yourself..."
                  rows="6"
                  class="form-textarea"
                  maxlength="300"
                ></textarea>
                <span class="input-hint">Maximum 300 characters</span>
              </div>

              <div v-if="editError" class="error-message">
                {{ editError }}
                <button type="button" @click="editError = ''" class="error-close">×</button>
              </div>

              <div class="form-actions">
                <button type="button" @click="closeEditBio" class="cancel-btn">
                  Cancel
                </button>
                <button 
                  type="submit" 
                  class="submit-btn"
                  :disabled="userProfile.isLoading"
                >
                  <span v-if="userProfile.isLoading" class="loading-spinner"></span>
                  <span v-else>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        <!-- Edit Avatar Modal -->
        <div v-if="showEditAvatar" class="modal-overlay" @click="closeEditAvatar">
          <div class="modal-content" @click.stop>
            <div class="modal-header">
              <h2>Change Profile Picture</h2>
              <button @click="closeEditAvatar" class="close-btn">×</button>
            </div>
            
            <form @submit.prevent="handleUpdateAvatar" class="edit-form">
              <div class="form-group">
                <label for="editAvatar">Profile Picture URL</label>
                <input
                  id="editAvatar"
                  v-model="editAvatarForm"
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  class="form-input"
                />
                <span class="input-hint">Enter a URL to an image</span>
              </div>

              <div v-if="editAvatarForm" class="avatar-preview">
                <p class="preview-label">Preview:</p>
                <img 
                  :src="editAvatarForm" 
                  alt="Preview"
                  class="preview-image"
                  @error="previewError = true"
                />
                <p v-if="previewError" class="preview-error">Unable to load image from this URL</p>
              </div>

              <div v-if="editError" class="error-message">
                {{ editError }}
                <button type="button" @click="editError = ''" class="error-close">×</button>
              </div>

              <div class="form-actions">
                <button type="button" @click="closeEditAvatar" class="cancel-btn">
                  Cancel
                </button>
                <button 
                  type="submit" 
                  class="submit-btn"
                  :disabled="userProfile.isLoading"
                >
                  <span v-if="userProfile.isLoading" class="loading-spinner"></span>
                  <span v-else>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useStores } from '@/composables/useStores'

const { auth, userProfile } = useStores()

const isLoading = ref(true)
const error = ref('')
const createError = ref('')
const editError = ref('')
const previewError = ref(false)

const showEditName = ref(false)
const showEditBio = ref(false)
const showEditAvatar = ref(false)

const createForm = ref({
  displayName: ''
})

const editNameForm = ref('')
const editBioForm = ref('')
const editAvatarForm = ref('')

const getInitials = (name: string) => {
  if (!name) return '?'
  const parts = name.trim().split(' ')
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  }
  return name[0].toUpperCase()
}

const imageLoadError = () => {
  console.warn('Failed to load profile image')
}

const fetchData = async () => {
  try {
    isLoading.value = true
    error.value = ''

    if (!auth.userId) {
      error.value = 'Please log in to view your profile'
      return
    }

    await userProfile.fetchProfileByUser(auth.userId)
  } catch (err: any) {
    console.error('Error loading profile:', err)
    error.value = err.message || 'Failed to load profile'
  } finally {
    isLoading.value = false
  }
}

const retryFetch = () => {
  fetchData()
}

const handleCreateProfile = async () => {
  try {
    createError.value = ''

    if (!auth.userId) {
      createError.value = 'You must be logged in to create a profile'
      return
    }

    const displayName = createForm.value.displayName.trim()

    if (!displayName) {
      createError.value = 'Please enter a display name'
      return
    }

    if (displayName.length < 2) {
      createError.value = 'Display name must be at least 2 characters'
      return
    }

    console.log('Creating profile with display name:', displayName)

    await userProfile.createProfileAction(auth.userId, displayName)

    console.log('Profile created successfully')
    createForm.value = { displayName: '' }
  } catch (error: any) {
    console.error('Failed to create profile:', error)
    createError.value = error.message || 'Failed to create profile'
  }
}

const handleUpdateDisplayName = async () => {
  try {
    editError.value = ''

    if (!userProfile.currentProfile) {
      editError.value = 'No profile found'
      return
    }

    const newDisplayName = editNameForm.value.trim()

    if (!newDisplayName) {
      editError.value = 'Please enter a display name'
      return
    }

    if (newDisplayName.length < 2) {
      editError.value = 'Display name must be at least 2 characters'
      return
    }

    console.log('Updating display name to:', newDisplayName)

    await userProfile.updateDisplayNameAction(userProfile.currentProfile._id, newDisplayName)

    console.log('Display name updated successfully')
    closeEditName()
  } catch (error: any) {
    console.error('Failed to update display name:', error)
    editError.value = error.message || 'Failed to update display name'
  }
}

const handleUpdateBio = async () => {
  try {
    editError.value = ''

    if (!userProfile.currentProfile) {
      editError.value = 'No profile found'
      return
    }

    const newBio = editBioForm.value.trim()

    console.log('Updating bio to:', newBio)

    await userProfile.updateBioAction(userProfile.currentProfile._id, newBio)

    console.log('Bio updated successfully')
    closeEditBio()
  } catch (error: any) {
    console.error('Failed to update bio:', error)
    editError.value = error.message || 'Failed to update bio'
  }
}

const handleUpdateAvatar = async () => {
  try {
    editError.value = ''
    previewError.value = false

    if (!userProfile.currentProfile) {
      editError.value = 'No profile found'
      return
    }

    const newAvatarURL = editAvatarForm.value.trim()

    console.log('Updating avatar to:', newAvatarURL)

    await userProfile.updateThumbnailAction(userProfile.currentProfile._id, newAvatarURL)

    console.log('Avatar updated successfully')
    closeEditAvatar()
  } catch (error: any) {
    console.error('Failed to update avatar:', error)
    editError.value = error.message || 'Failed to update profile picture'
  }
}

const closeEditName = () => {
  showEditName.value = false
  editNameForm.value = userProfile.currentProfile?.displayName || ''
  editError.value = ''
  userProfile.clearError()
}

const closeEditBio = () => {
  showEditBio.value = false
  editBioForm.value = userProfile.currentProfile?.bio || ''
  editError.value = ''
  userProfile.clearError()
}

const closeEditAvatar = () => {
  showEditAvatar.value = false
  editAvatarForm.value = userProfile.currentProfile?.thumbnailImageURL || ''
  editError.value = ''
  previewError.value = false
  userProfile.clearError()
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.profile-page {
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem;
  min-height: 70vh;
}

/* Loading & Error States */
.loading-container,
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 50vh;
  gap: 1rem;
}

.loading-spinner {
  width: 48px;
  height: 48px;
  border: 4px solid #e7e5e4;
  border-top: 4px solid #1e3a8a;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-container p {
  color: #78716c;
  font-size: 1rem;
}

.error-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.error-container h2 {
  font-family: 'Sora', sans-serif;
  color: #7c2d12;
  font-size: 2rem;
  margin: 0 0 1rem 0;
}

.error-container p {
  color: #78716c;
  margin-bottom: 2rem;
}

.retry-btn {
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(30, 58, 138, 0.3);
}

.retry-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(30, 58, 138, 0.4);
}

/* Profile Content */
.profile-content {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Header */
.profile-header {
  text-align: center;
  margin-bottom: 3rem;
}

.profile-header h1 {
  font-family: 'Sora', sans-serif;
  font-size: 2.5rem;
  font-weight: 800;
  color: #7c2d12;
  margin: 0 0 0.5rem 0;
  letter-spacing: -0.5px;
}

.header-subtitle {
  font-size: 1.125rem;
  color: #78716c;
  margin: 0;
}

/* Create Profile Section */
.create-profile-section {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 40vh;
}

.create-profile-card {
  background: linear-gradient(145deg, #ffffff 0%, #fefdfb 100%);
  border: 2px solid #e7e5e4;
  border-radius: 20px;
  padding: 3rem 2.5rem;
  max-width: 500px;
  width: 100%;
  text-align: center;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
  position: relative;
}

.create-profile-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #7c2d12 0%, #1e3a8a 50%, #d97706 100%);
  border-radius: 20px 20px 0 0;
}

.profile-icon-large {
  font-size: 5rem;
  margin-bottom: 1.5rem;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.create-profile-card h2 {
  font-family: 'Sora', sans-serif;
  font-size: 2rem;
  font-weight: 700;
  color: #7c2d12;
  margin: 0 0 1rem 0;
}

.create-profile-card > p {
  color: #78716c;
  font-size: 1rem;
  margin: 0 0 2rem 0;
  line-height: 1.6;
}

/* Profile View Section */
.profile-view-section {
  max-width: 700px;
  margin: 0 auto;
}

.profile-display-card {
  background: linear-gradient(145deg, #ffffff 0%, #fefdfb 100%);
  border: 2px solid #e7e5e4;
  border-radius: 20px;
  padding: 2.5rem;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
  position: relative;
}

.profile-display-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #7c2d12 0%, #1e3a8a 50%, #d97706 100%);
  border-radius: 20px 20px 0 0;
}

.profile-avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 2rem;
  border-bottom: 2px solid #e7e5e4;
}

.profile-avatar {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  overflow: hidden;
  border: 4px solid #e7e5e4;
  margin-bottom: 1rem;
  background: linear-gradient(135deg, #fde68a 0%, #fcd34d 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.profile-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  font-size: 3rem;
  font-weight: 700;
  color: #92400e;
  font-family: 'Sora', sans-serif;
}

.edit-avatar-btn {
  padding: 0.5rem 1rem;
  background: white;
  color: #1c1917;
  border: 2px solid #e7e5e4;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.875rem;
}

.edit-avatar-btn:hover {
  border-color: #7c2d12;
  background: #fef3c7;
}

.profile-info-section {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.info-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.info-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #78716c;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-value-row {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
}

.info-value {
  flex: 1;
  font-size: 1.125rem;
  color: #1c1917;
  margin: 0;
  line-height: 1.5;
  padding: 0.5rem 0;
}

.bio-text {
  font-size: 1rem;
  white-space: pre-wrap;
  color: #57534e;
}

.user-id {
  font-family: 'Space Mono', monospace;
  font-size: 0.9375rem;
  color: #78716c;
}

.edit-icon-btn {
  padding: 0.5rem;
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 1.25rem;
  transition: all 0.2s ease;
  border-radius: 6px;
  flex-shrink: 0;
}

.edit-icon-btn:hover {
  background: #fef3c7;
  transform: scale(1.1);
}

/* Forms */
.create-form,
.edit-form {
  text-align: left;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  font-weight: 600;
  color: #1c1917;
  margin-bottom: 0.5rem;
  font-size: 0.9375rem;
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid #e7e5e4;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.2s ease;
  font-family: inherit;
  background: #fafaf9;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: #7c2d12;
  background: white;
  box-shadow: 0 0 0 3px rgba(124, 45, 18, 0.1);
}

.form-textarea {
  resize: vertical;
  min-height: 120px;
}

.input-hint {
  display: block;
  font-size: 0.8125rem;
  color: #78716c;
  margin-top: 0.375rem;
}

.error-message {
  background: #fef2f2;
  color: #7c2d12;
  padding: 0.875rem 1rem;
  border-radius: 8px;
  border: 1px solid #fecaca;
  border-left: 3px solid #7c2d12;
  margin-bottom: 1.5rem;
  font-size: 0.875rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.error-close {
  background: none;
  border: none;
  color: inherit;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: background 0.2s;
  flex-shrink: 0;
  line-height: 1;
}

.error-close:hover {
  background: rgba(124, 45, 18, 0.1);
}

.submit-btn {
  width: 100%;
  padding: 0.875rem 1.5rem;
  background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  box-shadow: 0 2px 8px rgba(30, 58, 138, 0.3);
  font-size: 1rem;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(30, 58, 138, 0.4);
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.submit-btn .loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
  animation: fadeIn 0.2s ease;
}

.modal-content {
  background: linear-gradient(145deg, #ffffff 0%, #fefdfb 100%);
  border-radius: 16px;
  padding: 0;
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.3s ease;
  border: 2px solid #e7e5e4;
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.modal-header {
  padding: 1.5rem;
  border-bottom: 2px solid #e7e5e4;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(90deg, #7c2d12 0%, #1e3a8a 50%, #d97706 100%);
  border-radius: 14px 14px 0 0;
}

.modal-header h2 {
  font-family: 'Sora', sans-serif;
  font-size: 1.5rem;
  font-weight: 700;
  color: white;
  margin: 0;
}

.close-btn {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  font-size: 2rem;
  cursor: pointer;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  transition: all 0.2s ease;
  line-height: 1;
  padding: 0;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.1);
}

.modal-content .edit-form {
  padding: 1.5rem;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
}

.cancel-btn {
  padding: 0.75rem 1.5rem;
  background: white;
  color: #78716c;
  border: 2px solid #e7e5e4;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 1rem;
}

.cancel-btn:hover {
  border-color: #78716c;
  background: #fafaf9;
}

.form-actions .submit-btn {
  width: auto;
  min-width: 120px;
}

/* Avatar Preview */
.avatar-preview {
  margin-top: 1rem;
  padding: 1rem;
  background: #fafaf9;
  border: 2px solid #e7e5e4;
  border-radius: 12px;
}

.preview-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #78716c;
  margin: 0 0 0.75rem 0;
}

.preview-image {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #e7e5e4;
}

.preview-error {
  color: #7c2d12;
  font-size: 0.875rem;
  margin: 0.5rem 0 0 0;
}

/* Responsive */
@media (max-width: 768px) {
  .profile-page {
    padding: 1rem;
  }

  .profile-header h1 {
    font-size: 2rem;
  }

  .create-profile-card {
    padding: 2rem 1.5rem;
  }

  .profile-display-card {
    padding: 1.5rem;
  }

  .profile-avatar {
    width: 100px;
    height: 100px;
  }

  .avatar-placeholder {
    font-size: 2.5rem;
  }

  .form-actions {
    flex-direction: column;
  }

  .form-actions .submit-btn,
  .cancel-btn {
    width: 100%;
  }
}
</style>
