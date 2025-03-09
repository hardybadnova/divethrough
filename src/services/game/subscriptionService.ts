
import { supabase } from './apiClient';
import { Pool } from '@/types/game';

// Listen for changes in a specific pool
export const subscribeToPool = (poolId: string, callback: (pool: Pool) => void): (() => void) => {
  // Create a subscription using Supabase realtime
  const subscription = supabase
    .channel(`pool:${poolId}`)
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'pools', filter: `id=eq.${poolId}` },
      (payload) => {
        if (payload.new) {
          // Fetch the complete pool data with players
          fetchPoolWithPlayers(poolId).then(pool => {
            if (pool) callback(pool);
          });
        }
      }
    )
    .subscribe();
  
  // Initial fetch of pool data
  fetchPoolWithPlayers(poolId).then(pool => {
    if (pool) callback(pool);
  });
  
  // Return unsubscribe function
  return () => {
    supabase.removeChannel(subscription);
  };
};

// Helper function to fetch a pool with its players
export async function fetchPoolWithPlayers(poolId: string): Promise<Pool | null> {
  const { data: poolData, error: poolError } = await supabase
    .from('pools')
    .select('*')
    .eq('id', poolId)
    .single();
    
  if (poolError || !poolData) return null;
  
  const { data: playersData } = await supabase
    .from('game_pools')
    .select('player_data')
    .eq('pool_id', poolId);
    
  const players = playersData?.map(item => item.player_data) || [];
  
  return { ...poolData, players } as Pool;
}

// Listen for changes in all pools
export const subscribeToAllPools = (callback: (pools: Pool[]) => void): (() => void) => {
  // Create a subscription using Supabase realtime
  const subscription = supabase
    .channel('all_pools')
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'pools' },
      () => {
        // Fetch all pools when any changes
        fetchAllPools().then(pools => {
          callback(pools);
        });
      }
    )
    .subscribe();
  
  // Initial fetch of pools data
  fetchAllPools().then(pools => {
    callback(pools);
  });
  
  // Return unsubscribe function
  return () => {
    supabase.removeChannel(subscription);
  };
};

// Helper function to fetch all pools with their players
export async function fetchAllPools(): Promise<Pool[]> {
  const { data: poolsData, error: poolsError } = await supabase
    .from('pools')
    .select('*');
    
  if (poolsError || !poolsData) return [];
  
  // For simplicity, we're not fetching players for all pools
  // In a real implementation, you might want to batch this or fetch on demand
  return poolsData as Pool[];
}
