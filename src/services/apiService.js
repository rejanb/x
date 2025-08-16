import axios from 'axios';
import API_ENDPOINTS, { 
  AUTH_ENDPOINTS,
  USER_ENDPOINTS,
  POST_ENDPOINTS,
  COMMENT_ENDPOINTS,
  FOLLOW_ENDPOINTS,
  NOTIFICATION_ENDPOINTS,
  MEDIA_ENDPOINTS,
  POLL_ENDPOINTS,
  BASE_URL,
  buildQueryParams,
  buildPaginatedUrl
} from '../utils/apiEndpoints';

// Create axios instance with default configuration
const apiClient = axios.create({
    baseURL: BASE_URL,
    timeout: 15000,
    headers: {
        "Content-Type": "application/json",
    },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            // Redirect to login if needed
            // window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Helper function for API calls
const makeRequest = async (method, url, data = null, config = {}) => {
    try {
        const response = await apiClient({
            method,
            url,
            data,
            ...config
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

// Auth API functions using centralized endpoints
export const authAPI = {
    register: async (userData) => {
        return makeRequest('POST', '/api/auth/signup', userData);
    },
    
    login: async (credentials) => {
        return makeRequest('POST', '/api/auth/signin', credentials);
    },
    
    logout: async () => {
        return makeRequest('POST', '/api/auth/logout');
    },
    
    verifyToken: async (token) => {
        return makeRequest('POST', '/api/auth/verify', { token });
    },
    
    changePassword: async (passwordData) => {
        return makeRequest('POST', '/api/auth/change-password', passwordData);
    },
    
    forgotPassword: async (email) => {
        return makeRequest('POST', '/api/auth/forgot-password', { email });
    },
    
    resetPassword: async (resetData) => {
        return makeRequest('POST', '/api/auth/reset-password', resetData);
    }
};

// User API functions
export const userAPI = {
    getCurrentUser: async () => {
        return makeRequest('GET', '/api/users/me');
    },
    
    getUserById: async (userId) => {
        return makeRequest('GET', `/api/users/${userId}`);
    },
    
    updateProfile: async (userId, userData) => {
        return makeRequest('PUT', `/api/users/${userId}`, userData);
    },
    
    searchUsers: async (query, params = {}) => {
        const url = `/api/users/search${buildQueryParams({ q: query, ...params })}`;
        return makeRequest('GET', url);
    },
    
    getUserStats: async (userId) => {
        return makeRequest('GET', `/api/users/${userId}/stats`);
    },
    
    uploadAvatar: async (file) => {
        const formData = new FormData();
        formData.append('avatar', file);
        return makeRequest('POST', '/api/users/avatar', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    },
    
    uploadBanner: async (file) => {
        const formData = new FormData();
        formData.append('banner', file);
        return makeRequest('POST', '/api/users/banner', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    }
};

// Post API functions
export const postAPI = {
  getFeed: async (page = 1, limit = 10, userId = null) => {
    // Use the basic posts endpoint since timeline/feed endpoints don't exist
    const url = buildPaginatedUrl('/api/posts', page, limit);
    return makeRequest('GET', url);
  },    getPosts: async (params = {}) => {
        const url = `/api/posts${buildQueryParams(params)}`;
        return makeRequest('GET', url);
    },
    
    getPost: async (postId) => {
        return makeRequest('GET', `/api/posts/${postId}`);
    },
    
    createPost: async (postData) => {
        return makeRequest('POST', '/api/posts', postData);
    },
    
    createPostWithMedia: async (postData, files) => {
        const formData = new FormData();
        
        // Add post data
        formData.append('content', postData.content);
        formData.append('authorId', postData.authorId);
        
        if (postData.hashtags && postData.hashtags.length > 0) {
            postData.hashtags.forEach(tag => formData.append('hashtags[]', tag));
        }
        
        if (postData.mentions && postData.mentions.length > 0) {
            postData.mentions.forEach(mention => formData.append('mentions[]', mention));
        }
        
        // Add media files
        if (files && files.length > 0) {
            files.forEach(file => formData.append('files', file));
        }
        
        return makeRequest('POST', '/api/posts', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    },
    
    updatePost: async (postId, postData) => {
        return makeRequest('PUT', `/api/posts/${postId}`, postData);
    },
    
    deletePost: async (postId) => {
        return makeRequest('DELETE', `/api/posts/${postId}`);
    },
    
    likePost: async (postId) => {
        return makeRequest('POST', `/api/posts/${postId}/like`);
    },
    
    unlikePost: async (postId) => {
        return makeRequest('DELETE', `/api/posts/${postId}/like`);
    },
    
    repost: async (postId) => {
        return makeRequest('POST', `/api/posts/${postId}/repost`);
    },
    
    bookmarkPost: async (postId) => {
        return makeRequest('POST', `/api/posts/${postId}/bookmark`);
    },
    
    unbookmarkPost: async (postId) => {
        return makeRequest('DELETE', `/api/posts/${postId}/bookmark`);
    },
    
    getUserPosts: async (userId, page = 1, limit = 10) => {
        const url = buildPaginatedUrl(`/api/posts/user/${userId}`, page, limit);
        return makeRequest('GET', url);
    },
    
    getBookmarkedPosts: async (page = 1, limit = 10) => {
        const url = buildPaginatedUrl('/api/posts/bookmarks', page, limit);
        return makeRequest('GET', url);
    },
    
    searchPosts: async (query, params = {}) => {
        const url = `/api/posts/search${buildQueryParams({ q: query, ...params })}`;
        return makeRequest('GET', url);
    }
};

// Comment API functions
export const commentAPI = {
    getComments: async (postId, page = 1, limit = 10) => {
        const url = buildPaginatedUrl(`/api/comments/${postId}`, page, limit);
        return makeRequest('GET', url);
    },
    
    createComment: async (postId, commentData) => {
        return makeRequest('POST', `/api/comments/${postId}`, commentData);
    },
    
    deleteComment: async (commentId) => {
        return makeRequest('DELETE', `/api/comments/${commentId}`);
    },
    
    likeComment: async (commentId) => {
        return makeRequest('POST', `/api/comments/${commentId}/like`);
    },
    
    unlikeComment: async (commentId) => {
        return makeRequest('DELETE', `/api/comments/${commentId}/like`);
    }
};

// Follow API functions
export const followAPI = {
    followUser: async (userId) => {
        return makeRequest('POST', `/api/followers/${userId}/follow`);
    },
    
    unfollowUser: async (userId) => {
        return makeRequest('DELETE', `/api/followers/${userId}/unfollow`);
    },
    
    getFollowers: async (userId, page = 1, limit = 10) => {
        const url = buildPaginatedUrl(`/api/followers/${userId}/followers`, page, limit);
        return makeRequest('GET', url);
    },
    
    getFollowing: async (userId, page = 1, limit = 10) => {
        const url = buildPaginatedUrl(`/api/followers/${userId}/following`, page, limit);
        return makeRequest('GET', url);
    },
    
    getFollowStatus: async (userId) => {
        return makeRequest('GET', `/api/followers/${userId}/status`);
    }
};

// Notification API functions
export const notificationAPI = {
    getNotifications: async (page = 1, limit = 10) => {
    const url = buildPaginatedUrl('/api/notifications', page, limit, { t: Date.now() });
        return makeRequest('GET', url);
    },
    
    markAsRead: async (notificationId) => {
    // Send an explicit empty JSON body to satisfy some parsers that reject a literal `null`
    return makeRequest('PATCH', `/api/notifications/${notificationId}/read`, {});
    },
    
    markAllAsRead: async () => {
        // Send an explicit empty JSON body
        return makeRequest('PATCH', '/api/notifications/read-all', {});
    },
    
    deleteNotification: async (notificationId) => {
        return makeRequest('DELETE', `/api/notifications/${notificationId}`);
    },
    
    getUnreadCount: async () => {
        return makeRequest('GET', '/api/notifications/unread-count');
    }
};

// Media API functions
export const mediaAPI = {
    uploadImage: async (file) => {
        const formData = new FormData();
        formData.append('image', file);
        return makeRequest('POST', '/api/media/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    },
    
    uploadVideo: async (file) => {
        const formData = new FormData();
        formData.append('video', file);
        return makeRequest('POST', '/api/media/upload/video', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    },
    
    deleteMedia: async (mediaId) => {
        return makeRequest('DELETE', `/api/media/${mediaId}`);
    },
    
    getMedia: async (mediaId) => {
        return makeRequest('GET', `/api/media/${mediaId}`);
    }
};

// Poll API functions (if you have polls)
export const pollAPI = {
    createPoll: async (pollData) => {
        return makeRequest('POST', '/api/polls', pollData);
    },
    
    votePoll: async (pollId, voteData) => {
        return makeRequest('POST', `/api/polls/${pollId}/vote`, voteData);
    },
    
    getPollResults: async (pollId) => {
        return makeRequest('GET', `/api/polls/${pollId}/results`);
    }
};

// Utility functions
export const utils = {
    buildQueryParams,
    buildPaginatedUrl,
    makeRequest: (method, url, data, config) => makeRequest(method, url, data, config),
};

// Legacy exports for backward compatibility
export const getUserById = userAPI.getUserById;
export const createPost = postAPI.createPost;
export const getFeed = postAPI.getFeed;
export const loginUser = authAPI.login;
export const registerUser = authAPI.register;

// Export the axios instance for direct use if needed
export { apiClient };

// Export all APIs
const ApiService = {
    auth: authAPI,
    user: userAPI,
    post: postAPI,
    comment: commentAPI,
    follow: followAPI,
    notification: notificationAPI,
    media: mediaAPI,
    poll: pollAPI,
    utils,
    client: apiClient
};

export default ApiService;
