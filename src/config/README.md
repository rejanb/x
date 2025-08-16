# API Configuration Guide

## Overview

All API URLs are now centralized in `/src/config/apiConfig.js` for easy management.

## Usage

### Basic Import

```javascript
import {
  API_BASE_URL,
  WEBSOCKET_URL,
  PUSH_NOTIFICATION_URL,
} from "../config/apiConfig";
```

### Environment-specific URLs

```javascript
import { getApiConfig } from "../config/apiConfig";

// Get development URLs
const devConfig = getApiConfig("development");

// Get production URLs
const prodConfig = getApiConfig("production");

// Get network IP URLs
const networkConfig = getApiConfig("network");
```

## Current Configuration

### Development (Default)

- Backend API: `http://localhost:3001`
- WebSocket: `http://localhost:3001`
- Push Notifications: `http://localhost:3001`

### Network IP

- Backend API: `http://10.110.195.86:3001`
- WebSocket: `http://10.110.195.86:3001`
- Push Notifications: `http://10.110.195.86:3001`

### Production (Template)

- Backend API: `https://your-production-domain.com`
- WebSocket: `https://your-production-domain.com`
- Push Notifications: `https://your-production-domain.com`

## How to Change URLs

### Method 1: Edit the Main Config

Open `/src/config/apiConfig.js` and modify:

```javascript
const CONFIG = {
  API_BASE_URL: "http://localhost:3001", // Change this
  WEBSOCKET_URL: "http://localhost:3001", // Change this
  PUSH_NOTIFICATION_URL: "http://localhost:3001", // Change this
};
```

### Method 2: Switch Environment

In your components, use:

```javascript
import { getApiConfig } from "../config/apiConfig";

// Switch to network IP
const config = getApiConfig("network");
const API_URL = config.API_BASE_URL;
```

### Method 3: Environment Variables

Set environment variables in `.env` file:

```
REACT_APP_API_BASE_URL=http://localhost:3001
REACT_APP_WS_URL=http://localhost:3001
```

## Files Updated

The following files now use the centralized configuration:

- `/src/services/api.js`
- `/src/services/websocket.js`
- `/src/services/pushNotifications.js`
- `/src/utils/testPushNotifications.js`

## Quick Change Examples

### Change to Port 3000

```javascript
// In apiConfig.js
API_BASE_URL: "http://localhost:3000";
```

### Change to Production

```javascript
// In apiConfig.js
API_BASE_URL: "https://myapp.com";
```

### Change to Network IP

```javascript
// In apiConfig.js
API_BASE_URL: "http://10.110.195.86:3001";
```
