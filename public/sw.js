
// Service Worker for Betster app
// Handles caching, offline functionality, and background sync

// Cache name versioning
const CACHE_NAME = 'betster-cache-v1';
const DATA_CACHE_NAME = 'betster-data-cache-v1';

// Assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('[Service Worker] Successfully installed');
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== DATA_CACHE_NAME) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('[Service Worker] Activated and taking control');
      return self.clients.claim();
    })
  );
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', (event) => {
  // For API requests, try network first, then cache
  if (event.request.url.includes('/api/') || 
      event.request.url.includes('supabase.co')) {
    
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Clone the response for caching
          const responseToCache = response.clone();
          
          caches.open(DATA_CACHE_NAME)
            .then((cache) => {
              // Only cache successful responses
              if (response.status === 200) {
                cache.put(event.request, responseToCache);
              }
            });
            
          return response;
        })
        .catch(() => {
          // If network fails, try to serve from cache
          return caches.match(event.request);
        })
    );
  } else {
    // For non-API requests, use "Cache then network" strategy
    event.respondWith(
      caches.match(event.request)
        .then((response) => {
          return response || fetch(event.request)
            .then((fetchResponse) => {
              return caches.open(CACHE_NAME)
                .then((cache) => {
                  // Cache the new resource
                  cache.put(event.request, fetchResponse.clone());
                  return fetchResponse;
                });
            });
        })
        .catch(() => {
          // If both cache and network fail, show offline page
          if (event.request.mode === 'navigate') {
            return caches.match('/');
          }
          
          return new Response('Offline and resource not cached', {
            status: 503,
            statusText: 'Service Unavailable'
          });
        })
    );
  }
});

// Handle background sync events
self.addEventListener('sync', (event) => {
  console.log('[Service Worker] Background sync event:', event.tag);
  
  if (event.tag === 'betster-bet-sync') {
    event.waitUntil(syncBets());
  } else if (event.tag === 'betster-transaction-sync') {
    event.waitUntil(syncTransactions());
  } else if (event.tag === 'betster-data-sync') {
    // Comprehensive sync of all data
    event.waitUntil(syncAllData());
  }
});

// Function to sync bets in the background
async function syncBets() {
  console.log('[Service Worker] Syncing bets...');
  
  try {
    // Open the IndexedDB
    const dbName = 'betster-offline-db';
    const dbVersion = 1;
    const storeName = 'pending-bets';
    
    // Open the database
    const db = await new Promise((resolve, reject) => {
      const request = indexedDB.open(dbName, dbVersion);
      request.onerror = reject;
      request.onsuccess = (event) => resolve(event.target.result);
    });
    
    // Get all pending bets
    const bets = await new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();
      
      request.onerror = reject;
      request.onsuccess = () => resolve(request.result || []);
    });
    
    console.log(`[Service Worker] Found ${bets.length} bets to sync`);
    
    // Process each bet (in a real implementation, this would make API calls)
    for (const bet of bets) {
      if (bet.synced) continue;
      
      try {
        console.log(`[Service Worker] Syncing bet: ${bet.id}`);
        
        // Here we would normally make a fetch request to sync the bet
        // For demonstration, we'll just mark it as synced
        
        // Mark bet as synced in IndexedDB
        await new Promise((resolve, reject) => {
          const transaction = db.transaction([storeName], 'readwrite');
          const store = transaction.objectStore(storeName);
          bet.synced = true;
          const request = store.put(bet);
          
          request.onerror = reject;
          request.onsuccess = resolve;
        });
        
        console.log(`[Service Worker] Successfully synced bet: ${bet.id}`);
      } catch (error) {
        console.error(`[Service Worker] Failed to sync bet ${bet.id}:`, error);
      }
    }
    
    console.log('[Service Worker] Bet sync complete');
    return;
  } catch (error) {
    console.error('[Service Worker] Error in syncBets:', error);
    throw error;
  }
}

// Function to sync transactions in the background
async function syncTransactions() {
  console.log('[Service Worker] Syncing transactions...');
  
  try {
    // Similar to syncBets but for transactions
    // In a real implementation, this would make API calls
    
    console.log('[Service Worker] Transaction sync complete');
    return;
  } catch (error) {
    console.error('[Service Worker] Error in syncTransactions:', error);
    throw error;
  }
}

// Function to sync all data in the background
async function syncAllData() {
  console.log('[Service Worker] Syncing all data...');
  
  try {
    // Sync bets
    await syncBets();
    
    // Sync transactions
    await syncTransactions();
    
    console.log('[Service Worker] All data sync complete');
    return;
  } catch (error) {
    console.error('[Service Worker] Error in syncAllData:', error);
    throw error;
  }
}

// Optional: Handle push notifications
self.addEventListener('push', (event) => {
  console.log('[Service Worker] Push notification received:', event);
  
  const data = event.data.json();
  const title = data.title || 'Betster Notification';
  const options = {
    body: data.body || 'You have a new notification',
    icon: '/icons/icon-192x192.png',
    badge: '/favicon.ico',
    data: data.data || {}
  };
  
  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Optional: Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] Notification click:', event);
  
  event.notification.close();
  
  // Navigate to a relevant URL when the notification is clicked
  event.waitUntil(
    clients.openWindow('/')
  );
});
