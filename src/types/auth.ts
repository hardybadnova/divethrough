export interface User {
  id: string;
  email: string | null;
  username: string | null;
  avatarUrl: string | null;
  walletBalance: number;
  // Add other user properties as needed
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, username: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}
