
import { simulateDeposit, simulateWithdrawal } from './game/testPaymentService';

/**
 * Initialize a deposit to the user's wallet
 * In test mode, this uses the test payment service
 */
export const initializeDeposit = async (userId: string, amount: number): Promise<{ success: boolean; transactionId?: string }> => {
  // For now, we're using the test payment service
  return await simulateDeposit(userId, amount);
};

/**
 * Initiate a withdrawal from the user's wallet
 * In test mode, this uses the test payment service
 */
export const initiateWithdrawal = async (userId: string, amount: number): Promise<boolean> => {
  // For now, we're using the test payment service
  try {
    const result = await simulateWithdrawal(userId, amount);
    return result.success;
  } catch (error) {
    console.error("Error in initiateWithdrawal:", error);
    return false;
  }
};
