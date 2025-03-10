import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuthState } from '@/hooks/use-auth-state';
import { useAuthOperations } from '@/hooks/use-auth-operations';
import { AuthContextType } from '@/types/auth';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';
import { initializeDeposit, initiateWithdrawal } from '@/services/paymentService';

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
  
  // Fixed wallet functionality to match return type in interface
  const addFakeMoney = async (amount: number, optimistic?: boolean): Promise<number | void> => {
    if (!user?.id) {
      toast({
        title: "Authentication Required",
        description: "Please log in to add money",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const result = await initializeDeposit(user.id, amount);
      if (result.success) {
        await refreshUserData();
        // Return the updated wallet amount as per interface
        return user?.wallet || 0;
      }
      return;
    } catch (error) {
      console.error("Error adding fake money:", error);
      return;
    }
  };
  
  // Fixed withdrawal functionality to match return type in interface
  const withdrawFakeMoney = async (amount: number, optimistic?: boolean): Promise<number | void> => {
    if (!user?.id) {
      toast({
        title: "Authentication Required",
        description: "Please log in to withdraw money",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const success = await initiateWithdrawal(user.id, amount);
      if (success) {
        await refreshUserData();
        // Return the updated wallet amount as per interface
        return user?.wallet || 0;
      }
      return;
    } catch (error) {
      console.error("Error withdrawing fake money:", error);
      return;
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
