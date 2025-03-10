
import React from "react";
import AppLayout from "@/components/AppLayout";
import { Separator } from "@/components/ui/separator";
import { Wallet, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const TransactionHistory = () => {
  return (
    <AppLayout>
      <div className="container px-4 py-6 max-w-lg mx-auto">
        <h1 className="text-2xl font-bold text-white mb-2">Transaction History</h1>
        <p className="text-betster-300 mb-6">View all your deposits and withdrawals</p>
        
        <Separator className="my-6 bg-betster-700/40" />
        
        <Card className="bg-black/40 backdrop-blur-sm border border-betster-700/40">
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertCircle className="h-5 w-5 mr-2 text-amber-500" />
              Feature Disabled
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="rounded-full bg-betster-800/50 p-4 mb-4">
                <Wallet className="h-8 w-8 text-betster-400" />
              </div>
              <h3 className="text-lg font-medium text-white mb-2">Transaction History Unavailable</h3>
              <p className="text-betster-300">
                Payment and wallet functionality has been removed from the application.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default TransactionHistory;
