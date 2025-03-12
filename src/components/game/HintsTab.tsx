
import React from "react";
import { Pool } from "@/types/game";
import GameStrategies from "./hints/GameStrategies";
import ProbabilityInsight from "./hints/ProbabilityInsight";

interface HintsTabProps {
  pool: Pool;
}

const HintsTab: React.FC<HintsTabProps> = ({
  pool,
}) => {
  return (
    <div className="space-y-4">
      <div className="glass-card rounded-xl p-6">
        <h2 className="text-xl font-medium mb-4">Game Tips & Strategies</h2>

        <GameStrategies pool={pool} />
        <ProbabilityInsight />
      </div>
    </div>
  );
};

export default HintsTab;
