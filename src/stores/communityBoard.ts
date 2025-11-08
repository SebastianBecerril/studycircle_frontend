import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { studyCircleApi } from '@/services/studyCircleApi'
import { useAuthStore } from './auth'

export interface Post {
  _id: string
  author: string
  community: string
  title: string
  body: string
  tags: string[]
  course: string
  replies: string[]
}

export interface Reply {
  _id: string
  author: string
  posting: string
  body: string
}

export const useCommunityBoardStore = defineStore('communityBoard', () => {
  // State
  const posts = ref<Post[]>([])
  const replies = ref<Reply[]>([])
  const currentPost = ref<Post | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const auth = useAuthStore()

  // Getters
  const postsByCommunity = computed(() => (communityId: string) => {
    return posts.value.filter(p => p.community === communityId)
  })

  const postsByCourse = computed(() => (courseId: string) => {
    return posts.value.filter(p => p.course === courseId)
  })

  const postsByTag = computed(() => (tag: string) => {
    return posts.value.filter(p => p.tags.includes(tag))
  })

  const repliesForPost = computed(() => (postId: string) => {
    return replies.value.filter(r => r.posting === postId)
  })

  const userPosts = computed(() => (userId: string) => {
    return posts.value.filter(p => p.author === userId)
  })

  const userReplies = computed(() => (userId: string) => {
    return replies.value.filter(r => r.author === userId)
  })

  // Actions
  const setPosts = (postList: Post[]) => {
    posts.value = postList
  }

  const setReplies = (replyList: Reply[]) => {
    replies.value = replyList
  }

  const addPost = (post: Post) => {
    posts.value.unshift(post) // Add to beginning for newest first
  }

  const updatePost = (postId: string, updates: Partial<Post>) => {
    const post = posts.value.find(p => p._id === postId)
    if (post) {
      Object.assign(post, updates)
    }
    
    if (currentPost.value?._id === postId) {
      Object.assign(currentPost.value, updates)
    }
  }

  const removePost = (postId: string) => {
    posts.value = posts.value.filter(p => p._id !== postId)
    replies.value = replies.value.filter(r => r.posting !== postId)
    
    if (currentPost.value?._id === postId) {
      currentPost.value = null
    }
  }

  const addReply = (reply: Reply) => {
    replies.value.push(reply)
    
    // Update the post's replies array
    const post = posts.value.find(p => p._id === reply.posting)
    if (post && !post.replies.includes(reply._id)) {
      post.replies.push(reply._id)
    }
  }

  const updateReply = (replyId: string, updates: Partial<Reply>) => {
    const reply = replies.value.find(r => r._id === replyId)
    if (reply) {
      Object.assign(reply, updates)
    }
  }

  const removeReply = (replyId: string) => {
    const reply = replies.value.find(r => r._id === replyId)
    if (reply) {
      // Remove from post's replies array
      const post = posts.value.find(p => p._id === reply.posting)
      if (post) {
        post.replies = post.replies.filter(r => r !== replyId)
      }
    }
    
    replies.value = replies.value.filter(r => r._id !== replyId)
  }

  const setCurrentPost = (post: Post | null) => {
    currentPost.value = post
  }

  const setLoading = (loading: boolean) => {
    isLoading.value = loading
  }

  const setError = (errorMessage: string | null) => {
    error.value = errorMessage
  }

  const clearError = () => {
    error.value = null
  }

  const requireSessionId = () => {
    const sessionId = auth.currentSession?.sessionId
    if (!sessionId) {
      const message = 'You must be logged in to perform this action'
      setError(message)
      throw new Error(message)
    }
    return sessionId
  }

  // API Actions
  const fetchPostsByCommunity = async (communityId: string) => {
    setLoading(true)
    setError(null)
    try {
      const response = await studyCircleApi.getPostsByCommunity(communityId)
      // API returns array of posts directly
      setPosts(response || [])
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to fetch posts')
      console.error('Error fetching posts:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchRepliesForPost = async (postId: string) => {
    setError(null)
    try {
      const response = await studyCircleApi.getRepliesForPost(postId)
      // API returns array of replies directly
      const newReplies = response || []
      
      // Add replies that aren't already in the store
      newReplies.forEach((reply: Reply) => {
        if (!replies.value.find(r => r._id === reply._id)) {
          addReply(reply)
        }
      })
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to fetch replies')
      console.error('Error fetching replies:', err)
    }
  }

  const createPost = async (
    author: string,
    community: string,
    title: string,
    body: string,
    tags: string[],
    course: string = ''
  ) => {
    setLoading(true)
    setError(null)
    try {
      const sessionId = requireSessionId()
      const response = await studyCircleApi.createPost(sessionId, community, title, body, tags, course)
      
      if (response.error) {
        setError(response.error)
        throw new Error(response.error)
      }
      
      // The API returns { posting: "postId" } or { post: "postId" }
      const postId = response.posting || response.post
      
      if (postId) {
        try {
          const fullPost = await studyCircleApi.getPostById(postId)
          
          // The getPostById might return { post: postObject } or { posting: postObject }
          const postData = fullPost.post || fullPost.posting || fullPost
          
          if (postData && postData._id) {
            addPost(postData)
            return postData
          } else {
            // Create basic post object
            const basicPost: Post = {
              _id: postId,
              author,
              community,
              title,
              body,
              tags,
              course,
              replies: []
            }
            addPost(basicPost)
            return basicPost
          }
        } catch (fetchError) {
          console.warn('Could not fetch full post, creating basic post:', fetchError)
          const basicPost: Post = {
            _id: postId,
            author,
            community,
            title,
            body,
            tags,
            course,
            replies: []
          }
          addPost(basicPost)
          return basicPost
        }
      } else {
        console.error('Full API response:', response)
        throw new Error('No post ID returned from API')
      }
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to create post')
      console.error('Error creating post:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const createReply = async (postingId: string, authorId: string, body: string) => {
    setError(null)
    try {
      const sessionId = requireSessionId()
      const response = await studyCircleApi.replyToPost(sessionId, postingId, body)
      
      if (response.error) {
        setError(response.error)
        throw new Error(response.error)
      }
      
      // The API returns { reply: "replyId" }
      const replyId = response.reply
      
      if (replyId) {
        // Create the reply object
        const newReply: Reply = {
          _id: replyId,
          author: authorId,
          posting: postingId,
          body
        }
        
        addReply(newReply)
        return newReply
      } else {
        throw new Error('No reply ID returned from API')
      }
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to create reply')
      console.error('Error creating reply:', err)
      throw err
    }
  }

  const updatePostAction = async (
    postingId: string,
    newTitle: string,
    newBody: string,
    newTags: string[],
    newCourse: string,
    requesterId: string
  ) => {
    setError(null)
    try {
      const sessionId = requireSessionId()
      const response = await studyCircleApi.updatePost(sessionId, postingId, newTitle, newBody, newTags, newCourse)
      
      if (response.error) {
        setError(response.error)
        throw new Error(response.error)
      }
      
      // Update in store
      updatePost(postingId, {
        title: newTitle,
        body: newBody,
        tags: newTags,
        course: newCourse
      })
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to update post')
      console.error('Error updating post:', err)
      throw err
    }
  }

  const updateReplyAction = async (replyId: string, newBody: string, requesterId: string) => {
    setError(null)
    try {
      const sessionId = requireSessionId()
      const response = await studyCircleApi.updateReply(sessionId, replyId, newBody)
      
      if (response.error) {
        setError(response.error)
        throw new Error(response.error)
      }
      
      // Update in store
      updateReply(replyId, { body: newBody })
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to update reply')
      console.error('Error updating reply:', err)
      throw err
    }
  }

  const deletePostAction = async (postId: string, requesterId: string) => {
    setError(null)
    try {
      const sessionId = requireSessionId()
      const response = await studyCircleApi.deletePost(sessionId, postId)
      
      if (response.error) {
        setError(response.error)
        throw new Error(response.error)
      }
      
      // Remove from store
      removePost(postId)
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to delete post')
      console.error('Error deleting post:', err)
      throw err
    }
  }

  const deleteReplyAction = async (replyId: string, requesterId: string) => {
    setError(null)
    try {
      const sessionId = requireSessionId()
      const response = await studyCircleApi.deleteReply(sessionId, replyId)
      
      if (response.error) {
        setError(response.error)
        throw new Error(response.error)
      }
      
      // Remove from store
      removeReply(replyId)
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to delete reply')
      console.error('Error deleting reply:', err)
      throw err
    }
  }

  return {
    // State
    posts,
    replies,
    currentPost,
    isLoading,
    error,
    
    // Getters
    postsByCommunity,
    postsByCourse,
    postsByTag,
    repliesForPost,
    userPosts,
    userReplies,
    
    // Actions
    setPosts,
    setReplies,
    addPost,
    updatePost,
    removePost,
    addReply,
    updateReply,
    removeReply,
    setCurrentPost,
    setLoading,
    setError,
    clearError,
    
    // API Actions
    fetchPostsByCommunity,
    fetchRepliesForPost,
    createPost,
    createReply,
    updatePostAction,
    updateReplyAction,
    deletePostAction,
    deleteReplyAction
  }
})
