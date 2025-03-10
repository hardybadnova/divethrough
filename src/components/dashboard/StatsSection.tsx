
import React from 'react';
import { motion } from 'framer-motion';
import GameStatsChart from './GameStatsChart';

const StatsSection: React.FC = () => {
  // Game statistics for charts
  const winRateStats = [
    { name: "Mon", value: 65, fill: "#9F75FF" },
    { name: "Tue", value: 45, fill: "#7022FF" },
    { name: "Wed", value: 80, fill: "#9F75FF" },
    { name: "Thu", value: 35, fill: "#7022FF" },
    { name: "Fri", value: 60, fill: "#9F75FF" },
    { name: "Sat", value: 75, fill: "#7022FF" },
    { name: "Sun", value: 85, fill: "#9F75FF" },
  ];

  const popularNumbersStats = [
    { name: "0-3", value: 120, fill: "#FF75A6" },
    { name: "4-6", value: 98, fill: "#FF9F75" },
    { name: "7-9", value: 86, fill: "#75FFCF" },
    { name: "10-12", value: 103, fill: "#75CAFF" },
    { name: "13-15", value: 112, fill: "#9F75FF" },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.4 }}
      className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4"
    >
      <GameStatsChart 
        data={winRateStats} 
        title="Your Win Rate (Last 7 Days)" 
      />
      <GameStatsChart 
        data={popularNumbersStats} 
        title="Most Popular Number Ranges" 
      />
    </motion.div>
  );
};

export default StatsSection;
