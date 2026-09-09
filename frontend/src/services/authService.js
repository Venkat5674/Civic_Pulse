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
    } catch (err) {
      console.warn('Backend API unavailable, falling back to Standalone Mock DB authentication:', err.message);
    }

    // Fallback Mock Auth
    const users = mockDB.getUsers();
    const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());

    if (!user) {
      throw new Error('Invalid email or password');
    }

    const mockToken = `mock-jwt-token-${user.id}-${Date.now()}`;
    localStorage.setItem('civicpulse_token', mockToken);
    localStorage.setItem('civicpulse_user', JSON.stringify(user));
    return { token: mockToken, user };
  },

  async register(name, email, password) {
    try {
      const response = await apiClient.post('/auth/register', { name, email, password });
      if (response.data?.token) {
        localStorage.setItem('civicpulse_token', response.data.token);
        localStorage.setItem('civicpulse_user', JSON.stringify(response.data.user));
        return response.data;
      }
    } catch (err) {
      console.warn('Backend API unavailable, falling back to Standalone Mock DB registration:', err.message);
    }

    // Fallback Mock Registration
    const users = mockDB.getUsers();
    if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
      throw new Error('An account with this email address already exists.');
    }

    const newUser = {
      id: `usr-${Date.now()}`,
      name,
      email,
      role: 'CITIZEN',
      avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
      createdAt: new Date().toISOString(),
    };

    mockDB.setUsers([newUser, ...users]);

    const mockToken = `mock-jwt-token-${newUser.id}-${Date.now()}`;
    localStorage.setItem('civicpulse_token', mockToken);
    localStorage.setItem('civicpulse_user', JSON.stringify(newUser));
    return { token: mockToken, user: newUser };
  },

  async getCurrentUser() {
    try {
      const response = await apiClient.get('/auth/me');
      if (response.data?.user) return response.data.user;
    } catch (err) {
      // Fallback
    }

    const saved = localStorage.getItem('civicpulse_user');
    return saved ? JSON.parse(saved) : null;
  },

  logout() {
    localStorage.removeItem('civicpulse_token');
    localStorage.removeItem('civicpulse_user');
  },

  async forgotPassword(email) {
    try {
      await apiClient.post('/auth/forgot-password', { email });
    } catch (err) {
      // Fallback success response
    }
    return { message: 'If that email is registered, a password reset link has been sent.' };
  }
};
