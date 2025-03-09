
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
import { useGame } from "@/contexts/GameContext";
import { useAuth } from "@/contexts/AuthContext";
import { formatCurrency } from "@/lib/formatters";
import { motion } from "framer-motion";
import { Users, ArrowRight, RefreshCw } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Pool } from "@/types/game";
import { supabase } from "@/lib/supabase/client";

const PoolsScreen = () => {
  const { gameType } = useParams<{ gameType: string }>();
  const { joinPool, initializeData } = useGame();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [pools, setPools] = useState<Pool[]>([]);

  // Initialize game data and fetch pools
  useEffect(() => {
    const fetchPoolsDirectly = async () => {
      try {
        setIsLoading(true);
        console.log(`PoolsScreen: Directly fetching ${gameType} pools from Supabase`);
        
        const { data, error } = await supabase
          .from('pools')
          .select('*')
          .eq('game_type', gameType);
          
        if (error) {
          console.error("PoolsScreen: Error fetching pools:", error);
          toast({
            title: "Error",
            description: "Failed to load pools. Please try again.",
            variant: "destructive",
          });
          return;
        }
        
        if (!data || data.length === 0) {
          console.log(`PoolsScreen: No ${gameType} pools found, trying to initialize...`);
          // Try to initialize data if no pools found
          await initializeData();
          
          // Try fetching again after initialization
          const { data: poolsAfterInit, error: errorAfterInit } = await supabase
            .from('pools')
            .select('*')
            .eq('game_type', gameType);
            
          if (errorAfterInit) {
            console.error("PoolsScreen: Error fetching pools after init:", errorAfterInit);
            toast({
              title: "Error",
              description: "Failed to load pools after initialization. Please try again.",
              variant: "destructive",
            });
            return;
          }
          
          if (poolsAfterInit && poolsAfterInit.length > 0) {
            console.log(`PoolsScreen: Found ${poolsAfterInit.length} ${gameType} pools after initialization`);
            
            const formattedPools: Pool[] = poolsAfterInit
              .filter(p => p.game_type === gameType)
              .map(pool => ({
                id: pool.id,
                gameType: pool.game_type,
                entryFee: pool.entry_fee,
                maxPlayers: pool.max_players,
                currentPlayers: pool.current_players || 0,
                status: pool.status,
                numberRange: [pool.number_range_min, pool.number_range_max] as [number, number],
                playFrequency: pool.play_frequency,
                players: []
              }));
            
            setPools(formattedPools);
          } else {
            console.log(`PoolsScreen: No ${gameType} pools found even after initialization`);
            setPools([]);
          }
        } else {
          console.log(`PoolsScreen: Found ${data.length} ${gameType} pools`);
          
          const formattedPools: Pool[] = data
            .filter(p => p.game_type === gameType)
            .map(pool => ({
              id: pool.id,
              gameType: pool.game_type,
              entryFee: pool.entry_fee,
              maxPlayers: pool.max_players,
              currentPlayers: pool.current_players || 0,
              status: pool.status,
              numberRange: [pool.number_range_min, pool.number_range_max] as [number, number],
              playFrequency: pool.play_frequency,
              players: []
            }));
          
          setPools(formattedPools);
        }
      } catch (error) {
        console.error("PoolsScreen: Unexpected error:", error);
        toast({
          title: "Error",
          description: "An unexpected error occurred. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    if (gameType) {
      fetchPoolsDirectly();
    }
  }, [gameType, initializeData]);

  // Manual refresh function
  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      console.log(`PoolsScreen: Manually refreshing ${gameType} pools`);
      
      const { data, error } = await supabase
        .from('pools')
        .select('*')
        .eq('game_type', gameType);
        
      if (error) {
        console.error("PoolsScreen: Error refreshing pools:", error);
        toast({
          title: "Error",
          description: "Failed to refresh pools. Please try again.",
          variant: "destructive",
        });
        return;
      }
      
      if (data && data.length > 0) {
        console.log(`PoolsScreen: Refreshed ${data.length} ${gameType} pools`);
        
        const formattedPools: Pool[] = data
          .filter(p => p.game_type === gameType)
          .map(pool => ({
            id: pool.id,
            gameType: pool.game_type,
            entryFee: pool.entry_fee,
            maxPlayers: pool.max_players,
            currentPlayers: pool.current_players || 0,
            status: pool.status,
            numberRange: [pool.number_range_min, pool.number_range_max] as [number, number],
            playFrequency: pool.play_frequency,
            players: []
          }));
        
        setPools(formattedPools);
      } else {
        console.log(`PoolsScreen: No ${gameType} pools found during refresh`);
        setPools([]);
      }
    } catch (error) {
      console.error("PoolsScreen: Error during refresh:", error);
      toast({
        title: "Error",
        description: "Failed to refresh pools. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Game titles mapping
  const gameTitles: Record<string, string> = {
    bluff: "Bluff The Tough",
    topspot: "Top Spot",
    jackpot: "Jackpot Horse",
  };

  useEffect(() => {
    if (!gameType || !["bluff", "topspot", "jackpot"].includes(gameType)) {
      console.log("PoolsScreen: Invalid game type, redirecting to dashboard");
      navigate("/dashboard");
    }
  }, [gameType, navigate]);

  const handleJoinPool = (poolId: string, entryFee: number) => {
    if (!user) {
      console.log("PoolsScreen: Cannot join pool, user not authenticated");
      toast({
        title: "Authentication Required",
        description: "Please log in to join this pool.",
        variant: "destructive",
      });
      return;
    }

    if (user.wallet < entryFee) {
      toast({
        title: "Insufficient Balance",
        description: "You don't have enough funds to join this pool.",
        variant: "destructive",
      });
      return;
    }

    console.log(`PoolsScreen: Joining pool ${poolId}`);
    joinPool(poolId);
    navigate(`/game/${poolId}`);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <AppLayout>
      <div className="flex-1 container max-w-lg mx-auto px-4 py-6">
        <div className="space-y-2 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight">
                {gameTitles[gameType || ""]} Pools
              </h1>
              <div className="betster-chip animate-pulse">
                Live
              </div>
            </div>
            <button 
              onClick={handleRefresh} 
              className="betster-button-secondary" 
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
          <p className="text-muted-foreground">
            Select a pool to join and start playing
          </p>
        </div>

        {isLoading ? (
          <div className="text-center p-8">
            <h3 className="text-lg font-medium mb-2">Loading pools...</h3>
            <p className="text-muted-foreground">Please wait while we fetch game data</p>
          </div>
        ) : pools.length === 0 ? (
          <div className="text-center p-8">
            <h3 className="text-lg font-medium mb-2">No pools available</h3>
            <p className="text-muted-foreground">Check back later for available pools or try refreshing</p>
            <button 
              className="betster-button mt-4"
              onClick={handleRefresh}
            >
              Refresh Pools
            </button>
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 gap-4"
          >
            {pools.map((pool) => (
              <motion.div key={pool.id} variants={itemVariants}>
                <div 
                  className="rounded-xl glass-card p-5 hover:shadow-lg hover:shadow-betster-500/10 transition-all cursor-pointer"
                  onClick={() => handleJoinPool(pool.id, pool.entryFee)}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="betster-chip mb-2">
                        {formatCurrency(pool.entryFee)}
                      </div>
                      <h3 className="font-medium text-lg">
                        {formatCurrency(pool.entryFee)} Pool
                      </h3>
                      <div className="flex items-center mt-1 text-muted-foreground text-sm">
                        <Users className="h-3.5 w-3.5 mr-1" />
                        <span>{pool.currentPlayers}/{pool.maxPlayers} Players</span>
                      </div>
                    </div>
                    <div>
                      <button 
                        className="betster-button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleJoinPool(pool.id, pool.entryFee);
                        }}
                      >
                        Join <ArrowRight className="h-4 w-4 ml-1" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </AppLayout>
  );
};

export default PoolsScreen;
