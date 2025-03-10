
import React, { useEffect, useState } from "react";
import AppLayout from "@/components/AppLayout";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, IndianRupee, ArrowDownCircle, ArrowUpCircle, Receipt } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { getUserTransactions, Transaction } from "@/lib/supabase/transactions";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

const TransactionHistory = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!user) return;
      
      setIsLoading(true);
      try {
        const userTransactions = await getUserTransactions(user.id);
        setTransactions(userTransactions);
      } catch (error) {
        console.error("Error fetching transactions:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransactions();
  }, [user]);

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'deposit':
        return <ArrowDownCircle className="h-4 w-4 text-green-500" />;
      case 'withdrawal':
        return <ArrowUpCircle className="h-4 w-4 text-red-500" />;
      case 'game_entry':
        return <Receipt className="h-4 w-4 text-orange-500" />;
      case 'game_win':
        return <IndianRupee className="h-4 w-4 text-green-500" />;
      case 'refund':
        return <ArrowDownCircle className="h-4 w-4 text-blue-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <AppLayout>
      <div className="container px-4 py-6 max-w-lg mx-auto">
        <h1 className="text-2xl font-bold text-white mb-2">Transaction History</h1>
        <p className="text-betster-300 mb-6">View all your deposits and withdrawals</p>
        
        <Separator className="my-6 bg-betster-700/40" />
        
        <Card className="bg-black/40 backdrop-blur-sm border border-betster-700/40">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Receipt className="h-5 w-5 mr-2 text-betster-400" />
              Your Transactions
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              // Loading skeleton
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center justify-between p-3 border-b border-betster-700/30">
                    <div className="flex items-center space-x-3">
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </div>
                    <Skeleton className="h-5 w-16" />
                  </div>
                ))}
              </div>
            ) : transactions.length > 0 ? (
              <div className="space-y-1">
                {transactions.map((transaction) => (
                  <div 
                    key={transaction.id} 
                    className="flex items-center justify-between p-3 hover:bg-betster-800/30 rounded-md transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="bg-betster-800 rounded-full p-2">
                        {getTransactionIcon(transaction.type)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">
                          {transaction.description || transaction.type}
                        </p>
                        <p className="text-xs text-betster-400">
                          {transaction.created_at 
                            ? format(new Date(transaction.created_at), 'dd MMM yyyy, h:mm a')
                            : ''}
                        </p>
                      </div>
                    </div>
                    <div className={`font-medium ${
                      ['deposit', 'game_win', 'refund'].includes(transaction.type) 
                        ? 'text-green-500' 
                        : 'text-red-500'
                    }`}>
                      {['deposit', 'game_win', 'refund'].includes(transaction.type) ? '+' : '-'}
                      ₹{Math.abs(transaction.amount).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="rounded-full bg-betster-800/50 p-4 mb-4">
                  <Receipt className="h-8 w-8 text-betster-400" />
                </div>
                <h3 className="text-lg font-medium text-white mb-2">No Transactions Yet</h3>
                <p className="text-betster-300">
                  You haven't made any transactions yet. Start by adding money to your wallet.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default TransactionHistory;
