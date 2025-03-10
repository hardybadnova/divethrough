
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

// Initialize Cashfree payment with improved reliability
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
    // Generate a unique order ID
    const orderId = `cf_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
    
    toast({
      title: "Initializing payment",
      description: "Preparing Cashfree gateway..."
    });
    
    // Create transaction record first - ensures we have a record even if the process fails
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
    
    // Show immediate feedback
    toast({
      title: "Processing payment",
      description: "Your payment is being processed..."
    });
    
    // Simulate quick payment success for better testing
    // Only wait 250ms to make it feel more responsive
    await new Promise(resolve => setTimeout(resolve, 250));
    
    try {
      // Update transaction status
      await updateTransactionStatus(
        transaction.id,
        'completed',
        `cf_success_${Date.now()}`
      );
      
      toast({
        title: "Payment Successful!",
        description: `₹${amount} has been added to your wallet (Fee: ₹${fee}).`
      });
      
      // Refresh the page after a small delay to show updated balance
      setTimeout(() => {
        window.location.reload();
      }, 1000);
      return true;
      
    } catch (error) {
      console.error("Error finalizing Cashfree transaction:", error);
      
      // Mark transaction as failed
      await updateTransactionStatus(
        transaction.id,
        'failed'
      );
      
      toast({
        title: "Payment Processing Error",
        description: "There was a problem finalizing your payment. Please try again.",
        variant: "destructive"
      });
      return null;
    }
    
  } catch (error) {
    console.error("Cashfree payment error:", error);
    toast({
      title: "Payment Failed",
      description: "Unable to process your payment. Please try again or contact support.",
      variant: "destructive"
    });
    return null;
  }
};

// Initialize Stripe payment with improved reliability
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
    
    // Mock successful payment after a short delay
    setTimeout(async () => {
      try {
        // Update transaction status
        if (transaction) {
          await updateTransactionStatus(
            transaction.id,
            'completed',
            `stripe_success_${Date.now()}`
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
    }, 1000);
    
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

// Initialize Paytm payment with improved reliability
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
    
    // Mock successful payment after a short delay
    setTimeout(async () => {
      try {
        // Update transaction status
        if (transaction) {
          await updateTransactionStatus(
            transaction.id,
            'completed',
            `paytm_success_${Date.now()}`
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
    }, 1000);
    
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

// Process withdrawal with improved error handling
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
    // Create a transaction record first
    const transaction = await createTransaction(
      userId,
      amount,
      'withdrawal'
    );
    
    if (!transaction) {
      throw new Error("Failed to create withdrawal transaction");
    }
    
    toast({
      title: "Processing Withdrawal",
      description: "Your withdrawal is being processed..."
    });
    
    // Update transaction status - this will trigger wallet update
    await updateTransactionStatus(
      transaction.id,
      'completed',
      `withdrawal_${Date.now()}`
    );
    
    toast({
      title: "Withdrawal Initiated",
      description: `₹${amount} will be credited to your account within 24-48 hours (Fee: ₹${fee}).`
    });
    
    // Refresh the page after a small delay
    setTimeout(() => {
      window.location.reload();
    }, 1000);
    
    return true;
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
