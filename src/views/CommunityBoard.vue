<template>
  <div class="community-board-page">
    <!-- Loading State -->
    <div v-if="isLoading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>Loading community...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-container">
      <div class="error-icon">⚠️</div>
      <h2>Community Not Found</h2>
      <p>{{ error }}</p>
      <router-link to="/community" class="back-btn">
        ← Back to Communities
      </router-link>
    </div>

    <!-- Community Board Content -->
    <div v-else-if="currentCommunity" class="board-content">
      <!-- Header Section -->
      <div class="board-header">
        <router-link to="/community" class="back-link">
          ← Back to Communities
        </router-link>
        
        <div class="header-content">
          <h1 class="community-title">{{ currentCommunity.name }}</h1>
          <p class="community-description">{{ currentCommunity.description }}</p>
          
          <div class="community-stats">
            <span class="stat-item">
              <span class="stat-icon">👥</span>
              <span class="stat-text">{{ currentCommunity.memberships?.length || 0 }} members</span>
            </span>
            <span class="stat-item">
              <span class="stat-icon">📅</span>
              <span class="stat-text">Created {{ formatDate(currentCommunity.creationDate) }}</span>
            </span>
          </div>
        </div>
      </div>

      <!-- Posts Section -->
      <div class="posts-section">
        <div class="section-header">
          <h2>Community Board</h2>
          <button @click="showCreatePostForm = true" class="create-post-btn">
            <span class="btn-icon">+</span>
            Create Post
          </button>
        </div>

        <!-- Loading State -->
        <div v-if="communityBoard.isLoading" class="posts-loading">
          <div class="loading-spinner"></div>
          <p>Loading posts...</p>
        </div>

        <!-- Posts List -->
        <div v-else-if="communityPosts.length > 0" class="posts-list">
          <div 
            v-for="post in communityPosts" 
            :key="post._id"
            class="post-card"
          >
            <div class="post-header">
              <div class="post-author">
                <div class="author-avatar">👤</div>
                <div class="author-info">
                  <span class="author-name">User {{ post.author.slice(0, 8) }}</span>
                </div>
              </div>
            </div>

            <h3 class="post-title">{{ post.title }}</h3>
            <p class="post-body">{{ post.body }}</p>

            <div class="post-footer">
              <div class="post-tags" v-if="post.tags && post.tags.length > 0">
                <span 
                  v-for="tag in post.tags" 
                  :key="tag"
                  class="tag"
                >
                  {{ tag }}
                </span>
              </div>
              
              <div class="post-meta">
                <span class="reply-count">
                  <span class="meta-icon">💬</span>
                  {{ post.replies?.length || 0 }} replies
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else class="empty-posts">
          <div class="empty-icon">📝</div>
          <h3>No posts yet</h3>
          <p>Be the first to start a conversation in this community!</p>
        </div>
      </div>

      <!-- Create Post Modal -->
      <div v-if="showCreatePostForm" class="modal-overlay" @click="closeCreatePostForm">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h2>Create New Post</h2>
            <button @click="closeCreatePostForm" class="close-btn">×</button>
          </div>
          
          <form @submit.prevent="handleCreatePost" class="create-form">
            <div class="form-group">
              <label for="postTitle">Title *</label>
              <input
                id="postTitle"
                v-model="createPostForm.title"
                type="text"
                required
                placeholder="Enter post title..."
                class="form-input"
                minlength="3"
                maxlength="200"
              />
              <span class="input-hint">Minimum 3 characters</span>
            </div>
            
            <div class="form-group">
              <label for="postBody">Message *</label>
              <textarea
                id="postBody"
                v-model="createPostForm.body"
                required
                placeholder="Share your thoughts with the community..."
                rows="8"
                class="form-textarea"
                minlength="10"
              ></textarea>
              <span class="input-hint">Minimum 10 characters</span>
            </div>
            
            <div class="form-group">
              <label for="postTags">Tags (optional)</label>
              <input
                id="postTags"
                v-model="tagsInput"
                type="text"
                placeholder="e.g., homework, study-group, question (comma-separated)"
                class="form-input"
              />
              <span class="input-hint">Separate tags with commas</span>
            </div>
            
            <div v-if="postError" class="error-message">
              {{ postError }}
              <button type="button" @click="postError = ''" class="error-close">×</button>
            </div>
            
            <div class="form-actions">
              <button 
                type="button" 
                @click="closeCreatePostForm" 
                class="cancel-btn"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                class="submit-btn"
                :disabled="communityBoard.isLoading || !createPostForm.title.trim() || !createPostForm.body.trim()"
              >
                <span v-if="communityBoard.isLoading" class="loading-spinner"></span>
                <span v-else>Create Post</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useStores } from '@/composables/useStores'

const route = useRoute()
const { community, communityBoard, auth } = useStores()

const isLoading = ref(true)
const error = ref('')
const showCreatePostForm = ref(false)
const postError = ref('')
const tagsInput = ref('')

const createPostForm = ref({
  title: '',
  body: ''
})

const communityId = computed(() => route.params.id as string)

const currentCommunity = computed(() => {
  return community.communities.find(c => c._id === communityId.value)
})

const communityPosts = computed(() => {
  return communityBoard.postsByCommunity(communityId.value)
})

const formatDate = (dateString: string) => {
  if (!dateString) return 'Unknown date'
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })
}

const handleCreatePost = async () => {
  try {
    postError.value = ''
    
    if (!auth.userId) {
      postError.value = 'You must be logged in to create a post'
      return
    }

    const title = createPostForm.value.title.trim()
    const body = createPostForm.value.body.trim()

    if (!title) {
      postError.value = 'Please enter a title'
      return
    }

    if (title.length < 3) {
      postError.value = 'Title must be at least 3 characters long'
      return
    }

    if (!body) {
      postError.value = 'Please enter a message'
      return
    }

    if (body.length < 10) {
      postError.value = 'Message must be at least 10 characters long'
      return
    }

    console.log('Creating post with data:', {
      title: createPostForm.value.title.trim(),
      body: createPostForm.value.body.trim(),
      tags: tagsInput.value,
      communityId: communityId.value,
      userId: auth.userId
    })

    // Parse tags from comma-separated string
    const tags = tagsInput.value
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0)

    await communityBoard.createPost(
      auth.userId,
      communityId.value,
      createPostForm.value.title.trim(),
      createPostForm.value.body.trim(),
      tags,
      '' // course is optional, empty for now
    )

    console.log('Post created successfully')
    closeCreatePostForm()
  } catch (error: any) {
    console.error('Failed to create post:', error)
    postError.value = error.response?.data?.error || error.message || 'Failed to create post'
  }
}

const closeCreatePostForm = () => {
  showCreatePostForm.value = false
  createPostForm.value = { title: '', body: '' }
  tagsInput.value = ''
  postError.value = ''
  communityBoard.clearError()
}

onMounted(async () => {
  try {
    isLoading.value = true
    error.value = ''
    
    // Fetch communities if not already loaded
    if (community.communities.length === 0) {
      await community.fetchCommunities()
    }
    
    // Check if community exists
    if (!currentCommunity.value) {
      error.value = 'This community could not be found.'
      return
    }

    // Fetch posts for this community
    await communityBoard.fetchPostsByCommunity(communityId.value)
    
  } catch (err: any) {
    console.error('Error loading community:', err)
    error.value = err.message || 'Failed to load community'
  } finally {
    isLoading.value = false
  }
})
</script>

<style scoped>
.community-board-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  min-height: 70vh;
}

/* Loading State */
.loading-container {
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

/* Error State */
.error-container {
  text-align: center;
  padding: 4rem 2rem;
  background: linear-gradient(145deg, #ffffff 0%, #fefdfb 100%);
  border-radius: 16px;
  border: 2px solid #e7e5e4;
  margin-top: 2rem;
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

.back-btn {
  display: inline-block;
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%);
  color: white;
  text-decoration: none;
  border-radius: 8px;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(30, 58, 138, 0.3);
}

.back-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(30, 58, 138, 0.4);
}

/* Board Content */
.board-content {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Header Section */
.board-header {
  background: linear-gradient(145deg, #ffffff 0%, #fefdfb 100%);
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 2rem;
  border: 2px solid #e7e5e4;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  position: relative;
}

.board-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #7c2d12 0%, #1e3a8a 50%, #d97706 100%);
  border-radius: 16px 16px 0 0;
}

.back-link {
  display: inline-flex;
  align-items: center;
  color: #78716c;
  text-decoration: none;
  font-weight: 500;
  margin-bottom: 1.5rem;
  transition: all 0.2s ease;
}

.back-link:hover {
  color: #7c2d12;
  transform: translateX(-4px);
}

.header-content {
  text-align: center;
}

.community-title {
  font-family: 'Sora', sans-serif;
  font-size: 2.5rem;
  font-weight: 800;
  color: #7c2d12;
  margin: 0 0 1rem 0;
  letter-spacing: -0.5px;
}

.community-description {
  font-size: 1.125rem;
  color: #78716c;
  margin: 0 0 1.5rem 0;
  line-height: 1.6;
}

.community-stats {
  display: flex;
  gap: 2rem;
  justify-content: center;
  flex-wrap: wrap;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #fef3c7;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  color: #1c1917;
}

.stat-icon {
  font-size: 1.25rem;
}

/* Posts Section */
.posts-section {
  background: linear-gradient(145deg, #ffffff 0%, #fefdfb 100%);
  border-radius: 16px;
  padding: 2rem;
  border: 2px solid #e7e5e4;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.section-header {
  margin-bottom: 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.section-header h2 {
  font-family: 'Sora', sans-serif;
  font-size: 2rem;
  font-weight: 700;
  color: #7c2d12;
  margin: 0;
  flex: 1;
}

.create-post-btn {
  background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: 0 4px 12px rgba(30, 58, 138, 0.3);
  font-size: 1rem;
}

.create-post-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(30, 58, 138, 0.4);
}

.btn-icon {
  font-size: 1.25rem;
  font-weight: bold;
  line-height: 1;
}

/* Posts Loading */
.posts-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  gap: 1rem;
}

.posts-loading p {
  color: #78716c;
  font-size: 1rem;
}

/* Posts List */
.posts-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.post-card {
  background: linear-gradient(145deg, #ffffff 0%, #fefdfb 100%);
  border: 2px solid #e7e5e4;
  border-radius: 12px;
  padding: 1.5rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.post-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #7c2d12 0%, #1e3a8a 50%, #d97706 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.post-card:hover::before {
  opacity: 1;
}

.post-card:hover {
  border-color: #7c2d12;
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(124, 45, 18, 0.1);
}

/* Post Header */
.post-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.post-author {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.author-avatar {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #bfdbfe 0%, #93c5fd 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  border: 2px solid #dbeafe;
  flex-shrink: 0;
}

.author-info {
  display: flex;
  flex-direction: column;
}

.author-name {
  font-weight: 600;
  color: #1c1917;
  font-size: 0.9375rem;
}

/* Post Content */
.post-title {
  font-family: 'Sora', sans-serif;
  font-size: 1.375rem;
  font-weight: 700;
  color: #7c2d12;
  margin: 0 0 0.75rem 0;
  line-height: 1.4;
}

.post-body {
  color: #1c1917;
  font-size: 1rem;
  line-height: 1.6;
  margin: 0 0 1rem 0;
  white-space: pre-wrap;
  word-wrap: break-word;
}

/* Post Footer */
.post-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e7e5e4;
}

.post-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.tag {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  background: #fef3c7;
  color: #92400e;
  border-radius: 6px;
  font-size: 0.8125rem;
  font-weight: 500;
  border: 1px solid #fde68a;
}

.post-meta {
  display: flex;
  align-items: center;
  gap: 1rem;
  color: #78716c;
  font-size: 0.875rem;
}

.reply-count {
  display: flex;
  align-items: center;
  gap: 0.375rem;
}

.meta-icon {
  font-size: 1rem;
}

/* Empty State */
.empty-posts {
  text-align: center;
  padding: 4rem 2rem;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.empty-posts h3 {
  font-family: 'Sora', sans-serif;
  font-size: 1.5rem;
  font-weight: 700;
  color: #7c2d12;
  margin: 0 0 0.5rem 0;
}

.empty-posts p {
  font-size: 1rem;
  color: #78716c;
  margin: 0;
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
  backdrop-filter: blur(2px);
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal-content {
  background: linear-gradient(145deg, #ffffff 0%, #fefdfb 100%);
  border-radius: 16px;
  box-shadow: 0 12px 40px rgba(124, 45, 18, 0.12);
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  border: 2px solid #e7e5e4;
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from { 
    opacity: 0;
    transform: translateY(20px); 
  }
  to { 
    opacity: 1;
    transform: translateY(0); 
  }
}

.modal-content::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #7c2d12 0%, #1e3a8a 50%, #d97706 100%);
  border-radius: 16px 16px 0 0;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2rem 2rem 1rem;
  border-bottom: 2px solid #e7e5e4;
}

.modal-header h2 {
  font-family: 'Sora', sans-serif;
  font-size: 1.75rem;
  font-weight: 700;
  color: #7c2d12;
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  font-size: 2rem;
  color: #78716c;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  transition: all 0.2s ease;
  line-height: 1;
}

.close-btn:hover {
  background: #fef3c7;
  color: #1c1917;
}

/* Form */
.create-form {
  padding: 2rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  color: #1c1917;
  font-weight: 600;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  letter-spacing: 0.3px;
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 0.875rem 1rem;
  border: 2px solid #e7e5e4;
  border-radius: 8px;
  font-size: 1rem;
  font-family: inherit;
  transition: all 0.2s ease;
  background-color: #fafaf9;
}

.form-textarea {
  resize: vertical;
  min-height: 120px;
  line-height: 1.6;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: #7c2d12;
  background-color: white;
  box-shadow: 0 0 0 3px rgba(124, 45, 18, 0.1);
}

.input-hint {
  display: block;
  font-size: 0.8125rem;
  color: #78716c;
  margin-top: 0.375rem;
  font-style: italic;
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

.submit-btn {
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: 0 2px 8px rgba(30, 58, 138, 0.3);
  font-size: 1rem;
  min-width: 120px;
  justify-content: center;
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

/* Responsive Design */
@media (max-width: 768px) {
  .community-board-page {
    padding: 1rem;
  }

  .board-header {
    padding: 1.5rem;
  }

  .community-title {
    font-size: 2rem;
  }

  .community-stats {
    gap: 1rem;
  }

  .posts-section {
    padding: 1.5rem;
  }

  .section-header {
    flex-direction: column;
    align-items: stretch;
  }

  .section-header h2 {
    text-align: center;
  }

  .create-post-btn {
    width: 100%;
    justify-content: center;
  }

  .modal-content {
    max-height: 95vh;
  }

  .modal-header {
    padding: 1.5rem 1.5rem 1rem;
  }

  .modal-header h2 {
    font-size: 1.5rem;
  }

  .create-form {
    padding: 1.5rem;
  }

  .form-actions {
    flex-direction: column;
  }

  .cancel-btn,
  .submit-btn {
    width: 100%;
  }
}
</style>

