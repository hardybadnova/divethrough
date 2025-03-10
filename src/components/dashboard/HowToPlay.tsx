
import React from 'react';
import { Shield, ArrowRight, ChevronRight, Gift, Trophy, Percent } from 'lucide-react';
import { motion } from 'framer-motion';

const HowToPlay: React.FC = () => {
  const steps = [
    { 
      icon: <Trophy className="h-5 w-5 text-betster-400" />,
      title: "Choose a Game Type",
      description: "Select a game type and pool based on your preferred entry fee"
    },
    { 
      icon: <Shield className="h-5 w-5 text-betster-400" />,
      title: "Pick Your Number",
      description: "The goal is to pick a number that few others will select"
    },
    { 
      icon: <ChevronRight className="h-5 w-5 text-betster-400" />,
      title: "Wait for Results",
      description: "Wait for the timer to end and see which numbers were least picked"
    },
    { 
      icon: <Gift className="h-5 w-5 text-betster-400" />,
      title: "Win Prizes",
      description: "The least picked numbers win prizes from the pool!"
    },
    { 
      icon: <Percent className="h-5 w-5 text-betster-400" />,
      title: "Earn Bonuses",
      description: "Play more games to earn milestone bonuses (5-30% based on games played)"
    }
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      className="mt-8 p-6 bg-black/30 backdrop-blur-sm rounded-xl border border-betster-700/30"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center space-x-3 mb-5">
        <Shield className="h-5 w-5 text-betster-400" />
        <h2 className="font-semibold text-white text-xl">How to Play</h2>
      </div>
      
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {steps.map((step, index) => (
          <motion.div 
            key={index}
            variants={item}
            className="flex items-start space-x-3 p-3 bg-betster-900/30 rounded-lg border border-betster-700/20"
          >
            <div className="flex-shrink-0 rounded-full bg-betster-800/50 p-2">
              {step.icon}
            </div>
            <div>
              <h3 className="text-betster-100 font-medium">{step.title}</h3>
              <p className="text-sm text-betster-300 mt-1">{step.description}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>
      
      <motion.div 
        className="mt-5 p-4 bg-gradient-to-r from-betster-800/40 to-betster-700/20 rounded-lg"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <p className="text-sm text-betster-200 flex items-center">
          <Trophy className="h-4 w-4 mr-2 text-yellow-500" />
          <span>Tip: Refer friends to earn 5% of their first deposit!</span>
        </p>
      </motion.div>
    </motion.div>
  );
};

export default HowToPlay;
