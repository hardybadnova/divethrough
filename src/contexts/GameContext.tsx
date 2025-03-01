
import React, { createContext, useState, useContext } from 'react';

// Define types for our game data
interface Player {
  id: string;
  username: string;
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

interface Pool {
  id: string;
  gameType: 'bluff' | 'topspot' | 'jackpot';
  entryFee: number;
  maxPlayers: number;
  currentPlayers: number;
  status: 'waiting' | 'active' | 'completed';
  numberRange: [number, number]; // Range of allowed numbers
  playFrequency?: 'daily'; // For Jackpot Horse
}

interface Winner {
  position: number;
  players: Player[];
  prize: number;
}

interface ReferralInfo {
  code: string;
  referrals: number;
  totalBonus: number;
}

interface GameContextType {
  pools: Pool[];
  currentPool: Pool | null;
  players: Player[];
  joinPool: (poolId: string) => void;
  leavePool: () => void;
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
}

// Mock data for pools
const mockPools: Pool[] = [
  // Bluff The Tough pools
  ...([20, 50, 100, 500, 1000, 1500, 2000] as const).map((fee, index) => ({
    id: `bluff-${index}`,
    gameType: 'bluff' as const,
    entryFee: fee,
    maxPlayers: 50,
    currentPlayers: Math.floor(Math.random() * 30) + 5,
    status: 'waiting' as const,
    numberRange: [0, 15] as [number, number],
  })),
  
  // Top Spot pools
  ...([20, 50, 100, 500, 1000, 1500, 2000] as const).map((fee, index) => ({
    id: `topspot-${index}`,
    gameType: 'topspot' as const,
    entryFee: fee,
    maxPlayers: 50,
    currentPlayers: Math.floor(Math.random() * 30) + 5,
    status: 'waiting' as const,
    numberRange: [0, 15] as [number, number],
  })),
  
  // Jackpot Horse pools
  ...([20, 50] as const).map((fee, index) => ({
    id: `jackpot-${index}`,
    gameType: 'jackpot' as const,
    entryFee: fee,
    maxPlayers: 10000,
    currentPlayers: Math.floor(Math.random() * 5000) + 1000,
    status: 'waiting' as const,
    numberRange: [0, 200] as [number, number],
    playFrequency: 'daily',
  })),
];

// Milestone thresholds and bonus percentages
const milestones = [
  { threshold: 1000, bonusPercentage: 5 },
  { threshold: 5000, bonusPercentage: 10 },
  { threshold: 25000, bonusPercentage: 15 },
  { threshold: 100000, bonusPercentage: 20 },
  { threshold: 500000, bonusPercentage: 30 },
];

// Generate mock players
const generateMockPlayers = (count: number): Player[] => {
  return Array(count)
    .fill(null)
    .map((_, index) => {
      const wins = Math.floor(Math.random() * 100);
      const totalPlayed = wins + Math.floor(Math.random() * 200);
      const randomGames = Math.floor(Math.random() * 30000); // Random games played for milestones
      
      // Calculate milestone bonus
      const milestone = milestones.reduce((prev, curr) => {
        return randomGames >= curr.threshold ? curr : prev;
      }, { threshold: 0, bonusPercentage: 0 });
      
      return {
        id: `player-${index}`,
        username: `Player${index + 1}`,
        stats: {
          wins,
          totalPlayed,
          winRate: totalPlayed > 0 ? Math.round((wins / totalPlayed) * 100) : 0,
        },
        milestones: {
          gamesPlayed: randomGames,
          bonusPercentage: milestone.bonusPercentage,
          bonusAmount: Math.floor(Math.random() * 5000 * (milestone.bonusPercentage / 100)),
        },
        referrals: Array(Math.floor(Math.random() * 5))
          .fill(null)
          .map((_, i) => `referred-player-${index}-${i}`),
        referralBonus: Math.floor(Math.random() * 2000),
      };
    });
};

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [pools, setPools] = useState<Pool[]>(mockPools);
  const [currentPool, setCurrentPool] = useState<Pool | null>(null);
  const [players] = useState<Player[]>(generateMockPlayers(100));

  const joinPool = (poolId: string) => {
    const pool = pools.find(p => p.id === poolId);
    if (pool) {
      setCurrentPool(pool);
    }
  };

  const leavePool = () => {
    setCurrentPool(null);
  };

  const getPoolsByGameType = (gameType: string) => {
    return pools.filter(pool => pool.gameType === gameType);
  };
  
  const getWinners = (poolId: string): Winner[] => {
    const pool = pools.find(p => p.id === poolId);
    if (!pool) return [];
    
    const randomPlayers = () => players.slice(0, Math.floor(Math.random() * 3) + 1);
    const totalPoolAmount = pool.entryFee * pool.currentPlayers;
    const taxDeduction = totalPoolAmount * 0.28; // 28% GST
    const prizePool = totalPoolAmount - taxDeduction;
    
    const winners: Winner[] = [];
    
    // First prize winner (all game types)
    winners.push({
      position: 1,
      players: randomPlayers(),
      prize: prizePool * (pool.gameType === 'topspot' ? 0.9 : 0.5)
    });
    
    // Second and third prize for bluff and jackpot
    if (pool.gameType !== 'topspot') {
      winners.push({
        position: 2,
        players: randomPlayers(),
        prize: prizePool * 0.25
      });
      
      winners.push({
        position: 3,
        players: randomPlayers(),
        prize: prizePool * 0.15
      });
    }
    
    return winners;
  };
  
  const getMilestoneBonus = (gamesPlayed: number): number => {
    // Find the highest milestone achieved
    for (let i = milestones.length - 1; i >= 0; i--) {
      if (gamesPlayed >= milestones[i].threshold) {
        return milestones[i].bonusPercentage;
      }
    }
    return 0;
  };
  
  const getMilestoneProgress = (userId: string) => {
    const player = players.find(p => p.id === userId) || players[0];
    const gamesPlayed = player.milestones.gamesPlayed;
    
    // Find current and next milestone
    let currentMilestone = 0;
    let nextMilestone = milestones[0].threshold;
    
    for (let i = 0; i < milestones.length; i++) {
      if (gamesPlayed >= milestones[i].threshold) {
        currentMilestone = milestones[i].threshold;
        nextMilestone = i < milestones.length - 1 ? milestones[i + 1].threshold : currentMilestone;
      }
    }
    
    // Calculate progress percentage towards next milestone
    const progress = currentMilestone === nextMilestone 
      ? 100 
      : Math.min(100, Math.round(((gamesPlayed - currentMilestone) / (nextMilestone - currentMilestone)) * 100));
    
    return { currentMilestone, nextMilestone, progress };
  };
  
  const getReferralInfo = (): ReferralInfo => {
    // Mock referral info for current user
    const currentUser = players[0];
    return {
      code: `${currentUser.username.toLowerCase()}${Math.floor(Math.random() * 1000)}`,
      referrals: currentUser.referrals.length,
      totalBonus: currentUser.referralBonus,
    };
  };
  
  const addReferral = (referralCode: string): boolean => {
    // Mock adding a referral - in real app would validate the code
    // and add the referral to the database
    return referralCode.length > 0;
  };
  
  const resetGame = () => {
    // Reset game state for starting a new game
    // In a real app, this would reset more state, but for now it's simple
  };

  return (
    <GameContext.Provider
      value={{
        pools,
        currentPool,
        players,
        joinPool,
        leavePool,
        getPoolsByGameType,
        getWinners,
        resetGame,
        getMilestoneBonus,
        getReferralInfo,
        addReferral,
        getMilestoneProgress,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};
