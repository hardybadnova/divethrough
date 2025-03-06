
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://your-supabase-url.supabase.co';
const supabaseAnonKey = 'your-supabase-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper functions for auth
export const signUpWithEmail = async (email: string, password: string, username: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        username,
      },
    },
  });
  
  if (error) throw error;
  
  // If signup successful, create user profile in the database
  if (data?.user) {
    await createUserProfile(data.user.id, username, email);
  }
  
  return data;
};

export const signInWithEmail = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  if (error) throw error;
  return data;
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

export const getCurrentUser = async () => {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  return data?.user;
};

// User profile functions
export const createUserProfile = async (userId: string, username: string, email: string) => {
  const { error } = await supabase
    .from('user_profiles')
    .insert([
      { 
        user_id: userId, 
        username, 
        email,
        wallet_balance: 0,
        created_at: new Date().toISOString() 
      }
    ]);
  
  if (error) throw error;
};

export const getUserProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', userId)
    .single();
  
  if (error) throw error;
  return data;
};

export const updateWalletBalance = async (userId: string, amount: number) => {
  // First get current balance
  const { data: profile, error: fetchError } = await supabase
    .from('user_profiles')
    .select('wallet_balance')
    .eq('user_id', userId)
    .single();
  
  if (fetchError) throw fetchError;
  
  const newBalance = (profile?.wallet_balance || 0) + amount;
  
  const { error } = await supabase
    .from('user_profiles')
    .update({ wallet_balance: newBalance })
    .eq('user_id', userId);
  
  if (error) throw error;
  
  return newBalance;
};
