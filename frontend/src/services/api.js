import axios from 'axios';

// Create axios instance with base configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
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
    start: (interviewData) => apiClient.post('/api/interviews/start', interviewData),
    getQuestions: (interviewId) => apiClient.get(`/api/interviews/${interviewId}/questions`),
    submitResponse: (interviewId, responseData) => apiClient.post(`/api/interviews/${interviewId}/response`, responseData),
    complete: (interviewId) => apiClient.post(`/api/interviews/${interviewId}/complete`),
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
    logout: () => apiClient.post('/api/auth/logout')
  },

  // Candidate
  candidate: {
    uploadCV: (formData) => apiClient.post('/api/candidate/upload_cv', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
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
    console.error('📥 Response error:', error.response?.status, error.message);
    
    // Handle 401 - try to refresh token
    if (error.response?.status === 401 && !error.config._retry) {
      error.config._retry = true;
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          // Temporarily set refresh token for this request
          const originalAuth = error.config.headers.Authorization;
          error.config.headers.Authorization = `Bearer ${refreshToken}`;
          const refreshRes = await apiClient.post('/api/auth/refresh');
          const newToken = refreshRes.data.access_token;
          localStorage.setItem('access_token', newToken);
          // Restore and retry original request
          error.config.headers.Authorization = `Bearer ${newToken}`;
          return apiClient.request(error.config);
        }
      } catch (refreshError) {
        // Refresh failed - logout user
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    if (error.response?.status === 500) {
      console.error('Server error - check backend logs');
    }
    return Promise.reject(error);
  }
);

export default api;