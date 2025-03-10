
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { getTestPaymentMethods } from '@/services/game/testPaymentService';
import { initializeDeposit, initiateWithdrawal } from '@/services/paymentService';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export const TestWalletPanel = () => {
  const { user, addFakeMoney, withdrawFakeMoney } = useAuth();
  const [depositAmount, setDepositAmount] = useState(100);
  const [withdrawAmount, setWithdrawAmount] = useState(100);
  const [isProcessing, setIsProcessing] = useState(false);
  const paymentMethods = getTestPaymentMethods();
  
  const handleDeposit = async () => {
    if (!user?.id) {
      toast({ 
        title: "Error", 
        description: "You must be logged in", 
        variant: "destructive" 
      });
      return;
    }
    
    setIsProcessing(true);
    try {
      const result = await addFakeMoney(depositAmount);
      if (result !== undefined) {
        toast({
          title: "Deposit Successful",
          description: `Your deposit is being processed (Test Mode)`
        });
      }
    } catch (error) {
      console.error("Error initiating deposit:", error);
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleWithdraw = async () => {
    if (!user?.id) {
      toast({ 
        title: "Error", 
        description: "You must be logged in", 
        variant: "destructive" 
      });
      return;
    }
    
    setIsProcessing(true);
    try {
      const result = await withdrawFakeMoney(withdrawAmount);
      if (result !== undefined) {
        toast({
          title: "Withdrawal Initiated",
          description: "Your withdrawal is being processed (Test Mode)"
        });
      }
    } catch (error) {
      console.error("Error initiating withdrawal:", error);
    } finally {
      setIsProcessing(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Test Payment Mode</CardTitle>
          <CardDescription>
            Add or withdraw funds in test mode without a real payment gateway
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="text-lg font-medium mb-2">Add Money</h3>
            <div className="flex space-x-2">
              <Input 
                type="number" 
                min={1}
                value={depositAmount} 
                onChange={(e) => setDepositAmount(Number(e.target.value))}
              />
              <Button 
                onClick={handleDeposit} 
                disabled={isProcessing || depositAmount <= 0}
              >
                Add Funds
              </Button>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-2">Withdraw Money</h3>
            <div className="flex space-x-2">
              <Input 
                type="number" 
                min={1}
                value={withdrawAmount} 
                onChange={(e) => setWithdrawAmount(Number(e.target.value))}
              />
              <Button
                variant="outline"
                onClick={handleWithdraw}
                disabled={isProcessing || withdrawAmount <= 0}
              >
                Withdraw
              </Button>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <p className="text-sm text-muted-foreground">
            Test Mode: 5% of deposits and 10% of withdrawals will randomly fail to simulate real-world scenarios.
          </p>
        </CardFooter>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Available Test Payment Methods</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            {paymentMethods.map(method => (
              <div key={method.id} className="flex items-center p-3 border rounded-md">
                <div className="text-2xl mr-2">{method.icon}</div>
                <div>{method.name}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
