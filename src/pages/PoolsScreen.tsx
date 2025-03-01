
import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
import { useGame } from "@/contexts/GameContext";
import { useAuth } from "@/contexts/AuthContext";
import { formatCurrency } from "@/lib/formatters";
import { motion } from "framer-motion";
import { Users, ArrowRight } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const PoolsScreen = () => {
  const { gameType } = useParams<{ gameType: string }>();
  const { getPoolsByGameType, joinPool } = useGame();
  const { user } = useAuth();
  const navigate = useNavigate();

  const pools = getPoolsByGameType(gameType || "");

  // Game titles mapping
  const gameTitles: Record<string, string> = {
    bluff: "Bluff The Tough",
    topspot: "Top Spot",
    jackpot: "Jackpot Horse",
  };

  useEffect(() => {
    if (!gameType || !["bluff", "topspot", "jackpot"].includes(gameType)) {
      navigate("/dashboard");
    }
  }, [gameType, navigate]);

  const handleJoinPool = (poolId: string, entryFee: number) => {
    if (!user) return;

    if (user.wallet < entryFee) {
      toast({
        title: "Insufficient Balance",
        description: "You don't have enough funds to join this pool.",
        variant: "destructive",
      });
      return;
    }

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
                      onClick={() => handleJoinPool(pool.id, pool.entryFee)}
                    >
                      Join <ArrowRight className="h-4 w-4 ml-1" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </AppLayout>
  );
};

export default PoolsScreen;
