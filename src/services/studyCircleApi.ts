import api from './api'

// Types for your API responses
export interface User {
  id: number
  name: string
  email: string
  avatar?: string
}

export interface StudyGroup {
  id: number
  name: string
  description: string
  subject: string
  members: User[]
  created_at: string
}

export interface StudySession {
  id: number
  group_id: number
  title: string
  description: string
  scheduled_time: string
  duration: number
  location?: string
  is_online: boolean
}

// API functions
export const studyCircleApi = {
  // User authentication
  async login(email: string, password: string) {
    const response = await api.post('/auth/login', { email, password })
    return response.data
  },

  async register(userData: { name: string; email: string; password: string }) {
    const response = await api.post('/auth/register', userData)
    return response.data
  },

  async logout() {
    const response = await api.post('/auth/logout')
    return response.data
  },

  // Study groups
  async getStudyGroups() {
    const response = await api.get('/study-groups')
    return response.data
  },

  async createStudyGroup(groupData: Omit<StudyGroup, 'id' | 'created_at' | 'members'>) {
    const response = await api.post('/study-groups', groupData)
    return response.data
  },

  async joinStudyGroup(groupId: number) {
    const response = await api.post(`/study-groups/${groupId}/join`)
    return response.data
  },

  async leaveStudyGroup(groupId: number) {
    const response = await api.post(`/study-groups/${groupId}/leave`)
    return response.data
  },

  // Study sessions
  async getStudySessions(groupId?: number) {
    const url = groupId ? `/study-sessions?group_id=${groupId}` : '/study-sessions'
    const response = await api.get(url)
    return response.data
  },

  async createStudySession(sessionData: Omit<StudySession, 'id'>) {
    const response = await api.post('/study-sessions', sessionData)
    return response.data
  },

  async updateStudySession(sessionId: number, sessionData: Partial<StudySession>) {
    const response = await api.put(`/study-sessions/${sessionId}`, sessionData)
    return response.data
  },

  async deleteStudySession(sessionId: number) {
    const response = await api.delete(`/study-sessions/${sessionId}`)
    return response.data
  },

  // User profile
  async getUserProfile() {
    const response = await api.get('/user/profile')
    return response.data
  },

  async updateUserProfile(userData: Partial<User>) {
    const response = await api.put('/user/profile', userData)
    return response.data
  }
}
