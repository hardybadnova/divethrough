
import { useState, useEffect } from 'react';
import { 
  initOfflineSyncService, 
  scheduleSyncIfNeeded,
  getSyncStatus,
  triggerManualSync
} from '@/services/offlineSyncService';
import { getAllPendingBets, getAllPendingTransactions } from '@/utils/offlineDb';

export function useOfflineSync() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  const [pendingItemsCount, setPendingItemsCount] = useState(0);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

  // Check for pending items
  const checkPendingItems = async () => {
    try {
      const pendingBets = await getAllPendingBets();
      const pendingTransactions = await getAllPendingTransactions();
      
      const unsyncedBets = pendingBets.filter(bet => !bet.synced).length;
      const unsyncedTransactions = pendingTransactions.filter(tx => !tx.synced).length;
      
      setPendingItemsCount(unsyncedBets + unsyncedTransactions);
    } catch (error) {
      console.error('Error checking pending items:', error);
    }
  };

  // Initialize the offline sync service
  useEffect(() => {
    const cleanup = initOfflineSyncService();
    
    // Listen for custom events
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    const handleSyncStarted = () => setIsSyncing(true);
    const handleSyncCompleted = () => {
      setIsSyncing(false);
      setLastSyncTime(new Date());
      checkPendingItems();
    };
    const handleSyncFailed = () => {
      setIsSyncing(false);
      checkPendingItems();
    };
    
    document.addEventListener('betster:online', handleOnline);
    document.addEventListener('betster:offline', handleOffline);
    document.addEventListener('betster:sync-started', handleSyncStarted);
    document.addEventListener('betster:manual-sync-started', handleSyncStarted);
    document.addEventListener('betster:sync-completed', handleSyncCompleted);
    document.addEventListener('betster:sync-failed', handleSyncFailed);
    
    // Initial check
    checkPendingItems();
    
    return () => {
      cleanup();
      document.removeEventListener('betster:online', handleOnline);
      document.removeEventListener('betster:offline', handleOffline);
      document.removeEventListener('betster:sync-started', handleSyncStarted);
      document.removeEventListener('betster:manual-sync-started', handleSyncStarted);
      document.removeEventListener('betster:sync-completed', handleSyncCompleted);
      document.removeEventListener('betster:sync-failed', handleSyncFailed);
    };
  }, []);
  
  // Re-check pending items after sync status changes
  useEffect(() => {
    checkPendingItems();
  }, [isSyncing]);
  
  // Periodically check for pending items
  useEffect(() => {
    const interval = setInterval(() => {
      checkPendingItems();
    }, 30000); // Every 30 seconds
    
    return () => clearInterval(interval);
  }, []);

  const handleManualSync = async () => {
    await triggerManualSync();
  };

  return {
    isOnline,
    isSyncing,
    pendingItemsCount,
    lastSyncTime,
    handleManualSync,
    checkPendingItems
  };
}
