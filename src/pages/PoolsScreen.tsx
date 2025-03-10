
import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
import { useGame } from "@/contexts/GameContext";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { usePools } from "@/hooks/use-pools";
import { PoolsHeader } from "@/components/pools/PoolsHeader";
import { PoolsList } from "@/components/pools/PoolsList";
import { gameTitles, isValidGameType } from "@/utils/game-titles";

const PoolsScreen = () => {
  const { gameType } = useParams<{ gameType: string }>();
  const { joinPool } = useGame();
  const { user, refreshUserData } = useAuth();
  const navigate = useNavigate();
  const { pools, isLoading, fetchPools } = usePools(gameType);

  // Validate game type and redirect if invalid
  useEffect(() => {
    if (!isValidGameType(gameType)) {
      console.log("PoolsScreen: Invalid game type, redirecting to dashboard");
      navigate("/dashboard");
    }
  }, [gameType, navigate]);

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

  return (
    <AppLayout>
      <div className="flex-1 container max-w-lg mx-auto px-4 py-6">
        <PoolsHeader 
          gameTitle={gameTitles[gameType || ""]} 
          isLoading={isLoading} 
          onRefresh={fetchPools} 
        />
        
        <PoolsList 
          pools={pools} 
          isLoading={isLoading} 
          onJoinPool={handleJoinPool} 
          onRefresh={fetchPools} 
        />
      </div>
    </AppLayout>
  );
};

export default PoolsScreen;
