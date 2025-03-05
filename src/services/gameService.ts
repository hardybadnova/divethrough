
import { database } from '@/lib/firebase';
import { ref, set, onValue, update, remove, push, get } from 'firebase/database';
import { Player, Pool, Winner } from '@/types/game';

// Join a specific game pool
export const joinGamePool = async (poolId: string, player: Player): Promise<void> => {
  // Add player to the pool
  const playerRef = ref(database, `pools/${poolId}/players/${player.id}`);
  await set(playerRef, player);
  
  // Update current players count
  const poolRef = ref(database, `pools/${poolId}`);
  const snapshot = await get(poolRef);
  if (snapshot.exists()) {
    const pool = snapshot.val();
    const currentPlayers = Object.keys(pool.players || {}).length;
    await update(poolRef, { currentPlayers });
  }
};

// Leave a specific game pool
export const leaveGamePool = async (poolId: string, playerId: string): Promise<void> => {
  // Remove player from pool
  const playerRef = ref(database, `pools/${poolId}/players/${playerId}`);
  await remove(playerRef);
  
  // Update current players count
  const poolRef = ref(database, `pools/${poolId}`);
  const snapshot = await get(poolRef);
  if (snapshot.exists()) {
    const pool = snapshot.val();
    const currentPlayers = Object.keys(pool.players || {}).length;
    await update(poolRef, { currentPlayers });
  }
};

// Listen for changes in a specific pool
export const subscribeToPool = (poolId: string, callback: (pool: Pool) => void): (() => void) => {
  const poolRef = ref(database, `pools/${poolId}`);
  const unsubscribe = onValue(poolRef, (snapshot) => {
    if (snapshot.exists()) {
      const pool = snapshot.val();
      // Transform players object to array if it exists
      if (pool.players) {
        pool.players = Object.values(pool.players);
      } else {
        pool.players = [];
      }
      callback(pool as Pool);
    }
  });
  
  return unsubscribe;
};

// Listen for changes in all pools
export const subscribeToAllPools = (callback: (pools: Pool[]) => void): (() => void) => {
  const poolsRef = ref(database, 'pools');
  const unsubscribe = onValue(poolsRef, (snapshot) => {
    if (snapshot.exists()) {
      const poolsData = snapshot.val();
      const poolsArray = Object.keys(poolsData).map(key => {
        const pool = poolsData[key];
        // Transform players object to array if it exists
        if (pool.players) {
          pool.players = Object.values(pool.players);
        } else {
          pool.players = [];
        }
        return { ...pool, id: key };
      });
      callback(poolsArray as Pool[]);
    } else {
      callback([]); // Return empty array if no pools exist
    }
  });
  
  return unsubscribe;
};

// Update a player's selected number for a game
export const lockNumber = async (poolId: string, playerId: string, selectedNumber: number): Promise<void> => {
  const playerNumberRef = ref(database, `pools/${poolId}/players/${playerId}/selectedNumber`);
  await set(playerNumberRef, selectedNumber);
  
  const playerLockedRef = ref(database, `pools/${poolId}/players/${playerId}/locked`);
  await set(playerLockedRef, true);
};

// Send a chat message in a game
export const sendChatMessage = async (poolId: string, message: { sender: string; message: string; timestamp: string }): Promise<void> => {
  const chatRef = ref(database, `pools/${poolId}/chat`);
  const newMessageRef = push(chatRef);
  await set(newMessageRef, message);
};

// Listen for chat messages in a game
export const subscribeToChatMessages = (poolId: string, callback: (messages: any[]) => void): (() => void) => {
  const chatRef = ref(database, `pools/${poolId}/chat`);
  const unsubscribe = onValue(chatRef, (snapshot) => {
    if (snapshot.exists()) {
      const messages = Object.values(snapshot.val());
      callback(messages);
    } else {
      callback([]);
    }
  });
  
  return unsubscribe;
};

// Set up initial mock data in Firebase (only call this once or when resetting)
export const initializeGameData = async (initialPools: Pool[]): Promise<void> => {
  const poolsRef = ref(database, 'pools');
  
  // Convert pool arrays to objects with ID keys
  const poolsObject = initialPools.reduce((acc, pool) => {
    // Convert players array to object with player ids as keys
    const playersObject = (pool.players || []).reduce((pAcc, player) => {
      pAcc[player.id] = player;
      return pAcc;
    }, {} as Record<string, Player>);
    
    acc[pool.id] = { ...pool, players: playersObject };
    return acc;
  }, {} as Record<string, any>);
  
  await set(poolsRef, poolsObject);
};
