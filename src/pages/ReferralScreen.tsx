
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Percent, Share2, Copy, CheckCircle, User } from "lucide-react";
import AppLayout from "@/components/AppLayout";
import { useGame } from "@/contexts/GameContext";
import { formatCurrency } from "@/lib/formatters";
import { toast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const ReferralScreen = () => {
  const { getReferralInfo, addReferral } = useGame();
  const [referralCode, setReferralCode] = useState("");
  const [copied, setCopied] = useState(false);
  const { code, referrals, totalBonus } = getReferralInfo();
  
  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    toast({
      title: "Code copied!",
      description: "Referral code copied to clipboard.",
    });
    setTimeout(() => setCopied(false), 2000);
  };
  
  const handleSubmitCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (referralCode.trim()) {
      const success = addReferral(referralCode);
      if (success) {
        toast({
          title: "Referral code accepted!",
          description: "The referral has been applied to your account.",
        });
        setReferralCode("");
      } else {
        toast({
          title: "Invalid code",
          description: "Please check the referral code and try again.",
          variant: "destructive",
        });
      }
    }
  };
  
  // Mock referred users data
  const referredUsers = [
    { username: "RajaGamer123", date: "2 days ago", deposit: 1000 },
    { username: "BetMaster99", date: "5 days ago", deposit: 2000 },
    { username: "LuckyCharm7", date: "1 week ago", deposit: 5000 },
  ];
  
  return (
    <AppLayout>
      <div className="container max-w-md mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-6 text-center">Referral Program</h1>
        
        <Tabs defaultValue="refer" className="w-full">
          <TabsList className="grid grid-cols-2 mb-6">
            <TabsTrigger value="refer">Refer Friends</TabsTrigger>
            <TabsTrigger value="my-referrals">My Referrals</TabsTrigger>
          </TabsList>
          
          <TabsContent value="refer">
            <div className="glass-card rounded-xl p-6 mb-6">
              <div className="text-center mb-6">
                <div className="h-16 w-16 rounded-full bg-betster-600/20 flex items-center justify-center mx-auto mb-4">
                  <Percent className="h-8 w-8 text-betster-400" />
                </div>
                
                <h2 className="text-lg font-bold mb-2">Earn 5% on First Deposits</h2>
                <p className="text-sm text-muted-foreground">
                  Share your referral code with friends and earn 5% when they make their first deposit!
                </p>
              </div>
              
              <div className="relative mb-6">
                <div className="flex items-center border border-border/40 rounded-lg overflow-hidden">
                  <div className="flex-1 px-4 py-3 font-mono text-lg">
                    {code}
                  </div>
                  <button 
                    onClick={handleCopyCode}
                    className="h-full px-4 bg-betster-600/20 hover:bg-betster-600/30 text-betster-100 transition-colors"
                  >
                    {copied ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      <Copy className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
              
              <div className="space-y-4">
                <button className="betster-button w-full flex items-center justify-center">
                  <Share2 className="h-5 w-5 mr-2" />
                  Share Referral Link
                </button>
                
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">
                    You've invited <span className="font-medium text-foreground">{referrals}</span> friends 
                    and earned <span className="font-medium text-foreground">{formatCurrency(totalBonus)}</span>
                  </p>
                </div>
              </div>
            </div>
            
            <div className="glass-card rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-border/40">
                <h2 className="font-medium">Submit a Referral Code</h2>
              </div>
              
              <form onSubmit={handleSubmitCode} className="p-4 space-y-4">
                <div>
                  <label htmlFor="referralCode" className="text-sm text-muted-foreground block mb-2">
                    Enter someone's referral code
                  </label>
                  <input
                    id="referralCode"
                    type="text"
                    className="w-full px-4 py-3 rounded-lg border border-border/40 bg-background"
                    placeholder="Enter referral code"
                    value={referralCode}
                    onChange={(e) => setReferralCode(e.target.value)}
                  />
                </div>
                
                <button type="submit" className="betster-button w-full">
                  Submit Referral Code
                </button>
              </form>
            </div>
          </TabsContent>
          
          <TabsContent value="my-referrals">
            <div className="glass-card rounded-xl p-4 mb-6">
              <div className="flex items-center mb-4">
                <div className="h-12 w-12 rounded-full bg-betster-600 flex items-center justify-center mr-4">
                  <User className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold">Total Referrals</h2>
                  <div className="flex items-baseline">
                    <p className="text-2xl font-bold text-betster-400 mr-2">
                      {referrals}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      friends joined
                    </p>
                  </div>
                </div>
              </div>
              
              <p className="text-sm text-muted-foreground mb-2">
                Total earnings: <span className="font-medium text-foreground">{formatCurrency(totalBonus)}</span>
              </p>
              
              <div className="text-xs text-muted-foreground">
                You earn 5% of your friends' first deposit
              </div>
            </div>
            
            <div className="glass-card rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-border/40">
                <h2 className="font-medium">Your Referred Users</h2>
              </div>
              
              {referredUsers.length > 0 ? (
                <div className="divide-y divide-border/40">
                  {referredUsers.map((user, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-4 flex items-center"
                    >
                      <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center mr-3">
                        <User className="h-5 w-5 text-muted-foreground" />
                      </div>
                      
                      <div className="flex-1">
                        <p className="font-medium">{user.username}</p>
                        <p className="text-xs text-muted-foreground">
                          Joined {user.date}
                        </p>
                      </div>
                      
                      <div className="text-right">
                        <p className="font-medium text-betster-400">
                          +{formatCurrency(user.deposit * 0.05)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatCurrency(user.deposit)} deposit
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center">
                  <p className="text-muted-foreground">You haven't referred anyone yet.</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default ReferralScreen;
