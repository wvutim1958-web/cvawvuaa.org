// Service Worker for CVCWVUAA PWA
// Provides offline functionality and caching for better mobile experience

const CACHE_NAME = 'cvcwvuaa-v3';
const OFFLINE_URL = '/offline.html';

// Core files to cache for offline functionality
const CORE_CACHE_FILES = [
  '/',
  '/index.html',
  '/events.html',
  '/scores.html', 
  '/search.html',
  '/minutes.html',
  '/news.html',
  '/css/styles.css',
  '/js/theme-toggle.js',
  '/js/search.js',
  '/js/breadcrumbs.js',
  '/assets/logo.png',
  '/assets/favicon.png',
  OFFLINE_URL
];

// Additional files to cache on first visit
const EXTENDED_CACHE_FILES = [
  '/about.html',
  '/board.html',
  '/bylaws.html', 
  '/contact.html',
  '/media.html',
  '/membership.html',
  '/pay.html',
  '/programs.html',
  '/resources.html',
  '/scholarship.html',
  '/alumni-spotlight.html',
  '/thanks.html',
  '/gallery/index.html',
  '/gallery/2025/index.html',
  '/gallery/2024/index.html',
  '/gallery/2023/index.html',
  '/gallery/2022/index.html'
];

// Install event - cache core files
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Caching core files...');
        return cache.addAll(CORE_CACHE_FILES);
      })
      .then(() => {
        console.log('Core files cached successfully');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Failed to cache core files:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker activated');
        return self.clients.claim();
      })
  );
  
  // Pre-cache extended files in background
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(EXTENDED_CACHE_FILES).catch((error) => {
          console.log('Extended cache failed (non-critical):', error);
        });
      })
  );
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }
  
  // Skip external requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }
  
  const url = new URL(event.request.url);

  // Network-first for HTML/JS/CSS/JSON so updates show up immediately; fallback to cache/offline
  if (
    event.request.destination === 'document' ||
    url.pathname.endsWith('.html') ||
    url.pathname.endsWith('.js') ||
    url.pathname.endsWith('.css') ||
    url.pathname.endsWith('.json')
  ) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
          return response;
        })
        .catch(async () => {
          const cached = await caches.match(event.request);
          if (cached) return cached;
          if (event.request.destination === 'document') return caches.match(OFFLINE_URL);
          return new Response('Offline', { status: 408, statusText: 'Offline' });
        })
    );
    return;
  }

  // Cache-first for images and JSON with network update
  event.respondWith(
    caches.match(event.request).then((cached) => {
      const fetchPromise = fetch(event.request)
        .then((response) => {
          if (response && response.status === 200) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
          }
          return response;
        })
        .catch(() => cached || new Response('Offline', { status: 408, statusText: 'Offline' }));
      return cached || fetchPromise;
    })
  );
});

// Background sync for when connection returns
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    console.log('Background sync triggered');
    event.waitUntil(
      // Could sync form submissions or fetch latest news here
      Promise.resolve()
    );
  }
});

// Push notification handler (for future use)
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: '/assets/logo.png',
      badge: '/assets/favicon.png',
      tag: 'cvcwvuaa-notification',
      requireInteraction: false,
      data: data.url || '/'
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title || 'CVCWVUAA Update', options)
    );
  }
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  const url = event.notification.data || '/';
  
  event.waitUntil(
    clients.matchAll({ type: 'window' })
      .then((clientList) => {
        // Check if site is already open
        for (const client of clientList) {
          if (client.url === url && 'focus' in client) {
            return client.focus();
          }
        }
        
        // Open new window
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      })
  );
});