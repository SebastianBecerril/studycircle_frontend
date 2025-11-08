<template>
  <div class="schedule-page">
    <!-- Loading State -->
    <div v-if="isLoading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>Loading community schedule...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-container">
      <div class="error-icon">⚠️</div>
      <h2>Could Not Load Schedule</h2>
      <p>{{ error }}</p>
      <router-link :to="`/community/${communityId}`" class="back-btn">
        ← Back to Community Board
      </router-link>
    </div>

    <!-- Schedule Content -->
    <div v-else-if="currentCommunity" class="schedule-content">
      <!-- Header -->
      <div class="schedule-header">
        <router-link :to="`/community/${communityId}`" class="back-btn">
          ← Back to Board
        </router-link>
        
        <div class="header-content">
          <h1 class="schedule-title">{{ currentCommunity.name }}</h1>
          <p class="schedule-subtitle">Find classmates and form study groups</p>
        </div>

        <!-- View Toggle -->
        <div class="view-toggle">
          <button 
            @click="currentView = 'list'" 
            :class="{ active: currentView === 'list' }"
            class="toggle-btn"
          >
            📋 List View
          </button>
          <button 
            @click="currentView = 'calendar'" 
            :class="{ active: currentView === 'calendar' }"
            class="toggle-btn"
          >
            📅 Calendar
          </button>
        </div>
      </div>

      <!-- Navigation Tabs -->
      <div class="board-navigation">
        <div class="nav-tabs">
          <router-link 
            :to="`/community/${communityId}`" 
            class="nav-tab nav-tab-link"
          >
            <span class="tab-icon">💬</span>
            Board
          </router-link>
          <router-link 
            :to="`/community/${communityId}?tab=members`"
            class="nav-tab nav-tab-link"
          >
            <span class="tab-icon">👥</span>
            Members
          </router-link>
          <button class="nav-tab active">
            <span class="tab-icon">📚</span>
            Shared Schedule
          </button>
        </div>
      </div>

      <!-- Filters -->
      <div class="filters-section">
        <div class="filter-group">
          <label for="termFilter">Term:</label>
          <select id="termFilter" v-model="selectedTerm" class="filter-select">
            <option value="">All Terms</option>
            <option v-for="term in availableTerms" :key="term" :value="term">
              {{ term }}
            </option>
          </select>
        </div>

        <div class="filter-group">
          <label class="checkbox-filter">
            <input type="checkbox" v-model="showOnlyMyClasses" />
            <span>Show only my classes</span>
          </label>
        </div>

        <div class="filter-group search-group">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search courses..."
            class="search-input"
          />
        </div>
      </div>

      <!-- List View -->
      <div v-if="currentView === 'list'" class="list-view">
        <!-- Stats Summary -->
        <div class="stats-summary">
          <div class="stat-item">
            <span class="stat-number">{{ filteredCourses.length }}</span>
            <span class="stat-label">Courses</span>
          </div>
          <div class="stat-item">
            <span class="stat-number">{{ totalClassmates }}</span>
            <span class="stat-label">Classmates</span>
          </div>
          <div class="stat-item">
            <span class="stat-number">{{ myCoursesCount }}</span>
            <span class="stat-label">My Classes</span>
          </div>
        </div>

        <!-- Course List -->
        <div v-if="filteredCourses.length > 0" class="courses-list">
          <div
            v-for="courseGroup in filteredCourses"
            :key="courseGroup.courseId"
            class="course-group"
            :class="{ 'my-course': courseGroup.iAmTakingThis }"
          >
            <div class="course-header">
              <div class="course-icon">📚</div>
              <div class="course-main-info">
                <h3 class="course-name">
                  {{ courseGroup.courseNumber }}: {{ courseGroup.courseName }}
                  <span v-if="courseGroup.iAmTakingThis" class="my-badge">You're in this class!</span>
                </h3>
                <p class="course-meta">
                  {{ courseGroup.term }} • {{ courseGroup.department }}
                </p>
              </div>
              <div class="classmate-count">
                {{ courseGroup.totalClassmates }} {{ courseGroup.totalClassmates === 1 ? 'classmate' : 'classmates' }}
              </div>
            </div>

            <!-- Sections within this course -->
            <div class="sections-list">
              <div
                v-for="section in courseGroup.sections"
                :key="section.sectionId"
                class="section-item"
                :class="{ 'my-section': section.iAmInThisSection }"
              >
                <div class="section-header">
                  <div class="section-info">
                    <span class="section-type">{{ section.classType }}</span>
                    <span class="section-time">{{ formatDays(section.days) }} {{ formatTime(section.startTime) }}-{{ formatTime(section.endTime) }}</span>
                    <span class="section-location">📍 {{ section.location }}</span>
                    <span class="section-instructor">👤 {{ section.instructor }}</span>
                  </div>
                  <span v-if="section.iAmInThisSection" class="section-badge">Your section</span>
                </div>

                <!-- Students in this section -->
                <div class="students-list">
                  <div
                    v-for="student in section.students"
                    :key="student.userId"
                    class="student-chip"
                    :class="{ 'is-me': student.isMe }"
                  >
                    <div class="student-avatar">
                      <img 
                        v-if="profileHelper.getAvatarUrl(student.userId)" 
                        :src="profileHelper.getAvatarUrl(student.userId)!" 
                        alt="Avatar"
                      />
                      <span v-else class="avatar-initials">
                        {{ profileHelper.getInitials(profileHelper.getDisplayName(student.userId)) }}
                      </span>
                    </div>
                    <span class="student-name">{{ student.isMe ? 'You' : profileHelper.getDisplayName(student.userId) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else class="empty-state">
          <div class="empty-icon">📚</div>
          <h2>No Classes Found</h2>
          <p v-if="showOnlyMyClasses">You haven't added any classes yet.</p>
          <p v-else-if="searchQuery">No courses match your search.</p>
          <p v-else>No community members have shared their schedules yet.</p>
          <router-link to="/courses" class="add-courses-btn">Add Your Classes</router-link>
        </div>
      </div>

      <!-- Calendar View -->
      <div v-else class="calendar-view">
        <!-- Stats Summary -->
        <div class="stats-summary">
          <div class="stat-item">
            <span class="stat-number">{{ uniqueClassesCount }}</span>
            <span class="stat-label">Your Classes</span>
          </div>
          <div class="stat-item">
            <span class="stat-number">{{ totalClassmates }}</span>
            <span class="stat-label">Classmates</span>
          </div>
          <div class="stat-item">
            <span class="stat-number">{{ sharedClassesCount }}</span>
            <span class="stat-label">Shared Classes</span>
          </div>
        </div>

        <!-- Calendar Grid -->
        <div class="calendar-container">
          <div class="calendar-grid">
            <!-- Time column -->
            <div class="time-column">
              <div class="time-header"></div>
              <div
                v-for="hour in timeSlots"
                :key="hour"
                class="time-slot"
              >
                {{ formatHour(hour) }}
              </div>
            </div>

            <!-- Day columns -->
            <div
              v-for="day in weekDays"
              :key="day.key"
              class="day-column"
            >
              <div class="day-header">
                <div class="day-name">{{ day.name }}</div>
                <div class="day-abbr">{{ day.abbr }}</div>
              </div>

              <div class="day-grid">
                <!-- Time slot backgrounds -->
                <div
                  v-for="hour in timeSlots"
                  :key="hour"
                  class="time-slot-bg"
                ></div>

                <!-- Classes for this day -->
                <div
                  v-for="classItem in getClassesForDay(day.key)"
                  :key="classItem.id"
                  class="calendar-class"
                  :class="{
                    'has-classmates': classItem.classmateCount > 0,
                    'my-class': true,
                    'selected': selectedClass && selectedClass.id === classItem.id
                  }"
                  :style="getClassStyle(classItem)"
                  @click.stop="selectClass(classItem)"
                  @mouseenter="hoverClass = classItem"
                  @mouseleave="hoverClass = null"
                >
                  <div class="class-content">
                    <div class="class-time">{{ formatTime(classItem.startTime) }}-{{ formatTime(classItem.endTime) }}</div>
                    <div class="class-code">{{ classItem.courseNumber }}</div>
                    <div class="class-location">{{ classItem.location }}</div>
                    <div v-if="classItem.classmateCount > 0" class="classmate-badge">
                      {{ classItem.classmateCount }} {{ classItem.classmateCount === 1 ? 'classmate' : 'classmates' }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-if="myCalendarClasses.length === 0" class="empty-calendar">
          <div class="empty-icon">📅</div>
          <h3>No Classes to Display</h3>
          <p>Add your enrollments to see your weekly schedule!</p>
          <router-link to="/courses" class="add-classes-btn">
            Add Classes
          </router-link>
        </div>

        <!-- Modal Tooltip for Selected Class (outside calendar grid) -->
        <div v-if="selectedClass" class="class-modal-overlay" @click="selectedClass = null">
          <div class="class-modal" @click.stop>
            <div class="modal-header">
              <strong>{{ selectedClass.courseNumber }}: {{ selectedClass.courseName }}</strong>
              <button 
                @click="selectedClass = null" 
                class="modal-close"
                title="Close"
              >
                ×
              </button>
            </div>
            <div class="modal-body">
              <div class="modal-section">
                <div class="modal-label">Time:</div>
                <div>{{ formatDays(selectedClass.days) }} {{ formatTime(selectedClass.startTime) }}-{{ formatTime(selectedClass.endTime) }}</div>
              </div>
              <div class="modal-section">
                <div class="modal-label">Location:</div>
                <div>{{ selectedClass.location }}</div>
              </div>
              <div class="modal-section">
                <div class="modal-label">Instructor:</div>
                <div>{{ selectedClass.instructor }}</div>
              </div>
              <div class="modal-section">
                <div class="modal-label">Type:</div>
                <div>{{ selectedClass.classType }}</div>
              </div>
              <div v-if="selectedClass.classmates.length > 0" class="modal-section">
                <div class="modal-label">
                  {{ currentCommunity?.name }} Members ({{ selectedClass.classmates.length }}):
                </div>
                <div class="classmates-list">
                  <div
                    v-for="classmate in selectedClass.classmates"
                    :key="classmate"
                    class="classmate-chip-small"
                  >
                    <div class="classmate-avatar-small">
                      <img 
                        v-if="profileHelper.getAvatarUrl(classmate)" 
                        :src="profileHelper.getAvatarUrl(classmate)!" 
                        alt="Avatar"
                      />
                      <span v-else class="avatar-initials-small">
                        {{ profileHelper.getInitials(profileHelper.getDisplayName(classmate)) }}
                      </span>
                    </div>
                    <span class="classmate-name-small">{{ profileHelper.getDisplayName(classmate) }}</span>
                  </div>
                </div>
              </div>
              <div v-else class="modal-section">
                <div class="no-classmates-note">No community members in this section</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useStores } from '@/composables/useStores'
import { useProfileHelper } from '@/composables/useProfileHelper'

const route = useRoute()
const { auth, community, userEnrollments, courseCatalog } = useStores()
const profileHelper = useProfileHelper()

const isLoading = ref(true)
const error = ref('')
const currentView = ref<'list' | 'calendar'>('list')
const selectedTerm = ref('')
const showOnlyMyClasses = ref(false)
const searchQuery = ref('')

const communityId = computed(() => route.params.id as string)

const currentCommunity = computed(() => {
  return community.communities.find(c => c._id === communityId.value)
})

// Get all member IDs from the community
const communityMemberIds = computed(() => {
  if (!currentCommunity.value?.memberships) return []
  return community.memberships
    .filter(m => m.community === communityId.value)
    .map(m => m.user)
})

// Get all enrollments from community members
const communityEnrollments = computed(() => {
  return userEnrollments.enrollments.filter(enrollment => {
    // Only show visible enrollments
    if (!enrollment.visibility) return false
    
    // Check if enrollment owner is in the community
    return communityMemberIds.value.includes(enrollment.owner)
  })
})

// Group enrollments by course with section details
const courseGroups = computed(() => {
  const groups = new Map<string, any>()

  communityEnrollments.value.forEach(enrollment => {
    const course = courseCatalog.courses.find(c => c._id === enrollment.course)
    const section = courseCatalog.sections.find(s => s._id === enrollment.section)
    
    if (!course || !section) return

    if (!groups.has(course._id)) {
      groups.set(course._id, {
        courseId: course._id,
        courseNumber: course.courseNumber,
        courseName: course.courseName,
        department: course.department,
        term: courseCatalog.terms.find(t => t._id === course.term)?.name || 'Unknown',
        sections: new Map(),
        iAmTakingThis: false,
        totalClassmates: 0
      })
    }

    const courseGroup = groups.get(course._id)!
    const isMe = enrollment.owner === auth.userId

    if (isMe) {
      courseGroup.iAmTakingThis = true
    }

    if (!courseGroup.sections.has(section._id)) {
      courseGroup.sections.set(section._id, {
        sectionId: section._id,
        classType: section.classType,
        days: section.days,
        startTime: section.startTime,
        endTime: section.endTime,
        location: section.location,
        instructor: section.instructor,
        students: [],
        iAmInThisSection: false
      })
    }

    const sectionGroup = courseGroup.sections.get(section._id)!
    sectionGroup.students.push({
      userId: enrollment.owner,
      isMe
    })

    if (isMe) {
      sectionGroup.iAmInThisSection = true
    }
  })

  // Convert Maps to arrays and calculate totals
  return Array.from(groups.values()).map(group => ({
    ...group,
    sections: Array.from(group.sections.values()),
    totalClassmates: Array.from(group.sections.values()).reduce(
      (sum, section: any) => sum + section.students.filter((s: any) => !s.isMe).length,
      0
    )
  }))
})

// Available terms for filter
const availableTerms = computed(() => {
  const terms = new Set<string>()
  courseGroups.value.forEach(group => terms.add(group.term))
  return Array.from(terms).sort()
})

// Filtered courses based on filters
const filteredCourses = computed(() => {
  let filtered = courseGroups.value

  // Term filter
  if (selectedTerm.value) {
    filtered = filtered.filter(g => g.term === selectedTerm.value)
  }

  // My classes filter
  if (showOnlyMyClasses.value) {
    filtered = filtered.filter(g => g.iAmTakingThis)
  }

  // Search filter
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(g =>
      g.courseNumber.toLowerCase().includes(query) ||
      g.courseName.toLowerCase().includes(query) ||
      g.department.toLowerCase().includes(query)
    )
  }

  return filtered
})

const totalClassmates = computed(() => {
  const uniqueUsers = new Set<string>()
  courseGroups.value.forEach(group => {
    group.sections.forEach((section: any) => {
      section.students.forEach((student: any) => {
        if (!student.isMe) {
          uniqueUsers.add(student.userId)
        }
      })
    })
  })
  return uniqueUsers.size
})

const myCoursesCount = computed(() => {
  return courseGroups.value.filter(g => g.iAmTakingThis).length
})

// Calendar-specific state
const hoverClass = ref<any>(null)
const selectedClass = ref<any>(null)

// Week days configuration
const weekDays = [
  { key: 'M', name: 'Monday', abbr: 'Mon' },
  { key: 'T', name: 'Tuesday', abbr: 'Tue' },
  { key: 'W', name: 'Wednesday', abbr: 'Wed' },
  { key: 'R', name: 'Thursday', abbr: 'Thu' },
  { key: 'F', name: 'Friday', abbr: 'Fri' }
]

// Time slots (8 AM to 10 PM)
const timeSlots = Array.from({ length: 14 }, (_, i) => i + 8)

// Get my classes formatted for calendar
const myCalendarClasses = computed(() => {
  const classes: any[] = []
  
  courseGroups.value.forEach(group => {
    if (!group.iAmTakingThis) return
    
    group.sections.forEach((section: any) => {
      if (!section.iAmInThisSection) return
      
      // Get classmates in this section (excluding me)
      const classmates = section.students
        .filter((s: any) => !s.isMe)
        .map((s: any) => s.userId)
      
      section.days.forEach((day: string) => {
        classes.push({
          id: `${section.sectionId}-${day}`,
          sectionId: section.sectionId,
          day,
          courseNumber: group.courseNumber,
          courseName: group.courseName,
          department: group.department,
          term: group.term,
          classType: section.classType,
          days: section.days,
          startTime: section.startTime,
          endTime: section.endTime,
          location: section.location,
          instructor: section.instructor,
          classmates,
          classmateCount: classmates.length
        })
      })
    })
  })
  
  return classes
})

// Count unique classes (not day instances)
const uniqueClassesCount = computed(() => {
  const uniqueSections = new Set(
    myCalendarClasses.value.map(c => c.sectionId)
  )
  return uniqueSections.size
})

// Count of shared classes (classes with at least one classmate)
const sharedClassesCount = computed(() => {
  const uniqueSections = new Set(
    myCalendarClasses.value
      .filter(c => c.classmateCount > 0)
      .map(c => c.sectionId)
  )
  return uniqueSections.size
})

// Get classes for a specific day
const getClassesForDay = (dayKey: string) => {
  return myCalendarClasses.value.filter(c => c.day === dayKey)
}

// Format time string - handles ISO timestamps and various formats
const formatTime = (timeStr: string): string => {
  if (!timeStr) return ''
  
  // Handle ISO timestamp format (e.g., "2025-08-31T14:00:00.000Z")
  if (timeStr.includes('T') && timeStr.includes('Z')) {
    try {
      const date = new Date(timeStr)
      const hours = date.getHours().toString().padStart(2, '0')
      const minutes = date.getMinutes().toString().padStart(2, '0')
      return `${hours}:${minutes}`
    } catch (e) {
      // Fall through to other formats
    }
  }
  
  // Handle ISO timestamp without Z (e.g., "2025-08-31T14:00:00.000")
  if (timeStr.includes('T')) {
    try {
      const timePart = timeStr.split('T')[1]
      if (timePart) {
        const timeMatch = timePart.match(/(\d{2}):(\d{2})/)
        if (timeMatch) {
          return `${timeMatch[1]}:${timeMatch[2]}`
        }
      }
    } catch (e) {
      // Fall through to other formats
    }
  }
  
  // Already formatted as "HH:MM" or "H:MM"
  const match24hr = timeStr.match(/(\d{1,2}):(\d{2})/)
  if (match24hr) {
    return timeStr // Return as-is if already in correct format
  }
  
  // Try 12-hour format (e.g., "9:00 AM") - convert to 24-hour
  const match12hr = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i)
  if (match12hr) {
    let hour = parseInt(match12hr[1])
    const minutes = parseInt(match12hr[2])
    const period = match12hr[3].toUpperCase()
    
    if (period === 'PM' && hour !== 12) {
      hour += 12
    } else if (period === 'AM' && hour === 12) {
      hour = 0
    }
    
    return `${hour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
  }
  
  return timeStr // Return original if no format recognized
}

// Format days array - convert full names to abbreviations
const formatDays = (days: string[]): string => {
  if (!days || days.length === 0) return ''
  
  const dayMap: { [key: string]: string } = {
    'Monday': 'M',
    'Tuesday': 'T',
    'Wednesday': 'W',
    'Thursday': 'Th',
    'Friday': 'F',
    'Saturday': 'Sa',
    'Sunday': 'Su'
  }
  
  return days.map(day => {
    // Check if it's already an abbreviation (M, T, W, etc.)
    if (day.length <= 2) return day
    
    // Map full name to abbreviation
    return dayMap[day] || day
  }).join(', ')
}

// Parse time string - handles ISO timestamps, "9:00 AM", and "14:30" formats
const parseTime = (timeStr: string): number => {
  if (!timeStr) return 0
  
  // Handle ISO timestamp format (e.g., "2025-08-31T14:00:00.000Z")
  if (timeStr.includes('T')) {
    try {
      const date = new Date(timeStr)
      if (!isNaN(date.getTime())) {
        return date.getHours() + date.getMinutes() / 60
      }
    } catch (e) {
      // Fall through to other formats
    }
  }
  
  // Try 12-hour format first (e.g., "9:00 AM")
  const match12hr = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i)
  if (match12hr) {
    let hour = parseInt(match12hr[1])
    const minutes = parseInt(match12hr[2])
    const period = match12hr[3].toUpperCase()
    
    if (period === 'PM' && hour !== 12) {
      hour += 12
    } else if (period === 'AM' && hour === 12) {
      hour = 0
    }
    
    return hour + minutes / 60
  }
  
  // Try 24-hour format (e.g., "14:30")
  const match24hr = timeStr.match(/(\d+):(\d+)/)
  if (match24hr) {
    const hour = parseInt(match24hr[1])
    const minutes = parseInt(match24hr[2])
    return hour + minutes / 60
  }
  
  return 0
}

// Get CSS style for positioning a class on the grid
const getClassStyle = (classItem: any) => {
  const startHour = parseTime(classItem.startTime)
  const endHour = parseTime(classItem.endTime)
  const duration = endHour - startHour
  
  // Each hour is 60px
  const hourHeight = 60
  const top = (startHour - 8) * hourHeight
  const height = duration * hourHeight
  
  return {
    top: `${top}px`,
    height: `${height}px`
  }
}

// Format hour for display
const formatHour = (hour: number): string => {
  if (hour === 0 || hour === 24) return '12 AM'
  if (hour === 12) return '12 PM'
  if (hour < 12) return `${hour} AM`
  return `${hour - 12} PM`
}

// Handle class selection
const selectClass = (classItem: any) => {
  selectedClass.value = selectedClass.value?.id === classItem.id ? null : classItem
}

// Watch course groups and fetch profiles for all students
watch(courseGroups, async (groups) => {
  if (groups && groups.length > 0) {
    const allStudentIds: string[] = []
    
    groups.forEach(group => {
      group.sections.forEach((section: any) => {
        section.students.forEach((student: any) => {
          if (student.userId) {
            allStudentIds.push(student.userId)
          }
        })
      })
    })
    
    if (allStudentIds.length > 0) {
      await profileHelper.fetchProfilesForUsers(allStudentIds)
    }
  }
}, { immediate: true })

const fetchData = async () => {
  try {
    isLoading.value = true
    error.value = ''

    // 1. Fetch community if not loaded
    if (community.communities.length === 0) {
      await community.fetchCommunities()
    }

    // 2. Fetch memberships if not loaded
    if (community.memberships.length === 0) {
      await community.fetchMemberships()
    }

    // 3. Check if community exists
    if (!currentCommunity.value) {
      error.value = 'This community could not be found.'
      return
    }

    // 4. Fetch enrollments for all community members
    // Fetch enrollments for each member individually
    
    if (communityMemberIds.value.length > 0) {
      // Clear existing enrollments first to avoid stale data
      userEnrollments.clearEnrollments()
      
      // Fetch visible enrollments for each community member (authenticated)
      // Using fetchAndMergeVisibleEnrollmentsForUser to accumulate all visible enrollments
      const fetchPromises = communityMemberIds.value.map(memberId => 
        userEnrollments.fetchAndMergeVisibleEnrollmentsForUser(memberId)
      )
      
      // Wait for all fetches to complete
      await Promise.all(fetchPromises)
      
    }
    
    // 5. Fetch all terms for course details
    await courseCatalog.fetchAllTerms()

    // 6. For each unique course in enrollments, fetch its details
    const courseIds = [...new Set(communityEnrollments.value.map(e => e.course))]
    for (const courseId of courseIds) {
      let course = courseCatalog.courses.find(c => c._id === courseId)
      
      if (!course) {
        // Course not in store, fetch it
        try {
          await courseCatalog.fetchCourseById(courseId)
          course = courseCatalog.courses.find(c => c._id === courseId)
        } catch (err) {
          console.error('Failed to fetch course:', courseId, err)
          continue // Skip this course if we can't fetch it
        }
      }
      
      if (course) {
        await courseCatalog.fetchSectionsByCourse(courseId)
      }
    }

  } catch (err: any) {
    console.error('Error loading schedule:', err)
    error.value = err.message || 'Failed to load community schedule'
  } finally {
    isLoading.value = false
  }
}

// Fetch data on mount (communities and memberships are public)
onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.schedule-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  min-height: 70vh;
}

/* Loading & Error States */
.loading-container,
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 50vh;
  gap: 1rem;
}

.loading-spinner {
  width: 48px;
  height: 48px;
  border: 4px solid #e7e5e4;
  border-top: 4px solid #2E7D32;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-container p {
  color: #0F172A;
  font-size: 1rem;
}

.error-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.error-container h2 {
  font-family: 'DM Serif Display', Georgia, serif;
  color: #2E7D32;
  font-size: 2rem;
  margin: 0 0 1rem 0;
}

.error-container p {
  color: #0F172A;
  margin-bottom: 2rem;
}

.back-btn {
  display: inline-block;
  padding: 0.75rem 1.5rem;
  background: #0D9488;
  color: white;
  text-decoration: none;
  border-radius: 8px;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(30, 58, 138, 0.3);
}

.back-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(30, 58, 138, 0.4);
}

/* Schedule Content */
.schedule-content {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Header */
.schedule-header {
  background: linear-gradient(145deg, #ffffff 0%, #fefdfb 100%);
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 2rem;
  border: 2px solid #E5E7EB;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  position: relative;
}

.schedule-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #2E7D32 0%, #0D9488 100%);
  border-radius: 16px 16px 0 0;
}

.back-link {
  display: inline-flex;
  align-items: center;
  color: #0F172A;
  text-decoration: none;
  font-weight: 500;
  margin-bottom: 1.5rem;
  transition: all 0.2s ease;
}

.back-link:hover {
  color: #2E7D32;
  transform: translateX(-4px);
}

.header-content {
  text-align: center;
  margin-bottom: 1.5rem;
}

.schedule-title {
  font-family: 'DM Serif Display', Georgia, serif;
  font-size: 2rem;
  font-weight: 800;
  color: #2E7D32;
  margin: 0 0 0.5rem 0;
  letter-spacing: -0.5px;
}

.schedule-subtitle {
  font-size: 1.125rem;
  color: #0F172A;
  margin: 0;
}

.view-toggle {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
}

.toggle-btn {
  padding: 0.625rem 1.25rem;
  background: white;
  border: 2px solid #E5E7EB;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #0F172A;
}

.toggle-btn:hover {
  border-color: #2E7D32;
  background: #E8F5E9;
  color: #1c1917;
}

.toggle-btn.active {
  background: #2E7D32;
  color: white;
  border-color: #2E7D32;
  box-shadow: 0 2px 4px rgba(124, 45, 18, 0.2);
}

/* Board Navigation */
.board-navigation {
  margin-bottom: 2rem;
}

.nav-tabs {
  display: flex;
  gap: 0.5rem;
  background: linear-gradient(145deg, #ffffff 0%, #fefdfb 100%);
  padding: 0.5rem;
  border-radius: 12px;
  border: 2px solid #E5E7EB;
}

.nav-tab {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: transparent;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #0F172A;
  font-size: 1rem;
  font-family: inherit;
}

.nav-tab:hover {
  background: #E8F5E9;
  color: #1c1917;
}

.nav-tab.active {
  background: #2E7D32;
  color: white;
  box-shadow: 0 2px 8px rgba(124, 45, 18, 0.3);
}

.nav-tab-link {
  text-decoration: none;
}

/* Filters */
.filters-section {
  background: linear-gradient(145deg, #ffffff 0%, #fefdfb 100%);
  border: 2px solid #E5E7EB;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
  align-items: center;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.filter-group label {
  font-weight: 600;
  color: #1c1917;
  font-size: 0.875rem;
}

.filter-select {
  padding: 0.5rem 1rem;
  border: 2px solid #E5E7EB;
  border-radius: 6px;
  background: #fafaf9;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.filter-select:focus {
  outline: none;
  border-color: #2E7D32;
  box-shadow: 0 0 0 3px rgba(124, 45, 18, 0.1);
}

.checkbox-filter {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  transition: background 0.2s;
}

.checkbox-filter:hover {
  background: #E8F5E9;
}

.checkbox-filter input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: #2E7D32;
}

.checkbox-filter span {
  font-weight: 500;
  color: #1c1917;
  font-size: 0.875rem;
}

.search-group {
  flex: 1;
  min-width: 200px;
}

.search-input {
  width: 100%;
  padding: 0.5rem 1rem;
  border: 2px solid #E5E7EB;
  border-radius: 6px;
  background: #fafaf9;
  font-size: 0.875rem;
  transition: all 0.2s ease;
}

.search-input:focus {
  outline: none;
  border-color: #2E7D32;
  background: white;
  box-shadow: 0 0 0 3px rgba(124, 45, 18, 0.1);
}

/* Stats Summary */
.stats-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.stat-item {
  background: linear-gradient(145deg, #ffffff 0%, #fefdfb 100%);
  border: 2px solid #E5E7EB;
  border-radius: 12px;
  padding: 1.5rem;
  text-align: center;
}

.stat-number {
  display: block;
  font-family: 'Space Mono', monospace;
  font-size: 2rem;
  font-weight: 700;
  background: #2E7D32;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 0.25rem;
}

.stat-label {
  display: block;
  font-size: 0.8125rem;
  color: #0F172A;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-weight: 600;
}

/* Course List */
.courses-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.course-group {
  background: linear-gradient(145deg, #ffffff 0%, #fefdfb 100%);
  border: 2px solid #E5E7EB;
  border-radius: 16px;
  padding: 1.5rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.course-group::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #2E7D32 0%, #0D9488 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.course-group:hover::before {
  opacity: 1;
}

.course-group.my-course {
  border-color: #2E7D32;
  box-shadow: 0 4px 12px rgba(124, 45, 18, 0.15);
}

.course-group.my-course::before {
  opacity: 1;
}

.course-header {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #e7e5e4;
}

.course-icon {
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, #fde68a 0%, #fcd34d 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.75rem;
  border: 2px solid #E8F5E9;
  flex-shrink: 0;
}

.course-main-info {
  flex: 1;
}

.course-name {
  font-family: 'DM Serif Display', Georgia, serif;
  font-size: 1.375rem;
  font-weight: 700;
  color: #2E7D32;
  margin: 0 0 0.5rem 0;
  line-height: 1.3;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.my-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.75rem;
  background: #CCFBF1;
  color: #0A7C72;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border: 1px solid #99F6E4;
}

.course-meta {
  color: #0F172A;
  font-size: 0.9375rem;
  margin: 0;
}

.classmate-count {
  padding: 0.5rem 1rem;
  background: #E8F5E9;
  color: #0A7C72;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  border: 1px solid #fde68a;
  white-space: nowrap;
}

/* Sections */
.sections-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.section-item {
  background: #fafaf9;
  border: 1px solid #E5E7EB;
  border-radius: 12px;
  padding: 1rem;
}

.section-item.my-section {
  background: #CCFBF1;
  border-color: #99F6E4;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1rem;
}

.section-info {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  align-items: center;
  flex: 1;
}

.section-type {
  padding: 0.25rem 0.625rem;
  background: #2E7D32;
  color: white;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.section-time,
.section-location,
.section-instructor {
  font-size: 0.875rem;
  color: #1c1917;
  font-weight: 500;
}

.section-badge {
  padding: 0.25rem 0.625rem;
  background: #0D9488;
  color: white;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  white-space: nowrap;
}

/* Students */
.students-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.student-chip {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.875rem;
  background: white;
  border: 2px solid #E5E7EB;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.student-chip:hover {
  border-color: #2E7D32;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(124, 45, 18, 0.1);
}

.student-chip.is-me {
  background: #0D9488;
  color: white;
  border-color: #0D9488;
  font-weight: 600;
}

.student-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: linear-gradient(135deg, #fde68a 0%, #fcd34d 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #E5E7EB;
  flex-shrink: 0;
  overflow: hidden;
}

.student-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.student-avatar .avatar-initials {
  font-size: 0.75rem;
  font-weight: 700;
  color: #0A7C72;
  font-family: 'DM Serif Display', Georgia, serif;
}

.student-name {
  font-size: 0.875rem;
  font-weight: 500;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  background: linear-gradient(145deg, #ffffff 0%, #fefdfb 100%);
  border-radius: 16px;
  border: 2px solid #E5E7EB;
}

.empty-icon {
  font-size: 5rem;
  margin-bottom: 1.5rem;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.empty-state h2 {
  font-family: 'DM Serif Display', Georgia, serif;
  font-size: 2rem;
  font-weight: 700;
  color: #2E7D32;
  margin: 0 0 1rem 0;
}

.empty-state p {
  font-size: 1.125rem;
  color: #0F172A;
  margin: 0 0 1.5rem 0;
}

.add-courses-btn {
  display: inline-block;
  padding: 0.875rem 2rem;
  background: #0D9488;
  color: white;
  text-decoration: none;
  border-radius: 12px;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(30, 58, 138, 0.3);
}

.add-courses-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(30, 58, 138, 0.4);
}

/* Calendar View */
.calendar-view {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.calendar-container {
  background: white;
  border: 2px solid #E5E7EB;
  border-radius: 16px;
  padding: 1.5rem;
  overflow-x: auto;
}

.calendar-grid {
  display: grid;
  grid-template-columns: 80px repeat(5, 1fr);
  gap: 0;
  min-width: 900px;
}

/* Time Column */
.time-column {
  display: flex;
  flex-direction: column;
  border-right: 2px solid #e7e5e4;
}

.time-header {
  height: 60px;
  border-bottom: 2px solid #e7e5e4;
  background: #fafaf9;
}

.time-slot {
  height: 60px;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 0.25rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: #0F172A;
  border-bottom: 1px solid #f5f5f4;
}

/* Day Columns */
.day-column {
  display: flex;
  flex-direction: column;
  border-right: 1px solid #e7e5e4;
}

.day-column:last-child {
  border-right: none;
}

.day-header {
  height: 60px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-bottom: 2px solid #e7e5e4;
  background: linear-gradient(145deg, #ffffff 0%, #fefdfb 100%);
}

.day-name {
  font-family: 'DM Serif Display', Georgia, serif;
  font-weight: 700;
  font-size: 1rem;
  color: #1c1917;
}

.day-abbr {
  font-size: 0.75rem;
  color: #0F172A;
  font-weight: 500;
}

.day-grid {
  position: relative;
  flex: 1;
}

.time-slot-bg {
  height: 60px;
  border-bottom: 1px solid #f5f5f4;
}

/* Calendar Classes */
.calendar-class {
  position: absolute;
  left: 4px;
  right: 4px;
  background: linear-gradient(135deg, #fde68a 0%, #fcd34d 100%);
  border: 2px solid #F59E0B;
  border-radius: 8px;
  padding: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  overflow: hidden;
  z-index: 10;
  min-height: 60px; /* Ensure minimum height */
}

/* Remove debug banner */

.calendar-class.has-classmates {
  background: linear-gradient(135deg, #2E7D32 0%, #256528 100%);
  border-color: #2E7D32;
  box-shadow: 0 4px 12px rgba(46, 125, 50, 0.3);
}

.calendar-class:hover {
  z-index: 20;
  transform: scale(1.02);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
}

.calendar-class.has-classmates:hover {
  box-shadow: 0 6px 20px rgba(124, 45, 18, 0.5);
}

.calendar-class.selected {
  z-index: 30;
  transform: scale(1.05);
  box-shadow: 0 0 0 4px #0D9488, 0 8px 24px rgba(13, 148, 136, 0.4) !important;
  animation: pulse-selection 0.5s ease;
}

.calendar-class.has-classmates.selected {
  box-shadow: 0 0 0 4px #2E7D32, 0 8px 24px rgba(46, 125, 50, 0.4) !important;
}

@keyframes pulse-selection {
  0%, 100% { transform: scale(1.05); }
  50% { transform: scale(1.08); }
}

.class-content {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  color: #1c1917;
}

.calendar-class.has-classmates .class-content {
  color: white;
}

.class-time {
  font-size: 0.6875rem;
  font-weight: 600;
  opacity: 0.9;
}

.class-code {
  font-family: 'DM Serif Display', Georgia, serif;
  font-size: 0.8125rem;
  font-weight: 700;
}

.class-location {
  font-size: 0.6875rem;
  opacity: 0.8;
}

.classmate-badge {
  font-size: 0.6875rem;
  font-weight: 600;
  margin-top: 0.125rem;
  padding: 0.125rem 0.375rem;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 4px;
  align-self: flex-start;
}

/* Class Modal Overlay */
.class-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  animation: overlayFadeIn 0.2s ease;
}

@keyframes overlayFadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.class-modal {
  background: white;
  border: 3px solid #0D9488;
  border-radius: 16px;
  padding: 0;
  min-width: 400px;
  max-width: 500px;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
  animation: modalSlideIn 0.3s ease;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(-20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  background: linear-gradient(145deg, #0D9488 0%, #0A7C72 100%);
  color: white;
  border-radius: 13px 13px 0 0;
}

.modal-header strong {
  font-family: 'DM Serif Display', Georgia, serif;
  font-size: 1.25rem;
  font-weight: 700;
  flex: 1;
}

.modal-close {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  font-size: 1.75rem;
  line-height: 1;
  color: white;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.modal-close:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.1);
}

.modal-body {
  padding: 1.5rem;
}

.modal-section {
  margin-bottom: 1rem;
  font-size: 0.9375rem;
}

.modal-section:last-child {
  margin-bottom: 0;
}

.modal-label {
  font-weight: 700;
  color: #1c1917;
  margin-bottom: 0.375rem;
  font-family: 'DM Serif Display', Georgia, serif;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.modal-section > div {
  color: #44403c;
  line-height: 1.5;
}

.classmates-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.classmate-chip-small {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.375rem 0.5rem;
  background: #E8F5E9;
  border-radius: 6px;
}

.classmate-avatar-small {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: linear-gradient(135deg, #fde68a 0%, #fcd34d 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #E5E7EB;
  flex-shrink: 0;
  overflow: hidden;
}

.classmate-avatar-small img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-initials-small {
  font-size: 0.625rem;
  font-weight: 700;
  color: #0A7C72;
  font-family: 'DM Serif Display', Georgia, serif;
}

.classmate-name-small {
  font-size: 0.8125rem;
  font-weight: 500;
  color: #1c1917;
}

.no-classmates-note {
  color: #0F172A;
  font-style: italic;
  font-size: 0.8125rem;
  padding: 1rem;
  background: #fafaf9;
  border-radius: 8px;
  text-align: center;
}

/* Empty Calendar State */
.empty-calendar {
  text-align: center;
  padding: 4rem 2rem;
  background: linear-gradient(145deg, #ffffff 0%, #fefdfb 100%);
  border: 2px solid #E5E7EB;
  border-radius: 16px;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.empty-calendar h3 {
  font-family: 'DM Serif Display', Georgia, serif;
  font-size: 1.5rem;
  font-weight: 700;
  color: #2E7D32;
  margin: 0 0 0.5rem 0;
}

.empty-calendar p {
  font-size: 1rem;
  color: #0F172A;
  margin: 0 0 1.5rem 0;
}

.add-classes-btn {
  display: inline-block;
  padding: 0.875rem 2rem;
  background: #0D9488;
  color: white;
  text-decoration: none;
  border-radius: 12px;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(30, 58, 138, 0.3);
}

.add-classes-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(30, 58, 138, 0.4);
}

/* Responsive */
@media (max-width: 768px) {
  .schedule-page {
    padding: 1rem;
  }

  .schedule-header {
    padding: 1.5rem;
  }

  .schedule-title {
    font-size: 1.5rem;
  }

  .view-toggle {
    flex-direction: column;
  }

  .toggle-btn {
    width: 100%;
  }

  .filters-section {
    flex-direction: column;
    align-items: stretch;
  }

  .filter-group {
    flex-direction: column;
    align-items: stretch;
  }

  .filter-select,
  .search-input {
    width: 100%;
  }

  .stats-summary {
    grid-template-columns: 1fr;
  }

  .course-header {
    flex-direction: column;
  }

  .course-icon {
    width: 48px;
    height: 48px;
    font-size: 1.5rem;
  }

  .course-name {
    font-size: 1.125rem;
  }

  .section-header {
    flex-direction: column;
  }

  .section-info {
    flex-direction: column;
    align-items: flex-start;
  }

  .class-modal {
    min-width: unset;
    width: calc(100% - 2rem);
    max-width: unset;
    margin: 1rem;
  }

  .modal-header strong {
    font-size: 1.125rem;
  }

  .modal-body {
    padding: 1.25rem;
  }

  .modal-section {
    font-size: 0.875rem;
  }
}
</style>

