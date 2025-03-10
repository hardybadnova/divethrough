
import React, { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TestWalletPanel } from '@/components/wallet/TestWalletPanel';
import { useAuth } from '@/contexts/AuthContext';
import AppLayout from '@/components/AppLayout';

const TestWalletPage = () => {
  const { user, refreshUserData } = useAuth();
  
  useEffect(() => {
    // Refresh wallet balance when page loads
    refreshUserData();
  }, [refreshUserData]);
  
  return (
    <div className="container mx-auto py-8 max-w-3xl">
      <h1 className="text-3xl font-bold mb-6">Test Wallet</h1>
      
      <div className="space-y-8">
        {/* Current Balance Display */}
        <Card>
          <CardHeader>
            <CardTitle>My Balance</CardTitle>
            <CardDescription>Your current wallet balance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">₹{user?.wallet || 0}</div>
          </CardContent>
        </Card>
        
        {/* Test Payment Panel */}
        <TestWalletPanel />
        
        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>Test Mode Instructions</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-2">
              <li>This is a test payment mode for development purposes</li>
              <li>No real money is transferred</li>
              <li>All transactions are simulated</li>
              <li>5% of deposits and 10% of withdrawals will randomly fail</li>
              <li>Transactions will appear in your transaction history</li>
              <li>You can use this test money to join game pools</li>
              <li>Winning games will add prize money to your wallet automatically</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TestWalletPage;
