// Resolve config from runtime/build env with safe fallbacks
const runtimeEnv = (typeof window !== 'undefined' && window.__ENV__) || {};
const ENV_API_BASE_URL =
  runtimeEnv.API_BASE_URL ||
  process.env.REACT_APP_API_BASE_URL ||
  'http://localhost:3001';
const ENV_WEBSOCKET_URL =
  runtimeEnv.WEBSOCKET_URL ||
  process.env.REACT_APP_WEBSOCKET_URL ||
  ENV_API_BASE_URL;
const ENV_PUSH_URL =
  runtimeEnv.PUSH_NOTIFICATION_URL ||
  process.env.REACT_APP_PUSH_NOTIFICATION_URL ||
  ENV_API_BASE_URL;

// Central configuration for API endpoints
const CONFIG = {
  // Backend API base URL
  API_BASE_URL: ENV_API_BASE_URL,

  // WebSocket URL (usually same as API base)
  WEBSOCKET_URL: ENV_WEBSOCKET_URL,

  // Push notification server URL
  PUSH_NOTIFICATION_URL: ENV_PUSH_URL,

  // Alternative URLs for different environments (optional presets)
  ENVIRONMENTS: {
    development: {
      API_BASE_URL: 'http://localhost:3001',
      WEBSOCKET_URL: 'http://localhost:3001',
      PUSH_NOTIFICATION_URL: 'http://localhost:3001',
    },
    production: {
      API_BASE_URL: 'https://your-production-domain.com',
      WEBSOCKET_URL: 'https://your-production-domain.com',
      PUSH_NOTIFICATION_URL: 'https://your-production-domain.com',
    },
    network: {
      API_BASE_URL: 'http://10.110.195.86:3001',
      WEBSOCKET_URL: 'http://10.110.195.86:3001',
      PUSH_NOTIFICATION_URL: 'http://10.110.195.86:3001',
    },
  },
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
