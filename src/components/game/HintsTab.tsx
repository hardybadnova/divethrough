
import React from "react";
import { Pool } from "@/types/game";
import GameStrategies from "./hints/GameStrategies";
import ProbabilityInsight from "./hints/ProbabilityInsight";
import PremiumStatsSection from "./hints/PremiumStatsSection";

interface HintsTabProps {
  pool: Pool;
  handleViewStats: () => void;
  showStats: boolean;
  statsCharged: boolean;
}

const HintsTab: React.FC<HintsTabProps> = ({
  pool,
  handleViewStats,
  showStats,
  statsCharged,
}) => {
  return (
    <div className="space-y-4">
      <div className="glass-card rounded-xl p-6">
        <h2 className="text-xl font-medium mb-4">Game Tips & Strategies</h2>

        <GameStrategies pool={pool} />
        <ProbabilityInsight />

        <div className="mt-6">
          <PremiumStatsSection 
            pool={pool}
            showStats={showStats}
            handleViewStats={handleViewStats}
          />
        </div>
      </div>
    </div>
  );
};

export default HintsTab;
