
import { supabase } from '@/lib/supabase/client';
import { ChatMessage } from '@/types/game';

// Send a message to the pool chat
export const sendChatMessage = async (poolId: string, message: ChatMessage): Promise<void> => {
  console.log(`Sending message to pool ${poolId}:`, message);
  
  try {
    // Store the message in the chat_messages table
    const { error } = await supabase
      .from('chat_messages')
      .insert({
        pool_id: poolId,
        sender: message.sender,
        message: message.message,
        timestamp: message.timestamp
      });
      
    if (error) {
      console.error("Error storing chat message:", error);
      throw error;
    }
      
    console.log("Message sent successfully");
  } catch (error) {
    console.error("Error sending chat message:", error);
    throw error;
  }
};

// Subscribe to chat messages for a pool
export const subscribeToChatMessages = (poolId: string, callback: (messages: ChatMessage[]) => void): (() => void) => {
  console.log(`Subscribing to chat messages for pool ${poolId}`);
  
  // Initial fetch of existing messages
  const fetchExistingMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('pool_id', poolId)
        .order('created_at', { ascending: true });
        
      if (error) {
        console.error("Error fetching existing chat messages:", error);
        return;
      }
      
      if (data && data.length > 0) {
        const messages: ChatMessage[] = data.map(msg => ({
          sender: msg.sender,
          message: msg.message,
          timestamp: msg.timestamp
        }));
        
        callback(messages);
      }
    } catch (error) {
      console.error("Error in fetchExistingMessages:", error);
    }
  };
  
  // Fetch existing messages immediately
  fetchExistingMessages();
  
  // Subscribe to new messages
  const channel = supabase
    .channel(`chat:${poolId}`)
    .on('postgres_changes', 
      { event: 'INSERT', schema: 'public', table: 'chat_messages', filter: `pool_id=eq.${poolId}` },
      (payload) => {
        console.log("Received new chat message:", payload);
        
        // Get all messages again to ensure correct order
        fetchExistingMessages();
      }
    )
    .subscribe();
  
  // Return unsubscribe function
  return () => {
    console.log(`Unsubscribing from chat for pool ${poolId}`);
    supabase.removeChannel(channel);
  };
};
