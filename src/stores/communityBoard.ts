import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { studyCircleApi } from '@/services/studyCircleApi'

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

  // API Actions
  const fetchPostsByCommunity = async (communityId: string) => {
    setLoading(true)
    setError(null)
    try {
      const response = await studyCircleApi.getPostsByCommunity(communityId)
      console.log('Fetch posts response:', response)
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
      console.log('Fetch replies response:', response)
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
      const response = await studyCircleApi.createPost(author, community, title, body, tags, course)
      console.log('Create post response:', response)
      
      // The API returns { posting: "postId" } or { post: "postId" }
      const postId = response.posting || response.post
      
      if (postId) {
        try {
          const fullPost = await studyCircleApi.getPostById(postId)
          console.log('Full post data:', fullPost)
          
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
    createPost
  }
})
