
import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Header } from "./navigation/Header";
import { Footer } from "./navigation/Footer";
import { initOfflineDb } from "@/utils/offlineDb";
import { toast } from "@/hooks/use-toast";
import { Wifi, WifiOff } from "lucide-react";

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
              Connection restored. Syncing your data...
            </div>
          )
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
