
import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { 
  signInWithEmail, 
  signUpWithEmail, 
  signOut as supabaseSignOut, 
  getCurrentUser,
  getUserProfile,
  supabase
} from '@/lib/supabase';

interface User {
  id: string;
  username: string;
  wallet: number;
  email?: string;
  photoURL?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isBetaVersion: boolean;
  login: (username: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  signUp: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isBetaVersion] = useState<boolean>(true); // Mark this as beta version
  const navigate = useNavigate();

  const loadUserData = async () => {
    try {
      const currentUser = await getCurrentUser();
      if (currentUser) {
        try {
          const profile = await getUserProfile(currentUser.id);
          
          const newUser = {
            id: currentUser.id,
            username: profile.username || currentUser.user_metadata?.username || 'Player',
            email: currentUser.email || undefined,
            photoURL: currentUser.user_metadata?.avatar_url,
            wallet: profile.wallet_balance || 0,
          };
          
          setUser(newUser);
          localStorage.setItem('betster-user', JSON.stringify(newUser));
        } catch (error: any) {
          console.error("Error loading user profile:", error);
          // We still set a basic user if the profile fetch fails
          const newUser = {
            id: currentUser.id,
            username: currentUser.user_metadata?.username || 'Player',
            email: currentUser.email || undefined,
            photoURL: currentUser.user_metadata?.avatar_url,
            wallet: 0,
          };
          
          setUser(newUser);
          localStorage.setItem('betster-user', JSON.stringify(newUser));
        }
      } else {
        setUser(null);
        localStorage.removeItem('betster-user');
      }
    } catch (error) {
      console.error("Error loading user data:", error);
      setUser(null);
      localStorage.removeItem('betster-user');
    } finally {
      setIsLoading(false);
    }
  };

  const refreshUserData = async () => {
    if (!user) return;
    
    try {
      const currentUser = await getCurrentUser();
      if (currentUser) {
        try {
          const profile = await getUserProfile(currentUser.id);
          
          setUser(prev => {
            if (!prev) return null;
            
            const updated = {
              ...prev,
              wallet: profile.wallet_balance || 0,
            };
            
            localStorage.setItem('betster-user', JSON.stringify(updated));
            return updated;
          });
        } catch (error) {
          console.error("Error refreshing user profile:", error);
        }
      }
    } catch (error) {
      console.error("Error refreshing user data:", error);
    }
  };

  useEffect(() => {
    const storedUser = localStorage.getItem('betster-user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    
    loadUserData();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state changed:", event, session ? "User session exists" : "No session");
        if (event === 'SIGNED_IN' && session) {
          await loadUserData();
          navigate('/dashboard');
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          localStorage.removeItem('betster-user');
        }
      }
    );
    
    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  const login = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    
    try {
      const { user: authUser } = await signInWithEmail(email, password);
      
      if (!authUser) {
        throw new Error("Login failed - no user returned");
      }
      
      toast({
        title: "Welcome to Betster!",
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
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin + '/dashboard',
        },
      });
      
      if (error) throw error;
      
      // For Google OAuth, we don't need to navigate or set user since the redirect will happen
    } catch (error: any) {
      console.error("Google sign-in error:", error);
      
      toast({
        title: "Google Sign-in Failed",
        description: error.message || "Something went wrong with Google authentication.",
        variant: "destructive",
      });
      throw error; // Rethrow for the component to handle
    } finally {
      setIsLoading(false);
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

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        isBetaVersion,
        login,
        loginWithGoogle,
        signUp,
        logout,
        refreshUserData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
