import { toast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { createTransaction, updateTransactionStatus } from '@/lib/supabase/transactions';

interface TransactionDetails {
  userId: string;
  amount: number;
  type: 'deposit' | 'withdrawal' | 'game_winning' | 'hint_purchase';
  status: 'pending' | 'completed' | 'failed';
  paymentId?: string;
  transactionId?: string;
  gateway?: 'cashfree' | 'stripe' | 'paytm';
}

// Payment gateway configuration
const CASHFREE_APP_ID = 'TEST1050364227aadbc5e977b98a56c724630501';
const CASHFREE_SECRET_KEY = 'cfsk_ma_test_be76096631251143fd00141829278e44_7628a771';
const STRIPE_PK = 'pk_test_51IQwmASA9GcVG1TrzK96lKaLxzkjI9LBJQe46YUXHXGnYwU0IskXGM8s5gSZgWOdREwQ0vvl3kPdfqLTntCY4Drx00wXrQyPSV';
const PAYTM_MERCHANT_ID = 'TEST_MERCHANT_ID';
const PAYTM_MERCHANT_KEY = 'TEST_MERCHANT_KEY';

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

// Initialize Cashfree payment with improved error handling and response
export const initializeCashfreeDeposit = async (userId: string, amount: number) => {
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
    
    // Create transaction record first
    const transaction = await createTransaction(
      userId,
      amount,
      'deposit',
      orderId,
      'cashfree'
    );
    
    if (!transaction) {
      throw new Error("Failed to create transaction record");
    }
    
    toast({
      title: "Initializing Cashfree",
      description: "Preparing payment gateway..."
    });
    
    // In a real implementation we would make an API call to Cashfree to create an order
    // Here we'll simulate a faster and more reliable response
    
    // Mock successful payment after a shorter delay
    const mockPayment = async () => {
      try {
        // Update transaction status
        await updateTransactionStatus(
          transaction.id,
          'completed',
          `cf_${Date.now()}`
        );
        
        toast({
          title: "Payment Successful",
          description: `₹${amount} has been added to your wallet (Fee: ₹${fee}).`
        });
        
        // Refresh the page to show updated balance
        window.location.reload();
      } catch (error) {
        console.error("Error processing Cashfree deposit:", error);
        
        // Mark transaction as failed
        await updateTransactionStatus(
          transaction.id,
          'failed'
        );
        
        toast({
          title: "Payment Failed",
          description: "There was an error processing your payment. Please try again.",
          variant: "destructive"
        });
      }
    };
    
    // Execute with a shorter delay (1 second instead of 3)
    setTimeout(mockPayment, 1000);
    
    return true;
  } catch (error) {
    console.error("Cashfree initialization error:", error);
    toast({
      title: "Payment Gateway Error",
      description: "Unable to initialize Cashfree payment. Please try again.",
      variant: "destructive"
    });
    return null;
  }
};

// Initialize Stripe payment
export const initializeStripeDeposit = async (userId: string, amount: number) => {
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
    const paymentId = `stripe_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    
    // Create a transaction record using the proper function
    const transaction = await createTransaction(
      userId,
      amount,
      'deposit',
      paymentId,
      'stripe'
    );
    
    toast({
      title: "Processing with Stripe",
      description: "You'll be redirected to complete the payment."
    });
    
    // Mock successful payment after a delay
    setTimeout(async () => {
      try {
        // Update transaction status
        if (transaction) {
          await updateTransactionStatus(
            transaction.id,
            'completed',
            `stripe_${Date.now()}`
          );
        }
        
        toast({
          title: "Deposit Successful",
          description: `₹${amount} has been added to your wallet (Fee: ₹${fee}).`
        });
        
        // Refresh the page to show updated balance
        window.location.reload();
      } catch (error) {
        console.error("Error processing Stripe deposit:", error);
        toast({
          title: "Deposit Error",
          description: "There was an error processing your deposit. Please contact support.",
          variant: "destructive"
        });
      }
    }, 3000);
    
    return true;
  } catch (error) {
    console.error("Stripe initialization error:", error);
    toast({
      title: "Payment Gateway Error",
      description: "Unable to initialize Stripe payment. Please try again later.",
      variant: "destructive"
    });
    return null;
  }
};

// Initialize Paytm payment
export const initializePaytmDeposit = async (userId: string, amount: number) => {
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
    const paymentId = `paytm_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    
    // Create a transaction record using the proper function
    const transaction = await createTransaction(
      userId,
      amount,
      'deposit',
      paymentId,
      'paytm'
    );
    
    toast({
      title: "Processing with Paytm",
      description: "You'll be redirected to complete the payment."
    });
    
    // Mock successful payment after a delay
    setTimeout(async () => {
      try {
        // Update transaction status
        if (transaction) {
          await updateTransactionStatus(
            transaction.id,
            'completed',
            `paytm_${Date.now()}`
          );
        }
        
        toast({
          title: "Deposit Successful",
          description: `₹${amount} has been added to your wallet (Fee: ₹${fee}).`
        });
        
        // Refresh the page to show updated balance
        window.location.reload();
      } catch (error) {
        console.error("Error processing Paytm deposit:", error);
        toast({
          title: "Deposit Error",
          description: "There was an error processing your deposit. Please contact support.",
          variant: "destructive"
        });
      }
    }, 3000);
    
    return true;
  } catch (error) {
    console.error("Paytm initialization error:", error);
    toast({
      title: "Payment Gateway Error",
      description: "Unable to initialize Paytm payment. Please try again later.",
      variant: "destructive"
    });
    return null;
  }
};

// Initialize deposit based on selected gateway
export const initializeDeposit = async (userId: string, amount: number, gateway: 'cashfree' | 'stripe' | 'paytm' = 'cashfree') => {
  switch (gateway) {
    case 'stripe':
      return initializeStripeDeposit(userId, amount);
    case 'paytm':
      return initializePaytmDeposit(userId, amount);
    case 'cashfree':
    default:
      return initializeCashfreeDeposit(userId, amount);
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
    // Create a transaction record using the proper function
    const transaction = await createTransaction(
      userId,
      amount,
      'withdrawal'
    );
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Update user's wallet balance (deduct amount plus fee)
    const newBalance = await supabase.rpc('update_wallet_balance', {
      user_id: userId,
      amount_change: -totalDeduction
    });
    
    // Update transaction status
    if (transaction) {
      await updateTransactionStatus(
        transaction.id,
        'completed',
        `withdrawal_${Date.now()}`
      );
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
