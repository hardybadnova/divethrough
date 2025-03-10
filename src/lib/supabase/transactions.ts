
import { supabase } from './client';
import { updateWalletBalance } from './profiles';

export const createTransaction = async (userId: string, amount: number, type: 'deposit' | 'withdrawal', paymentId?: string, gateway?: string) => {
  console.log(`Creating transaction for user ${userId}: ${type} of ${amount}`);
  
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
    
    console.log("Transaction created successfully:", data);
    return data;
  } catch (error) {
    console.error("Failed to create transaction:", error);
    throw error;
  }
};

export const updateTransactionStatus = async (transactionId: string, status: 'completed' | 'failed', transactionReceipt?: string) => {
  console.log(`Updating transaction ${transactionId} status to ${status}`);
  
  try {
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
    
    // If transaction is completed and it's a deposit, update wallet balance
    if (status === 'completed') {
      const { data: transaction, error: fetchError } = await supabase
        .from('transactions')
        .select('user_id, amount, type')
        .eq('id', transactionId)
        .single();
      
      if (fetchError) {
        console.error("Error fetching transaction details:", fetchError);
        throw fetchError;
      }
      
      if (transaction) {
        console.log("Processing wallet update for transaction:", transaction);
        if (transaction.type === 'deposit') {
          await updateWalletBalance(transaction.user_id, transaction.amount);
        } else if (transaction.type === 'withdrawal') {
          await updateWalletBalance(transaction.user_id, -transaction.amount);
        }
      }
    }
    
    console.log("Transaction status updated successfully:", data);
    return data;
  } catch (error) {
    console.error("Failed to update transaction status:", error);
    throw error;
  }
};

export const getUserTransactions = async (userId: string) => {
  console.log(`Fetching transactions for user ${userId}`);
  
  try {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching user transactions:", error);
      throw error;
    }
    
    console.log(`Retrieved ${data?.length || 0} transactions`);
    return data || [];
  } catch (error) {
    console.error("Failed to get user transactions:", error);
    throw error;
  }
};
