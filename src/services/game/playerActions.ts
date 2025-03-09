
import { supabase } from './apiClient';

// Update a player's selected number for a game
export const lockNumber = async (poolId: string, playerId: string, selectedNumber: number): Promise<void> => {
  // First update the selectedNumber
  const { error: error1 } = await supabase
    .from('game_pools')
    .update({
      player_data: JSON.stringify({
        selectedNumber: selectedNumber
      })
    })
    .match({ pool_id: poolId, player_id: playerId });
    
  if (error1) throw error1;
  
  // Then update the locked status
  const { error: error2 } = await supabase
    .from('game_pools')
    .update({
      player_data: JSON.stringify({
        locked: true
      })
    })
    .match({ pool_id: poolId, player_id: playerId });
    
  if (error2) throw error2;
};
