import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface Term {
  _id: string
  name: string
}

export interface Course {
  _id: string
  term: string
  courseNumber: string
  courseName: string
  department: string
}

export interface Section {
  _id: string
  course: string
  classType: string
  days: string[]
  startTime: string
  endTime: string
  location: string
  instructor: string
}

export const useCourseCatalogStore = defineStore('courseCatalog', () => {
  // State
  const terms = ref<Term[]>([])
  const courses = ref<Course[]>([])
  const sections = ref<Section[]>([])
  const currentTerm = ref<Term | null>(null)
  const currentCourse = ref<Course | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const coursesByTerm = computed(() => (termId: string) => {
    return courses.value.filter(c => c.term === termId)
  })

  const sectionsByCourse = computed(() => (courseId: string) => {
    return sections.value.filter(s => s.course === courseId)
  })

  const coursesByDepartment = computed(() => (department: string) => {
    return courses.value.filter(c => c.department === department)
  })

  const sectionsByInstructor = computed(() => (instructor: string) => {
    return sections.value.filter(s => s.instructor === instructor)
  })

  const sectionsByLocation = computed(() => (location: string) => {
    return sections.value.filter(s => s.location === location)
  })

  const sortedTerms = computed(() => {
    return [...terms.value].sort((a, b) => a.name.localeCompare(b.name))
  })

  const sortedCourses = computed(() => (termId: string) => {
    return coursesByTerm.value(termId).sort((a, b) => 
      a.courseNumber.localeCompare(b.courseNumber)
    )
  })

  // Actions
  const setTerms = (termList: Term[]) => {
    terms.value = termList
  }

  const setCourses = (courseList: Course[]) => {
    courses.value = courseList
  }

  const setSections = (sectionList: Section[]) => {
    sections.value = sectionList
  }

  const addTerm = (term: Term) => {
    terms.value.push(term)
  }

  const updateTerm = (termId: string, updates: Partial<Term>) => {
    const term = terms.value.find(t => t._id === termId)
    if (term) {
      Object.assign(term, updates)
    }
    
    if (currentTerm.value?._id === termId) {
      Object.assign(currentTerm.value, updates)
    }
  }

  const removeTerm = (termId: string) => {
    terms.value = terms.value.filter(t => t._id !== termId)
    courses.value = courses.value.filter(c => c.term !== termId)
    
    if (currentTerm.value?._id === termId) {
      currentTerm.value = null
    }
  }

  const addCourse = (course: Course) => {
    courses.value.push(course)
  }

  const updateCourse = (courseId: string, updates: Partial<Course>) => {
    const course = courses.value.find(c => c._id === courseId)
    if (course) {
      Object.assign(course, updates)
    }
    
    if (currentCourse.value?._id === courseId) {
      Object.assign(currentCourse.value, updates)
    }
  }

  const removeCourse = (courseId: string) => {
    courses.value = courses.value.filter(c => c._id !== courseId)
    sections.value = sections.value.filter(s => s.course !== courseId)
    
    if (currentCourse.value?._id === courseId) {
      currentCourse.value = null
    }
  }

  const addSection = (section: Section) => {
    sections.value.push(section)
  }

  const updateSection = (sectionId: string, updates: Partial<Section>) => {
    const section = sections.value.find(s => s._id === sectionId)
    if (section) {
      Object.assign(section, updates)
    }
  }

  const removeSection = (sectionId: string) => {
    sections.value = sections.value.filter(s => s._id !== sectionId)
  }

  const setCurrentTerm = (term: Term | null) => {
    currentTerm.value = term
  }

  const setCurrentCourse = (course: Course | null) => {
    currentCourse.value = course
  }

  const setLoading = (loading: boolean) => {
    isLoading.value = loading
  }

  const setError = (errorMessage: string | null) => {
    error.value = errorMessage
  }

  return {
    // State
    terms,
    courses,
    sections,
    currentTerm,
    currentCourse,
    isLoading,
    error,
    
    // Getters
    coursesByTerm,
    sectionsByCourse,
    coursesByDepartment,
    sectionsByInstructor,
    sectionsByLocation,
    sortedTerms,
    sortedCourses,
    
    // Actions
    setTerms,
    setCourses,
    setSections,
    addTerm,
    updateTerm,
    removeTerm,
    addCourse,
    updateCourse,
    removeCourse,
    addSection,
    updateSection,
    removeSection,
    setCurrentTerm,
    setCurrentCourse,
    setLoading,
    setError
  }
})
