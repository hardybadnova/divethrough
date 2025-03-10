
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import GameStatsChart from './GameStatsChart';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowUpRight, TrendingUp, ChevronUp, ChevronDown, Clock } from 'lucide-react';

const StatsSection: React.FC = () => {
  const [timeRange, setTimeRange] = useState('week');
  
  // Game statistics for charts
  const weeklyWinRateStats = [
    { name: "Mon", value: 65, fill: "#9F75FF" },
    { name: "Tue", value: 45, fill: "#7022FF" },
    { name: "Wed", value: 80, fill: "#9F75FF" },
    { name: "Thu", value: 35, fill: "#7022FF" },
    { name: "Fri", value: 60, fill: "#9F75FF" },
    { name: "Sat", value: 75, fill: "#7022FF" },
    { name: "Sun", value: 85, fill: "#9F75FF" },
  ];
  
  const monthlyWinRateStats = [
    { name: "Week 1", value: 55, fill: "#9F75FF" },
    { name: "Week 2", value: 65, fill: "#7022FF" },
    { name: "Week 3", value: 48, fill: "#9F75FF" },
    { name: "Week 4", value: 72, fill: "#7022FF" },
  ];
  
  const popularNumbersStats = [
    { name: "0-3", value: 120, fill: "#FF75A6" },
    { name: "4-6", value: 98, fill: "#FF9F75" },
    { name: "7-9", value: 86, fill: "#75FFCF" },
    { name: "10-12", value: 103, fill: "#75CAFF" },
    { name: "13-15", value: 112, fill: "#9F75FF" },
  ];
  
  const recentTopNumbersStats = [
    { name: "7", value: 15, fill: "#9F75FF", isUp: true, change: "+32%" },
    { name: "12", value: 12, fill: "#FF75A6", isUp: true, change: "+18%" },
    { name: "3", value: 10, fill: "#75FFCF", isUp: false, change: "-5%" },
    { name: "9", value: 9, fill: "#75CAFF", isUp: true, change: "+12%" },
    { name: "11", value: 7, fill: "#FF9F75", isUp: false, change: "-10%" },
  ];

  const getWinRateData = () => {
    return timeRange === 'week' ? weeklyWinRateStats : monthlyWinRateStats;
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.4 }}
      className="space-y-4 mt-4"
    >
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-betster-100">Your Game Stats</h3>
        <Tabs value={timeRange} onValueChange={setTimeRange} className="w-auto">
          <TabsList className="h-8 bg-black/30 border border-betster-700/30">
            <TabsTrigger value="week" className="text-xs h-6 px-2">This Week</TabsTrigger>
            <TabsTrigger value="month" className="text-xs h-6 px-2">This Month</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-black/30 backdrop-blur-sm border border-betster-700/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <TrendingUp className="h-4 w-4 mr-2 text-betster-400" />
              Your Win Rate
              <span className="ml-auto text-xs bg-betster-700/30 px-2 py-0.5 rounded-full">
                {timeRange === 'week' ? 'Weekly' : 'Monthly'}
              </span>
            </CardTitle>
            <CardDescription className="text-xs text-betster-400">
              Track your performance over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <GameStatsChart data={getWinRateData()} />
          </CardContent>
        </Card>
        
        <Card className="bg-black/30 backdrop-blur-sm border border-betster-700/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <ArrowUpRight className="h-4 w-4 mr-2 text-betster-400" />
              Popular Number Ranges
            </CardTitle>
            <CardDescription className="text-xs text-betster-400">
              Most commonly selected numbers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <GameStatsChart data={popularNumbersStats} />
          </CardContent>
        </Card>
      </div>
      
      <Card className="bg-black/30 backdrop-blur-sm border border-betster-700/30">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center">
            <Clock className="h-4 w-4 mr-2 text-betster-400" />
            Recent Trending Numbers
          </CardTitle>
          <CardDescription className="text-xs text-betster-400">
            Numbers gaining or losing popularity recently
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {recentTopNumbersStats.map((stat, index) => (
              <div 
                key={index} 
                className="flex flex-col items-center justify-center p-3 rounded-lg bg-betster-900/50 border border-betster-700/30"
              >
                <span className="text-xl font-bold" style={{ color: stat.fill }}>{stat.name}</span>
                <span className="text-sm text-betster-300 mt-1">Picked {stat.value}x</span>
                <div className={`flex items-center text-xs mt-1 ${stat.isUp ? 'text-green-400' : 'text-red-400'}`}>
                  {stat.isUp ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                  <span>{stat.change}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default StatsSection;
