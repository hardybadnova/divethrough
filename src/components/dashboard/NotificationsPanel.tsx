
import React from 'react';
import { toast } from "@/hooks/use-toast";
import NotificationSystem from "@/components/dashboard/NotificationSystem";

interface NotificationsPanelProps {
  notifications: any[];
  setNotifications: React.Dispatch<React.SetStateAction<any[]>>;
}

const NotificationsPanel: React.FC<NotificationsPanelProps> = ({ 
  notifications, 
  setNotifications 
}) => {
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

  return (
    <NotificationSystem 
      notifications={notifications} 
      onMarkAsRead={handleMarkAsRead} 
      onClearAll={handleClearAllNotifications} 
    />
  );
};

export default NotificationsPanel;
