
export type GameType = 'bluff' | 'topspot' | 'jackpot';
export type PoolStatus = 'waiting' | 'active' | 'completed';
export type PlayerStatus = 'waiting' | 'ready' | 'playing';
export type CompetitionFormat = 'league' | 'tournament' | 'specialEvent';
export type TournamentFormat = 'knockout' | 'roundRobin' | 'swiss';
export type CompetitionStatus = 'upcoming' | 'ongoing' | 'completed';
export type MatchStatus = 'scheduled' | 'in_progress' | 'completed';

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

// Enhanced game formats
export interface League {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  entryFee: number;
  prizePool: number;
  maxParticipants: number;
  currentParticipants: number;
  gameType: string;
  status: CompetitionStatus;
  rounds: LeagueRound[];
}

export interface LeagueRound {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  pools: string[]; // IDs of the pools in this round
}

export interface Tournament {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  entryFee: number;
  prizePool: number;
  maxParticipants: number;
  currentParticipants: number;
  gameType: string;
  status: CompetitionStatus;
  format: TournamentFormat;
  rounds: TournamentRound[];
}

export interface TournamentRound {
  id: string;
  name: string;
  order: number;
  startDate: string;
  endDate: string;
  matches: TournamentMatch[];
}

export interface TournamentMatch {
  id: string;
  poolId: string;
  player1Id: string | null;
  player2Id: string | null;
  winnerId: string | null;
  status: MatchStatus;
}

export interface SpecialEvent {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  entryFee: number;
  prizePool: number;
  maxParticipants: number;
  currentParticipants: number;
  gameType: string;
  status: CompetitionStatus;
  specialRules: SpecialRule[];
  pools: string[]; // IDs of the pools in this event
}

export interface SpecialRule {
  id: string;
  name: string;
  description: string;
  effect: string;
}
