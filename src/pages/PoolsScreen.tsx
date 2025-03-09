
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
import { useGame } from "@/contexts/GameContext";
import { useAuth } from "@/contexts/AuthContext";
import { formatCurrency } from "@/lib/formatters";
import { motion } from "framer-motion";
import { Users, ArrowRight } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Pool } from "@/types/game";

const PoolsScreen = () => {
  const { gameType } = useParams<{ gameType: string }>();
  const { getPoolsByGameType, joinPool, initializeData } = useGame();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [pools, setPools] = useState<Pool[]>([]);

  // Initialize game data when component loads
  useEffect(() => {
    const initialize = async () => {
      try {
        setIsLoading(true);
        console.log("PoolsScreen: Initializing game data...");
        await initializeData();
        console.log("PoolsScreen: Game data initialized");
        
        // Get pools after initialization
        if (gameType) {
          const fetchedPools = getPoolsByGameType(gameType);
          console.log(`PoolsScreen: Got ${fetchedPools.length} pools for ${gameType}`);
          setPools(fetchedPools);
        }
      } catch (error) {
        console.error("Failed to initialize game data:", error);
        toast({
          title: "Error",
          description: "Failed to initialize game data. Please refresh the page.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    initialize();
  }, [initializeData, gameType, getPoolsByGameType]);

  // Update pools when gameType changes
  useEffect(() => {
    if (gameType && !isLoading) {
      const fetchedPools = getPoolsByGameType(gameType);
      console.log(`PoolsScreen: Game type changed to ${gameType}, got ${fetchedPools.length} pools`);
      setPools(fetchedPools);
    }
  }, [gameType, getPoolsByGameType, isLoading]);

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
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">
              {gameTitles[gameType || ""]} Pools
            </h1>
            <div className="betster-chip animate-pulse">
              Live
            </div>
          </div>
          <p className="text-muted-foreground">
            Select a pool to join and start playing
          </p>
        </div>

        {isLoading ? (
          <div className="text-center p-8">
            <h3 className="text-lg font-medium mb-2">Loading pools...</h3>
            <p className="text-muted-foreground">Please wait while we initialize game data</p>
          </div>
        ) : pools.length === 0 ? (
          <div className="text-center p-8">
            <h3 className="text-lg font-medium mb-2">No pools available</h3>
            <p className="text-muted-foreground">Check back later for available pools</p>
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
