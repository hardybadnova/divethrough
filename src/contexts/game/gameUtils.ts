
import { Player, Pool, Winner } from "@/types/game";

export const getPoolsByGameType = (pools: Pool[], gameType: string): Pool[] => {
  return pools.filter(pool => pool.gameType === gameType);
};

export const getWinners = (pools: Pool[], poolId: string): Winner[] => {
  const pool = pools.find(p => p.id === poolId);
  if (!pool || !pool.players || pool.players.length === 0) return [];
  
  // For demonstration, we'll randomly select winners
  // In a real implementation, this would be based on game results
  const shuffledPlayers = [...pool.players].sort(() => 0.5 - Math.random());
  const totalPoolAmount = pool.entryFee * pool.currentPlayers;
  const taxDeduction = totalPoolAmount * 0.28; // 28% GST
  const prizePool = totalPoolAmount - taxDeduction;
  
  const winners: Winner[] = [];
  
  // First prize winner (all game types)
  winners.push({
    position: 1,
    players: shuffledPlayers.slice(0, 1),
    prize: prizePool * (pool.gameType === 'topspot' ? 0.9 : 0.5)
  });
  
  // Second and third prize for bluff and jackpot
  if (pool.gameType !== 'topspot' && shuffledPlayers.length > 1) {
    winners.push({
      position: 2,
      players: shuffledPlayers.slice(1, 2),
      prize: prizePool * 0.25
    });
    
    if (shuffledPlayers.length > 2) {
      winners.push({
        position: 3,
        players: shuffledPlayers.slice(2, 3),
        prize: prizePool * 0.15
      });
    }
  }
  
  return winners;
};

export const getReferralInfo = (players: Player[], userId: string | undefined): { code: string; referrals: number; totalBonus: number } => {
  // Get referral info for current user
  if (!userId) {
    return { code: "", referrals: 0, totalBonus: 0 };
  }
  
  const currentPlayer = players.find(p => p.id === userId);
  if (!currentPlayer) {
    return { code: "", referrals: 0, totalBonus: 0 };
  }
  
  return {
    code: `${currentPlayer.username.toLowerCase().replace(/\s+/g, "")}${userId.substring(0, 5)}`,
    referrals: currentPlayer.referrals.length,
    totalBonus: currentPlayer.referralBonus,
  };
};
