
import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Table, Share2 } from "lucide-react";
import { formatCurrency } from "@/lib/formatters";
import { Pool } from "@/types/game";

interface GameHeaderProps {
  pool: Pool;
  gameUrl: string;
  handleExitGame: () => void;
  handleChangeTable: () => void;
  setShowShareDialog: React.Dispatch<React.SetStateAction<boolean>>;
}

const GameHeader: React.FC<GameHeaderProps> = ({
  pool,
  gameUrl,
  handleExitGame,
  handleChangeTable,
  setShowShareDialog,
}) => {
  return (
    <div className="border-b border-border/40 pb-4 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={handleExitGame}
            className="flex items-center text-muted-foreground hover:text-foreground"
            aria-label="Exit game"
          >
            <ArrowLeft className="h-5 w-5 mr-1" />
            <span>Exit</span>
          </button>

          <button
            onClick={handleChangeTable}
            className="flex items-center text-muted-foreground hover:text-foreground"
            aria-label="Change table"
          >
            <Table className="h-5 w-5 mr-1" />
            <span>Change Table</span>
          </button>

          <button
            onClick={() => setShowShareDialog(true)}
            className="flex items-center text-muted-foreground hover:text-foreground"
            aria-label="Share game link"
          >
            <Share2 className="h-5 w-5 mr-1" />
            <span>Invite Friends</span>
          </button>
        </div>

        <div className="flex items-center">
          <div className="betster-chip bg-betster-600 text-white">
            {pool?.gameType === "bluff"
              ? "Bluff The Tough"
              : pool?.gameType === "topspot"
              ? "Top Spot"
              : "Jackpot Horse"}
          </div>
          <div className="betster-chip ml-2">
            {pool && formatCurrency(pool.entryFee)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameHeader;
