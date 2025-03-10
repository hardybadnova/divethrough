
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuthState } from '@/hooks/use-auth-state';
import { useAuthOperations } from '@/hooks/use-auth-operations';
import { AuthContextType } from '@/types/auth';
import { updateWalletBalance, supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';
import { createTransaction, updateTransactionStatus } from '@/lib/supabase/transactions';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isInitialized, setIsInitialized] = useState(false);
  
  const { 
    user, 
    setUser,
    isLoading, 
    setIsLoading,
    isBetaVersion,
    loadUserData,
    refreshUserData 
  } = useAuthState();

  const { 
    login, 
    loginWithGoogle, 
    signUp, 
    logout 
  } = useAuthOperations({
    user,
    setUser,
    setIsLoading,
    loadUserData
  });
  
  // Determine if the current user is an admin
  const isAdmin = user?.role === 'admin';
  
  // Add fake money to user wallet with optimistic UI update
  const addFakeMoney = async (amount: number, optimistic = false) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You need to be logged in to add money",
        variant: "destructive"
      });
      return;
    }

    try {
      // Optimistic UI update
      if (optimistic) {
        const optimisticBalance = (user.wallet || 0) + amount;
        setUser(prev => {
          if (!prev) return null;
          return { ...prev, wallet: optimisticBalance };
        });
      }

      // Create a transaction record
      const transaction = await createTransaction(
        user.id,
        amount,
        'deposit',
        `fake_deposit_${Date.now()}`
      );
      
      // Update transaction status
      if (transaction) {
        await updateTransactionStatus(
          transaction.id,
          'completed',
          `fake_deposit_${Date.now()}`
        );
      }

      // Update wallet balance in the background
      const newBalance = await updateWalletBalance(user.id, amount);
      
      // Update local user state if not optimistic
      if (!optimistic) {
        setUser(prev => {
          if (!prev) return null;
          return { ...prev, wallet: newBalance };
        });
      } else {
        // For optimistic updates, adjust if final value is different
        if (newBalance !== (user.wallet + amount)) {
          setUser(prev => {
            if (!prev) return null;
            return { ...prev, wallet: newBalance };
          });
        }
      }
      
      return newBalance;
    } catch (error) {
      console.error("Error adding fake money:", error);
      
      // Revert optimistic update on error
      if (optimistic) {
        setUser(prev => {
          if (!prev) return null;
          return { ...prev, wallet: user.wallet };
        });
      }
      
      throw error;
    }
  };
  
  // Withdraw fake money from user wallet with optimistic UI update
  const withdrawFakeMoney = async (amount: number, optimistic = false) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You need to be logged in to withdraw money",
        variant: "destructive"
      });
      return;
    }
    
    if (user.wallet < amount) {
      toast({
        title: "Insufficient balance",
        description: "Insufficient balance",
        variant: "destructive"
      });
      return;
    }
    
    try {
      // Optimistic UI update
      if (optimistic) {
        const optimisticBalance = (user.wallet || 0) - amount;
        setUser(prev => {
          if (!prev) return null;
          return { ...prev, wallet: optimisticBalance };
        });
      }

      // Create a transaction record
      const transaction = await createTransaction(
        user.id,
        amount,
        'withdrawal',
        `fake_withdrawal_${Date.now()}`
      );
      
      // Update transaction status
      if (transaction) {
        await updateTransactionStatus(
          transaction.id,
          'completed',
          `fake_withdrawal_${Date.now()}`
        );
      }
      
      // Update wallet balance in the background
      const newBalance = await updateWalletBalance(user.id, -amount);
      
      // Update local user state if not optimistic
      if (!optimistic) {
        setUser(prev => {
          if (!prev) return null;
          return { ...prev, wallet: newBalance };
        });
      } else {
        // For optimistic updates, adjust if final value is different
        if (newBalance !== (user.wallet - amount)) {
          setUser(prev => {
            if (!prev) return null;
            return { ...prev, wallet: newBalance };
          });
        }
      }
      
      return newBalance;
    } catch (error) {
      console.error("Error withdrawing fake money:", error);
      
      // Revert optimistic update on error
      if (optimistic) {
        setUser(prev => {
          if (!prev) return null;
          return { ...prev, wallet: user.wallet };
        });
      }
      
      throw error;
    }
  };
  
  // Streamlined effect for faster initialization
  useEffect(() => {
    // Mark as initialized as soon as possible if user is loaded from storage
    if (!isInitialized && !isLoading) {
      console.log("Auth initialization complete");
      setIsInitialized(true);
    }
    
    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state change detected:", event);
        
        if (event === 'SIGNED_IN' && session) {
          await loadUserData();
        }
      }
    );
    
    return () => {
      subscription.unsubscribe();
    };
  }, [user, isLoading, isInitialized, loadUserData]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        isBetaVersion,
        isInitialized,
        login,
        loginWithGoogle,
        signUp,
        logout,
        refreshUserData,
        isAdmin,
        addFakeMoney,
        withdrawFakeMoney
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
