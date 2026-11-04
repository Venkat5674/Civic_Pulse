import { apiClient, mockDB } from './api';

export const authService = {
  async login(email, password) {
    try {
      const response = await apiClient.post('/auth/login', { email, password });
      if (response.data?.token) {
        localStorage.setItem('civicpulse_token', response.data.token);
        localStorage.setItem('civicpulse_user', JSON.stringify(response.data.user));
        return response.data;
      }
      throw new Error('Authentication succeeded but no token was received.');
    } catch (err) {
      if (err.response && err.response.data?.message) {
        throw new Error(err.response.data.message);
      }
      throw new Error(err.message || 'Login failed. Please check your network connection.');
    }
  },

  async register(name, email, password, role = 'CITIZEN') {
    try {
      const response = await apiClient.post('/auth/register', { name, email, password, role });
      if (response.data?.token) {
        localStorage.setItem('civicpulse_token', response.data.token);
        localStorage.setItem('civicpulse_user', JSON.stringify(response.data.user));
        return response.data;
      }
      throw new Error('Registration succeeded but no token was received.');
    } catch (err) {
      if (err.response && err.response.data?.message) {
        throw new Error(err.response.data.message);
      }
      throw new Error(err.message || 'Registration failed. Please check your network connection.');
    }
  },

  async getCurrentUser() {
    try {
      const response = await apiClient.get('/auth/me');
      if (response.data?.user) return response.data.user;
    } catch (err) {
      console.warn('getCurrentUser failed, loading local user:', err.message);
    }

    const saved = localStorage.getItem('civicpulse_user');
    return saved ? JSON.parse(saved) : null;
  },

  logout() {
    try {
      apiClient.post('/auth/logout').catch(() => {});
    } catch (e) {}
    localStorage.removeItem('civicpulse_token');
    localStorage.removeItem('civicpulse_user');
  },

  async forgotPassword(email) {
    try {
      const response = await apiClient.post('/auth/forgot-password', { email });
      return response.data;
    } catch (err) {
      if (err.response && err.response.data?.message) {
        throw new Error(err.response.data.message);
      }
      throw new Error(err.message || 'Failed to request password reset.');
    }
  },

  async resetPassword({ token, newPassword }) {
    try {
      const response = await apiClient.post('/auth/reset-password', { token, newPassword });
      return response.data;
    } catch (err) {
      if (err.response && err.response.data?.message) {
        throw new Error(err.response.data.message);
      }
      throw new Error(err.message || 'Failed to reset password.');
    }
  },

  async changePassword({ currentPassword, newPassword }) {
    try {
      const response = await apiClient.post('/auth/change-password', { currentPassword, newPassword });
      return response.data;
    } catch (err) {
      if (err.response && err.response.data?.message) {
        throw new Error(err.response.data.message);
      }
      throw new Error(err.message || 'Failed to change password.');
    }
  },

  async updateProfile(profileData) {
    try {
      const response = await apiClient.patch('/auth/profile', profileData);
      if (response.data?.user) {
        localStorage.setItem('civicpulse_user', JSON.stringify(response.data.user));
        return response.data.user;
      }
      return response.data;
    } catch (err) {
      if (err.response && err.response.data?.message) {
        throw new Error(err.response.data.message);
      }
      throw new Error(err.message || 'Failed to update profile preferences.');
    }
  },
};
