
import { toast } from '@/hooks/use-toast';
import { supabase, updateWalletBalance } from '@/lib/supabase';

interface TransactionDetails {
  userId: string;
  amount: number;
  type: 'deposit' | 'withdrawal';
  status: 'pending' | 'completed' | 'failed';
  paymentId?: string;
  transactionId?: string;
}

// Payment gateway configuration
const CASHFREE_APP_ID = 'TEST95084239c7cdea0ebcb9ef6f69499153';
const CASHFREE_SECRET_KEY = 'TEST5885e4c10d527ca4de110294ec11046c55998677';

// Platform fee configuration - revenue model
const FEE_PERCENTAGE = {
  deposit: 2, // 2% fee on deposits
  withdrawal: 1, // 1% fee on withdrawals
  minimum: 5, // Minimum fee amount in ₹
  game: 10, // 10% house fee on game winnings
};

// Calculate transaction fee
export const calculateFee = (amount: number, type: 'deposit' | 'withdrawal'): number => {
  const percentage = FEE_PERCENTAGE[type];
  const calculatedFee = (amount * percentage) / 100;
  return Math.max(calculatedFee, FEE_PERCENTAGE.minimum);
};

// Calculate game winnings fee (house cut)
export const calculateGameFee = (winningAmount: number): number => {
  return (winningAmount * FEE_PERCENTAGE.game) / 100;
};

// Log transaction in Supabase
export const logTransaction = async (transaction: TransactionDetails) => {
  try {
    // Check if fee column exists in transactions table
    const { error: columnCheckError } = await supabase
      .from('transactions')
      .select('*')
      .limit(1);
    
    // If there's no error, the table and columns exist
    if (!columnCheckError) {
      const { error } = await supabase
        .from('transactions')
        .insert([{
          user_id: transaction.userId,
          amount: transaction.amount,
          type: transaction.type,
          status: transaction.status,
          payment_id: transaction.paymentId || null,
          transaction_id: transaction.transactionId || null,
          created_at: new Date().toISOString()
        }]);
      
      if (error) throw error;
    } else {
      console.error("Error checking transactions table:", columnCheckError);
      // If we can't log to the database, at least log to console for debugging
      console.log("Transaction (not saved to DB):", transaction);
    }
  } catch (error) {
    console.error("Error logging transaction:", error);
    throw error;
  }
};

// Initialize Cashfree payment
export const initializeDeposit = async (userId: string, amount: number) => {
  if (amount < 100) {
    toast({
      title: "Invalid amount",
      description: "Minimum deposit amount is ₹100",
      variant: "destructive"
    });
    return null;
  }
  
  // Calculate fee
  const fee = calculateFee(amount, 'deposit');
  const totalAmount = amount + fee;
  
  try {
    const orderId = `order_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    
    // Create a transaction record in pending state
    await logTransaction({
      userId,
      amount,
      type: 'deposit',
      status: 'pending',
      paymentId: orderId,
    });
    
    toast({
      title: "Processing with Cashfree",
      description: "You'll be redirected to complete the payment."
    });
    
    // Mock successful payment after a delay (in real implementation, this would be handled by Cashfree)
    setTimeout(async () => {
      try {
        // Log the transaction
        await logTransaction({
          userId,
          amount,
          type: 'deposit',
          status: 'completed',
          paymentId: orderId,
        });
        
        // Update user's wallet balance
        const newBalance = await updateWalletBalance(userId, amount);
        
        toast({
          title: "Deposit Successful",
          description: `₹${amount} has been added to your wallet (Fee: ₹${fee}).`
        });
        
        // Refresh the page to show updated balance
        window.location.reload();
      } catch (error) {
        console.error("Error processing Cashfree deposit:", error);
        toast({
          title: "Deposit Error",
          description: "There was an error processing your deposit. Please contact support.",
          variant: "destructive"
        });
      }
    }, 3000);
    
    return true;
  } catch (error) {
    console.error("Cashfree initialization error:", error);
    toast({
      title: "Payment Gateway Error",
      description: "Unable to initialize Cashfree payment. Please try again later.",
      variant: "destructive"
    });
    return null;
  }
};

// Process withdrawal
export const initiateWithdrawal = async (userId: string, amount: number, accountDetails: any) => {
  if (amount < 100) {
    toast({
      title: "Invalid amount",
      description: "Minimum withdrawal amount is ₹100",
      variant: "destructive"
    });
    return false;
  }
  
  // Calculate fee
  const fee = calculateFee(amount, 'withdrawal');
  const totalDeduction = amount + fee;
  
  try {
    // In a real implementation, you would call your backend to process the withdrawal
    // For this demo, we'll simulate a successful withdrawal
    
    // Log the transaction
    await logTransaction({
      userId,
      amount,
      type: 'withdrawal',
      status: 'pending',
    });
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Update user's wallet balance (deduct amount plus fee)
    const newBalance = await updateWalletBalance(userId, -totalDeduction);
    
    // Update transaction status to completed
    const { error } = await supabase
      .from('transactions')
      .update({ status: 'completed' })
      .eq('user_id', userId)
      .eq('type', 'withdrawal')
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(1);
    
    if (error) {
      console.error("Error updating transaction status:", error);
    }
    
    toast({
      title: "Withdrawal Initiated",
      description: `₹${amount} will be credited to your account within 24-48 hours (Fee: ₹${fee}).`
    });
    
    return newBalance;
  } catch (error) {
    console.error("Withdrawal error:", error);
    toast({
      title: "Withdrawal Error",
      description: "There was an error processing your withdrawal. Please contact support.",
      variant: "destructive"
    });
    return false;
  }
};
