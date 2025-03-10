
export interface User {
  id: string;
  username?: string;
  email?: string;
  wallet: number;
  createdAt?: string;
  updatedAt?: string;
  isVerified?: boolean;
  referralCode?: string;
}
