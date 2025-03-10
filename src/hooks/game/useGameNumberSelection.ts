
import { useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import { useGame } from "@/contexts/GameContext";
import { useAuth } from "@/contexts/AuthContext";
import { Pool } from "@/types/game";

interface UseGameNumberSelectionProps {
  pool: Pool | undefined;
  gameState: "pre-game" | "in-progress" | "completed";
}

export function useGameNumberSelection({ pool, gameState }: UseGameNumberSelectionProps) {
  const { lockInNumber } = useGame();
  const { user } = useAuth();
  
  const [selectedNumber, setSelectedNumber] = useState<number | null>(null);
  const [isLocked, setIsLocked] = useState(false);

  // Check if the player has already locked in a number
  useEffect(() => {
    if (pool && user) {
      const currentPlayer = pool.players?.find((p) => p.id === user.id);
      if (currentPlayer && currentPlayer.locked && currentPlayer.selectedNumber !== undefined) {
        setSelectedNumber(currentPlayer.selectedNumber);
        setIsLocked(true);
      }
    }
  }, [pool, user]);

  // Handle number selection
  const handleNumberSelect = (number: number) => {
    if (gameState !== "in-progress" || isLocked) return;
    setSelectedNumber(number);
    
    toast({
      title: `Number ${number} Selected`,
      description: "Lock it in to confirm your selection",
    });
  };
  
  // Handle locking in a number
  const handleLockNumber = async () => {
    if (!selectedNumber || gameState !== "in-progress" || isLocked) return;
    
    try {
      await lockInNumber(selectedNumber);
      setIsLocked(true);
    } catch (error) {
      console.error("Error locking number:", error);
      toast({
        title: "Error",
        description: "Failed to lock in your number. Please try again.",
        variant: "destructive"
      });
    }
  };

  return {
    selectedNumber,
    isLocked,
    handleNumberSelect,
    handleLockNumber,
  };
}
