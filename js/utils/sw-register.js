/**
 * Service Worker Registration for Flex Web Interpreter
 * Enables offline capabilities and Progressive Web App features
 */
(function() {
  'use strict';

  // Check if service workers are supported
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
      // Get the base URL for GitHub Pages compatibility
      const baseUrl = window.location.pathname.includes('/flex-web') 
        ? '/flex-web' // GitHub Pages path
        : ''; // Local development path
      
      navigator.serviceWorker.register(baseUrl + '/service-worker.js')
        .then(function(registration) {
          console.log('Service Worker registered with scope:', registration.scope);
        })
        .catch(function(error) {
          console.error('Service Worker registration failed:', error);
        });
    });
  } else {
    console.log('Service Workers are not supported in this browser');
  }
})();
