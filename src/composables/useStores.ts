import { useAuthStore } from '@/stores/auth'
import { useUserProfileStore } from '@/stores/userProfile'
import { useCommunityStore } from '@/stores/community'
import { useCommunityBoardStore } from '@/stores/communityBoard'
import { useCourseCatalogStore } from '@/stores/courseCatalog'
import { useUserEnrollmentsStore } from '@/stores/userEnrollments'

/**
 * Composable that provides access to all Pinia stores
 * This makes it easy to access multiple stores in a single component
 */
export function useStores() {
  return {
    auth: useAuthStore(),
    userProfile: useUserProfileStore(),
    community: useCommunityStore(),
    communityBoard: useCommunityBoardStore(),
    courseCatalog: useCourseCatalogStore(),
    userEnrollments: useUserEnrollmentsStore()
  }
}

/**
 * Composable for common store operations
 * Provides helper functions for common patterns
 */
export function useStoreHelpers() {
  const { auth, userProfile, community, communityBoard, courseCatalog, userEnrollments } = useStores()

  const clearAllErrors = () => {
    auth.setError(null)
    userProfile.setError(null)
    community.setError(null)
    communityBoard.setError(null)
    courseCatalog.setError(null)
    userEnrollments.setError(null)
  }

  const setAllLoading = (loading: boolean) => {
    auth.setLoading(loading)
    userProfile.setLoading(loading)
    community.setLoading(loading)
    communityBoard.setLoading(loading)
    courseCatalog.setLoading(loading)
    userEnrollments.setLoading(loading)
  }

  const resetAllStores = () => {
    auth.clearAuth()
    userProfile.clearProfile()
    community.setCommunities([])
    community.setMemberships([])
    communityBoard.setPosts([])
    communityBoard.setReplies([])
    courseCatalog.setTerms([])
    courseCatalog.setCourses([])
    courseCatalog.setSections([])
    userEnrollments.clearEnrollments()
  }

  return {
    clearAllErrors,
    setAllLoading,
    resetAllStores
  }
}
