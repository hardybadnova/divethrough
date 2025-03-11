
import { useState } from "react";
import { Pool } from "@/types/game";
import { toast } from "@/hooks/use-toast";

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
  const [activeTab, setActiveTab] = useState("game");

  // Stats viewing handlers
  const handleViewStats = () => {
    if (statsCharged) {
      setShowStats(true);
      return;
    }
    
    if (!pool) return;
    
    const statsFee = pool.entryFee * 0.02;
    
    toast({
      title: "Stats Access Fee",
      description: `View detailed stats from the last 10 games for ${statsFee}?`,
      action: (
        <button 
          className="betster-button py-1 px-3 text-xs"
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
        </button>
      ),
    });
  };

  return {
    activeTab,
    setActiveTab,
    handleViewStats
  };
}
