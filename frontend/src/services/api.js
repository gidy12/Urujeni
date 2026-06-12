import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.put('/auth/change-password', data),
  logout: () => api.post('/auth/logout'),
  adminCreateUser: (data) => api.post('/auth/admin-create', data)
};

export const membersAPI = {
  getAll: (params) => api.get('/members', { params }),
  getById: (id) => api.get(`/members/${id}`),
  create: (data) => api.post('/members', data),
  update: (id, data) => api.put(`/members/${id}`, data),
  delete: (id) => api.delete(`/members/${id}`),
  getByLocation: () => api.get('/members/locations/overview'),
  getLocations: () => api.get('/members/locations/list')
};

export const attendanceAPI = {
  mark: (data) => api.post('/attendance/mark', data),
  getToday: () => api.get('/attendance/today'),
  getByDate: (params) => api.get('/attendance/by-date', { params }),
  getRange: (params) => api.get('/attendance/range', { params }),
  getUnmarked: () => api.get('/attendance/unmarked')
};

export const reportsAPI = {
  attendance: (params) => api.get('/reports/attendance', { params }),
  members: () => api.get('/reports/members'),
  gender: () => api.get('/reports/gender'),
  location: () => api.get('/reports/location'),
  history: () => api.get('/reports/history')
};

export const dashboardAPI = {
  getStats: () => api.get('/dashboard')
};

export default api;
