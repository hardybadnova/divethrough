
import { LucideIcon, Trophy, Zap, DollarSign, BadgePercent, Users, History, BarChart3 } from 'lucide-react';

export interface GameModule {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  path: string;
  isActive: boolean;
  isNew?: boolean;
  isHot?: boolean;
  isComingSoon?: boolean;
}

export const gameModules: GameModule[] = [
  {
    id: 'bluff',
    name: 'Bluff Master',
    description: 'Strategic betting game where players try to outsmart opponents',
    icon: Trophy,
    path: '/pools/bluff',
    isActive: true,
    isHot: true
  },
  {
    id: 'topspot',
    name: 'Top Spot',
    description: 'Pick the right numbers and claim the top prize',
    icon: Zap,
    path: '/pools/topspot',
    isActive: true,
    isNew: true
  },
  {
    id: 'jackpot',
    name: 'Jackpot Horse',
    description: 'Predict winning numbers for massive jackpots',
    icon: DollarSign,
    path: '/pools/jackpot',
    isActive: true
  },
  {
    id: 'competitions',
    name: 'Competitions',
    description: 'Join leagues, tournaments and special events',
    icon: Trophy,
    path: '/competitions',
    isActive: true,
    isNew: true
  },
  {
    id: 'milestones',
    name: 'Milestones',
    description: 'Earn bonuses through consistent gameplay',
    icon: BadgePercent,
    path: '/milestones',
    isActive: true
  },
  {
    id: 'referral',
    name: 'Referral Program',
    description: 'Invite friends and earn special bonuses',
    icon: Users,
    path: '/referral',
    isActive: true
  },
  {
    id: 'gameHistory',
    name: 'Game History',
    description: 'View your past game results and statistics',
    icon: History,
    path: '/game-history',
    isActive: true
  },
  {
    id: 'leaderboard',
    name: 'Leaderboard',
    description: 'See how you rank among other players',
    icon: BarChart3,
    path: '/leaderboard',
    isActive: true
  }
];
