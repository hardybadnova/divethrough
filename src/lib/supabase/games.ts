
import { supabase } from './client';
import { updateWalletBalance } from './profiles';

export const getActiveGames = async (gameType?: string) => {
  let query = supabase
    .from('games')
    .select('*, game_players(*)')
    .eq('status', 'active');
    
  if (gameType) {
    query = query.eq('game_type', gameType);
  }
  
  const { data, error } = await query;
  
  if (error) throw error;
  return data;
};

export const joinGame = async (gameId: string, userId: string, selectedNumber: number) => {
  // Check if the user has enough balance
  const { data: game } = await supabase
    .from('games')
    .select('entry_fee')
    .eq('id', gameId)
    .single();
    
  if (!game) {
    throw new Error('Game not found');
  }
  
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('wallet_balance')
    .eq('id', userId)
    .single();
    
  if (!profile || profile.wallet_balance < game.entry_fee) {
    throw new Error('Insufficient balance to join game');
  }
  
  // Join the game
  const { data, error } = await supabase
    .from('game_players')
    .insert([
      {
        game_id: gameId,
        user_id: userId,
        selected_number: selectedNumber
      }
    ])
    .select()
    .single();
    
  if (error) throw error;
  
  // Deduct entry fee from wallet
  await updateWalletBalance(userId, -game.entry_fee);
  
  return data;
};
