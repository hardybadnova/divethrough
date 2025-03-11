
import React from "react";
import { Wifi, WifiOff, RefreshCw } from "lucide-react";
import { triggerManualSync } from "@/services/offlineSyncService";
import { motion, AnimatePresence } from "framer-motion";

interface OfflineStatusBarProps {
  isOnline: boolean;
  isSyncing: boolean;
  pendingItemsCount?: number;
}

const OfflineStatusBar: React.FC<OfflineStatusBarProps> = ({ 
  isOnline, 
  isSyncing,
  pendingItemsCount = 0
}) => {
  if (isOnline && !isSyncing && pendingItemsCount === 0) {
    return null;
  }

  const handleManualSync = async () => {
    await triggerManualSync();
  };

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 'auto', opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        transition={{ duration: 0.3 }}
        className={`px-4 py-1 text-center text-xs flex items-center justify-center ${
          isOnline ? 'bg-amber-600 text-white' : 'bg-red-600 text-white'
        }`}
      >
        {!isOnline ? (
          <>
            <WifiOff className="h-3 w-3 mr-1" />
            Offline Mode - Limited functionality available
          </>
        ) : isSyncing ? (
          <>
            <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
            Syncing your data...
          </>
        ) : pendingItemsCount > 0 ? (
          <>
            <Wifi className="h-3 w-3 mr-1 text-amber-300" />
            {pendingItemsCount} item{pendingItemsCount !== 1 ? 's' : ''} pending sync
          </>
        ) : null}
        
        {isOnline && !isSyncing && pendingItemsCount > 0 && (
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleManualSync}
            className="ml-2 flex items-center bg-amber-700 hover:bg-amber-800 rounded px-1 py-0.5 text-white text-xs"
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            Sync Now
          </motion.button>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default OfflineStatusBar;
