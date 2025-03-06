
import React, { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Link, useLocation } from "react-router-dom";
import { Menu, Wallet, Home, Trophy, MessageSquare, LogOut, User, Award, Percent, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useKYC } from "@/contexts/KYCContext";
import { formatCurrency } from "@/lib/formatters";
import BetsterLogo from "./BetsterLogo";
import { initializeDeposit, initiateWithdrawal } from "@/services/paymentService";
import { toast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps) => {
  const { user, logout, refreshUserData } = useAuth();
  const { getVerificationStatus } = useKYC();
  const location = useLocation();
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [depositAmount, setDepositAmount] = useState<number>(0);
  const [withdrawAmount, setWithdrawAmount] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [accountDetails, setAccountDetails] = useState({
    accountNumber: '',
    ifsc: '',
    accountHolderName: ''
  });

  const verificationStatus = getVerificationStatus();
  
  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const menuItems = [
    { label: "Profile", icon: User, path: "/profile" },
    { 
      label: "KYC Verification", 
      icon: Shield, 
      path: "/kyc",
      badge: verificationStatus === 'verified' ? 'Verified' : 
             verificationStatus === 'pending' ? 'Pending' : 'Required',
      badgeColor: verificationStatus === 'verified' ? 'bg-green-500/80' : 
                 verificationStatus === 'pending' ? 'bg-amber-500/80' : 'bg-red-500/80'
    },
    { label: "Transaction History", icon: Wallet, path: "/transactions" },
    { label: "Leaderboard", icon: Trophy, path: "/leaderboard" },
    { label: "Milestones & Bonuses", icon: Award, path: "/milestones" },
    { label: "Referral Program", icon: Percent, path: "/referral" },
    { label: "Chat Support", icon: MessageSquare, path: "/support" },
    { label: "Game History", icon: Home, path: "/game-history" },
  ];

  const handleLogout = () => {
    logout();
  };

  const handleDeposit = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to deposit funds",
        variant: "destructive"
      });
      return;
    }
    
    if (!depositAmount || depositAmount < 100) {
      toast({
        title: "Invalid Amount",
        description: "Please enter an amount of at least ₹100",
        variant: "destructive"
      });
      return;
    }
    
    setIsProcessing(true);
    
    try {
      const razorpay = await initializeDeposit(user.id, depositAmount);
      if (razorpay) {
        // Razorpay popup will handle the rest
        setIsDepositOpen(false);
        setDepositAmount(0);
      }
    } catch (error) {
      console.error("Deposit error:", error);
      toast({
        title: "Deposit Failed",
        description: "There was an error processing your deposit",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleWithdrawal = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to withdraw funds",
        variant: "destructive"
      });
      return;
    }
    
    if (!withdrawAmount || withdrawAmount < 100) {
      toast({
        title: "Invalid Amount",
        description: "Please enter an amount of at least ₹100",
        variant: "destructive"
      });
      return;
    }
    
    if (withdrawAmount > (user.wallet || 0)) {
      toast({
        title: "Insufficient Funds",
        description: "You don't have enough balance for this withdrawal",
        variant: "destructive"
      });
      return;
    }
    
    // Validate account details
    if (!accountDetails.accountNumber || !accountDetails.ifsc || !accountDetails.accountHolderName) {
      toast({
        title: "Missing Account Details",
        description: "Please fill in all account details for withdrawal",
        variant: "destructive"
      });
      return;
    }
    
    setIsProcessing(true);
    
    try {
      await initiateWithdrawal(user.id, withdrawAmount, accountDetails);
      await refreshUserData();
      setIsWithdrawOpen(false);
      setWithdrawAmount(0);
      setAccountDetails({
        accountNumber: '',
        ifsc: '',
        accountHolderName: ''
      });
    } catch (error) {
      console.error("Withdrawal error:", error);
      toast({
        title: "Withdrawal Failed",
        description: "There was an error processing your withdrawal",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const isGameScreen = location.pathname.includes("/game/");

  return (
    <div className="flex flex-col min-h-screen overflow-hidden bg-gradient-to-br from-[#1a0033] to-[#4a0080]">
      <header className="sticky top-0 z-30 w-full border-b backdrop-blur-lg bg-black/30 border-betster-600/40">
        <div className="flex h-16 items-center justify-between px-4">
          <div className="flex items-center">
            <Sheet>
              <SheetTrigger asChild>
                <button className="rounded-full p-2 hover:bg-betster-800/30 flex items-center justify-center">
                  <Menu className="h-5 w-5 text-betster-300" />
                </button>
              </SheetTrigger>
              <SheetContent side="left" className="bg-black/95 backdrop-blur-xl border-r border-betster-700/40 p-0">
                <div className="flex flex-col h-full">
                  <div className="py-6 px-4 border-b border-betster-700/40">
                    <div className="flex items-center gap-4">
                      <div className="rounded-full bg-gradient-to-br from-betster-500 to-betster-700 h-12 w-12 flex items-center justify-center">
                        <User className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-white">{user?.username}</p>
                        <p className="text-sm text-betster-300">
                          {formatCurrency(user?.wallet || 0)}
                        </p>
                      </div>
                    </div>
                  </div>
                  <nav className="px-2 py-4 flex flex-col gap-1">
                    {menuItems.map((item, index) => (
                      <Link
                        key={index}
                        to={item.path}
                        className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-betster-800/30 transition-colors"
                      >
                        <item.icon className="h-5 w-5 text-betster-400" />
                        <span className="text-betster-100">{item.label}</span>
                      </Link>
                    ))}
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-betster-800/30 text-left text-destructive transition-colors mt-auto"
                    >
                      <LogOut className="h-5 w-5" />
                      <span>Logout</span>
                    </button>
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          <div className="flex-1 flex justify-center">
            <BetsterLogo className="h-8" />
          </div>

          <div className="flex items-center gap-2">
            <Sheet open={isDepositOpen} onOpenChange={setIsDepositOpen}>
              <SheetTrigger asChild>
                <button
                  className="inline-flex items-center gap-1.5 rounded-full bg-betster-600/20 px-3 py-1.5 text-sm font-medium text-betster-100 transition-colors hover:bg-betster-600/30"
                  onClick={() => setIsDepositOpen(true)}
                >
                  <Wallet className="h-4 w-4" />
                  <span>{formatCurrency(user?.wallet || 0)}</span>
                </button>
              </SheetTrigger>
              <SheetContent side="right" className="bg-black/95 backdrop-blur-xl border-l border-betster-700/40">
                <h3 className="text-lg font-semibold mb-4 text-white">Deposit Funds</h3>
                <div className="space-y-4">
                  <p className="text-sm text-betster-300">
                    Enter the amount you wish to deposit into your wallet.
                  </p>
                  <Input
                    type="number"
                    min="100"
                    placeholder="Amount in INR (min ₹100)"
                    value={depositAmount || ''}
                    onChange={(e) => setDepositAmount(Number(e.target.value))}
                    className="bg-betster-900/50 border-betster-700/50 text-white"
                  />
                  <Button 
                    className="w-full" 
                    onClick={handleDeposit}
                    disabled={isProcessing || !depositAmount || depositAmount < 100}
                  >
                    {isProcessing ? 'Processing...' : 'Deposit'}
                  </Button>
                  
                  <div className="mt-4 flex justify-between">
                    <button
                      className="text-sm text-betster-400 hover:text-betster-300"
                      onClick={() => {
                        setIsDepositOpen(false);
                        setIsWithdrawOpen(true);
                      }}
                    >
                      Switch to Withdrawal
                    </button>
                  </div>
                  
                  <div className="mt-2 text-xs text-betster-400">
                    <p>This is a test mode integration. Use these test cards:</p>
                    <ul className="list-disc pl-4 mt-1">
                      <li>Card: 4111 1111 1111 1111</li>
                      <li>Expiry: Any future date</li>
                      <li>CVV: Any 3 digits</li>
                      <li>Name: Any name</li>
                    </ul>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
            
            <Sheet open={isWithdrawOpen} onOpenChange={setIsWithdrawOpen}>
              <SheetContent side="right" className="bg-black/95 backdrop-blur-xl border-l border-betster-700/40">
                <h3 className="text-lg font-semibold mb-4 text-white">Withdraw Funds</h3>
                <div className="space-y-4">
                  <p className="text-sm text-betster-300">
                    Enter the amount you wish to withdraw from your wallet and your account details.
                  </p>
                  <Input
                    type="number"
                    min="100"
                    max={user?.wallet || 0}
                    placeholder="Amount in INR (min ₹100)"
                    value={withdrawAmount || ''}
                    onChange={(e) => setWithdrawAmount(Number(e.target.value))}
                    className="bg-betster-900/50 border-betster-700/50 text-white"
                  />
                  
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-betster-200">Account Details</p>
                    <Input
                      placeholder="Account Number"
                      value={accountDetails.accountNumber}
                      onChange={(e) => setAccountDetails({...accountDetails, accountNumber: e.target.value})}
                      className="bg-betster-900/50 border-betster-700/50 text-white"
                    />
                    <Input
                      placeholder="IFSC Code"
                      value={accountDetails.ifsc}
                      onChange={(e) => setAccountDetails({...accountDetails, ifsc: e.target.value})}
                      className="bg-betster-900/50 border-betster-700/50 text-white"
                    />
                    <Input
                      placeholder="Account Holder Name"
                      value={accountDetails.accountHolderName}
                      onChange={(e) => setAccountDetails({...accountDetails, accountHolderName: e.target.value})}
                      className="bg-betster-900/50 border-betster-700/50 text-white"
                    />
                  </div>
                  
                  <Button 
                    className="w-full" 
                    onClick={handleWithdrawal}
                    disabled={isProcessing || !withdrawAmount || withdrawAmount < 100 || withdrawAmount > (user?.wallet || 0)}
                  >
                    {isProcessing ? 'Processing...' : 'Withdraw'}
                  </Button>
                  
                  <div className="mt-4 flex justify-between">
                    <button
                      className="text-sm text-betster-400 hover:text-betster-300"
                      onClick={() => {
                        setIsWithdrawOpen(false);
                        setIsDepositOpen(true);
                      }}
                    >
                      Switch to Deposit
                    </button>
                  </div>
                  
                  <div className="mt-2 text-xs text-betster-400">
                    <p>In test mode, no actual money will be withdrawn.</p>
                    <p>Your wallet balance will be updated for demonstration purposes.</p>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <main className={cn("flex-1 flex flex-col", isGameScreen ? "pb-0" : "pb-16")}>
        {children}
      </main>

      {!isGameScreen && (
        <footer className="fixed bottom-0 left-0 right-0 z-30 bg-black/30 backdrop-blur-lg border-t border-betster-700/40">
          <div className="flex h-16 items-center justify-between px-4">
            <Link
              to="/dashboard"
              className="flex flex-1 flex-col items-center justify-center py-1"
            >
              <Home className="h-5 w-5 text-betster-300" />
              <span className="text-xs text-betster-300 mt-1">Home</span>
            </Link>
            <Link
              to="/kyc"
              className="flex flex-1 flex-col items-center justify-center py-1"
            >
              <Shield className="h-5 w-5 text-betster-300" />
              <span className="text-xs text-betster-300 mt-1">Verify</span>
            </Link>
            <Link
              to="/milestones"
              className="flex flex-1 flex-col items-center justify-center py-1"
            >
              <Trophy className="h-5 w-5 text-betster-300" />
              <span className="text-xs text-betster-300 mt-1">Milestones</span>
            </Link>
            <Link
              to="/support"
              className="flex flex-1 flex-col items-center justify-center py-1"
            >
              <MessageSquare className="h-5 w-5 text-betster-300" />
              <span className="text-xs text-betster-300 mt-1">Support</span>
            </Link>
          </div>
        </footer>
      )}
    </div>
  );
};

export default AppLayout;
