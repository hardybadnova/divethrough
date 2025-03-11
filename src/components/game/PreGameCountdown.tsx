
import React from "react";
import { Progress } from "@/components/ui/progress";
import { WifiOff } from "lucide-react";
import { motion } from "framer-motion";

interface PreGameCountdownProps {
  preGameCountdown: number;
  isOnline?: boolean;
}

const PreGameCountdown: React.FC<PreGameCountdownProps> = ({ 
  preGameCountdown,
  isOnline = true
}) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`glass-card rounded-xl p-4 mb-4 ${isOnline ? 'bg-betster-900/70' : 'bg-betster-900/90 border-red-500/50 border'}`}
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium text-betster-300">
            {isOnline ? (
              "Waiting for game to start"
            ) : (
              <div className="flex items-center">
                <WifiOff className="h-4 w-4 mr-1 text-red-400" />
                <span>Waiting for game to start</span>
              </div>
            )}
          </h3>
          <p className="text-sm text-muted-foreground">
            {isOnline ? (
              "You can exit or change table during this time"
            ) : (
              "Limited functionality available in offline mode"
            )}
          </p>
        </div>
        <motion.div 
          className="flex flex-col items-center"
          key={preGameCountdown}
          initial={{ scale: 1.2 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.2 }}
        >
          <span className="text-2xl font-bold text-betster-400">{preGameCountdown}</span>
          <span className="text-xs text-muted-foreground">seconds</span>
        </motion.div>
      </div>
      <Progress 
        value={(preGameCountdown / 20) * 100} 
        className={`h-2 mt-2 ${!isOnline ? 'bg-red-950' : ''}`} 
      />
    </motion.div>
  );
};

export default PreGameCountdown;
