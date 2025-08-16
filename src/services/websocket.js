import { io } from 'socket.io-client';
import { WEBSOCKET_URL, getApiConfig } from '../config/apiConfig';

// Use centralized config - explicitly set to avoid React dev server interference
const environment = process.env.NODE_ENV === 'production' ? 'production' : 'development';
const apiConfig = getApiConfig(environment);
// Force correct port to override any caching issues
const WS_URL = 'http://localhost:3001';

console.log('🔧 WebSocket Config Debug:');
console.log('  - Environment:', environment);
console.log('  - Final WS_URL:', WS_URL);
console.log('  - FORCED URL (should be 3001):', WS_URL);
console.log('  - window.location.origin:', window.location.origin);
console.log('🔧 HARDCODED URL CHECK - WS_URL should be http://localhost:3001:', WS_URL);

class WebSocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.listeners = new Map();
    this.currentToken = null; // Store current token
  }

  connect(token) {
    console.log('🔌 WebSocket: Attempting to connect with token:', token ? 'yes' : 'no');
    
    if (this.socket) {
      this.disconnect();
    }

    // Get fresh token from localStorage in case the passed token is stale
    const freshToken = localStorage.getItem('token');
    const tokenToUse = freshToken || token;
    this.currentToken = tokenToUse; // Store for later use
    
    console.log('🔌 WebSocket: Connecting to URL:', WS_URL);
    console.log('🔌 WebSocket: Using token:', tokenToUse ? 'yes' : 'no');

    this.socket = io(WS_URL, {
      auth: {
        token: tokenToUse
      },
      transports: ['websocket'],
      autoConnect: true,
    });

    this.socket.on('connect', () => {
      console.log('✅ WebSocket: Connected successfully');
      this.isConnected = true;
      this.reconnectAttempts = 0;
      
      // Join the feed room for real-time updates
      console.log('🚀 WebSocket: Joining feed room');
      this.socket.emit('joinFeed');
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ WebSocket: Disconnected, reason:', reason);
      this.isConnected = false;
      
      if (reason === 'io server disconnect' || reason === 'io client disconnect') {
        // Server disconnected us - likely due to expired token
        console.log('🚨 WebSocket: Server disconnected - token likely expired');
        this.emit('authError', { 
          message: 'Session expired. Please log in again for real-time updates.',
          reason: 'server_disconnect'
        });
        
        // Don't attempt automatic reconnection for server disconnects
        // as this usually indicates an auth/token issue
        console.log('⏹️ WebSocket: Not reconnecting automatically for server disconnect');
      } else {
        // Other disconnect reasons (network issues, etc.) - try to reconnect
        this.reconnect(this.currentToken);
      }
    });

    this.socket.on('connect_error', (error) => {
      console.error('❌ WebSocket: Connection error:', error);
      this.isConnected = false;
      
      // If it's an auth error, emit auth error event instead of retrying
      if (error.message && (error.message.includes('Authentication failed') || error.message.includes('jwt'))) {
        console.log('� WebSocket: Authentication failed - token expired or invalid');
        this.emit('authError', { 
          message: 'Authentication failed. Please log in again.',
          reason: 'auth_failed',
          error: error.message
        });
      } else {
        // Network or other errors - try to reconnect
        this.reconnect(this.currentToken);
      }
    });

    // Real-time feed events
    this.socket.on('newPost', (post) => {
      console.log('📨 WebSocket: Received new post:', post);
      this.emit('newPost', post);
    });

    this.socket.on('postUpdate', (update) => {
      console.log('📨 WebSocket: Received post update:', update);
      this.emit('postUpdate', update);
    });

    // Notifications
    this.socket.on('notification', (notification) => {
      console.log('📨 WebSocket: Received notification:', notification);
      this.emit('notification', notification);
    });

    this.socket.on('realTimeNotification', (notification) => {
      console.log('📨 WebSocket: Received real-time notification:', notification);
      this.emit('realTimeNotification', notification);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.emit('leaveFeed');
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  reconnect(token) {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`🔄 WebSocket: Reconnection attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
      
      setTimeout(() => {
        // Always get fresh token before reconnecting
        const freshToken = localStorage.getItem('token');
        const tokenToUse = freshToken || token;
        this.connect(tokenToUse);
      }, Math.pow(2, this.reconnectAttempts) * 1000); // Exponential backoff
    } else {
      console.log('⚠️ WebSocket: Max reconnection attempts reached');
    }
  }

  // Event listener methods
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);
  }

  off(event, callback) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).delete(callback);
    }
  }

  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          // Error handled silently
        }
      });
    }
  }

  // Utility methods
  isSocketConnected() {
    return this.isConnected && this.socket && this.socket.connected;
  }

  getSocket() {
    return this.socket;
  }

  // Method to refresh connection with new token
  refreshToken() {
    const freshToken = localStorage.getItem('token');
    if (freshToken && freshToken !== this.currentToken) {
      console.log('🔄 WebSocket: Refreshing with new token');
      this.currentToken = freshToken;
      this.disconnect();
      this.connect(freshToken);
      return true;
    }
    return false;
  }

  // Method to manually test token validity
  testConnection() {
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('🚨 No token available for WebSocket connection');
      return false;
    }
    
    console.log('🧪 Testing WebSocket connection with current token...');
    this.connect(token);
    return true;
  }

  // Method to get connection status info
  getConnectionInfo() {
    return {
      isConnected: this.isConnected,
      hasSocket: !!this.socket,
      socketConnected: this.socket?.connected || false,
      currentToken: !!this.currentToken,
      reconnectAttempts: this.reconnectAttempts,
      maxReconnectAttempts: this.maxReconnectAttempts
    };
  }
}

// Create singleton instance
const websocketService = new WebSocketService();
export default websocketService;
