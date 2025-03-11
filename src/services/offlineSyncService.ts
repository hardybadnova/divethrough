
import { supabase } from '@/lib/supabase/client';
import { toast } from '@/hooks/use-toast';
import { syncPendingBets, syncPendingTransactions } from './syncService';
import { 
  getAllPendingBets, 
  getAllPendingTransactions,
  storePendingBet,
  storePendingTransaction,
  markBetSynced, 
  markTransactionSynced,
  cleanupSyncedItems
} from '@/utils/offlineDb';

// Status tracking
let isSyncing = false;
let syncQueue: Array<() => Promise<void>> = [];
let syncAttempts = 0;
const MAX_SYNC_ATTEMPTS = 3;

// Subscribe to online/offline events
export const initOfflineSyncService = () => {
  console.log('Initializing offline sync service');
  
  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);
  
  // Initial check
  if (navigator.onLine) {
    scheduleSyncIfNeeded();
  }
  
  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
};

// Handle coming back online
const handleOnline = async () => {
  console.log('Network is back online');
  document.dispatchEvent(new CustomEvent('betster:online'));
  
  await scheduleSyncIfNeeded();
};

// Handle going offline
const handleOffline = () => {
  console.log('Network is offline');
  document.dispatchEvent(new CustomEvent('betster:offline'));
  
  // Stop any ongoing sync operations
  isSyncing = false;
  syncQueue = [];
  syncAttempts = 0;
};

// Schedule sync if there are pending items
export const scheduleSyncIfNeeded = async () => {
  if (!navigator.onLine || isSyncing) return;
  
  try {
    const pendingBets = await getAllPendingBets();
    const pendingTransactions = await getAllPendingTransactions();
    
    const hasPendingItems = 
      pendingBets.filter(bet => !bet.synced).length > 0 || 
      pendingTransactions.filter(tx => !tx.synced).length > 0;
    
    if (hasPendingItems) {
      console.log('Scheduling sync for pending items');
      syncQueue.push(performSync);
      processQueue();
    } else {
      console.log('No pending items to sync');
    }
  } catch (error) {
    console.error('Error checking for pending items:', error);
  }
};

// Process the sync queue
const processQueue = async () => {
  if (isSyncing || !navigator.onLine || syncQueue.length === 0) return;
  
  isSyncing = true;
  document.dispatchEvent(new CustomEvent('betster:sync-started'));
  
  try {
    const nextSync = syncQueue.shift();
    if (nextSync) {
      await nextSync();
    }
    
    isSyncing = false;
    
    // Process next item in queue
    if (syncQueue.length > 0) {
      processQueue();
    } else {
      document.dispatchEvent(new CustomEvent('betster:sync-completed'));
    }
  } catch (error) {
    console.error('Error processing sync queue:', error);
    isSyncing = false;
    
    syncAttempts++;
    if (syncAttempts < MAX_SYNC_ATTEMPTS) {
      // Retry after delay
      setTimeout(() => {
        syncQueue.unshift(performSync);
        processQueue();
      }, 5000 * syncAttempts); // Exponential backoff
    } else {
      document.dispatchEvent(new CustomEvent('betster:sync-failed'));
      syncAttempts = 0;
      
      toast({
        title: 'Sync Failed',
        description: 'We were unable to sync your data. Please try again later.',
        variant: 'destructive'
      });
    }
  }
};

// Perform the actual sync operation
const performSync = async () => {
  console.log('Performing sync operation');
  
  if (!navigator.onLine) {
    throw new Error('Cannot sync while offline');
  }
  
  try {
    // Sync bets
    const betsResult = await syncPendingBets();
    console.log('Bets sync result:', betsResult);
    
    // Sync transactions
    const transactionsResult = await syncPendingTransactions();
    console.log('Transactions sync result:', transactionsResult);
    
    // Clean up synced items
    await cleanupSyncedItems();
    
    const totalSuccess = betsResult.success + transactionsResult.success;
    if (totalSuccess > 0) {
      toast({
        title: 'Sync Complete',
        description: `Successfully synced ${totalSuccess} items that were made while offline.`
      });
    }
    
    document.dispatchEvent(new CustomEvent('betster:sync-completed', {
      detail: { bets: betsResult, transactions: transactionsResult }
    }));
    
    return { bets: betsResult, transactions: transactionsResult };
  } catch (error) {
    console.error('Error during sync:', error);
    document.dispatchEvent(new CustomEvent('betster:sync-failed', {
      detail: { error }
    }));
    throw error;
  }
};

// Create a bet while offline
export const createOfflineBet = async (playerId: string, poolId: string, playerData: any) => {
  try {
    // Store bet in local DB
    const betId = await storePendingBet({
      id: `bet_${Date.now()}`,
      playerId,
      poolId,
      playerData,
      timestamp: new Date().toISOString(),
      synced: false
    });
    
    console.log(`Stored offline bet: ${betId}`);
    
    // Schedule sync when online
    if (navigator.onLine) {
      scheduleSyncIfNeeded();
    } else {
      toast({
        title: 'Offline Mode',
        description: 'Your bet has been saved locally and will sync when you\'re back online.'
      });
    }
    
    return betId;
  } catch (error) {
    console.error('Error creating offline bet:', error);
    throw error;
  }
};

// Create a transaction while offline
export const createOfflineTransaction = async (
  userId: string, 
  amount: number, 
  type: string, 
  description: string
) => {
  try {
    // Store transaction in local DB
    const txId = await storePendingTransaction({
      id: `tx_${Date.now()}`,
      userId,
      amount,
      type,
      status: 'pending',
      description,
      timestamp: new Date().toISOString(),
      synced: false
    });
    
    console.log(`Stored offline transaction: ${txId}`);
    
    // Schedule sync when online
    if (navigator.onLine) {
      scheduleSyncIfNeeded();
    } else {
      toast({
        title: 'Offline Mode',
        description: 'Your transaction has been saved locally and will sync when you\'re back online.'
      });
    }
    
    return txId;
  } catch (error) {
    console.error('Error creating offline transaction:', error);
    throw error;
  }
};

// Manual sync trigger
export const triggerManualSync = async (): Promise<{
  bets: { success: number; failed: number };
  transactions: { success: number; failed: number };
}> => {
  if (!navigator.onLine) {
    toast({
      title: 'Sync Failed',
      description: 'You need to be online to sync your data',
      variant: 'destructive'
    });
    return { bets: { success: 0, failed: 0 }, transactions: { success: 0, failed: 0 } };
  }
  
  if (isSyncing) {
    toast({
      title: 'Sync in Progress',
      description: 'Please wait for the current sync to complete'
    });
    return { bets: { success: 0, failed: 0 }, transactions: { success: 0, failed: 0 } };
  }
  
  document.dispatchEvent(new CustomEvent('betster:manual-sync-started'));
  
  try {
    return await performSync();
  } catch (error) {
    console.error('Error during manual sync:', error);
    
    toast({
      title: 'Sync Failed',
      description: 'There was an error syncing your data. Please try again.',
      variant: 'destructive'
    });
    
    return { bets: { success: 0, failed: 0 }, transactions: { success: 0, failed: 0 } };
  }
};

// Get the current sync status
export const getSyncStatus = () => {
  return {
    isSyncing,
    queueLength: syncQueue.length,
    isOnline: navigator.onLine
  };
};
