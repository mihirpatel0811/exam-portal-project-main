import api from './axiosClient';

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
};

export const examAPI = {
  getAll: () => api.get('/exams'),
  getById: (id) => api.get(`/exams/${id}`),
  create: (data) => api.post('/exams', data),
  update: (id, data) => api.put(`/exams/${id}`, data),
  delete: (id) => api.delete(`/exams/${id}`),
};

export const questionAPI = {
  create: (data) => api.post('/questions', data),
  update: (id, data) => api.put(`/questions/${id}`, data),
  delete: (id) => api.delete(`/questions/${id}`),
};

export const attemptAPI = {
  start: (examId) => api.post('/attempts/start', { examId }),
  submit: (data) => api.post('/attempts/submit', data),
  getById: (id) => api.get(`/attempts/${id}`),
};

export const resultAPI = {
  getAll: () => api.get('/results'),
  getByUser: (userId) => api.get(`/results/${userId}`),
  getMyResults: () => api.get('/results/me'),
};

export const userAPI = {
  getAll: () => api.get('/users'),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
};
