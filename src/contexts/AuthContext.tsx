import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged, 
  UserCredential,
  GoogleAuthProvider,
  type User as FirebaseUser,
  AuthError
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
  isBetaVersion: boolean;
  login: (username: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  signUp: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isBetaVersion] = useState<boolean>(true); // Mark this as beta version
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('betster-user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser && !user) {
        const newUser = {
          id: firebaseUser.uid,
          username: firebaseUser.displayName || 'Player',
          email: firebaseUser.email || undefined,
          photoURL: firebaseUser.photoURL || undefined,
          wallet: 10000,
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
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (password === 'asdfghjkl') {
        const newUser = {
          id: '1',
          username: username || 'Player',
          wallet: 10000,
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
        wallet: 10000,
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
      
      if (error.code === 'auth/unauthorized-domain') {
        const mockGoogleUser = {
          id: 'google-' + Math.random().toString(36).substring(2, 9),
          username: 'Google User',
          email: 'demo@gmail.com',
          photoURL: 'https://lh3.googleusercontent.com/a/default-user',
          wallet: 10000,
        };
        
        setUser(mockGoogleUser);
        localStorage.setItem('betster-user', JSON.stringify(mockGoogleUser));
        navigate('/dashboard');
        
        toast({
          title: "Google Sign-in Simulated",
          description: "This is a demo login since your domain isn't authorized in Firebase.",
        });
      } else {
        toast({
          title: "Google Sign-in Failed",
          description: error.message || "Something went wrong with Google authentication.",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (username: string, email: string, password: string): Promise<void> => {
    setIsLoading(true);
    try {
      const newUser = {
        id: 'user-' + Math.random().toString(36).substring(2, 9),
        username,
        email,
        wallet: 10000,
      };
      
      setUser(newUser);
      localStorage.setItem('betster-user', JSON.stringify(newUser));
      navigate('/dashboard');
      
      toast({
        title: "Welcome to Betster!",
        description: "Your account has been created successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Sign Up Failed",
        description: error.message || "Something went wrong during sign up.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    signOut(auth).catch(error => console.error("Firebase sign out error:", error));
    
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
        isBetaVersion,
        login,
        loginWithGoogle,
        signUp,
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
