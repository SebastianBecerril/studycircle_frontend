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

      <!-- Navigation Tabs -->
      <div class="board-navigation">
        <div class="nav-tabs">
          <button class="nav-tab active">
            <span class="tab-icon">💬</span>
            Board
          </button>
          <router-link 
            :to="`/community/${communityId}/schedule`" 
            class="nav-tab nav-tab-link"
          >
            <span class="tab-icon">📚</span>
            Shared Schedule
          </router-link>
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
                <div class="author-avatar">
                  <img 
                    v-if="profileHelper.getAvatarUrl(post.author)" 
                    :src="profileHelper.getAvatarUrl(post.author)!" 
                    alt="Avatar"
                  />
                  <span v-else class="avatar-initials">
                    {{ profileHelper.getInitials(profileHelper.getDisplayName(post.author)) }}
                  </span>
                </div>
                <div class="author-info">
                  <span class="author-name">{{ profileHelper.getDisplayName(post.author) }}</span>
                </div>
              </div>
              <button 
                v-if="post.author === auth.userId && !editingPost.has(post._id)"
                @click="startEditPost(post)"
                class="edit-post-btn"
                title="Edit post"
              >
                ✏️
              </button>
            </div>

            <!-- Edit Post Form -->
            <div v-if="editingPost.has(post._id)" class="edit-post-form">
              <div class="form-group">
                <input
                  v-model="editPostForms[post._id].title"
                  type="text"
                  placeholder="Title"
                  class="edit-input"
                />
              </div>
              <div class="form-group">
                <textarea
                  v-model="editPostForms[post._id].body"
                  placeholder="Message"
                  rows="4"
                  class="edit-textarea"
                ></textarea>
              </div>
              <div class="form-group">
                <input
                  v-model="editPostForms[post._id].tags"
                  type="text"
                  placeholder="Tags (comma-separated)"
                  class="edit-input"
                />
              </div>
              
              <div v-if="editPostErrors[post._id]" class="edit-error">
                {{ editPostErrors[post._id] }}
              </div>
              
              <div class="edit-actions">
                <button @click="cancelEditPost(post._id)" class="cancel-edit-btn">Cancel</button>
                <button 
                  @click="handleUpdatePost(post._id)" 
                  class="save-edit-btn"
                  :disabled="savingPost.has(post._id)"
                >
                  <span v-if="savingPost.has(post._id)" class="small-spinner"></span>
                  <span v-else>Save Changes</span>
                </button>
              </div>
            </div>

            <!-- Post Content (when not editing) -->
            <template v-if="!editingPost.has(post._id)">
              <h3 class="post-title">{{ post.title }}</h3>
              <p class="post-body">{{ post.body }}</p>
            </template>

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
                <button 
                  @click="toggleReplies(post._id)"
                  class="reply-count-btn"
                  :class="{ 'active': expandedPosts.has(post._id) }"
                >
                  <span class="meta-icon">💬</span>
                  {{ post.replies?.length || 0 }} {{ post.replies?.length === 1 ? 'reply' : 'replies' }}
                  <span class="expand-icon">{{ expandedPosts.has(post._id) ? '▲' : '▼' }}</span>
                </button>
              </div>
            </div>

            <!-- Replies Section -->
            <div v-if="expandedPosts.has(post._id)" class="replies-section">
              <div class="replies-header">
                <h4>Replies</h4>
                <button 
                  @click="showReplyForm(post._id)" 
                  class="add-reply-btn"
                  :disabled="replyingTo.has(post._id)"
                >
                  <span class="btn-icon">💬</span>
                  Reply
                </button>
              </div>

              <!-- Reply Form -->
              <div v-if="replyingTo.has(post._id)" class="reply-form">
                <textarea
                  v-model="replyForms[post._id]"
                  placeholder="Write your reply..."
                  rows="3"
                  class="reply-textarea"
                  @keydown.ctrl.enter="handleCreateReply(post._id)"
                  @keydown.meta.enter="handleCreateReply(post._id)"
                ></textarea>
                
                <div v-if="replyErrors[post._id]" class="reply-error">
                  {{ replyErrors[post._id] }}
                </div>
                
                <div class="reply-form-actions">
                  <button 
                    @click="cancelReply(post._id)" 
                    class="cancel-reply-btn"
                    type="button"
                  >
                    Cancel
                  </button>
                  <button 
                    @click="handleCreateReply(post._id)" 
                    class="submit-reply-btn"
                    :disabled="!replyForms[post._id]?.trim() || submittingReply.has(post._id)"
                    type="button"
                  >
                    <span v-if="submittingReply.has(post._id)" class="small-spinner"></span>
                    <span v-else>Post Reply</span>
                  </button>
                </div>
              </div>

              <!-- Loading Replies -->
              <div v-if="loadingReplies.has(post._id)" class="replies-loading">
                <div class="small-spinner"></div>
                <span>Loading replies...</span>
              </div>

              <!-- Replies List -->
              <div v-else-if="getPostReplies(post._id).length > 0" class="replies-list">
                <div 
                  v-for="reply in getPostReplies(post._id)" 
                  :key="reply._id"
                  class="reply-card"
                >
                  <div class="reply-header-section">
                    <div class="reply-author">
                      <div class="reply-avatar">
                        <img 
                          v-if="profileHelper.getAvatarUrl(reply.author)" 
                          :src="profileHelper.getAvatarUrl(reply.author)!" 
                          alt="Avatar"
                        />
                        <span v-else class="avatar-initials">
                          {{ profileHelper.getInitials(profileHelper.getDisplayName(reply.author)) }}
                        </span>
                      </div>
                      <div class="reply-author-info">
                        <span class="reply-author-name">{{ profileHelper.getDisplayName(reply.author) }}</span>
                      </div>
                    </div>
                    <button 
                      v-if="reply.author === auth.userId && !editingReply.has(reply._id)"
                      @click="startEditReply(reply)"
                      class="edit-reply-btn"
                      title="Edit reply"
                    >
                      ✏️
                    </button>
                  </div>
                  
                  <!-- Edit Reply Form -->
                  <div v-if="editingReply.has(reply._id)" class="edit-reply-form">
                    <textarea
                      v-model="editReplyForms[reply._id]"
                      placeholder="Edit your reply..."
                      rows="3"
                      class="edit-textarea"
                    ></textarea>
                    
                    <div v-if="editReplyErrors[reply._id]" class="edit-error">
                      {{ editReplyErrors[reply._id] }}
                    </div>
                    
                    <div class="edit-actions">
                      <button @click="cancelEditReply(reply._id)" class="cancel-edit-btn">Cancel</button>
                      <button 
                        @click="handleUpdateReply(reply._id)" 
                        class="save-edit-btn"
                        :disabled="savingReply.has(reply._id)"
                      >
                        <span v-if="savingReply.has(reply._id)" class="small-spinner"></span>
                        <span v-else>Save Changes</span>
                      </button>
                    </div>
                  </div>
                  
                  <!-- Reply Content (when not editing) -->
                  <p v-if="!editingReply.has(reply._id)" class="reply-body">{{ reply.body }}</p>
                </div>
              </div>

              <!-- No Replies -->
              <div v-else-if="!replyingTo.has(post._id)" class="no-replies">
                <span class="no-replies-icon">💭</span>
                <p>No replies yet. Be the first to respond!</p>
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
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useStores } from '@/composables/useStores'
import { useProfileHelper } from '@/composables/useProfileHelper'

const route = useRoute()
const { community, communityBoard, auth } = useStores()
const profileHelper = useProfileHelper()

const isLoading = ref(true)
const error = ref('')
const showCreatePostForm = ref(false)
const postError = ref('')
const tagsInput = ref('')
const expandedPosts = ref(new Set<string>())
const loadingReplies = ref(new Set<string>())
const replyingTo = ref(new Set<string>())
const submittingReply = ref(new Set<string>())
const replyForms = ref<Record<string, string>>({})
const replyErrors = ref<Record<string, string>>({})
const editingPost = ref(new Set<string>())
const savingPost = ref(new Set<string>())
const editPostForms = ref<Record<string, any>>({})
const editPostErrors = ref<Record<string, string>>({})
const editingReply = ref(new Set<string>())
const savingReply = ref(new Set<string>())
const editReplyForms = ref<Record<string, string>>({})
const editReplyErrors = ref<Record<string, string>>({})

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

// Watch posts and fetch profiles for authors
watch(communityPosts, async (posts) => {
  if (posts && posts.length > 0) {
    const authorIds = posts.map(post => post.author).filter(Boolean)
    if (authorIds.length > 0) {
      await profileHelper.fetchProfilesForUsers(authorIds)
    }
  }
}, { immediate: true })

const formatDate = (dateString: string) => {
  if (!dateString) return 'Unknown date'
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })
}

const getPostReplies = (postId: string) => {
  return communityBoard.repliesForPost(postId)
}

const toggleReplies = async (postId: string) => {
  if (expandedPosts.value.has(postId)) {
    // Collapse
    expandedPosts.value.delete(postId)
  } else {
    // Expand and fetch replies
    expandedPosts.value.add(postId)
    
    // Fetch replies if not already loaded
    const replies = communityBoard.repliesForPost(postId)
    if (replies.length === 0) {
      loadingReplies.value.add(postId)
      try {
        await communityBoard.fetchRepliesForPost(postId)
        
        // Fetch profiles for reply authors
        const replyAuthors = communityBoard.repliesForPost(postId).map(r => r.author).filter(Boolean)
        if (replyAuthors.length > 0) {
          await profileHelper.fetchProfilesForUsers(replyAuthors)
        }
      } catch (error) {
        console.error('Failed to fetch replies:', error)
      } finally {
        loadingReplies.value.delete(postId)
      }
    }
  }
}

const showReplyForm = (postId: string) => {
  replyingTo.value.add(postId)
  if (!replyForms.value[postId]) {
    replyForms.value[postId] = ''
  }
  replyErrors.value[postId] = ''
}

const cancelReply = (postId: string) => {
  replyingTo.value.delete(postId)
  replyForms.value[postId] = ''
  replyErrors.value[postId] = ''
}

const handleCreateReply = async (postId: string) => {
  try {
    replyErrors.value[postId] = ''
    
    if (!auth.userId) {
      replyErrors.value[postId] = 'You must be logged in to reply'
      return
    }

    const replyBody = replyForms.value[postId]?.trim()
    
    if (!replyBody) {
      replyErrors.value[postId] = 'Please enter a reply'
      return
    }

    if (replyBody.length < 3) {
      replyErrors.value[postId] = 'Reply must be at least 3 characters'
      return
    }

    console.log('Creating reply:', { postId, body: replyBody })

    submittingReply.value.add(postId)

    await communityBoard.createReply(postId, auth.userId, replyBody)
    
    // Fetch profile for current user if not already loaded
    if (!profileHelper.hasProfile(auth.userId)) {
      await profileHelper.fetchProfilesForUsers([auth.userId])
    }

    console.log('Reply created successfully')
    
    // Clear form and close
    replyForms.value[postId] = ''
    replyingTo.value.delete(postId)
    replyErrors.value[postId] = ''
    
  } catch (error: any) {
    console.error('Failed to create reply:', error)
    replyErrors.value[postId] = error.message || 'Failed to create reply'
  } finally {
    submittingReply.value.delete(postId)
  }
}

const startEditPost = (post: any) => {
  editingPost.value.add(post._id)
  editPostForms.value[post._id] = {
    title: post.title,
    body: post.body,
    tags: post.tags.join(', ')
  }
  editPostErrors.value[post._id] = ''
}

const cancelEditPost = (postId: string) => {
  editingPost.value.delete(postId)
  delete editPostForms.value[postId]
  editPostErrors.value[postId] = ''
}

const handleUpdatePost = async (postId: string) => {
  try {
    editPostErrors.value[postId] = ''
    
    if (!auth.userId) {
      editPostErrors.value[postId] = 'You must be logged in to edit'
      return
    }

    const title = editPostForms.value[postId].title?.trim()
    const body = editPostForms.value[postId].body?.trim()
    
    if (!title || title.length < 3) {
      editPostErrors.value[postId] = 'Title must be at least 3 characters'
      return
    }

    if (!body || body.length < 10) {
      editPostErrors.value[postId] = 'Body must be at least 10 characters'
      return
    }

    const tags = editPostForms.value[postId].tags
      .split(',')
      .map((tag: string) => tag.trim())
      .filter((tag: string) => tag.length > 0)

    console.log('Updating post:', { postId, title, body, tags })

    savingPost.value.add(postId)

    await communityBoard.updatePostAction(postId, title, body, tags, '', auth.userId)

    console.log('Post updated successfully')
    
    // Close edit form
    editingPost.value.delete(postId)
    delete editPostForms.value[postId]
    editPostErrors.value[postId] = ''
    
  } catch (error: any) {
    console.error('Failed to update post:', error)
    editPostErrors.value[postId] = error.message || 'Failed to update post'
  } finally {
    savingPost.value.delete(postId)
  }
}

const startEditReply = (reply: any) => {
  editingReply.value.add(reply._id)
  editReplyForms.value[reply._id] = reply.body
  editReplyErrors.value[reply._id] = ''
}

const cancelEditReply = (replyId: string) => {
  editingReply.value.delete(replyId)
  delete editReplyForms.value[replyId]
  editReplyErrors.value[replyId] = ''
}

const handleUpdateReply = async (replyId: string) => {
  try {
    editReplyErrors.value[replyId] = ''
    
    if (!auth.userId) {
      editReplyErrors.value[replyId] = 'You must be logged in to edit'
      return
    }

    const body = editReplyForms.value[replyId]?.trim()
    
    if (!body || body.length < 3) {
      editReplyErrors.value[replyId] = 'Reply must be at least 3 characters'
      return
    }

    console.log('Updating reply:', { replyId, body })

    savingReply.value.add(replyId)

    await communityBoard.updateReplyAction(replyId, body, auth.userId)

    console.log('Reply updated successfully')
    
    // Close edit form
    editingReply.value.delete(replyId)
    delete editReplyForms.value[replyId]
    editReplyErrors.value[replyId] = ''
    
  } catch (error: any) {
    console.error('Failed to update reply:', error)
    editReplyErrors.value[replyId] = error.message || 'Failed to update reply'
  } finally {
    savingReply.value.delete(replyId)
  }
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

/* Board Navigation */
.board-navigation {
  margin-bottom: 2rem;
}

.nav-tabs {
  display: flex;
  gap: 0.5rem;
  background: linear-gradient(145deg, #ffffff 0%, #fefdfb 100%);
  padding: 0.5rem;
  border-radius: 12px;
  border: 2px solid #e7e5e4;
}

.nav-tab {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: transparent;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #78716c;
  font-size: 1rem;
  font-family: inherit;
}

.nav-tab:hover {
  background: #fef3c7;
  color: #1c1917;
}

.nav-tab.active {
  background: #7c2d12;
  color: white;
  box-shadow: 0 2px 8px rgba(124, 45, 18, 0.3);
}

.nav-tab-link {
  text-decoration: none;
}

.tab-icon {
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
  background: linear-gradient(135deg, #fde68a 0%, #fcd34d 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #e7e5e4;
  flex-shrink: 0;
  overflow: hidden;
}

.author-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.author-avatar .avatar-initials {
  font-size: 0.875rem;
  font-weight: 700;
  color: #92400e;
  font-family: 'Sora', sans-serif;
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

/* Edit Post Button */
.edit-post-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 1.25rem;
  padding: 0.5rem;
  border-radius: 6px;
  transition: all 0.2s ease;
  opacity: 0.6;
}

.edit-post-btn:hover {
  opacity: 1;
  background: #fef3c7;
}

/* Edit Post Form */
.edit-post-form {
  background: #fafaf9;
  border: 2px solid #e7e5e4;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group:last-of-type {
  margin-bottom: 0;
}

.edit-input {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e7e5e4;
  border-radius: 8px;
  font-size: 0.9375rem;
  font-family: inherit;
  transition: all 0.2s ease;
  background: white;
}

.edit-input:focus {
  outline: none;
  border-color: #1e3a8a;
  box-shadow: 0 0 0 3px rgba(30, 58, 138, 0.1);
}

.edit-textarea {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e7e5e4;
  border-radius: 8px;
  font-size: 0.9375rem;
  font-family: inherit;
  resize: vertical;
  transition: all 0.2s ease;
  background: white;
  min-height: 80px;
}

.edit-textarea:focus {
  outline: none;
  border-color: #1e3a8a;
  box-shadow: 0 0 0 3px rgba(30, 58, 138, 0.1);
}

.edit-error {
  background: #fef2f2;
  color: #7c2d12;
  padding: 0.625rem 0.875rem;
  border-radius: 6px;
  border: 1px solid #fecaca;
  border-left: 3px solid #7c2d12;
  margin-top: 0.75rem;
  font-size: 0.8125rem;
}

.edit-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
  margin-top: 1rem;
}

.cancel-edit-btn {
  padding: 0.625rem 1.25rem;
  background: white;
  color: #78716c;
  border: 2px solid #e7e5e4;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.875rem;
}

.cancel-edit-btn:hover {
  border-color: #78716c;
  background: #fafaf9;
}

.save-edit-btn {
  padding: 0.625rem 1.25rem;
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
  font-size: 0.875rem;
  min-width: 120px;
  justify-content: center;
}

.save-edit-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(30, 58, 138, 0.4);
}

.save-edit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
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

.reply-count-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: transparent;
  border: none;
  color: #78716c;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  transition: all 0.2s ease;
  font-family: inherit;
}

.reply-count-btn:hover {
  background: #fef3c7;
  color: #1c1917;
}

.reply-count-btn.active {
  background: #1e3a8a;
  color: white;
}

.expand-icon {
  font-size: 0.625rem;
  margin-left: 0.25rem;
}

.meta-icon {
  font-size: 1rem;
}

/* Replies Section */
.replies-section {
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 2px solid #e7e5e4;
}

.replies-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.replies-header h4 {
  font-family: 'Sora', sans-serif;
  font-size: 1.125rem;
  font-weight: 600;
  color: #1c1917;
  margin: 0;
}

.add-reply-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.875rem;
  box-shadow: 0 2px 8px rgba(30, 58, 138, 0.3);
}

.add-reply-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(30, 58, 138, 0.4);
}

.add-reply-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-icon {
  font-size: 1rem;
}

/* Reply Form */
.reply-form {
  background: #fafaf9;
  border: 2px solid #e7e5e4;
  border-radius: 12px;
  padding: 1rem;
  margin-bottom: 1.5rem;
}

.reply-textarea {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e7e5e4;
  border-radius: 8px;
  font-size: 0.9375rem;
  font-family: inherit;
  resize: vertical;
  transition: all 0.2s ease;
  background: white;
}

.reply-textarea:focus {
  outline: none;
  border-color: #1e3a8a;
  box-shadow: 0 0 0 3px rgba(30, 58, 138, 0.1);
}

.reply-error {
  background: #fef2f2;
  color: #7c2d12;
  padding: 0.625rem 0.875rem;
  border-radius: 6px;
  border: 1px solid #fecaca;
  border-left: 3px solid #7c2d12;
  margin-top: 0.75rem;
  font-size: 0.8125rem;
}

.reply-form-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
  margin-top: 0.75rem;
}

.cancel-reply-btn {
  padding: 0.625rem 1.25rem;
  background: white;
  color: #78716c;
  border: 2px solid #e7e5e4;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.875rem;
}

.cancel-reply-btn:hover {
  border-color: #78716c;
  background: #fafaf9;
}

.submit-reply-btn {
  padding: 0.625rem 1.25rem;
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
  font-size: 0.875rem;
  min-width: 100px;
  justify-content: center;
}

.submit-reply-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(30, 58, 138, 0.4);
}

.submit-reply-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.replies-loading {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1.5rem;
  color: #78716c;
  justify-content: center;
}

.small-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid #e7e5e4;
  border-top: 2px solid #1e3a8a;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.replies-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.reply-card {
  background: #fafaf9;
  border: 1px solid #e7e5e4;
  border-radius: 12px;
  padding: 1rem;
  transition: all 0.2s ease;
}

.reply-card:hover {
  border-color: #d4d4d8;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.reply-author {
  display: flex;
  align-items: center;
  gap: 0.625rem;
}

.reply-avatar {
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, #fde68a 0%, #fcd34d 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #e7e5e4;
  flex-shrink: 0;
  overflow: hidden;
}

.reply-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.reply-avatar .avatar-initials {
  font-size: 0.75rem;
  font-weight: 700;
  color: #92400e;
  font-family: 'Sora', sans-serif;
}

.reply-author-info {
  display: flex;
  flex-direction: column;
}

.reply-author-name {
  font-weight: 600;
  color: #1c1917;
  font-size: 0.9375rem;
}

.reply-header-section {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.75rem;
}

.edit-reply-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  padding: 0.375rem;
  border-radius: 6px;
  transition: all 0.2s ease;
  opacity: 0.6;
}

.edit-reply-btn:hover {
  opacity: 1;
  background: #fef3c7;
}

.edit-reply-form {
  margin-top: 0.5rem;
}

.reply-body {
  color: #1c1917;
  line-height: 1.6;
  margin: 0;
  font-size: 0.9375rem;
  white-space: pre-wrap;
}

.no-replies {
  text-align: center;
  padding: 2rem;
  color: #78716c;
}

.no-replies-icon {
  font-size: 2.5rem;
  display: block;
  margin-bottom: 0.5rem;
}

.no-replies p {
  margin: 0;
  font-size: 0.9375rem;
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

