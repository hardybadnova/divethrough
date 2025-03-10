
import React from "react";
import AppLayout from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Trophy } from "lucide-react";

const LeaderboardPage = () => {
  // Mock data for leaderboard
  const topPlayers = [
    { username: "Champion123", score: 15000, rank: 1 },
    { username: "ProGamer", score: 12500, rank: 2 },
    { username: "TopPlayer", score: 10800, rank: 3 },
    { username: "BetMaster", score: 9200, rank: 4 },
    { username: "LuckyWinner", score: 8500, rank: 5 },
    { username: "BetsterPro", score: 7300, rank: 6 },
    { username: "GameExpert", score: 6900, rank: 7 },
    { username: "RichPlayer", score: 5600, rank: 8 },
    { username: "SkillfulBet", score: 4800, rank: 9 },
    { username: "WinningBoss", score: 4200, rank: 10 },
  ];

  return (
    <AppLayout>
      <div className="container px-4 py-6 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-6">Leaderboard</h1>
        
        <Card className="bg-black/50 border-betster-700/40 text-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="text-amber-400 h-6 w-6" /> 
              Top Players
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topPlayers.map((player, index) => (
                <div 
                  key={index} 
                  className="flex items-center justify-between p-3 rounded-lg border border-betster-700/30 bg-betster-800/20"
                >
                  <div className="flex items-center gap-3">
                    <div className={`flex items-center justify-center h-8 w-8 rounded-full ${
                      player.rank === 1 ? 'bg-amber-500/80' : 
                      player.rank === 2 ? 'bg-gray-300/80' : 
                      player.rank === 3 ? 'bg-amber-700/80' :
                      'bg-betster-700/50'
                    } text-white font-bold`}>
                      {player.rank}
                    </div>
                    <Avatar className="h-10 w-10 border border-betster-700">
                      <AvatarFallback className="bg-betster-800/80 text-betster-100">
                        {player.username.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{player.username}</span>
                  </div>
                  <div className="text-lg font-bold">₹{player.score}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default LeaderboardPage;
