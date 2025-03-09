
// Re-export all functionality from the individual service files
export * from './game/poolService';
export * from './game/playerActions';
export * from './game/chatService';
export * from './game/subscriptionService';

import { supabase } from '@/lib/supabase/client';

// Function to initialize game data
export const initializeGameData = async (initialPools) => {
  try {
    console.log("Initializing game data with pools:", initialPools);
    
    // We'll use the pool service to initialize the data
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
    
    console.log("No pools found, creating initial pools");
    
    // Insert new pools in batches to avoid request size limitations
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
