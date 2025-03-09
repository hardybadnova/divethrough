
import { supabase } from './client';
import { updateWalletBalance } from './profiles';

export const createTransaction = async (userId: string, amount: number, type: 'deposit' | 'withdrawal', paymentId?: string) => {
  const { data, error } = await supabase
    .from('transactions')
    .insert([
      {
        user_id: userId,
        amount,
        type,
        status: 'pending',
        payment_id: paymentId
      }
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateTransactionStatus = async (transactionId: string, status: 'completed' | 'failed', transactionReceipt?: string) => {
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

  if (error) throw error;
  
  // If transaction is completed and it's a deposit, update wallet balance
  if (status === 'completed') {
    const { data: transaction } = await supabase
      .from('transactions')
      .select('user_id, amount, type')
      .eq('id', transactionId)
      .single();
    
    if (transaction) {
      if (transaction.type === 'deposit') {
        await updateWalletBalance(transaction.user_id, transaction.amount);
      } else if (transaction.type === 'withdrawal') {
        await updateWalletBalance(transaction.user_id, -transaction.amount);
      }
    }
  }
  
  return data;
};

export const getUserTransactions = async (userId: string) => {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};
