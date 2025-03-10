import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import GameDetailsModal, { GameDetails } from "@/components/dashboard/GameDetailsModal";
import NotificationSystem from "@/components/dashboard/NotificationSystem";
import { useGame } from "@/contexts/GameContext";
import { toast } from "@/hooks/use-toast";
import AppLayout from "@/components/AppLayout";
import { Sun, Moon } from "lucide-react";
import QuickStats from "@/components/dashboard/QuickStats";
import StatsSection from "@/components/dashboard/StatsSection";
import GamesList from "@/components/dashboard/GamesList";
import TabsSection from "@/components/dashboard/TabsSection";
import HowToPlay from "@/components/dashboard/HowToPlay";
import { gameModules } from "@/data/gameModules";
import { CompetitionsTabs } from "@/components/competitions/CompetitionsTabs";

const Dashboard = () => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { initializeData } = useGame();
  const [selectedTab, setSelectedTab] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGame, setSelectedGame] = useState<GameDetails | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([
    {
      id: "1",
      title: "New Game Available",
      message: "Jackpot Horse has been added with a prize pool of ₹100,000!",
      timestamp: "Just now",
      read: false,
      type: "game",
    },
    {
      id: "2",
      title: "You Won!",
      message: "Congratulations! You won ₹500 in Bluff The Tough game.",
      timestamp: "2h ago",
      read: false,
      type: "reward",
    },
    {
      id: "3",
      title: "System Maintenance",
      message: "The platform will be under maintenance tomorrow from 2-4 AM.",
      timestamp: "5h ago",
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

  const applySearchFilter = (games: GameDetails[]) => {
    if (!searchQuery) return games;
    
    return games.filter(game => 
      game.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      game.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      game.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  };

  const applyTabFilter = (games: GameDetails[]) => {
    if (selectedTab === "all") return games;
    if (selectedTab === "featured") return games.filter(game => game.featured);
    return games.filter(game => game.tags.includes(selectedTab));
  };

  const filteredGames = applySearchFilter(applyTabFilter(gameModules));

  const openGameDetails = (game: GameDetails) => {
    setSelectedGame(game);
    setIsModalOpen(true);
  };

  const handleMarkAsRead = (id: string) => {
    setNotifications(prevNotifications => 
      prevNotifications.map(notification => 
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
    toast({
      title: "Notification marked as read",
      description: "The notification has been marked as read.",
    });
  };

  const handleClearAllNotifications = () => {
    setNotifications([]);
    toast({
      title: "Notifications cleared",
      description: "All notifications have been cleared.",
    });
  };

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedTab('all');
  };

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        <CompetitionsTabs />
        <div className="space-y-4 mb-8">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold tracking-tight text-gradient">
              Welcome Back{user?.username ? `, ${user.username}` : ''}
            </h1>
            <div className="flex items-center gap-2">
              <motion.button
                onClick={toggleTheme}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-betster-600/20 to-betster-800/20 backdrop-blur-md rounded-lg p-2 border border-betster-700/30"
              >
                {theme === 'dark' ? (
                  <Sun className="h-5 w-5 text-betster-400" />
                ) : (
                  <Moon className="h-5 w-5 text-betster-400" />
                )}
              </motion.button>
              <NotificationSystem 
                notifications={notifications} 
                onMarkAsRead={handleMarkAsRead} 
                onClearAll={handleClearAllNotifications} 
              />
            </div>
          </div>
          <p className="text-betster-300">
            Select a game module to start playing. Remember, the least picked numbers win!
          </p>
          
          <QuickStats user={user} />
          
          <StatsSection />
          
          <TabsSection 
            selectedTab={selectedTab} 
            setSelectedTab={setSelectedTab}
            setSearchQuery={setSearchQuery}
          />
        </div>

        <Separator className="my-6" />

        <GamesList 
          filteredGames={filteredGames}
          isLoading={isLoading}
          openGameDetails={openGameDetails}
          resetFilters={resetFilters}
        />
        
        <HowToPlay />

        <GameDetailsModal 
          game={selectedGame} 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
        />
      </div>
    </AppLayout>
  );
};

export default Dashboard;
