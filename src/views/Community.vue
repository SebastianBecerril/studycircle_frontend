<template>
  <div class="communities-page">
    <!-- Header Section -->
    <div class="page-header">
      <div class="header-content">
        <h1>Communities</h1>
        <p>Create private study communities and collaborate with your classmates</p>
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
          <router-link
            v-if="communityItem?._id && isUserMember(communityItem._id)"
            :to="`/community/${communityItem._id}`"
            class="view-btn"
          >
            View Board
          </router-link>
          <button
            v-if="communityItem?._id && community.isUserAdmin(communityItem._id)"
            @click="startEditCommunity(communityItem)"
            class="edit-btn"
            title="Edit community"
          >
            ✏️ Edit
          </button>
          <div v-else-if="!isUserMember(communityItem._id)" class="private-badge">
            <span class="lock-icon">🔒</span>
            <span>Private Community</span>
          </div>
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

    <!-- Edit Community Modal -->
    <div v-if="showEditForm" class="modal-overlay" @click="closeEditForm">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>Edit Community</h2>
          <button @click="closeEditForm" class="close-btn">×</button>
        </div>
        
        <form @submit.prevent="handleEditCommunity" class="create-form">
          <div class="form-group">
            <label for="editCommunityName">Community Name</label>
            <input
              id="editCommunityName"
              v-model="editForm.name"
              type="text"
              required
              placeholder="Enter community name..."
              class="form-input"
            />
          </div>
          
          <div class="form-group">
            <label for="editCommunityDescription">Description</label>
            <textarea
              id="editCommunityDescription"
              v-model="editForm.description"
              required
              placeholder="Describe your community..."
              rows="4"
              class="form-textarea"
            ></textarea>
          </div>

          <div v-if="editError" class="error-message">
            {{ editError }}
            <button type="button" @click="editError = ''" class="close-btn">×</button>
          </div>
          
          <div class="form-actions">
            <button 
              type="button" 
              @click="closeEditForm" 
              class="cancel-btn"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              :disabled="community.isLoading || !editForm.name.trim() || !editForm.description.trim()"
              class="submit-btn"
            >
              <span v-if="community.isLoading" class="loading-spinner small"></span>
              {{ community.isLoading ? 'Saving...' : 'Save Changes' }}
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
const showEditForm = ref(false)
const searchQuery = ref('')
const filter = ref<'all' | 'joined'>('all')
const editError = ref('')
const communityToEdit = ref<any>(null)

const createForm = ref({
  name: '',
  description: ''
})

const editForm = ref({
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

const handleCreateCommunity = async () => {
  try {
    if (!auth.userId) {
      throw new Error('User not authenticated')
    }
    
    
    await community.createCommunity({
      name: createForm.value.name.trim(),
      description: createForm.value.description.trim()
    }, auth.userId)
    
    // Refetch memberships so the user sees themselves as a member
    await community.fetchMemberships()
    
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

const startEditCommunity = (communityItem: any) => {
  communityToEdit.value = communityItem
  editForm.value = {
    name: communityItem.name,
    description: communityItem.description
  }
  showEditForm.value = true
  editError.value = ''
}

const handleEditCommunity = async () => {
  try {
    if (!auth.userId) {
      throw new Error('User not authenticated')
    }

    if (!communityToEdit.value) {
      throw new Error('No community selected for editing')
    }

    await community.updateCommunityDetails(
      communityToEdit.value._id,
      editForm.value.name.trim(),
      editForm.value.description.trim(),
      auth.userId
    )

    closeEditForm()
  } catch (error: any) {
    console.error('Failed to update community:', error)
    editError.value = error.message || 'Failed to update community'
  }
}

const closeEditForm = () => {
  showEditForm.value = false
  editForm.value = { name: '', description: '' }
  communityToEdit.value = null
  editError.value = ''
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
  community.fetchCommunities()
  community.fetchMemberships()
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
  font-family: 'DM Serif Display', Georgia, serif;
  font-size: 2.25rem; /* 36px - H1 */
  font-weight: 400;
  color: #2E7D32;
  margin: 0 0 0.5rem 0;
  line-height: 1.2;
}

.header-content p {
  font-family: 'Inter', sans-serif;
  color: #0F172A;
  font-size: 1rem; /* 16px */
  margin: 0;
  line-height: 1.45;
}

.create-btn {
  background: #0D9488;
  color: #F8FAFC;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  font-weight: 600;
  font-family: 'Inter', sans-serif;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: 0 4px 12px rgba(13, 148, 136, 0.3);
}

.create-btn:hover:not(:disabled) {
  background: #0A7C72;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(13, 148, 136, 0.4);
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
  border: 2px solid #E5E7EB;
  border-radius: 12px;
  font-size: 1rem;
  font-family: 'Inter', sans-serif;
  background: #FFFFFF;
  transition: all 0.2s ease;
}

.search-input:focus {
  outline: none;
  border-color: #2E7D32;
  box-shadow: 0 0 0 3px rgba(46, 125, 50, 0.1);
}

.filter-buttons {
  display: flex;
  gap: 0.5rem;
}

.filter-btn {
  padding: 0.5rem 1rem;
  border: 2px solid #E5E7EB;
  background: #FFFFFF;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 500;
  font-family: 'Inter', sans-serif;
  color: #0F172A;
}

.filter-btn:hover {
  border-color: #2E7D32;
  background: #E8F5E9;
  color: #0F172A;
}

.filter-btn.active {
  background: #2E7D32;
  color: #F8FAFC;
  border-color: #2E7D32;
  box-shadow: 0 2px 4px rgba(46, 125, 50, 0.2);
}

/* Error Message */
.error-message {
  background: #FEE2E2;
  color: #991B1B;
  padding: 1rem 1.5rem;
  border-radius: 8px;
  border-left: 4px solid #EF4444;
  margin-bottom: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border: 1px solid #FCA5A5;
  font-family: 'Inter', sans-serif;
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
  border: 4px solid #E5E7EB;
  border-top: 4px solid #2E7D32;
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
  background: #FFFFFF;
  border-radius: 16px;
  padding: 1.5rem;
  border: 2px solid #E5E7EB;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.community-card::before {
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

.community-card:hover::before {
  opacity: 1;
}

.community-card:hover {
  transform: translateY(-4px);
  border-color: #2E7D32;
  box-shadow: 0 12px 24px rgba(46, 125, 50, 0.12);
}

.community-header {
  margin-bottom: 1rem;
}

.community-name {
  font-family: 'DM Serif Display', Georgia, serif;
  font-size: 1.375rem; /* 22px - H3 */
  font-weight: 400;
  color: #0F172A;
  margin: 0 0 0.5rem 0;
  line-height: 1.4;
}

.community-meta {
  display: flex;
  gap: 1rem;
  font-size: 0.875rem; /* 14px - Small */
  font-family: 'Inter', sans-serif;
  color: #0F172A;
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
  font-family: 'Inter', sans-serif;
  color: #0F172A;
  line-height: 1.45;
  margin-bottom: 1.5rem;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.community-actions {
  display: flex;
  gap: 0.75rem;
}

.view-btn {
  background: #2E7D32;
  color: #F8FAFC;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-weight: 600;
  font-family: 'Inter', sans-serif;
  cursor: pointer;
  transition: all 0.3s ease;
  flex: 1;
  text-decoration: none;
  text-align: center;
  display: inline-block;
  box-shadow: 0 2px 8px rgba(46, 125, 50, 0.3);
}

.view-btn:hover {
  background: #256528;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(46, 125, 50, 0.4);
}

.edit-btn {
  background: #0D9488;
  color: #F8FAFC;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-family: 'Inter', sans-serif;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.875rem; /* 14px - Small */
  display: flex;
  align-items: center;
  gap: 0.375rem;
  box-shadow: 0 2px 8px rgba(13, 148, 136, 0.3);
}

.edit-btn:hover {
  background: #0A7C72;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(13, 148, 136, 0.4);
}

.private-badge {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #F8FAFC;
  border: 2px solid #E5E7EB;
  border-radius: 8px;
  color: #0F172A;
  font-weight: 500;
  font-family: 'Inter', sans-serif;
  font-size: 0.875rem; /* 14px - Small */
}

.lock-icon {
  font-size: 1rem;
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
  background: #0D9488;
  color: #F8FAFC;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  font-family: 'Inter', sans-serif;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(13, 148, 136, 0.3);
}

.create-first-btn:hover {
  background: #0A7C72;
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(13, 148, 136, 0.4);
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
  border-bottom: 1px solid #E5E7EB;
  margin-bottom: 1.5rem;
}

.modal-header h2 {
  margin: 0;
  font-family: 'DM Serif Display', Georgia, serif;
  font-size: 1.75rem; /* 28px - H2 */
  font-weight: 400;
  color: #0F172A;
  line-height: 1.3;
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
  color: #0F172A;
  font-weight: 600;
  font-family: 'Inter', sans-serif;
  font-size: 0.9375rem;
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
  border-color: #2E7D32;
  box-shadow: 0 0 0 3px rgba(46, 125, 50, 0.1);
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
  background: #2E7D32;
  color: #F8FAFC;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-family: 'Inter', sans-serif;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: 0 2px 8px rgba(46, 125, 50, 0.3);
}

.submit-btn:hover:not(:disabled) {
  background: #256528;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(46, 125, 50, 0.4);
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
