import { ref, computed } from 'vue'
import { useUserProfileStore, type UserProfile } from '@/stores/userProfile'

/**
 * Composable for fetching and managing user profiles
 * Provides utilities for displaying user names and avatars
 */
export function useProfileHelper() {
  const userProfileStore = useUserProfileStore()
  const isLoading = ref(false)

  /**
   * Fetch profiles for multiple users at once
   * @param userIds Array of user IDs to fetch profiles for
   */
  const fetchProfilesForUsers = async (userIds: string[]) => {
    if (!userIds || userIds.length === 0) return

    isLoading.value = true
    const uniqueUserIds = [...new Set(userIds)] // Remove duplicates

    try {
      // Fetch profiles for users we don't have yet
      const fetchPromises = uniqueUserIds.map(async (userId) => {
        // Check if we already have this profile in the store
        const existingProfile = userProfileStore.profiles.find(p => p.user === userId)
        if (existingProfile) {
          return existingProfile
        }

        // Fetch from API
        try {
          const profile = await userProfileStore.fetchProfileByUser(userId)
          return profile
        } catch (error) {
          console.warn(`Failed to fetch profile for user ${userId}:`, error)
          return null
        }
      })

      await Promise.all(fetchPromises)
    } catch (error) {
      console.error('Error fetching profiles:', error)
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Get display name for a user ID
   * @param userId User ID
   * @returns Display name or fallback
   */
  const getDisplayName = (userId: string | null | undefined): string => {
    if (!userId) return 'Unknown User'

    const profile = userProfileStore.profiles.find(p => p.user === userId)
    return profile?.displayName || `User ${userId.slice(0, 8)}`
  }

  /**
   * Get profile for a user ID
   * @param userId User ID
   * @returns UserProfile or null
   */
  const getProfile = (userId: string | null | undefined): UserProfile | null => {
    if (!userId) return null
    return userProfileStore.profiles.find(p => p.user === userId) || null
  }

  /**
   * Get initials from a name
   * @param name Full name
   * @returns Initials (e.g., "SJ" for "Sarah Johnson")
   */
  const getInitials = (name: string | null | undefined): string => {
    if (!name) return '?'
    
    const parts = name.trim().split(' ')
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    }
    return name[0].toUpperCase()
  }

  /**
   * Get avatar URL or null
   * @param userId User ID
   * @returns Avatar URL or null
   */
  const getAvatarUrl = (userId: string | null | undefined): string | null => {
    if (!userId) return null
    
    const profile = userProfileStore.profiles.find(p => p.user === userId)
    return profile?.thumbnailImageURL || null
  }

  /**
   * Check if a profile exists for a user
   * @param userId User ID
   * @returns True if profile exists
   */
  const hasProfile = (userId: string | null | undefined): boolean => {
    if (!userId) return false
    return userProfileStore.profiles.some(p => p.user === userId)
  }

  return {
    isLoading: computed(() => isLoading.value),
    fetchProfilesForUsers,
    getDisplayName,
    getProfile,
    getInitials,
    getAvatarUrl,
    hasProfile
  }
}

