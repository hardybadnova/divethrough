
export type StakingPeriod = '7days' | '30days' | '90days' | '180days' | '365days';

export interface StakingPlan {
  id: string;
  name: string;
  period: StakingPeriod;
  apy: number; // Annual Percentage Yield (in percentage)
  minAmount: number;
  description: string;
}

export interface UserStake {
  id: string;
  userId: string;
  planId: string;
  amount: number;
  startDate: Date;
  endDate: Date;
  status: 'active' | 'completed' | 'cancelled';
  rewards: number;
  isCompounding: boolean;
}

export interface StakingContextType {
  availablePlans: StakingPlan[];
  userStakes: UserStake[];
  isLoading: boolean;
  totalStaked: number;
  totalRewards: number;
  createStake: (planId: string, amount: number, isCompounding: boolean) => Promise<void>;
  cancelStake: (stakeId: string) => Promise<void>;
  withdrawRewards: (stakeId: string) => Promise<void>;
  refreshStakingData: () => Promise<void>;
}
