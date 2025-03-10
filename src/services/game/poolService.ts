
import { supabase } from '@/lib/supabase/client';
import { Pool } from '@/types/game';
import { updateWalletBalance } from '@/lib/supabase/profiles';
import { createTransaction, updateTransactionStatus } from '@/lib/supabase/transactions';

// Join a specific game pool with debouncing
let joiningPools = new Set<string>();

// Join a specific game pool with race condition protection
export const joinGamePool = async (poolId: string, player: any): Promise<void> => {
  // Prevent duplicate join attempts for the same pool/player combination
  const joinKey = `${poolId}-${player.id}`;
  if (joiningPools.has(joinKey)) {
    console.log(`Already joining pool ${poolId} with player ${player.id}, skipping duplicate request`);
    return;
  }
  
  try {
    joiningPools.add(joinKey);
    console.log(`Attempting to join pool ${poolId} with player:`, player);
    
    // First check if player is already in the pool
    const { data: existingPlayer } = await supabase
      .from('game_pools')
      .select('*')
      .eq('pool_id', poolId)
      .eq('player_id', player.id)
      .single();
    
    if (existingPlayer) {
      console.log(`Player ${player.id} is already in pool ${poolId}`);
      return;
    }
    
    // Get pool details to know the entry fee
    const { data: poolData, error: poolError } = await supabase
      .from('pools')
      .select('entry_fee, current_players, max_players')
      .eq('id', poolId)
      .single();
      
    if (poolError) {
      console.error("Error fetching pool data:", poolError);
      throw poolError;
    }
    
    // Check if pool is full
    if (poolData.current_players >= poolData.max_players) {
      throw new Error("Pool is full");
    }
    
    const entryFee = poolData.entry_fee;
    
    // Create a transaction record first
    const transaction = await createTransaction(
      player.id, 
      entryFee, 
      'game_entry', 
      `game_entry_${poolId}_${Date.now()}`
    );
    
    // Deduct entry fee from user's wallet - this updates the balance in the database
    await updateWalletBalance(player.id, -entryFee);
    console.log(`Deducted ${entryFee} from user ${player.id}'s wallet`);
    
    // Insert player into game pool
    const { error } = await supabase
      .from('game_pools')
      .insert([
        {
          pool_id: poolId,
          player_id: player.id,
          player_data: player,
          transaction_id: transaction?.id
        }
      ]);
    
    if (error) {
      console.error("Error joining game pool:", error);
      // If there's an error, refund the entry fee
      await updateWalletBalance(player.id, entryFee);
      
      // Update transaction as failed
      if (transaction) {
        await updateTransactionStatus(transaction.id, 'failed');
      }
      
      throw error;
    }
    
    // Update current players count with a check to prevent race conditions
    const { data: pool } = await supabase
      .from('pools')
      .select('current_players')
      .eq('id', poolId)
      .single();
      
    if (pool) {
      const currentPlayers = (pool.current_players || 0) + 1;
      const { error: updateError } = await supabase
        .from('pools')
        .update({ current_players: currentPlayers })
        .eq('id', poolId);
        
      if (updateError) {
        console.error("Error updating player count:", updateError);
      }
    }
    
    // Update transaction as completed
    if (transaction) {
      await updateTransactionStatus(transaction.id, 'completed');
    }
    
    console.log(`Successfully joined pool ${poolId}`);
  } catch (error) {
    console.error("Error in joinGamePool:", error);
    throw error;
  } finally {
    joiningPools.delete(joinKey);
  }
};

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
      
      // Create refund transaction first
      const transaction = await createTransaction(
        playerId,
        refundAmount,
        'game_refund',
        `game_refund_${poolId}_${Date.now()}`
      );
      
      // Update wallet balance
      await updateWalletBalance(playerId, refundAmount);
      
      // Mark transaction as completed
      if (transaction) {
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

// Handle game result and distribute winnings
export const processGameResult = async (poolId: string, winningPlayers: string[], prizeAmount: number): Promise<void> => {
  try {
    // Update each winning player's wallet
    for (const playerId of winningPlayers) {
      // Add prize to winner's wallet
      await updateWalletBalance(playerId, prizeAmount);
      
      // Create winning transaction
      const transaction = await createTransaction(
        playerId,
        prizeAmount,
        'game_winning',
        `game_winning_${poolId}_${Date.now()}`
      );
      
      // Mark transaction as completed
      if (transaction) {
        await updateTransactionStatus(transaction.id, 'completed');
      }
      
      console.log(`Added ${prizeAmount} to winner ${playerId}'s wallet`);
    }
    
    // Mark players as winners in the game_pools table
    for (const playerId of winningPlayers) {
      // Using jsonb_set for updating a field inside a jsonb column
      const { error } = await supabase.rpc('update_player_winner_status', { 
        p_pool_id: poolId,
        p_player_id: playerId,
        p_is_winner: true
      });
      
      if (error) {
        console.error("Error updating winner status:", error);
      }
    }
    
    console.log(`Successfully processed game results for pool ${poolId}`);
  } catch (error) {
    console.error("Error processing game results:", error);
    throw error;
  }
};
