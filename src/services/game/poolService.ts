
import { supabase } from '@/lib/supabase/client';
import { Pool } from '@/types/game';

// Join a specific game pool
export const joinGamePool = async (poolId: string, player: any): Promise<void> => {
  console.log(`Attempting to join pool ${poolId} with player:`, player);
  
  try {
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
      throw error;
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

// Leave a specific game pool
export const leaveGamePool = async (poolId: string, playerId: string): Promise<void> => {
  console.log(`Attempting to leave pool ${poolId} with player ID:`, playerId);
  
  try {
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
