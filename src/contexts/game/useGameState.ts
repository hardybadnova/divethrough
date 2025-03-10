
import { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { 
  subscribeToAllPools, 
  subscribeToPool, 
  subscribeToChatMessages
} from '@/services/gameService';
import { Player, Pool, ChatMessage } from '@/types/game';
import { mockPools } from './mockData';

export function useGameState() {
  const { user } = useAuth();
  const [pools, setPools] = useState<Pool[]>(mockPools);
  const [currentPool, setCurrentPool] = useState<Pool | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  
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

  return {
    pools,
    setPools,
    currentPool,
    setCurrentPool,
    players,
    setPlayers,
    chatMessages,
    setChatMessages,
    user
  };
}
