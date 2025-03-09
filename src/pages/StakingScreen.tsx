import React, { useState } from 'react';
import { useStaking } from '@/contexts/StakingContext';
import { useAuth } from '@/contexts/AuthContext';
import AppLayout from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { ArrowUpRight, Calculator, Clock, CoinsIcon, DollarSign, Info, Percent, RefreshCw, TrendingUp, Wallet } from 'lucide-react';

const StakingCalculator = ({ plans }) => {
  const [amount, setAmount] = useState<number>(100);
  const [selectedPlan, setSelectedPlan] = useState(plans[0]?.id || '');
  const [isCompounding, setIsCompounding] = useState<boolean>(false);
  
  const selectedPlanDetails = plans.find(plan => plan.id === selectedPlan);
  
  const calculateReturns = () => {
    if (!selectedPlanDetails) return { returns: 0, apy: 0 };
    
    const apy = selectedPlanDetails.apy / 100;
    let periodInYears = 0;
    
    switch (selectedPlanDetails.period) {
      case '7days': periodInYears = 7 / 365; break;
      case '30days': periodInYears = 30 / 365; break;
      case '90days': periodInYears = 90 / 365; break;
      case '180days': periodInYears = 180 / 365; break;
      case '365days': periodInYears = 1; break;
    }
    
    let returns = 0;
    
    if (isCompounding) {
      returns = amount * Math.pow(1 + apy, periodInYears) - amount;
    } else {
      returns = amount * apy * periodInYears;
    }
    
    return {
      returns: parseFloat(returns.toFixed(2)),
      apy: selectedPlanDetails.apy
    };
  };
  
  const { returns, apy } = calculateReturns();
  
  return (
    <Card className="premium-glass">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Calculator className="mr-2 h-6 w-6" />
          Staking Calculator
        </CardTitle>
        <CardDescription>
          Estimate your potential earnings from staking
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="stake-amount">Amount to Stake</Label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-3 h-4 w-4 text-betster-400" />
            <Input
              id="stake-amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="pl-10"
              min={1}
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="staking-plan">Staking Plan</Label>
          <select
            id="staking-plan"
            value={selectedPlan}
            onChange={(e) => setSelectedPlan(e.target.value)}
            className="w-full p-2 rounded-md bg-betster-800 border border-betster-700"
          >
            {plans.map(plan => (
              <option key={plan.id} value={plan.id}>
                {plan.name} ({plan.apy}% APY - {plan.period})
              </option>
            ))}
          </select>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="compounding">Compound Interest</Label>
            <div className="text-sm text-betster-400">Reinvest earnings automatically</div>
          </div>
          <Switch
            id="compounding"
            checked={isCompounding}
            onCheckedChange={setIsCompounding}
          />
        </div>
        
        <Separator className="my-4" />
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="text-sm text-betster-400">Expected Returns</div>
            <div className="text-2xl font-bold text-green-400">₹{returns.toLocaleString()}</div>
          </div>
          <div className="space-y-1">
            <div className="text-sm text-betster-400">Effective APY</div>
            <div className="text-2xl font-bold">{apy}%</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const StakingPlans = ({ plans, onStake, wallet }) => {
  const [selectedPlan, setSelectedPlan] = useState(plans[0]?.id || '');
  const [amount, setAmount] = useState<string>('');
  const [isCompounding, setIsCompounding] = useState<boolean>(false);
  
  const handleStake = () => {
    if (!amount || parseFloat(amount) <= 0) {
      return;
    }
    onStake(selectedPlan, parseFloat(amount), isCompounding);
    setAmount('');
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">Available Staking Plans</h3>
        <Badge variant="outline" className="flex items-center gap-1">
          <Wallet className="h-3.5 w-3.5" />
          <span>Balance: ₹{wallet.toLocaleString()}</span>
        </Badge>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {plans.map((plan) => (
          <Card key={plan.id} className={`cursor-pointer hover:bg-betster-800/50 transition-colors ${selectedPlan === plan.id ? 'border-betster-500' : ''}`} onClick={() => setSelectedPlan(plan.id)}>
            <CardHeader className="pb-2">
              <CardTitle>{plan.name}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-betster-400">APY</span>
                  <span className="font-bold text-green-400">{plan.apy}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-betster-400">Duration</span>
                  <span>{plan.period}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-betster-400">Min Amount</span>
                  <span>₹{plan.minAmount}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <div className={`w-4 h-4 rounded-full ${selectedPlan === plan.id ? 'bg-betster-500' : 'bg-betster-800'}`} />
            </CardFooter>
          </Card>
        ))}
      </div>
      
      {selectedPlan && (
        <Card className="premium-glass mt-6">
          <CardHeader>
            <CardTitle>Create New Stake</CardTitle>
            <CardDescription>
              Selected plan: {plans.find(p => p.id === selectedPlan)?.name}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="stake-amount">Amount to Stake</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 h-4 w-4 text-betster-400" />
                <Input
                  id="stake-amount"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="pl-10"
                  min={plans.find(p => p.id === selectedPlan)?.minAmount || 1}
                  placeholder={`Min amount: ₹${plans.find(p => p.id === selectedPlan)?.minAmount || 1}`}
                />
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="compounding">Compound Interest</Label>
                <div className="text-sm text-betster-400">Reinvest earnings automatically</div>
              </div>
              <Switch
                id="compounding"
                checked={isCompounding}
                onCheckedChange={setIsCompounding}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => setAmount('')}>Cancel</Button>
            <Button 
              onClick={handleStake}
              disabled={!amount || parseFloat(amount) <= 0 || parseFloat(amount) > wallet}
            >
              Stake Now
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
};

const ActiveStakes = ({ stakes, onCancel, onWithdraw }) => {
  if (stakes.length === 0) {
    return (
      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>No active stakes</AlertTitle>
        <AlertDescription>
          You don't have any active stakes. Start staking to earn rewards!
        </AlertDescription>
      </Alert>
    );
  }
  
  return (
    <div className="space-y-4">
      {stakes.map((stake) => (
        <Card key={stake.id} className="premium-glass">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle>
                {stake.amount.toLocaleString()} {stake.isCompounding && <Badge variant="outline" className="ml-2">Compounding</Badge>}
              </CardTitle>
              <Badge variant={stake.status === 'active' ? 'default' : stake.status === 'completed' ? 'outline' : 'destructive'}>
                {stake.status}
              </Badge>
            </div>
            <CardDescription className="flex items-center">
              <Clock className="h-3.5 w-3.5 mr-1" />
              {format(stake.startDate, 'MMM d, yyyy')} - {format(stake.endDate, 'MMM d, yyyy')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="text-sm text-betster-400">Current Rewards</div>
                <div className="text-xl font-bold text-green-400">₹{stake.rewards.toLocaleString()}</div>
              </div>
              
              <div className="space-y-1">
                <div className="text-sm text-betster-400">Time Remaining</div>
                <div className="text-xl font-bold">
                  {Math.max(0, Math.ceil((stake.endDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))} days
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" size="sm" onClick={() => onCancel(stake.id)}>
              Cancel Stake
            </Button>
            <Button size="sm" onClick={() => onWithdraw(stake.id)} disabled={stake.rewards <= 0}>
              Withdraw Rewards
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};

const StakingDashboard = () => {
  const { availablePlans, userStakes, totalStaked, totalRewards, createStake, cancelStake, withdrawRewards, refreshStakingData, isLoading } = useStaking();
  const { user } = useAuth();
  
  const handleStake = (planId: string, amount: number, isCompounding: boolean) => {
    createStake(planId, amount, isCompounding);
  };
  
  const handleCancelStake = (stakeId: string) => {
    cancelStake(stakeId);
  };
  
  const handleWithdrawRewards = (stakeId: string) => {
    withdrawRewards(stakeId);
  };
  
  const handleRefresh = () => {
    refreshStakingData();
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin">
          <RefreshCw className="h-8 w-8 text-betster-400" />
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="premium-glass">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <Wallet className="mr-2 h-5 w-5" />
              Total Staked
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">₹{totalStaked.toLocaleString()}</div>
          </CardContent>
        </Card>
        
        <Card className="premium-glass">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <CoinsIcon className="mr-2 h-5 w-5" />
              Total Rewards
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-400">₹{totalRewards.toLocaleString()}</div>
          </CardContent>
        </Card>
        
        <Card className="premium-glass">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <TrendingUp className="mr-2 h-5 w-5" />
              Active Stakes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{userStakes.filter(s => s.status === 'active').length}</div>
          </CardContent>
        </Card>
      </div>
      
      <div className="flex justify-end">
        <Button variant="outline" size="sm" onClick={handleRefresh} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>
      
      <Tabs defaultValue="active">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="active">My Stakes</TabsTrigger>
          <TabsTrigger value="new">New Stake</TabsTrigger>
          <TabsTrigger value="calculator">Calculator</TabsTrigger>
        </TabsList>
        
        <TabsContent value="active" className="space-y-4">
          <ActiveStakes 
            stakes={userStakes} 
            onCancel={handleCancelStake} 
            onWithdraw={handleWithdrawRewards} 
          />
        </TabsContent>
        
        <TabsContent value="new">
          <StakingPlans 
            plans={availablePlans}
            onStake={handleStake}
            wallet={user?.wallet || 0}
          />
        </TabsContent>
        
        <TabsContent value="calculator">
          <StakingCalculator plans={availablePlans} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

const StakingScreen = () => {
  const { user, isAuthenticated } = useAuth();
  
  return (
    <AppLayout>
      <div className="container max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col space-y-6">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight text-gradient">Staking</h1>
            <p className="text-betster-300">
              Stake your funds and earn rewards over time.
            </p>
          </div>
          
          {!isAuthenticated ? (
            <Alert className="bg-red-500/20 border-red-500/40">
              <Info className="h-4 w-4" />
              <AlertTitle>Login Required</AlertTitle>
              <AlertDescription>
                Please log in to access the staking platform.
              </AlertDescription>
            </Alert>
          ) : (
            <StakingDashboard />
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default StakingScreen;
