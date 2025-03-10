
import React, { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Link, useLocation } from "react-router-dom";
import { Menu, Wallet, Home, Trophy, MessageSquare, LogOut, User, Award, Percent, Shield, Sun, Moon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useKYC } from "@/contexts/KYCContext";
import { useTheme } from "@/contexts/ThemeContext";
import BetsterLogo from "./BetsterLogo";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "@/hooks/use-toast";

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps) => {
  const { user, logout } = useAuth();
  const { getVerificationStatus } = useKYC();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const [sheetOpen, setSheetOpen] = useState(false);

  const verificationStatus = getVerificationStatus();
  
  const menuItems = [
    { label: "Profile", icon: User, path: "/profile" },
    { 
      label: "KYC Verification", 
      icon: Shield, 
      path: "/kyc",
      badge: verificationStatus === 'verified' ? 'Verified' : 
             verificationStatus === 'pending' ? 'Pending' : 'Required',
      badgeColor: verificationStatus === 'verified' ? 'bg-green-500/80' : 
                 verificationStatus === 'pending' ? 'bg-amber-500/80' : 'bg-red-500/80'
    },
    { label: "Leaderboard", icon: Trophy, path: "/leaderboard" },
    { label: "Milestones & Bonuses", icon: Award, path: "/milestones" },
    { label: "Referral Program", icon: Percent, path: "/referral" },
    { label: "Chat Support", icon: MessageSquare, path: "/support" },
    { label: "Game History", icon: Home, path: "/game-history" },
    { label: "Test Wallet", icon: Wallet, path: "/test-wallet" },
  ];

  const handleLogout = () => {
    logout();
    toast({
      title: "Logged out",
      description: "You have been successfully logged out",
    });
  };

  const isGameScreen = location.pathname.includes("/game/");

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
        <header className="sticky top-0 z-30 w-full border-b backdrop-blur-lg bg-black/30 border-betster-600/40">
          <div className="flex h-16 items-center justify-between px-4">
            <div className="flex items-center">
              <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                <SheetTrigger asChild>
                  <button className="rounded-full p-2 hover:bg-betster-800/30 flex items-center justify-center">
                    <Menu className="h-5 w-5 text-betster-300" />
                  </button>
                </SheetTrigger>
                <SheetContent side="left" className="bg-black/95 backdrop-blur-xl border-r border-betster-700/40 p-0">
                  <div className="flex flex-col h-full">
                    <div className="py-6 px-4 border-b border-betster-700/40">
                      <div className="flex items-center gap-4">
                        <div className="rounded-full bg-gradient-to-br from-betster-500 to-betster-700 h-12 w-12 flex items-center justify-center">
                          <User className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-white">{user?.username}</p>
                          <p className="text-sm text-betster-300">
                            ₹{user?.wallet || 0}
                          </p>
                        </div>
                      </div>
                    </div>
                    <nav className="px-2 py-4 flex flex-col gap-1">
                      <div className="px-3 py-3 flex items-center justify-between">
                        <span className="text-betster-300">Theme</span>
                        <button
                          onClick={toggleTheme}
                          className="rounded-full p-2 hover:bg-betster-800/30 flex items-center justify-center"
                        >
                          {theme === 'dark' ? (
                            <Sun className="h-5 w-5 text-betster-400" />
                          ) : (
                            <Moon className="h-5 w-5 text-betster-400" />
                          )}
                        </button>
                      </div>
                      
                      {menuItems.map((item, index) => (
                        <Link
                          key={index}
                          to={item.path}
                          className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-betster-800/30 transition-colors"
                          onClick={() => setSheetOpen(false)}
                        >
                          <item.icon className="h-5 w-5 text-betster-400" />
                          <span className="text-betster-100">{item.label}</span>
                          {item.badge && (
                            <span className={`ml-auto text-xs px-2 py-0.5 rounded-full text-white ${item.badgeColor}`}>
                              {item.badge}
                            </span>
                          )}
                        </Link>
                      ))}
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-betster-800/30 text-left text-destructive transition-colors mt-auto"
                      >
                        <LogOut className="h-5 w-5" />
                        <span>Logout</span>
                      </button>
                    </nav>
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            <div className="flex-1 flex justify-center">
              <Link to="/dashboard">
                <BetsterLogo className="h-8" />
              </Link>
            </div>

            <div className="flex items-center gap-2">
              <Link
                to="/test-wallet"
                className="inline-flex items-center gap-1.5 rounded-full bg-betster-600/20 px-3 py-1.5 text-sm font-medium text-betster-100 transition-colors hover:bg-betster-600/30"
              >
                <Wallet className="h-4 w-4" />
                <span>₹{user?.wallet || 0}</span>
              </Link>
            </div>
          </div>
        </header>

        <main className={cn("flex-1 flex flex-col", isGameScreen ? "pb-0" : "pb-16")}>
          {children}
        </main>

        {!isGameScreen && (
          <footer className="fixed bottom-0 left-0 right-0 z-30 bg-black/30 backdrop-blur-lg border-t border-betster-700/40">
            <div className="flex h-16 items-center justify-between px-4">
              <Link
                to="/dashboard"
                className="flex flex-1 flex-col items-center justify-center py-1"
              >
                <Home className="h-5 w-5 text-betster-300" />
                <span className="text-xs text-betster-300 mt-1">Home</span>
              </Link>
              <Link
                to="/kyc"
                className="flex flex-1 flex-col items-center justify-center py-1"
              >
                <Shield className="h-5 w-5 text-betster-300" />
                <span className="text-xs text-betster-300 mt-1">Verify</span>
              </Link>
              <Link
                to="/milestones"
                className="flex flex-1 flex-col items-center justify-center py-1"
              >
                <Trophy className="h-5 w-5 text-betster-300" />
                <span className="text-xs text-betster-300 mt-1">Milestones</span>
              </Link>
              <Link
                to="/support"
                className="flex flex-1 flex-col items-center justify-center py-1"
              >
                <MessageSquare className="h-5 w-5 text-betster-300" />
                <span className="text-xs text-betster-300 mt-1">Support</span>
              </Link>
            </div>
          </footer>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default AppLayout;
