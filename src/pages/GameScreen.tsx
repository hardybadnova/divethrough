import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
import { useGame } from "@/contexts/GameContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  BarChart3, 
  MessageSquare, 
  Lightbulb, 
  Clock, 
  UserCheck, 
  Award, 
  ChevronLeft,
  Users
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "@/hooks/use-toast";

const GameScreen = () => {
  const { poolId } = useParams<{ poolId: string }>();
  const { pools, players, currentPool, leavePool } = useGame();
  const navigate = useNavigate();
  const [selectedNumber, setSelectedNumber] = useState<number | null>(null);
  const [availableNumbers, setAvailableNumbers] = useState<number[]>([]);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
  const [gameStarted, setGameStarted] = useState(false);
  
  const formattedTime = useMemo(() => {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }, [timeLeft]);
  
  const pool = useMemo(() => {
    if (currentPool) return currentPool;
    return pools.find(p => p.id === poolId);
  }, [currentPool, poolId, pools]);
  
  const poolPlayers = useMemo(() => {
    return players.slice(0, pool?.gameType === 'jackpot' ? 30 : 50);
  }, [players, pool]);
  
  useEffect(() => {
    if (!pool) {
      navigate('/dashboard');
      return;
    }
    
    const maxNumber = pool.numberRange[1];
    setAvailableNumbers(Array.from({ length: maxNumber + 1 }, (_, i) => i));
  }, [pool, navigate]);
  
  useEffect(() => {
    const initialTimer = setTimeout(() => {
      setGameStarted(true);
      
      const interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            handleGameEnd();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      return () => clearInterval(interval);
    }, 3000);
    
    return () => clearTimeout(initialTimer);
  }, []);
  
  const handleNumberSelect = (num: number) => {
    setSelectedNumber(num);
    toast({
      title: "Number Selected",
      description: `You have selected number ${num}`,
    });
  };
  
  const handleGetHint = () => {
    const hintCost = (pool?.entryFee || 0) * 0.02;
    
    toast({
      title: "Hint Purchased",
      description: `You've spent ${hintCost} INR for a hint.`,
    });
    
    const hints = [
      "Numbers with less frequency of selection tend to win more.",
      "Consider choosing a number that others might not pick.",
      "In previous games, numbers between 10-20 were less frequently chosen.",
      "The least picked numbers have the highest chance of winning.",
      "Most players avoid very high or very low numbers."
    ];
    
    setTimeout(() => {
      toast({
        title: "Game Hint",
        description: hints[Math.floor(Math.random() * hints.length)],
      });
    }, 500);
  };
  
  const handleGameEnd = () => {
    if (selectedNumber === null && timeLeft === 0) {
      toast({
        title: "Game Over",
        description: "You didn't select any number.",
        variant: "destructive",
      });
    } else if (timeLeft === 0) {
      toast({
        title: "Game Finished",
        description: "Calculating results...",
      });
      
      setTimeout(() => {
        navigate(`/result/${poolId}`);
      }, 1500);
    } else if (selectedNumber !== null) {
      toast({
        title: "Number Locked",
        description: `You've selected number ${selectedNumber}. Wait for the timer to end.`,
      });
    }
  };
  
  const handleBackClick = () => {
    leavePool();
    navigate(`/pools/${pool?.gameType}`);
  };
  
  if (!pool) return null;
  
  return (
    <AppLayout>
      <div className="flex-1 flex flex-col h-full max-h-screen">
        <div className="border-b border-border/40 bg-background/80 backdrop-blur-sm sticky top-0 z-10">
          <div className="container max-w-5xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <button 
                onClick={handleBackClick}
                className="flex items-center text-muted-foreground hover:text-foreground"
              >
                <ChevronLeft className="h-5 w-5 mr-1" />
                <span>Back</span>
              </button>
              
              <div className="flex items-center text-sm">
                <span className="text-muted-foreground mr-2">
                  <Users className="h-4 w-4 inline mr-1" />
                  {poolPlayers.length} players
                </span>
                
                <div className="flex items-center bg-secondary rounded-full px-3 py-1">
                  <Clock className="h-4 w-4 mr-1 text-betster-400" />
                  <span className={timeLeft < 60 ? "text-red-500 font-bold" : ""}>
                    {formattedTime}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex-1 container max-w-5xl mx-auto px-4 py-4 md:py-6 grid md:grid-cols-2 gap-6 h-full overflow-hidden">
          <div className="flex flex-col h-full">
            <div className="mb-4">
              <h2 className="text-lg font-medium">Select Your Number</h2>
              <p className="text-sm text-muted-foreground">Choose one number. Remember, the least picked number wins!</p>
            </div>
            
            <div className="glass-card p-4 rounded-xl flex-1 overflow-hidden flex flex-col">
              {!gameStarted ? (
                <div className="flex-1 flex flex-col items-center justify-center">
                  <div className="text-center space-y-3">
                    <div className="loader mx-auto"></div>
                    <p className="text-muted-foreground mt-4">Game is about to start...</p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-5 gap-2 mb-4 overflow-y-auto max-h-[400px] p-2">
                    {availableNumbers.map((num) => (
                      <motion.button
                        key={num}
                        whileTap={{ scale: 0.95 }}
                        className={`aspect-square flex items-center justify-center rounded-lg text-lg font-medium transition-all ${
                          selectedNumber === num
                            ? "bg-betster-600 text-white shadow-lg"
                            : "bg-secondary hover:bg-secondary/80 text-foreground"
                        }`}
                        onClick={() => handleNumberSelect(num)}
                        disabled={selectedNumber !== null}
                      >
                        {num}
                      </motion.button>
                    ))}
                  </div>
                  
                  <div className="mt-auto space-y-4">
                    <div className="rounded-lg bg-secondary/50 p-3">
                      <p className="text-sm font-medium mb-2">Your Selection:</p>
                      <div className="flex gap-2">
                        {selectedNumber !== null ? (
                          <div
                            className="w-10 h-10 rounded-lg bg-betster-600 flex items-center justify-center text-white font-medium"
                          >
                            {selectedNumber}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">
                            No number selected yet
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <button 
                      className={`betster-button w-full py-3 ${selectedNumber !== null ? 'bg-green-600' : ''}`}
                      onClick={handleGameEnd}
                      disabled={timeLeft === 0}
                    >
                      {selectedNumber !== null ? "Number Locked - Waiting for timer..." : "Lock In Selection"}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
          
          <div className="flex flex-col h-full">
            <Tabs defaultValue="players" className="flex flex-col h-full">
              <TabsList className="grid grid-cols-3 mb-4">
                <TabsTrigger value="players" className="flex items-center gap-1.5">
                  <UserCheck className="h-4 w-4" />
                  <span>Players</span>
                </TabsTrigger>
                <TabsTrigger value="chat" className="flex items-center gap-1.5">
                  <MessageSquare className="h-4 w-4" />
                  <span>Chat</span>
                </TabsTrigger>
                <TabsTrigger value="hints" className="flex items-center gap-1.5">
                  <Lightbulb className="h-4 w-4" />
                  <span>Hints</span>
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="players" className="flex-1 overflow-hidden glass-card rounded-xl">
                <div className="p-4 border-b border-border/40">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">Players in this pool</h3>
                    <div className="betster-chip">
                      {poolPlayers.length} Active
                    </div>
                  </div>
                </div>
                
                <ScrollArea className="h-[calc(100%-56px)]">
                  <div className="p-2">
                    {poolPlayers.map((player, index) => (
                      <div 
                        key={player.id} 
                        className="p-2 rounded-lg hover:bg-secondary/50 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="w-8 h-8 rounded-full bg-betster-600/20 flex items-center justify-center text-sm font-medium mr-3">
                              {player.username.charAt(0)}
                            </div>
                            <div>
                              <p className="font-medium">{player.username}</p>
                              <div className="flex items-center text-xs text-muted-foreground">
                                <Award className="h-3 w-3 mr-1" />
                                <span>Win rate: {player.stats.winRate}%</span>
                              </div>
                            </div>
                          </div>
                          
                          <BarChart3 className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>
              
              <TabsContent value="chat" className="flex-1 overflow-hidden glass-card rounded-xl flex flex-col">
                <div className="p-4 border-b border-border/40">
                  <h3 className="font-medium">Game Chat</h3>
                </div>
                
                <ScrollArea className="flex-1">
                  <div className="p-4 space-y-4">
                    <div className="chat-message">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-betster-600/20 flex items-center justify-center text-sm font-medium">
                          P
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-sm">Player42</p>
                            <span className="text-xs text-muted-foreground">2m ago</span>
                          </div>
                          <p className="text-sm mt-1">
                            Good luck everyone! Which numbers are you picking?
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="chat-message">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-betster-600/20 flex items-center justify-center text-sm font-medium">
                          B
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-sm">BetMaster</p>
                            <span className="text-xs text-muted-foreground">1m ago</span>
                          </div>
                          <p className="text-sm mt-1">
                            I'm going with my lucky numbers as always
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </ScrollArea>
                
                <div className="p-3 border-t border-border/40">
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="Type your message..." 
                      className="flex-1 rounded-lg bg-secondary px-3 py-2 text-sm focus:outline-none"
                    />
                    <button className="betster-button">
                      Send
                    </button>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="hints" className="flex-1 overflow-hidden glass-card rounded-xl flex flex-col">
                <div className="p-4 border-b border-border/40">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">Game Hints</h3>
                    <button 
                      className="betster-chip flex items-center"
                      onClick={handleGetHint}
                    >
                      <Lightbulb className="h-3.5 w-3.5 mr-1" />
                      Get hint
                    </button>
                  </div>
                </div>
                
                <ScrollArea className="flex-1">
                  <div className="p-4 space-y-4">
                    <div className="rounded-lg bg-secondary/50 p-3">
                      <p className="text-sm font-medium mb-1">Last 10 Games Stats</p>
                      <p className="text-xs text-muted-foreground">
                        Purchase hints to see winning patterns
                      </p>
                    </div>
                    
                    <div className="rounded-lg bg-secondary/50 p-3">
                      <p className="text-sm font-medium mb-1">Number Frequency</p>
                      <p className="text-xs text-muted-foreground">
                        Purchase hints to see most frequent numbers
                      </p>
                    </div>
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default GameScreen;
