
import { supabase } from '@/lib/supabase/client';
import { toast } from '@/hooks/use-toast';
import { 
  getAllPendingBets, 
  getAllPendingTransactions, 
  markBetSynced, 
  markTransactionSynced,
  cleanupSyncedItems
} from '@/utils/offlineDb';
import { updateWalletBalance } from '@/lib/supabase/profiles';
import { createTransaction, updateTransactionStatus } from '@/lib/supabase/transactions';

// Process and sync pending bets
export const syncPendingBets = async (): Promise<{
  success: number;
  failed: number;
}> => {
  try {
    const pendingBets = await getAllPendingBets();
    let successCount = 0;
    let failedCount = 0;
    
    // Process each pending bet
    for (const bet of pendingBets) {
      if (bet.synced) continue;
      
      try {
        // Attempt to submit the bet to the server
        console.log(`Syncing bet: ${bet.id} for pool ${bet.poolId}`);
        
        // Get the current pool details
        const { data: poolData, error: poolError } = await supabase
          .from('pools')
          .select('entry_fee, status')
          .eq('id', bet.poolId)
          .single();
          
        if (poolError) {
          console.error(`Pool ${bet.poolId} not found:`, poolError);
          failedCount++;
          continue;
        }
        
        // Check if pool is still open for bets
        if (poolData.status !== 'open' && poolData.status !== 'waiting') {
          console.log(`Pool ${bet.poolId} is no longer accepting bets (status: ${poolData.status})`);
          failedCount++;
          continue;
        }
        
        // Insert the bet into the game_pools table
        const { error: insertError } = await supabase
          .from('game_pools')
          .insert([{
            pool_id: bet.poolId,
            player_id: bet.playerId,
            player_data: bet.playerData
          }]);
          
        if (insertError) {
          console.error(`Failed to insert bet:`, insertError);
          failedCount++;
          continue;
        }
        
        // Create transaction record for the bet
        const transaction = await createTransaction(
          bet.playerId,
          -poolData.entry_fee,
          'game_entry',
          `Entry fee for pool ${bet.poolId}`
        );
        
        // Update the user's wallet balance
        await updateWalletBalance(bet.playerId, -poolData.entry_fee);
        
        // Update the transaction status
        if (transaction && transaction.id) {
          await updateTransactionStatus(transaction.id, 'completed');
        }
        
        // Update the pool's current players count
        const { data: pool } = await supabase
          .from('pools')
          .select('current_players')
          .eq('id', bet.poolId)
          .single();
          
        if (pool) {
          const currentPlayers = (pool.current_players || 0) + 1;
          await supabase
            .from('pools')
            .update({ current_players: currentPlayers })
            .eq('id', bet.poolId);
        }
        
        // Mark bet as synced in local DB
        await markBetSynced(bet.id);
        successCount++;
      } catch (error) {
        console.error(`Failed to sync bet ${bet.id}:`, error);
        failedCount++;
      }
    }
    
    return { success: successCount, failed: failedCount };
  } catch (error) {
    console.error("Error syncing pending bets:", error);
    return { success: 0, failed: 0 };
  }
};

// Process and sync pending transactions
export const syncPendingTransactions = async (): Promise<{
  success: number;
  failed: number;
}> => {
  try {
    const pendingTransactions = await getAllPendingTransactions();
    let successCount = 0;
    let failedCount = 0;
    
    // Process each pending transaction
    for (const tx of pendingTransactions) {
      if (tx.synced) continue;
      
      try {
        console.log(`Syncing transaction: ${tx.id}`);
        
        // Insert transaction into database
        const { error: insertError } = await supabase
          .from('transactions')
          .insert([{
            user_id: tx.userId,
            amount: tx.amount,
            type: tx.type,
            status: tx.status || 'pending',
            description: tx.description
          }]);
          
        if (insertError) {
          console.error(`Failed to insert transaction:`, insertError);
          failedCount++;
          continue;
        }
        
        // If it's a wallet update transaction, update the user's balance
        if (tx.type === 'deposit' || tx.type === 'withdrawal' || 
            tx.type === 'game_entry' || tx.type === 'game_win' || 
            tx.type === 'refund') {
          await updateWalletBalance(tx.userId, tx.amount);
        }
        
        // Mark as synced in local DB
        await markTransactionSynced(tx.id);
        successCount++;
      } catch (error) {
        console.error(`Failed to sync transaction ${tx.id}:`, error);
        failedCount++;
      }
    }
    
    return { success: successCount, failed: failedCount };
  } catch (error) {
    console.error("Error syncing pending transactions:", error);
    return { success: 0, failed: 0 };
  }
};

// Main synchronization function that orchestrates all sync operations
export const syncAllOfflineData = async (): Promise<{
  bets: { success: number; failed: number };
  transactions: { success: number; failed: number };
}> => {
  if (!navigator.onLine) {
    console.log("Cannot sync while offline");
    return {
      bets: { success: 0, failed: 0 },
      transactions: { success: 0, failed: 0 }
    };
  }

  console.log("Starting comprehensive data synchronization");
  
  try {
    // Sync bets
    const betsResult = await syncPendingBets();
    
    // Sync transactions
    const transactionsResult = await syncPendingTransactions();
    
    // Clean up synced items to free up space
    await cleanupSyncedItems();
    
    console.log("Synchronization complete:", {
      bets: betsResult,
      transactions: transactionsResult
    });
    
    return {
      bets: betsResult,
      transactions: transactionsResult
    };
  } catch (error) {
    console.error("Error during comprehensive sync:", error);
    
    toast({
      title: "Sync Error",
      description: "An error occurred during synchronization. Some data may not have been synced.",
      variant: "destructive"
    });
    
    return {
      bets: { success: 0, failed: 0 },
      transactions: { success: 0, failed: 0 }
    };
  }
};

// Register service worker for background sync
export const registerBackgroundSync = async (): Promise<boolean> => {
  if (!('serviceWorker' in navigator) || !('SyncManager' in window)) {
    console.log("Background sync not supported");
    return false;
  }
  
  try {
    const registration = await navigator.serviceWorker.ready;
    
    if (hasBackgroundSync(registration)) {
      // Register different sync tags for different types of operations
      await registration.sync.register('betster-bet-sync');
      await registration.sync.register('betster-transaction-sync');
      await registration.sync.register('betster-data-sync');
      
      console.log("Background sync registered");
      return true;
    }
    
    return false;
  } catch (error) {
    console.error("Error registering background sync:", error);
    return false;
  }
};

// Helper function to check if background sync is supported
const hasBackgroundSync = (registration: ServiceWorkerRegistration): registration is ServiceWorkerRegistration & { sync: { register(tag: string): Promise<void> } } => {
  return 'sync' in registration;
};

// Update Service Worker registration to add background sync
export const updateServiceWorkerForSync = async (): Promise<void> => {
  // This function should be called when the app loads to ensure
  // the service worker is properly registered with sync capabilities
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('ServiceWorker registration successful with scope:', registration.scope);
      
      // Set up background sync if supported
      await registerBackgroundSync();
    } catch (error) {
      console.error('ServiceWorker registration failed:', error);
    }
  }
};
