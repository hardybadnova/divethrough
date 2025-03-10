
import React from "react";
import { Pool } from "@/types/game";
import { User } from "@/types/auth";

interface PlayersListProps {
  pool: Pool;
  user: User | null;
}

const PlayersList: React.FC<PlayersListProps> = ({ pool, user }) => {
  return (
    <div className="glass-card rounded-xl overflow-hidden">
      <div className="p-4 border-b border-border/40">
        <div className="flex items-center justify-between">
          <h2 className="font-medium">Players in This Pool</h2>
          <span className="text-sm text-muted-foreground">
            {pool.currentPlayers}/{pool.maxPlayers}
          </span>
        </div>
      </div>

      <div className="p-4 max-h-64 overflow-y-auto">
        <div className="space-y-2">
          {pool.players && pool.players.length > 0 ? (
            pool.players.map((player) => (
              <div
                key={player.id}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50"
              >
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-xs font-medium">
                    {player.username.charAt(0).toUpperCase()}
                  </div>
                  <span className="ml-2 font-medium">
                    {player.username}
                    {player.id === user?.id && " (You)"}
                  </span>
                </div>
                {player.locked && (
                  <span className="text-xs bg-green-500/20 text-green-700 px-2 py-1 rounded-full">
                    Locked In
                  </span>
                )}
              </div>
            ))
          ) : (
            <div className="text-center text-muted-foreground py-4">
              No players have joined yet. Share the game link with your friends!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlayersList;
