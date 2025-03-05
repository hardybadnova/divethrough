
export type GameType = 'bluff' | 'topspot' | 'jackpot';
export type PoolStatus = 'waiting' | 'active' | 'completed';
export type PlayerStatus = 'waiting' | 'ready' | 'playing';

export interface Player {
  id: string;
  username: string;
  status?: PlayerStatus;
  selectedNumber?: number;
  locked?: boolean;
  stats: {
    wins: number;
    totalPlayed: number;
    winRate: number;
  };
  milestones: {
    gamesPlayed: number;
    bonusPercentage: number;
    bonusAmount: number;
  };
  referrals: string[]; // IDs of users referred
  referralBonus: number;
}

export interface Pool {
  id: string;
  gameType: GameType;
  entryFee: number;
  maxPlayers: number;
  currentPlayers: number;
  status: PoolStatus;
  numberRange: [number, number]; // Range of allowed numbers
  playFrequency?: 'daily'; // For Jackpot Horse
  players?: Player[]; // Players in this pool
  startTime?: number; // Timestamp when the game starts
  endTime?: number; // Timestamp when the game ends
  winningNumber?: number; // Only revealed after game ends
}

export interface Winner {
  position: number;
  players: Player[];
  prize: number;
}

export interface ReferralInfo {
  code: string;
  referrals: number;
  totalBonus: number;
}

export interface ChatMessage {
  sender: string;
  message: string;
  timestamp: string;
}
