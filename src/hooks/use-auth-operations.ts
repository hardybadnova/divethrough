
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { 
  signInWithEmail, 
  signUpWithEmail, 
  signOut as supabaseSignOut,
  signInWithGoogle,
  supabase
} from '@/lib/supabase';
import { User } from '@/types/auth';

interface AuthOperationsProps {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  loadUserData: () => Promise<void>;
}

export const useAuthOperations = ({ 
  user, 
  setUser, 
  setIsLoading,
  loadUserData
}: AuthOperationsProps) => {
  const navigate = useNavigate();

  const login = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    
    try {
      const { user: authUser } = await signInWithEmail(email, password);
      
      if (!authUser) {
        throw new Error("Login failed - no user returned");
      }
      
      toast({
        title: "Welcome to Numbet!",
        description: "You've successfully logged in.",
      });
      
      // loadUserData and navigation will be handled by the onAuthStateChange event
    } catch (error: any) {
      console.error("Login error:", error);
      
      toast({
        title: "Authentication failed",
        description: error.message || "Invalid credentials. Please try again.",
        variant: "destructive",
      });
      throw error; // Rethrow for the component to handle
    } finally {
      setIsLoading(false);
    }
  };
  
  const loginWithGoogle = async (): Promise<void> => {
    try {
      console.log("Starting Google sign-in process from hook...");
      
      // Explicitly set the redirectTo to include the dashboard path
      const currentUrl = window.location.origin;
      const redirectUrl = `${currentUrl}/dashboard`;
      
      console.log("Using explicit redirect URL:", redirectUrl);
      
      // Call the Google sign-in function with explicit redirect
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            prompt: 'select_account'  // Force Google to show account selection
          }
        }
      });
      
      console.log("Google OAuth redirect initiated successfully");
      
      // The redirect will happen automatically
    } catch (error: any) {
      console.error("Google sign-in error:", error);
      
      toast({
        title: "Google Sign-in Failed",
        description: error.message || "Failed to initialize Google authentication. Please try again later.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const signUp = async (username: string, email: string, password: string): Promise<void> => {
    setIsLoading(true);
    try {
      await signUpWithEmail(email, password, username);
      
      toast({
        title: "Account Created!",
        description: "Please check your email to confirm your account.",
      });
      
      // Don't navigate automatically, let the user see the message first
    } catch (error: any) {
      console.error("Sign up error:", error);
      
      toast({
        title: "Sign Up Failed",
        description: error.message || "Something went wrong during sign up.",
        variant: "destructive",
      });
      throw error; // Rethrow for the component to handle
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    supabaseSignOut()
      .then(() => {
        setUser(null);
        localStorage.removeItem('betster-user');
        navigate('/login');
        toast({
          title: "Logged out",
          description: "You've been successfully logged out.",
        });
      })
      .catch(error => {
        console.error("Error signing out:", error);
        toast({
          title: "Error",
          description: "Failed to log out. Please try again.",
          variant: "destructive",
        });
      });
  };

  return {
    login,
    loginWithGoogle,
    signUp,
    logout
  };
};
