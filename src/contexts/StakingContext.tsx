
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { StakingContextType, StakingPlan, UserStake } from '@/types/staking';
import {
  getStakingPlans,
  getUserStakes,
  createStake as createStakeService,
  cancelStake as cancelStakeService,
  withdrawRewards as withdrawRewardsService,
  calculateStakingRewards
} from '@/services/stakingService';

const StakingContext = createContext<StakingContextType | undefined>(undefined);

export const StakingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, refreshUserData } = useAuth();
  const [availablePlans, setAvailablePlans] = useState<StakingPlan[]>([]);
  const [userStakes, setUserStakes] = useState<UserStake[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [totalStaked, setTotalStaked] = useState<number>(0);
  const [totalRewards, setTotalRewards] = useState<number>(0);

  const loadStakingData = async () => {
    if (!user) {
      setAvailablePlans([]);
      setUserStakes([]);
      setTotalStaked(0);
      setTotalRewards(0);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      // Load staking plans
      const plans = await getStakingPlans();
      setAvailablePlans(plans);

      // Load user's stakes
      const stakes = await getUserStakes(user.id);
      setUserStakes(stakes);

      // Calculate totals
      const { totalStaked, totalRewards } = await calculateStakingRewards(user.id);
      setTotalStaked(totalStaked);
      setTotalRewards(totalRewards);
    } catch (error) {
      console.error("Error loading staking data:", error);
      toast({
        title: "Failed to load staking data",
        description: "Please try again later",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Load staking data when user changes
  useEffect(() => {
    loadStakingData();
  }, [user]);

  // Create a new stake
  const createStake = async (planId: string, amount: number, isCompounding: boolean) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to create a stake",
        variant: "destructive"
      });
      return;
    }

    const success = await createStakeService(user.id, planId, amount, isCompounding);
    if (success) {
      await refreshUserData(); // Update wallet balance
      await loadStakingData(); // Refresh staking data
    }
  };

  // Cancel an active stake
  const cancelStake = async (stakeId: string) => {
    if (!user) return;

    const success = await cancelStakeService(user.id, stakeId);
    if (success) {
      await refreshUserData(); // Update wallet balance
      await loadStakingData(); // Refresh staking data
    }
  };

  // Withdraw rewards from a stake
  const withdrawRewards = async (stakeId: string) => {
    if (!user) return;

    const success = await withdrawRewardsService(user.id, stakeId);
    if (success) {
      await refreshUserData(); // Update wallet balance
      await loadStakingData(); // Refresh staking data
    }
  };

  const refreshStakingData = async () => {
    await loadStakingData();
  };

  return (
    <StakingContext.Provider
      value={{
        availablePlans,
        userStakes,
        isLoading,
        totalStaked,
        totalRewards,
        createStake,
        cancelStake,
        withdrawRewards,
        refreshStakingData,
      }}
    >
      {children}
    </StakingContext.Provider>
  );
};

export const useStaking = () => {
  const context = useContext(StakingContext);
  if (context === undefined) {
    throw new Error('useStaking must be used within a StakingProvider');
  }
  return context;
};
