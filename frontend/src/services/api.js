import axios from 'axios';
import {
  MOCK_USERS,
  MOCK_CATEGORIES,
  MOCK_ISSUES,
  MOCK_COMMENTS,
  MOCK_NOTIFICATIONS,
  MOCK_AUDIT_LOGS,
} from './mockData';
import { calculatePriorityScore } from './priorityScoringService';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Create configured Axios Instance
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Attach bearer token if present
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('civicpulse_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// LocalStorage Mock Data Persistence Initialization
const STORAGE_KEYS = {
  USERS: 'civicpulse_mock_users',
  CATEGORIES: 'civicpulse_mock_categories',
  ISSUES: 'civicpulse_mock_issues',
  COMMENTS: 'civicpulse_mock_comments',
  NOTIFS: 'civicpulse_mock_notifications',
  AUDIT: 'civicpulse_mock_audit',
};

function getStorage(key, initialValue) {
  try {
    const saved = localStorage.getItem(key);
    if (saved) return JSON.parse(saved);
  } catch (err) {
    console.warn('LocalStorage error:', err);
  }
  localStorage.setItem(key, JSON.stringify(initialValue));
  return initialValue;
}

function setStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.warn('LocalStorage write error:', err);
  }
}

// Initialise Local Storage with seeded mock data if empty
export const mockDB = {
  getUsers: () => getStorage(STORAGE_KEYS.USERS, MOCK_USERS),
  setUsers: (data) => setStorage(STORAGE_KEYS.USERS, data),

  getCategories: () => getStorage(STORAGE_KEYS.CATEGORIES, MOCK_CATEGORIES),
  setCategories: (data) => setStorage(STORAGE_KEYS.CATEGORIES, data),

  getIssues: () => getStorage(STORAGE_KEYS.ISSUES, MOCK_ISSUES),
  setIssues: (data) => setStorage(STORAGE_KEYS.ISSUES, data),

  getComments: () => getStorage(STORAGE_KEYS.COMMENTS, MOCK_COMMENTS),
  setComments: (data) => setStorage(STORAGE_KEYS.COMMENTS, data),

  getNotifications: () => getStorage(STORAGE_KEYS.NOTIFS, MOCK_NOTIFICATIONS),
  setNotifications: (data) => setStorage(STORAGE_KEYS.NOTIFS, data),

  getAuditLogs: () => getStorage(STORAGE_KEYS.AUDIT, MOCK_AUDIT_LOGS),
  setAuditLogs: (data) => setStorage(STORAGE_KEYS.AUDIT, data),
};
