
export interface User {
  id: string;
  username: string;
  wallet: number; // Kept for compatibility but not actively used
  email?: string;
  photoURL?: string;
  role?: 'admin' | 'user';
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isBetaVersion: boolean;
  isInitialized: boolean;
  login: (username: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  signUp: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUserData: () => Promise<void>;
  isAdmin: boolean;
  addFakeMoney: (amount: number, optimistic?: boolean) => Promise<number | void>;
  withdrawFakeMoney: (amount: number, optimistic?: boolean) => Promise<number | void>;
}
