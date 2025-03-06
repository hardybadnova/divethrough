
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

// Razorpay configuration
const RAZORPAY_KEY_ID = 'rzp_test_qD3OinypDKOelt';

// Log transaction in Supabase
export const logTransaction = async (transaction: TransactionDetails) => {
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
};

// Initialize Razorpay payment
export const initializeDeposit = async (userId: string, amount: number) => {
  if (amount < 100) {
    toast({
      title: "Invalid amount",
      description: "Minimum deposit amount is ₹100",
      variant: "destructive"
    });
    return null;
  }
  
  try {
    // In a real implementation, you would call your backend to create a Razorpay order
    // For this demo, we'll create a mock order
    const orderOptions = {
      key: RAZORPAY_KEY_ID,
      amount: amount * 100, // Razorpay expects amount in paise
      currency: "INR",
      name: "Betster",
      description: "Wallet Deposit",
      image: "/favicon.ico",
      handler: async function(response: any) {
        // This function is called when payment is successful
        const paymentId = response.razorpay_payment_id;
        
        try {
          // Log the transaction
          await logTransaction({
            userId,
            amount,
            type: 'deposit',
            status: 'completed',
            paymentId
          });
          
          // Update user's wallet balance
          const newBalance = await updateWalletBalance(userId, amount);
          
          toast({
            title: "Deposit Successful",
            description: `₹${amount} has been added to your wallet.`
          });
          
          return newBalance;
        } catch (error) {
          console.error("Error processing deposit:", error);
          toast({
            title: "Deposit Error",
            description: "There was an error processing your deposit. Please contact support.",
            variant: "destructive"
          });
        }
      },
      prefill: {
        name: "Betster User",
        email: "user@example.com",
        contact: "9999999999"
      },
      theme: {
        color: "#7e22ce"
      }
    };
    
    // Create a transaction record in pending state
    await logTransaction({
      userId,
      amount,
      type: 'deposit',
      status: 'pending'
    });
    
    // Open Razorpay payment window
    const rzp = new (window as any).Razorpay(orderOptions);
    rzp.open();
    return rzp;
  } catch (error) {
    console.error("Razorpay initialization error:", error);
    toast({
      title: "Payment Gateway Error",
      description: "Unable to initialize payment gateway. Please try again later.",
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
    
    // Update user's wallet balance (deduct amount)
    const newBalance = await updateWalletBalance(userId, -amount);
    
    // Update transaction status to completed
    const { error } = await supabase
      .from('transactions')
      .update({ status: 'completed' })
      .eq('user_id', userId)
      .eq('type', 'withdrawal')
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(1);
    
    if (error) throw error;
    
    toast({
      title: "Withdrawal Initiated",
      description: `₹${amount} will be credited to your account within 24-48 hours.`
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
