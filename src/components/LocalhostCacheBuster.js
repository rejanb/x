import React, { useEffect } from 'react';

const LocalhostCacheBuster = () => {
  useEffect(() => {
    // Only run on localhost
    if (window.location.hostname === 'localhost') {
      console.log('🔧 Localhost detected - clearing all caches...');
      
      // Clear all localStorage
      localStorage.clear();
      
      // Clear all sessionStorage
      sessionStorage.clear();
      
      // Unregister all service workers
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then(registrations => {
          registrations.forEach(registration => {
            registration.unregister();
            console.log('🗑️ Service worker unregistered for localhost');
          });
        });
      }
      
      // Force cache refresh
      if ('caches' in window) {
        caches.keys().then(names => {
          names.forEach(name => {
            caches.delete(name);
            console.log('🗑️ Cache deleted:', name);
          });
        });
      }
      
      // Add a timestamp to force component refresh
      const timestamp = Date.now();
      localStorage.setItem('localhost-cache-buster', timestamp.toString());
      console.log('✅ Localhost cache cleared, timestamp:', timestamp);
    }
  }, []);

  // Show a visible indicator on localhost
  if (window.location.hostname === 'localhost') {
    return (
      <div style={{
        position: 'fixed',
        top: '10px',
        left: '50%',
        transform: 'translateX(-50%)',
        background: '#ff9800',
        color: 'white',
        padding: '8px 16px',
        borderRadius: '20px',
        fontSize: '12px',
        fontWeight: 'bold',
        zIndex: 99999,
        boxShadow: '0 2px 10px rgba(0,0,0,0.3)'
      }}>
        🔧 Localhost Mode - Cache Cleared
      </div>
    );
  }

  return null;
};

export default LocalhostCacheBuster;
