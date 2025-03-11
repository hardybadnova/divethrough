
import React from "react";
import { Pool } from "@/types/game";

interface GameStrategiesProps {
  pool: Pool;
}

const GameStrategies: React.FC<GameStrategiesProps> = ({ pool }) => {
  if (pool?.gameType === "bluff") {
    return (
      <div className="space-y-4">
        <div className="bg-muted/50 rounded-lg p-4">
          <h3 className="font-medium mb-2 text-betster-300">
            Bluff The Tough Strategy
          </h3>
          <p className="mb-2">
            The goal is to pick the least popular number. Here are some tips:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-sm">
            <li>
              Most players tend to pick middle numbers. The extremes (lowest
              and highest) are often good choices.
            </li>
            <li>
              Think about psychology - many players avoid 13 due to
              superstition.
            </li>
            <li>Observe patterns in previous games to spot trends.</li>
          </ul>
        </div>

        <div className="bg-muted/50 rounded-lg p-4">
          <h3 className="font-medium mb-2 text-betster-300">
            Historical Data
          </h3>
          <p className="mb-2">
            Based on previous games, these numbers were least picked:
          </p>
          <div className="flex flex-wrap gap-2 mt-2">
            <span className="betster-chip">1</span>
            <span className="betster-chip">14</span>
            <span className="betster-chip">9</span>
            <span className="betster-chip">2</span>
            <span className="betster-chip">15</span>
          </div>
        </div>
      </div>
    );
  }

  if (pool?.gameType === "topspot") {
    return (
      <div className="space-y-4">
        <div className="bg-muted/50 rounded-lg p-4">
          <h3 className="font-medium mb-2 text-betster-300">
            Top Spot Strategy
          </h3>
          <p className="mb-2">
            The goal is to have one of the least chosen numbers. Tips:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-sm">
            <li>
              Only the rarest numbers will win, so think about what others
              will avoid.
            </li>
            <li>
              Numbers that appear "random" like 7 or 3 are often over-picked.
            </li>
            <li>
              Statistical analysis shows that edge numbers often win.
            </li>
          </ul>
        </div>

        <div className="bg-muted/50 rounded-lg p-4">
          <h3 className="font-medium mb-2 text-betster-300">
            Recent Winners
          </h3>
          <p className="mb-2">Winning numbers from recent games:</p>
          <div className="flex flex-wrap gap-2 mt-2">
            <span className="betster-chip">15</span>
            <span className="betster-chip">0</span>
            <span className="betster-chip">12</span>
            <span className="betster-chip">5</span>
            <span className="betster-chip">11</span>
          </div>
        </div>
      </div>
    );
  }

  if (pool?.gameType === "jackpot") {
    return (
      <div className="space-y-4">
        <div className="bg-muted/50 rounded-lg p-4">
          <h3 className="font-medium mb-2 text-betster-300">
            Jackpot Horse Strategy
          </h3>
          <p className="mb-2">
            The goal is to get closest to the secret number without going
            over:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-sm">
            <li>
              Historical data shows the secret number is often between
              120-150.
            </li>
            <li>
              Consider picking a number in the middle of the range for
              optimal chances.
            </li>
            <li>
              Balance risk vs. reward - higher numbers have more risk but
              potential for bigger reward.
            </li>
          </ul>
        </div>

        <div className="bg-muted/50 rounded-lg p-4">
          <h3 className="font-medium mb-2 text-betster-300">
            Lucky Numbers
          </h3>
          <p className="mb-2">These numbers have won most frequently:</p>
          <div className="flex flex-wrap gap-2 mt-2">
            <span className="betster-chip">127</span>
            <span className="betster-chip">142</span>
            <span className="betster-chip">138</span>
            <span className="betster-chip">156</span>
            <span className="betster-chip">119</span>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default GameStrategies;
