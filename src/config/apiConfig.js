// Central configuration for API endpoints
const CONFIG = {
  // Backend API base URL
  API_BASE_URL: 'http://localhost:3000',
  
  // WebSocket URL (usually same as API base)
  WEBSOCKET_URL: 'http://localhost:3000',
  
  // Push notification server URL
  PUSH_NOTIFICATION_URL: 'http://localhost:3000',
  
  // Alternative URLs for different environments
  ENVIRONMENTS: {
    development: {
      API_BASE_URL: 'http://localhost:3000',
      WEBSOCKET_URL: 'http://localhost:3000',
      PUSH_NOTIFICATION_URL: 'http://localhost:3000'
    },
    production: {
      API_BASE_URL: 'https://your-production-domain.com',
      WEBSOCKET_URL: 'https://your-production-domain.com', 
      PUSH_NOTIFICATION_URL: 'https://your-production-domain.com'
    },
    network: {
      API_BASE_URL: 'http://10.110.195.86:3000',
      WEBSOCKET_URL: 'http://10.110.195.86:3000',
      PUSH_NOTIFICATION_URL: 'http://10.110.195.86:3000'
    }
  }
};

// Helper function to get current environment URLs
export const getApiConfig = (environment = 'development') => {
  if (environment && CONFIG.ENVIRONMENTS[environment]) {
    return CONFIG.ENVIRONMENTS[environment];
  }
  
  // Default to main config
  return {
    API_BASE_URL: CONFIG.API_BASE_URL,
    WEBSOCKET_URL: CONFIG.WEBSOCKET_URL,
    PUSH_NOTIFICATION_URL: CONFIG.PUSH_NOTIFICATION_URL
  };
};

// Export individual URLs for easy access
export const API_BASE_URL = CONFIG.API_BASE_URL;
export const WEBSOCKET_URL = CONFIG.WEBSOCKET_URL;
export const PUSH_NOTIFICATION_URL = CONFIG.PUSH_NOTIFICATION_URL;

// Export full config
export default CONFIG;
