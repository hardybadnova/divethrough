
import React from "react";
import AppLayout from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const GameHistoryPage = () => {
  // Mock data for game history
  const gameHistory = [
    { id: "game-001", type: "Number Guess", date: "2025-03-10", amount: 500, result: "win" },
    { id: "game-002", type: "Lucky Draw", date: "2025-03-09", amount: 200, result: "loss" },
    { id: "game-003", type: "Number Guess", date: "2025-03-08", amount: 300, result: "win" },
    { id: "game-004", type: "Card Game", date: "2025-03-07", amount: 100, result: "loss" },
    { id: "game-005", type: "Number Guess", date: "2025-03-06", amount: 700, result: "win" },
    { id: "game-006", type: "Lucky Draw", date: "2025-03-05", amount: 250, result: "loss" },
    { id: "game-007", type: "Card Game", date: "2025-03-04", amount: 150, result: "win" },
  ];

  return (
    <AppLayout>
      <div className="container px-4 py-6 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-6">Game History</h1>
        
        <Card className="bg-black/50 border-betster-700/40 text-white">
          <CardHeader>
            <CardTitle>Your Recent Games</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {gameHistory.map((game) => (
                <div 
                  key={game.id} 
                  className="flex items-center justify-between p-3 rounded-lg border border-betster-700/30 bg-betster-800/20"
                >
                  <div className="flex flex-col">
                    <span className="font-medium">{game.type}</span>
                    <span className="text-sm text-gray-400">{game.date}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-medium">₹{game.amount}</span>
                    <Badge className={game.result === "win" ? "bg-green-600" : "bg-red-600"}>
                      {game.result === "win" ? "WIN" : "LOSS"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default GameHistoryPage;
