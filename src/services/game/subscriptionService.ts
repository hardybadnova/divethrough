
import { supabase } from '@/lib/supabase/client';
import { Pool } from '@/types/game';

// Listen for changes in a specific pool
export const subscribeToPool = (poolId: string, callback: (pool: Pool) => void): (() => void) => {
  console.log(`Subscribing to pool ${poolId}`);
  
  // Create a subscription using Supabase realtime
  const subscription = supabase
    .channel(`pool:${poolId}`)
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'pools', filter: `id=eq.${poolId}` },
      (payload) => {
        console.log(`Pool ${poolId} changed:`, payload);
        if (payload.new) {
          // Fetch the complete pool data with players
          fetchPoolWithPlayers(poolId).then(pool => {
            if (pool) {
              console.log(`Pool ${poolId} updated:`, pool);
              callback(pool);
            }
          });
        }
      }
    )
    .subscribe();
  
  // Initial fetch of pool data
  fetchPoolWithPlayers(poolId).then(pool => {
    if (pool) {
      console.log(`Initial fetch of pool ${poolId}:`, pool);
      callback(pool);
    }
  });
  
  // Return unsubscribe function
  return () => {
    console.log(`Unsubscribing from pool ${poolId}`);
    supabase.removeChannel(subscription);
  };
};

// Helper function to fetch a pool with its players
export async function fetchPoolWithPlayers(poolId: string): Promise<Pool | null> {
  console.log(`Fetching pool with players: ${poolId}`);
  
  try {
    const { data: poolData, error: poolError } = await supabase
      .from('pools')
      .select('*')
      .eq('id', poolId)
      .single();
      
    if (poolError) {
      console.error(`Error fetching pool ${poolId}:`, poolError);
      return null;
    }
    
    if (!poolData) {
      console.log(`No pool found with ID ${poolId}`);
      return null;
    }
    
    const { data: playersData, error: playersError } = await supabase
      .from('game_pools')
      .select('player_data')
      .eq('pool_id', poolId);
      
    if (playersError) {
      console.error(`Error fetching players for pool ${poolId}:`, playersError);
    }
    
    const players = playersData?.map(item => item.player_data) || [];
    console.log(`Found ${players.length} players for pool ${poolId}`);
    
    return {
      id: poolData.id,
      gameType: poolData.game_type,
      entryFee: poolData.entry_fee,
      maxPlayers: poolData.max_players,
      currentPlayers: poolData.current_players,
      status: poolData.status,
      numberRange: [poolData.number_range_min, poolData.number_range_max],
      playFrequency: poolData.play_frequency,
      players
    } as Pool;
  } catch (error) {
    console.error(`Unexpected error fetching pool ${poolId}:`, error);
    return null;
  }
}

// Listen for changes in all pools
export const subscribeToAllPools = (callback: (pools: Pool[]) => void): (() => void) => {
  console.log("Subscribing to all pools");
  
  // Create a subscription using Supabase realtime
  const subscription = supabase
    .channel('all_pools')
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'pools' },
      () => {
        console.log("Pools table changed, fetching all pools");
        // Fetch all pools when any changes
        fetchAllPools().then(pools => {
          console.log(`Fetched ${pools.length} pools after change`);
          callback(pools);
        });
      }
    )
    .subscribe();
  
  // Initial fetch of pools data
  fetchAllPools().then(pools => {
    console.log(`Initial fetch of all pools: ${pools.length} pools`);
    callback(pools);
  });
  
  // Return unsubscribe function
  return () => {
    console.log("Unsubscribing from all pools");
    supabase.removeChannel(subscription);
  };
};

// Helper function to fetch all pools with their players
export async function fetchAllPools(): Promise<Pool[]> {
  console.log("Fetching all pools");
  
  try {
    const { data: poolsData, error: poolsError } = await supabase
      .from('pools')
      .select('*');
      
    if (poolsError) {
      console.error("Error fetching pools:", poolsError);
      return [];
    }
    
    if (!poolsData || poolsData.length === 0) {
      console.log("No pools found");
      return [];
    }
    
    console.log(`Found ${poolsData.length} pools`);
    
    // Convert the Supabase response to our Pool type
    return poolsData.map(pool => ({
      id: pool.id,
      gameType: pool.game_type,
      entryFee: pool.entry_fee,
      maxPlayers: pool.max_players,
      currentPlayers: pool.current_players,
      status: pool.status,
      numberRange: [pool.number_range_min, pool.number_range_max],
      playFrequency: pool.play_frequency,
      players: []
    }));
  } catch (error) {
    console.error("Unexpected error fetching all pools:", error);
    return [];
  }
}
