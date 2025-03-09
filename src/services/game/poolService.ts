
import { supabase } from '@/lib/supabase/client';
import { Pool } from '@/types/game';

// Join a specific game pool
export const joinGamePool = async (poolId: string, player: any): Promise<void> => {
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
