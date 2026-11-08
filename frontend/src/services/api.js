import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Accept': 'application/json',
  },
});

// Interceptor for attaching auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('kumpulin_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const authService = {
  login: async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data?.data?.token) {
      localStorage.setItem('kumpulin_token', res.data.data.token);
    }
    return res.data;
  },

  register: async (userData) => {
    const res = await api.post('/auth/register', userData);
    if (res.data?.data?.token) {
      localStorage.setItem('kumpulin_token', res.data.data.token);
    }
    return res.data;
  },

  quickLogin: async (role = 'guest') => {
    const res = await api.post('/auth/quick-login', { role });
    if (res.data?.data?.token) {
      localStorage.setItem('kumpulin_token', res.data.data.token);
    }
    return res.data;
  },

  getMe: async () => {
    const res = await api.get('/auth/me');
    return res.data;
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      // Ignore if token already revoked
    }
    localStorage.removeItem('kumpulin_token');
  },
};

export const roomService = {
  getRooms: async (category = '', minCapacity = '') => {
    const params = {};
    if (category && category !== 'All') params.category = category;
    if (minCapacity) params.min_capacity = minCapacity;
    const res = await api.get('/rooms', { params });
    return res.data;
  },

  getAvailability: async (roomId, date) => {
    const res = await api.get(`/rooms/${roomId}/availability`, {
      params: { date },
    });
    return res.data;
  },
};

export const bookingService = {
  createBooking: async (data, isMultipart = false) => {
    const config = isMultipart
      ? { headers: { 'Content-Type': 'multipart/form-data' } }
      : {};
    const res = await api.post('/bookings', data, config);
    return res.data;
  },

  getMyBookings: async () => {
    const res = await api.get('/bookings');
    return res.data;
  },
};

export const adminService = {
  getStats: async () => {
    const res = await api.get('/admin/stats');
    return res.data;
  },

  getBookings: async (params = {}) => {
    const res = await api.get('/admin/bookings', { params });
    return res.data;
  },

  updateBookingStatus: async (id, status) => {
    const res = await api.patch(`/admin/bookings/${id}/status`, { status });
    return res.data;
  },

  createRoom: async (data) => {
    const res = await api.post('/admin/rooms', data);
    return res.data;
  },

  updateRoom: async (id, data) => {
    const res = await api.patch(`/admin/rooms/${id}`, data);
    return res.data;
  },

  deleteRoom: async (id) => {
    const res = await api.delete(`/admin/rooms/${id}`);
    return res.data;
  },
};

export default api;
