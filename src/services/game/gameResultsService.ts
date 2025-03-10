
import { supabase } from '@/lib/supabase/client';
import { updateWalletBalance } from '@/lib/supabase/profiles';
import { createTransaction, updateTransactionStatus } from '@/lib/supabase/transactions';

// Handle game result and distribute winnings
export const processGameResult = async (poolId: string, winningPlayers: string[], prizeAmount: number): Promise<void> => {
  try {
    // Update each winning player's wallet
    for (const playerId of winningPlayers) {
      // Create winning transaction
      const transaction = await createTransaction(
        playerId,
        prizeAmount,
        'game_win',
        `Prize for winning in pool ${poolId}`
      );
      
      // Add prize to winner's wallet
      await updateWalletBalance(playerId, prizeAmount);
      
      // Mark transaction as completed
      if (transaction && transaction.id) {
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
