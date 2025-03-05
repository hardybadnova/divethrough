
import React, { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { toast } from "@/hooks/use-toast";
import { 
  subscribeToAllPools, 
  subscribeToPool, 
  joinGamePool, 
  leaveGamePool, 
  lockNumber,
  sendChatMessage,
  subscribeToChatMessages,
  initializeGameData
} from '@/services/gameService';
import { Player, Pool, Winner, ReferralInfo, ChatMessage } from '@/types/game';

// Mock data for pools - will be used to initialize Firebase if needed
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

interface GameContextType {
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

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [pools, setPools] = useState<Pool[]>(mockPools);
  const [currentPool, setCurrentPool] = useState<Pool | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Initialize Firebase data once if needed
  const initializeData = async () => {
    if (isInitialized) return;
    
    try {
      await initializeGameData(mockPools);
      setIsInitialized(true);
      toast({
        title: "Game Data Initialized",
        description: "The game data has been set up for multiplayer."
      });
    } catch (error) {
      console.error("Error initializing game data:", error);
      toast({
        title: "Initialization Error",
        description: "Failed to set up game data. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  // Subscribe to all pools when component mounts
  useEffect(() => {
    const unsubscribe = subscribeToAllPools((updatedPools) => {
      setPools(updatedPools);
    });
    
    return () => unsubscribe();
  }, []);
  
  // When user logs in, add them to the players list if they're not already there
  useEffect(() => {
    if (user && user.id) {
      const existingPlayer = players.find(p => p.id === user.id);
      
      if (!existingPlayer) {
        const newPlayer: Player = {
          id: user.id,
          username: user.username || `Player-${players.length + 1}`,
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
          status: 'waiting',
        };
        
        setPlayers(prevPlayers => [...prevPlayers, newPlayer]);
      }
    }
  }, [user, players]);

  // Subscribe to the current pool when it changes
  useEffect(() => {
    if (!currentPool) return;
    
    const unsubscribe = subscribeToPool(currentPool.id, (updatedPool) => {
      setCurrentPool(updatedPool);
    });
    
    // Subscribe to chat messages for the current pool
    const unsubscribeChat = subscribeToChatMessages(currentPool.id, (messages) => {
      setChatMessages(messages);
    });
    
    return () => {
      unsubscribe();
      unsubscribeChat();
    };
  }, [currentPool?.id]);

  const joinPool = async (poolId: string) => {
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
    
    // Find current player or create a new one
    let currentPlayer = players.find(p => p.id === user.id);
    if (!currentPlayer) {
      currentPlayer = {
        id: user.id,
        username: user.username || `Player-${Math.floor(Math.random() * 1000)}`,
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
        status: 'waiting',
      };
      setPlayers(prev => [...prev, currentPlayer!]);
    }
    
    try {
      // Join the pool in Firebase
      await joinGamePool(poolId, currentPlayer);
      
      // Set as current pool locally
      setCurrentPool(poolToJoin);
      
      // Send a system message to the chat
      await sendChatMessage(poolId, {
        sender: "System",
        message: `${currentPlayer.username} has joined the pool`,
        timestamp: new Date().toLocaleTimeString()
      });
      
      toast({
        title: "Pool Joined",
        description: `You've successfully joined the ${poolToJoin.gameType} pool`
      });
    } catch (error) {
      console.error("Error joining pool:", error);
      toast({
        title: "Error",
        description: "Failed to join the pool. Please try again.",
        variant: "destructive"
      });
    }
  };

  const leavePool = async () => {
    if (!currentPool || !user) return;
    
    try {
      // Leave the pool in Firebase
      await leaveGamePool(currentPool.id, user.id);
      
      // Send a system message to the chat
      const currentPlayer = players.find(p => p.id === user.id);
      if (currentPlayer) {
        await sendChatMessage(currentPool.id, {
          sender: "System",
          message: `${currentPlayer.username} has left the pool`,
          timestamp: new Date().toLocaleTimeString()
        });
      }
      
      // Clear current pool locally
      setCurrentPool(null);
      
      toast({
        title: "Pool Left",
        description: "You've successfully left the pool"
      });
    } catch (error) {
      console.error("Error leaving pool:", error);
      toast({
        title: "Error",
        description: "Failed to leave the pool. Please try again.",
        variant: "destructive"
      });
    }
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
    
    const currentPlayer = players.find(p => p.id === user.id);
    if (!currentPlayer) {
      return { code: "", referrals: 0, totalBonus: 0 };
    }
    
    return {
      code: `${currentPlayer.username.toLowerCase().replace(/\s+/g, "")}${user.id.substring(0, 5)}`,
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
    
    if (!referringPlayer || referringPlayer.id === user.id) {
      toast({
        title: "Invalid Referral Code",
        description: "This referral code is invalid or you cannot refer yourself",
        variant: "destructive"
      });
      return false;
    }
    
    // Check if this user is already referred
    if (referringPlayer.referrals.includes(user.id)) {
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
              referrals: [...player.referrals, user.id],
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
  
  const lockInNumber = async (number: number) => {
    if (!currentPool || !user) return;
    
    try {
      await lockNumber(currentPool.id, user.id, number);
      
      toast({
        title: "Number Locked",
        description: `You've locked in number ${number}. Good luck!`
      });
    } catch (error) {
      console.error("Error locking number:", error);
      toast({
        title: "Error",
        description: "Failed to lock your number. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  const sendMessage = async (message: string) => {
    if (!currentPool || !user || !message.trim()) return;
    
    const currentPlayer = players.find(p => p.id === user.id);
    if (!currentPlayer) return;
    
    try {
      await sendChatMessage(currentPool.id, {
        sender: currentPlayer.username,
        message: message.trim(),
        timestamp: new Date().toLocaleTimeString()
      });
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Failed to send your message. Please try again.",
        variant: "destructive"
      });
    }
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
        chatMessages,
        joinPool,
        leavePool,
        getPoolsByGameType,
        getWinners,
        resetGame,
        getMilestoneBonus,
        getReferralInfo,
        addReferral,
        getMilestoneProgress,
        lockInNumber,
        sendMessage,
        initializeData,
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
