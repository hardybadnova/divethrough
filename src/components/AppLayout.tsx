
import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Header } from "./navigation/Header";
import { Footer } from "./navigation/Footer";
import { initOfflineDb } from "@/utils/offlineDb";
import { useOfflineSync } from "@/hooks/useOfflineSync";
import OfflineStatusBar from "./OfflineStatusBar";

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps) => {
  const location = useLocation();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [walletPopoverOpen, setWalletPopoverOpen] = useState(false);
  
  const { 
    isOnline, 
    isSyncing, 
    pendingItemsCount,
    handleManualSync 
  } = useOfflineSync();
  
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
        <OfflineStatusBar 
          isOnline={isOnline} 
          isSyncing={isSyncing} 
          pendingItemsCount={pendingItemsCount} 
        />
        
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
