import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { 
  signInWithEmail, 
  signUpWithEmail, 
  signOut as supabaseSignOut,
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
    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      });
      
      if (error) {
        console.error("Detailed Google sign-in error:", error);
        throw error;
      }
      
      // For Google OAuth, we don't need to navigate as the redirect will happen automatically
    } catch (error: any) {
      console.error("Google sign-in error:", error);
      
      toast({
        title: "Google Sign-in Failed",
        description: "Failed to initialize Google authentication. Please try again later.",
        variant: "destructive",
      });
      setIsLoading(false);
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
