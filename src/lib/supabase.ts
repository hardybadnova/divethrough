
import { createClient } from '@supabase/supabase-js';

// Use the actual Supabase URL and anon key
const supabaseUrl = 'https://kshozrdkansvgqfxvram.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtzaG96cmRrYW5zdmdxZnh2cmFtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDExOTU3MTIsImV4cCI6MjA1Njc3MTcxMn0.prJivme-LRY4ZCGsfocFnXqXtwcyT9cVak1S9MIgcSQ';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper functions for auth
export const signUpWithEmail = async (email: string, password: string, username: string) => {
  // First check if username is available
  const { data: existingUsers, error: checkError } = await supabase
    .from('user_profiles')
    .select('username')
    .eq('username', username)
    .single();
    
  if (existingUsers) {
    throw new Error('Username is already taken. Please choose another one.');
  }
  
  if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is "Results contain 0 rows" which is what we want
    console.error('Error checking username:', checkError);
    throw new Error('Error checking username availability. Please try again.');
  }

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
        id: userId, 
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
    .eq('id', userId)
    .single();
  
  if (error) throw error;
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
