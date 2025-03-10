
import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Header } from "./navigation/Header";
import { Footer } from "./navigation/Footer";
import { initOfflineDb, syncPendingData } from "@/utils/offlineDb";
import { toast } from "@/hooks/use-toast";
import { Wifi, WifiOff, RefreshCw } from "lucide-react";

interface AppLayoutProps {
  children: React.ReactNode;
}

// Type definition for ServiceWorker with Sync
interface SyncManager {
  register(tag: string): Promise<void>;
}

// Type guard for background sync support
const hasBackgroundSync = (registration: ServiceWorkerRegistration): registration is ServiceWorkerRegistration & { sync: SyncManager } => {
  return 'sync' in registration;
};

const AppLayout = ({ children }: AppLayoutProps) => {
  const location = useLocation();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [walletPopoverOpen, setWalletPopoverOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [offlineMode, setOfflineMode] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const isGameScreen = location.pathname.includes("/game/");

  // Initialize the offline database on mount
  useEffect(() => {
    const initDb = async () => {
      try {
        await initOfflineDb();
        console.log('Offline database initialized');
      } catch (error) {
        console.error('Failed to initialize offline database:', error);
      }
    };

    initDb();
  }, []);

  // Handle manual sync when user clicks the sync button
  const handleManualSync = async () => {
    if (!isOnline) {
      toast({
        title: "Sync Failed",
        description: "You need to be online to sync your data",
        variant: "destructive"
      });
      return;
    }

    if (isSyncing) {
      toast({
        title: "Sync in Progress",
        description: "Please wait for the current sync to complete",
      });
      return;
    }

    setIsSyncing(true);
    toast({
      title: "Sync Started",
      description: "Syncing your offline data...",
    });

    try {
      const results = await syncPendingData();
      
      const totalSuccess = results.bets.success + results.transactions.success;
      const totalFailed = results.bets.failed + results.transactions.failed;
      
      if (totalSuccess > 0 || totalFailed > 0) {
        toast({
          title: "Sync Complete",
          description: `Synced ${totalSuccess} items successfully. ${totalFailed > 0 ? `Failed to sync ${totalFailed} items.` : ''}`,
          variant: totalFailed > 0 ? "destructive" : "default"
        });
      } else {
        toast({
          title: "Sync Complete",
          description: "No items needed to be synced"
        });
      }
    } catch (error) {
      console.error("Error during manual sync:", error);
      toast({
        title: "Sync Failed",
        description: "There was an error syncing your data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSyncing(false);
    }
  };

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (offlineMode) {
        toast({
          title: "Back Online",
          description: (
            <div className="flex items-center">
              <Wifi className="h-4 w-4 text-green-500 mr-2" />
              Connection restored. Your data will sync automatically.
            </div>
          )
        });
        
        // Automatic sync when coming back online
        syncPendingData().then(results => {
          const totalSuccess = results.bets.success + results.transactions.success;
          if (totalSuccess > 0) {
            toast({
              title: "Data Synced",
              description: `Successfully synced ${totalSuccess} items that were made while offline.`
            });
          }
        }).catch(error => {
          console.error("Error during auto sync:", error);
        });
        
        // Trigger background sync if available
        if ('serviceWorker' in navigator) {
          navigator.serviceWorker.ready.then(registration => {
            if (hasBackgroundSync(registration)) {
              registration.sync.register('betster-bet-sync');
              registration.sync.register('betster-transaction-sync');
            }
          });
        }
      }
      setOfflineMode(false);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setOfflineMode(true);
      toast({
        title: "You're Offline",
        description: (
          <div className="flex items-center">
            <WifiOff className="h-4 w-4 text-amber-500 mr-2" />
            Limited functionality available. Changes will sync when online.
          </div>
        ),
        duration: 5000
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [offlineMode]);

  return (
    <AnimatePresence mode="wait">
      <motion.div 
        key={location.pathname}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col min-h-screen overflow-hidden bg-gradient-to-br from-[#1a0033] to-[#4a0080]"
      >
        {!isOnline && (
          <div className="bg-amber-600 text-white px-4 py-1 text-center text-xs flex items-center justify-center">
            <WifiOff className="h-3 w-3 mr-1" />
            Offline Mode - Limited functionality available
            <button 
              onClick={handleManualSync}
              className="ml-2 flex items-center bg-amber-700 hover:bg-amber-800 rounded px-1 py-0.5 text-white text-xs"
              disabled={!isOnline || isSyncing}
            >
              <RefreshCw className={`h-3 w-3 mr-1 ${isSyncing ? 'animate-spin' : ''}`} />
              Sync
            </button>
          </div>
        )}
        
        <Header 
          sheetOpen={sheetOpen}
          setSheetOpen={setSheetOpen}
          walletPopoverOpen={walletPopoverOpen}
          setWalletPopoverOpen={setWalletPopoverOpen}
        />

        <main className={cn("flex-1 flex flex-col", isGameScreen ? "pb-0" : "pb-16")}>
          {children}
        </main>

        {!isGameScreen && <Footer />}
      </motion.div>
    </AnimatePresence>
  );
};

export default AppLayout;
