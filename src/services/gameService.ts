
import { supabase } from '@/lib/supabase/client';
import { Player, Pool, Winner } from '@/types/game';

// Join a specific game pool
export const joinGamePool = async (poolId: string, player: Player): Promise<void> => {
  const { error } = await supabase
    .from('game_pools')
    .upsert([
      {
        pool_id: poolId,
        player_id: player.id,
        player_data: player
      }
    ]);
  
  if (error) throw error;
  
  // Update current players count
  const { data: pool } = await supabase
    .from('pools')
    .select('current_players')
    .eq('id', poolId)
    .single();
    
  if (pool) {
    const currentPlayers = (pool.current_players || 0) + 1;
    await supabase
      .from('pools')
      .update({ current_players: currentPlayers })
      .eq('id', poolId);
  }
};

// Leave a specific game pool
export const leaveGamePool = async (poolId: string, playerId: string): Promise<void> => {
  // Remove player from pool
  const { error } = await supabase
    .from('game_pools')
    .delete()
    .match({ pool_id: poolId, player_id: playerId });
    
  if (error) throw error;
  
  // Update current players count
  const { data: pool } = await supabase
    .from('pools')
    .select('current_players')
    .eq('id', poolId)
    .single();
    
  if (pool) {
    const currentPlayers = Math.max(0, (pool.current_players || 0) - 1);
    await supabase
      .from('pools')
      .update({ current_players: currentPlayers })
      .eq('id', poolId);
  }
};

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
async function fetchPoolWithPlayers(poolId: string): Promise<Pool | null> {
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
async function fetchAllPools(): Promise<Pool[]> {
  const { data: poolsData, error: poolsError } = await supabase
    .from('pools')
    .select('*');
    
  if (poolsError || !poolsData) return [];
  
  // For simplicity, we're not fetching players for all pools
  // In a real implementation, you might want to batch this or fetch on demand
  return poolsData as Pool[];
}

// Update a player's selected number for a game
export const lockNumber = async (poolId: string, playerId: string, selectedNumber: number): Promise<void> => {
  const { error } = await supabase
    .from('game_pools')
    .update({
      'player_data': supabase.raw(`jsonb_set(player_data, '{selectedNumber}', '${selectedNumber}')::jsonb`),
      'player_data': supabase.raw(`jsonb_set(player_data, '{locked}', 'true')::jsonb`)
    })
    .match({ pool_id: poolId, player_id: playerId });
    
  if (error) throw error;
};

// Send a chat message in a game
export const sendChatMessage = async (poolId: string, message: { sender: string; message: string; timestamp: string }): Promise<void> => {
  const { error } = await supabase
    .from('game_chat')
    .insert([{
      pool_id: poolId,
      sender: message.sender,
      message: message.message,
      timestamp: message.timestamp
    }]);
    
  if (error) throw error;
};

// Listen for chat messages in a game
export const subscribeToChatMessages = (poolId: string, callback: (messages: any[]) => void): (() => void) => {
  // Create a subscription using Supabase realtime
  const subscription = supabase
    .channel(`chat:${poolId}`)
    .on('postgres_changes', 
      { event: 'INSERT', schema: 'public', table: 'game_chat', filter: `pool_id=eq.${poolId}` },
      () => {
        // Fetch all messages for this pool
        fetchChatMessages(poolId).then(messages => {
          callback(messages);
        });
      }
    )
    .subscribe();
  
  // Initial fetch of messages
  fetchChatMessages(poolId).then(messages => {
    callback(messages);
  });
  
  // Return unsubscribe function
  return () => {
    supabase.removeChannel(subscription);
  };
};

// Helper function to fetch chat messages for a pool
async function fetchChatMessages(poolId: string): Promise<any[]> {
  const { data, error } = await supabase
    .from('game_chat')
    .select('*')
    .eq('pool_id', poolId)
    .order('created_at', { ascending: true });
    
  if (error || !data) return [];
  return data;
}

// Set up initial mock data in Supabase (only call this once or when resetting)
export const initializeGameData = async (initialPools: Pool[]): Promise<void> => {
  // Clear existing pools first
  await supabase.from('pools').delete().neq('id', '0');
  
  // Insert new pools
  for (const pool of initialPools) {
    const { error } = await supabase
      .from('pools')
      .insert([{
        id: pool.id,
        game_type: pool.gameType,
        entry_fee: pool.entryFee,
        max_players: pool.maxPlayers,
        current_players: pool.currentPlayers,
        status: pool.status,
        number_range_min: pool.numberRange[0],
        number_range_max: pool.numberRange[1],
        play_frequency: pool.playFrequency,
      }]);
      
    if (error) {
      console.error(`Error inserting pool ${pool.id}:`, error);
      throw error;
    }
  }
};
