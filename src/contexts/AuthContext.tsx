
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuthState } from '@/hooks/use-auth-state';
import { useAuthOperations } from '@/hooks/use-auth-operations';
import { AuthContextType } from '@/types/auth';
import { updateWalletBalance, supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';

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
  
  // Add fake money to user wallet
  const addFakeMoney = async (amount: number) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You need to be logged in to add money",
        variant: "destructive"
      });
      return;
    }

    try {
      const newBalance = await updateWalletBalance(user.id, amount);
      
      // Log the transaction
      await supabase
        .from('transactions')
        .insert([{
          user_id: user.id,
          amount,
          type: 'deposit',
          status: 'completed',
          payment_id: `fake_deposit_${Date.now()}`,
          gateway: 'fake_money'
        }]);
      
      // Update local user state
      setUser(prev => {
        if (!prev) return null;
        return { ...prev, wallet: newBalance };
      });
      
      toast({
        title: "Success",
        description: `${amount} fake money added to your wallet`,
      });
      
    } catch (error) {
      console.error("Error adding fake money:", error);
      toast({
        title: "Error",
        description: "Failed to add fake money",
        variant: "destructive"
      });
    }
  };
  
  // Withdraw fake money from user wallet
  const withdrawFakeMoney = async (amount: number) => {
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
        title: "Error",
        description: "Insufficient balance",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const newBalance = await updateWalletBalance(user.id, -amount);
      
      // Log the transaction
      await supabase
        .from('transactions')
        .insert([{
          user_id: user.id,
          amount,
          type: 'withdrawal',
          status: 'completed',
          payment_id: `fake_withdrawal_${Date.now()}`,
          gateway: 'fake_money'
        }]);
      
      // Update local user state
      setUser(prev => {
        if (!prev) return null;
        return { ...prev, wallet: newBalance };
      });
      
      toast({
        title: "Success",
        description: `${amount} fake money withdrawn from your wallet`,
      });
      
    } catch (error) {
      console.error("Error withdrawing fake money:", error);
      toast({
        title: "Error",
        description: "Failed to withdraw fake money",
        variant: "destructive"
      });
    }
  };
  
  // Add effect to log auth state changes for debugging
  useEffect(() => {
    console.log("Auth context state updated:", { 
      isAuthenticated: !!user,
      isLoading,
      userId: user?.id,
      isInitialized,
      isAdmin
    });

    // Mark as initialized after the first auth check completes
    if (!isInitialized && !isLoading) {
      setIsInitialized(true);
    }
  }, [user, isLoading, isInitialized, isAdmin]);

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
