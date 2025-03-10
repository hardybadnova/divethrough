const CACHE_NAME = 'betster-v1';
const DYNAMIC_CACHE = 'betster-dynamic-v1';

// Assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/favicon.ico'
];

// Cache static assets on installation
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting()) // Force new service worker to activate immediately
  );
});

// Clean up old caches when new service worker activates
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME, DYNAMIC_CACHE];
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!cacheWhitelist.includes(cacheName)) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim()) // Take control of all clients
  );
});

// Network-first strategy with fallback to cache
self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }
  
  // Skip Supabase API requests - these should always go to network
  if (event.request.url.includes('supabase.co')) {
    return;
  }
  
  // For page navigations, use cache-first approach
  if (event.request.mode === 'navigate') {
    event.respondWith(
      caches.match('/index.html')
        .then(cachedResponse => {
          return cachedResponse || fetch(event.request)
            .then(response => {
              return caches.open(CACHE_NAME)
                .then(cache => {
                  cache.put('/index.html', response.clone());
                  return response;
                });
            });
        })
    );
    return;
  }
  
  // For other requests, try network first then fall back to cache
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Cache successful responses in the dynamic cache
        const responseClone = response.clone();
        caches.open(DYNAMIC_CACHE).then(cache => {
          cache.put(event.request, responseClone);
        });
        return response;
      })
      .catch(() => {
        // If network fails, try to serve from cache
        return caches.match(event.request)
          .then(cachedResponse => {
            return cachedResponse || caches.match('/index.html');
          });
      })
  );
});

// Handle push notifications
self.addEventListener('push', (event) => {
  const data = event.data.json();
  const options = {
    body: data.body,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-192x192.png',
    data: {
      url: data.action_url || '/'
    }
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  // Navigate to the URL when clicking the notification
  event.waitUntil(
    clients.matchAll({type: 'window'}).then(clientList => {
      // If a window is already open, focus it
      for (const client of clientList) {
        if (client.url === event.notification.data.url && 'focus' in client) {
          return client.focus();
        }
      }
      // Otherwise open a new window
      if (clients.openWindow) {
        return clients.openWindow(event.notification.data.url);
      }
    })
  );
});

// Handle background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'betster-bet-sync') {
    event.waitUntil(syncPendingBets());
  } else if (event.tag === 'betster-transaction-sync') {
    event.waitUntil(syncPendingTransactions());
  }
});

// Function to sync pending bets when back online
async function syncPendingBets() {
  try {
    const dbPromise = indexedDB.open('betster-offline-db', 1);
    const db = await new Promise((resolve, reject) => {
      dbPromise.onsuccess = e => resolve(e.target.result);
      dbPromise.onerror = e => reject(e);
    });
    
    const tx = db.transaction('pending-bets', 'readwrite');
    const store = tx.objectStore('pending-bets');
    const pendingBets = await store.getAll();
    
    // Process each pending bet
    for (const bet of pendingBets) {
      try {
        const response = await fetch('/api/bets', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(bet)
        });
        
        if (response.ok) {
          // Remove the bet from IndexedDB if successfully synced
          store.delete(bet.id);
        }
      } catch (error) {
        console.error('Failed to sync bet:', error);
      }
    }
  } catch (error) {
    console.error('Error syncing bets:', error);
  }
}

// Function to sync pending transactions when back online
async function syncPendingTransactions() {
  // Similar implementation as syncPendingBets but for transactions
  console.log('Syncing pending transactions');
}
