
import React, { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { 
  subscribeToAllPools, 
  subscribeToPool, 
  subscribeToChatMessages
} from '@/services/gameService';
import { Player, Pool, ChatMessage } from '@/types/game';
import { GameContextType } from './types';
import { mockPools } from './mockData';
import { getMilestoneBonus, getMilestoneProgress } from './milestones';
import { getPoolsByGameType, getWinners, getReferralInfo } from './gameUtils';
import { useGameActions } from './useGameActions';

// Create a game context
const GameContext = createContext<GameContextType | undefined>(undefined);

// Making window.game available for useGameActions hook
declare global {
  interface Window {
    game?: {
      currentPool: Pool | null;
    };
    auth?: {
      user: {
        id: string;
        username?: string;
        wallet: number;
      } | null;
    };
  }
}

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [pools, setPools] = useState<Pool[]>(mockPools);
  const [currentPool, setCurrentPool] = useState<Pool | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  
  const {
    initializeData,
    joinPool,
    leavePool,
    lockInNumber,
    sendMessage,
    addReferral,
    resetGame
  } = useGameActions(pools, setCurrentPool, setPlayers, players);

  // Make current pool available to window for hooks
  useEffect(() => {
    window.game = { currentPool };
    window.auth = { user: user || null };
    
    return () => {
      window.game = undefined;
      window.auth = undefined;
    };
  }, [currentPool, user]);
  
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
