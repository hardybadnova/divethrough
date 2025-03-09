
// Game titles mapping
export const gameTitles: Record<string, string> = {
  bluff: "Bluff The Tough",
  topspot: "Top Spot",
  jackpot: "Jackpot Horse",
};

export const isValidGameType = (gameType: string | undefined): boolean => {
  return !!gameType && Object.keys(gameTitles).includes(gameType);
};
