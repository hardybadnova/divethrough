
import { useState, useEffect } from "react";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { GameDetails } from "@/components/dashboard/GameDetailsModal";
import { useGame } from "@/contexts/GameContext";
import AppLayout from "@/components/AppLayout";
import QuickStats from "@/components/dashboard/QuickStats";
import StatsSection from "@/components/dashboard/StatsSection";
import { gameModules } from "@/data/gameModules";
import { CompetitionsTabs } from "@/components/competitions/CompetitionsTabs";
import { mapModuleToGameDetails } from "@/utils/gameModuleMapping";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import GamesSection from "@/components/dashboard/GamesSection";
import { Notification } from "@/components/dashboard/NotificationsPanel";

const Dashboard = () => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { initializeData } = useGame();
  const [isLoading, setIsLoading] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      title: "IPL 2023: MI vs CSK Match",
      message: "Match starts in 2 hours. Create your team now!",
      timestamp: "Just now",
      read: false,
      type: "match",
    },
    {
      id: "2",
      title: "Mega Contest Available",
      message: "₹10 Lakhs prize pool for today's match! Join now.",
      timestamp: "1h ago",
      read: false,
      type: "contest",
    },
    {
      id: "3",
      title: "Your Team Won!",
      message: "Congratulations! You won ₹500 in yesterday's match.",
      timestamp: "5h ago",
      read: false,
      type: "reward",
    },
    {
      id: "4",
      title: "Player Update: Virat Kohli",
      message: "Virat Kohli is confirmed to play in today's match.",
      timestamp: "Yesterday",
      read: true,
      type: "team",
    },
    {
      id: "5",
      title: "System Maintenance",
      message: "The platform will be under maintenance tomorrow from 2-4 AM.",
      timestamp: "2 days ago",
      read: true,
      type: "system",
    },
  ]);

  useEffect(() => {
    const initGame = async () => {
      try {
        await initializeData();
      } catch (error) {
        console.error("Could not initialize game data:", error);
      }
    };
    
    initGame();
    
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [initializeData]);

  const gameDetailsArray: GameDetails[] = gameModules.map(mapModuleToGameDetails);

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        <CompetitionsTabs />
        
        <DashboardHeader 
          user={user}
          theme={theme}
          toggleTheme={toggleTheme}
          notifications={notifications}
          setNotifications={setNotifications}
        />
          
        <QuickStats user={user} />
          
        <StatsSection />
          
        <GamesSection 
          gameDetailsArray={gameDetailsArray}
          isLoading={isLoading}
        />
      </div>
    </AppLayout>
  );
};

export default Dashboard;
