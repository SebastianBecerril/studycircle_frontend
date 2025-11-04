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
        <router-link :to="`/community/${communityId}`" class="back-link">
          ← Back to Board
        </router-link>
        
        <div class="header-content">
          <h1 class="schedule-title">{{ currentCommunity.name }} - Shared Schedule</h1>
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
                    <span class="section-time">{{ section.days.join(', ') }} {{ section.startTime }}-{{ section.endTime }}</span>
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
        <div class="coming-soon-card">
          <div class="calendar-icon">📅</div>
          <h2>Calendar View Coming Soon</h2>
          <p>We're working on a visual weekly calendar to see time overlaps at a glance!</p>
          <button @click="currentView = 'list'" class="switch-view-btn">View List for Now</button>
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
      (sum, section) => sum + section.students.length,
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
    // TODO: Backend needs endpoint: GET /api/enrollments/community/:communityId
    // This should return all VISIBLE enrollments for all members of the community
    // For now, we fetch enrollments for each member individually
    
    if (communityMemberIds.value.length > 0) {
      // Clear existing enrollments first to avoid stale data
      userEnrollments.clearEnrollments()
      
      // Fetch enrollments for each community member
      // Using fetchAndMergeEnrollmentsByOwner to accumulate all enrollments
      const fetchPromises = communityMemberIds.value.map(memberId => 
        userEnrollments.fetchAndMergeEnrollmentsByOwner(memberId)
      )
      
      // Wait for all fetches to complete
      await Promise.all(fetchPromises)
      
      console.log('Loaded enrollments for', communityMemberIds.value.length, 'community members')
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
          console.log('Fetching course details for:', courseId)
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
  border-top: 4px solid #1e3a8a;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-container p {
  color: #78716c;
  font-size: 1rem;
}

.error-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.error-container h2 {
  font-family: 'Sora', sans-serif;
  color: #7c2d12;
  font-size: 2rem;
  margin: 0 0 1rem 0;
}

.error-container p {
  color: #78716c;
  margin-bottom: 2rem;
}

.back-btn {
  display: inline-block;
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%);
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
  border: 2px solid #e7e5e4;
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
  background: linear-gradient(90deg, #7c2d12 0%, #1e3a8a 50%, #d97706 100%);
  border-radius: 16px 16px 0 0;
}

.back-link {
  display: inline-flex;
  align-items: center;
  color: #78716c;
  text-decoration: none;
  font-weight: 500;
  margin-bottom: 1.5rem;
  transition: all 0.2s ease;
}

.back-link:hover {
  color: #7c2d12;
  transform: translateX(-4px);
}

.header-content {
  text-align: center;
  margin-bottom: 1.5rem;
}

.schedule-title {
  font-family: 'Sora', sans-serif;
  font-size: 2rem;
  font-weight: 800;
  color: #7c2d12;
  margin: 0 0 0.5rem 0;
  letter-spacing: -0.5px;
}

.schedule-subtitle {
  font-size: 1.125rem;
  color: #78716c;
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
  border: 2px solid #e7e5e4;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #78716c;
}

.toggle-btn:hover {
  border-color: #7c2d12;
  background: #fef3c7;
  color: #1c1917;
}

.toggle-btn.active {
  background: #7c2d12;
  color: white;
  border-color: #7c2d12;
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
  border: 2px solid #e7e5e4;
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
  color: #78716c;
  font-size: 1rem;
  font-family: inherit;
}

.nav-tab:hover {
  background: #fef3c7;
  color: #1c1917;
}

.nav-tab.active {
  background: #7c2d12;
  color: white;
  box-shadow: 0 2px 8px rgba(124, 45, 18, 0.3);
}

.nav-tab-link {
  text-decoration: none;
}

/* Filters */
.filters-section {
  background: linear-gradient(145deg, #ffffff 0%, #fefdfb 100%);
  border: 2px solid #e7e5e4;
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
  border: 2px solid #e7e5e4;
  border-radius: 6px;
  background: #fafaf9;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.filter-select:focus {
  outline: none;
  border-color: #7c2d12;
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
  background: #fef3c7;
}

.checkbox-filter input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: #7c2d12;
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
  border: 2px solid #e7e5e4;
  border-radius: 6px;
  background: #fafaf9;
  font-size: 0.875rem;
  transition: all 0.2s ease;
}

.search-input:focus {
  outline: none;
  border-color: #7c2d12;
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
  border: 2px solid #e7e5e4;
  border-radius: 12px;
  padding: 1.5rem;
  text-align: center;
}

.stat-number {
  display: block;
  font-family: 'Space Mono', monospace;
  font-size: 2rem;
  font-weight: 700;
  background: linear-gradient(135deg, #7c2d12 0%, #92400e 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 0.25rem;
}

.stat-label {
  display: block;
  font-size: 0.8125rem;
  color: #78716c;
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
  border: 2px solid #e7e5e4;
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
  background: linear-gradient(90deg, #7c2d12 0%, #1e3a8a 50%, #d97706 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.course-group:hover::before {
  opacity: 1;
}

.course-group.my-course {
  border-color: #7c2d12;
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
  border: 2px solid #fef3c7;
  flex-shrink: 0;
}

.course-main-info {
  flex: 1;
}

.course-name {
  font-family: 'Sora', sans-serif;
  font-size: 1.375rem;
  font-weight: 700;
  color: #7c2d12;
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
  background: #dbeafe;
  color: #1e3a8a;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border: 1px solid #93c5fd;
}

.course-meta {
  color: #78716c;
  font-size: 0.9375rem;
  margin: 0;
}

.classmate-count {
  padding: 0.5rem 1rem;
  background: #fef3c7;
  color: #92400e;
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
  border: 1px solid #e7e5e4;
  border-radius: 12px;
  padding: 1rem;
}

.section-item.my-section {
  background: #dbeafe;
  border-color: #93c5fd;
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
  background: #7c2d12;
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
  background: #1e3a8a;
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
  border: 2px solid #e7e5e4;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.student-chip:hover {
  border-color: #7c2d12;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(124, 45, 18, 0.1);
}

.student-chip.is-me {
  background: #1e3a8a;
  color: white;
  border-color: #1e3a8a;
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
  border: 2px solid #e7e5e4;
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
  color: #92400e;
  font-family: 'Sora', sans-serif;
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
  border: 2px solid #e7e5e4;
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
  font-family: 'Sora', sans-serif;
  font-size: 2rem;
  font-weight: 700;
  color: #7c2d12;
  margin: 0 0 1rem 0;
}

.empty-state p {
  font-size: 1.125rem;
  color: #78716c;
  margin: 0 0 1.5rem 0;
}

.add-courses-btn {
  display: inline-block;
  padding: 0.875rem 2rem;
  background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%);
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
  align-items: center;
  justify-content: center;
  min-height: 40vh;
}

.coming-soon-card {
  text-align: center;
  background: linear-gradient(145deg, #ffffff 0%, #fefdfb 100%);
  border: 2px solid #e7e5e4;
  border-radius: 16px;
  padding: 4rem 3rem;
  max-width: 500px;
}

.calendar-icon {
  font-size: 5rem;
  margin-bottom: 1.5rem;
}

.coming-soon-card h2 {
  font-family: 'Sora', sans-serif;
  font-size: 2rem;
  font-weight: 700;
  color: #7c2d12;
  margin: 0 0 1rem 0;
}

.coming-soon-card p {
  font-size: 1.125rem;
  color: #78716c;
  margin: 0 0 2rem 0;
}

.switch-view-btn {
  padding: 0.875rem 2rem;
  background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(30, 58, 138, 0.3);
}

.switch-view-btn:hover {
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
}
</style>

