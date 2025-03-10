
import { supabase } from '@/lib/supabase/client';
import { updateWalletBalance } from '@/lib/supabase/profiles';
import { createTransaction, updateTransactionStatus } from '@/lib/supabase/transactions';

// Track pools that are in the process of being left
let leavingPools = new Set<string>();

// Leave a specific game pool with race condition protection
export const leaveGamePool = async (poolId: string, playerId: string): Promise<void> => {
  // Prevent duplicate leave attempts
  const leaveKey = `${poolId}-${playerId}`;
  if (leavingPools.has(leaveKey)) {
    console.log(`Already leaving pool ${poolId} with player ${playerId}, skipping duplicate request`);
    return;
  }
  
  try {
    leavingPools.add(leaveKey);
    console.log(`Attempting to leave pool ${poolId} with player ID:`, playerId);
    
    // Check if player is actually in the pool
    const { data: playerInPool, error: checkError } = await supabase
      .from('game_pools')
      .select('*')
      .eq('pool_id', poolId)
      .eq('player_id', playerId)
      .single();
      
    if (checkError || !playerInPool) {
      console.log(`Player ${playerId} is not in pool ${poolId}, nothing to do`);
      return;
    }
    
    // Get pool details for refund calculation
    const { data: poolData, error: poolError } = await supabase
      .from('pools')
      .select('entry_fee, status')
      .eq('id', poolId)
      .single();
      
    if (poolError) {
      console.error("Error fetching pool data:", poolError);
      throw poolError;
    }
    
    // Only refund if the game hasn't started
    if (poolData.status === 'open' || poolData.status === 'waiting') {
      // Refund entry fee (minus small fee)
      const refundAmount = poolData.entry_fee * 0.9; // 10% fee for leaving
      
      // Create refund transaction
      const transaction = await createTransaction(
        playerId,
        refundAmount,
        'refund',
        `Refund for leaving pool ${poolId} (10% fee applied)`
      );
      
      // Update wallet balance
      await updateWalletBalance(playerId, refundAmount);
      
      // Mark transaction as completed
      if (transaction && transaction.id) {
        await updateTransactionStatus(transaction.id, 'completed');
      }
      
      console.log(`Refunded ${refundAmount} to user ${playerId}'s wallet`);
    }
    
    // Remove player from pool with a single atomic operation
    const { error } = await supabase
      .from('game_pools')
      .delete()
      .match({ pool_id: poolId, player_id: playerId });
      
    if (error) {
      console.error("Error leaving game pool:", error);
      throw error;
    }
    
    // Update current players count with proper error handling
    const { data: pool } = await supabase
      .from('pools')
      .select('current_players')
      .eq('id', poolId)
      .single();
      
    if (pool) {
      const currentPlayers = Math.max(0, (pool.current_players || 0) - 1);
      const { error: updateError } = await supabase
        .from('pools')
        .update({ current_players: currentPlayers })
        .eq('id', poolId);
        
      if (updateError) {
        console.error("Error updating player count:", updateError);
      }
    }
    
    console.log(`Successfully left pool ${poolId}`);
  } catch (error) {
    console.error("Error in leaveGamePool:", error);
    throw error;
  } finally {
    leavingPools.delete(leaveKey);
  }
};
