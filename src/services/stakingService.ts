import { toast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase/client';
import { StakingPlan, UserStake } from '@/types/staking';

// Get available staking plans
export const getStakingPlans = async (): Promise<StakingPlan[]> => {
  try {
    const { data, error } = await supabase
      .from('staking_plans')
      .select('*')
      .order('apy', { ascending: false });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching staking plans:", error);
    toast({
      title: "Failed to load staking plans",
      description: "Please try again later",
      variant: "destructive"
    });
    return [];
  }
};

// Get user's active stakes
export const getUserStakes = async (userId: string): Promise<UserStake[]> => {
  try {
    const { data, error } = await supabase
      .from('user_stakes')
      .select(`
        *,
        staking_plans (
          name,
          period,
          apy
        )
      `)
      .eq('user_id', userId);
    
    if (error) throw error;
    return data?.map(stake => ({
      id: stake.id,
      userId: stake.user_id,
      planId: stake.plan_id,
      amount: stake.amount,
      startDate: new Date(stake.start_date),
      endDate: new Date(stake.end_date),
      status: stake.status,
      rewards: stake.rewards,
      isCompounding: stake.is_compounding
    })) || [];
  } catch (error) {
    console.error("Error fetching user stakes:", error);
    toast({
      title: "Failed to load your stakes",
      description: "Please try again later",
      variant: "destructive"
    });
    return [];
  }
};

// Create a new stake
export const createStake = async (
  userId: string, 
  planId: string, 
  amount: number, 
  isCompounding: boolean
): Promise<boolean> => {
  try {
    // First check if user has sufficient balance
    const { data: userData, error: userError } = await supabase
      .from('user_profiles')
      .select('wallet_balance')
      .eq('id', userId)
      .single();
    
    if (userError) throw userError;
    
    if (!userData || userData.wallet_balance < amount) {
      toast({
        title: "Insufficient balance",
        description: "Please add funds to your wallet first",
        variant: "destructive"
      });
      return false;
    }
    
    // Get plan details to calculate end date
    const { data: planData, error: planError } = await supabase
      .from('staking_plans')
      .select('period')
      .eq('id', planId)
      .single();
    
    if (planError) throw planError;
    
    const startDate = new Date();
    const endDate = new Date(startDate);
    
    // Calculate end date based on period
    switch (planData.period) {
      case '7days':
        endDate.setDate(endDate.getDate() + 7);
        break;
      case '30days':
        endDate.setDate(endDate.getDate() + 30);
        break;
      case '90days':
        endDate.setDate(endDate.getDate() + 90);
        break;
      case '180days':
        endDate.setDate(endDate.getDate() + 180);
        break;
      case '365days':
        endDate.setDate(endDate.getDate() + 365);
        break;
    }
    
    // Begin a transaction
    const { error: transactionError } = await supabase.rpc('create_stake', {
      p_user_id: userId,
      p_plan_id: planId,
      p_amount: amount,
      p_start_date: startDate.toISOString(),
      p_end_date: endDate.toISOString(),
      p_is_compounding: isCompounding
    });
    
    if (transactionError) throw transactionError;
    
    toast({
      title: "Stake created successfully",
      description: `You have staked ${amount} for ${planData.period}`
    });
    
    return true;
  } catch (error) {
    console.error("Error creating stake:", error);
    toast({
      title: "Failed to create stake",
      description: "Please try again later",
      variant: "destructive"
    });
    return false;
  }
};

// Cancel an active stake
export const cancelStake = async (userId: string, stakeId: string): Promise<boolean> => {
  try {
    // Get stake details
    const { data: stakeData, error: stakeError } = await supabase
      .from('user_stakes')
      .select('amount, rewards')
      .eq('id', stakeId)
      .eq('user_id', userId)
      .single();
    
    if (stakeError) throw stakeError;
    
    // Calculate refund amount (principal + earned rewards up to now)
    const refundAmount = stakeData.amount + stakeData.rewards;
    
    // Update stake status and add refund to user's wallet
    const { error } = await supabase.rpc('cancel_stake', {
      p_stake_id: stakeId,
      p_user_id: userId,
      p_refund_amount: refundAmount
    });
    
    if (error) throw error;
    
    toast({
      title: "Stake cancelled",
      description: `${refundAmount} has been returned to your wallet`
    });
    
    return true;
  } catch (error) {
    console.error("Error cancelling stake:", error);
    toast({
      title: "Failed to cancel stake",
      description: "Please try again later",
      variant: "destructive"
    });
    return false;
  }
};

// Withdraw rewards from a stake
export const withdrawRewards = async (userId: string, stakeId: string): Promise<boolean> => {
  try {
    // Get stake details
    const { data: stakeData, error: stakeError } = await supabase
      .from('user_stakes')
      .select('rewards')
      .eq('id', stakeId)
      .eq('user_id', userId)
      .single();
    
    if (stakeError) throw stakeError;
    
    if (stakeData.rewards <= 0) {
      toast({
        title: "No rewards to withdraw",
        description: "Your stake hasn't generated any rewards yet"
      });
      return false;
    }
    
    // Withdraw rewards
    const { error } = await supabase.rpc('withdraw_stake_rewards', {
      p_stake_id: stakeId,
      p_user_id: userId
    });
    
    if (error) throw error;
    
    toast({
      title: "Rewards withdrawn",
      description: `${stakeData.rewards} has been added to your wallet`
    });
    
    return true;
  } catch (error) {
    console.error("Error withdrawing rewards:", error);
    toast({
      title: "Failed to withdraw rewards",
      description: "Please try again later",
      variant: "destructive"
    });
    return false;
  }
};

// Calculate current rewards for all active stakes
export const calculateStakingRewards = async (userId: string): Promise<{
  totalStaked: number;
  totalRewards: number;
}> => {
  try {
    const { data, error } = await supabase.rpc('calculate_user_staking_totals', {
      p_user_id: userId
    });
    
    if (error) throw error;
    
    return {
      totalStaked: data.total_staked || 0,
      totalRewards: data.total_rewards || 0
    };
  } catch (error) {
    console.error("Error calculating staking rewards:", error);
    return {
      totalStaked: 0,
      totalRewards: 0
    };
  }
};
