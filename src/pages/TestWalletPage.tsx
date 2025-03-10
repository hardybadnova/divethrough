
import React, { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TestWalletPanel } from '@/components/wallet/TestWalletPanel';
import { useAuth } from '@/contexts/AuthContext';
import AppLayout from '@/components/AppLayout';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

const TestWalletPage = () => {
  const { user, refreshUserData } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    // Refresh wallet balance when page loads
    refreshUserData();
  }, [refreshUserData]);
  
  const handleGoBack = () => {
    navigate(-1); // Go back to previous page
  };
  
  return (
    <div className="container mx-auto py-8 max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Test Wallet</h1>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={handleGoBack}
          className="rounded-full hover:bg-betster-800/30"
        >
          <ArrowLeft className="h-5 w-5 text-betster-300" />
          <span className="sr-only">Go back</span>
        </Button>
      </div>
      
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
