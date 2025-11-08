import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { studyCircleApi } from '@/services/studyCircleApi'
import { useAuthStore } from './auth'

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
  const auth = useAuthStore()

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
  const fetchProfileByUser = async (userId: string) => {
    setLoading(true)
    setError(null)
    try {
      const response = await studyCircleApi.getProfileByUser(userId)
      
      // API might return { profile: profileObject } or just the profile
      const profile = response.profile || response
      
      if (profile && profile._id) {
        setCurrentProfile(profile)
        
        // Also add to profiles array if not already there
        if (!profiles.value.find(p => p._id === profile._id)) {
          addProfile(profile)
        }
        
        return profile
      } else {
        // No profile found - this is not an error, user just hasn't created one yet
        setCurrentProfile(null)
        return null
      }
    } catch (err: any) {
      // 404 or no profile is not an error state - user just needs to create one
      if (err.response?.status === 404 || err.response?.data?.error?.includes('not found')) {
        setCurrentProfile(null)
        return null
      }
      
      setError(err.response?.data?.error || err.message || 'Failed to fetch profile')
      console.error('Error fetching profile:', err)
      return null
    } finally {
      setLoading(false)
    }
  }

  const createProfileAction = async (userId: string, displayName: string) => {
    setLoading(true)
    setError(null)
    try {
      const sessionId = requireSessionId()
      const response = await studyCircleApi.createProfile(sessionId, displayName)
      
      if (response.error) {
        setError(response.error)
        throw new Error(response.error)
      }
      
      const profileId = response.profile
      
      if (!profileId) {
        throw new Error('No profile ID returned from API')
      }
      
      // Create the profile object
      const newProfile: UserProfile = {
        _id: profileId,
        user: userId,
        displayName,
        bio: '',
        thumbnailImageURL: ''
      }
      
      setCurrentProfile(newProfile)
      addProfile(newProfile)
      
      return newProfile
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to create profile')
      console.error('Error creating profile:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const updateDisplayNameAction = async (profileId: string, newDisplayName: string) => {
    setError(null)
    try {
      const sessionId = requireSessionId()
      const response = await studyCircleApi.updateDisplayName(sessionId, profileId, newDisplayName)
      
      if (response.error) {
        setError(response.error)
        throw new Error(response.error)
      }
      
      // Update in store
      updateProfile(profileId, { displayName: newDisplayName })
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to update display name')
      console.error('Error updating display name:', err)
      throw err
    }
  }

  const updateBioAction = async (profileId: string, newBio: string) => {
    setError(null)
    try {
      const sessionId = requireSessionId()
      const response = await studyCircleApi.updateBio(sessionId, profileId, newBio)
      
      if (response.error) {
        setError(response.error)
        throw new Error(response.error)
      }
      
      // Update in store
      updateProfile(profileId, { bio: newBio })
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to update bio')
      console.error('Error updating bio:', err)
      throw err
    }
  }

  const updateThumbnailAction = async (profileId: string, newThumbnailImageURL: string) => {
    setError(null)
    try {
      const sessionId = requireSessionId()
      const response = await studyCircleApi.updateThumbnailImage(sessionId, profileId, newThumbnailImageURL)
      
      if (response.error) {
        setError(response.error)
        throw new Error(response.error)
      }
      
      // Update in store
      updateProfile(profileId, { thumbnailImageURL: newThumbnailImageURL })
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to update thumbnail')
      console.error('Error updating thumbnail:', err)
      throw err
    }
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
    clearProfile,
    clearError,
    
    // API Actions
    fetchProfileByUser,
    createProfileAction,
    updateDisplayNameAction,
    updateBioAction,
    updateThumbnailAction
  }
})
