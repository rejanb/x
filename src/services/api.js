import axios from "axios";

// Base API URL from environment variables
const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:3000/api";

// Create axios instance with default configuration
const apiClient = axios.create({
    baseURL: BASE_URL,
    timeout: 10000,
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
        }
        return Promise.reject(error);
    }
);

// Auth API functions
export const authAPI = {
    // Register new user
    register: async (userData) => {
        try {
            const response = await apiClient.post("/auth/signup", userData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Login user
    login: async (credentials) => {
        try {
            const response = await apiClient.post("/auth/login", credentials);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Logout user
    logout: () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
    },

    // Get current user profile
    getCurrentUser: async () => {
        try {
            const response = await apiClient.get("/auth/me");
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },
};

// Posts/Tweets API functions
export const postsAPI = {
    // Get all posts
    getAllPosts: async (page = 1, limit = 10) => {
        try {
            const response = await apiClient.get(
                `/posts?page=${page}&limit=${limit}`
            );
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Get post by ID
    getPostById: async (postId) => {
        try {
            const response = await apiClient.get(`/posts/${postId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Create new post
    createPost: async (postData) => {
        try {
            const response = await apiClient.post("/posts", postData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Update post
    updatePost: async (postId, postData) => {
        try {
            const response = await apiClient.put(`/posts/${postId}`, postData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Delete post
    deletePost: async (postId) => {
        try {
            const response = await apiClient.delete(`/posts/${postId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Like/Unlike post
    toggleLike: async (postId) => {
        try {
            const response = await apiClient.post(`/posts/${postId}/like`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Retweet post
    retweet: async (postId) => {
        try {
            const response = await apiClient.post(`/posts/${postId}/retweet`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Get user's posts
    getUserPosts: async (userId, page = 1, limit = 10) => {
        try {
            const response = await apiClient.get(
                `/posts/user/${userId}?page=${page}&limit=${limit}`
            );
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },
    getTrendingHashtags: async () => {
        try {
            const response = await apiClient.get("/posts/trending/hashtags?limit=10");
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },
};

// Comments API functions
export const commentsAPI = {
    // Get comments for a post
    getPostComments: async (postId, page = 1, limit = 10) => {
        try {
            const response = await apiClient.get(
                `/posts/${postId}/comments?page=${page}&limit=${limit}`
            );
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Add comment to post
    addComment: async (postId, commentData) => {
        try {
            const response = await apiClient.post(
                `/posts/${postId}/comments`,
                commentData
            );
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Delete comment
    deleteComment: async (commentId) => {
        try {
            const response = await apiClient.delete(`/comments/${commentId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },
};

// Users API functions
export const usersAPI = {

    getFollowCounts: async (userId) => {
        try {
            const response = await apiClient.get(`/users/${userId}/follow/counts`);
            return response.data;
        } catch (error) {
            console.error("Error fetching follow counts:", error);
            return { followers: 0, following: 0 };
        }
    },

    // Get user profile
    getUserProfile: async (userId) => {
        try {
            const response = await apiClient.get(`/users/${userId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Update user profile
    updateProfile: async (profileData, token) => {
        try {
            const response = await apiClient.put("/profile/update", profileData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Change user password
    changePassword: async (passwords, token) => {
        try {
            const response = await apiClient.put(
                "/profile/change-password",
                passwords,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            return response.data;
        } catch (error) {
            console.error("Error changing password:", error);
            throw error.response?.data || error.message;
        }
    },

    // Follow/Unfollow user
    toggleFollow: async (userId) => {
        try {
            const response = await apiClient.post(`/users/${userId}/follow`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Get user followers
    getFollowers: async (userId, page = 1, limit = 10) => {
        try {
            const response = await apiClient.get(
                `/users/${userId}/followers?page=${page}&limit=${limit}`
            );
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Get user following
    getFollowing: async (userId, page = 1, limit = 10) => {
        try {
            const response = await apiClient.get(
                `/users/${userId}/following?page=${page}&limit=${limit}`
            );
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Search users
    searchUsers: async (query, page = 1, limit = 10) => {
        try {
            const response = await apiClient.get(
                `/users/search?q=${query}&page=${page}&limit=${limit}`
            );
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },
};

// Media API functions
export const mediaAPI = {
    // Upload media file
    uploadMedia: async (file) => {
        try {
            const formData = new FormData();
            formData.append("file", file);

            const response = await apiClient.post("/media/upload", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Delete media file
    deleteMedia: async (mediaId) => {
        try {
            const response = await apiClient.delete(`/media/${mediaId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },
};

// Polls API functions
export const pollsAPI = {
    // Create poll
    createPoll: async (pollData) => {
        try {
            const response = await apiClient.post("/polls", pollData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Vote on poll
    votePoll: async (pollId, optionId) => {
        try {
            const response = await apiClient.post(`/polls/${pollId}/vote`, {
                optionId,
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Get poll results
    getPollResults: async (pollId) => {
        try {
            const response = await apiClient.get(`/polls/${pollId}/results`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },
};

// Notifications API functions
export const notificationsAPI = {
    // Get user notifications
    getNotifications: async (page = 1, limit = 20) => {
        try {
            const response = await apiClient.get(
                `/notifications?page=${page}&limit=${limit}`
            );
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Mark notification as read
    markAsRead: async (notificationId) => {
        try {
            const response = await apiClient.put(
                `/notifications/${notificationId}/read`
            );
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Mark all notifications as read
    markAllAsRead: async () => {
        try {
            const response = await apiClient.put("/notifications/read-all");
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },
};

// Generic API function for custom requests
export const customAPI = {
    // Generic GET request
    get: async (endpoint, params = {}) => {
        try {
            const response = await apiClient.get(endpoint, { params });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Generic POST request
    post: async (endpoint, data = {}) => {
        try {
            const response = await apiClient.post(endpoint, data);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Generic PUT request
    put: async (endpoint, data = {}) => {
        try {
            const response = await apiClient.put(endpoint, data);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Generic DELETE request
    delete: async (endpoint) => {
        try {
            const response = await apiClient.delete(endpoint);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },
};

// Helper functions
export const apiHelpers = {
    // Check if user is authenticated
    isAuthenticated: () => {
        return !!localStorage.getItem("token");
    },

    // Get stored user data
    getStoredUser: () => {
        const user = localStorage.getItem("user");
        return user ? JSON.parse(user) : null;
    },

    // Set API base URL dynamically
    setBaseURL: (newBaseURL) => {
        apiClient.defaults.baseURL = newBaseURL;
    },

    // Set auth token manually
    setAuthToken: (token) => {
        localStorage.setItem("token", token);
    },
};

// Export the configured axios instance for custom use
export { apiClient };

// Default export with all APIs
export default {
    auth: authAPI,
    posts: postsAPI,
    comments: commentsAPI,
    users: usersAPI,
    media: mediaAPI,
    polls: pollsAPI,
    notifications: notificationsAPI,
    custom: customAPI,
    helpers: apiHelpers,
};
