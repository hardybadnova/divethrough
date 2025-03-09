
import { supabase } from '@/lib/supabase/client';

// Lock in a number for a player in a pool
export const lockNumber = async (poolId: string, playerId: string, number: number): Promise<void> => {
  console.log(`Locking number ${number} for player ${playerId} in pool ${poolId}`);
  
  try {
    // First get the player data
    const { data, error } = await supabase
      .from('game_pools')
      .select('player_data')
      .eq('pool_id', poolId)
      .eq('player_id', playerId)
      .single();
      
    if (error) {
      console.error("Error fetching player data:", error);
      throw error;
    }
    
    if (!data) {
      console.error("Player not found in pool");
      throw new Error("Player not found in pool");
    }
    
    // Update the player data with the selected number and locked status
    const updatedPlayerData = {
      ...data.player_data,
      selectedNumber: number,
      locked: true
    };
    
    // Update the record
    const { error: updateError } = await supabase
      .from('game_pools')
      .update({ player_data: updatedPlayerData })
      .eq('pool_id', poolId)
      .eq('player_id', playerId);
      
    if (updateError) {
      console.error("Error updating player number:", updateError);
      throw updateError;
    }
    
    console.log(`Successfully locked number ${number} for player ${playerId}`);
  } catch (error) {
    console.error("Error in lockNumber:", error);
    throw error;
  }
};
