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

// Type definition for ServiceWorker with Sync
interface SyncManager {
  register(tag: string): Promise<void>;
}

// Type guard for background sync
const hasBackgroundSync = (registration: ServiceWorkerRegistration): registration is ServiceWorkerRegistration & { sync: SyncManager } => {
  return 'sync' in registration;
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
    
    if (!bet.id) {
      bet.id = crypto.randomUUID();
    }
    
    bet.timestamp = Date.now();
    bet.synced = false;
    
    const request = store.add(bet);
    
    request.onsuccess = () => {
      console.log('Bet saved for offline sync');
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.ready.then(registration => {
          if (hasBackgroundSync(registration)) {
            registration.sync.register('betster-bet-sync');
          }
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
    
    if (!transaction.id) {
      transaction.id = crypto.randomUUID();
    }
    
    transaction.timestamp = Date.now();
    transaction.synced = false;
    
    const request = store.add(transaction);
    
    request.onsuccess = () => {
      console.log('Transaction saved for offline sync');
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.ready.then(registration => {
          if (hasBackgroundSync(registration)) {
            registration.sync.register('betster-transaction-sync');
          }
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

// Get all pending bets for syncing
export async function getAllPendingBets(): Promise<any[]> {
  const db = await initOfflineDb();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.PENDING_BETS], 'readonly');
    const store = transaction.objectStore(STORES.PENDING_BETS);
    const request = store.getAll();
    
    request.onsuccess = () => {
      resolve(request.result || []);
    };
    
    request.onerror = () => {
      reject('Error getting pending bets');
    };
  });
}

// Get all pending transactions for syncing
export async function getAllPendingTransactions(): Promise<any[]> {
  const db = await initOfflineDb();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.PENDING_TRANSACTIONS], 'readonly');
    const store = transaction.objectStore(STORES.PENDING_TRANSACTIONS);
    const request = store.getAll();
    
    request.onsuccess = () => {
      resolve(request.result || []);
    };
    
    request.onerror = () => {
      reject('Error getting pending transactions');
    };
  });
}

// Mark a bet as synced
export async function markBetSynced(betId: string): Promise<void> {
  const db = await initOfflineDb();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.PENDING_BETS], 'readwrite');
    const store = transaction.objectStore(STORES.PENDING_BETS);
    const request = store.get(betId);
    
    request.onsuccess = () => {
      if (request.result) {
        const bet = request.result;
        bet.synced = true;
        store.put(bet);
        resolve();
      } else {
        reject(`Bet with ID ${betId} not found`);
      }
    };
    
    request.onerror = () => {
      reject('Error marking bet as synced');
    };
  });
}

// Mark a transaction as synced
export async function markTransactionSynced(transactionId: string): Promise<void> {
  const db = await initOfflineDb();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.PENDING_TRANSACTIONS], 'readwrite');
    const store = transaction.objectStore(STORES.PENDING_TRANSACTIONS);
    const request = store.get(transactionId);
    
    request.onsuccess = () => {
      if (request.result) {
        const tx = request.result;
        tx.synced = true;
        store.put(tx);
        resolve();
      } else {
        reject(`Transaction with ID ${transactionId} not found`);
      }
    };
    
    request.onerror = () => {
      reject('Error marking transaction as synced');
    };
  });
}

// Remove synced items to keep the database clean
export async function cleanupSyncedItems(): Promise<void> {
  const db = await initOfflineDb();
  
  // Clean up bets
  const betsTx = db.transaction([STORES.PENDING_BETS], 'readwrite');
  const betsStore = betsTx.objectStore(STORES.PENDING_BETS);
  const betsRequest = betsStore.openCursor();
  
  betsRequest.onsuccess = (event) => {
    const cursor = (event.target as IDBRequest).result as IDBCursorWithValue;
    if (cursor) {
      if (cursor.value.synced) {
        cursor.delete();
      }
      cursor.continue();
    }
  };
  
  // Clean up transactions
  const txTx = db.transaction([STORES.PENDING_TRANSACTIONS], 'readwrite');
  const txStore = txTx.objectStore(STORES.PENDING_TRANSACTIONS);
  const txRequest = txStore.openCursor();
  
  txRequest.onsuccess = (event) => {
    const cursor = (event.target as IDBRequest).result as IDBCursorWithValue;
    if (cursor) {
      if (cursor.value.synced) {
        cursor.delete();
      }
      cursor.continue();
    }
  };
  
  return Promise.resolve();
}

// Sync all pending data when coming back online
export async function syncPendingData(): Promise<{
  bets: { success: number; failed: number };
  transactions: { success: number; failed: number };
}> {
  console.log('Starting offline data synchronization');
  
  try {
    const pendingBets = await getAllPendingBets();
    const pendingTransactions = await getAllPendingTransactions();
    
    console.log(`Found ${pendingBets.length} pending bets and ${pendingTransactions.length} pending transactions`);
    
    const betResults = { success: 0, failed: 0 };
    const txResults = { success: 0, failed: 0 };
    
    // Sync bets
    for (const bet of pendingBets) {
      if (bet.synced) continue;
      
      try {
        // TODO: Implement actual API call to submit bet
        console.log(`Syncing bet: ${bet.id}`);
        
        // For now just mark as synced
        await markBetSynced(bet.id);
        betResults.success++;
      } catch (error) {
        console.error(`Failed to sync bet ${bet.id}:`, error);
        betResults.failed++;
      }
    }
    
    // Sync transactions
    for (const tx of pendingTransactions) {
      if (tx.synced) continue;
      
      try {
        // TODO: Implement actual API call to submit transaction
        console.log(`Syncing transaction: ${tx.id}`);
        
        // For now just mark as synced
        await markTransactionSynced(tx.id);
        txResults.success++;
      } catch (error) {
        console.error(`Failed to sync transaction ${tx.id}:`, error);
        txResults.failed++;
      }
    }
    
    // Clean up synced items
    await cleanupSyncedItems();
    
    console.log('Sync complete. Results:', { bets: betResults, transactions: txResults });
    return { bets: betResults, transactions: txResults };
  } catch (error) {
    console.error('Error during data synchronization:', error);
    return { bets: { success: 0, failed: 0 }, transactions: { success: 0, failed: 0 } };
  }
}
