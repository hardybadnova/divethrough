
import React, { useState } from "react";
import AppLayout from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarIcon, FilterX, Search } from "lucide-react";

const GameHistoryPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [gameTypeFilter, setGameTypeFilter] = useState("all");
  const [resultFilter, setResultFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  
  // Mock data for game history
  const allGameHistory = [
    { id: "game-001", type: "Number Guess", date: "2025-03-10", amount: 500, result: "win", prize: 1200, poolId: "p123" },
    { id: "game-002", type: "Lucky Draw", date: "2025-03-09", amount: 200, result: "loss", prize: 0, poolId: "p456" },
    { id: "game-003", type: "Number Guess", date: "2025-03-08", amount: 300, result: "win", prize: 750, poolId: "p789" },
    { id: "game-004", type: "Card Game", date: "2025-03-07", amount: 100, result: "loss", prize: 0, poolId: "p012" },
    { id: "game-005", type: "Number Guess", date: "2025-03-06", amount: 700, result: "win", prize: 1750, poolId: "p345" },
    { id: "game-006", type: "Lucky Draw", date: "2025-03-05", amount: 250, result: "loss", prize: 0, poolId: "p678" },
    { id: "game-007", type: "Card Game", date: "2025-03-04", amount: 150, result: "win", prize: 350, poolId: "p901" },
    { id: "game-008", type: "Jackpot Horse", date: "2025-03-03", amount: 1000, result: "loss", prize: 0, poolId: "p234" },
    { id: "game-009", type: "Number Guess", date: "2025-03-02", amount: 300, result: "win", prize: 800, poolId: "p567" },
    { id: "game-010", type: "Lucky Draw", date: "2025-03-01", amount: 500, result: "win", prize: 1200, poolId: "p890" },
    { id: "game-011", type: "Card Game", date: "2025-02-28", amount: 200, result: "loss", prize: 0, poolId: "p123" },
    { id: "game-012", type: "Number Guess", date: "2025-02-27", amount: 400, result: "win", prize: 950, poolId: "p456" },
  ];

  // Apply filters
  const filteredGames = allGameHistory.filter(game => {
    // Search term filter
    if (searchTerm && !game.id.includes(searchTerm) && !game.type.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    // Game type filter
    if (gameTypeFilter !== "all" && game.type !== gameTypeFilter) {
      return false;
    }
    
    // Result filter
    if (resultFilter !== "all" && game.result !== resultFilter) {
      return false;
    }
    
    // Date filter (simplified for the mock - would use proper date comparison in production)
    if (dateFilter === "week") {
      // Last 7 days would have proper date comparison in production
      return game.date >= "2025-03-04";
    } else if (dateFilter === "month") {
      // Last 30 days would have proper date comparison in production
      return true;
    }
    
    return true;
  });
  
  const gameTypes = ["Number Guess", "Lucky Draw", "Card Game", "Jackpot Horse"];
  const wins = allGameHistory.filter(game => game.result === "win").length;
  const totalPrize = allGameHistory.reduce((total, game) => total + game.prize, 0);
  
  const resetFilters = () => {
    setSearchTerm("");
    setGameTypeFilter("all");
    setResultFilter("all");
    setDateFilter("all");
  };

  return (
    <AppLayout>
      <div className="container px-4 py-6 max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-white mb-2 md:mb-0">Game History</h1>
          
          <div className="flex items-center gap-2">
            <Tabs defaultValue="all" className="w-[200px]" onValueChange={value => setResultFilter(value)}>
              <TabsList className="grid grid-cols-3 h-8">
                <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
                <TabsTrigger value="win" className="text-xs">Wins</TabsTrigger>
                <TabsTrigger value="loss" className="text-xs">Losses</TabsTrigger>
              </TabsList>
            </Tabs>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={resetFilters}
              className="h-8 px-2 text-betster-300 border-betster-700/40"
            >
              <FilterX className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="bg-black/30 border-betster-700/40 text-white">
            <CardHeader className="py-4">
              <CardTitle className="text-lg">Total Games</CardTitle>
            </CardHeader>
            <CardContent className="py-0">
              <p className="text-3xl font-bold">{allGameHistory.length}</p>
            </CardContent>
          </Card>
          
          <Card className="bg-black/30 border-betster-700/40 text-white">
            <CardHeader className="py-4">
              <CardTitle className="text-lg">Win Rate</CardTitle>
            </CardHeader>
            <CardContent className="py-0">
              <p className="text-3xl font-bold text-green-400">
                {((wins / allGameHistory.length) * 100).toFixed(0)}%
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-black/30 border-betster-700/40 text-white">
            <CardHeader className="py-4">
              <CardTitle className="text-lg">Total Prize Won</CardTitle>
            </CardHeader>
            <CardContent className="py-0">
              <p className="text-3xl font-bold text-amber-400">₹{totalPrize}</p>
            </CardContent>
          </Card>
        </div>
        
        <Card className="bg-black/50 border-betster-700/40 text-white mb-6">
          <CardHeader>
            <CardTitle>Game History</CardTitle>
            <CardDescription className="text-betster-300">
              Review your past games and performance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-betster-500" />
                <Input
                  type="search"
                  placeholder="Search by game ID or type..."
                  className="pl-9 bg-black/30 border-betster-700/40 text-white"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <Select value={gameTypeFilter} onValueChange={setGameTypeFilter}>
                <SelectTrigger className="bg-black/30 border-betster-700/40 text-white w-full md:w-[180px]">
                  <SelectValue placeholder="Game Type" />
                </SelectTrigger>
                <SelectContent className="bg-black/90 border-betster-700/40 text-white">
                  <SelectItem value="all">All Types</SelectItem>
                  {gameTypes.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="bg-black/30 border-betster-700/40 text-white w-full md:w-[180px]">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Time Period" />
                </SelectTrigger>
                <SelectContent className="bg-black/90 border-betster-700/40 text-white">
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="week">Last 7 Days</SelectItem>
                  <SelectItem value="month">Last 30 Days</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {filteredGames.length > 0 ? (
              <div className="space-y-4">
                {filteredGames.map((game) => (
                  <div 
                    key={game.id} 
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg border border-betster-700/30 bg-betster-800/20 hover:bg-betster-800/30 transition-colors"
                  >
                    <div className="flex flex-col mb-3 sm:mb-0">
                      <div className="flex items-center">
                        <span className="font-medium text-white">{game.type}</span>
                        <Badge className="ml-2 text-xs" variant="outline">{game.id}</Badge>
                      </div>
                      <span className="text-sm text-gray-400 mt-1">{game.date}</span>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col items-end">
                        <span className="text-sm text-betster-300">Entry Fee</span>
                        <span className="font-medium">₹{game.amount}</span>
                      </div>
                      
                      <div className="flex flex-col items-end min-w-[80px]">
                        <span className="text-sm text-betster-300">Prize</span>
                        <span className={`font-medium ${game.result === "win" ? "text-green-400" : "text-red-400"}`}>
                          {game.result === "win" ? `+₹${game.prize}` : "-"}
                        </span>
                      </div>
                      
                      <Badge className={game.result === "win" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}>
                        {game.result === "win" ? "WIN" : "LOSS"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-betster-300">No games found matching your filters</p>
                <Button variant="outline" className="mt-4" onClick={resetFilters}>
                  Reset Filters
                </Button>
              </div>
            )}
          </CardContent>
          {filteredGames.length > 10 && (
            <CardFooter>
              <Button variant="outline" className="w-full">Load More</Button>
            </CardFooter>
          )}
        </Card>
      </div>
    </AppLayout>
  );
};

export default GameHistoryPage;
