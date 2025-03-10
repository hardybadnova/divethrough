
import { supabase } from '@/lib/supabase/client';
import { Pool } from '@/types/game';
import { updateWalletBalance } from '@/lib/supabase/profiles';

// Join a specific game pool
export const joinGamePool = async (poolId: string, player: any): Promise<void> => {
  console.log(`Attempting to join pool ${poolId} with player:`, player);
  
  try {
    // Get pool details to know the entry fee
    const { data: poolData, error: poolError } = await supabase
      .from('pools')
      .select('entry_fee')
      .eq('id', poolId)
      .single();
      
    if (poolError) {
      console.error("Error fetching pool data:", poolError);
      throw poolError;
    }
    
    const entryFee = poolData.entry_fee;
    
    // Deduct entry fee from user's wallet
    await updateWalletBalance(player.id, -entryFee);
    console.log(`Deducted ${entryFee} from user ${player.id}'s wallet`);
    
    // Insert player into game pool
    const { error } = await supabase
      .from('game_pools')
      .upsert([
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
      throw error;
    }
    
    // Log the transaction
    const { error: transactionError } = await supabase
      .from('transactions')
      .insert([{
        user_id: player.id,
        amount: entryFee,
        type: 'game_entry',
        status: 'completed',
        payment_id: `game_entry_${Date.now()}`,
      }]);
      
    if (transactionError) {
      console.error("Error logging transaction:", transactionError);
    }
    
    // Update current players count
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
    
    console.log(`Successfully joined pool ${poolId}`);
  } catch (error) {
    console.error("Error in joinGamePool:", error);
    throw error;
  }
};

// Handle game result and distribute winnings
export const processGameResult = async (poolId: string, winningPlayers: string[], prizeAmount: number): Promise<void> => {
  try {
    // Update each winning player's wallet
    for (const playerId of winningPlayers) {
      // Add prize to winner's wallet
      await updateWalletBalance(playerId, prizeAmount);
      
      // Log the winning transaction
      await supabase
        .from('transactions')
        .insert([{
          user_id: playerId,
          amount: prizeAmount,
          type: 'game_winning',
          status: 'completed',
          payment_id: `game_winning_${poolId}_${Date.now()}`,
        }]);
        
      console.log(`Added ${prizeAmount} to winner ${playerId}'s wallet`);
    }
    
    // Mark players as winners in the game_pools table
    for (const playerId of winningPlayers) {
      await supabase
        .from('game_pools')
        .update({ 
          player_data: supabase.raw('jsonb_set(player_data, \'{isWinner}\', \'true\')')
        })
        .eq('pool_id', poolId)
        .eq('player_id', playerId);
    }
    
    console.log(`Successfully processed game results for pool ${poolId}`);
  } catch (error) {
    console.error("Error processing game results:", error);
    throw error;
  }
};

// Leave a specific game pool
export const leaveGamePool = async (poolId: string, playerId: string): Promise<void> => {
  console.log(`Attempting to leave pool ${poolId} with player ID:`, playerId);
  
  try {
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
      await updateWalletBalance(playerId, refundAmount);
      
      // Log the refund transaction
      await supabase
        .from('transactions')
        .insert([{
          user_id: playerId,
          amount: refundAmount,
          type: 'game_refund',
          status: 'completed',
          payment_id: `game_refund_${Date.now()}`,
        }]);
        
      console.log(`Refunded ${refundAmount} to user ${playerId}'s wallet`);
    }
    
    // Remove player from pool
    const { error } = await supabase
      .from('game_pools')
      .delete()
      .match({ pool_id: poolId, player_id: playerId });
      
    if (error) {
      console.error("Error leaving game pool:", error);
      throw error;
    }
    
    // Update current players count
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
  }
};
