
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/types/auth';
import { supabase } from '@/lib/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface SupportMessage {
  id: string;
  sender: 'user' | 'support';
  message: string;
  timestamp: string;
  read: boolean;
}

interface SupportContextType {
  messages: SupportMessage[];
  isLoading: boolean;
  isSendingMessage: boolean;
  unreadCount: number;
  sendMessage: (message: string) => Promise<void>;
  markAllAsRead: () => void;
}

const SupportContext = createContext<SupportContextType | undefined>(undefined);

export const SupportProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [user, setUser] = useState<User | null>(null);

  // Get current user
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session?.user) {
        // Fix: Include all required User properties
        setUser({
          id: data.session.user.id,
          email: data.session.user.email || null,
          username: data.session.user.user_metadata?.username || 'User',
          avatarUrl: data.session.user.user_metadata?.avatar_url || null,
          photoURL: data.session.user.user_metadata?.avatar_url || null,
          wallet: 0,
          role: data.session.user.user_metadata?.role
        });
      }
    };

    getCurrentUser();
  }, []);

  // Fetch support messages
  useEffect(() => {
    if (!user) return;

    const fetchMessages = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('support_messages')
          .select('*')
          .eq('user_id', user.id)
          .order('timestamp', { ascending: true });

        if (error) throw error;

        if (data) {
          setMessages(data.map(msg => ({
            id: msg.id,
            sender: msg.sender,
            message: msg.message,
            timestamp: msg.timestamp,
            read: msg.read
          })));
          
          // Count unread support messages
          const unreadMessages = data.filter(
            msg => msg.sender === 'support' && !msg.read
          ).length;
          setUnreadCount(unreadMessages);
        }
      } catch (error) {
        console.error('Error fetching support messages:', error);
        toast({
          title: 'Error',
          description: 'Could not load support messages',
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchMessages();

    // Subscribe to new messages
    const channel = supabase
      .channel('support_messages')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'support_messages', filter: `user_id=eq.${user.id}` },
        (payload) => {
          const newMessage = payload.new as any;
          setMessages(currentMessages => [...currentMessages, {
            id: newMessage.id,
            sender: newMessage.sender,
            message: newMessage.message,
            timestamp: newMessage.timestamp,
            read: newMessage.read
          }]);
          
          if (newMessage.sender === 'support' && !newMessage.read) {
            setUnreadCount(count => count + 1);
            toast({
              title: 'New message from support',
              description: newMessage.message.substring(0, 50) + (newMessage.message.length > 50 ? '...' : ''),
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // Send a message
  const sendMessage = async (message: string) => {
    if (!user || !message.trim()) return;
    
    try {
      setIsSendingMessage(true);
      
      const newMessage = {
        user_id: user.id,
        sender: 'user' as const,
        message,
        timestamp: new Date().toISOString(),
        read: true
      };
      
      const { error } = await supabase
        .from('support_messages')
        .insert(newMessage);
      
      if (error) throw error;
      
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: 'Failed to send message',
        variant: 'destructive'
      });
    } finally {
      setIsSendingMessage(false);
    }
  };

  // Mark all messages as read
  const markAllAsRead = async () => {
    if (!user) return;
    
    try {
      // Update local state first for immediate UI response
      setMessages(currentMessages => 
        currentMessages.map(msg => ({
          ...msg,
          read: true
        }))
      );
      setUnreadCount(0);
      
      // Update in database
      const { error } = await supabase
        .from('support_messages')
        .update({ read: true })
        .eq('user_id', user.id)
        .eq('sender', 'support')
        .eq('read', false);
      
      if (error) throw error;
      
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  return (
    <SupportContext.Provider
      value={{
        messages,
        isLoading,
        isSendingMessage,
        unreadCount,
        sendMessage,
        markAllAsRead
      }}
    >
      {children}
    </SupportContext.Provider>
  );
};

export const useSupport = () => {
  const context = useContext(SupportContext);
  if (context === undefined) {
    throw new Error('useSupport must be used within a SupportProvider');
  }
  return context;
};
