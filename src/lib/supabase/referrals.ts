
import { toast } from '@/hooks/use-toast';
import { supabase } from './client';
import { updateWalletBalance } from './profiles';

export const createReferral = async (referrerId: string, referredEmail: string) => {
  // Generate a signup link with referrer ID
  const signupLink = `${window.location.origin}/signup?ref=${referrerId}`;
  
  // TODO: In real world, we would send an email to referredEmail with the signupLink
  // For now, we'll just return the link
  toast({
    title: "Referral Created",
    description: `A referral link has been generated. In a real app, this would be sent to ${referredEmail}.`,
  });
  
  return signupLink;
};

export const processReferralBonus = async (referrerId: string, newUserId: string) => {
  const bonusAmount = 10; // $10 bonus for referral
  
  const { data, error } = await supabase
    .from('referrals')
    .insert([
      {
        referrer_id: referrerId,
        referred_id: newUserId,
        bonus_amount: bonusAmount
      }
    ]);
    
  if (error) throw error;
  
  // Add bonus to referrer's wallet
  await updateWalletBalance(referrerId, bonusAmount);
  
  return { success: true, bonusAmount };
};
