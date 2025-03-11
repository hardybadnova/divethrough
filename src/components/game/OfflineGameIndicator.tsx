
import React from "react";
import { AlertTriangle, Wifi, WifiOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface OfflineGameIndicatorProps {
  isOnline: boolean;
  gameState: "pre-game" | "in-progress" | "completed";
  className?: string;
}

const OfflineGameIndicator: React.FC<OfflineGameIndicatorProps> = ({
  isOnline,
  gameState,
  className
}) => {
  if (isOnline) return null;
  
  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3 }}
        className={cn(
          "glass-card rounded-xl p-4 mb-4 bg-red-900/70 text-white", 
          className
        )}
      >
        <div className="flex items-center">
          <div className="bg-red-800 rounded-full p-2 mr-3">
            {gameState === "in-progress" ? (
              <AlertTriangle className="h-5 w-5 text-red-200" />
            ) : (
              <WifiOff className="h-5 w-5 text-red-200" />
            )}
          </div>
          <div>
            <h3 className="font-medium">You're currently offline</h3>
            <p className="text-sm opacity-90">
              {gameState === "pre-game" ? (
                "You can still join the game, but your entry will sync when you're back online."
              ) : gameState === "in-progress" ? (
                "Your game actions will be saved locally and synced when you're back online."
              ) : (
                "Game results will be available when you reconnect."
              )}
            </p>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default OfflineGameIndicator;
