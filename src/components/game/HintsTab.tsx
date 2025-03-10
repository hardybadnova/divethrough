
import React, { useState } from "react";
import { Info, BarChart, HelpCircle, Sparkles } from "lucide-react";
import { formatCurrency } from "@/lib/formatters";
import { Pool } from "@/types/game";

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

        {pool?.gameType === "bluff" && (
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
        )}

        {pool?.gameType === "topspot" && (
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
        )}

        {pool?.gameType === "jackpot" && (
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
        )}

        <div className="bg-betster-900/70 rounded-lg p-4 mt-6 border border-betster-700/50">
          <h3 className="font-medium mb-2 text-betster-300 flex items-center">
            <Info className="h-4 w-4 mr-2" />
            Probability Insight
          </h3>
          <p className="text-sm">
            Remember that each game is independent, and past results don't
            influence future outcomes directly. However, player psychology tends
            to follow patterns, which you can use to your advantage!
          </p>
        </div>

        <div className="mt-6">
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
              <div className="space-y-4">
                <h4 className="font-medium text-center text-betster-300 border-b border-border pb-2">
                  Last 10 Games Analysis
                </h4>

                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between mb-1 text-sm">
                      <span>Most Picked Numbers</span>
                      <span className="text-betster-300">Avoid these!</span>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <div className="betster-chip bg-red-900/30 border border-red-700/40">
                        7 (23%)
                      </div>
                      <div className="betster-chip bg-red-900/30 border border-red-700/40">
                        10 (19%)
                      </div>
                      <div className="betster-chip bg-red-900/30 border border-red-700/40">
                        4 (16%)
                      </div>
                      <div className="betster-chip bg-red-900/30 border border-red-700/40">
                        12 (15%)
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-1 text-sm">
                      <span>Least Picked Numbers</span>
                      <span className="text-betster-300">Best choices!</span>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <div className="betster-chip bg-green-900/30 border border-green-700/40">
                        3 (2%)
                      </div>
                      <div className="betster-chip bg-green-900/30 border border-green-700/40">
                        15 (3%)
                      </div>
                      <div className="betster-chip bg-green-900/30 border border-green-700/40">
                        1 (4%)
                      </div>
                      <div className="betster-chip bg-green-900/30 border border-green-700/40">
                        11 (5%)
                      </div>
                    </div>
                  </div>

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
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HintsTab;
