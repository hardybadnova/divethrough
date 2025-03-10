
import { supabase } from '@/lib/supabase/client';
import { SupportMessage } from '@/contexts/SupportContext';

// Send a message to support
export const sendSupportMessage = async (userId: string, message: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('support_messages')
      .insert({
        user_id: userId,
        sender: 'user',
        message,
        timestamp: new Date().toISOString(),
        read: true
      });
      
    if (error) {
      console.error("Error sending support message:", error);
      throw error;
    }
  } catch (error) {
    console.error("Error in sendSupportMessage:", error);
    throw error;
  }
};

// Get all support messages for a user
export const getSupportMessages = async (userId: string): Promise<SupportMessage[]> => {
  try {
    const { data, error } = await supabase
      .from('support_messages')
      .select('*')
      .eq('user_id', userId)
      .order('timestamp', { ascending: true });
      
    if (error) {
      console.error("Error fetching support messages:", error);
      throw error;
    }
    
    return data.map(msg => ({
      id: msg.id,
      sender: msg.sender,
      message: msg.message,
      timestamp: msg.timestamp,
      read: msg.read
    }));
  } catch (error) {
    console.error("Error in getSupportMessages:", error);
    throw error;
  }
};

// Mark support messages as read
export const markMessagesAsRead = async (userId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('support_messages')
      .update({ read: true })
      .eq('user_id', userId)
      .eq('sender', 'support')
      .eq('read', false);
      
    if (error) {
      console.error("Error marking messages as read:", error);
      throw error;
    }
  } catch (error) {
    console.error("Error in markMessagesAsRead:", error);
    throw error;
  }
};

// Subscribe to new support messages
export const subscribeToSupportMessages = (
  userId: string, 
  callback: (message: SupportMessage) => void
): () => void => {
  const channel = supabase
    .channel(`support_${userId}`)
    .on('postgres_changes', 
      { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'support_messages', 
        filter: `user_id=eq.${userId}` 
      },
      (payload) => {
        const message = payload.new as any;
        callback({
          id: message.id,
          sender: message.sender,
          message: message.message,
          timestamp: message.timestamp,
          read: message.read
        });
      }
    )
    .subscribe();
    
  return () => {
    supabase.removeChannel(channel);
  };
};
