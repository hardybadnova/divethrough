
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
import { useGame } from "@/contexts/GameContext";
import { formatCurrency } from "@/lib/formatters";
import { motion } from "framer-motion";
import { Trophy, ThumbsUp, ThumbsDown, ArrowLeft, Users } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";

interface NumberResult {
  number: number;
  count: number;
  players: string[];
}

const GameResultScreen = () => {
  const { poolId } = useParams<{ poolId: string }>();
  const { pools, players, getWinners, resetGame } = useGame();
  const navigate = useNavigate();
  
  const [results, setResults] = useState<NumberResult[]>([]);
  const [winners, setWinners] = useState<{position: number, number: number, players: string[], prize: number}[]>([]);
  const [userResult, setUserResult] = useState<"winner" | "loser" | null>(null);
  const [userPosition, setUserPosition] = useState<number | null>(null);
  const [loadingResults, setLoadingResults] = useState(true);
  
  const pool = pools.find(p => p.id === poolId);
  
  useEffect(() => {
    if (!pool) {
      navigate('/dashboard');
      return;
    }
    
    // Show loading animation for a short while
    const timer = setTimeout(() => {
      setLoadingResults(false);
      
      // Generate mock results for the game - simulate number frequency
      const maxNumber = pool.numberRange[1];
      const mockNumberResults: NumberResult[] = [];
      
      // Create the distribution of number selections
      for (let i = 0; i <= maxNumber; i++) {
        // Set predefined counts for our example
        let count;
        let playersList: string[] = [];
        
        if (i === 2) { // Example: A chooses 2 (least picked)
          count = 1;
          playersList = ["Player A"];
        } else if (i === 3) { // Example: B, C, D choose 3 (second least picked)
          count = 3;
          playersList = ["Player B", "Player C", "Player D"];
        } else if (i === 9) { // Example: E, F, G, H, I choose 9 (third least picked)
          count = 5;
          playersList = ["Player E", "Player F", "Player G", "Player H", "Player I"];
        } else {
          // Random distribution for other numbers
          count = Math.floor(Math.random() * 10) + 5;
          playersList = players
            .slice(0, count)
            .map(p => p.username);
        }
        
        mockNumberResults.push({
          number: i,
          count,
          players: playersList
        });
      }
      
      // Sort by count to find least chosen numbers
      const sortedResults = [...mockNumberResults].sort((a, b) => a.count - b.count);
      setResults(sortedResults);
      
      // Calculate winners based on game type
      const gameWinners = [];
      const totalPoolAmount = pool.entryFee * pool.currentPlayers;
      const taxDeduction = totalPoolAmount * 0.28; // 28% GST
      const prizePool = totalPoolAmount - taxDeduction;
      
      // First place - least picked number (all game types)
      gameWinners.push({
        position: 1,
        number: sortedResults[0].number, // Number 2 in our example
        players: sortedResults[0].players, // Player A
        prize: prizePool * (pool.gameType === 'topspot' ? 0.9 : 0.5)
      });
      
      // Add 2nd and 3rd for bluff and jackpot
      if (pool.gameType !== 'topspot') {
        gameWinners.push({
          position: 2,
          number: sortedResults[1].number, // Number 3 in our example
          players: sortedResults[1].players, // Players B, C, D
          prize: prizePool * 0.25
        });
        
        gameWinners.push({
          position: 3,
          number: sortedResults[2].number, // Number 9 in our example
          players: sortedResults[2].players, // Players E, F, G, H, I
          prize: prizePool * 0.15
        });
      }
      
      setWinners(gameWinners);
      
      // Simulate if current user is a winner and which position
      const randomChance = Math.random();
      if (randomChance > 0.7) {
        const position = randomChance > 0.9 ? 1 : randomChance > 0.8 ? 2 : 3;
        setUserResult("winner");
        setUserPosition(position);
        
        toast({
          title: `Congratulations! ${position === 1 ? "First" : position === 2 ? "Second" : "Third"} place!`,
          description: "Your number was among the least chosen!",
        });
      } else {
        setUserResult("loser");
        toast({
          title: "Better luck next time",
          description: "Your number wasn't among the least chosen numbers.",
        });
      }
    }, 2000); // Show loading state for 2 seconds
    
    return () => clearTimeout(timer);
  }, [pool, poolId, navigate, players]);
  
  const handleBackToPools = () => {
    // Reset the game and navigate back to pools
    if (pool) {
      resetGame();
      navigate(`/pools/${pool.gameType}`);
    } else {
      navigate('/dashboard');
    }
  };
  
  const handlePlayAgain = () => {
    // Reset the game and navigate to the game screen
    if (pool) {
      resetGame();
      navigate(`/game/${poolId}`);
    }
  };
  
  if (!pool) return null;
  
  return (
    <AppLayout>
      <div className="flex-1 container max-w-5xl mx-auto px-4 py-4 md:py-6">
        <div className="border-b border-border/40 pb-4 mb-6">
          <div className="flex items-center justify-between">
            <button 
              onClick={handleBackToPools}
              className="flex items-center text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-5 w-5 mr-1" />
              <span>Back to Pools</span>
            </button>
            
            <div className="flex items-center">
              <div className="betster-chip bg-betster-600 text-white">
                {pool.gameType === 'bluff' ? 'Bluff The Tough' : 
                 pool.gameType === 'topspot' ? 'Top Spot' : 'Jackpot Horse'}
              </div>
              <div className="betster-chip ml-2">
                {formatCurrency(pool.entryFee)}
              </div>
            </div>
          </div>
        </div>
        
        {loadingResults ? (
          <div className="glass-card p-10 rounded-xl mb-6 flex flex-col items-center justify-center">
            <div className="loader mx-auto mb-6"></div>
            <h2 className="text-xl font-medium text-center mb-2">Calculating Results</h2>
            <p className="text-muted-foreground text-center mb-4">Analyzing all player selections...</p>
            <Progress value={65} className="w-64 h-2" />
          </div>
        ) : (
          <>
            {/* Winner announcement with podium animation */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="glass-card p-6 rounded-xl mb-6 text-center"
            >
              {userResult === "winner" ? (
                <div className="space-y-4">
                  <motion.div 
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1.2 }}
                    transition={{ 
                      repeat: 3,
                      repeatType: "reverse",
                      duration: 0.7
                    }}
                    className="flex justify-center"
                  >
                    <Trophy className={`h-16 w-16 ${
                      userPosition === 1 ? "text-yellow-500" :
                      userPosition === 2 ? "text-gray-400" :
                      "text-amber-700"
                    }`} />
                  </motion.div>
                  <h1 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-betster-300 to-betster-600">
                    Congratulations! {userPosition === 1 ? "First" : userPosition === 2 ? "Second" : "Third"} Place!
                  </h1>
                  <p className="text-lg text-muted-foreground">
                    Your number was among the least chosen!
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <motion.div 
                    className="flex justify-center"
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 1, repeat: 2 }}
                  >
                    <ThumbsDown className="h-16 w-16 text-muted-foreground" />
                  </motion.div>
                  <h1 className="text-2xl md:text-3xl font-bold">
                    Better Luck Next Time
                  </h1>
                  <p className="text-lg text-muted-foreground">
                    Your number wasn't among the least chosen.
                  </p>
                </div>
              )}
              
              <div className="flex justify-center mt-6 gap-4">
                <button 
                  onClick={handlePlayAgain}
                  className="betster-button"
                >
                  Play Again
                </button>
                <button 
                  onClick={handleBackToPools}
                  className="betster-button-outline"
                >
                  Choose Different Pool
                </button>
              </div>
            </motion.div>
            
            {/* Podium visualization */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="glass-card p-6 rounded-xl mb-6"
            >
              <h2 className="font-medium text-lg mb-4 text-center">Winner's Podium</h2>
              
              <div className="flex justify-center items-end h-64 mb-4">
                {/* Second Place */}
                {winners.length > 1 && (
                  <motion.div 
                    initial={{ height: 0 }}
                    animate={{ height: "80%" }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="w-1/4 bg-gray-400 mx-1 rounded-t-lg flex flex-col justify-between items-center"
                  >
                    <motion.div
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 1.2 }}
                      className="bg-gray-200 rounded-full p-2 mt-2"
                    >
                      <Trophy className="h-6 w-6 text-gray-500" />
                    </motion.div>
                    <div className="text-center p-2">
                      <p className="font-bold text-white text-lg">2</p>
                      <p className="text-white text-xs">Number {winners[1].number}</p>
                      <p className="text-white text-xs font-semibold">{formatCurrency(winners[1].prize)}</p>
                    </div>
                  </motion.div>
                )}
                
                {/* First Place */}
                <motion.div 
                  initial={{ height: 0 }}
                  animate={{ height: "100%" }}
                  transition={{ duration: 0.8 }}
                  className="w-1/4 bg-yellow-500 mx-1 rounded-t-lg flex flex-col justify-between items-center"
                >
                  <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1 }}
                    className="bg-yellow-200 rounded-full p-2 mt-2"
                  >
                    <Trophy className="h-8 w-8 text-yellow-600" />
                  </motion.div>
                  <div className="text-center p-2">
                    <p className="font-bold text-white text-2xl">1</p>
                    <p className="text-white text-sm">Number {winners[0].number}</p>
                    <p className="text-white text-sm font-semibold">{formatCurrency(winners[0].prize)}</p>
                  </div>
                </motion.div>
                
                {/* Third Place */}
                {winners.length > 2 && (
                  <motion.div 
                    initial={{ height: 0 }}
                    animate={{ height: "60%" }}
                    transition={{ duration: 0.4, delay: 0.6 }}
                    className="w-1/4 bg-amber-700 mx-1 rounded-t-lg flex flex-col justify-between items-center"
                  >
                    <motion.div
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 1.4 }}
                      className="bg-amber-200 rounded-full p-2 mt-2"
                    >
                      <Trophy className="h-5 w-5 text-amber-800" />
                    </motion.div>
                    <div className="text-center p-2">
                      <p className="font-bold text-white text-lg">3</p>
                      <p className="text-white text-xs">Number {winners[2].number}</p>
                      <p className="text-white text-xs font-semibold">{formatCurrency(winners[2].prize)}</p>
                    </div>
                  </motion.div>
                )}
              </div>
              
              <div className="w-full h-4 bg-gray-200 rounded-lg"></div>
            </motion.div>
            
            {/* Winners List */}
            <div className="glass-card rounded-xl mb-6 overflow-hidden">
              <div className="p-4 border-b border-border/40">
                <h2 className="font-medium text-lg">Winners - Least Picked Numbers</h2>
              </div>
              
              <div className="divide-y divide-border/20">
                {winners.map((winner) => (
                  <motion.div 
                    key={winner.position}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: winner.position * 0.2 }}
                    className="p-4"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-medium mr-3 ${
                          winner.position === 1 ? 'bg-yellow-500' : 
                          winner.position === 2 ? 'bg-gray-400' : 'bg-amber-700'
                        }`}>
                          {winner.position}
                        </div>
                        <div>
                          <div className="flex items-center">
                            <p className="font-medium">Number: {winner.number}</p>
                            <span className="ml-2 text-xs bg-secondary px-2 py-1 rounded-full">
                              {results.find(r => r.number === winner.number)?.count || 0} picks
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            Prize: {formatCurrency(winner.prize)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-sm font-medium">Winners</p>
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Users className="h-3 w-3 mr-1" />
                          <span>{winner.players.length} players</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Show players who chose this number */}
                    <div className="mt-3 pl-12">
                      <p className="text-xs text-muted-foreground mb-1">Players:</p>
                      <div className="flex flex-wrap gap-1">
                        {winner.players.map((player, i) => (
                          <span key={i} className="text-xs bg-secondary/50 px-2 py-0.5 rounded">
                            {player}
                          </span>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
            
            {/* All Numbers Results */}
            <div className="glass-card rounded-xl overflow-hidden">
              <div className="p-4 border-b border-border/40">
                <h2 className="font-medium text-lg">All Results</h2>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 p-4">
                {results.map((result, index) => (
                  <motion.div
                    key={result.number}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className={`p-3 rounded-lg ${
                      winners.some(w => w.number === result.number) 
                        ? 'bg-betster-600/20 border border-betster-600/40' 
                        : 'bg-secondary/50'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">Number {result.number}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        winners.some(w => w.number === result.number)
                          ? 'bg-betster-600/30 text-betster-100'
                          : 'bg-secondary text-muted-foreground'
                      }`}>
                        {result.count} picks
                      </span>
                    </div>
                    
                    <div className="text-xs text-muted-foreground">
                      {result.players.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {result.players.slice(0, 3).map((player, i) => (
                            <span key={i} className="bg-secondary/50 px-1.5 py-0.5 rounded truncate max-w-full">
                              {player}
                            </span>
                          ))}
                          {result.players.length > 3 && (
                            <span className="bg-secondary/50 px-1.5 py-0.5 rounded">
                              +{result.players.length - 3} more
                            </span>
                          )}
                        </div>
                      ) : (
                        <p>No players</p>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
      
      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-10 bg-background/80 backdrop-blur-sm border-t border-border">
        <div className="container mx-auto px-4">
          <div className="flex justify-around py-3">
            <button 
              className="flex flex-col items-center text-sm text-muted-foreground p-2 hover:text-foreground"
              onClick={() => navigate('/dashboard')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 mb-1"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
              <span>Home</span>
            </button>
            
            <button
              className="flex flex-col items-center text-sm text-muted-foreground p-2 hover:text-foreground"
              onClick={() => navigate('/milestones')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 mb-1"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>
              <span>Milestones</span>
            </button>
            
            <button
              className="flex flex-col items-center text-sm text-muted-foreground p-2 hover:text-foreground"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 mb-1"><circle cx="12" cy="12" r="10"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg>
              <span>Support</span>
            </button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default GameResultScreen;
