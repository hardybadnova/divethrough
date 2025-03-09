
import React, { createContext, useContext, useEffect } from 'react';
import { useAuthState } from '@/hooks/use-auth-state';
import { useAuthOperations } from '@/hooks/use-auth-operations';
import { AuthContextType } from '@/types/auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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
  
  // Add effect to log auth state changes for debugging
  useEffect(() => {
    console.log("Auth context state updated:", { 
      isAuthenticated: !!user,
      isLoading,
      userId: user?.id
    });
  }, [user, isLoading]);

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
