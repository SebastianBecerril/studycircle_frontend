import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

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
    setError
  }
})
