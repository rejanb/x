import { io } from 'socket.io-client';
import { WEBSOCKET_URL } from '../config/apiConfig';

const WS_URL = process.env.REACT_APP_WS_URL || WEBSOCKET_URL;

class WebSocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.listeners = new Map();
  }

  connect(token) {
    if (this.socket) {
      this.disconnect();
    }

    this.socket = io(WS_URL, {
      auth: {
        token: token
      },
      transports: ['websocket'],
      autoConnect: true,
    });

    this.socket.on('connect', () => {
      this.isConnected = true;
      this.reconnectAttempts = 0;
      
      // Join the feed room for real-time updates
      this.socket.emit('joinFeed');
    });

    this.socket.on('disconnect', (reason) => {
      this.isConnected = false;
      
      if (reason === 'io server disconnect') {
        // Server disconnected, reconnect manually
        this.reconnect(token);
      }
    });

    this.socket.on('connect_error', (error) => {
      this.isConnected = false;
      this.reconnect(token);
    });

    // Real-time feed events
    this.socket.on('newPost', (post) => {
      this.emit('newPost', post);
    });

    this.socket.on('postUpdate', (update) => {
      this.emit('postUpdate', update);
    });

    // Notifications
    this.socket.on('notification', (notification) => {
      this.emit('notification', notification);
    });

    this.socket.on('realTimeNotification', (notification) => {
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
      
      setTimeout(() => {
        this.connect(token);
      }, Math.pow(2, this.reconnectAttempts) * 1000); // Exponential backoff
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
}

// Create singleton instance
const websocketService = new WebSocketService();
export default websocketService;
