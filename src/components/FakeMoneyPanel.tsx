
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';

const FakeMoneyPanel = () => {
  const { user, addFakeMoney, withdrawFakeMoney } = useAuth();
  const [amount, setAmount] = useState<number>(100);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleAddMoney = async () => {
    if (!amount || amount <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid amount",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    try {
      await addFakeMoney(amount);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleWithdrawMoney = async () => {
    if (!amount || amount <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid amount",
        variant: "destructive"
      });
      return;
    }

    if (user && user.wallet < amount) {
      toast({
        title: "Insufficient balance",
        description: "You don't have enough balance",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    try {
      await withdrawFakeMoney(amount);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="bg-betster-800/30 border-betster-700/40">
      <CardHeader>
        <CardTitle className="text-white">Test Money Controls</CardTitle>
        <CardDescription className="text-betster-300">
          For testing purposes only - add or withdraw fake money
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-betster-300">Amount</label>
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              min={1}
              className="bg-betster-900/50 border-betster-700/50 text-white"
            />
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button 
          variant="default" 
          onClick={handleAddMoney}
          disabled={isProcessing}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          {isProcessing ? 'Processing...' : 'Add Fake Money'}
        </Button>
        <Button 
          variant="default" 
          onClick={handleWithdrawMoney}
          disabled={isProcessing}
          className="bg-amber-600 hover:bg-amber-700 text-white"
        >
          {isProcessing ? 'Processing...' : 'Withdraw Fake Money'}
        </Button>
      </CardFooter>
      <div className="px-6 pb-4 text-xs text-betster-400">
        <p>This is for testing purposes only. In a production app, this would be replaced with a real payment gateway.</p>
      </div>
    </Card>
  );
};

export default FakeMoneyPanel;
