
import { Pool } from "@/types/game";

// Mock data for pools - will be used to initialize Firebase if needed
export const mockPools: Pool[] = [
  // Bluff The Tough pools
  ...([20, 50, 100, 250, 500, 1000, 1500, 2000] as const).map((fee, index) => ({
    id: `bluff-${index}`,
    gameType: 'bluff' as const,
    entryFee: fee,
    maxPlayers: 50,
    currentPlayers: Math.floor(Math.random() * 10) + 1, // Fewer players to start
    status: 'waiting' as const,
    numberRange: [0, 15] as [number, number],
    players: [] // Empty array to be filled with real players
  })),
  
  // Top Spot pools
  ...([20, 50, 100, 250, 500, 1000, 1500, 2000] as const).map((fee, index) => ({
    id: `topspot-${index}`,
    gameType: 'topspot' as const,
    entryFee: fee,
    maxPlayers: 50,
    currentPlayers: Math.floor(Math.random() * 10) + 1, // Fewer players to start
    status: 'waiting' as const,
    numberRange: [0, 15] as [number, number],
    players: [] // Empty array to be filled with real players
  })),
  
  // Jackpot Horse pools
  ...([20, 50] as const).map((fee, index) => ({
    id: `jackpot-${index}`,
    gameType: 'jackpot' as const,
    entryFee: fee,
    maxPlayers: 10000,
    currentPlayers: Math.floor(Math.random() * 50) + 10, // Fewer players to start
    status: 'waiting' as const,
    numberRange: [0, 200] as [number, number],
    playFrequency: 'daily' as const,
    players: [] // Empty array to be filled with real players
  })),
];
