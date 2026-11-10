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

// Interceptor for normalizing errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      // Network error or server offline
      error.customMessage = 'Tidak dapat terhubung ke server backend Kumpul-In (Port 8000). Pastikan server backend sedang aktif.';
    } else if (error.response.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('kumpulin_token');
      error.customMessage = error.response.data?.message || 'Sesi Anda telah berakhir. Silakan masuk kembali.';
    } else if (error.response.status === 422) {
      // Validation error
      const serverErrors = error.response.data?.errors;
      if (serverErrors) {
        const firstErrorKey = Object.keys(serverErrors)[0];
        error.customMessage = serverErrors[firstErrorKey]?.[0] || error.response.data?.message || 'Data yang Anda masukkan tidak valid.';
      } else {
        error.customMessage = error.response.data?.message || 'Data yang Anda masukkan tidak valid.';
      }
    } else if (error.response.status === 403) {
      error.customMessage = 'Akses ditolak. Anda tidak memiliki izin untuk tindakan ini.';
    } else if (error.response.status === 404) {
      error.customMessage = error.response.data?.message || 'Data atau fasilitas tidak ditemukan.';
    } else {
      error.customMessage = error.response.data?.message || 'Terjadi kesalahan pada sistem.';
    }
    return Promise.reject(error);
  }
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
    // User newly registered will NOT automatically save token to force realistic login flow
    const res = await api.post('/auth/register', userData);
    return res.data;
  },

  quickLogin: async (role = 'mahasiswa') => {
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

  cancelBooking: async (id) => {
    const res = await api.patch(`/bookings/${id}/cancel`);
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

  // User Management
  getUsers: async (params = {}) => {
    const res = await api.get('/admin/users', { params });
    return res.data;
  },

  createUser: async (data) => {
    const res = await api.post('/admin/users', data);
    return res.data;
  },

  updateUser: async (id, data) => {
    const res = await api.patch(`/admin/users/${id}`, data);
    return res.data;
  },

  deleteUser: async (id) => {
    const res = await api.delete(`/admin/users/${id}`);
    return res.data;
  },
};

export default api;
