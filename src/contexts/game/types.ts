
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
}
