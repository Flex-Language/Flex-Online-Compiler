/**
 * Service Worker for Flex Web Interpreter
 * Provides offline capabilities and improved loading performance
 */

// Cache name (update version to force cache refresh)
const CACHE_NAME = 'flex-web-cache-v1';

// Resources to cache on install
const CACHE_URLS = [
  '/',
  '/index.html',
  '/assets/css/main.css',
  '/assets/css/editor.css',
  '/assets/css/terminal.css',
  '/assets/css/debugger.css',
  '/assets/images/logo.svg',
  '/js/main.js',
  '/js/interpreter/lexer.js',
  '/js/interpreter/parser.js',
  '/js/interpreter/interpreter.js',
  '/js/interpreter/environment.js',
  '/js/stdlib/index.js',
  '/js/editor/flex-mode.js',
  '/js/ui/terminal.js',
  '/js/utils/error-formatter.js',
  '/js/utils/virtual-fs.js',
  '/js/utils/debugger.js',
  '/examples/hello_world.lx',
  '/examples/fibonacci.lx',
  '/examples/calculator.lx'
];

// Install event - cache core resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(CACHE_URLS.map(url => 
          // Handle relative paths for GitHub Pages
          url.startsWith('/') ? new URL(url, self.location.origin).href : url
        ));
      })
      .then(() => {
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached response if found
        if (response) {
          return response;
        }
        
        // Clone the request
        const fetchRequest = event.request.clone();
        
        // Try fetching from network
        return fetch(fetchRequest).then((response) => {
          // Don't cache non-success responses or non-GET requests
          if (!response || response.status !== 200 || response.type !== 'basic' || event.request.method !== 'GET') {
            return response;
          }
          
          // Clone the response for caching
          const responseToCache = response.clone();
          
          // Open cache and store the response
          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache);
            });
            
          return response;
        });
      })
  );
});
