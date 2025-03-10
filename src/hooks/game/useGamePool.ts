
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { useGame } from "@/contexts/GameContext";
import { Pool } from "@/types/game";

interface UseGamePoolProps {
  poolId: string | undefined;
  setIsJoining: React.Dispatch<React.SetStateAction<boolean>>;
  setIsLeaving: React.Dispatch<React.SetStateAction<boolean>>;
}

export function useGamePool({ poolId, setIsJoining, setIsLeaving }: UseGamePoolProps) {
  const navigate = useNavigate();
  const { pools, joinPool, leavePool, currentPool, initializeData } = useGame();
  
  const hasInitialized = useRef(false);
  const hasJoinedPool = useRef(false);
  const actionDebounce = useRef({
    join: false,
    leave: false,
  });
  
  const pool = currentPool || pools.find((p) => p.id === poolId);
  const [gameUrl, setGameUrl] = useState("");

  // Initialize game data once
  useEffect(() => {
    if (!hasInitialized.current) {
      console.log("Initializing game data");
      initializeData().catch(console.error);
      hasInitialized.current = true;
    }
  }, [initializeData]);
  
  // Join the current pool
  useEffect(() => {
    if (!pool || !poolId || hasJoinedPool.current) {
      return;
    }

    const joinCurrentPool = async () => {
      try {
        console.log("Joining pool:", poolId);
        setIsJoining(true);
        hasJoinedPool.current = true;
        await joinPool(poolId);
        
        const baseUrl = window.location.origin;
        setGameUrl(`${baseUrl}/game/${poolId}`);
      } catch (error) {
        console.error("Failed to join pool:", error);
        toast({
          title: "Error",
          description: "Failed to join the game. Please try again.",
          variant: "destructive"
        });
        hasJoinedPool.current = false;
      } finally {
        setIsJoining(false);
      }
    };

    if (!pool) {
      console.log("No pool found, navigating to dashboard");
      navigate('/dashboard');
      return;
    }
    
    joinCurrentPool();
  }, [pool, poolId, joinPool, navigate, setIsJoining]);
  
  // Safely leave the pool
  const safeLeavePool = async () => {
    if (actionDebounce.current.leave || !hasJoinedPool.current) return;
    
    try {
      actionDebounce.current.leave = true;
      setIsLeaving(true);
      await leavePool();
      hasJoinedPool.current = false;
    } catch (error) {
      console.error("Error leaving pool:", error);
    } finally {
      setIsLeaving(false);
      setTimeout(() => {
        actionDebounce.current.leave = false;
      }, 1000);
    }
  };
  
  // Clean up when unmounting
  useEffect(() => {
    return () => {
      if (hasJoinedPool.current) {
        console.log("Component unmounting, cleaning up and leaving pool");
        safeLeavePool();
      }
    };
  }, []);
  
  // Confirm exit handler
  const confirmExit = async () => {
    await safeLeavePool();
    navigate(`/pools/${pool?.gameType}`);
  };
  
  // Change table handler
  const handleChangeTable = async () => {
    await safeLeavePool();
    navigate(`/pools/${pool?.gameType}`);
  };
  
  return {
    pool,
    gameUrl,
    safeLeavePool,
    confirmExit,
    handleChangeTable,
    hasJoinedPool,
  };
}
