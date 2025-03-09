
// Milestone thresholds and bonus percentages
export const milestones = [
  { threshold: 1000, bonusPercentage: 5 },
  { threshold: 5000, bonusPercentage: 10 },
  { threshold: 25000, bonusPercentage: 15 },
  { threshold: 100000, bonusPercentage: 20 },
  { threshold: 500000, bonusPercentage: 30 },
];

export const getMilestoneBonus = (gamesPlayed: number): number => {
  // Find the highest milestone achieved
  for (let i = milestones.length - 1; i >= 0; i--) {
    if (gamesPlayed >= milestones[i].threshold) {
      return milestones[i].bonusPercentage;
    }
  }
  return 0;
};

export const getMilestoneProgress = (players: Player[], userId: string) => {
  const player = players.find(p => p.id === userId) || players[0];
  const gamesPlayed = player?.milestones.gamesPlayed || 0;
  
  // Find current and next milestone
  let currentMilestone = 0;
  let nextMilestone = milestones[0].threshold;
  
  for (let i = 0; i < milestones.length; i++) {
    if (gamesPlayed >= milestones[i].threshold) {
      currentMilestone = milestones[i].threshold;
      nextMilestone = i < milestones.length - 1 ? milestones[i + 1].threshold : currentMilestone;
    }
  }
  
  // Calculate progress percentage towards next milestone
  const progress = currentMilestone === nextMilestone 
    ? 100 
    : Math.min(100, Math.round(((gamesPlayed - currentMilestone) / (nextMilestone - currentMilestone)) * 100));
  
  return { currentMilestone, nextMilestone, progress };
};
