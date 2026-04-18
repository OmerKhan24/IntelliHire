import axios from 'axios';

// Create axios instance with base configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000,  // Increased to 60 seconds for network connections
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false,  // Disable credentials for CORS
});

// API service functions
export const api = {
  // Health check
  healthCheck: () => apiClient.get('/api/health'),

  // Job management
  jobs: {
    create: (jobData) => apiClient.post('/api/jobs/', jobData),
    list: () => apiClient.get('/api/jobs/'),
    getAll: () => apiClient.get('/api/jobs/'),
    get: (jobId) => apiClient.get(`/api/jobs/${jobId}`),
    getById: (jobId) => apiClient.get(`/api/jobs/${jobId}`),
    getCandidates: (jobId) => apiClient.get(`/api/jobs/${jobId}/candidates`),
  },

  // Interview management
  interviews: {
    trackAccess: (jobId, candidateData) => apiClient.post(`/api/interviews/access/${jobId}`, candidateData),
    getMy: (email) => apiClient.get(`/api/interviews/my-interviews?email=${email}`),
    start: (interviewData) => apiClient.post('/api/interviews/start', interviewData),
    getQuestions: (interviewId) => apiClient.get(`/api/interviews/${interviewId}/questions`),
    submitResponse: (interviewId, responseData) => apiClient.post(`/api/interviews/${interviewId}/response`, responseData),
    complete: (interviewId) => apiClient.post(`/api/interviews/${interviewId}/complete`),
    getFeedback: (interviewId) => apiClient.get(`/api/interviews/${interviewId}/feedback`),
    uploadAudio: (formData) => {
      return apiClient.post('/api/interviews/upload_audio', formData, {
        headers: { 'Content-Type': undefined }
      });
    }
  },

  // Reports
  reports: {
    getInterview: (interviewId) => apiClient.get(`/api/reports/interview/${interviewId}`),
    getJob: (jobId) => apiClient.get(`/api/reports/job/${jobId}`),
    getAll: () => apiClient.get(`/api/reports/all`),
    downloadReport: (jobId) => apiClient.get(`/api/reports/job/${jobId}/download`, {
      responseType: 'blob'
    }),
    generateCandidateReport: (interviewId, force = false) => apiClient.post(`/api/reports/generate/${interviewId}`, { force }, {
      timeout: 180000  // 3 minutes for DeepSeek calls
    }),
    getCandidateReport: (interviewId) => apiClient.get(`/api/reports/candidate/${interviewId}`),
    compareCandidates: (interviewIds) => apiClient.post('/api/reports/compare', { interview_ids: interviewIds }),
  },
  // Auth
  auth: {
    login: (payload) => apiClient.post('/api/auth/login', payload),
    register: (payload) => apiClient.post('/api/auth/register', payload),
    me: () => apiClient.get('/api/auth/me'),
    refresh: () => apiClient.post('/api/auth/refresh'),
    logout: () => apiClient.post('/api/auth/logout'),
    // Admin operations
    createUser: (userData) => apiClient.post('/api/admin/users', userData),
    listUsers: () => apiClient.get('/api/admin/users'),
    updateUser: (userId, updates) => apiClient.put(`/api/admin/users/${userId}`, updates),
  },

  // Candidate
  candidate: {
    uploadCV: (formData) => apiClient.post('/api/candidate/upload_cv', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },

  // CV Monitoring
  monitoring: {
    start: (interviewId) => 
      apiClient.post(`/api/monitoring/start/${interviewId}`).then(res => res.data),
    
    stop: (interviewId) => 
      apiClient.post(`/api/monitoring/stop/${interviewId}`).then(res => res.data),
    
    analyzeFrame: (interviewId, frameData) => 
      apiClient.post(`/api/monitoring/analyze/${interviewId}`, { frame: frameData }).then(res => res.data),
    
    getStatus: (interviewId) => 
      apiClient.get(`/api/monitoring/status/${interviewId}`).then(res => res.data)
  },

  // HR Chatbot & Document Management
  hr: {
    // Document Management (HR Officials)
    uploadDocument: (formData, onUploadProgress) => apiClient.post('/api/hr/documents/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 180000,  // 3 minutes for document upload and processing
      onUploadProgress
    }),
    listDocuments: (params) => apiClient.get('/api/hr/documents', { params }),
    getDocument: (docId) => apiClient.get(`/api/hr/documents/${docId}`),
    deleteDocument: (docId) => apiClient.delete(`/api/hr/documents/${docId}`),
    getDocumentStats: () => apiClient.get('/api/hr/documents/stats'),
    
    // Employee Management (HR Officials)
    registerEmployee: (employeeData) => apiClient.post('/api/hr/employees/register', employeeData),
    getEmployees: () => apiClient.get('/api/hr/employees'),
    updateEmployee: (employeeId, updateData) => apiClient.put(`/api/hr/employees/${employeeId}`, updateData),
    getEmployeeStats: () => apiClient.get('/api/hr/employees/stats'),
    
    // Chatbot (All Users)
    sendMessage: (messageData) => apiClient.post('/api/hr/chat/message', messageData, {
      timeout: 120000  // 2 minutes for AI response generation
    }),
    getConversations: () => apiClient.get('/api/hr/chat/conversations'),
    getConversation: (conversationId) => apiClient.get(`/api/hr/chat/conversations/${conversationId}`),
    getSuggestions: (category) => apiClient.get('/api/hr/chat/suggestions', { 
      params: { category } 
    }),
    submitFeedback: (feedbackData) => apiClient.post('/api/hr/chat/feedback', feedbackData)
  },

  // Applications & Pipeline
  applications: {
    // Public — get job by share token
    getPublicJob: (shareToken) => apiClient.get(`/api/applications/job/${shareToken}`),
    // Public — submit application (multipart form)
    apply: (formData) => apiClient.post('/api/applications/apply', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 120000
    }),
    // Interviewer — list applications for a job
    listForJob: (jobId, status) => apiClient.get(`/api/applications/job/${jobId}`, { params: { status } }),
    // Interviewer — trigger ATS scoring
    scoreAll: (jobId) => apiClient.post(`/api/applications/score/${jobId}`, {}, { timeout: 300000 }),
    // Interviewer — shortlist top N
    shortlist: (jobId, maxShortlist) => apiClient.post(`/api/applications/shortlist/${jobId}`, { max_shortlist: maxShortlist }),
    // Interviewer — schedule interviews
    schedule: (jobId, startTime, gapMinutes) => apiClient.post(`/api/applications/schedule/${jobId}`, {
      start_time: startTime, gap_minutes: gapMinutes
    }),
    // Interviewer — run full pipeline
    runPipeline: (jobId) => apiClient.post(`/api/applications/pipeline/${jobId}`, {}, { timeout: 600000 }),
    // Interviewer — publish/unpublish job
    publish: (jobId, data) => apiClient.post(`/api/applications/publish/${jobId}`, data),
    // Candidate — my applications
    myApplications: () => apiClient.get('/api/applications/my'),
    // Notifications
    getNotifications: () => apiClient.get('/api/applications/notifications'),
    markNotificationsRead: (ids) => apiClient.post('/api/applications/notifications/read', { ids }),
    // Email logs
    getEmailLogs: (jobId) => apiClient.get(`/api/applications/emails/${jobId}`),
    // Candidate self-scheduling
    getAvailableSlots: (applicationId) => apiClient.get(`/api/applications/slots/${applicationId}`),
    bookSlot: (applicationId, slotStart) => apiClient.post('/api/applications/book-slot', {
      application_id: applicationId, slot_start: slotStart,
    }),
    reschedule: (scheduleId, newSlotStart) => apiClient.post('/api/applications/reschedule', {
      schedule_id: scheduleId, new_slot_start: newSlotStart,
    }),
    getMySchedule: (applicationId) => apiClient.get(`/api/applications/my-schedule/${applicationId}`),
    // Trigger reminders (called by cron or manually)
    sendReminders: () => apiClient.post('/api/applications/send-reminders'),
  },

  // ─── Client Portal ─────────────────────────────────────
  clientPortal: {
    getDashboard: () => apiClient.get('/api/client/dashboard'),
    getProfile: () => apiClient.get('/api/client/profile'),
    updateProfile: (data) => apiClient.put('/api/client/profile', data),
    changePassword: (data) => apiClient.post('/api/client/change-password', data),
    // Sub-accounts
    getSubAccounts: () => apiClient.get('/api/client/sub-accounts'),
    createSubAccount: (data) => apiClient.post('/api/client/sub-accounts', data),
    removeSubAccount: (id) => apiClient.delete(`/api/client/sub-accounts/${id}`),
    // Preferences
    getPreferences: () => apiClient.get('/api/client/preferences'),
    updatePreferences: (data) => apiClient.put('/api/client/preferences', data),
    // Branding
    updateBranding: (formData) => apiClient.put('/api/client/branding', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
    // Must-ask questions
    getMustAskQuestions: (jobId) => apiClient.get('/api/client/must-ask-questions', { params: jobId ? { job_id: jobId } : {} }),
    addMustAskQuestion: (data) => apiClient.post('/api/client/must-ask-questions', data),
    deleteMustAskQuestion: (id) => apiClient.delete(`/api/client/must-ask-questions/${id}`),
    // Exports
    exportCandidatePdf: (candidateId) => apiClient.get(`/api/client/export/candidate/${candidateId}/pdf`, { responseType: 'blob' }),
    exportCandidatesCsv: (jobId) => apiClient.get(`/api/client/export/candidates/${jobId}/csv`, { responseType: 'blob' }),
    exportCandidatesZip: (jobId) => apiClient.get(`/api/client/export/candidates/${jobId}/zip`, { responseType: 'blob', timeout: 120000 }),
    exportUsage: () => apiClient.get('/api/client/export/usage', { responseType: 'blob' }),
    // Jobs
    getJobs: () => apiClient.get('/api/client/jobs'),
    getJobCandidates: (jobId) => apiClient.get(`/api/client/jobs/${jobId}/candidates`),
  },

  // ─── Admin Panel (SaaS flow) ───────────────────────────
  adminPanel: {
    // Dashboard overview
    getDashboard: () => apiClient.get('/api/admin/dashboard'),
    // Leads
    getLeads: (status) => apiClient.get('/api/admin/leads', { params: status ? { status } : {} }),
    getLead: (id) => apiClient.get(`/api/admin/leads/${id}`),
    updateLead: (id, data) => apiClient.put(`/api/admin/leads/${id}`, data),
    confirmLead: (id, data) => apiClient.post(`/api/admin/leads/${id}/confirm`, data),
    // Clients
    getClients: () => apiClient.get('/api/admin/clients'),
    getClient: (id) => apiClient.get(`/api/admin/clients/${id}`),
    createClient: (data) => apiClient.post('/api/admin/clients', data),
    updateClientQuota: (id, data) => apiClient.put(`/api/admin/clients/${id}/quota`, data),
    // Revenue
    getPayments: () => apiClient.get('/api/admin/payments'),
    recordPayment: (data) => apiClient.post('/api/admin/payments', data),
    getRefunds: () => apiClient.get('/api/admin/refunds'),
    processRefund: (data) => apiClient.post('/api/admin/refunds', data),
    // Server Health
    getHealth: () => apiClient.get('/api/admin/health'),
    // API Status
    getApiStatus: () => apiClient.get('/api/admin/api-status'),
    // Audit Logs
    getAuditLogs: (page, perPage, action) => apiClient.get('/api/admin/audit-logs', {
      params: { page, per_page: perPage, action }
    }),
    // Announcements
    getAnnouncements: () => apiClient.get('/api/admin/announcements'),
    createAnnouncement: (data) => apiClient.post('/api/admin/announcements', data),
    deleteAnnouncement: (id) => apiClient.delete(`/api/admin/announcements/${id}`),
    // Settings
    getSettings: () => apiClient.get('/api/admin/settings'),
    updateSettings: (data) => apiClient.put('/api/admin/settings', data),
    // SOS
    sosToggle: (key) => apiClient.post('/api/admin/sos/toggle', { key }),
    sosAlertEmail: (data) => apiClient.post('/api/admin/sos/alert-email', data),
    // Password change
    changePassword: (data) => apiClient.post('/api/admin/change-password', data),
  },
};

// Request interceptor for logging
apiClient.interceptors.request.use(
  (config) => {
    // Attach JWT token if present
    const token = localStorage.getItem('token') || localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log(`📤 ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('📤 Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for logging and error handling
apiClient.interceptors.response.use(
  (response) => {
    console.log(`📥 ${response.status} ${response.config.url}`);
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    console.error('📥 Response error:', error.response?.status, error.message);
    
    // Handle 401 Unauthorized - Token expired or invalid
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      const refreshToken = localStorage.getItem('refresh_token');
      
      // If no refresh token or this was already a refresh attempt, logout
      if (!refreshToken || originalRequest.url?.includes('/auth/refresh')) {
        console.warn('🔒 No refresh token or refresh failed - logging out');
        localStorage.clear();
        sessionStorage.clear();
        
        // Show user-friendly message
        const loginPath = '/login';
        if (window.location.pathname !== loginPath) {
          // Store the current path to redirect back after login
          sessionStorage.setItem('redirectAfterLogin', window.location.pathname);
          
          // Notify user
          if (window.confirm('Your session has expired. Please login again to continue.')) {
            window.location.href = loginPath;
          } else {
            window.location.href = loginPath;
          }
        }
        return Promise.reject(error);
      }
      
      try {
        console.log('🔄 Attempting to refresh token...');
        
        // Try to refresh the token
        const response = await apiClient.post('/api/auth/refresh', {}, {
          headers: {
            Authorization: `Bearer ${refreshToken}`
          }
        });
        
        const newAccessToken = response.data.access_token;
        const newRefreshToken = response.data.refresh_token;
        
        // Update tokens
        localStorage.setItem('access_token', newAccessToken);
        if (newRefreshToken) {
          localStorage.setItem('refresh_token', newRefreshToken);
        }
        
        console.log('✅ Token refreshed successfully');
        
        // Retry the original request with new token
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return apiClient(originalRequest);
        
      } catch (refreshError) {
        console.error('❌ Token refresh failed:', refreshError);
        
        // Clear all auth data
        localStorage.clear();
        sessionStorage.clear();
        
        // Redirect to login with message
        sessionStorage.setItem('sessionExpired', 'true');
        window.location.href = '/login?session=expired';
        
        return Promise.reject(refreshError);
      }
    }
    
    // Handle 403 Forbidden
    if (error.response?.status === 403) {
      console.error('🚫 Access forbidden - insufficient permissions');
      alert('You do not have permission to access this resource.');
    }
    
    // Handle 500 Server Error
    if (error.response?.status === 500) {
      console.error('🔥 Server error - check backend logs');
    }
    
    return Promise.reject(error);
  }
);

export default api;