
import { toast } from '@/hooks/use-toast';
import { supabase } from './client';

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

export const signInWithGoogle = async () => {
  try {
    console.log("Starting Google sign-in process...");
    
    // Check if we're in development or production
    const redirectUrl = `${window.location.origin}/dashboard`;
    console.log("Redirect URL:", redirectUrl);
    
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        }
      }
    });
    
    if (error) {
      console.error("Google auth error:", error);
      toast({
        title: "Google Sign-in Failed",
        description: error.message || "Could not initialize Google sign-in. Please try again or use email login.",
        variant: "destructive",
      });
      throw error;
    }
    
    console.log("Google auth process started successfully:", data);
    return data;
  } catch (error: any) {
    console.error("Error during Google sign-in:", error);
    throw error;
  }
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
