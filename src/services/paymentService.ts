
import { toast } from '@/hooks/use-toast';
import { simulateDeposit, simulateWithdrawal } from './game/testPaymentService';

/**
 * Calculate platform fee for transactions
 */
export const calculateFee = (amount: number): number => {
  // 2% platform fee
  return amount * 0.02;
};

/**
 * Calculate game entry fee (including platform fee)
 */
export const calculateGameFee = (baseAmount: number): number => {
  const fee = calculateFee(baseAmount);
  return baseAmount + fee;
};

/**
 * Initialize deposit using test payment system
 */
export const initializeDeposit = async (
  userId: string,
  amount: number,
  paymentMethod: string = 'test_upi'
): Promise<{ transactionId?: string; success: boolean }> => {
  try {
    // Validate amount
    if (amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount to deposit",
        variant: "destructive"
      });
      return { success: false };
    }
    
    // Use our test payment system
    return await simulateDeposit(userId, amount);
    
  } catch (error) {
    console.error("Error initializing deposit:", error);
    toast({
      title: "Payment Error",
      description: "Failed to initiate payment process",
      variant: "destructive"
    });
    return { success: false };
  }
};

/**
 * Initialize withdrawal using test payment system
 */
export const initiateWithdrawal = async (
  userId: string,
  amount: number,
  withdrawalMethod: string = 'test_upi'
): Promise<boolean> => {
  try {
    // Validate amount
    if (amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount to withdraw",
        variant: "destructive"
      });
      return false;
    }
    
    // Use test withdrawal system
    const result = await simulateWithdrawal(userId, amount);
    return result.success;
    
  } catch (error) {
    console.error("Error initiating withdrawal:", error);
    toast({
      title: "Withdrawal Error",
      description: "Failed to initiate withdrawal process",
      variant: "destructive"
    });
    return false;
  }
};

// Legacy compatibility functions (used in older code but now just use the standard methods)
export const initializeCashfreeDeposit = initializeDeposit;
export const initializeStripeDeposit = initializeDeposit;
export const initializePaytmDeposit = initializeDeposit;
