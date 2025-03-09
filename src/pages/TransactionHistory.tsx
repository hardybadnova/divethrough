import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import AppLayout from "@/components/AppLayout";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { ArrowDown, ArrowUp, RefreshCw, Wallet, CreditCard } from "lucide-react";
import { formatCurrency } from "@/lib/formatters";
import { supabase } from '@/lib/supabase';

interface Transaction {
  id: string;
  user_id: string;
  amount: number;
  type: 'deposit' | 'withdrawal' | 'game_winning' | 'hint_purchase';
  status: 'pending' | 'completed' | 'failed';
  payment_id: string | null;
  transaction_id: string | null;
  gateway?: 'cashfree' | 'stripe' | 'paytm' | null;
  created_at: string;
}

const TransactionHistory = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalFees, setTotalFees] = useState(0);

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!user) return;

      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('transactions')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        setTransactions(data || []);

        const completedTransactions = data?.filter(t => t.status === 'completed') || [];
        
        const calculateFeeForTransaction = (transaction: Transaction) => {
          if (transaction.type === 'deposit') {
            return Math.max((transaction.amount * 2) / 100, 5);
          } else if (transaction.type === 'withdrawal') {
            return Math.max((transaction.amount * 1) / 100, 5);
          } else if (transaction.type === 'game_winning') {
            return (transaction.amount * 10) / 100;
          }
          return 0;
        };
        
        const fees = completedTransactions.reduce((sum, t) => sum + calculateFeeForTransaction(t), 0);
        setTotalFees(fees);
      } catch (error) {
        console.error("Error fetching transactions:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransactions();
  }, [user]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-500';
      case 'pending':
        return 'text-amber-500';
      case 'failed':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };
  
  const calculateFee = (transaction: Transaction): number => {
    if (transaction.type === 'deposit') {
      return Math.max((transaction.amount * 2) / 100, 5);
    } else if (transaction.type === 'withdrawal') {
      return Math.max((transaction.amount * 1) / 100, 5);
    } else if (transaction.type === 'game_winning') {
      return (transaction.amount * 10) / 100;
    }
    return 0;
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'deposit':
        return <ArrowDown className="h-5 w-5 text-green-500" />;
      case 'withdrawal':
        return <ArrowUp className="h-5 w-5 text-amber-500" />;
      case 'game_winning':
        return <Wallet className="h-5 w-5 text-blue-500" />;
      case 'hint_purchase':
        return <RefreshCw className="h-5 w-5 text-purple-500" />;
      default:
        return <Wallet className="h-5 w-5 text-betster-400" />;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'deposit':
      case 'game_winning':
        return 'text-green-500';
      case 'withdrawal':
      case 'hint_purchase':
        return 'text-amber-500';
      default:
        return 'text-betster-400';
    }
  };

  const getGatewayName = (gateway: string | null | undefined) => {
    switch (gateway) {
      case 'cashfree':
        return 'Cashfree';
      case 'stripe':
        return 'Stripe';
      case 'paytm':
        return 'Paytm';
      default:
        return 'Default';
    }
  };

  return (
    <AppLayout>
      <div className="container px-4 py-6 max-w-lg mx-auto">
        <h1 className="text-2xl font-bold text-white mb-2">Transaction History</h1>
        <p className="text-betster-300 mb-6">View all your deposits and withdrawals</p>
        
        <Separator className="mb-6 bg-betster-700/40" />
        
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <RefreshCw className="h-8 w-8 text-betster-400 animate-spin" />
            <p className="text-betster-300 mt-4">Loading transactions...</p>
          </div>
        ) : transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="rounded-full bg-betster-800/50 p-4 mb-4">
              <Wallet className="h-8 w-8 text-betster-400" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">No transactions yet</h3>
            <p className="text-betster-300">
              Your transaction history will appear here once you've made deposits or withdrawals.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {transactions.map((transaction) => (
              <div 
                key={transaction.id} 
                className="rounded-xl bg-black/40 backdrop-blur-sm border border-betster-700/40 p-4"
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center">
                    <div className="mr-3 rounded-full p-2 bg-betster-800/50">
                      {getTransactionIcon(transaction.type)}
                    </div>
                    <div>
                      <h3 className="font-medium text-white capitalize">
                        {transaction.type.replace('_', ' ')}
                      </h3>
                      <p className="text-xs text-betster-400">
                        {format(new Date(transaction.created_at), 'PPp')}
                      </p>
                      {transaction.payment_id && (
                        <p className="text-xs text-betster-400 mt-1">
                          ID: {transaction.payment_id}
                        </p>
                      )}
                      {transaction.gateway && transaction.type === 'deposit' && (
                        <p className="text-xs text-betster-400 mt-1 flex items-center">
                          <CreditCard className="h-3 w-3 mr-1" />
                          {getGatewayName(transaction.gateway)}
                        </p>
                      )}
                      <p className="text-xs text-betster-400 mt-1">
                        Fee: {formatCurrency(calculateFee(transaction))}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className={`font-medium ${getTransactionColor(transaction.type)}`}>
                      {transaction.type === 'deposit' || transaction.type === 'game_winning' ? '+' : '-'}
                      {formatCurrency(transaction.amount)}
                    </p>
                    <p className={`text-xs capitalize ${getStatusColor(transaction.status)}`}>
                      {transaction.status}
                    </p>
                  </div>
                </div>
              </div>
            ))}

            {totalFees > 0 && (
              <div className="mt-6 p-4 rounded-xl bg-betster-900/40 border border-betster-700/40">
                <p className="text-betster-300 text-sm">
                  Total fees paid: <span className="text-white font-medium">{formatCurrency(totalFees)}</span>
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default TransactionHistory;
