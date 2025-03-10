
import { supabase } from '@/lib/supabase/client';
import { createTransaction, updateTransactionStatus } from '@/lib/supabase/transactions';
import { updateWalletBalance } from '@/lib/supabase/profiles';
import { toast } from '@/hooks/use-toast';

/**
 * Simulates a deposit for testing purposes without requiring an actual payment gateway
 */
export const simulateDeposit = async (
  userId: string,
  amount: number
): Promise<{ success: boolean; transactionId?: string }> => {
  try {
    console.log(`Simulating deposit of ${amount} for user ${userId}`);
    
    // Create a pending transaction
    const transaction = await createTransaction(
      userId,
      amount,
      'deposit',
      `Test deposit of ₹${amount}`
    );
    
    if (!transaction || !transaction.id) {
      throw new Error("Failed to create transaction record");
    }
    
    // Simulate a payment processing delay (0.5-1.5 seconds)
    const processingTime = 500 + Math.random() * 1000;
    
    // Simple timeout to simulate the async nature of payment processing
    setTimeout(async () => {
      try {
        // 95% success rate to simulate occasional payment failures
        const isSuccessful = Math.random() < 0.95;
        
        if (isSuccessful) {
          // Add amount to wallet
          await updateWalletBalance(userId, amount);
          
          // Update transaction status
          await updateTransactionStatus(transaction.id, 'completed', {
            gateway: 'test_gateway',
            paymentId: `test_pay_${Date.now()}`
          });
          
          toast({
            title: "Deposit Successful",
            description: `₹${amount} has been added to your wallet`,
          });
        } else {
          // Update transaction as failed
          await updateTransactionStatus(transaction.id, 'failed');
          
          toast({
            title: "Deposit Failed",
            description: "Your test deposit failed (5% of test transactions fail randomly)",
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error("Error in simulated payment process:", error);
      }
    }, processingTime);
    
    return { 
      success: true, 
      transactionId: transaction.id 
    };
  } catch (error) {
    console.error("Error initiating test deposit:", error);
    toast({
      title: "Test Payment Error",
      description: "Failed to initiate test deposit",
      variant: "destructive"
    });
    return { success: false };
  }
};

/**
 * Simulates a withdrawal for testing purposes
 */
export const simulateWithdrawal = async (
  userId: string,
  amount: number
): Promise<{ success: boolean; transactionId?: string }> => {
  try {
    console.log(`Simulating withdrawal of ${amount} for user ${userId}`);
    
    // First check if user has enough balance
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('wallet_balance')
      .eq('id', userId)
      .single();
      
    if (!profile || profile.wallet_balance < amount) {
      toast({
        title: "Insufficient Balance",
        description: `You need at least ₹${amount} in your wallet to withdraw this amount`,
        variant: "destructive"
      });
      return { success: false };
    }
    
    // Create a pending transaction
    const transaction = await createTransaction(
      userId,
      -amount,
      'withdrawal',
      `Test withdrawal of ₹${amount}`
    );
    
    if (!transaction || !transaction.id) {
      throw new Error("Failed to create transaction record");
    }
    
    // Simulate a processing delay
    const processingTime = 500 + Math.random() * 1000;
    
    setTimeout(async () => {
      try {
        // 90% success rate for withdrawals
        const isSuccessful = Math.random() < 0.9;
        
        if (isSuccessful) {
          // Deduct amount from wallet
          await updateWalletBalance(userId, -amount);
          
          // Update transaction status
          await updateTransactionStatus(transaction.id, 'completed', {
            gateway: 'test_gateway',
            paymentId: `test_withdraw_${Date.now()}`
          });
          
          toast({
            title: "Withdrawal Successful",
            description: `₹${amount} has been withdrawn from your wallet`,
          });
        } else {
          // Update transaction as failed
          await updateTransactionStatus(transaction.id, 'failed');
          
          toast({
            title: "Withdrawal Failed",
            description: "Your test withdrawal failed (10% of test withdrawals fail randomly)",
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error("Error in simulated withdrawal process:", error);
      }
    }, processingTime);
    
    return { 
      success: true, 
      transactionId: transaction.id 
    };
  } catch (error) {
    console.error("Error initiating test withdrawal:", error);
    toast({
      title: "Test Payment Error",
      description: "Failed to initiate test withdrawal",
      variant: "destructive"
    });
    return { success: false };
  }
};

/**
 * Get test payment methods for display in UI
 */
export const getTestPaymentMethods = () => {
  return [
    {
      id: 'test_upi',
      name: 'Test UPI',
      icon: '📱'
    },
    {
      id: 'test_card',
      name: 'Test Card',
      icon: '💳'
    },
    {
      id: 'test_netbanking',
      name: 'Test Netbanking',
      icon: '🏦'
    }
  ];
};
