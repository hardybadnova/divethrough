
import { simulateDeposit, simulateWithdrawal } from './game/testPaymentService';
import { createTransaction, updateTransactionStatus } from '@/lib/supabase/transactions';
import { updateWalletBalance } from '@/lib/supabase/profiles';

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

/**
 * Process game winnings - properly adds money to winner's wallet
 */
export const processGameWinnings = async (
  userId: string, 
  amount: number, 
  poolId: string
): Promise<number | void> => {
  try {
    // Create winning transaction
    const transaction = await createTransaction(
      userId,
      amount,
      'game_win', // using the correct transaction type
      `Prize for winning in pool ${poolId}`
    );
    
    // Add prize to winner's wallet
    const newBalance = await updateWalletBalance(userId, amount);
    
    // Mark transaction as completed
    if (transaction && transaction.id) {
      await updateTransactionStatus(transaction.id, 'completed');
    }
    
    console.log(`Added ${amount} to winner ${userId}'s wallet`);
    return newBalance;
  } catch (error) {
    console.error("Error processing game winnings:", error);
    return;
  }
};

/**
 * Process game entry fee - properly deducts money from player's wallet
 */
export const processGameEntryFee = async (
  userId: string, 
  amount: number, 
  poolId: string
): Promise<number | void> => {
  try {
    // Create entry fee transaction
    const transaction = await createTransaction(
      userId,
      -amount, // negative amount for deduction
      'game_entry',
      `Entry fee for pool ${poolId}`
    );
    
    // Deduct fee from player's wallet
    const newBalance = await updateWalletBalance(userId, -amount);
    
    // Mark transaction as completed
    if (transaction && transaction.id) {
      await updateTransactionStatus(transaction.id, 'completed');
    }
    
    console.log(`Deducted ${amount} from player ${userId}'s wallet for pool entry`);
    return newBalance;
  } catch (error) {
    console.error("Error processing game entry fee:", error);
    return;
  }
};
