import axios from 'axios'

// Create axios instance for API calls
// Uses Vite proxy (/api -> http://localhost:8000) to avoid CORS issues
const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('authToken')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export const studyCircleApi = {
  // UserAuthentication APIs
  async register(username: string, password: string) {
    const response = await api.post('/UserAuthentication/register', { username, password })
    return response.data
  },

  async login(username: string, password: string) {
    const response = await api.post('/UserAuthentication/login', { username, password })
    return response.data
  },

  async logout(sessionId: string) {
    const response = await api.post('/UserAuthentication/logout', { sessionId })
    return response.data
  },

  async isValidSession(sessionId: string) {
    const response = await api.post('/UserAuthentication/_isValidSession', { sessionId })
    return response.data
  },

  async getUserByUsername(username: string) {
    const response = await api.post('/UserAuthentication/_getUserByUsername', { username })
    return response.data
  },

  // UserProfile APIs
  async createProfile(session: string, displayName: string) {
    const response = await api.post('/api/UserProfile/createProfile', { session, displayName })
    return response.data
  },

  async updateDisplayName(session: string, profile: string, newDisplayName: string) {
    const response = await api.post('/api/UserProfile/updateDisplayName', { session, profile, newDisplayName })
    return response.data
  },

  async updateBio(session: string, profile: string, newBio: string) {
    const response = await api.post('/api/UserProfile/updateBio', { session, profile, newBio })
    return response.data
  },

  async updateThumbnailImage(session: string, profile: string, newThumbnailImageURL: string) {
    const response = await api.post('/api/UserProfile/updateThumbnailImage', { session, profile, newThumbnailImageURL })
    return response.data
  },

  async deleteProfile(session: string, profile: string) {
    const response = await api.post('/api/UserProfile/deleteProfile', { session, profile })
    return response.data
  },

  async getProfileById(profile: string) {
    const response = await api.post('/UserProfile/_getProfileById', { profile })
    return response.data
  },

  async getProfileByUser(user: string) {
    const response = await api.post('/UserProfile/_getProfileByUser', { user })
    return response.data
  },

  // Community APIs
  async createCommunity(session: string, name: string, description: string, creator?: string) {
    const payload: Record<string, unknown> = { session, name, description }
    if (creator) {
      payload.creator = creator
    }
    const response = await api.post('/Community/createCommunity', payload)
    return response.data
  },

  async updateCommunityDetails(session: string, community: string, newName: string, newDescription: string, requester?: string) {
    const payload: Record<string, unknown> = { session, community, newName, newDescription }
    if (requester) {
      payload.requester = requester
    }
    const response = await api.post('/Community/updateCommunityDetails', payload)
    return response.data
  },

  async addMember(session: string, community: string, user: string, inviter?: string) {
    const payload: Record<string, unknown> = { session, community, user }
    if (inviter) {
      payload.inviter = inviter
    }
    const response = await api.post('/Community/addMember', payload)
    return response.data
  },

  async removeMember(session: string, community: string, user: string, requester?: string) {
    const payload: Record<string, unknown> = { session, community, user }
    if (requester) {
      payload.requester = requester
    }
    const response = await api.post('/Community/removeMember', payload)
    return response.data
  },

  async setMemberRole(session: string, membership: string, newRole: string, requester?: string) {
    const payload: Record<string, unknown> = { session, membership, newRole }
    if (requester) {
      payload.requester = requester
    }
    const response = await api.post('/Community/setMemberRole', payload)
    return response.data
  },

  async deleteCommunity(session: string, community: string, requester?: string) {
    const payload: Record<string, unknown> = { session, community }
    if (requester) {
      payload.requester = requester
    }
    const response = await api.post('/Community/deleteCommunity', payload)
    return response.data
  },

  async getCommunityById(session: string, community: string) {
    const response = await api.post('/Community/_getCommunityById', { session, community })
    return response.data
  },

  async getMembershipById(session: string, membership: string) {
    const response = await api.post('/Community/_getMembershipById', { session, membership })
    return response.data
  },

  async getMembershipsByCommunity(session: string, community: string) {
    const response = await api.post('/Community/_getMembershipsByCommunity', { session, community })
    return response.data
  },

  async getMembershipsByUser(session: string, user: string) {
    const response = await api.post('/Community/_getMembershipsByUser', { session, user })
    return response.data
  },

  // Join/Leave Community methods
  async joinCommunity(session: string, communityId: string, userId: string, inviterId?: string) {
    const response = await api.post('/Community/addMember', {
      session,
      community: communityId,
      user: userId,
      inviter: inviterId || userId // Default to self-invite for self-join
    })
    return response.data
  },

  async leaveCommunity(session: string, communityId: string, userId: string) {
    const response = await api.post('/Community/removeMember', {
      session,
      community: communityId,
      user: userId,
      requester: userId // User removes themselves
    })
    return response.data
  },

  async getMembershipsByRole(community: string, role: string) {
    const response = await api.post('/Community/_getMembershipsByRole', { community, role })
    return response.data
  },

  async getAllCommunities() {
    const response = await api.post('/Community/_getAllCommunities', {})
    return response.data
  },

  async getAllMemberships() {
    const response = await api.post('/Community/_getAllMemberships', {})
    return response.data
  },

  // CommunityBoard APIs
  async createPost(session: string, community: string, title: string, body: string, tags: string[], course: string) {
    const response = await api.post('/api/CommunityBoard/createPost', { session, community, title, body, tags, course })
    return response.data
  },

  async updatePost(session: string, posting: string, newTitle: string, newBody: string, newTags: string[], newCourse: string) {
    const response = await api.post('/api/CommunityBoard/updatePost', { session, posting, newTitle, newBody, newTags, newCourse })
    return response.data
  },

  async replyToPost(session: string, posting: string, body: string) {
    const response = await api.post('/api/CommunityBoard/replyToPost', { session, posting, body })
    return response.data
  },

  async updateReply(session: string, reply: string, newBody: string) {
    const response = await api.post('/api/CommunityBoard/updateReply', { session, reply, newBody })
    return response.data
  },

  async deletePost(session: string, posting: string) {
    const response = await api.post('/api/CommunityBoard/deletePost', { session, posting })
    return response.data
  },

  async deleteReply(session: string, reply: string) {
    const response = await api.post('/api/CommunityBoard/deleteReply', { session, reply })
    return response.data
  },

  async getPostById(posting: string) {
    const response = await api.post('/CommunityBoard/_getPostById', { posting })
    return response.data
  },

  async getRepliesForPost(posting: string) {
    const response = await api.post('/CommunityBoard/_getRepliesForPost', { posting })
    return response.data
  },

  async getPostsByCommunity(community: string) {
    const response = await api.post('/CommunityBoard/_getPostsByCommunity', { community })
    return response.data
  },

  // CourseCatalog APIs
  async createOrGetTerm(sessionId: string, name: string) {
    const response = await api.post('/api/CourseCatalog/createOrGetTerm', { sessionId, name })
    return response.data
  },

  async updateTermName(sessionId: string, term: string, newName: string) {
    const response = await api.post('/api/CourseCatalog/updateTermName', { sessionId, term, newName })
    return response.data
  },

  async deleteTerm(sessionId: string, term: string) {
    const response = await api.post('/api/CourseCatalog/deleteTerm', { sessionId, term })
    return response.data
  },

  async createOrGetCourse(sessionId: string, term: string, courseNumber: string, courseName: string, department: string) {
    const response = await api.post('/api/CourseCatalog/createOrGetCourse', { sessionId, term, courseNumber, courseName, department })
    return response.data
  },

  async updateCourseDetails(sessionId: string, course: string, newCourseNumber: string, newCourseName: string, newDepartment: string) {
    const response = await api.post('/api/CourseCatalog/updateCourseDetails', { sessionId, course, newCourseNumber, newCourseName, newDepartment })
    return response.data
  },

  async deleteCourse(sessionId: string, course: string) {
    const response = await api.post('/api/CourseCatalog/deleteCourse', { sessionId, course })
    return response.data
  },

  async createOrGetSection(sessionId: string, course: string, classType: string, days: string[], startTime: string, endTime: string, location: string, instructor: string) {
    const response = await api.post('/api/CourseCatalog/createOrGetSection', { sessionId, course, classType, days, startTime, endTime, location, instructor })
    return response.data
  },

  async updateSectionDetails(sessionId: string, section: string, newClassType: string, newDays: string[], newStartTime: string, newEndTime: string, newLocation: string, newInstructor: string) {
    const response = await api.post('/api/CourseCatalog/updateSectionDetails', { sessionId, section, newClassType, newDays, newStartTime, newEndTime, newLocation, newInstructor })
    return response.data
  },

  async deleteSection(sessionId: string, section: string) {
    const response = await api.post('/api/CourseCatalog/deleteSection', { sessionId, section })
    return response.data
  },

  async getTerms() {
    const response = await api.post('/CourseCatalog/_getTerms', {})
    return response.data
  },

  async getTermById(term: string) {
    const response = await api.post('/CourseCatalog/_getTermById', { term })
    return response.data
  },

  async getCoursesForTerm(term: string) {
    const response = await api.post('/CourseCatalog/_getCoursesForTerm', { term })
    return response.data
  },

  // Alias for consistency
  async getCoursesByTerm(term: string) {
    return this.getCoursesForTerm(term)
  },

  async getCourseById(course: string) {
    const response = await api.post('/CourseCatalog/_getCourseById', { course })
    return response.data
  },

  async getSectionsForCourse(course: string) {
    const response = await api.post('/CourseCatalog/_getSectionsForCourse', { course })
    return response.data
  },

  // Alias for consistency
  async getSectionsByCourse(course: string) {
    return this.getSectionsForCourse(course)
  },

  async getSectionById(section: string) {
    const response = await api.post('/CourseCatalog/_getSectionById', { section })
    return response.data
  },

  // UserEnrollments APIs
  async addEnrollment(sessionId: string, course: string, section: string, visibility: boolean) {
    const response = await api.post('/UserEnrollments/addEnrollment', { sessionId, course, section, visibility })
    return response.data
  },

  async updateCourseSection(sessionId: string, enrollment: string, newSection: string) {
    const response = await api.post('/UserEnrollments/updateCourseSection', { sessionId, enrollment, newSection })
    return response.data
  },

  async setEnrollmentVisibility(sessionId: string, enrollment: string, newVisibility: boolean) {
    const response = await api.post('/UserEnrollments/setEnrollmentVisibility', { sessionId, enrollment, newVisibility })
    return response.data
  },

  async removeEnrollment(sessionId: string, enrollment: string) {
    const response = await api.post('/UserEnrollments/removeEnrollment', { sessionId, enrollment })
    return response.data
  },


  async getEnrollmentById(enrollment: string) {
    const response = await api.post('/UserEnrollments/_getEnrollmentById', { enrollment })
    return response.data
  },

  async getEnrollmentsByOwner(owner: string) {
    const response = await api.post('/UserEnrollments/_getEnrollmentsByOwner', { owner })
    return response.data
  },

  async getEnrollmentsByCourse(course: string) {
    const response = await api.post('/UserEnrollments/_getEnrollmentsByCourse', { course })
    return response.data
  },

  async getEnrollmentsBySection(section: string) {
    const response = await api.post('/UserEnrollments/_getEnrollmentsBySection', { section })
    return response.data
  },

  async getVisibleEnrollments() {
    const response = await api.post('/UserEnrollments/_getVisibleEnrollments', {})
    return response.data
  },

  async getAllEnrollments() {
    const response = await api.post('/UserEnrollments/_getAllEnrollments', {})
    return response.data
  }
}