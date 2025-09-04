// utils/api.js

/**
 * Fetches video templates from the API
 * @returns {Promise<Array>} Array of template objects
 */
export const fetchTemplates = async () => {
  try {
    const response = await fetch('https://tyrasoft.kz/api/v1/canva/templates/');

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching templates:', error);
    throw error;
  }
};

/**
 * Formats WhatsApp link with template info
 * @param {Object} template - Template object
 * @returns {string} WhatsApp link with prefilled message
 */
export const getWhatsAppLink = (template) => {
  const phoneNumber = '77711745741';
  const templateId = template.template_id || template.canva_id || 'unknown';
  const templateName = template.template_name || 'Видео шаблон';

  const message = encodeURIComponent(
    `Здравствуйте! Я хочу купить шаблон видео "${templateName}" (ID: ${templateId})`
  );

  return `https://wa.me/${phoneNumber}?text=${message}`;
};

/**
 * Extracts YouTube video ID from a URL
 * @param {string} url - YouTube URL (can be standard, shorts, or embed format)
 * @returns {string|null} YouTube video ID or null if not found
 */
export const getYouTubeId = (url) => {
  if (!url) return null;

  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|shorts\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);

  return (match && match[2].length === 11) ? match[2] : null;
};

/**
 * Gets YouTube thumbnail URL from video ID
 * @param {string} url - YouTube URL
 * @returns {string|null} URL to YouTube thumbnail or null if ID not found
 */
export const getYouTubeThumbnail = (url) => {
  const videoId = getYouTubeId(url);
  return videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : null;
};

/**
 * Gets YouTube embed URL from video ID
 * @param {string} url - YouTube URL
 * @returns {string|null} URL for embedding the YouTube video
 */
export const getYouTubeEmbedUrl = (url) => {
  const videoId = getYouTubeId(url);
  return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
};



// API utility functions for making requests to the backend

/**
 * Base API URL - adjust this based on your environment
 */
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api/v2';

/**
 * Get the authentication token from localStorage
 * @returns {string|null} The auth token or null if not found
 */
export const getToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
};

/**
 * Check if user is authenticated
 * @returns {boolean} True if user has a token
 */
export const isAuthenticated = () => {
  return !!getToken();
};

/**
 * Create headers with authorization token if available
 * @param {boolean} includeContentType - Whether to include Content-Type header
 * @returns {Object} Headers object
 */
export const createHeaders = (includeContentType = true) => {
  const headers = {};

  if (includeContentType) {
    headers['Content-Type'] = 'application/json';
  }

  const token = getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
};

/**
 * Handle API response
 * @param {Response} response - Fetch API response
 * @returns {Promise<any>} Parsed response data
 */
export const handleResponse = async (response) => {
  const data = await response.json();

  if (!response.ok) {
    // If response includes a detail field, use it as error message
    const errorMessage = data.detail || 'An error occurred';
    throw new Error(errorMessage);
  }

  return data;
};

/**
 * Make a GET request to the API
 * @param {string} endpoint - API endpoint
 * @param {Object} params - Query parameters
 * @returns {Promise<any>} Response data
 */
export const apiGet = async (endpoint, params = {}) => {
  // Convert params object to URL query string
  const queryString = new URLSearchParams(params).toString();
  const url = `${API_BASE_URL}${endpoint}${queryString ? `?${queryString}` : ''}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: createHeaders(),
  });

  return handleResponse(response);
};

/**
 * Make a POST request to the API
 * @param {string} endpoint - API endpoint
 * @param {Object} data - Request body data
 * @returns {Promise<any>} Response data
 */
export const apiPost = async (endpoint, data = {}) => {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: createHeaders(),
    body: JSON.stringify(data),
  });

  return handleResponse(response);
};

/**
 * Make a PUT request to the API
 * @param {string} endpoint - API endpoint
 * @param {Object} data - Request body data
 * @returns {Promise<any>} Response data
 */
export const apiPut = async (endpoint, data = {}) => {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'PUT',
    headers: createHeaders(),
    body: JSON.stringify(data),
  });

  return handleResponse(response);
};

/**
 * Make a DELETE request to the API
 * @param {string} endpoint - API endpoint
 * @returns {Promise<any>} Response data
 */
export const apiDelete = async (endpoint) => {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'DELETE',
    headers: createHeaders(),
  });

  return handleResponse(response);
};

/**
 * Login user and store token
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<Object>} User data and token
 */
export const login = async (email, password) => {
  const formData = new URLSearchParams();
  formData.append('username', email); // API expects username field for email
  formData.append('password', password);

  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: formData,
  });

  const data = await handleResponse(response);

  // Store token in localStorage
  if (data.access_token) {
    localStorage.setItem('token', data.access_token);
  }

  return data;
};

/**
 * Register a new user
 * @param {Object} userData - User registration data
 * @returns {Promise<Object>} Created user data
 */
export const register = async (userData) => {
  return apiPost('/auth/register', userData);
};

/**
 * Logout user by removing token
 */
export const logout = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('token');
  }
};

/**
 * Get current user information
 * @returns {Promise<Object>} User data
 */
export const getCurrentUser = async () => {
  return apiGet('/auth/me');
};

/**
 * Get list of experts with optional filtering
 * @param {Object} filters - Filter parameters
 * @returns {Promise<Array>} List of experts
 */
export const getExperts = async (filters = {}) => {
  return apiGet('/experts/search', filters);
};

/**
 * Get detailed information about a specific expert
 * @param {number} expertId - Expert ID
 * @returns {Promise<Object>} Expert details
 */
export const getExpertDetails = async (expertId) => {
  return apiGet(`/experts/${expertId}`);
};

/**
 * Send a collaboration request to an expert
 * @param {number} expertId - Expert ID
 * @param {Object} requestData - Collaboration request data
 * @returns {Promise<Object>} Created request data
 */
export const sendCollaborationRequest = async (expertId, requestData) => {
  return apiPost(`/experts/${expertId}/collaborate`, requestData);
};

/**
 * Update collaboration request status (for experts only)
 * @param {string} requestId - Request ID
 * @param {string} status - New status (pending, approved, rejected)
 * @returns {Promise<Object>} Updated request data
 */
export const updateRequestStatus = async (requestId, status) => {
  return apiPut(`/experts/requests/${requestId}/status`, { status });
};