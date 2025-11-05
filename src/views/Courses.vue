<template>
  <div class="courses-page">
    <!-- Header Section -->
    <div class="page-header">
      <div class="header-content">
        <h1>My Courses</h1>
        <p>Manage your course enrollments and connect with classmates</p>
      </div>
      <button @click="showAddForm = true" class="add-course-btn">
        <span class="btn-icon">+</span>
        Add Course
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>Loading your classes...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-message">
      {{ error }}
      <button type="button" @click="retryFetch" class="error-close">Retry</button>
    </div>

    <!-- Enrollments List -->
    <div v-else-if="myEnrollments.length > 0" class="enrollments-section">
      <div 
        v-for="enrollment in myEnrollments" 
        :key="enrollment._id"
        class="enrollment-card"
      >
        <div class="enrollment-header">
          <div class="course-badge">📚</div>
          <div class="course-info">
            <h3 class="course-title">
              {{ getCourseInfo(enrollment.course) }}
            </h3>
            <p class="course-section">
              Section: {{ getSectionInfo(enrollment.section) }}
            </p>
          </div>
          <button 
            @click="confirmDelete(enrollment)" 
            class="delete-btn"
            title="Remove enrollment"
            :disabled="userEnrollments.isLoading"
          >
            🗑️
          </button>
        </div>

        <div class="enrollment-footer">
          <div class="visibility-toggle-container">
            <label class="visibility-toggle">
              <input 
                type="checkbox" 
                :checked="enrollment.visibility"
                @change="toggleVisibility(enrollment._id, !enrollment.visibility)"
                :disabled="userEnrollments.isLoading"
                class="checkbox-input"
              />
              <span class="toggle-label">
                <span class="badge-icon">{{ enrollment.visibility ? '👁️' : '🔒' }}</span>
                {{ enrollment.visibility ? 'Visible to Community' : 'Private' }}
              </span>
            </label>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="empty-state">
      <div class="empty-icon">📚</div>
      <h2>No Classes Yet</h2>
      <p>Add your courses to connect with classmates and form study groups</p>
      <button @click="showAddForm = true" class="add-first-btn">Add Your First Course</button>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteConfirm" class="modal-overlay" @click="cancelDelete">
      <div class="modal-content delete-modal" @click.stop>
        <div class="modal-header delete-header">
          <h2>⚠️ Remove Enrollment?</h2>
          <button @click="cancelDelete" class="close-btn">×</button>
        </div>
        
        <div class="delete-modal-body">
          <p class="delete-warning">Are you sure you want to remove this course enrollment?</p>
          <div class="delete-course-info">
            <div class="delete-course-name">{{ getCourseInfo(enrollmentToDelete?.course || '') }}</div>
            <div class="delete-section-name">{{ getSectionInfo(enrollmentToDelete?.section || '') }}</div>
          </div>
          <p class="delete-note">This action cannot be undone.</p>
          
          <div v-if="deleteError" class="error-message">
            {{ deleteError }}
            <button type="button" @click="deleteError = ''" class="error-close">×</button>
          </div>
          
          <div class="delete-actions">
            <button 
              @click="cancelDelete" 
              class="cancel-btn"
              :disabled="userEnrollments.isLoading"
            >
              Cancel
            </button>
            <button 
              @click="handleDelete" 
              class="delete-confirm-btn"
              :disabled="userEnrollments.isLoading"
            >
              <span v-if="userEnrollments.isLoading" class="loading-spinner"></span>
              <span v-else>Remove Enrollment</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Course Modal -->
    <div v-if="showAddForm" class="modal-overlay" @click="closeAddForm">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>Add Course Enrollment</h2>
          <button @click="closeAddForm" class="close-btn">×</button>
        </div>
        
        <form @submit.prevent="handleAddCourse" class="add-form">
          <!-- Term -->
          <div class="form-section">
            <h3 class="section-title">Term Information</h3>
            <div class="form-group">
              <label for="termSelect">Term *</label>
              <select 
                id="termSelect" 
                v-model="addForm.termSelection" 
                @change="handleTermChange"
                required 
                class="form-input"
              >
                <option value="">Select term</option>
                <option 
                  v-for="term in courseCatalog.sortedTerms" 
                  :key="term._id" 
                  :value="term.name"
                >
                  {{ term.name }}
                </option>
                <option value="__other__">Other (enter custom term)</option>
              </select>
              <span class="input-hint">Select from existing terms or choose "Other"</span>
            </div>

            <!-- Custom term input (only shows when "Other" selected) -->
            <div v-if="addForm.termSelection === '__other__'" class="form-group">
              <label for="customTerm">Custom Term Name *</label>
              <input
                id="customTerm"
                v-model="addForm.customTermName"
                type="text"
                required
                placeholder="e.g., Fall 2024, Spring 2025, IAP 2025"
                class="form-input"
              />
              <span class="input-hint">Enter a new term name</span>
            </div>
          </div>

          <!-- Course Info -->
          <div class="form-section">
            <h3 class="section-title">Course Information</h3>
            <div class="form-row">
              <div class="form-group">
                <label for="courseNumber">Course Number *</label>
                <input
                  id="courseNumber"
                  v-model="addForm.courseNumber"
                  type="text"
                  required
                  placeholder="e.g., 6.1040"
                  class="form-input"
                />
              </div>
              
              <div class="form-group">
                <label for="department">Department *</label>
                <input
                  id="department"
                  v-model="addForm.department"
                  type="text"
                  required
                  placeholder="e.g., EECS, Math"
                  class="form-input"
                />
              </div>
            </div>

            <div class="form-group">
              <label for="courseName">Course Name *</label>
              <input
                id="courseName"
                v-model="addForm.courseName"
                type="text"
                required
                placeholder="e.g., Software Studio"
                class="form-input"
              />
            </div>
          </div>

          <!-- Section Info -->
          <div class="form-section">
            <h3 class="section-title">Section Details</h3>
            <div class="form-row">
              <div class="form-group">
                <label for="classType">Class Type *</label>
                <select id="classType" v-model="addForm.classType" required class="form-input">
                  <option value="">Select type</option>
                  <option value="Lecture">Lecture</option>
                  <option value="Recitation">Recitation</option>
                  <option value="Lab">Lab</option>
                  <option value="Tutorial">Tutorial</option>
                  <option value="Seminar">Seminar</option>
                </select>
              </div>
              
              <div class="form-group">
                <label for="instructor">Instructor *</label>
                <input
                  id="instructor"
                  v-model="addForm.instructor"
                  type="text"
                  required
                  placeholder="e.g., Dr. Smith"
                  class="form-input"
                />
              </div>
            </div>

            <div class="form-group">
              <label>Days of Week *</label>
              <div class="days-checkboxes">
                <label v-for="day in dayOptions" :key="day.value" class="checkbox-label">
                  <input
                    type="checkbox"
                    :value="day.value"
                    v-model="addForm.days"
                    class="checkbox-input"
                  />
                  <span>{{ day.label }}</span>
                </label>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="startTime">Start Time *</label>
                <input
                  id="startTime"
                  v-model="addForm.startTime"
                  type="time"
                  required
                  class="form-input"
                />
              </div>
              
              <div class="form-group">
                <label for="endTime">End Time *</label>
                <input
                  id="endTime"
                  v-model="addForm.endTime"
                  type="time"
                  required
                  class="form-input"
                />
              </div>
            </div>

            <div class="form-group">
              <label for="location">Location *</label>
              <input
                id="location"
                v-model="addForm.location"
                type="text"
                required
                placeholder="e.g., 32-123, Zoom"
                class="form-input"
              />
            </div>
          </div>

          <!-- Visibility -->
          <div class="form-section">
            <h3 class="section-title">Privacy</h3>
            <label class="checkbox-label visibility-checkbox">
              <input
                type="checkbox"
                v-model="addForm.visibility"
                class="checkbox-input"
              />
              <span>Make this enrollment visible to my communities</span>
            </label>
            <p class="visibility-hint">When visible, classmates in your communities can see you're taking this course</p>
          </div>

          <div v-if="formError" class="error-message">
            {{ formError }}
            <button type="button" @click="formError = ''" class="error-close">×</button>
          </div>
          
          <div class="form-actions">
            <button 
              type="button" 
              @click="closeAddForm" 
              class="cancel-btn"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              class="submit-btn"
              :disabled="userEnrollments.isLoading || addForm.days.length === 0"
            >
              <span v-if="userEnrollments.isLoading" class="loading-spinner"></span>
              <span v-else>Add Course</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useStores } from '@/composables/useStores'

const { auth, userEnrollments, courseCatalog } = useStores()

const isLoading = ref(true)
const error = ref('')
const showAddForm = ref(false)
const formError = ref('')
const showDeleteConfirm = ref(false)
const enrollmentToDelete = ref<any>(null)
const deleteError = ref('')

const dayOptions = [
  { value: 'M', label: 'Mon' },
  { value: 'T', label: 'Tue' },
  { value: 'W', label: 'Wed' },
  { value: 'Th', label: 'Thu' },
  { value: 'F', label: 'Fri' }
]

const addForm = ref({
  termSelection: '',
  customTermName: '',
  courseNumber: '',
  courseName: '',
  department: '',
  classType: '',
  days: [] as string[],
  startTime: '',
  endTime: '',
  location: '',
  instructor: '',
  visibility: true
})

const myEnrollments = computed(() => {
  if (!auth.userId) return []
  return userEnrollments.userEnrollments(auth.userId)
})

const getCourseInfo = (courseId: string) => {
  const course = courseCatalog.courses.find(c => c._id === courseId)
  if (!course) return 'Loading course...'
  return `${course.courseNumber}: ${course.courseName}`
}

const getSectionInfo = (sectionId: string) => {
  const section = courseCatalog.sections.find(s => s._id === sectionId)
  if (!section) return 'Loading...'
  return `${section.classType} - ${section.days.join(', ')} ${section.startTime}-${section.endTime}`
}

const fetchData = async () => {
  try {
    isLoading.value = true
    error.value = ''

    if (!auth.userId) {
      error.value = 'Please log in to view your classes'
      return
    }

    // Fetch user's enrollments
    await userEnrollments.fetchEnrollmentsByOwner(auth.userId)

    // Fetch course and section details for each enrollment
    const enrollmentsList = userEnrollments.userEnrollments(auth.userId)
    
    // Get unique course IDs
    const courseIds = [...new Set(enrollmentsList.map(e => e.course))]
    
    // Fetch courses and their sections
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
        // Fetch sections for this course
        await courseCatalog.fetchSectionsByCourse(courseId)
      }
    }

  } catch (err: any) {
    console.error('Error loading enrollments:', err)
    error.value = err.message || 'Failed to load your classes'
  } finally {
    isLoading.value = false
  }
}

const retryFetch = () => {
  fetchData()
}

const handleTermChange = () => {
  // Clear custom term when switching away from "Other"
  if (addForm.value.termSelection !== '__other__') {
    addForm.value.customTermName = ''
  }
}

const handleAddCourse = async () => {
  try {
    formError.value = ''
    
    if (!auth.userId) {
      formError.value = 'You must be logged in to add courses'
      return
    }

    if (addForm.value.days.length === 0) {
      formError.value = 'Please select at least one day of the week'
      return
    }

    // Determine which term name to use
    const termName = addForm.value.termSelection === '__other__' 
      ? addForm.value.customTermName.trim()
      : addForm.value.termSelection

    if (!termName) {
      formError.value = 'Please select or enter a term'
      return
    }

    // Step 1: Create or get term
    const termId = await courseCatalog.createOrGetTermAction(termName)

    // Step 2: Create or get course
    const courseId = await courseCatalog.createOrGetCourseAction(
      termId,
      addForm.value.courseNumber.trim(),
      addForm.value.courseName.trim(),
      addForm.value.department.trim()
    )

    // Step 3: Create or get section
    const sectionId = await courseCatalog.createOrGetSectionAction(
      courseId,
      addForm.value.classType,
      addForm.value.days,
      addForm.value.startTime,
      addForm.value.endTime,
      addForm.value.location.trim(),
      addForm.value.instructor.trim()
    )

    // Step 4: Create enrollment
    await userEnrollments.createEnrollment(
      auth.userId,
      courseId,
      sectionId,
      addForm.value.visibility
    )

    closeAddForm()
    
    // Refresh the list
    await fetchData()
  } catch (error: any) {
    console.error('Failed to add course:', error)
    formError.value = error.response?.data?.error || error.message || 'Failed to add course'
  }
}

const closeAddForm = () => {
  showAddForm.value = false
  addForm.value = {
    termSelection: '',
    customTermName: '',
    courseNumber: '',
    courseName: '',
    department: '',
    classType: '',
    days: [],
    startTime: '',
    endTime: '',
    location: '',
    instructor: '',
    visibility: true
  }
  formError.value = ''
  userEnrollments.clearError()
}

const confirmDelete = (enrollment: any) => {
  enrollmentToDelete.value = enrollment
  showDeleteConfirm.value = true
  deleteError.value = ''
}

const cancelDelete = () => {
  showDeleteConfirm.value = false
  enrollmentToDelete.value = null
  deleteError.value = ''
}

const handleDelete = async () => {
  if (!enrollmentToDelete.value) return
  
  try {
    deleteError.value = ''
    await userEnrollments.deleteEnrollment(enrollmentToDelete.value._id)
    cancelDelete()
  } catch (error: any) {
    console.error('Failed to delete enrollment:', error)
    deleteError.value = error.message || 'Failed to remove enrollment'
  }
}

const toggleVisibility = async (enrollmentId: string, newVisibility: boolean) => {
  try {
    await userEnrollments.toggleEnrollmentVisibility(enrollmentId, newVisibility)
  } catch (error: any) {
    console.error('Failed to toggle visibility:', error)
    // Optionally show an error notification
  }
}

onMounted(() => {
  // Fetch terms for later use
  courseCatalog.fetchAllTerms()
  fetchData()
})
</script>

<style scoped>
.courses-page {
  max-width: 1000px;
  margin: 0 auto;
  padding: 2rem;
  min-height: 70vh;
}

/* Header */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 2rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.header-content h1 {
  font-family: 'DM Serif Display', Georgia, serif;
  font-size: 2.25rem; /* 36px - H1 */
  font-weight: 400;
  color: #2E7D32;
  margin: 0 0 0.5rem 0;
  line-height: 1.2;
}

.header-content p {
  font-family: 'Inter', sans-serif;
  color: #0F172A;
  font-size: 1rem; /* 16px */
  margin: 0;
  line-height: 1.45;
}

.add-course-btn {
  background: #0D9488;
  color: #F8FAFC;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  font-weight: 600;
  font-family: 'Inter', sans-serif;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: 0 4px 12px rgba(13, 148, 136, 0.3);
  font-size: 1rem;
}

.add-course-btn:hover {
  background: #0A7C72;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(13, 148, 136, 0.4);
}

.btn-icon {
  font-size: 1.25rem;
  font-weight: bold;
  line-height: 1;
}

/* Loading State */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 40vh;
  gap: 1rem;
}

.loading-spinner {
  width: 48px;
  height: 48px;
  border: 4px solid #E5E7EB;
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

/* Error Message */
.error-message {
  background: #fef2f2;
  color: #2E7D32;
  padding: 1rem 1.5rem;
  border-radius: 8px;
  border: 1px solid #fecaca;
  border-left: 3px solid #EF4444;
  margin-bottom: 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.error-close {
  background: #EF4444;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.875rem;
  transition: all 0.2s ease;
}

.error-close:hover {
  background: #DC2626;
}

/* Enrollments Section */
.enrollments-section {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.enrollment-card {
  background: linear-gradient(145deg, #ffffff 0%, #fefdfb 100%);
  border: 2px solid #e7e5e4;
  border-radius: 16px;
  padding: 1.5rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.enrollment-card::before {
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

.enrollment-card:hover::before {
  opacity: 1;
}

.enrollment-card:hover {
  border-color: #2E7D32;
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(46, 125, 50, 0.1);
}

/* Enrollment Header */
.enrollment-header {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1rem;
  position: relative;
}

.course-badge {
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

.course-info {
  flex: 1;
}

.course-title {
  font-family: 'DM Serif Display', Georgia, serif;
  font-size: 1.25rem;
  font-weight: 700;
  color: #2E7D32;
  margin: 0 0 0.5rem 0;
  line-height: 1.3;
}

.course-section {
  color: #0F172A;
  font-size: 0.9375rem;
  margin: 0;
  line-height: 1.5;
}

.delete-btn {
  background: white;
  border: 2px solid #e7e5e4;
  border-radius: 8px;
  padding: 0.5rem 0.75rem;
  cursor: pointer;
  font-size: 1.25rem;
  transition: all 0.2s ease;
  flex-shrink: 0;
  line-height: 1;
}

.delete-btn:hover:not(:disabled) {
  background: #fef2f2;
  border-color: #fecaca;
  transform: scale(1.05);
}

.delete-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Enrollment Footer */
.enrollment-footer {
  padding-top: 1rem;
  border-top: 1px solid #e7e5e4;
}

.visibility-toggle-container {
  display: flex;
  align-items: center;
}

.visibility-toggle {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 8px;
  transition: background 0.2s ease;
}

.visibility-toggle:hover {
  background: #fafaf9;
}

.toggle-label {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: #1c1917;
}

.badge-icon {
  font-size: 1rem;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  background: linear-gradient(145deg, #ffffff 0%, #fefdfb 100%);
  border-radius: 16px;
  border: 2px solid #e7e5e4;
  margin-top: 2rem;
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
  font-size: 1.75rem; /* 28px - H2 */
  font-weight: 400;
  color: #2E7D32;
  margin: 0 0 1rem 0;
  line-height: 1.3;
}

.empty-state p {
  font-family: 'Inter', sans-serif;
  font-size: 1rem; /* 16px */
  color: #0F172A;
  margin: 0 0 1rem 0;
  line-height: 1.45;
}

.coming-soon-note {
  color: #64748B;
  font-style: italic;
  font-size: 0.9375rem !important;
}

.add-first-btn {
  margin-top: 1.5rem;
  padding: 0.875rem 2rem;
  background: #0D9488;
  color: #F8FAFC;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  font-family: 'Inter', sans-serif;
  font-size: 1rem; /* 16px */
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(13, 148, 136, 0.3);
}

.add-first-btn:hover {
  background: #0A7C72;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(13, 148, 136, 0.4);
}

/* Modal - reusing from CommunityBoard */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
  backdrop-filter: blur(2px);
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal-content {
  background: linear-gradient(145deg, #ffffff 0%, #fefdfb 100%);
  border-radius: 16px;
  box-shadow: 0 12px 40px rgba(124, 45, 18, 0.12);
  width: 100%;
  max-width: 700px;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  border: 2px solid #e7e5e4;
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from { 
    opacity: 0;
    transform: translateY(20px); 
  }
  to { 
    opacity: 1;
    transform: translateY(0); 
  }
}

.modal-content::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #2E7D32 0%, #0D9488 100%);
  border-radius: 16px 16px 0 0;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2rem 2rem 1rem;
  border-bottom: 2px solid #E5E7EB;
}

.modal-header h2 {
  font-family: 'DM Serif Display', Georgia, serif;
  font-size: 1.75rem; /* 28px - H2 */
  font-weight: 400;
  color: #2E7D32;
  margin: 0;
  line-height: 1.3;
}

.close-btn {
  background: none;
  border: none;
  font-size: 2rem;
  color: #0F172A;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  transition: all 0.2s ease;
  line-height: 1;
}

.close-btn:hover {
  background: #E8F5E9;
  color: #0F172A;
}

/* Form */
.add-form {
  padding: 2rem;
}

.form-section {
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #e7e5e4;
}

.form-section:last-of-type {
  border-bottom: none;
}

.section-title {
  font-family: 'DM Serif Display', Georgia, serif;
  font-size: 1.125rem;
  font-weight: 700;
  color: #2E7D32;
  margin: 0 0 1rem 0;
}

.form-group {
  margin-bottom: 1.25rem;
}

.form-group label {
  display: block;
  color: #1c1917;
  font-weight: 600;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  letter-spacing: 0.3px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-input,
select.form-input {
  width: 100%;
  padding: 0.875rem 1rem;
  border: 2px solid #e7e5e4;
  border-radius: 8px;
  font-size: 1rem;
  font-family: inherit;
  transition: all 0.2s ease;
  background-color: #fafaf9;
}

.form-input:focus,
select.form-input:focus {
  outline: none;
  border-color: #2E7D32;
  background-color: white;
  box-shadow: 0 0 0 3px rgba(46, 125, 50, 0.1);
}

.input-hint {
  display: block;
  font-size: 0.8125rem; /* 13px - Code/Meta */
  color: #0F172A;
  font-family: 'Inter', sans-serif;
  margin-top: 0.375rem;
  font-style: italic;
}

/* Checkboxes */
.days-checkboxes {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  padding: 0.5rem 0;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  color: #1c1917;
  font-weight: 500;
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  transition: background 0.2s;
}

.checkbox-label:hover {
  background: #E8F5E9;
}

.checkbox-input {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: #2E7D32;
}

.visibility-checkbox {
  padding: 1rem;
  background: #E8F5E9;
  border-radius: 8px;
  margin-bottom: 0.75rem;
}

.visibility-hint {
  font-family: 'Inter', sans-serif;
  color: #0F172A;
  font-size: 0.875rem; /* 14px - Small */
  margin: 0;
  line-height: 1.45;
}

/* Error styling reuse */
.error-close {
  background: #EF4444;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.875rem;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.error-close:hover {
  background: #DC2626;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
}

.cancel-btn {
  padding: 0.75rem 1.5rem;
  background: white;
  color: #0F172A;
  border: 2px solid #E5E7EB;
  border-radius: 8px;
  font-weight: 600;
  font-family: 'Inter', sans-serif;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 1rem;
}

.cancel-btn:hover {
  border-color: #0F172A;
  background: #F8FAFC;
}

.submit-btn {
  padding: 0.75rem 1.5rem;
  background: #2E7D32;
  color: #F8FAFC;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-family: 'Inter', sans-serif;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: 0 2px 8px rgba(46, 125, 50, 0.3);
  font-size: 1rem;
  min-width: 120px;
  justify-content: center;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(30, 58, 138, 0.4);
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.submit-btn .loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

/* Delete Confirmation Modal */
.delete-modal {
  max-width: 500px;
}

.delete-header {
  background: linear-gradient(135deg, #EF4444 0%, #DC2626 100%);
  color: #F8FAFC;
  border-radius: 14px 14px 0 0;
}

.delete-header h2 {
  color: white;
}

.delete-modal-body {
  padding: 2rem;
}

.delete-warning {
  font-size: 1.125rem;
  color: #1c1917;
  margin: 0 0 1.5rem 0;
  font-weight: 600;
}

.delete-course-info {
  background: #fafaf9;
  border: 2px solid #e7e5e4;
  border-radius: 12px;
  padding: 1.25rem;
  margin-bottom: 1.5rem;
}

.delete-course-name {
  font-family: 'DM Serif Display', Georgia, serif;
  font-size: 1.375rem; /* 22px - H3 */
  font-weight: 400;
  color: #0D9488;
  margin-bottom: 0.5rem;
  line-height: 1.4;
}

.delete-section-name {
  font-family: 'Inter', sans-serif;
  font-size: 0.9375rem;
  color: #0F172A;
}

.delete-note {
  font-family: 'Inter', sans-serif;
  font-size: 0.875rem; /* 14px - Small */
  color: #0F172A;
  font-style: italic;
  margin: 0 0 1.5rem 0;
  line-height: 1.45;
}

.delete-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

.delete-confirm-btn {
  padding: 0.75rem 1.5rem;
  background: #EF4444;
  color: #F8FAFC;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-family: 'Inter', sans-serif;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3);
  font-size: 1rem;
  min-width: 160px;
  justify-content: center;
}

.delete-confirm-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(124, 45, 18, 0.4);
}

.delete-confirm-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.delete-confirm-btn .loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

/* Responsive Design */
@media (max-width: 768px) {
  .courses-page {
    padding: 1rem;
  }

  .page-header {
    flex-direction: column;
    align-items: stretch;
    margin-bottom: 1.5rem;
  }

  .header-content h1 {
    font-size: 2rem;
  }

  .add-course-btn {
    width: 100%;
    justify-content: center;
  }

  .enrollment-card {
    padding: 1.25rem;
  }

  .course-badge {
    width: 48px;
    height: 48px;
    font-size: 1.5rem;
  }

  .course-title {
    font-size: 1.125rem;
  }

  .empty-state {
    padding: 3rem 1.5rem;
  }

  .modal-content {
    max-height: 95vh;
  }

  .modal-header {
    padding: 1.5rem 1.5rem 1rem;
  }

  .modal-header h2 {
    font-size: 1.5rem;
  }

  .add-form {
    padding: 1.5rem;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .form-actions {
    flex-direction: column;
  }

  .cancel-btn,
  .submit-btn {
    width: 100%;
  }
}
</style>
