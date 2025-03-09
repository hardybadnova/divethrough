
import { toast } from '@/hooks/use-toast';
import { supabase } from './client';
import { getCurrentUser } from './auth';

export const createUserProfile = async (userId: string, username: string, email: string) => {
  const { error } = await supabase
    .from('user_profiles')
    .insert([
      { 
        id: userId, 
        username, 
        email,
        wallet_balance: 0
      }
    ]);
  
  if (error) throw error;
};

export const getUserProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .single();
  
  if (error) {
    console.error("Error fetching user profile:", error);
    if (error.code === 'PGRST116') {
      // No profile found - this can happen if the trigger failed
      try {
        const user = await getCurrentUser();
        if (user) {
          await createUserProfile(
            userId, 
            user.user_metadata?.username || `user_${userId.substring(0, 8)}`, 
            user.email || ''
          );
          // Try fetching again
          const { data: newData, error: newError } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', userId)
            .single();
          
          if (newError) throw newError;
          return newData;
        }
      } catch (createError) {
        console.error("Error creating missing user profile:", createError);
        throw createError;
      }
    }
    throw error;
  }
  
  return data;
};

export const updateWalletBalance = async (userId: string, amount: number) => {
  // First get current balance
  const { data: profile, error: fetchError } = await supabase
    .from('user_profiles')
    .select('wallet_balance')
    .eq('id', userId)
    .single();
  
  if (fetchError) throw fetchError;
  
  const newBalance = (profile?.wallet_balance || 0) + amount;
  
  const { error } = await supabase
    .from('user_profiles')
    .update({ wallet_balance: newBalance })
    .eq('id', userId);
  
  if (error) throw error;
  
  return newBalance;
};
