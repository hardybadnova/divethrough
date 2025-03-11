
import { useState } from "react";
import { Pool } from "@/types/game";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

export type GameTabType = "game" | "chat" | "hints";

interface UseGameTabsProps {
  pool: Pool | null;
  setShowStats: React.Dispatch<React.SetStateAction<boolean>>;
  setStatsCharged: React.Dispatch<React.SetStateAction<boolean>>;
  statsCharged: boolean;
}

export function useGameTabs({ 
  pool, 
  setShowStats, 
  setStatsCharged, 
  statsCharged 
}: UseGameTabsProps) {
  const [activeTab, setActiveTab] = useState<GameTabType>("game");

  const handleViewStats = () => {
    // If stats are already charged, show them immediately
    if (statsCharged) {
      setShowStats(true);
      return;
    }
    
    // Make sure pool exists
    if (!pool) return;
    
    // Calculate the stats fee
    const statsFee = pool.entryFee * 0.02;
    
    // Show confirmation toast with payment option
    toast({
      title: "Stats Access Fee",
      description: `View detailed stats from the last 10 games for ${statsFee}?`,
      action: (
        <Button 
          variant="secondary"
          className="px-3 py-1 text-xs"
          onClick={() => {
            setStatsCharged(true);
            setShowStats(true);
            toast({
              title: "Stats Unlocked", 
              description: "You now have access to the last 10 games statistics"
            });
          }}
        >
          Pay Fee
        </Button>
      ),
    });
  };

  return {
    activeTab,
    setActiveTab,
    handleViewStats
  };
}
