import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
import { useGame } from "@/contexts/GameContext";
import { useAuth } from "@/contexts/AuthContext";
import { formatCurrency } from "@/lib/formatters";
import { ArrowLeft, HelpCircle, Table, MessageCircle, Info, BarChart, Share2 } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

const actionDebounce = {
  join: false,
  leave: false,
};

const GameScreen = () => {
  const { poolId } = useParams<{ poolId: string }>();
  const { 
    pools, 
    joinPool, 
    leavePool, 
    currentPool, 
    chatMessages, 
    lockInNumber, 
    sendMessage,
    initializeData
  } = useGame();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [selectedNumber, setSelectedNumber] = useState<number | null>(null);
  const [isLocked, setIsLocked] = useState(false);
  const [gameState, setGameState] = useState<"pre-game" | "in-progress" | "completed">("pre-game");
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [preGameCountdown, setPreGameCountdown] = useState(20); // 20 seconds to change table
  const [gameTimer, setGameTimer] = useState(120); // 2 minutes game duration
  const [activeTab, setActiveTab] = useState("game");
  const [chatMessage, setChatMessage] = useState("");
  const [showStats, setShowStats] = useState(false);
  const [statsCharged, setStatsCharged] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [gameUrl, setGameUrl] = useState("");
  const [isJoining, setIsJoining] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  
  const preGameIntervalRef = useRef<number | null>(null);
  const gameIntervalRef = useRef<number | null>(null);
  const hasInitialized = useRef(false);
  const hasJoinedPool = useRef(false);

  const pool = currentPool || pools.find(p => p.id === poolId);
  
  useEffect(() => {
    if (!hasInitialized.current) {
      console.log("Initializing game data");
      initializeData().catch(console.error);
      hasInitialized.current = true;
    }
  }, [initializeData]);
  
  useEffect(() => {
    if (!pool || !poolId || isJoining || hasJoinedPool.current) {
      return;
    }

    const joinCurrentPool = async () => {
      try {
        console.log("Joining pool:", poolId);
        setIsJoining(true);
        hasJoinedPool.current = true;
        await joinPool(poolId);
        
        const baseUrl = window.location.origin;
        setGameUrl(`${baseUrl}/game/${poolId}`);
        
        if (preGameIntervalRef.current === null) {
          preGameIntervalRef.current = window.setInterval(() => {
            setPreGameCountdown(prev => {
              if (prev <= 1) {
                if (preGameIntervalRef.current !== null) {
                  clearInterval(preGameIntervalRef.current);
                  preGameIntervalRef.current = null;
                }
                setGameState("in-progress");
                toast({
                  title: "Game Started!",
                  description: "Choose your number and lock it in",
                });
                return 0;
              }
              return prev - 1;
            });
          }, 1000);
        }
      } catch (error) {
        console.error("Failed to join pool:", error);
        toast({
          title: "Error",
          description: "Failed to join the game. Please try again.",
          variant: "destructive"
        });
        hasJoinedPool.current = false;
      } finally {
        setIsJoining(false);
      }
    };

    if (!pool) {
      console.log("No pool found, navigating to dashboard");
      navigate('/dashboard');
      return;
    }
    
    joinCurrentPool();
    
    return () => {
      if (preGameIntervalRef.current !== null) {
        clearInterval(preGameIntervalRef.current);
        preGameIntervalRef.current = null;
      }
    };
  }, [pool, poolId, joinPool, navigate, isJoining]);
  
  useEffect(() => {
    if (gameState !== "in-progress") return;
    
    if (gameIntervalRef.current === null) {
      gameIntervalRef.current = window.setInterval(() => {
        setGameTimer(prev => {
          if (prev <= 1) {
            if (gameIntervalRef.current !== null) {
              clearInterval(gameIntervalRef.current);
              gameIntervalRef.current = null;
            }
            setGameState("completed");
            
            setTimeout(() => {
              console.log("Game timer ended, navigating to results");
              navigate(`/result/${poolId}`);
            }, 500);
            
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (gameIntervalRef.current !== null) {
        clearInterval(gameIntervalRef.current);
        gameIntervalRef.current = null;
      }
    };
  }, [gameState, navigate, poolId]);
  
  useEffect(() => {
    if (gameState === "completed" && poolId) {
      console.log("Game state is completed, navigating to results");
      navigate(`/result/${poolId}`);
    }
  }, [gameState, navigate, poolId]);

  useEffect(() => {
    if (currentPool && user) {
      const currentPlayer = currentPool.players?.find(p => p.id === user.id);
      if (currentPlayer && currentPlayer.locked && currentPlayer.selectedNumber !== undefined) {
        setSelectedNumber(currentPlayer.selectedNumber);
        setIsLocked(true);
      }
    }
  }, [currentPool, user]);
  
  useEffect(() => {
    return () => {
      if (hasJoinedPool.current && !isLeaving) {
        console.log("Component unmounting, cleaning up and leaving pool");
        safeLeavePool();
      }
      
      if (preGameIntervalRef.current !== null) {
        clearInterval(preGameIntervalRef.current);
        preGameIntervalRef.current = null;
      }
      
      if (gameIntervalRef.current !== null) {
        clearInterval(gameIntervalRef.current);
        gameIntervalRef.current = null;
      }
    };
  }, []);
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };
  
  const handleNumberSelect = (number: number) => {
    if (gameState !== "in-progress" || isLocked) return;
    setSelectedNumber(number);
    
    toast({
      title: `Number ${number} Selected`,
      description: "Lock it in to confirm your selection",
    });
  };
  
  const handleLockNumber = async () => {
    if (!selectedNumber || gameState !== "in-progress" || isLocked) return;
    
    try {
      await lockInNumber(selectedNumber);
      setIsLocked(true);
    } catch (error) {
      console.error("Error locking number:", error);
      toast({
        title: "Error",
        description: "Failed to lock in your number. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  const handleExitGame = () => {
    setShowExitDialog(true);
  };
  
  const safeLeavePool = async () => {
    if (isLeaving || !hasJoinedPool.current || actionDebounce.leave) return;
    
    try {
      actionDebounce.leave = true;
      setIsLeaving(true);
      await leavePool();
      hasJoinedPool.current = false;
      
      if (preGameIntervalRef.current !== null) {
        clearInterval(preGameIntervalRef.current);
        preGameIntervalRef.current = null;
      }
      
      if (gameIntervalRef.current !== null) {
        clearInterval(gameIntervalRef.current);
        gameIntervalRef.current = null;
      }
      
    } catch (error) {
      console.error("Error leaving pool:", error);
    } finally {
      setIsLeaving(false);
      setTimeout(() => {
        actionDebounce.leave = false;
      }, 1000);
    }
  };
  
  const confirmExit = async () => {
    await safeLeavePool();
    navigate(`/pools/${pool?.gameType}`);
  };
  
  const handleChangeTable = async () => {
    await safeLeavePool();
    navigate(`/pools/${pool?.gameType}`);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;
    
    try {
      await sendMessage(chatMessage);
      setChatMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Failed to send your message. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  const copyGameLink = () => {
    navigator.clipboard.writeText(gameUrl);
    toast({
      title: "Link Copied!",
      description: "Share this link with your friends to play together"
    });
    setShowShareDialog(false);
  };
  
  const handleViewStats = () => {
    if (statsCharged) {
      setShowStats(true);
      return;
    }
    
    if (!pool) return;
    
    const statsFee = pool.entryFee * 0.02;
    
    toast({
      title: "Stats Access Fee",
      description: `View detailed stats from the last 10 games for ${formatCurrency(statsFee)}?`,
      action: (
        <button 
          className="betster-button py-1 px-3 text-xs"
          onClick={() => {
            setStatsCharged(true);
            setShowStats(true);
            toast({
              title: "Stats Unlocked",
              description: "You now have access to the last 10 games statistics"
            });
          }}
        >
          Pay Fee
        </button>
      ),
    });
  };
  
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

  if (!pool) return null;
  
  return (
    <AppLayout>
      <div className="flex-1 container max-w-5xl mx-auto px-4 py-4 md:py-6">
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
                {pool?.gameType === 'bluff' ? 'Bluff The Tough' : 
                 pool?.gameType === 'topspot' ? 'Top Spot' : 'Jackpot Horse'}
              </div>
              <div className="betster-chip ml-2">
                {pool && formatCurrency(pool.entryFee)}
              </div>
            </div>
          </div>
        </div>
        
        <div className="mb-4 glass-card inline-flex items-center rounded-full px-4 py-1">
          <span className="text-sm font-medium">Players Online: </span>
          <span className="ml-2 text-sm font-bold text-betster-500">{pool.currentPlayers}</span>
          <span className="ml-1 relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
        </div>
        
        {gameState === "pre-game" && (
          <div className="glass-card rounded-xl p-4 mb-4 bg-betster-900/70">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-betster-300">Waiting for game to start</h3>
                <p className="text-sm text-muted-foreground">
                  You can exit or change table during this time
                </p>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-2xl font-bold text-betster-400">{preGameCountdown}</span>
                <span className="text-xs text-muted-foreground">seconds</span>
              </div>
            </div>
            <Progress value={(preGameCountdown / 20) * 100} className="h-2 mt-2" />
          </div>
        )}
        
        <Tabs defaultValue="game" className="w-full" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="game" className="flex items-center gap-1">
              <HelpCircle className="h-4 w-4" />
              <span>Game</span>
            </TabsTrigger>
            <TabsTrigger value="chat" className="flex items-center gap-1">
              <MessageCircle className="h-4 w-4" />
              <span>Chat</span>
            </TabsTrigger>
            <TabsTrigger value="hints" className="flex items-center gap-1">
              <Info className="h-4 w-4" />
              <span>Hints</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="game" className="space-y-4">
            <div className="glass-card rounded-xl p-6 mb-6">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-2"
              >
                <h2 className="text-xl font-medium">Game In Progress</h2>
                <p className="text-muted-foreground">
                  Time remaining: <span className="font-bold text-betster-600">{formatTime(gameTimer)}</span>
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
                      {pool.gameType === 'bluff' || pool.gameType === 'topspot' ? (
                        <>Choose a number between {pool.numberRange[0]} and {pool.numberRange[1]}. The players who choose the least picked numbers win!</>
                      ) : (
                        <>Choose a number between {pool.numberRange[0]} and {pool.numberRange[1]}. The closest number to the secret number without going over wins!</>
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
                <div className="flex justify-center">
                  {renderNumberButtons()}
                </div>
                
                <div className="flex justify-center mt-8">
                  <button
                    onClick={handleLockNumber}
                    disabled={!selectedNumber || isLocked || gameState !== "in-progress"}
                    className={`betster-button w-full max-w-xs ${
                      (!selectedNumber || isLocked || gameState !== "in-progress") 
                        ? 'opacity-50 cursor-not-allowed' 
                        : 'animate-pulse'
                    }`}
                  >
                    {isLocked 
                      ? `Locked: Number ${selectedNumber}` 
                      : selectedNumber 
                        ? `Lock in Number ${selectedNumber}` 
                        : 'Select a Number First'}
                  </button>
                </div>
              </div>
            </div>
            
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
                    pool.players.map((player, i) => (
                      <div key={player.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50">
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
          </TabsContent>

          <TabsContent value="chat" className="space-y-4">
            <div className="glass-card rounded-xl p-4 flex flex-col h-[600px]">
              <div className="flex-1 overflow-y-auto mb-4 space-y-3">
                {chatMessages && chatMessages.length > 0 ? (
                  chatMessages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.sender === user?.username ? "justify-end" : "justify-start"}`}>
                      <div className={`rounded-xl px-4 py-2 max-w-[80%] ${
                        msg.sender === user?.username 
                          ? "bg-betster-600 text-white" 
                          : msg.sender === "System" 
                            ? "bg-muted/70 italic text-sm" 
                            : "bg-muted/50"
                      }`}>
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-medium text-sm">{msg.sender}</span>
                          <span className="text-xs opacity-70">{msg.timestamp}</span>
                        </div>
                        <p>{msg.message}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-muted-foreground italic">No messages yet. Start the conversation!</p>
                  </div>
                )}
              </div>
              
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <input
                  type="text"
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 rounded-md bg-background/50 border border-border px-3 py-2"
                />
                <button 
                  type="submit"
                  className="betster-button px-4 py-2"
                  disabled={!chatMessage.trim()}
                >
                  Send
                </button>
              </form>
            </div>
          </TabsContent>

          <TabsContent value="hints" className="space-y-4">
            <div className="glass-card rounded-xl p-6">
              <h2 className="text-xl font-medium mb-4">Game Tips & Strategies</h2>
              
              {pool?.gameType === 'bluff' && (
                <div className="space-y-4">
                  <div className="bg-muted/50 rounded-lg p-4">
                    <h3 className="font-medium mb-2 text-betster-300">Bluff The Tough Strategy</h3>
                    <p className="mb-2">The goal is to pick the least popular number. Here are some tips:</p>
                    <ul className="list-disc pl-5 space-y-1 text-sm">
                      <li>Most players tend to pick middle numbers. The extremes (lowest and highest) are often good choices.</li>
                      <li>Think about psychology - many players avoid 13 due to superstition.</li>
                      <li>Observe patterns in previous games to spot trends.</li>
                    </ul>
                  </div>
                  
                  <div className="bg-muted/50 rounded-lg p-4">
                    <h3 className="font-medium mb-2 text-betster-300">Historical Data</h3>
                    <p className="mb-2">Based on previous games, these numbers were least picked:</p>
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
              
              {pool?.gameType === 'topspot' && (
                <div className="space-y-4">
                  <div className="bg-muted/50 rounded-lg p-4">
                    <h3 className="font-medium mb-2 text-betster-300">Top Spot Strategy</h3>
                    <p className="mb-2">The goal is to have one of the least chosen numbers. Tips:</p>
                    <ul className="list-disc pl-5 space-y-1 text-sm">
                      <li>Only the rarest numbers will win, so think about what others will avoid.</li>
                      <li>Numbers that appear "random" like 7 or 3 are often over-picked.</li>
                      <li>Statistical analysis shows that edge numbers often win.</li>
                    </ul>
                  </div>
                  
                  <div className="bg-muted/50 rounded-lg p-4">
                    <h3 className="font-medium mb-2 text-betster-300">Recent Winners</h3>
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
              
              {pool?.gameType === 'jackpot' && (
                <div className="space-y-4">
                  <div className="bg-muted/50 rounded-lg p-4">
                    <h3 className="font-medium mb-2 text-betster-300">Jackpot Horse Strategy</h3>
                    <p className="mb-2">The goal is to get closest to the secret number without going over:</p>
                    <ul className="list-disc pl-5 space-y-1 text-sm">
                      <li>Historical data shows the secret number is often between 120-150.</li>
                      <li>Consider picking a number in the middle of the range for optimal chances.</li>
                      <li>Balance risk vs. reward - higher numbers have more risk but potential for bigger reward.</li>
                    </ul>
                  </div>
                  
                  <div className="bg-muted/50 rounded-lg p-4">
                    <h3 className="font-medium mb-2 text-betster-300">Lucky Numbers</h3>
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
                  Remember that each game is independent, and past results don't influence future outcomes directly. 
                  However, player psychology tends to follow patterns, which you can use to your advantage!
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
                    Get detailed statistics from the last 10 games on this table for a small fee of {pool ? formatCurrency(pool.entryFee * 0.02) : '—'} ({pool ? '2%' : '—'} of entry fee).
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
                      <h4 className="font-medium text-center text-betster-300 border-b border-border pb-2">Last 10 Games Analysis</h4>
                      
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between mb-1 text-sm">
                            <span>Most Picked Numbers</span>
                            <span className="text-betster-300">Avoid these!</span>
                          </div>
                          <div className="flex gap-2 flex-wrap">
                            <div className="betster-chip bg-red-900/30 border border-red-700/40">7 (23%)</div>
                            <div className="betster-chip bg-red-900/30 border border-red-700/40">10 (19%)</div>
                            <div className="betster-chip bg-red-900/30 border border-red-700/40">4 (16%)</div>
                            <div className="betster-chip bg-red-900/30 border border-red-700/40">12 (15%)</div>
                          </div>
                        </div>
                        
                        <div>
                          <div className="flex justify-between mb-1 text-sm">
                            <span>Least Picked Numbers</span>
                            <span className="text-betster-300">Best choices!</span>
                          </div>
                          <div className="flex gap-2 flex-wrap">
                            <div className="betster-chip bg-green-900/30 border border-green-700/40">3 (2%)</div>
                            <div className="betster-chip bg-green-900/30 border border-green-700/40">15 (3%)</div>
                            <div className="betster-chip bg-green-900/30 border border-green-700/40">1 (4%)</div>
                            <div className="betster-chip bg-green-900/30 border border-green-700/40">11 (5%)</div>
                          </div>
                        </div>
                        
                        <div>
                          <div className="flex justify-between mb-1 text-sm">
                            <span>Winning Numbers</span>
                            <span className="text-amber-400">Past winners</span>
                          </div>
                          <div className="bg-gradient-to-r from-betster-900 to-betster-800 rounded-md p-2 flex flex-wrap gap-2">
                            <div className="betster-chip bg-amber-500/20 border border-amber-500/40">3</div>
                            <div className="betster-chip bg-amber-500/20 border border-amber-500/40">15</div>
                            <div className="betster-chip bg-amber-500/20 border border-amber-500/40">11</div>
                            <div className="betster-chip bg-amber-500/20 border border-amber-500/40">1</div>
                            <div className="betster-chip bg-amber-500/20 border border-amber-500/40">8</div>
                          </div>
                        </div>
                        
                        <div className="pt-2">
                          <div className="text-sm mb-2">Player Behavior Patterns</div>
                          <ul className="text-xs space-y-1 pl-4 list-disc">
                            <li>70% of players change their number selection every game</li>
                            <li>Numbers 7 and 10 are consistently overselected</li>
                            <li>Most winners picked numbers in the first 30 seconds</li>
                            <li>91% of winners avoided the most popular number from the previous game</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      
      <AlertDialog open={showExitDialog} onOpenChange={setShowExitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Exit Game?</AlertDialogTitle>
            <AlertDialogDescription>
              {gameState === "pre-game" 
                ? "You are about to leave this table. Your entry fee will be refunded."
                : "You are about to forfeit this game. Your entry fee will not be refunded."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmExit}>
              Exit Game
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      <AlertDialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Invite Friends to Play</AlertDialogTitle>
            <AlertDialogDescription>
              Share this link with your friends so they can join the same game table. You'll be able to play together in real-time!
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="flex items-center space-x-2 mt-2 mb-4">
            <input
              readOnly
              value={gameUrl}
              className="flex-1 px-3 py-2 border rounded-md bg-muted/30"
            />
            <Button onClick={copyGameLink} variant="outline">Copy</Button>
          </div>
          
          <div className="bg-muted/30 p-3 rounded-md mb-4">
            <p className="text-sm font-medium mb-1">Current players: {pool.currentPlayers}</p>
            <p className="text-xs text-muted-foreground">Maximum players: {pool.maxPlayers}</p>
          </div>
          
          <AlertDialogFooter>
            <AlertDialogCancel>Close</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
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

export default GameScreen;
