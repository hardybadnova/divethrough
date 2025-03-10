
import React from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSupport } from '@/contexts/SupportContext';

interface SupportChatBadgeProps {
  className?: string;
}

const SupportChatBadge = ({ className }: SupportChatBadgeProps) => {
  const { unreadCount } = useSupport();

  return (
    <Link to="/support" className={cn("relative", className)}>
      <MessageSquare className="h-6 w-6 text-betster-300" />
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
    </Link>
  );
};

export default SupportChatBadge;
