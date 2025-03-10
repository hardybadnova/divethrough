
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { 
  getCurrentUser,
  getUserProfile,
  supabase
} from '@/lib/supabase';
import { User } from '@/types/auth';

export const useAuthState = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isBetaVersion] = useState<boolean>(true);
  const navigate = useNavigate();

  // Optimized to be faster and more efficient
  const loadUserData = useCallback(async () => {
    console.log("Loading user data...");
    try {
      const currentUser = await getCurrentUser();
      
      if (currentUser) {
        try {
          // Try to load user from localStorage first for immediate UI response
          const storedUser = localStorage.getItem('betster-user');
          if (storedUser) {
            try {
              const parsedUser = JSON.parse(storedUser);
              setUser(parsedUser);
            } catch (e) {
              console.error("Error parsing stored user:", e);
            }
          }
          
          // Then load profile in background
          const profile = await getUserProfile(currentUser.id);
          
          const newUser = {
            id: currentUser.id,
            username: profile.username || currentUser.user_metadata?.username || 'Player',
            email: currentUser.email || undefined,
            photoURL: currentUser.user_metadata?.avatar_url,
            wallet: profile.wallet_balance || 0,
          };
          
          // Only update state if wallet value is different to avoid unnecessary re-renders
          setUser(prevUser => {
            if (!prevUser || prevUser.wallet !== newUser.wallet) {
              localStorage.setItem('betster-user', JSON.stringify(newUser));
              return newUser;
            }
            return prevUser;
          });
        } catch (error: any) {
          console.error("Error loading user profile:", error);
          // Fallback to basic user info
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
  }, []);

  const refreshUserData = useCallback(async () => {
    if (!user) return;
    
    try {
      const currentUser = await getCurrentUser();
      if (currentUser) {
        try {
          const profile = await getUserProfile(currentUser.id);
          
          setUser(prev => {
            if (!prev) return null;
            
            // Only update if wallet balance has changed
            if (prev.wallet === profile.wallet_balance) {
              return prev;
            }
            
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
  }, [user]);

  useEffect(() => {
    console.log("Auth state hook initialized");
    
    // Load from localStorage immediately for fast UI render
    const storedUser = localStorage.getItem('betster-user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        // Mark as not loading immediately when we have stored user
        setIsLoading(false);
        console.log("User loaded from localStorage");
      } catch (e) {
        console.error("Error parsing stored user:", e);
        localStorage.removeItem('betster-user');
      }
    }
    
    // Then verify with the backend
    loadUserData();
    
    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          await loadUserData();
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          localStorage.removeItem('betster-user');
          setIsLoading(false);
        }
      }
    );
    
    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, loadUserData]);

  return {
    user,
    setUser,
    isLoading,
    setIsLoading,
    isBetaVersion,
    loadUserData,
    refreshUserData
  };
};
