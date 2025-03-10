
import React, { useState } from 'react';
import { toast } from "@/hooks/use-toast";
import NotificationSystem from "@/components/dashboard/NotificationSystem";
import { Bell, Check, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

// Enhanced notification types for fantasy sports
export type NotificationType = 
  | "match" 
  | "contest" 
  | "team" 
  | "reward" 
  | "system";

export interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: NotificationType;
}

interface NotificationsPanelProps {
  notifications: Notification[];
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
}

const NotificationsPanel: React.FC<NotificationsPanelProps> = ({ 
  notifications, 
  setNotifications 
}) => {
  const [open, setOpen] = useState(false);
  
  const unreadCount = notifications.filter(n => !n.read).length;

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

  const handleMarkAllAsRead = () => {
    setNotifications(prevNotifications =>
      prevNotifications.map(notification => ({ ...notification, read: true }))
    );
    toast({
      title: "All notifications marked as read",
      description: "All notifications have been marked as read.",
    });
  };

  const handleClearAllNotifications = () => {
    setNotifications([]);
    toast({
      title: "Notifications cleared",
      description: "All notifications have been cleared.",
    });
    setOpen(false);
  };

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case "match":
        return <span className="text-green-500">🏏</span>;
      case "contest":
        return <span className="text-blue-500">🏆</span>;
      case "team":
        return <span className="text-purple-500">👥</span>;
      case "reward":
        return <span className="text-amber-500">💰</span>;
      case "system":
        return <span className="text-gray-500">🔔</span>;
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="relative bg-gradient-to-r from-betster-600/20 to-betster-800/20 backdrop-blur-md rounded-lg p-2 border border-betster-700/30">
          <Bell className="h-5 w-5 text-betster-400" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500">
              {unreadCount}
            </Badge>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[380px] p-0 bg-gradient-to-b from-betster-900/90 to-betster-950/90 backdrop-blur-md border border-betster-700/50 text-betster-100">
        <div className="flex items-center justify-between border-b border-betster-700/50 p-3">
          <h3 className="font-semibold text-lg">Notifications</h3>
          <div className="flex gap-2">
            {unreadCount > 0 && (
              <button 
                onClick={handleMarkAllAsRead}
                className="text-xs flex items-center gap-1 text-betster-300 hover:text-betster-100"
              >
                <Check className="h-3 w-3" />
                <span>Mark all as read</span>
              </button>
            )}
            {notifications.length > 0 && (
              <button 
                onClick={handleClearAllNotifications}
                className="text-xs flex items-center gap-1 text-betster-300 hover:text-betster-100"
              >
                <Trash2 className="h-3 w-3" />
                <span>Clear all</span>
              </button>
            )}
          </div>
        </div>
        
        <div className="max-h-[400px] overflow-y-auto divide-y divide-betster-800/50">
          {notifications.length === 0 ? (
            <div className="py-6 text-center text-betster-400">
              <p>No notifications</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <div 
                key={notification.id} 
                className={cn(
                  "p-3 hover:bg-betster-800/20 transition-colors cursor-pointer",
                  !notification.read && "bg-betster-800/40"
                )}
                onClick={() => handleMarkAsRead(notification.id)}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-1 h-8 w-8 flex items-center justify-center rounded-full bg-betster-800/50">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-baseline mb-1">
                      <h4 className={cn(
                        "text-sm font-medium",
                        !notification.read && "font-semibold"
                      )}>
                        {notification.title}
                      </h4>
                      <span className="text-xs text-betster-400">{notification.timestamp}</span>
                    </div>
                    <p className="text-xs text-betster-300">{notification.message}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationsPanel;
