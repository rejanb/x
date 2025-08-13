import axios from "axios";

// Base API URL from environment variables
const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:3000";

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
};