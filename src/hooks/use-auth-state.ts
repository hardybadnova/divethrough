
import { useState, useEffect } from 'react';
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
