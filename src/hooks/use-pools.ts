import { useState, useEffect, useCallback, useRef } from "react";
import { Pool } from "@/types/game";
import { supabase } from "@/lib/supabase/client";
import { useGame } from "@/contexts/GameContext";
import { toast } from "@/hooks/use-toast";

const getDefaultPools = (gameType: string): Pool[] => {
  return [
    {
      id: `${gameType}_pool_1_${Date.now()}`,
      gameType: gameType,
      entryFee: 100,
      maxPlayers: 10,
      currentPlayers: 0,
      status: 'open',
      numberRange: [1, 10] as [number, number],
      playFrequency: 'daily',
      players: []
    },
    {
      id: `${gameType}_pool_2_${Date.now()}`,
      gameType: gameType,
      entryFee: 500,
      maxPlayers: 5,
      currentPlayers: 0,
      status: 'open',
      numberRange: [1, 20] as [number, number],
      playFrequency: 'daily',
      players: []
    }
  ];
};

export const usePools = (gameType: string | undefined) => {
  const [isLoading, setIsLoading] = useState(true);
  const [pools, setPools] = useState<Pool[]>([]);
  const { initializeData } = useGame();
  const fetchAttempts = useRef(0);
  const localCacheKey = `betster-pools-${gameType}`;
  
  useEffect(() => {
    if (!gameType) return;
    
    try {
      const cachedPools = localStorage.getItem(localCacheKey);
      if (cachedPools) {
        const parsedPools = JSON.parse(cachedPools);
        if (Array.isArray(parsedPools) && parsedPools.length > 0) {
          console.log(`Using cached ${gameType} pools for instant UI`);
          setPools(parsedPools);
          // Still keep loading to refresh with real data
        }
      }
    } catch (error) {
      console.error("Error loading cached pools:", error);
    }
  }, [gameType, localCacheKey]);

  const fetchPools = useCallback(async () => {
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
        
        const fallbackPools = getDefaultPools(gameType);
        setPools(fallbackPools);
        localStorage.setItem(localCacheKey, JSON.stringify(fallbackPools));
        
        fetchAttempts.current += 1;
        if (fetchAttempts.current <= 2) {
          await initializeData();
        } else {
          toast({
            title: "Using Offline Pools",
            description: "Couldn't connect to the server. Using local pools data.",
          });
        }
        
        setIsLoading(false);
        return;
      }
      
      if (!data || data.length === 0) {
        console.log(`usePools: No ${gameType} pools found, creating default pools`);
        
        const defaultPools = getDefaultPools(gameType);
        setPools(defaultPools);
        localStorage.setItem(localCacheKey, JSON.stringify(defaultPools));
        
        initializeGameData();
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
        localStorage.setItem(localCacheKey, JSON.stringify(formattedPools));
      }
    } catch (error) {
      console.error("usePools: Unexpected error:", error);
      
      const fallbackPools = getDefaultPools(gameType);
      setPools(fallbackPools);
      localStorage.setItem(localCacheKey, JSON.stringify(fallbackPools));
      
      toast({
        title: "Error",
        description: "Using local pool data due to connection issues.",
      });
    } finally {
      setIsLoading(false);
    }
  }, [gameType, initializeData, localCacheKey]);

  const initializeGameData = async () => {
    if (!gameType) return;
    
    try {
      console.log(`Initializing game data for ${gameType}`);
      await initializeData();
      
      const { data, error } = await supabase
        .from('pools')
        .select('*')
        .eq('game_type', gameType);
        
      if (error) {
        console.error("Error fetching pools after init:", error);
        return;
      }
      
      if (data && data.length > 0) {
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
        localStorage.setItem(localCacheKey, JSON.stringify(formattedPools));
      }
    } catch (error) {
      console.error("Error initializing game data:", error);
    }
  };

  useEffect(() => {
    if (gameType) {
      fetchPools();
    } else {
      setIsLoading(false);
    }
    
    const timeoutId = setTimeout(() => {
      if (isLoading) {
        setIsLoading(false);
        if (pools.length === 0 && gameType) {
          const defaultPools = getDefaultPools(gameType);
          setPools(defaultPools);
          localStorage.setItem(localCacheKey, JSON.stringify(defaultPools));
        }
      }
    }, 1000);
    
    return () => {
      clearTimeout(timeoutId);
    };
  }, [gameType, fetchPools, isLoading, pools.length, localCacheKey]);

  return {
    pools,
    isLoading,
    fetchPools
  };
};
