import { createClient } from '@supabase/supabase-js';
import { toast } from '@/hooks/use-toast';

// Use the actual Supabase URL and anon key
const supabaseUrl = 'https://kshozrdkansvgqfxvram.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtzaG96cmRrYW5zdmdxZnh2cmFtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDExOTU3MTIsImV4cCI6MjA1Njc3MTcxMn0.prJivme-LRY4ZCGsfocFnXqXtwcyT9cVak1S9MIgcSQ';

// Create the Supabase client with the Site URL matching localhost:8080
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
    storage: localStorage,
    storageKey: 'betster-auth-token',
  },
});

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
      emailRedirectTo: window.location.origin + '/dashboard',
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

// Transaction functions
export const createTransaction = async (userId: string, amount: number, type: 'deposit' | 'withdrawal', paymentId?: string) => {
  const { data, error } = await supabase
    .from('transactions')
    .insert([
      {
        user_id: userId,
        amount,
        type,
        status: 'pending',
        payment_id: paymentId
      }
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateTransactionStatus = async (transactionId: string, status: 'completed' | 'failed', transactionReceipt?: string) => {
  const { data, error } = await supabase
    .from('transactions')
    .update({ 
      status, 
      transaction_id: transactionReceipt,
      updated_at: new Date().toISOString()
    })
    .eq('id', transactionId)
    .select()
    .single();

  if (error) throw error;
  
  // If transaction is completed and it's a deposit, update wallet balance
  if (status === 'completed') {
    const { data: transaction } = await supabase
      .from('transactions')
      .select('user_id, amount, type')
      .eq('id', transactionId)
      .single();
    
    if (transaction) {
      if (transaction.type === 'deposit') {
        await updateWalletBalance(transaction.user_id, transaction.amount);
      } else if (transaction.type === 'withdrawal') {
        await updateWalletBalance(transaction.user_id, -transaction.amount);
      }
    }
  }
  
  return data;
};

export const getUserTransactions = async (userId: string) => {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

// Game functions
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

export const createReferral = async (referrerId: string, referredEmail: string) => {
  // Generate a signup link with referrer ID
  const signupLink = `${window.location.origin}/signup?ref=${referrerId}`;
  
  // TODO: In real world, we would send an email to referredEmail with the signupLink
  // For now, we'll just return the link
  toast({
    title: "Referral Created",
    description: `A referral link has been generated. In a real app, this would be sent to ${referredEmail}.`,
  });
  
  return signupLink;
};

export const processReferralBonus = async (referrerId: string, newUserId: string) => {
  const bonusAmount = 10; // $10 bonus for referral
  
  const { data, error } = await supabase
    .from('referrals')
    .insert([
      {
        referrer_id: referrerId,
        referred_id: newUserId,
        bonus_amount: bonusAmount
      }
    ]);
    
  if (error) throw error;
  
  // Add bonus to referrer's wallet
  await updateWalletBalance(referrerId, bonusAmount);
  
  return { success: true, bonusAmount };
};
