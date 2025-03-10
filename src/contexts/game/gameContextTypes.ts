
import { ChatMessage, Player, Pool, ReferralInfo, Winner } from "@/types/game";

export interface GameContextType {
  pools: Pool[];
  currentPool: Pool | null;
  players: Player[];
  chatMessages: ChatMessage[];
  joinPool: (poolId: string) => Promise<void>;
  leavePool: () => Promise<void>;
  getPoolsByGameType: (gameType: string) => Pool[];
  getWinners: (poolId: string) => Winner[];
  resetGame: () => void;
  getMilestoneBonus: (gamesPlayed: number) => number;
  getReferralInfo: () => ReferralInfo;
  addReferral: (referralCode: string) => boolean;
  getMilestoneProgress: (userId: string) => { 
    currentMilestone: number;
    nextMilestone: number;
    progress: number;
  };
  lockInNumber: (number: number) => Promise<void>;
  sendMessage: (message: string) => Promise<void>;
  initializeData: () => Promise<void>;
  
  // New enhanced game format methods
  getLeagues: () => League[];
  getTournaments: () => Tournament[];
  getSpecialEvents: () => SpecialEvent[];
  joinLeague: (leagueId: string) => Promise<void>;
  joinTournament: (tournamentId: string) => Promise<void>;
  joinSpecialEvent: (eventId: string) => Promise<void>;
  getCurrentLeague: () => League | null;
  getCurrentTournament: () => Tournament | null;
  getCurrentSpecialEvent: () => SpecialEvent | null;
}

// New types for enhanced game formats
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
  status: 'upcoming' | 'ongoing' | 'completed';
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
  status: 'upcoming' | 'ongoing' | 'completed';
  format: 'knockout' | 'roundRobin' | 'swiss';
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
  status: 'scheduled' | 'in_progress' | 'completed';
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
  status: 'upcoming' | 'ongoing' | 'completed';
  specialRules: SpecialRule[];
  pools: string[]; // IDs of the pools in this event
}

export interface SpecialRule {
  id: string;
  name: string;
  description: string;
  effect: string;
}

// Global window extensions for game context
export interface GameWindowExtensions {
  game?: {
    currentPool: Pool | null;
    currentLeague?: League | null;
    currentTournament?: Tournament | null;
    currentSpecialEvent?: SpecialEvent | null;
  };
  auth?: {
    user: {
      id: string;
      username?: string;
      wallet: number;
    } | null;
  };
}

// Add type to window object
declare global {
  interface Window extends GameWindowExtensions {}
}
