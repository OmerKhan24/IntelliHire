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
  }
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