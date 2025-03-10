
import React, { useState } from "react";
import AppLayout from "@/components/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, CreditCard, Edit, LogOut, Settings, Trophy, User as UserIcon } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

const ProfilePage = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
    } catch (error) {
      console.error("Error logging out:", error);
      toast({
        title: "Logout failed",
        description: "There was an error logging out. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Mock statistics data - would be fetched from backend in production
  const statistics = {
    gamesPlayed: 48,
    gamesWon: 12,
    winRate: "25%",
    bestRanking: 3,
    highestWin: 2500,
    averageNumber: 7,
  };

  // Mock transaction history - would be fetched from backend in production
  const transactions = [
    { id: "tx001", type: "deposit", amount: 1000, date: "2025-03-12", status: "completed" },
    { id: "tx002", type: "game-fee", amount: -200, date: "2025-03-12", status: "completed" },
    { id: "tx003", type: "win", amount: 500, date: "2025-03-11", status: "completed" },
    { id: "tx004", type: "withdrawal", amount: -500, date: "2025-03-10", status: "completed" },
    { id: "tx005", type: "deposit", amount: 500, date: "2025-03-09", status: "completed" },
  ];

  return (
    <AppLayout>
      <div className="container px-4 py-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-white">Your Profile</h1>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="text-betster-300 border-betster-700/40">
              <Edit className="h-4 w-4 mr-2" /> Edit Profile
            </Button>
            <Button variant="outline" size="sm" className="text-red-400 border-betster-700/40" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" /> Logout
            </Button>
          </div>
        </div>
        
        <Card className="bg-black/50 border-betster-700/40 text-white mb-6">
          <CardHeader>
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20 border-2 border-betster-500">
                <AvatarFallback className="bg-betster-800 text-betster-100 text-xl">
                  {user?.username?.charAt(0).toUpperCase() || "U"}
                </AvatarFallback>
                {user?.photoURL && <AvatarImage src={user.photoURL} />}
              </Avatar>
              <div>
                <CardTitle className="text-2xl">{user?.username || "Player"}</CardTitle>
                <CardDescription className="text-betster-300">{user?.email || ""}</CardDescription>
                <div className="flex mt-2 gap-2">
                  <Badge className="bg-betster-600 hover:bg-betster-700">Level 5</Badge>
                  <Badge className="bg-amber-600 hover:bg-amber-700">VIP</Badge>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="bg-black/40 border-betster-700/40 p-0.5">
            <TabsTrigger value="overview" className="data-[state=active]:bg-betster-800/50">
              <UserIcon className="h-4 w-4 mr-2" /> Overview
            </TabsTrigger>
            <TabsTrigger value="transactions" className="data-[state=active]:bg-betster-800/50">
              <CreditCard className="h-4 w-4 mr-2" /> Transactions
            </TabsTrigger>
            <TabsTrigger value="statistics" className="data-[state=active]:bg-betster-800/50">
              <Trophy className="h-4 w-4 mr-2" /> Statistics
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-betster-800/50">
              <Settings className="h-4 w-4 mr-2" /> Settings
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="bg-black/30 border-betster-700/40 text-white">
                <CardHeader>
                  <CardTitle className="text-xl">Account Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 rounded-lg bg-betster-800/30 border border-betster-700/30">
                    <h3 className="text-lg font-medium text-betster-100">Wallet Balance</h3>
                    <p className="text-3xl font-bold text-white mb-1">₹{user?.wallet || 0}</p>
                    <Link to="/test-wallet" className="text-sm text-betster-300 hover:text-betster-200">
                      Add funds →
                    </Link>
                  </div>
                  
                  <div className="p-4 rounded-lg bg-betster-800/30 border border-betster-700/30">
                    <h3 className="text-lg font-medium text-betster-100">Account Status</h3>
                    <div className="flex items-center mt-1">
                      <Badge className="bg-green-600 hover:bg-green-700">Active</Badge>
                      <span className="text-betster-300 text-sm ml-2">Since March 2025</span>
                    </div>
                  </div>

                  <Button className="w-full" variant="outline">
                    <Link to="/game-history" className="flex items-center justify-center w-full">
                      View Game History <CalendarDays className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
              
              <Card className="bg-black/30 border-betster-700/40 text-white">
                <CardHeader>
                  <CardTitle className="text-xl">Game Statistics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between py-2">
                    <span className="text-betster-300">Games Played</span>
                    <span className="font-medium">{statistics.gamesPlayed}</span>
                  </div>
                  <Separator className="bg-betster-700/20" />
                  
                  <div className="flex justify-between py-2">
                    <span className="text-betster-300">Games Won</span>
                    <span className="font-medium">{statistics.gamesWon}</span>
                  </div>
                  <Separator className="bg-betster-700/20" />
                  
                  <div className="flex justify-between py-2">
                    <span className="text-betster-300">Win Rate</span>
                    <span className="font-medium text-green-400">{statistics.winRate}</span>
                  </div>
                  <Separator className="bg-betster-700/20" />
                  
                  <div className="flex justify-between py-2">
                    <span className="text-betster-300">Best Ranking</span>
                    <span className="font-medium text-amber-400">#{statistics.bestRanking}</span>
                  </div>
                  
                  <div className="mt-4">
                    <Button className="w-full">
                      <Link to="/leaderboard" className="flex items-center justify-center w-full">
                        View Leaderboard <Trophy className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="transactions">
            <Card className="bg-black/30 border-betster-700/40 text-white">
              <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
                <CardDescription className="text-betster-300">
                  Your recent deposits, withdrawals, and game activities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {transactions.map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between p-3 rounded-lg border border-betster-700/30 bg-betster-800/20">
                      <div className="flex items-center gap-3">
                        <div className={`rounded-full p-2 ${
                          tx.type === 'deposit' ? 'bg-green-500/20 text-green-400' : 
                          tx.type === 'win' ? 'bg-amber-500/20 text-amber-400' : 
                          tx.type === 'withdrawal' ? 'bg-red-500/20 text-red-400' : 
                          'bg-blue-500/20 text-blue-400'
                        }`}>
                          {tx.type === 'deposit' && <CreditCard className="h-4 w-4" />}
                          {tx.type === 'withdrawal' && <CreditCard className="h-4 w-4" />}
                          {tx.type === 'win' && <Trophy className="h-4 w-4" />}
                          {tx.type === 'game-fee' && <CalendarDays className="h-4 w-4" />}
                        </div>
                        <div>
                          <div className="font-medium capitalize">{tx.type.replace('-', ' ')}</div>
                          <div className="text-sm text-betster-300">{tx.date}</div>
                        </div>
                      </div>
                      <div className={`font-medium ${tx.amount > 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {tx.amount > 0 ? '+' : ''}{tx.amount}₹
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">
                  <Link to="/transactions" className="w-full flex items-center justify-center">
                    View All Transactions
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="statistics">
            <Card className="bg-black/30 border-betster-700/40 text-white">
              <CardHeader>
                <CardTitle>Detailed Statistics</CardTitle>
                <CardDescription className="text-betster-300">
                  Your performance metrics and game analytics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="p-4 rounded-lg bg-betster-800/30 border border-betster-700/30 text-center">
                    <h3 className="text-md font-medium text-betster-300">Win Rate</h3>
                    <p className="text-3xl font-bold text-white mt-2">{statistics.winRate}</p>
                  </div>
                  
                  <div className="p-4 rounded-lg bg-betster-800/30 border border-betster-700/30 text-center">
                    <h3 className="text-md font-medium text-betster-300">Highest Win</h3>
                    <p className="text-3xl font-bold text-green-400 mt-2">₹{statistics.highestWin}</p>
                  </div>
                  
                  <div className="p-4 rounded-lg bg-betster-800/30 border border-betster-700/30 text-center">
                    <h3 className="text-md font-medium text-betster-300">Avg. Number</h3>
                    <p className="text-3xl font-bold text-amber-400 mt-2">{statistics.averageNumber}</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-white">Winning Streak</h3>
                  <div className="h-8 w-full rounded-full overflow-hidden bg-betster-800/30 border border-betster-700/30">
                    <div className="h-full bg-gradient-to-r from-betster-600 to-betster-400 w-1/4"></div>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-betster-300">Current: 2 games</span>
                    <span className="text-betster-300">Best: 5 games</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full">View Detailed Analytics</Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="settings">
            <Card className="bg-black/30 border-betster-700/40 text-white">
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
                <CardDescription className="text-betster-300">
                  Manage your profile and preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1">
                  <h3 className="text-lg font-medium text-white">Notification Preferences</h3>
                  <p className="text-sm text-betster-300">Manage how you receive updates and alerts</p>
                </div>
                
                <div className="p-4 rounded-lg bg-betster-800/30 border border-betster-700/30 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Game Invitations</p>
                      <p className="text-sm text-betster-300">Receive notifications for new game invites</p>
                    </div>
                    <div className="flex items-center h-5">
                      <input
                        id="game-invites"
                        type="checkbox"
                        defaultChecked
                        className="w-4 h-4 text-betster-600 bg-gray-100 border-gray-300 rounded focus:ring-betster-500"
                      />
                    </div>
                  </div>
                  
                  <Separator className="bg-betster-700/20" />
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Results & Winnings</p>
                      <p className="text-sm text-betster-300">Get notified when games end and for winnings</p>
                    </div>
                    <div className="flex items-center h-5">
                      <input
                        id="results"
                        type="checkbox"
                        defaultChecked
                        className="w-4 h-4 text-betster-600 bg-gray-100 border-gray-300 rounded focus:ring-betster-500"
                      />
                    </div>
                  </div>
                  
                  <Separator className="bg-betster-700/20" />
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Promotional Offers</p>
                      <p className="text-sm text-betster-300">Receive updates about bonuses and offers</p>
                    </div>
                    <div className="flex items-center h-5">
                      <input
                        id="offers"
                        type="checkbox"
                        defaultChecked={false}
                        className="w-4 h-4 text-betster-600 bg-gray-100 border-gray-300 rounded focus:ring-betster-500"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 space-y-4">
                  <Button className="w-full" variant="outline">Change Password</Button>
                  <Button className="w-full bg-red-600 hover:bg-red-700">Delete Account</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default ProfilePage;
