
import React from "react";
import { motion } from "framer-motion";
import { HelpCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Pool } from "@/types/game";
import { User } from "@/types/auth";
import PlayersList from "./PlayersList";

interface GamePlayTabProps {
  gameState: "pre-game" | "in-progress" | "completed";
  gameTimer: number;
  formatTime: (seconds: number) => string;
  pool: Pool;
  selectedNumber: number | null;
  isLocked: boolean;
  handleNumberSelect: (number: number) => void;
  handleLockNumber: () => void;
  user: User | null;
}

const GamePlayTab: React.FC<GamePlayTabProps> = ({
  gameState,
  gameTimer,
  formatTime,
  pool,
  selectedNumber,
  isLocked,
  handleNumberSelect,
  handleLockNumber,
  user,
}) => {
  const renderNumberButtons = () => {
    if (!pool) return null;

    const { numberRange } = pool;
    const min = numberRange[0];
    const max = numberRange[1];
    const numbers = Array.from({ length: max - min + 1 }, (_, i) => min + i);

    return (
      <div className="grid grid-cols-5 gap-3 w-full max-w-lg mx-auto">
        {numbers.map((num) => (
          <button
            key={num}
            onClick={() => handleNumberSelect(num)}
            disabled={gameState !== "in-progress" || isLocked}
            className={`
              h-12 w-12 rounded-full font-bold transition-all duration-200
              ${selectedNumber === num ? 'bg-betster-600 text-white scale-110' : 'bg-muted hover:bg-muted/80'}
              ${gameState !== "in-progress" || isLocked ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            {num}
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="glass-card rounded-xl p-6 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          <h2 className="text-xl font-medium">Game In Progress</h2>
          <p className="text-muted-foreground">
            Time remaining:{" "}
            <span className="font-bold text-betster-600">
              {formatTime(gameTimer)}
            </span>
          </p>
          <div className="w-full mt-2">
            <Progress value={(gameTimer / 120) * 100} className="h-2" />
          </div>
        </motion.div>

        <div className="bg-muted/50 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <HelpCircle className="h-5 w-5 text-muted-foreground mr-2 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-medium mb-1">How to Play</h3>
              <p className="text-sm text-muted-foreground mb-2">
                {pool.gameType === "bluff" || pool.gameType === "topspot" ? (
                  <>
                    Choose a number between {pool.numberRange[0]} and{" "}
                    {pool.numberRange[1]}. The players who choose the least
                    picked numbers win!
                  </>
                ) : (
                  <>
                    Choose a number between {pool.numberRange[0]} and{" "}
                    {pool.numberRange[1]}. The closest number to the secret
                    number without going over wins!
                  </>
                )}
              </p>
              {gameState === "pre-game" && (
                <p className="text-sm text-amber-600">
                  Game will start soon. Get ready to pick your number!
                </p>
              )}
              {gameState === "in-progress" && !isLocked && (
                <p className="text-sm text-amber-600">
                  Select a number and lock it in before time runs out!
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="font-medium">Choose your number:</h3>
          <div className="flex justify-center">{renderNumberButtons()}</div>

          <div className="flex justify-center mt-8">
            <button
              onClick={handleLockNumber}
              disabled={!selectedNumber || isLocked || gameState !== "in-progress"}
              className={`betster-button w-full max-w-xs ${
                !selectedNumber || isLocked || gameState !== "in-progress"
                  ? "opacity-50 cursor-not-allowed"
                  : "animate-pulse"
              }`}
            >
              {isLocked
                ? `Locked: Number ${selectedNumber}`
                : selectedNumber
                ? `Lock in Number ${selectedNumber}`
                : "Select a Number First"}
            </button>
          </div>
        </div>
      </div>

      <PlayersList pool={pool} user={user} />
    </div>
  );
};

export default GamePlayTab;
