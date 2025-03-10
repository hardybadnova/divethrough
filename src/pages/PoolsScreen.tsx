
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
import { useGame } from "@/contexts/GameContext";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { usePools } from "@/hooks/use-pools";
import { PoolsHeader } from "@/components/pools/PoolsHeader";
import { PoolsList } from "@/components/pools/PoolsList";
import { gameTitles, isValidGameType } from "@/utils/game-titles";
import { Pool } from "@/types/game";

const PoolsScreen = () => {
  const { gameType } = useParams<{ gameType: string }>();
  const { joinPool } = useGame();
  const { user, refreshUserData } = useAuth();
  const navigate = useNavigate();
  const { pools, isLoading, fetchPools } = usePools(gameType);

  // For better UX, ensure we never show loading for more than 500ms
  const [showLoading, setShowLoading] = useState(true);
  
  useEffect(() => {
    // Very short loading state for better user experience
    const timer = setTimeout(() => {
      setShowLoading(false);
    }, 200);
    
    return () => clearTimeout(timer);
  }, []);

  // Validate game type and redirect if invalid
  useEffect(() => {
    if (!isValidGameType(gameType)) {
      console.log("PoolsScreen: Invalid game type, redirecting to dashboard");
      navigate("/dashboard");
    }
  }, [gameType, navigate]);

  // Immediate force refresh of pools on mount
  useEffect(() => {
    if (gameType) {
      fetchPools();
    }
  }, [gameType, fetchPools]);

  const handleJoinPool = async (poolId: string, entryFee: number) => {
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

    try {
      console.log(`PoolsScreen: Joining pool ${poolId}`);
      
      // Show success message immediately for better UX
      toast({
        title: "Joining Pool",
        description: "Processing your request...",
      });
      
      await joinPool(poolId);
      
      // Refresh user data to update wallet balance after joining
      await refreshUserData();
      
      navigate(`/game/${poolId}`);
    } catch (error) {
      console.error("Error joining pool:", error);
      toast({
        title: "Error",
        description: "Failed to join the pool. Please try again.",
        variant: "destructive",
      });
    }
  };

  // If we have pools data but it's empty, we should manually create at least one pool
  useEffect(() => {
    if (!isLoading && pools.length === 0 && gameType) {
      console.log("PoolsScreen: No pools found, triggering initialization");
      fetchPools();
    }
  }, [isLoading, pools, gameType, fetchPools]);

  return (
    <AppLayout>
      <div className="flex-1 container max-w-lg mx-auto px-4 py-6">
        <PoolsHeader 
          gameTitle={gameTitles[gameType || ""]} 
          isLoading={isLoading} 
          onRefresh={fetchPools} 
        />
        
        {(showLoading && isLoading) ? (
          <div className="grid grid-cols-1 gap-4">
            {[1, 2, 3].map((i) => (
              <div 
                key={i} 
                className="rounded-xl glass-card p-5 animate-pulse"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <div className="h-5 w-20 bg-betster-700/50 rounded mb-2"></div>
                    <div className="h-6 w-32 bg-betster-700/50 rounded"></div>
                    <div className="h-4 w-24 bg-betster-700/30 rounded mt-2"></div>
                  </div>
                  <div>
                    <div className="h-9 w-24 bg-betster-700/50 rounded"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <PoolsList 
            pools={pools} 
            isLoading={isLoading && !showLoading} 
            onJoinPool={handleJoinPool} 
            onRefresh={fetchPools} 
          />
        )}
      </div>
    </AppLayout>
  );
};

export default PoolsScreen;
