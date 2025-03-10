
import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { Pool, GameType, PoolStatus } from "@/types/game";
import { supabase } from "@/lib/supabase/client";
import { useGame } from "@/contexts/GameContext";
import { toast } from "@/hooks/use-toast";

const getDefaultPools = (gameType: string): Pool[] => {
  return [
    {
      id: `${gameType}_pool_1_${Date.now()}`,
      gameType: gameType as GameType,
      entryFee: 100,
      maxPlayers: 10,
      currentPlayers: 0,
      status: 'waiting' as PoolStatus,
      numberRange: [1, 10] as [number, number],
      playFrequency: 'daily',
      players: []
    },
    {
      id: `${gameType}_pool_2_${Date.now()}`,
      gameType: gameType as GameType,
      entryFee: 500,
      maxPlayers: 5,
      currentPlayers: 0,
      status: 'waiting' as PoolStatus,
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
  const localCacheKey = useMemo(() => `betster-pools-${gameType}`, [gameType]);
  const lastFetchTime = useRef(0);
  const isMounted = useRef(true);
  
  // Load cached pools immediately on mount for instant UI
  useEffect(() => {
    if (!gameType) return;
    
    try {
      const cachedPools = localStorage.getItem(localCacheKey);
      if (cachedPools) {
        const parsedPools = JSON.parse(cachedPools);
        if (Array.isArray(parsedPools) && parsedPools.length > 0) {
          console.log(`Using cached ${gameType} pools for instant UI`);
          setPools(parsedPools);
          // Reduce initial loading indication time
          setTimeout(() => {
            if (isMounted.current) {
              setIsLoading(false);
            }
          }, 100);
        }
      } else {
        // If no cache exists, use default pools immediately
        const defaultPools = getDefaultPools(gameType);
        setPools(defaultPools);
        localStorage.setItem(localCacheKey, JSON.stringify(defaultPools));
        setTimeout(() => {
          if (isMounted.current) {
            setIsLoading(false);
          }
        }, 100);
      }
    } catch (error) {
      console.error("Error loading cached pools:", error);
      // If cache fails, use defaults
      const defaultPools = getDefaultPools(gameType);
      setPools(defaultPools);
      setIsLoading(false);
    }
    
    return () => {
      isMounted.current = false;
    };
  }, [gameType, localCacheKey]);

  const fetchPools = useCallback(async (force = false) => {
    if (!gameType) {
      setIsLoading(false);
      return;
    }

    // Throttle fetches to prevent excessive requests
    const now = Date.now();
    if (!force && now - lastFetchTime.current < 2000) {
      console.log("Skipping fetch - throttled");
      return;
    }
    
    lastFetchTime.current = now;

    try {
      setIsLoading(true);
      console.log(`usePools: Fetching ${gameType} pools from Supabase`);
      
      const { data, error } = await supabase
        .from('pools')
        .select('*')
        .eq('game_type', gameType);

      if (error) {
        console.error("usePools: Error fetching pools:", error);
        
        // Use cached pools if available, otherwise use defaults
        const cachedPools = localStorage.getItem(localCacheKey);
        if (cachedPools) {
          setPools(JSON.parse(cachedPools));
        } else {
          const fallbackPools = getDefaultPools(gameType);
          setPools(fallbackPools);
          localStorage.setItem(localCacheKey, JSON.stringify(fallbackPools));
        }
        
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
            gameType: pool.game_type as GameType,
            entryFee: pool.entry_fee,
            maxPlayers: pool.max_players,
            currentPlayers: pool.current_players || 0,
            status: pool.status as PoolStatus,
            numberRange: [pool.number_range_min, pool.number_range_max] as [number, number],
            playFrequency: pool.play_frequency,
            players: []
          }));
        
        setPools(formattedPools);
        localStorage.setItem(localCacheKey, JSON.stringify(formattedPools));
      }
    } catch (error) {
      console.error("usePools: Unexpected error:", error);
      
      // Use cached pools if available, otherwise use defaults
      const cachedPools = localStorage.getItem(localCacheKey);
      if (cachedPools) {
        setPools(JSON.parse(cachedPools));
      } else {
        const fallbackPools = getDefaultPools(gameType);
        setPools(fallbackPools);
        localStorage.setItem(localCacheKey, JSON.stringify(fallbackPools));
      }
      
      toast({
        title: "Error",
        description: "Using local pool data due to connection issues.",
      });
    } finally {
      // Ensure loading state is cleared quickly
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
            gameType: pool.game_type as GameType,
            entryFee: pool.entry_fee,
            maxPlayers: pool.max_players,
            currentPlayers: pool.current_players || 0,
            status: pool.status as PoolStatus,
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

  // Smart fetching on mount - only if no cache or enough time has passed
  useEffect(() => {
    if (gameType) {
      const now = Date.now();
      const cachedTime = localStorage.getItem(`${localCacheKey}-timestamp`);
      const shouldFetch = !cachedTime || (now - parseInt(cachedTime, 10)) > 30000; // 30 seconds cache
      
      if (shouldFetch) {
        fetchPools();
        localStorage.setItem(`${localCacheKey}-timestamp`, now.toString());
      } else {
        console.log("Using recent cache, skipping initial fetch");
        // Still mark as not loading since we're using cache
        setIsLoading(false);
      }
    } else {
      setIsLoading(false);
    }
    
    // Maximum loading time failsafe - never show loading for more than 500ms
    const timeoutId = setTimeout(() => {
      if (isMounted.current) {
        setIsLoading(false);
        if (pools.length === 0 && gameType) {
          const defaultPools = getDefaultPools(gameType);
          setPools(defaultPools);
          localStorage.setItem(localCacheKey, JSON.stringify(defaultPools));
        }
      }
    }, 500);
    
    return () => {
      clearTimeout(timeoutId);
    };
  }, [gameType, fetchPools, pools.length, localCacheKey]);

  return {
    pools,
    isLoading,
    fetchPools
  };
};
