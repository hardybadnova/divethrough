
import { supabase } from '@/lib/supabase/client';
import { ChatMessage } from '@/types/game';

// Send a message to the pool chat
export const sendChatMessage = async (poolId: string, message: ChatMessage): Promise<void> => {
  console.log(`Sending message to pool ${poolId}:`, message);
  
  try {
    // We'll store chat messages in a separate chat_messages table
    // For now, we'll use the Supabase Realtime channel to broadcast the message
    await supabase
      .channel(`chat:${poolId}`)
      .send({
        type: 'broadcast',
        event: 'chat_message',
        payload: message
      });
      
    console.log("Message sent successfully");
  } catch (error) {
    console.error("Error sending chat message:", error);
    throw error;
  }
};

// Subscribe to chat messages for a pool
export const subscribeToChatMessages = (poolId: string, callback: (messages: ChatMessage[]) => void): (() => void) => {
  console.log(`Subscribing to chat messages for pool ${poolId}`);
  
  // Local storage of messages
  const messages: ChatMessage[] = [];
  
  // Create a subscription
  const channel = supabase
    .channel(`chat:${poolId}`)
    .on('broadcast', { event: 'chat_message' }, (payload) => {
      console.log("Received chat message:", payload);
      messages.push(payload.payload as ChatMessage);
      callback([...messages]);
    })
    .subscribe();
  
  // Return unsubscribe function
  return () => {
    console.log(`Unsubscribing from chat for pool ${poolId}`);
    supabase.removeChannel(channel);
  };
};
