
import React, { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from '../AuthContext';
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
import { Player, Pool, ChatMessage } from '@/types/game';
import { GameContextType } from './types';
import { mockPools } from './mockData';
import { getMilestoneBonus, getMilestoneProgress } from './milestones';
import { getPoolsByGameType, getWinners, getReferralInfo } from './gameUtils';

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
        getPoolsByGameType: (gameType) => getPoolsByGameType(pools, gameType),
        getWinners: (poolId) => getWinners(pools, poolId),
        resetGame,
        getMilestoneBonus,
        getReferralInfo: () => getReferralInfo(players, user?.id),
        addReferral,
        getMilestoneProgress: (userId) => getMilestoneProgress(players, userId),
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
