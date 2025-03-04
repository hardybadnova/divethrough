
import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged, 
  UserCredential 
} from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';

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
  login: (username: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is stored in localStorage or authenticated with Firebase
    const storedUser = localStorage.getItem('betster-user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    
    // Listen for Firebase auth state changes
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser && !user) {
        // If Firebase user exists but local user doesn't, create one
        const newUser = {
          id: firebaseUser.uid,
          username: firebaseUser.displayName || 'Player',
          email: firebaseUser.email || undefined,
          photoURL: firebaseUser.photoURL || undefined,
          wallet: 10000, // Initial 10,000 INR
        };
        
        setUser(newUser);
        localStorage.setItem('betster-user', JSON.stringify(newUser));
      }
      setIsLoading(false);
    });
    
    return () => unsubscribe();
  }, []);

  const login = async (username: string, password: string): Promise<void> => {
    setIsLoading(true);
    
    // Simulate API call
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Hard-coded authentication for demo
      if (password === 'asdfghjkl') {
        const newUser = {
          id: '1',
          username: username || 'Player',
          wallet: 10000, // Initial 10,000 INR
        };
        
        setUser(newUser);
        localStorage.setItem('betster-user', JSON.stringify(newUser));
        navigate('/dashboard');
        toast({
          title: "Welcome to Betster!",
          description: "You've successfully logged in.",
        });
      } else {
        toast({
          title: "Authentication failed",
          description: "Invalid credentials. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const loginWithGoogle = async (): Promise<void> => {
    setIsLoading(true);
    
    try {
      const result: UserCredential = await signInWithPopup(auth, googleProvider);
      const { user: firebaseUser } = result;
      
      const newUser = {
        id: firebaseUser.uid,
        username: firebaseUser.displayName || 'Player',
        email: firebaseUser.email || undefined,
        photoURL: firebaseUser.photoURL || undefined,
        wallet: 10000, // Initial 10,000 INR
      };
      
      setUser(newUser);
      localStorage.setItem('betster-user', JSON.stringify(newUser));
      navigate('/dashboard');
      
      toast({
        title: "Welcome to Betster!",
        description: "You've successfully logged in with Google.",
      });
    } catch (error: any) {
      console.error("Google sign-in error:", error);
      toast({
        title: "Google Sign-in Failed",
        description: error.message || "Something went wrong with Google authentication.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    // Sign out from Firebase if authenticated
    signOut(auth).catch(error => console.error("Firebase sign out error:", error));
    
    // Clear local user state
    setUser(null);
    localStorage.removeItem('betster-user');
    navigate('/login');
    toast({
      title: "Logged out",
      description: "You've been successfully logged out.",
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        loginWithGoogle,
        logout,
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
