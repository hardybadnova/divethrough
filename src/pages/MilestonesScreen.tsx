
import React from "react";
import { motion } from "framer-motion";
import { Award, ChevronRight, Trophy } from "lucide-react";
import AppLayout from "@/components/AppLayout";
import { useGame } from "@/contexts/GameContext";
import { useAuth } from "@/contexts/AuthContext";
import { formatCurrency, formatPercentage } from "@/lib/formatters";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const MilestonesScreen = () => {
  const { user } = useAuth();
  const { players, getMilestoneProgress } = useGame();
  
  // Since we're using mock data, just use the first player
  const currentPlayer = players[0];
  const { currentMilestone, nextMilestone, progress } = getMilestoneProgress(currentPlayer.id);
  
  // List of all milestones
  const milestonesList = [
    { games: 1000, bonus: 5 },
    { games: 5000, bonus: 10 },
    { games: 25000, bonus: 15 },
    { games: 100000, bonus: 20 },
    { games: 500000, bonus: 30 },
  ];
  
  return (
    <AppLayout>
      <div className="container max-w-md mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-6 text-center">Milestones & Bonuses</h1>
        
        <Tabs defaultValue="milestones" className="w-full">
          <TabsList className="grid grid-cols-2 mb-6">
            <TabsTrigger value="milestones">Milestones</TabsTrigger>
            <TabsTrigger value="bonuses">My Bonuses</TabsTrigger>
          </TabsList>
          
          <TabsContent value="milestones">
            <div className="glass-card rounded-xl p-4 mb-6">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-medium">Your Progress</h2>
                <span className="text-sm text-muted-foreground">
                  {currentPlayer.milestones.gamesPlayed.toLocaleString()} games played
                </span>
              </div>
              
              <Progress value={progress} className="h-2 mb-2" />
              
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{currentMilestone.toLocaleString()} games</span>
                <span>{nextMilestone.toLocaleString()} games</span>
              </div>
              
              <div className="mt-4 p-3 bg-betster-600/20 rounded-lg">
                <div className="flex items-center">
                  <Trophy className="h-5 w-5 text-betster-400 mr-2" />
                  <div>
                    <p className="text-sm font-medium">Current Bonus Level</p>
                    <p className="text-xl font-bold text-betster-400">
                      {formatPercentage(currentPlayer.milestones.bonusPercentage)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="glass-card rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-border/40">
                <h2 className="font-medium">All Milestones</h2>
              </div>
              
              <div className="divide-y divide-border/40">
                {milestonesList.map((milestone, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`p-4 flex items-center ${
                      currentPlayer.milestones.gamesPlayed >= milestone.games
                        ? "bg-betster-600/10"
                        : ""
                    }`}
                  >
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center mr-3 ${
                      currentPlayer.milestones.gamesPlayed >= milestone.games
                        ? "bg-betster-600 text-white"
                        : "bg-secondary text-muted-foreground"
                    }`}>
                      {currentPlayer.milestones.gamesPlayed >= milestone.games ? (
                        <Trophy className="h-5 w-5" />
                      ) : (
                        <Award className="h-5 w-5" />
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <p className="font-medium">{milestone.games.toLocaleString()} Games</p>
                      <p className="text-sm text-muted-foreground">
                        {formatPercentage(milestone.bonus)} Bonus on Deposits
                      </p>
                    </div>
                    
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </motion.div>
                ))}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="bonuses">
            <div className="glass-card rounded-xl p-4 mb-6">
              <div className="flex items-center mb-4">
                <div className="h-12 w-12 rounded-full bg-betster-600 flex items-center justify-center mr-4">
                  <Award className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold">Total Bonus Amount</h2>
                  <p className="text-2xl font-bold text-betster-400">
                    {formatCurrency(currentPlayer.milestones.bonusAmount)}
                  </p>
                </div>
              </div>
              
              <p className="text-sm text-muted-foreground mb-4">
                You can withdraw bonuses after converting them into winnings by playing games.
              </p>
              
              <button className="betster-button w-full">
                Play Games to Convert Bonuses
              </button>
            </div>
            
            <div className="glass-card rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-border/40">
                <h2 className="font-medium">Bonus Details</h2>
              </div>
              
              <div className="p-4 space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Current Bonus Rate</span>
                  <span className="font-medium">{formatPercentage(currentPlayer.milestones.bonusPercentage)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Games Played</span>
                  <span className="font-medium">{currentPlayer.milestones.gamesPlayed.toLocaleString()}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Milestone Bonus</span>
                  <span className="font-medium">{formatCurrency(currentPlayer.milestones.bonusAmount)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Referral Bonus</span>
                  <span className="font-medium">{formatCurrency(currentPlayer.referralBonus)}</span>
                </div>
                
                <div className="border-t border-border/40 pt-3 flex justify-between">
                  <span className="font-medium">Total Bonus</span>
                  <span className="font-bold text-betster-400">
                    {formatCurrency(currentPlayer.milestones.bonusAmount + currentPlayer.referralBonus)}
                  </span>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default MilestonesScreen;
