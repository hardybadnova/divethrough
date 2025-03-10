
import React from 'react';
import { motion } from "framer-motion";
import { Sun, Moon } from "lucide-react";
import { User } from "@/types/auth";
import NotificationsPanel, { Notification } from "./NotificationsPanel";

interface DashboardHeaderProps {
  user: User | null;
  theme: string;
  toggleTheme: () => void;
  notifications: Notification[];
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ 
  user, 
  theme, 
  toggleTheme, 
  notifications, 
  setNotifications 
}) => {
  return (
    <div className="space-y-4 mb-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight text-gradient">
          Welcome{user?.username ? `, ${user.username}` : ''}
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
          <NotificationsPanel 
            notifications={notifications} 
            setNotifications={setNotifications} 
          />
        </div>
      </div>
      <p className="text-betster-300">
        Choose from upcoming matches and create your fantasy team to win big rewards!
      </p>
    </div>
  );
};

export default DashboardHeader;
