
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

// Set up initial mock data in Supabase (only call this once or when resetting)
export const initializeGameData = async (initialPools: Pool[]): Promise<void> => {
  console.log("Pool Service: Initializing game data with pools:", initialPools.length);
  
  try {
    // Check if pools already exist
    const { data: existingPools, error: checkError } = await supabase
      .from('pools')
      .select('id')
      .limit(1);
    
    if (checkError) {
      console.error("Error checking for existing pools:", checkError);
      throw checkError;
    }
    
    // Only initialize if no pools exist
    if (existingPools && existingPools.length > 0) {
      console.log("Pools already exist, skipping initialization");
      return;
    }
    
    console.log("No pools found, creating initial pools:", initialPools.length);
    
    // Insert pools in batches to avoid request size limitations
    const batchSize = 10;
    for (let i = 0; i < initialPools.length; i += batchSize) {
      const batch = initialPools.slice(i, i + batchSize);
      const poolsToInsert = batch.map(pool => ({
        id: pool.id,
        game_type: pool.gameType,
        entry_fee: pool.entryFee,
        max_players: pool.maxPlayers,
        current_players: pool.currentPlayers,
        status: pool.status,
        number_range_min: pool.numberRange[0],
        number_range_max: pool.numberRange[1],
        play_frequency: pool.playFrequency,
      }));
      
      const { error } = await supabase
        .from('pools')
        .insert(poolsToInsert);
        
      if (error) {
        console.error(`Error inserting pool batch ${i}:`, error);
        throw error;
      }
      
      console.log(`Inserted batch ${i} to ${i + batch.length}`);
    }
    
    console.log("Game data initialization complete");
  } catch (error) {
    console.error("Error in initializeGameData:", error);
    throw error;
  }
};
