import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface UserProfile {
  _id: string
  user: string
  displayName: string
  bio: string
  thumbnailImageURL: string
}

export const useUserProfileStore = defineStore('userProfile', () => {
  // State
  const currentProfile = ref<UserProfile | null>(null)
  const profiles = ref<UserProfile[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const hasProfile = computed(() => currentProfile.value !== null)
  const displayName = computed(() => currentProfile.value?.displayName || '')
  const bio = computed(() => currentProfile.value?.bio || '')
  const thumbnailImageURL = computed(() => currentProfile.value?.thumbnailImageURL || '')

  // Actions
  const setCurrentProfile = (profile: UserProfile) => {
    currentProfile.value = profile
  }

  const setProfiles = (profileList: UserProfile[]) => {
    profiles.value = profileList
  }

  const addProfile = (profile: UserProfile) => {
    profiles.value.push(profile)
  }

  const updateProfile = (profileId: string, updates: Partial<UserProfile>) => {
    const profile = profiles.value.find(p => p._id === profileId)
    if (profile) {
      Object.assign(profile, updates)
    }
    
    if (currentProfile.value?._id === profileId) {
      Object.assign(currentProfile.value, updates)
    }
  }

  const removeProfile = (profileId: string) => {
    profiles.value = profiles.value.filter(p => p._id !== profileId)
    if (currentProfile.value?._id === profileId) {
      currentProfile.value = null
    }
  }

  const setLoading = (loading: boolean) => {
    isLoading.value = loading
  }

  const setError = (errorMessage: string | null) => {
    error.value = errorMessage
  }

  const clearProfile = () => {
    currentProfile.value = null
  }

  return {
    // State
    currentProfile,
    profiles,
    isLoading,
    error,
    
    // Getters
    hasProfile,
    displayName,
    bio,
    thumbnailImageURL,
    
    // Actions
    setCurrentProfile,
    setProfiles,
    addProfile,
    updateProfile,
    removeProfile,
    setLoading,
    setError,
    clearProfile
  }
})
