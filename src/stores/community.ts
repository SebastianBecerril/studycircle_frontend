import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { studyCircleApi } from '@/services/studyCircleApi'
import { useAuthStore } from './auth'

export interface Community {
  _id: string
  name: string
  description: string
  creationDate: string
  memberships?: string[]
}

export interface Membership {
  _id: string
  user: string
  community: string
  role: 'ADMIN' | 'MEMBER'
  joinDate: string
}

export const useCommunityStore = defineStore('community', () => {
  // State
  const communities = ref<Community[]>([])
  const memberships = ref<Membership[]>([])
  const currentCommunity = ref<Community | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const userCommunities = computed(() => {
    const auth = useAuthStore()
    const userId = auth.userId
    if (!userId) return []
    const userMemberships = memberships.value.filter(m => m.user === userId)
    return communities.value.filter(c => 
      userMemberships.some(m => m.community === c._id)
    )
  })

  const adminCommunities = computed(() => {
    const auth = useAuthStore()
    const userId = auth.userId
    if (!userId) return []
    const adminMemberships = memberships.value.filter(m => 
      m.user === userId && m.role === 'ADMIN'
    )
    return communities.value.filter(c => 
      adminMemberships.some(m => m.community === c._id)
    )
  })

  const communityMembers = computed(() => (communityId: string) => {
    return memberships.value.filter(m => m.community === communityId)
  })

  const isUserAdmin = computed(() => (communityId: string) => {
    const auth = useAuthStore()
    const userId = auth.userId
    if (!userId) return false
    const membership = memberships.value.find(m => 
      m.community === communityId && m.user === userId
    )
    return membership?.role === 'ADMIN'
  })

  // Actions
  const setCommunities = (communityList: Community[]) => {
    communities.value = communityList
  }

  const setMemberships = (membershipList: Membership[]) => {
    memberships.value = membershipList
  }

  const addCommunity = (community: Community) => {
    communities.value.push(community)
  }

  const updateCommunity = (communityId: string, updates: Partial<Community>) => {
    const community = communities.value.find(c => c._id === communityId)
    if (community) {
      Object.assign(community, updates)
    }
    
    if (currentCommunity.value?._id === communityId) {
      Object.assign(currentCommunity.value, updates)
    }
  }

  const removeCommunity = (communityId: string) => {
    communities.value = communities.value.filter(c => c._id !== communityId)
    memberships.value = memberships.value.filter(m => m.community !== communityId)
    
    if (currentCommunity.value?._id === communityId) {
      currentCommunity.value = null
    }
  }

  const addMembership = (membership: Membership) => {
    memberships.value.push(membership)
  }

  const updateMembership = (membershipId: string, updates: Partial<Membership>) => {
    const membership = memberships.value.find(m => m._id === membershipId)
    if (membership) {
      Object.assign(membership, updates)
    }
  }

  const removeMembership = (membershipId: string) => {
    memberships.value = memberships.value.filter(m => m._id !== membershipId)
  }

  const setCurrentCommunity = (community: Community | null) => {
    currentCommunity.value = community
  }

  const setLoading = (loading: boolean) => {
    isLoading.value = loading
  }

  const setError = (errorMessage: string | null) => {
    error.value = errorMessage
  }

  // API Actions
  const fetchCommunities = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await studyCircleApi.getAllCommunities()
      // The API returns an array of communities directly
      setCommunities(response || [])
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to fetch communities')
      console.error('Error fetching communities:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchMemberships = async () => {
    setError(null)
    try {
      const response = await studyCircleApi.getAllMemberships()
      // The API returns an array of memberships directly
      setMemberships(response || [])
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to fetch memberships')
      console.error('Error fetching memberships:', err)
    }
  }

  const createCommunity = async (communityData: { name: string; description: string }, creatorId: string) => {
    setLoading(true)
    setError(null)
    try {
      const response = await studyCircleApi.createCommunity(communityData.name, communityData.description, creatorId)
      
      // The API returns { community: "string (ID)" }, so we need to fetch the full community data
      if (response.community) {
        try {
          // Fetch the full community data
          const fullCommunity = await studyCircleApi.getCommunityById(response.community)
          
          // Check if the response has the expected structure
          if (fullCommunity && fullCommunity.community) {
            addCommunity(fullCommunity.community)
            return fullCommunity.community
          } else {
            // If the structure is different, create a basic community object
            const basicCommunity: Community = {
              _id: response.community,
              name: communityData.name,
              description: communityData.description,
              creationDate: new Date().toISOString(),
              memberships: []
            }
            addCommunity(basicCommunity)
            return basicCommunity
          }
        } catch (fetchError) {
          console.warn('Could not fetch full community data, creating basic community:', fetchError)
          // If fetching fails, create a basic community object
          const basicCommunity: Community = {
            _id: response.community,
            name: communityData.name,
            description: communityData.description,
            creationDate: new Date().toISOString(),
            memberships: []
          }
          addCommunity(basicCommunity)
          return basicCommunity
        }
      } else {
        throw new Error('No community ID returned from API')
      }
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to create community')
      console.error('Error creating community:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const joinCommunity = async (communityId: string, userId: string) => {
    setLoading(true)
    setError(null)
    try {
      const response = await studyCircleApi.joinCommunity(communityId, userId)
      
      // Create a membership object for the local state
      const membership: Membership = {
        _id: `temp-${Date.now()}`, // Temporary ID
        user: userId,
        community: communityId,
        role: 'MEMBER',
        joinDate: new Date().toISOString()
      }
      addMembership(membership)
      
      // Update the community's member count
      const community = communities.value.find(c => c._id === communityId)
      if (community) {
        if (!community.memberships) {
          community.memberships = []
        }
        community.memberships.push(membership._id)
      }
      
      return response
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to join community')
      console.error('Error joining community:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const leaveCommunity = async (communityId: string, userId: string) => {
    setLoading(true)
    setError(null)
    try {
      const response = await studyCircleApi.leaveCommunity(communityId, userId)
      // Find and remove the membership
      const membership = memberships.value.find(m => 
        m.community === communityId && m.user === userId
      )
      if (membership) {
        removeMembership(membership._id)
      }
      return response
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to leave community')
      console.error('Error leaving community:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const updateCommunityDetails = async (
    communityId: string, 
    newName: string, 
    newDescription: string, 
    requesterId: string
  ) => {
    setLoading(true)
    setError(null)
    try {
      await studyCircleApi.updateCommunityDetails(communityId, newName, newDescription, requesterId)
      
      // Update in store
      updateCommunity(communityId, {
        name: newName,
        description: newDescription
      })
      
      return true
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to update community')
      console.error('Error updating community:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const clearError = () => {
    setError(null)
  }

  return {
    // State
    communities,
    memberships,
    currentCommunity,
    isLoading,
    error,
    
    // Getters
    userCommunities,
    adminCommunities,
    communityMembers,
    isUserAdmin,
    
    // Actions
    setCommunities,
    setMemberships,
    addCommunity,
    updateCommunity,
    removeCommunity,
    addMembership,
    updateMembership,
    removeMembership,
    setCurrentCommunity,
    setLoading,
    setError,
    
    // API Actions
    fetchCommunities,
    fetchAllCommunities: fetchCommunities, // Alias for convenience
    fetchMemberships,
    createCommunity,
    joinCommunity,
    leaveCommunity,
    updateCommunityDetails,
    clearError
  }
})
