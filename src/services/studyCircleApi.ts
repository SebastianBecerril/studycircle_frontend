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
  async createProfile(user: string, displayName: string) {
    const response = await api.post('/UserProfile/createProfile', { user, displayName })
    return response.data
  },

  async updateDisplayName(profile: string, newDisplayName: string) {
    const response = await api.post('/UserProfile/updateDisplayName', { profile, newDisplayName })
    return response.data
  },

  async updateBio(profile: string, newBio: string) {
    const response = await api.post('/UserProfile/updateBio', { profile, newBio })
    return response.data
  },

  async updateThumbnailImage(profile: string, newThumbnailImageURL: string) {
    const response = await api.post('/UserProfile/updateThumbnailImage', { profile, newThumbnailImageURL })
    return response.data
  },

  async deleteProfile(profile: string) {
    const response = await api.post('/UserProfile/deleteProfile', { profile })
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
  async createCommunity(name: string, description: string, creator: string) {
    const response = await api.post('/Community/createCommunity', { name, description, creator })
    return response.data
  },

  async updateCommunityDetails(community: string, newName: string, newDescription: string, requester: string) {
    const response = await api.post('/Community/updateCommunityDetails', { community, newName, newDescription, requester })
    return response.data
  },

  async addMember(community: string, user: string, inviter: string) {
    const response = await api.post('/Community/addMember', { community, user, inviter })
    return response.data
  },

  async removeMember(community: string, user: string, requester: string) {
    const response = await api.post('/Community/removeMember', { community, user, requester })
    return response.data
  },

  async setMemberRole(membership: string, newRole: string, requester: string) {
    const response = await api.post('/Community/setMemberRole', { membership, newRole, requester })
    return response.data
  },

  async deleteCommunity(community: string, requester: string) {
    const response = await api.post('/Community/deleteCommunity', { community, requester })
    return response.data
  },

  async getCommunityById(community: string) {
    const response = await api.post('/Community/_getCommunityById', { community })
    return response.data
  },

  async getMembershipById(membership: string) {
    const response = await api.post('/Community/_getMembershipById', { membership })
    return response.data
  },

  async getMembershipsByCommunity(community: string) {
    const response = await api.post('/Community/_getMembershipsByCommunity', { community })
    return response.data
  },

  async getMembershipsByUser(user: string) {
    const response = await api.post('/Community/_getMembershipsByUser', { user })
    return response.data
  },

  // Join/Leave Community methods
  async joinCommunity(communityId: string, userId: string) {
    const response = await api.post('/Community/addMember', { 
      community: communityId, 
      user: userId, 
      inviter: userId // User joins themselves
    })
    return response.data
  },

  async leaveCommunity(communityId: string, userId: string) {
    const response = await api.post('/Community/removeMember', { 
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
  async createPost(author: string, community: string, title: string, body: string, tags: string[], course: string) {
    const response = await api.post('/CommunityBoard/createPost', { author, community, title, body, tags, course })
    return response.data
  },

  async updatePost(posting: string, newTitle: string, newBody: string, newTags: string[], newCourse: string, requester: string) {
    const response = await api.post('/CommunityBoard/updatePost', { posting, newTitle, newBody, newTags, newCourse, requester })
    return response.data
  },

  async replyToPost(posting: string, author: string, body: string) {
    const response = await api.post('/CommunityBoard/replyToPost', { posting, author, body })
    return response.data
  },

  async updateReply(reply: string, newBody: string, requester: string) {
    const response = await api.post('/CommunityBoard/updateReply', { reply, newBody, requester })
    return response.data
  },

  async deletePost(posting: string, requester: string) {
    const response = await api.post('/CommunityBoard/deletePost', { posting, requester })
    return response.data
  },

  async deleteReply(reply: string, requester: string) {
    const response = await api.post('/CommunityBoard/deleteReply', { reply, requester })
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
  async createOrGetTerm(name: string) {
    const response = await api.post('/CourseCatalog/createOrGetTerm', { name })
    return response.data
  },

  async updateTermName(term: string, newName: string) {
    const response = await api.post('/CourseCatalog/updateTermName', { term, newName })
    return response.data
  },

  async deleteTerm(term: string) {
    const response = await api.post('/CourseCatalog/deleteTerm', { term })
    return response.data
  },

  async createOrGetCourse(term: string, courseNumber: string, courseName: string, department: string) {
    const response = await api.post('/CourseCatalog/createOrGetCourse', { term, courseNumber, courseName, department })
    return response.data
  },

  async updateCourseDetails(course: string, newCourseNumber: string, newCourseName: string, newDepartment: string) {
    const response = await api.post('/CourseCatalog/updateCourseDetails', { course, newCourseNumber, newCourseName, newDepartment })
    return response.data
  },

  async deleteCourse(course: string) {
    const response = await api.post('/CourseCatalog/deleteCourse', { course })
    return response.data
  },

  async createOrGetSection(course: string, classType: string, days: string[], startTime: string, endTime: string, location: string, instructor: string) {
    const response = await api.post('/CourseCatalog/createOrGetSection', { course, classType, days, startTime, endTime, location, instructor })
    return response.data
  },

  async updateSectionDetails(section: string, newClassType: string, newDays: string[], newStartTime: string, newEndTime: string, newLocation: string, newInstructor: string) {
    const response = await api.post('/CourseCatalog/updateSectionDetails', { section, newClassType, newDays, newStartTime, newEndTime, newLocation, newInstructor })
    return response.data
  },

  async deleteSection(section: string) {
    const response = await api.post('/CourseCatalog/deleteSection', { section })
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
  async addEnrollment(owner: string, course: string, section: string, visibility: boolean) {
    const response = await api.post('/UserEnrollments/addEnrollment', { owner, course, section, visibility })
    return response.data
  },

  async updateCourseSection(enrollment: string, newSection: string) {
    const response = await api.post('/UserEnrollments/updateCourseSection', { enrollment, newSection })
    return response.data
  },

  async setEnrollmentVisibility(enrollment: string, newVisibility: boolean) {
    const response = await api.post('/UserEnrollments/setEnrollmentVisibility', { enrollment, newVisibility })
    return response.data
  },

  async removeEnrollment(enrollment: string) {
    const response = await api.post('/UserEnrollments/removeEnrollment', { enrollment })
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