
import React, { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { toast } from "@/components/ui/use-toast";

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
  players?: Player[]; // Players in this pool
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

type KYCDocumentType = "idCard" | "passport" | "driverLicense" | "addressProof" | "selfie";

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
    currentPlayers: Math.floor(Math.random() * 10) + 1, // Fewer players to start
    status: 'waiting' as const,
    numberRange: [0, 15] as [number, number],
    players: [] // Empty array to be filled with real players
  })),
  
  // Top Spot pools
  ...([20, 50, 100, 500, 1000, 1500, 2000] as const).map((fee, index) => ({
    id: `topspot-${index}`,
    gameType: 'topspot' as const,
    entryFee: fee,
    maxPlayers: 50,
    currentPlayers: Math.floor(Math.random() * 10) + 1, // Fewer players to start
    status: 'waiting' as const,
    numberRange: [0, 15] as [number, number],
    players: [] // Empty array to be filled with real players
  })),
  
  // Jackpot Horse pools
  ...([20, 50] as const).map((fee, index) => ({
    id: `jackpot-${index}`,
    gameType: 'jackpot' as const,
    entryFee: fee,
    maxPlayers: 10000,
    currentPlayers: Math.floor(Math.random() * 50) + 10, // Fewer players to start
    status: 'waiting' as const,
    numberRange: [0, 200] as [number, number],
    playFrequency: 'daily' as const,
    players: [] // Empty array to be filled with real players
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

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [pools, setPools] = useState<Pool[]>(mockPools);
  const [currentPool, setCurrentPool] = useState<Pool | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  
  // When user logs in, add them to the players list if they're not already there
  useEffect(() => {
    if (user && user.uid) {
      const existingPlayer = players.find(p => p.id === user.uid);
      
      if (!existingPlayer) {
        const newPlayer: Player = {
          id: user.uid,
          username: user.displayName || `Player-${players.length + 1}`,
          stats: {
            wins: 0,
            totalPlayed: 0,
            winRate: 0,
          },
          milestones: {
            gamesPlayed: 0,
            bonusPercentage: 0,
            bonusAmount: 0,
          },
          referrals: [],
          referralBonus: 0,
        };
        
        setPlayers(prevPlayers => [...prevPlayers, newPlayer]);
      }
    }
  }, [user]);

  const joinPool = (poolId: string) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to join a pool",
        variant: "destructive"
      });
      return;
    }
    
    const poolToJoin = pools.find(p => p.id === poolId);
    if (!poolToJoin) {
      toast({
        title: "Pool Not Found",
        description: "The selected pool was not found",
        variant: "destructive"
      });
      return;
    }
    
    if (poolToJoin.currentPlayers >= poolToJoin.maxPlayers) {
      toast({
        title: "Pool Full",
        description: "This pool is already at maximum capacity",
        variant: "destructive"
      });
      return;
    }
    
    // Add player to pool
    const currentPlayer = players.find(p => p.id === user.uid);
    if (!currentPlayer) {
      toast({
        title: "Player Not Found",
        description: "Your player profile couldn't be found",
        variant: "destructive"
      });
      return;
    }
    
    // Update pools with the new player
    setPools(prevPools => 
      prevPools.map(pool => 
        pool.id === poolId 
          ? { 
              ...pool, 
              players: [...(pool.players || []), currentPlayer],
              currentPlayers: pool.currentPlayers + 1 
            } 
          : pool
      )
    );
    
    setCurrentPool(poolToJoin);
    
    toast({
      title: "Pool Joined",
      description: `You've successfully joined the ${poolToJoin.gameType} pool`
    });
  };

  const leavePool = () => {
    if (!currentPool || !user) return;
    
    // Remove player from pool
    setPools(prevPools => 
      prevPools.map(pool => 
        pool.id === currentPool.id 
          ? { 
              ...pool, 
              players: (pool.players || []).filter(p => p.id !== user.uid),
              currentPlayers: Math.max(0, pool.currentPlayers - 1)
            } 
          : pool
      )
    );
    
    setCurrentPool(null);
    
    toast({
      title: "Pool Left",
      description: "You've successfully left the pool"
    });
  };

  const getPoolsByGameType = (gameType: string) => {
    return pools.filter(pool => pool.gameType === gameType);
  };
  
  const getWinners = (poolId: string): Winner[] => {
    const pool = pools.find(p => p.id === poolId);
    if (!pool || !pool.players || pool.players.length === 0) return [];
    
    // For demonstration, we'll randomly select winners
    // In a real implementation, this would be based on game results
    const shuffledPlayers = [...pool.players].sort(() => 0.5 - Math.random());
    const totalPoolAmount = pool.entryFee * pool.currentPlayers;
    const taxDeduction = totalPoolAmount * 0.28; // 28% GST
    const prizePool = totalPoolAmount - taxDeduction;
    
    const winners: Winner[] = [];
    
    // First prize winner (all game types)
    winners.push({
      position: 1,
      players: shuffledPlayers.slice(0, 1),
      prize: prizePool * (pool.gameType === 'topspot' ? 0.9 : 0.5)
    });
    
    // Second and third prize for bluff and jackpot
    if (pool.gameType !== 'topspot' && shuffledPlayers.length > 1) {
      winners.push({
        position: 2,
        players: shuffledPlayers.slice(1, 2),
        prize: prizePool * 0.25
      });
      
      if (shuffledPlayers.length > 2) {
        winners.push({
          position: 3,
          players: shuffledPlayers.slice(2, 3),
          prize: prizePool * 0.15
        });
      }
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
    const gamesPlayed = player?.milestones.gamesPlayed || 0;
    
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
    // Get referral info for current user
    if (!user) {
      return { code: "", referrals: 0, totalBonus: 0 };
    }
    
    const currentPlayer = players.find(p => p.id === user.uid);
    if (!currentPlayer) {
      return { code: "", referrals: 0, totalBonus: 0 };
    }
    
    return {
      code: `${currentPlayer.username.toLowerCase().replace(/\s+/g, "")}${user.uid.substring(0, 5)}`,
      referrals: currentPlayer.referrals.length,
      totalBonus: currentPlayer.referralBonus,
    };
  };
  
  const addReferral = (referralCode: string): boolean => {
    if (!user || !referralCode) return false;
    
    // Find the player with this referral code
    const referringPlayerUsername = referralCode.replace(/[0-9]+$/, "");
    const referringPlayer = players.find(p => 
      p.username.toLowerCase().replace(/\s+/g, "") === referringPlayerUsername
    );
    
    if (!referringPlayer || referringPlayer.id === user.uid) {
      toast({
        title: "Invalid Referral Code",
        description: "This referral code is invalid or you cannot refer yourself",
        variant: "destructive"
      });
      return false;
    }
    
    // Check if this user is already referred
    if (referringPlayer.referrals.includes(user.uid)) {
      toast({
        title: "Already Referred",
        description: "You have already been referred by this user",
        variant: "destructive"
      });
      return false;
    }
    
    // Add the referral
    setPlayers(prevPlayers => 
      prevPlayers.map(player => 
        player.id === referringPlayer.id 
          ? { 
              ...player, 
              referrals: [...player.referrals, user.uid],
              referralBonus: player.referralBonus + 50 // Add 50 bonus for referring
            } 
          : player
      )
    );
    
    toast({
      title: "Referral Applied",
      description: `You've been successfully referred by ${referringPlayer.username}`
    });
    
    return true;
  };
  
  const resetGame = () => {
    setCurrentPool(null);
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
