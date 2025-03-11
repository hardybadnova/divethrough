
import React from "react";
import { BarChart } from "lucide-react";
import { formatCurrency } from "@/lib/formatters";
import { Pool } from "@/types/game";

interface PremiumStatsSectionProps {
  pool: Pool;
  showStats: boolean;
  handleViewStats: () => void;
}

const PremiumStatsSection: React.FC<PremiumStatsSectionProps> = ({
  pool,
  showStats,
  handleViewStats,
}) => {
  return (
    <div className="border border-betster-600 rounded-lg p-4 bg-gradient-to-br from-betster-900 to-black">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-semibold text-betster-300 flex items-center">
          <BarChart className="h-4 w-4 mr-2" />
          Premium Game Statistics
        </h3>
        <div className="betster-chip bg-amber-500/60 text-white">
          Premium
        </div>
      </div>

      <p className="text-sm mb-4">
        Get detailed statistics from the last 10 games on this table for a
        small fee of {pool ? formatCurrency(pool.entryFee * 0.02) : "—"} (
        {pool ? "2%" : "—"} of entry fee).
      </p>

      {!showStats ? (
        <button
          className="betster-button w-full"
          onClick={handleViewStats}
        >
          Unlock Premium Stats
        </button>
      ) : (
        <StatsAnalysis />
      )}
    </div>
  );
};

const StatsAnalysis: React.FC = () => {
  return (
    <div className="space-y-4">
      <h4 className="font-medium text-center text-betster-300 border-b border-border pb-2">
        Last 10 Games Analysis
      </h4>

      <div className="space-y-3">
        <StatsRow 
          title="Most Picked Numbers"
          subtitle="Avoid these!"
          items={[
            { label: "7", percentage: 23, isGood: false },
            { label: "10", percentage: 19, isGood: false },
            { label: "4", percentage: 16, isGood: false },
            { label: "12", percentage: 15, isGood: false },
          ]}
        />

        <StatsRow 
          title="Least Picked Numbers"
          subtitle="Best choices!"
          items={[
            { label: "3", percentage: 2, isGood: true },
            { label: "15", percentage: 3, isGood: true },
            { label: "1", percentage: 4, isGood: true },
            { label: "11", percentage: 5, isGood: true },
          ]}
        />

        <WinningNumbersRow />

        <PlayerBehaviorAnalysis />
      </div>
    </div>
  );
};

interface StatsRowProps {
  title: string;
  subtitle: string;
  items: {
    label: string;
    percentage: number;
    isGood: boolean;
  }[];
}

const StatsRow: React.FC<StatsRowProps> = ({ title, subtitle, items }) => {
  const bgClass = items[0].isGood 
    ? "bg-green-900/30 border border-green-700/40" 
    : "bg-red-900/30 border border-red-700/40";

  return (
    <div>
      <div className="flex justify-between mb-1 text-sm">
        <span>{title}</span>
        <span className={items[0].isGood ? "text-betster-300" : "text-betster-300"}>
          {subtitle}
        </span>
      </div>
      <div className="flex gap-2 flex-wrap">
        {items.map((item, index) => (
          <div key={index} className={`betster-chip ${bgClass}`}>
            {item.label} ({item.percentage}%)
          </div>
        ))}
      </div>
    </div>
  );
};

const WinningNumbersRow: React.FC = () => {
  return (
    <div>
      <div className="flex justify-between mb-1 text-sm">
        <span>Winning Numbers</span>
        <span className="text-amber-400">Past winners</span>
      </div>
      <div className="bg-gradient-to-r from-betster-900 to-betster-800 rounded-md p-2 flex flex-wrap gap-2">
        <div className="betster-chip bg-amber-500/20 border border-amber-500/40">
          3
        </div>
        <div className="betster-chip bg-amber-500/20 border border-amber-500/40">
          15
        </div>
        <div className="betster-chip bg-amber-500/20 border border-amber-500/40">
          11
        </div>
        <div className="betster-chip bg-amber-500/20 border border-amber-500/40">
          1
        </div>
        <div className="betster-chip bg-amber-500/20 border border-amber-500/40">
          8
        </div>
      </div>
    </div>
  );
};

const PlayerBehaviorAnalysis: React.FC = () => {
  return (
    <div className="pt-2">
      <div className="text-sm mb-2">Player Behavior Patterns</div>
      <ul className="text-xs space-y-1 pl-4 list-disc">
        <li>
          70% of players change their number selection every game
        </li>
        <li>
          Numbers 7 and 10 are consistently overselected
        </li>
        <li>
          Most winners picked numbers in the first 30 seconds
        </li>
        <li>
          91% of winners avoided the most popular number from the
          previous game
        </li>
      </ul>
    </div>
  );
};

export default PremiumStatsSection;
