import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { studyCircleApi } from '@/services/studyCircleApi'

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

  const clearError = () => {
    error.value = null
  }

  // API Actions
  const fetchAllTerms = async () => {
    setError(null)
    try {
      const response = await studyCircleApi.getTerms()
      setTerms(response || [])
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to fetch terms')
      console.error('Error fetching terms:', err)
    }
  }

  const fetchCoursesByTerm = async (termId: string) => {
    setError(null)
    try {
      const response = await studyCircleApi.getCoursesByTerm(termId)
      const fetchedCourses = response || []
      
      // Add courses that aren't already in the store
      fetchedCourses.forEach((course: Course) => {
        if (!courses.value.find(c => c._id === course._id)) {
          addCourse(course)
        }
      })
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to fetch courses')
      console.error('Error fetching courses:', err)
    }
  }

  const fetchSectionsByCourse = async (courseId: string) => {
    setError(null)
    try {
      const response = await studyCircleApi.getSectionsByCourse(courseId)
      const fetchedSections = response || []
      
      // Add sections that aren't already in the store
      fetchedSections.forEach((section: Section) => {
        if (!sections.value.find(s => s._id === section._id)) {
          addSection(section)
        }
      })
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to fetch sections')
      console.error('Error fetching sections:', err)
    }
  }

  const fetchCourseById = async (courseId: string) => {
    setError(null)
    try {
      const response = await studyCircleApi.getCourseById(courseId)
      
      // The API might return { course: courseObject } or just the course object
      const course = response.course || response
      
      if (course && course._id) {
        // Add course if not already in store
        if (!courses.value.find(c => c._id === course._id)) {
          addCourse(course)
        }
        return course
      } else {
        throw new Error('Invalid course data returned from API')
      }
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to fetch course')
      console.error('Error fetching course:', err)
      throw err
    }
  }

  const createOrGetTermAction = async (name: string) => {
    setError(null)
    try {
      const response = await studyCircleApi.createOrGetTerm(name)
      const termId = response.term
      
      if (!termId) {
        throw new Error('No term ID returned from API')
      }
      
      // Check if term is already in store
      if (!terms.value.find(t => t._id === termId)) {
        addTerm({ _id: termId, name })
      }
      
      return termId
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to create/get term')
      console.error('Error creating/getting term:', err)
      throw err
    }
  }

  const createOrGetCourseAction = async (
    termId: string,
    courseNumber: string,
    courseName: string,
    department: string
  ) => {
    setError(null)
    try {
      const response = await studyCircleApi.createOrGetCourse(termId, courseNumber, courseName, department)
      const courseId = response.course
      
      if (!courseId) {
        throw new Error('No course ID returned from API')
      }
      
      // Check if course is already in store
      if (!courses.value.find(c => c._id === courseId)) {
        addCourse({
          _id: courseId,
          term: termId,
          courseNumber,
          courseName,
          department
        })
      }
      
      return courseId
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to create/get course')
      console.error('Error creating/getting course:', err)
      throw err
    }
  }

  const createOrGetSectionAction = async (
    courseId: string,
    classType: string,
    days: string[],
    startTime: string,
    endTime: string,
    location: string,
    instructor: string
  ) => {
    setError(null)
    try {
      const response = await studyCircleApi.createOrGetSection(
        courseId,
        classType,
        days,
        startTime,
        endTime,
        location,
        instructor
      )
      const sectionId = response.section
      
      if (!sectionId) {
        throw new Error('No section ID returned from API')
      }
      
      // Check if section is already in store
      if (!sections.value.find(s => s._id === sectionId)) {
        addSection({
          _id: sectionId,
          course: courseId,
          classType,
          days,
          startTime,
          endTime,
          location,
          instructor
        })
      }
      
      return sectionId
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to create/get section')
      console.error('Error creating/getting section:', err)
      throw err
    }
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
    setError,
    clearError,
    
    // API Actions
    fetchAllTerms,
    fetchCoursesByTerm,
    fetchSectionsByCourse,
    fetchCourseById,
    createOrGetTermAction,
    createOrGetCourseAction,
    createOrGetSectionAction
  }
})
