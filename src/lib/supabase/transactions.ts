
import { supabase } from './client';
import { updateWalletBalance } from './profiles';

// Track ongoing transactions to prevent duplicates
const ongoingTransactions = new Set<string>();

export const createTransaction = async (userId: string, amount: number, type: 'deposit' | 'withdrawal' | 'game_entry' | 'game_refund' | 'game_winning', paymentId?: string, gateway?: string) => {
  // Create a unique transaction key to prevent duplicates
  const transactionKey = `${userId}-${type}-${amount}-${paymentId || Date.now()}`;
  
  if (ongoingTransactions.has(transactionKey)) {
    console.log(`Transaction ${transactionKey} already in progress, skipping duplicate`);
    return null;
  }
  
  try {
    ongoingTransactions.add(transactionKey);
    
    // Prepare transaction data, conditionally adding gateway if provided
    const transactionData: any = {
      user_id: userId,
      amount,
      type,
      status: 'pending',
      payment_id: paymentId
    };
    
    // Only add gateway field if it's provided
    if (gateway) {
      transactionData.gateway = gateway;
    }
    
    const { data, error } = await supabase
      .from('transactions')
      .insert([transactionData])
      .select()
      .single();

    if (error) {
      console.error("Error creating transaction:", error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error("Failed to create transaction:", error);
    throw error;
  } finally {
    // Remove transaction from tracking after completion or error
    ongoingTransactions.delete(transactionKey);
  }
};

export const updateTransactionStatus = async (transactionId: string, status: 'completed' | 'failed', transactionReceipt?: string) => {
  try {
    // First, get the transaction details to avoid an extra query later
    const { data: transaction, error: fetchError } = await supabase
      .from('transactions')
      .select('user_id, amount, type, status')
      .eq('id', transactionId)
      .single();
    
    if (fetchError) {
      console.error("Error fetching transaction details:", fetchError);
      throw fetchError;
    }
    
    // Skip if transaction is already in the target status
    if (transaction.status === status) {
      console.log(`Transaction ${transactionId} already has status ${status}, skipping update`);
      return transaction;
    }
    
    // Update the transaction status
    const { data, error } = await supabase
      .from('transactions')
      .update({ 
        status, 
        transaction_id: transactionReceipt,
        updated_at: new Date().toISOString()
      })
      .eq('id', transactionId)
      .select()
      .single();

    if (error) {
      console.error("Error updating transaction status:", error);
      throw error;
    }
    
    // If transaction is completed, update wallet balance immediately
    if (status === 'completed' && transaction) {
      try {
        if (transaction.type === 'deposit' || transaction.type === 'game_refund' || transaction.type === 'game_winning') {
          await updateWalletBalance(transaction.user_id, transaction.amount);
        } else if (transaction.type === 'withdrawal' || transaction.type === 'game_entry') {
          await updateWalletBalance(transaction.user_id, -transaction.amount);
        }
      } catch (balanceError) {
        console.error("Failed to update wallet balance:", balanceError);
        // Don't block the transaction update if balance update fails
        // Just log the error
      }
    }
    
    return data;
  } catch (error) {
    console.error("Failed to update transaction status:", error);
    throw error;
  }
};

export const getUserTransactions = async (userId: string) => {
  try {
    // Optimize by only selecting needed fields and limiting results
    const { data, error } = await supabase
      .from('transactions')
      .select('id, user_id, amount, type, status, payment_id, transaction_id, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(100); // Limit to most recent 100 transactions for performance

    if (error) {
      console.error("Error fetching user transactions:", error);
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error("Failed to get user transactions:", error);
    throw error;
  }
};
