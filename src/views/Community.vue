<template>
  <div class="communities-page">
    <!-- Header Section -->
    <div class="page-header">
      <div class="header-content">
        <h1>Communities</h1>
        <p>Discover and join study communities or create your own</p>
      </div>
      <button 
        @click="showCreateForm = true" 
        class="create-btn"
        :disabled="community.isLoading"
      >
        <span class="btn-icon">+</span>
        Create Community
      </button>
    </div>

    <!-- Search and Filter Section -->
    <div class="search-section">
      <div class="search-container">
        <div class="search-input-wrapper">
          <span class="search-icon">🔍</span>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search communities..."
            class="search-input"
          />
        </div>
        <div class="filter-buttons">
          <button 
            @click="filter = 'all'"
            :class="{ active: filter === 'all' }"
            class="filter-btn"
          >
            All
          </button>
          <button 
            @click="filter = 'joined'"
            :class="{ active: filter === 'joined' }"
            class="filter-btn"
          >
            My Communities
          </button>
        </div>
      </div>
    </div>

    <!-- Error Message -->
    <div v-if="community.error" class="error-message">
      {{ community.error }}
      <button @click="community.clearError()" class="close-btn">×</button>
    </div>

    <!-- Loading State -->
    <div v-if="community.isLoading && communities.length === 0" class="loading-state">
      <div class="loading-spinner"></div>
      <p>Loading communities...</p>
    </div>

    <!-- Communities Grid -->
    <div v-else class="communities-grid">
      <div 
        v-for="communityItem in filteredCommunities" 
        :key="communityItem._id"
        class="community-card"
      >
         <div class="community-header">
           <h3 class="community-name">{{ communityItem?.name || 'Unnamed Community' }}</h3>
           <div class="community-meta">
             <span class="member-count">
               {{ communityItem?.memberships?.length || 0 }} members
             </span>
             <span class="created-date">
               {{ communityItem?.creationDate ? formatDate(communityItem.creationDate) : 'Unknown date' }}
             </span>
           </div>
         </div>
        
        <p class="community-description">{{ communityItem?.description || 'No description available' }}</p>
        
        <div class="community-actions">
          <button
            v-if="communityItem?._id && !isUserMember(communityItem._id)"
            @click="handleJoin(communityItem._id)"
            :disabled="community.isLoading"
            class="join-btn"
          >
            Join Community
          </button>
          <button
            v-else-if="communityItem?._id"
            @click="handleLeave(communityItem._id)"
            :disabled="community.isLoading"
            class="leave-btn"
          >
            Leave Community
          </button>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="filteredCommunities.length === 0 && !community.isLoading" class="empty-state">
        <div class="empty-icon">🏘️</div>
        <h3>No communities found</h3>
        <p v-if="filter === 'joined'">You haven't joined any communities yet.</p>
        <p v-else-if="searchQuery">No communities match your search.</p>
        <p v-else>Be the first to create a community!</p>
        <button 
          v-if="filter !== 'joined'"
          @click="showCreateForm = true" 
          class="create-first-btn"
        >
          Create First Community
        </button>
      </div>
    </div>

    <!-- Create Community Modal -->
    <div v-if="showCreateForm" class="modal-overlay" @click="closeCreateForm">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>Create New Community</h2>
          <button @click="closeCreateForm" class="close-btn">×</button>
        </div>
        
        <form @submit.prevent="handleCreateCommunity" class="create-form">
          <div class="form-group">
            <label for="communityName">Community Name</label>
            <input
              id="communityName"
              v-model="createForm.name"
              type="text"
              required
              placeholder="Enter community name..."
              class="form-input"
            />
          </div>
          
          <div class="form-group">
            <label for="communityDescription">Description</label>
            <textarea
              id="communityDescription"
              v-model="createForm.description"
              required
              placeholder="Describe your community..."
              rows="4"
              class="form-textarea"
            ></textarea>
          </div>
          
          <div class="form-actions">
            <button 
              type="button" 
              @click="closeCreateForm" 
              class="cancel-btn"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              :disabled="community.isLoading || !createForm.name.trim() || !createForm.description.trim()"
              class="submit-btn"
            >
              <span v-if="community.isLoading" class="loading-spinner small"></span>
              {{ community.isLoading ? 'Creating...' : 'Create Community' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useCommunityStore } from '@/stores/community'
import { useAuthStore } from '@/stores/auth'

const community = useCommunityStore()
const auth = useAuthStore()

// Reactive data
const showCreateForm = ref(false)
const searchQuery = ref('')
const filter = ref<'all' | 'joined'>('all')

const createForm = ref({
  name: '',
  description: ''
})

// Computed properties
const communities = computed(() => community.communities)

const filteredCommunities = computed(() => {
  let filtered = communities.value

  // Apply search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(c => 
      c.name.toLowerCase().includes(query) ||
      c.description.toLowerCase().includes(query)
    )
  }

  // Apply membership filter
  if (filter.value === 'joined') {
    filtered = filtered.filter(c => isUserMember(c._id))
  }

  return filtered
})

// Methods
const isUserMember = (communityId: string) => {
  if (!communityId || !auth.userId) return false
  return community.memberships.some(m => 
    m.community === communityId && m.user === auth.userId
  )
}

const handleJoin = async (communityId: string) => {
  try {
    if (!auth.userId) {
      throw new Error('User not authenticated')
    }
    await community.joinCommunity(communityId, auth.userId)
    console.log('Successfully joined community:', communityId)
  } catch (error: any) {
    console.error('Failed to join community:', error)
    console.error('Error details:', error.response?.data)
  }
}

const handleLeave = async (communityId: string) => {
  try {
    if (!auth.userId) {
      throw new Error('User not authenticated')
    }
    await community.leaveCommunity(communityId, auth.userId)
  } catch (error) {
    console.error('Failed to leave community:', error)
  }
}

const handleCreateCommunity = async () => {
  try {
    if (!auth.userId) {
      throw new Error('User not authenticated')
    }
    
    console.log('Creating community with data:', {
      name: createForm.value.name.trim(),
      description: createForm.value.description.trim(),
      userId: auth.userId
    })
    
    await community.createCommunity({
      name: createForm.value.name.trim(),
      description: createForm.value.description.trim()
    }, auth.userId)
    
    console.log('Community created successfully')
    closeCreateForm()
  } catch (error: any) {
    console.error('Failed to create community:', error)
    console.error('Error response:', error.response?.data)
    console.error('Error status:', error.response?.status)
    // Don't close the form on error so user can try again
  }
}

const closeCreateForm = () => {
  showCreateForm.value = false
  createForm.value = { name: '', description: '' }
  community.clearError()
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

// Lifecycle
onMounted(() => {
  console.log('Auth state on mount:', {
    isLoggedIn: auth.isLoggedIn,
    userId: auth.userId,
    currentUser: auth.currentUser,
    isAuthenticated: auth.isAuthenticated
  })
  community.fetchCommunities()
})
</script>

<style scoped>
.communities-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

/* Header Section */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  gap: 2rem;
}

.header-content h1 {
  font-size: 2.5rem;
  font-weight: 700;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0 0 0.5rem 0;
}

.header-content p {
  color: #4a5568;
  font-size: 1.1rem;
  margin: 0;
}

.create-btn {
  background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: 0 4px 12px rgba(72, 187, 120, 0.3);
}

.create-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(72, 187, 120, 0.4);
}

.create-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.btn-icon {
  font-size: 1.2rem;
  font-weight: bold;
}

/* Search Section */
.search-section {
  margin-bottom: 2rem;
}

.search-container {
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
}

.search-input-wrapper {
  position: relative;
  flex: 1;
  min-width: 300px;
}

.search-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #a0aec0;
  font-size: 1.1rem;
}

.search-input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 3rem;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 1rem;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  transition: all 0.2s ease;
}

.search-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.filter-buttons {
  display: flex;
  gap: 0.5rem;
}

.filter-btn {
  padding: 0.5rem 1rem;
  border: 2px solid #e2e8f0;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 500;
}

.filter-btn:hover {
  border-color: #667eea;
  background: rgba(102, 126, 234, 0.05);
}

.filter-btn.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-color: transparent;
}

/* Error Message */
.error-message {
  background: linear-gradient(135deg, #fed7d7 0%, #feb2b2 100%);
  color: #742a2a;
  padding: 1rem 1.5rem;
  border-radius: 8px;
  border-left: 4px solid #f56565;
  margin-bottom: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.close-btn {
  background: none;
  border: none;
  color: inherit;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0;
  line-height: 1;
}

/* Loading State */
.loading-state {
  text-align: center;
  padding: 4rem 2rem;
  color: #4a5568;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e2e8f0;
  border-top: 4px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

.loading-spinner.small {
  width: 16px;
  height: 16px;
  border-width: 2px;
  margin: 0;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Communities Grid */
.communities-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
}

.community-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
}

.community-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
}

.community-header {
  margin-bottom: 1rem;
}

.community-name {
  font-size: 1.25rem;
  font-weight: 600;
  color: #2d3748;
  margin: 0 0 0.5rem 0;
}

.community-meta {
  display: flex;
  gap: 1rem;
  font-size: 0.875rem;
  color: #718096;
}

.member-count {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.created-date {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.community-description {
  color: #4a5568;
  line-height: 1.6;
  margin-bottom: 1.5rem;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.community-actions {
  display: flex;
  gap: 0.75rem;
}

.join-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  flex: 1;
}

.join-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.leave-btn {
  background: linear-gradient(135deg, #f56565 0%, #e53e3e 100%);
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  flex: 1;
}

.leave-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(245, 101, 101, 0.3);
}

.join-btn:disabled,
.leave-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

/* Empty State */
.empty-state {
  grid-column: 1 / -1;
  text-align: center;
  padding: 4rem 2rem;
  color: #4a5568;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.empty-state h3 {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
  color: #2d3748;
}

.empty-state p {
  margin: 0 0 1.5rem 0;
  font-size: 1rem;
}

.create-first-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.create-first-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-content {
  background: white;
  border-radius: 16px;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 1.5rem 0;
  border-bottom: 1px solid #e2e8f0;
  margin-bottom: 1.5rem;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: #2d3748;
}

.create-form {
  padding: 0 1.5rem 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #2d3748;
  font-weight: 600;
  font-size: 0.9rem;
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.2s ease;
  font-family: inherit;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-textarea {
  resize: vertical;
  min-height: 100px;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

.cancel-btn {
  padding: 0.75rem 1.5rem;
  border: 2px solid #e2e8f0;
  background: white;
  color: #4a5568;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.cancel-btn:hover {
  border-color: #cbd5e0;
  background: #f7fafc;
}

.submit-btn {
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.submit-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

/* Responsive Design */
@media (max-width: 768px) {
  .communities-page {
    padding: 1rem;
  }
  
  .page-header {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }
  
  .header-content h1 {
    font-size: 2rem;
  }
  
  .search-container {
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-input-wrapper {
    min-width: auto;
  }
  
  .communities-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .modal-content {
    margin: 1rem;
  }
}
</style>
