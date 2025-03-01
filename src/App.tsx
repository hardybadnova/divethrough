
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { GameProvider } from "./contexts/GameContext";
import SplashScreen from "./pages/SplashScreen";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import PoolsScreen from "./pages/PoolsScreen";
import GameScreen from "./pages/GameScreen";
import GameResultScreen from "./pages/GameResultScreen";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AuthProvider>
        <GameProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <Routes>
              <Route path="/" element={<SplashScreen />} />
              <Route path="/login" element={<Login />} />
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/pools/:gameType" 
                element={
                  <ProtectedRoute>
                    <PoolsScreen />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/game/:poolId" 
                element={
                  <ProtectedRoute>
                    <GameScreen />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/result/:poolId" 
                element={
                  <ProtectedRoute>
                    <GameResultScreen />
                  </ProtectedRoute>
                } 
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </TooltipProvider>
        </GameProvider>
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
