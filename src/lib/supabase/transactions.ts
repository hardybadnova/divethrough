
import { supabase } from './client';
import { toast } from '@/hooks/use-toast';

// Transaction types for wallet operations
export type TransactionType = 'deposit' | 'withdrawal' | 'game_entry' | 'game_win' | 'refund';

// Status of the transaction
export type TransactionStatus = 'pending' | 'completed' | 'failed';

// Interface for transaction data
export interface Transaction {
  id?: string;
  user_id: string;
  amount: number;
  type: TransactionType;
  status: TransactionStatus;
  description: string;
  payment_gateway?: string;
  payment_id?: string;
  created_at?: string;
}

/**
 * Create a new transaction record in the database
 */
export const createTransaction = async (
  userId: string,
  amount: number,
  type: TransactionType,
  description: string
): Promise<Transaction | null> => {
  try {
    const transaction: Transaction = {
      user_id: userId,
      amount,
      type,
      status: 'pending',
      description
    };

    const { data, error } = await supabase
      .from('transactions')
      .insert([transaction])
      .select()
      .single();

    if (error) {
      console.error("Error creating transaction:", error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Error in createTransaction:", error);
    toast({
      title: "Transaction Error",
      description: "Failed to create transaction record",
      variant: "destructive"
    });
    return null;
  }
};

/**
 * Update transaction status after payment is processed
 */
export const updateTransactionStatus = async (
  transactionId: string,
  status: TransactionStatus,
  paymentDetails?: { gateway: string; paymentId: string }
): Promise<boolean> => {
  try {
    const updateData: Partial<Transaction> = { status };
    
    if (paymentDetails) {
      updateData.payment_gateway = paymentDetails.gateway;
      updateData.payment_id = paymentDetails.paymentId;
    }
    
    const { error } = await supabase
      .from('transactions')
      .update(updateData)
      .eq('id', transactionId);

    if (error) {
      console.error("Error updating transaction:", error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error("Error in updateTransactionStatus:", error);
    toast({
      title: "Transaction Error",
      description: "Failed to update transaction status",
      variant: "destructive"
    });
    return false;
  }
};

/**
 * Get all transactions for a user
 */
export const getUserTransactions = async (userId: string): Promise<Transaction[]> => {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching transactions:", error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error("Error in getUserTransactions:", error);
    toast({
      title: "Transaction Error",
      description: "Failed to fetch transaction history",
      variant: "destructive"
    });
    return [];
  }
};

/**
 * Initialize payment for adding money to wallet
 * This is a placeholder for actual payment gateway integration
 */
export const initiateWalletDeposit = async (
  userId: string,
  amount: number
): Promise<{ transactionId: string; paymentUrl?: string }> => {
  try {
    // Create a transaction record first
    const transaction = await createTransaction(
      userId,
      amount,
      'deposit',
      `Wallet deposit of ₹${amount}`
    );

    if (!transaction || !transaction.id) {
      throw new Error("Failed to create transaction record");
    }

    // Return the transaction ID
    // In a real implementation, we would also return a payment URL or gateway token
    return {
      transactionId: transaction.id,
      // Eventually, this would point to the payment gateway checkout page
      paymentUrl: `/api/payment/checkout?amount=${amount}&txnId=${transaction.id}`
    };
  } catch (error) {
    console.error("Error initiating wallet deposit:", error);
    toast({
      title: "Payment Error",
      description: "Failed to initiate payment process",
      variant: "destructive"
    });
    throw error;
  }
};
