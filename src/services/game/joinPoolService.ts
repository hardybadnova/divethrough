
import { supabase } from '@/lib/supabase/client';
import { updateWalletBalance } from '@/lib/supabase/profiles';
import { createTransaction, updateTransactionStatus } from '@/lib/supabase/transactions';

// Track pools that are in the process of being joined
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
    
    // Create a transaction record for game entry fee
    const transaction = await createTransaction(
      player.id,
      -entryFee,
      'game_entry',
      `Entry fee for pool ${poolId}`
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
          player_data: player
        }
      ]);
    
    if (error) {
      console.error("Error joining game pool:", error);
      // If there's an error, refund the entry fee
      await updateWalletBalance(player.id, entryFee);
      
      // Update transaction as failed
      if (transaction && transaction.id) {
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
    if (transaction && transaction.id) {
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
