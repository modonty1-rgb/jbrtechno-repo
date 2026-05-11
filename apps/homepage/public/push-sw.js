// Empty service worker to prevent 404 errors
// This file is requested by Facebook Pixel or browser extensions
// but we don't actually use service workers

self.addEventListener('install', () => {
  // Skip waiting to activate immediately
  self.skipWaiting();
});

self.addEventListener('activate', () => {
  // Take control of all pages immediately
  return self.clients.claim();
});

// No-op fetch handler - just pass through
self.addEventListener('fetch', () => {
  // Do nothing - let browser handle normally
});



















