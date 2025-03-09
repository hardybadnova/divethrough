
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { GameProvider } from "./contexts/GameContext";
import { KYCProvider } from './contexts/KYCContext';
import { StakingProvider } from './contexts/StakingContext';
import { useEffect } from "react";
import KYCVerificationScreen from './pages/KYCVerificationScreen';
import SplashScreen from "./pages/SplashScreen";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import PoolsScreen from "./pages/PoolsScreen";
import GameScreen from "./pages/GameScreen";
import GameResultScreen from "./pages/GameResultScreen";
import MilestonesScreen from "./pages/MilestonesScreen";
import ReferralScreen from "./pages/ReferralScreen";
import TransactionHistory from "./pages/TransactionHistory";
import StakingScreen from "./pages/StakingScreen";

const queryClient = new QueryClient();

const App = () => {
  // For DEBUG: Log Firebase console output to browser console
  useEffect(() => {
    console.log("App initialized. Firebase configured with Firebase Realtime Database.");
  }, []);
  
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <KYCProvider>
            <StakingProvider>
              <GameProvider>
                <TooltipProvider>
                  <Toaster />
                  <Sonner />
                  <Routes>
                    <Route path="/" element={<SplashScreen />} />
                    <Route path="/login" element={<Login />} />
                    
                    <Route element={<ProtectedRoute />}>
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/pools/:gameType" element={<PoolsScreen />} />
                      <Route path="/game/:poolId" element={<GameScreen />} />
                      <Route path="/result/:poolId" element={<GameResultScreen />} />
                      <Route path="/milestones" element={<MilestonesScreen />} />
                      <Route path="/referral" element={<ReferralScreen />} />
                      <Route path="/kyc" element={<KYCVerificationScreen />} />
                      <Route path="/transactions" element={<TransactionHistory />} />
                      <Route path="/staking" element={<StakingScreen />} />
                    </Route>
                    
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </TooltipProvider>
              </GameProvider>
            </StakingProvider>
          </KYCProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
