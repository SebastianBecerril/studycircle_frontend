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

