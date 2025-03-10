
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

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
      
      // Show success message
      toast({
        title: "Success",
        description: `${amount} fake money added to your wallet`,
      });
    } catch (error) {
      console.error("Error adding fake money:", error);
      toast({
        title: "Failed to add fake money",
        description: "There was an error processing your request. Please try again.",
        variant: "destructive"
      });
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
      
      // Show success message
      toast({
        title: "Success",
        description: `${amount} fake money withdrawn from your wallet`,
      });
    } catch (error) {
      console.error("Error withdrawing fake money:", error);
      toast({
        title: "Failed to withdraw fake money",
        description: "There was an error processing your request. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="bg-betster-800/30 border-betster-700/40">
      <CardHeader className="pb-3">
        <CardTitle className="text-white">Test Money Controls</CardTitle>
        <CardDescription className="text-betster-300">
          For testing purposes only
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-3">
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
      </CardContent>
      <CardFooter className="flex justify-between pt-2">
        <Button 
          variant="default" 
          onClick={handleAddMoney}
          disabled={isProcessing}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
              Processing...
            </>
          ) : 'Add Money'}
        </Button>
        <Button 
          variant="default" 
          onClick={handleWithdrawMoney}
          disabled={isProcessing}
          className="bg-amber-600 hover:bg-amber-700 text-white"
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
              Processing...
            </>
          ) : 'Withdraw'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default FakeMoneyPanel;
