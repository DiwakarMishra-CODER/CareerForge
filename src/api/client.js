// src/api/client.js

// Base URL from env variable or fallback for development
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

// Helper: get userId from localStorage (set during login)
export const getUserId = () => {
  const userStr = localStorage.getItem('nexagen_user');
  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      return user.userId || user.id;
    } catch (e) {
      return localStorage.getItem('nexagen_user_id') || 'demo_user';
    }
  }
  return localStorage.getItem('nexagen_user_id') || 'demo_user';
};

// Helper: get token from localStorage
export const getToken = () => localStorage.getItem('nexagen_token');

// API wrapper
export const api = {
  get: async (path) => {
    const token = getToken();
    const headers = {
      'Content-Type': 'application/json'
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const response = await fetch(`${BASE_URL}${path}`, { headers });
    if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || 'API request failed');
    }
    return response.json();
  },
  post: async (path, body) => {
    const token = getToken();
    const headers = {
      'Content-Type': 'application/json'
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const response = await fetch(`${BASE_URL}${path}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });
    if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || 'API request failed');
    }
    return response.json();
  },
  put: async (path, body) => {
    const token = getToken();
    const headers = {
      'Content-Type': 'application/json'
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const response = await fetch(`${BASE_URL}${path}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(body),
    });
    if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || 'API request failed');
    }
    return response.json();
  },
  delete: async (path) => {
    const token = getToken();
    const headers = {
      'Content-Type': 'application/json'
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const response = await fetch(`${BASE_URL}${path}`, {
      method: 'DELETE',
      headers,
    });
    if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || 'API request failed');
    }
    return response.json();
  },
  upload: async (path, formData) => {
    const token = getToken();
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const response = await fetch(`${BASE_URL}${path}`, {
      method: 'POST',
      headers,
      body: formData, // fetch automatically sets multipart/form-data with boundary
    });
    if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || 'Upload failed');
    }
    return response.json();
  }
};
