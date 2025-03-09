
import { motion } from "framer-motion";
import { Users, ArrowRight } from "lucide-react";
import { Pool } from "@/types/game";
import { formatCurrency } from "@/lib/formatters";

interface PoolsListProps {
  pools: Pool[];
  isLoading: boolean;
  onJoinPool: (poolId: string, entryFee: number) => void;
  onRefresh: () => void;
}

export const PoolsList = ({ pools, isLoading, onJoinPool, onRefresh }: PoolsListProps) => {
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

  if (isLoading) {
    return (
      <div className="text-center p-8">
        <h3 className="text-lg font-medium mb-2">Loading pools...</h3>
        <p className="text-muted-foreground">Please wait while we fetch game data</p>
      </div>
    );
  }

  if (pools.length === 0) {
    return (
      <div className="text-center p-8">
        <h3 className="text-lg font-medium mb-2">No pools available</h3>
        <p className="text-muted-foreground">Check back later for available pools or try refreshing</p>
        <button 
          className="betster-button mt-4"
          onClick={onRefresh}
        >
          Refresh Pools
        </button>
      </div>
    );
  }

  return (
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
            onClick={() => onJoinPool(pool.id, pool.entryFee)}
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
                    onJoinPool(pool.id, pool.entryFee);
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
  );
};
