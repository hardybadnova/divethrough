
import React, { useState } from "react";
import AppLayout from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bell, Gift, Medal, Search, Trophy, Users } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

const LeaderboardPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("global");
  const [timeframe, setTimeframe] = useState("allTime");
  const [gameType, setGameType] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  
  // Mock data for leaderboard
  const allPlayers = [
    { id: "user1", username: "Champion123", score: 15000, rank: 1, winRate: 46, gamesPlayed: 120, avatar: "/champion.jpg" },
    { id: "user2", username: "ProGamer", score: 12500, rank: 2, winRate: 41, gamesPlayed: 98, avatar: null },
    { id: "user3", username: "TopPlayer", score: 10800, rank: 3, winRate: 38, gamesPlayed: 105, avatar: null },
    { id: "user4", username: "BetMaster", score: 9200, rank: 4, winRate: 35, gamesPlayed: 75, avatar: null },
    { id: "user5", username: "LuckyWinner", score: 8500, rank: 5, winRate: 33, gamesPlayed: 88, avatar: null },
    { id: "user6", username: "BetsterPro", score: 7300, rank: 6, winRate: 30, gamesPlayed: 92, avatar: null },
    { id: "user7", username: "GameExpert", score: 6900, rank: 7, winRate: 28, gamesPlayed: 65, avatar: null },
    { id: "user8", username: "RichPlayer", score: 5600, rank: 8, winRate: 27, gamesPlayed: 70, avatar: null },
    { id: "user9", username: "SkillfulBet", score: 4800, rank: 9, winRate: 25, gamesPlayed: 55, avatar: null },
    { id: "user10", username: "WinningBoss", score: 4200, rank: 10, winRate: 24, gamesPlayed: 62, avatar: null },
    { id: "user11", username: "BetKing", score: 3900, rank: 11, winRate: 23, gamesPlayed: 48, avatar: null },
    { id: "user12", username: "LuckyHand", score: 3500, rank: 12, winRate: 22, gamesPlayed: 52, avatar: null },
    { id: "user13", username: "MasterMind", score: 3200, rank: 13, winRate: 21, gamesPlayed: 43, avatar: null },
    { id: "user14", username: "BetQueen", score: 2800, rank: 14, winRate: 20, gamesPlayed: 39, avatar: null },
    { id: "user15", username: "NumChamp", score: 2500, rank: 15, winRate: 19, gamesPlayed: 35, avatar: null },
  ];

  // Mock data for friends
  const friendsLeaderboard = [
    { id: "friend1", username: "BestBuddyGamer", score: 8200, rank: 1, winRate: 38, gamesPlayed: 65, avatar: null },
    { id: "friend2", username: "SchoolFriend", score: 6100, rank: 2, winRate: 32, gamesPlayed: 55, avatar: null },
    { id: "friend3", username: "WorkMate", score: 5400, rank: 3, winRate: 28, gamesPlayed: 48, avatar: null },
    { id: "friend4", username: "NeighborGamer", score: 4300, rank: 4, winRate: 25, gamesPlayed: 42, avatar: null },
    { id: "friend5", username: "ChildhoodBuddy", score: 3700, rank: 5, winRate: 24, gamesPlayed: 38, avatar: null },
  ];

  // Filter players based on search term
  const filteredGlobalPlayers = allPlayers.filter(player => 
    player.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredFriendsPlayers = friendsLeaderboard.filter(player => 
    player.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // User stats based on current leaderboard
  const userRank = allPlayers.findIndex(player => player.username === user?.username) + 1;
  
  // Get current active leaderboard based on tab
  const currentLeaderboard = activeTab === "global" ? filteredGlobalPlayers : filteredFriendsPlayers;

  const handleSubscribeNotifications = () => {
    toast({
      title: "Notifications Enabled",
      description: "You'll receive updates when leaderboard rankings change",
    });
  };

  const getBackgroundColor = (rank: number) => {
    if (rank === 1) return "from-amber-500/30 to-amber-600/10";
    if (rank === 2) return "from-gray-300/30 to-gray-400/10";
    if (rank === 3) return "from-amber-700/30 to-amber-800/10";
    return "from-betster-800/30 to-betster-900/10";
  };

  return (
    <AppLayout>
      <div className="container px-4 py-6 max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-white mb-2 md:mb-0">Leaderboard</h1>
          
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleSubscribeNotifications}
              className="text-betster-300 border-betster-700/40"
            >
              <Bell className="h-4 w-4 mr-2" />
              Get Updates
            </Button>
          </div>
        </div>
        
        {userRank > 0 && (
          <Card className="bg-black/30 border-betster-700/40 text-white mb-6">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center h-12 w-12 rounded-full bg-betster-700/30 text-white font-bold">
                    {userRank}
                  </div>
                  <div>
                    <p className="font-medium">Your Ranking</p>
                    <p className="text-sm text-betster-300">Keep playing to improve your position!</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="text-betster-300 border-betster-700/40">
                  <Trophy className="h-4 w-4 mr-2" />
                  View Rewards
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
        
        <Card className="bg-black/50 border-betster-700/40 text-white">
          <CardHeader className="pb-2">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="text-amber-400 h-6 w-6" /> 
                  Top Players
                </CardTitle>
                <CardDescription className="text-betster-300">
                  The highest scoring players on the platform
                </CardDescription>
              </div>
              
              <div className="mt-4 md:mt-0">
                <Tabs 
                  value={activeTab} 
                  onValueChange={setActiveTab}
                  className="w-[240px]"
                >
                  <TabsList className="grid grid-cols-2">
                    <TabsTrigger value="global">
                      <Users className="h-4 w-4 mr-2" />
                      Global
                    </TabsTrigger>
                    <TabsTrigger value="friends">
                      <Users className="h-4 w-4 mr-2" />
                      Friends
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-betster-500" />
                <Input
                  type="search"
                  placeholder="Search player..."
                  className="pl-9 bg-black/30 border-betster-700/40 text-white"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <Select value={timeframe} onValueChange={setTimeframe}>
                <SelectTrigger className="bg-black/30 border-betster-700/40 text-white w-full md:w-[180px]">
                  <SelectValue placeholder="Time Period" />
                </SelectTrigger>
                <SelectContent className="bg-black/90 border-betster-700/40 text-white">
                  <SelectItem value="allTime">All Time</SelectItem>
                  <SelectItem value="weekly">This Week</SelectItem>
                  <SelectItem value="monthly">This Month</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={gameType} onValueChange={setGameType}>
                <SelectTrigger className="bg-black/30 border-betster-700/40 text-white w-full md:w-[180px]">
                  <SelectValue placeholder="Game Type" />
                </SelectTrigger>
                <SelectContent className="bg-black/90 border-betster-700/40 text-white">
                  <SelectItem value="all">All Games</SelectItem>
                  <SelectItem value="numberGuess">Number Guess</SelectItem>
                  <SelectItem value="luckyDraw">Lucky Draw</SelectItem>
                  <SelectItem value="cardGame">Card Game</SelectItem>
                  <SelectItem value="jackpotHorse">Jackpot Horse</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <TabsContent value="global" className="mt-0">
              {filteredGlobalPlayers.length > 0 ? (
                <div className="space-y-3">
                  {filteredGlobalPlayers.slice(0, 3).map((player, index) => (
                    <div 
                      key={player.id} 
                      className={`flex items-center justify-between p-5 rounded-lg border border-betster-700/30 bg-gradient-to-r ${getBackgroundColor(player.rank)}`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`flex items-center justify-center h-12 w-12 rounded-full ${
                          player.rank === 1 ? 'bg-amber-500 text-amber-900' : 
                          player.rank === 2 ? 'bg-gray-300 text-gray-700' : 
                          player.rank === 3 ? 'bg-amber-700 text-amber-100' :
                          'bg-betster-700/50 text-white'
                        } font-bold text-xl`}>
                          {player.rank}
                        </div>
                        <Avatar className="h-14 w-14 border-2 border-betster-700/50">
                          {player.avatar ? (
                            <AvatarImage src={player.avatar} alt={player.username} />
                          ) : (
                            <AvatarFallback className="bg-betster-800/80 text-betster-100 text-lg">
                              {player.username.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          )}
                        </Avatar>
                        <div>
                          <div className="flex items-center">
                            <span className="font-semibold text-lg">{player.username}</span>
                            {player.rank === 1 && (
                              <Badge className="ml-2 bg-amber-500 text-black">Champion</Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-3 text-sm text-betster-300">
                            <span>{player.gamesPlayed} games</span>
                            <span>•</span>
                            <span>{player.winRate}% win rate</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-2xl font-bold text-white">₹{player.score.toLocaleString()}</div>
                    </div>
                  ))}
                  
                  {filteredGlobalPlayers.slice(3).map((player) => (
                    <div 
                      key={player.id} 
                      className="flex items-center justify-between p-3 rounded-lg border border-betster-700/30 bg-betster-800/20 hover:bg-betster-800/30 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`flex items-center justify-center h-8 w-8 rounded-full bg-betster-700/50 text-white font-bold`}>
                          {player.rank}
                        </div>
                        <Avatar className="h-10 w-10 border border-betster-700">
                          <AvatarFallback className="bg-betster-800/80 text-betster-100">
                            {player.username.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{player.username}</span>
                      </div>
                      <div className="text-lg font-bold">₹{player.score.toLocaleString()}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-betster-300">No players found matching your search</p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="friends" className="mt-0">
              {filteredFriendsPlayers.length > 0 ? (
                <div className="space-y-3">
                  {filteredFriendsPlayers.map((player) => (
                    <div 
                      key={player.id} 
                      className="flex items-center justify-between p-3 rounded-lg border border-betster-700/30 bg-betster-800/20 hover:bg-betster-800/30 transition-colors"
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
                      <div className="text-lg font-bold">₹{player.score.toLocaleString()}</div>
                    </div>
                  ))}
                  
                  <div className="mt-4 p-4 rounded-lg bg-betster-700/20 border border-betster-700/30">
                    <div className="flex items-center gap-3 mb-2">
                      <Gift className="h-5 w-5 text-betster-300" />
                      <p className="font-medium text-white">Invite Friends</p>
                    </div>
                    <p className="text-sm text-betster-300 mb-3">
                      Invite your friends to play and earn 5% of their first deposit as a bonus!
                    </p>
                    <Button className="w-full">
                      Invite Friends
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-betster-300">No friends found matching your search</p>
                  <div className="mt-6 p-4 rounded-lg bg-betster-700/20 border border-betster-700/30 max-w-md mx-auto">
                    <p className="font-medium text-white mb-2">Invite friends to start competing!</p>
                    <Button className="w-full">
                      <Gift className="h-4 w-4 mr-2" />
                      Invite Friends
                    </Button>
                  </div>
                </div>
              )}
            </TabsContent>
            
            <div className="flex justify-between items-center mt-6 pt-6 border-t border-betster-700/20">
              <div className="flex items-center gap-2">
                <Medal className="h-5 w-5 text-amber-400" />
                <span className="text-betster-300 text-sm">Updated hourly</span>
              </div>
              
              <p className="text-sm text-betster-300">
                {activeTab === "global" ? filteredGlobalPlayers.length : filteredFriendsPlayers.length} players
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default LeaderboardPage;
