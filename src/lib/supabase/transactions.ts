
import { supabase } from './client';
import { updateWalletBalance } from './profiles';

export const createTransaction = async (userId: string, amount: number, type: 'deposit' | 'withdrawal', paymentId?: string, gateway?: string) => {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .insert([
        {
          user_id: userId,
          amount,
          type,
          status: 'pending',
          payment_id: paymentId,
          gateway
        }
      ])
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
  }
};

export const updateTransactionStatus = async (transactionId: string, status: 'completed' | 'failed', transactionReceipt?: string) => {
  try {
    // First, get the transaction details to avoid an extra query later
    const { data: transaction, error: fetchError } = await supabase
      .from('transactions')
      .select('user_id, amount, type')
      .eq('id', transactionId)
      .single();
    
    if (fetchError) {
      console.error("Error fetching transaction details:", fetchError);
      throw fetchError;
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
    
    // If transaction is completed, update wallet balance
    if (status === 'completed' && transaction) {
      if (transaction.type === 'deposit') {
        await updateWalletBalance(transaction.user_id, transaction.amount);
      } else if (transaction.type === 'withdrawal') {
        await updateWalletBalance(transaction.user_id, -transaction.amount);
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
    // Optimize by only selecting needed fields
    const { data, error } = await supabase
      .from('transactions')
      .select('id, user_id, amount, type, status, payment_id, transaction_id, gateway, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

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
