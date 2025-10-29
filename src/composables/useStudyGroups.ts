import { ref, computed } from 'vue'
import { studyCircleApi, type StudyGroup } from '@/services/studyCircleApi'

export function useStudyGroups() {
  const studyGroups = ref<StudyGroup[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const isLoading = computed(() => loading.value)
  const hasError = computed(() => error.value !== null)
  const groupCount = computed(() => studyGroups.value.length)

  const fetchStudyGroups = async () => {
    try {
      loading.value = true
      error.value = null
      const data = await studyCircleApi.getStudyGroups()
      studyGroups.value = data
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to fetch study groups'
      console.error('Error fetching study groups:', err)
    } finally {
      loading.value = false
    }
  }

  const createStudyGroup = async (groupData: Omit<StudyGroup, 'id' | 'created_at' | 'members'>) => {
    try {
      loading.value = true
      error.value = null
      const newGroup = await studyCircleApi.createStudyGroup(groupData)
      studyGroups.value.push(newGroup)
      return newGroup
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to create study group'
      console.error('Error creating study group:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const joinStudyGroup = async (groupId: number) => {
    try {
      await studyCircleApi.joinStudyGroup(groupId)
      // Refresh the groups to get updated member count
      await fetchStudyGroups()
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to join study group'
      console.error('Error joining study group:', err)
      throw err
    }
  }

  const leaveStudyGroup = async (groupId: number) => {
    try {
      await studyCircleApi.leaveStudyGroup(groupId)
      // Refresh the groups to get updated member count
      await fetchStudyGroups()
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to leave study group'
      console.error('Error leaving study group:', err)
      throw err
    }
  }

  return {
    // State
    studyGroups,
    loading,
    error,
    
    // Computed
    isLoading,
    hasError,
    groupCount,
    
    // Actions
    fetchStudyGroups,
    createStudyGroup,
    joinStudyGroup,
    leaveStudyGroup
  }
}
