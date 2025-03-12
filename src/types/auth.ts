
export interface User {
  id: string;
  email: string | null;
  username: string | null;
  avatarUrl: string | null;
  wallet: number;
  role?: string;
  photoURL?: string;
  walletBalance?: number;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  isBetaVersion?: boolean;
  isAdmin?: boolean;
  login?: (email: string, password: string) => Promise<void>;
  loginWithGoogle?: () => Promise<void>;
  signUp?: (email: string, password: string, username: string) => Promise<void>;
  logout?: () => Promise<void>;
  refreshUserData?: () => Promise<void>;
  addFakeMoney?: (amount: number, optimistic?: boolean) => Promise<number | void>;
  withdrawFakeMoney?: (amount: number, optimistic?: boolean) => Promise<number | void>;
  signIn?: (email: string, password: string) => Promise<void>;
  signOut?: () => Promise<void>;
  resetPassword?: (email: string) => Promise<void>;
}
