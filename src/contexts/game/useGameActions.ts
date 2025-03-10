import { useState } from 'react';
import { toast } from "@/hooks/use-toast";
import { Player, Pool, ChatMessage } from '@/types/game';
import { 
  joinGamePool, 
  leaveGamePool, 
  lockNumber,
  sendChatMessage,
  initializeGameData 
} from '@/services/gameService';

export function useGameActions(
  pools: Pool[],
  setCurrentPool: React.Dispatch<React.SetStateAction<Pool | null>>,
  setPlayers: React.Dispatch<React.SetStateAction<Player[]>>,
  players: Player[]
) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  
  // Initialize Firebase data once if needed
  const initializeData = async () => {
    if (isInitialized || isInitializing) return;
    
    setIsInitializing(true);
    
    try {
      await initializeGameData(pools);
      setIsInitialized(true);
      console.log("Game data initialized successfully");
    } catch (error) {
      console.error("Error initializing game data:", error);
      toast({
        title: "Initialization Error",
        description: "Failed to set up game data. Please refresh and try again.",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsInitializing(false);
    }
  };

  const joinPool = async (poolId: string) => {
    const user = window.auth?.user;
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to join a pool",
        variant: "destructive"
      });
      return;
    }
    
    if (!isInitialized) {
      toast({
        title: "Please Wait",
        description: "Game is still initializing. Please try again in a moment.",
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
    
    // Check if user has enough balance
    if (user.wallet < poolToJoin.entryFee) {
      toast({
        title: "Insufficient Balance",
        description: `You need at least ${poolToJoin.entryFee} in your wallet to join this pool`,
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
      // Join the pool in Supabase - this will handle deducting the entry fee
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
      throw error;
    }
  };

  const leavePool = async () => {
    const user = window.auth?.user;
    const currentPool = window.game?.currentPool;
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
  
  const lockInNumber = async (number: number) => {
    const user = window.auth?.user;
    const currentPool = window.game?.currentPool;
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
    const user = window.auth?.user;
    const currentPool = window.game?.currentPool;
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

  const addReferral = (referralCode: string): boolean => {
    const user = window.auth?.user;
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

  const resetGame = () => {
    setCurrentPool(null);
  };

  return {
    initializeData,
    joinPool,
    leavePool,
    lockInNumber,
    sendMessage,
    addReferral,
    resetGame,
    isInitialized,
    isInitializing
  };
}
