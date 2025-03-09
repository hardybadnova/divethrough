
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
    
    // Get the current origin for proper redirect
    const origin = window.location.origin;
    const redirectTo = `${origin}/dashboard`;
    console.log("Using redirect URL:", redirectTo);
    console.log("Current origin:", origin);
    
    // Add debug information about the Supabase project
    console.log("Project reference:", supabase.storageUrl.split('https://')[1].split('.')[0]);
    
    // Get information about enabled auth providers
    console.log("Checking auth configuration...");
    
    // Add more debug query params to help diagnose the issue
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
          debug: 'true' // Add debug flag
        }
      }
    });
    
    if (error) {
      console.error("Google auth error details:", error);
      toast({
        title: "Google Sign-in Failed",
        description: `Error: ${error.message || "Could not initialize Google sign-in"}. Please try email login instead.`,
        variant: "destructive",
      });
      throw error;
    }
    
    console.log("Google auth process initiated successfully:", data);
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
