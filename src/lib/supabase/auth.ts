
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
    
    // Get Supabase client info
    console.log("Initiating Google OAuth with Supabase");
    console.log("Project URL:", supabase.supabaseUrl);
    
    // Use the specific client ID from your Google console
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
        queryParams: {
          // These parameters help ensure proper OAuth flow
          access_type: 'offline',
          prompt: 'consent',
        }
      }
    });
    
    if (error) {
      console.error("Google auth error details:", JSON.stringify(error));
      toast({
        title: "Google Sign-in Failed",
        description: `Error: ${error.message || "Could not initialize Google sign-in"}. Please try email login instead.`,
        variant: "destructive",
      });
      throw error;
    }
    
    console.log("Google auth process initiated successfully");
    console.log("Auth URL:", data?.url); // This will log the URL where the user is being redirected
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
