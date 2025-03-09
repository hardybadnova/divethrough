
import { useState, useEffect } from "react";
import { Pool } from "@/types/game";
import { supabase } from "@/lib/supabase/client";
import { useGame } from "@/contexts/GameContext";
import { toast } from "@/hooks/use-toast";

export const usePools = (gameType: string | undefined) => {
  const [isLoading, setIsLoading] = useState(true);
  const [pools, setPools] = useState<Pool[]>([]);
  const { initializeData } = useGame();

  const fetchPools = async () => {
    if (!gameType) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      console.log(`usePools: Directly fetching ${gameType} pools from Supabase`);
      
      const { data, error } = await supabase
        .from('pools')
        .select('*')
        .eq('game_type', gameType);
        
      if (error) {
        console.error("usePools: Error fetching pools:", error);
        toast({
          title: "Error",
          description: "Failed to load pools. Please try again.",
          variant: "destructive",
        });
        return;
      }
      
      if (!data || data.length === 0) {
        console.log(`usePools: No ${gameType} pools found, trying to initialize...`);
        // Try to initialize data if no pools found
        await initializeData();
        
        // Try fetching again after initialization
        const { data: poolsAfterInit, error: errorAfterInit } = await supabase
          .from('pools')
          .select('*')
          .eq('game_type', gameType);
          
        if (errorAfterInit) {
          console.error("usePools: Error fetching pools after init:", errorAfterInit);
          toast({
            title: "Error",
            description: "Failed to load pools after initialization. Please try again.",
            variant: "destructive",
          });
          return;
        }
        
        if (poolsAfterInit && poolsAfterInit.length > 0) {
          console.log(`usePools: Found ${poolsAfterInit.length} ${gameType} pools after initialization`);
          
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
          console.log(`usePools: No ${gameType} pools found even after initialization`);
          setPools([]);
        }
      } else {
        console.log(`usePools: Found ${data.length} ${gameType} pools`);
        
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
      console.error("usePools: Unexpected error:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize pools on mount
  useEffect(() => {
    fetchPools();
  }, [gameType]);

  return {
    pools,
    isLoading,
    fetchPools
  };
};
