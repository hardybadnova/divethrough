
/**
 * Utility for managing offline data with IndexedDB
 */

// Database version
const DB_VERSION = 1;
const DB_NAME = 'betster-offline-db';

// Store names
const STORES = {
  PENDING_BETS: 'pending-bets',
  PENDING_TRANSACTIONS: 'pending-transactions',
  GAME_CACHE: 'game-cache',
  USER_DATA: 'user-data'
};

// Initialize the database
export function initOfflineDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = (event) => {
      console.error('IndexedDB error:', event);
      reject('Error opening IndexedDB');
    };
    
    request.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      resolve(db);
    };
    
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      // Create stores if they don't exist
      if (!db.objectStoreNames.contains(STORES.PENDING_BETS)) {
        db.createObjectStore(STORES.PENDING_BETS, { keyPath: 'id' });
      }
      
      if (!db.objectStoreNames.contains(STORES.PENDING_TRANSACTIONS)) {
        db.createObjectStore(STORES.PENDING_TRANSACTIONS, { keyPath: 'id' });
      }
      
      if (!db.objectStoreNames.contains(STORES.GAME_CACHE)) {
        db.createObjectStore(STORES.GAME_CACHE, { keyPath: 'id' });
      }
      
      if (!db.objectStoreNames.contains(STORES.USER_DATA)) {
        db.createObjectStore(STORES.USER_DATA, { keyPath: 'id' });
      }
    };
  });
}

// Save a pending bet when offline
export async function savePendingBet(bet: any): Promise<void> {
  const db = await initOfflineDb();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.PENDING_BETS], 'readwrite');
    const store = transaction.objectStore(STORES.PENDING_BETS);
    
    // Ensure the bet has an ID
    if (!bet.id) {
      bet.id = crypto.randomUUID();
    }
    
    const request = store.add(bet);
    
    request.onsuccess = () => {
      console.log('Bet saved for offline sync');
      // Register for background sync if available
      if ('serviceWorker' in navigator && 'SyncManager' in window) {
        navigator.serviceWorker.ready.then(registration => {
          registration.sync.register('betster-bet-sync');
        });
      }
      resolve();
    };
    
    request.onerror = () => {
      reject('Error saving pending bet');
    };
  });
}

// Save a pending transaction when offline
export async function savePendingTransaction(transaction: any): Promise<void> {
  const db = await initOfflineDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction([STORES.PENDING_TRANSACTIONS], 'readwrite');
    const store = tx.objectStore(STORES.PENDING_TRANSACTIONS);
    
    // Ensure the transaction has an ID
    if (!transaction.id) {
      transaction.id = crypto.randomUUID();
    }
    
    const request = store.add(transaction);
    
    request.onsuccess = () => {
      console.log('Transaction saved for offline sync');
      // Register for background sync
      if ('serviceWorker' in navigator && 'SyncManager' in window) {
        navigator.serviceWorker.ready.then(registration => {
          registration.sync.register('betster-transaction-sync');
        });
      }
      resolve();
    };
    
    request.onerror = () => {
      reject('Error saving pending transaction');
    };
  });
}

// Cache game data for offline access
export async function cacheGameData(gameId: string, data: any): Promise<void> {
  const db = await initOfflineDb();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.GAME_CACHE], 'readwrite');
    const store = transaction.objectStore(STORES.GAME_CACHE);
    
    const request = store.put({
      id: gameId,
      data,
      timestamp: Date.now()
    });
    
    request.onsuccess = () => resolve();
    request.onerror = () => reject('Error caching game data');
  });
}

// Get cached game data
export async function getCachedGameData(gameId: string): Promise<any> {
  const db = await initOfflineDb();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.GAME_CACHE], 'readonly');
    const store = transaction.objectStore(STORES.GAME_CACHE);
    
    const request = store.get(gameId);
    
    request.onsuccess = () => {
      resolve(request.result ? request.result.data : null);
    };
    
    request.onerror = () => {
      reject('Error getting cached game data');
    };
  });
}

// Cache user profile data for offline access
export async function cacheUserData(userId: string, data: any): Promise<void> {
  const db = await initOfflineDb();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.USER_DATA], 'readwrite');
    const store = transaction.objectStore(STORES.USER_DATA);
    
    const request = store.put({
      id: userId,
      data,
      timestamp: Date.now()
    });
    
    request.onsuccess = () => resolve();
    request.onerror = () => reject('Error caching user data');
  });
}

// Get cached user data
export async function getCachedUserData(userId: string): Promise<any> {
  const db = await initOfflineDb();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.USER_DATA], 'readonly');
    const store = transaction.objectStore(STORES.USER_DATA);
    
    const request = store.get(userId);
    
    request.onsuccess = () => {
      resolve(request.result ? request.result.data : null);
    };
    
    request.onerror = () => {
      reject('Error getting cached user data');
    };
  });
}
