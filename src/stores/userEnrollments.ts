import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { studyCircleApi } from '@/services/studyCircleApi'

export interface Enrollment {
  _id: string
  owner: string
  course: string
  section: string
  visibility: boolean
}

export const useUserEnrollmentsStore = defineStore('userEnrollments', () => {
  // State
  const enrollments = ref<Enrollment[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const userEnrollments = computed(() => (userId: string) => {
    return enrollments.value.filter(e => e.owner === userId)
  })

  const visibleEnrollments = computed(() => {
    return enrollments.value.filter(e => e.visibility)
  })

  const enrollmentsByCourse = computed(() => (courseId: string) => {
    return enrollments.value.filter(e => e.course === courseId)
  })

  const enrollmentsBySection = computed(() => (sectionId: string) => {
    return enrollments.value.filter(e => e.section === sectionId)
  })

  const userVisibleEnrollments = computed(() => (userId: string) => {
    return enrollments.value.filter(e => e.owner === userId && e.visibility)
  })

  const enrollmentCount = computed(() => enrollments.value.length)

  const userEnrollmentCount = computed(() => (userId: string) => {
    return enrollments.value.filter(e => e.owner === userId).length
  })

  // Actions
  const setEnrollments = (enrollmentList: Enrollment[]) => {
    enrollments.value = enrollmentList
  }

  const addEnrollment = (enrollment: Enrollment) => {
    enrollments.value.push(enrollment)
  }

  const updateEnrollment = (enrollmentId: string, updates: Partial<Enrollment>) => {
    const enrollment = enrollments.value.find(e => e._id === enrollmentId)
    if (enrollment) {
      Object.assign(enrollment, updates)
    }
  }

  const removeEnrollment = (enrollmentId: string) => {
    enrollments.value = enrollments.value.filter(e => e._id !== enrollmentId)
  }

  const updateEnrollmentVisibility = (enrollmentId: string, visibility: boolean) => {
    const enrollment = enrollments.value.find(e => e._id === enrollmentId)
    if (enrollment) {
      enrollment.visibility = visibility
    }
  }

  const updateEnrollmentSection = (enrollmentId: string, sectionId: string) => {
    const enrollment = enrollments.value.find(e => e._id === enrollmentId)
    if (enrollment) {
      enrollment.section = sectionId
    }
  }

  const setLoading = (loading: boolean) => {
    isLoading.value = loading
  }

  const setError = (errorMessage: string | null) => {
    error.value = errorMessage
  }

  const clearEnrollments = () => {
    enrollments.value = []
  }

  const clearError = () => {
    error.value = null
  }

  // API Actions
  const fetchEnrollmentsByOwner = async (userId: string) => {
    setLoading(true)
    setError(null)
    try {
      const response = await studyCircleApi.getEnrollmentsByOwner(userId)
      setEnrollments(response || [])
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to fetch enrollments')
      console.error('Error fetching enrollments:', err)
    } finally {
      setLoading(false)
    }
  }

  // Fetch and merge enrollments (doesn't replace existing ones)
  const fetchAndMergeEnrollmentsByOwner = async (userId: string) => {
    setError(null)
    try {
      const response = await studyCircleApi.getEnrollmentsByOwner(userId)
      
      // Merge new enrollments, avoiding duplicates
      const newEnrollments = response || []
      newEnrollments.forEach((enrollment: Enrollment) => {
        // Only add if not already present
        if (!enrollments.value.find(e => e._id === enrollment._id)) {
          addEnrollment(enrollment)
        }
      })
    } catch (err: any) {
      console.warn(`Failed to fetch enrollments for user ${userId}:`, err)
      // Don't throw - we want to continue with other users
    }
  }

  const createEnrollment = async (
    owner: string,
    course: string,
    section: string,
    visibility: boolean
  ) => {
    setLoading(true)
    setError(null)
    try {
      const response = await studyCircleApi.addEnrollment(owner, course, section, visibility)
      
      const enrollmentId = response.enrollment
      
      if (enrollmentId) {
        const newEnrollment: Enrollment = {
          _id: enrollmentId,
          owner,
          course,
          section,
          visibility
        }
        addEnrollment(newEnrollment)
        return newEnrollment
      } else {
        throw new Error('No enrollment ID returned from API')
      }
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to create enrollment')
      console.error('Error creating enrollment:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const deleteEnrollment = async (enrollmentId: string) => {
    setLoading(true)
    setError(null)
    try {
      await studyCircleApi.removeEnrollment(enrollmentId)
      removeEnrollment(enrollmentId)
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to delete enrollment')
      console.error('Error deleting enrollment:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const toggleEnrollmentVisibility = async (enrollmentId: string, newVisibility: boolean) => {
    setError(null)
    try {
      await studyCircleApi.setEnrollmentVisibility(enrollmentId, newVisibility)
      updateEnrollmentVisibility(enrollmentId, newVisibility)
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to update visibility')
      console.error('Error updating visibility:', err)
      throw err
    }
  }

  const changeCourseSection = async (enrollmentId: string, newSectionId: string) => {
    setError(null)
    try {
      await studyCircleApi.updateCourseSection(enrollmentId, newSectionId)
      updateEnrollmentSection(enrollmentId, newSectionId)
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to update section')
      console.error('Error updating section:', err)
      throw err
    }
  }

  return {
    // State
    enrollments,
    isLoading,
    error,
    
    // Getters
    userEnrollments,
    visibleEnrollments,
    enrollmentsByCourse,
    enrollmentsBySection,
    userVisibleEnrollments,
    enrollmentCount,
    userEnrollmentCount,
    
    // Actions
    setEnrollments,
    addEnrollment,
    updateEnrollment,
    removeEnrollment,
    updateEnrollmentVisibility,
    updateEnrollmentSection,
    setLoading,
    setError,
    clearEnrollments,
    clearError,
    
    // API Actions
    fetchEnrollmentsByOwner,
    fetchAndMergeEnrollmentsByOwner,
    createEnrollment,
    deleteEnrollment,
    toggleEnrollmentVisibility,
    changeCourseSection
  }
})
