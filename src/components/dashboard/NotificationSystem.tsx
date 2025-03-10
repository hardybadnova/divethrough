
import React, { useState } from 'react';
import { Bell, X } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from 'framer-motion';

export interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'game' | 'system' | 'reward';
}

interface NotificationSystemProps {
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onClearAll: () => void;
}

const NotificationSystem: React.FC<NotificationSystemProps> = ({
  notifications,
  onMarkAsRead,
  onClearAll
}) => {
  const [open, setOpen] = useState(false);
  
  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAsRead = (id: string) => {
    onMarkAsRead(id);
  };

  const getNotificationIcon = (type: string) => {
    switch(type) {
      case 'game':
        return <div className="bg-blue-500/20 rounded-full p-1.5"><Bell className="h-3 w-3 text-blue-400" /></div>;
      case 'system':
        return <div className="bg-purple-500/20 rounded-full p-1.5"><Bell className="h-3 w-3 text-purple-400" /></div>;
      case 'reward':
        return <div className="bg-amber-500/20 rounded-full p-1.5"><Bell className="h-3 w-3 text-amber-400" /></div>;
      default:
        return <div className="bg-betster-500/20 rounded-full p-1.5"><Bell className="h-3 w-3 text-betster-400" /></div>;
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="relative rounded-full p-2 hover:bg-betster-800/30 flex items-center justify-center">
          <Bell className="h-5 w-5 text-betster-300" />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-80 p-0 backdrop-blur-xl bg-black/60 border border-betster-700/40 rounded-xl" 
        align="end"
      >
        <div className="flex justify-between items-center p-3 border-b border-betster-700/30">
          <h3 className="font-medium text-white">Notifications</h3>
          {notifications.length > 0 && (
            <button 
              onClick={onClearAll}
              className="text-xs text-betster-400 hover:text-white transition-colors"
            >
              Clear all
            </button>
          )}
        </div>
        <div className="max-h-[60vh] overflow-y-auto scrollbar-none">
          <AnimatePresence>
            {notifications.length > 0 ? (
              <ul>
                {notifications.map((notification) => (
                  <motion.li 
                    key={notification.id}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, height: 0 }}
                    className={cn(
                      "p-3 border-b border-betster-700/30 hover:bg-betster-800/20 cursor-pointer",
                      !notification.read && "bg-betster-900/30"
                    )}
                    onClick={() => handleMarkAsRead(notification.id)}
                  >
                    <div className="flex gap-3">
                      {getNotificationIcon(notification.type)}
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-1">
                          <h4 className="font-medium text-sm text-white">{notification.title}</h4>
                          <span className="text-xs text-betster-400">{notification.timestamp}</span>
                        </div>
                        <p className="text-xs text-betster-300">{notification.message}</p>
                      </div>
                    </div>
                  </motion.li>
                ))}
              </ul>
            ) : (
              <div className="p-6 text-center">
                <p className="text-betster-400 text-sm">No notifications</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationSystem;
