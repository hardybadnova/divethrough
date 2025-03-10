
import React from 'react';
import { motion } from 'framer-motion';
import { Coins, Trophy, Users } from 'lucide-react';
import { User } from '@/types/auth';

interface QuickStatsProps {
  user: User | null;
}

const QuickStats: React.FC<QuickStatsProps> = ({ user }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.4 }}
      className="grid grid-cols-3 gap-3 mt-4"
    >
      <div className="bg-black/30 backdrop-blur-sm rounded-xl p-3 border border-betster-700/30">
        <div className="flex items-center mb-1">
          <Coins className="h-4 w-4 mr-1.5 text-amber-400" />
          <span className="text-xs text-betster-300">Balance</span>
        </div>
        <p className="text-lg font-semibold text-white">₹{user?.wallet || 0}</p>
      </div>
      <div className="bg-black/30 backdrop-blur-sm rounded-xl p-3 border border-betster-700/30">
        <div className="flex items-center mb-1">
          <Trophy className="h-4 w-4 mr-1.5 text-blue-400" />
          <span className="text-xs text-betster-300">Active Games</span>
        </div>
        <p className="text-lg font-semibold text-white">3</p>
      </div>
      <div className="bg-black/30 backdrop-blur-sm rounded-xl p-3 border border-betster-700/30">
        <div className="flex items-center mb-1">
          <Users className="h-4 w-4 mr-1.5 text-green-400" />
          <span className="text-xs text-betster-300">Players</span>
        </div>
        <p className="text-lg font-semibold text-white">2.7K</p>
      </div>
    </motion.div>
  );
};

export default QuickStats;
