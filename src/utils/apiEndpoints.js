import { getApiConfig } from '../config/apiConfig';

// Get the current environment configuration
const apiConfig = getApiConfig();
const { API_BASE_URL } = apiConfig;

/**
 * Centralized API endpoints utility
 * This file contains all backend API endpoints used throughout the application
 */

// Auth endpoints
export const AUTH_ENDPOINTS = {
  LOGIN: `${API_BASE_URL}/api/auth/login`,
  REGISTER: `${API_BASE_URL}/api/auth/register`,
  LOGOUT: `${API_BASE_URL}/api/auth/logout`,
  REFRESH_TOKEN: `${API_BASE_URL}/api/auth/refresh`,
  VERIFY_TOKEN: `${API_BASE_URL}/api/auth/verify`,
  CHANGE_PASSWORD: `${API_BASE_URL}/api/auth/change-password`,
  FORGOT_PASSWORD: `${API_BASE_URL}/api/auth/forgot-password`,
  RESET_PASSWORD: `${API_BASE_URL}/api/auth/reset-password`,
};

// User endpoints
export const USER_ENDPOINTS = {
  GET_PROFILE: (userId) => `${API_BASE_URL}/api/users/${userId}`,
  UPDATE_PROFILE: (userId) => `${API_BASE_URL}/api/users/${userId}`,
  GET_CURRENT_USER: `${API_BASE_URL}/api/users/me`,
  SEARCH_USERS: `${API_BASE_URL}/api/users/search`,
  GET_USER_STATS: (userId) => `${API_BASE_URL}/api/users/${userId}/stats`,
  UPLOAD_AVATAR: `${API_BASE_URL}/api/users/avatar`,
  UPLOAD_BANNER: `${API_BASE_URL}/api/users/banner`,
};

// Post endpoints
export const POST_ENDPOINTS = {
  CREATE_POST: `${API_BASE_URL}/api/posts`,
  GET_POSTS: `${API_BASE_URL}/api/posts`,
  GET_POST: (postId) => `${API_BASE_URL}/api/posts/${postId}`,
  UPDATE_POST: (postId) => `${API_BASE_URL}/api/posts/${postId}`,
  DELETE_POST: (postId) => `${API_BASE_URL}/api/posts/${postId}`,
  LIKE_POST: (postId) => `${API_BASE_URL}/api/posts/${postId}/like`,
  UNLIKE_POST: (postId) => `${API_BASE_URL}/api/posts/${postId}/unlike`,
  REPOST: (postId) => `${API_BASE_URL}/api/posts/${postId}/repost`,
  BOOKMARK_POST: (postId) => `${API_BASE_URL}/api/posts/${postId}/bookmark`,
  UNBOOKMARK_POST: (postId) => `${API_BASE_URL}/api/posts/${postId}/unbookmark`,
  GET_USER_POSTS: (userId) => `${API_BASE_URL}/api/posts/user/${userId}`,
  GET_BOOKMARKED_POSTS: `${API_BASE_URL}/api/posts/bookmarks`,
  GET_FEED: `${API_BASE_URL}/api/posts/feed`,
  SEARCH_POSTS: `${API_BASE_URL}/api/posts/search`,
};

// Comment endpoints
export const COMMENT_ENDPOINTS = {
  GET_COMMENTS: (postId) => `${API_BASE_URL}/api/comments/${postId}`,
  CREATE_COMMENT: (postId) => `${API_BASE_URL}/api/comments/${postId}`,
  DELETE_COMMENT: (commentId) => `${API_BASE_URL}/api/comments/${commentId}`,
  LIKE_COMMENT: (commentId) => `${API_BASE_URL}/api/comments/${commentId}/like`,
  UNLIKE_COMMENT: (commentId) => `${API_BASE_URL}/api/comments/${commentId}/unlike`,
};

// Follow endpoints
export const FOLLOW_ENDPOINTS = {
  FOLLOW_USER: (userId) => `${API_BASE_URL}/api/followers/${userId}/follow`,
  UNFOLLOW_USER: (userId) => `${API_BASE_URL}/api/followers/${userId}/unfollow`,
  GET_FOLLOWERS: (userId) => `${API_BASE_URL}/api/followers/${userId}/followers`,
  GET_FOLLOWING: (userId) => `${API_BASE_URL}/api/followers/${userId}/following`,
  GET_FOLLOW_STATUS: (userId) => `${API_BASE_URL}/api/followers/${userId}/status`,
};

// Notification endpoints
export const NOTIFICATION_ENDPOINTS = {
  GET_NOTIFICATIONS: `${API_BASE_URL}/api/notifications`,
  MARK_AS_READ: (notificationId) => `${API_BASE_URL}/api/notifications/${notificationId}/read`,
  MARK_ALL_AS_READ: `${API_BASE_URL}/api/notifications/read-all`,
  DELETE_NOTIFICATION: (notificationId) => `${API_BASE_URL}/api/notifications/${notificationId}`,
  GET_UNREAD_COUNT: `${API_BASE_URL}/api/notifications/unread-count`,
};

// Media endpoints
export const MEDIA_ENDPOINTS = {
  UPLOAD_IMAGE: `${API_BASE_URL}/api/media/upload`,
  UPLOAD_VIDEO: `${API_BASE_URL}/api/media/upload/video`,
  DELETE_MEDIA: (mediaId) => `${API_BASE_URL}/api/media/${mediaId}`,
  GET_MEDIA: (mediaId) => `${API_BASE_URL}/api/media/${mediaId}`,
};

// Poll endpoints (if you have polls)
export const POLL_ENDPOINTS = {
  CREATE_POLL: `${API_BASE_URL}/api/polls`,
  VOTE_POLL: (pollId) => `${API_BASE_URL}/api/polls/${pollId}/vote`,
  GET_POLL_RESULTS: (pollId) => `${API_BASE_URL}/api/polls/${pollId}/results`,
};

// WebSocket endpoints
export const WEBSOCKET_ENDPOINTS = {
  CONNECT: apiConfig.WEBSOCKET_URL,
  EVENTS: {
    JOIN_FEED: 'joinFeed',
    LEAVE_FEED: 'leaveFeed',
    NEW_POST: 'newPost',
    POST_UPDATE: 'postUpdate',
    NOTIFICATION: 'notification',
    REAL_TIME_NOTIFICATION: 'realTimeNotification',
  }
};

// Helper function to build query parameters
export const buildQueryParams = (params) => {
  const queryParams = new URLSearchParams();
  
  Object.keys(params).forEach(key => {
    if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
      queryParams.append(key, params[key]);
    }
  });
  
  const queryString = queryParams.toString();
  return queryString ? `?${queryString}` : '';
};

// Helper function to build paginated endpoints
export const buildPaginatedUrl = (baseUrl, page = 1, limit = 10, additionalParams = {}) => {
  const params = {
    page,
    limit,
    ...additionalParams
  };
  
  return `${baseUrl}${buildQueryParams(params)}`;
};

// Export base URL for direct use
export const BASE_URL = API_BASE_URL;

// Export complete API configuration
export const API_CONFIG = apiConfig;

// Default export with all endpoints
const API_ENDPOINTS = {
  AUTH: AUTH_ENDPOINTS,
  USER: USER_ENDPOINTS,
  POST: POST_ENDPOINTS,
  COMMENT: COMMENT_ENDPOINTS,
  FOLLOW: FOLLOW_ENDPOINTS,
  NOTIFICATION: NOTIFICATION_ENDPOINTS,
  MEDIA: MEDIA_ENDPOINTS,
  POLL: POLL_ENDPOINTS,
  WEBSOCKET: WEBSOCKET_ENDPOINTS,
};

export default API_ENDPOINTS;
