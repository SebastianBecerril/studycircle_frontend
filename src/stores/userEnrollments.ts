import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

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
    clearEnrollments
  }
})
