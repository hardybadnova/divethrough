
import { supabase } from '@/lib/supabase/client';

// Send a chat message in a game
export const sendChatMessage = async (poolId: string, message: { sender: string; message: string; timestamp: string }): Promise<void> => {
  const { error } = await supabase
    .from('game_chat')
    .insert([{
      pool_id: poolId,
      sender: message.sender,
      message: message.message,
      timestamp: message.timestamp
    }]);
    
  if (error) throw error;
};

// Listen for chat messages in a game
export const subscribeToChatMessages = (poolId: string, callback: (messages: any[]) => void): (() => void) => {
  // Create a subscription using Supabase realtime
  const subscription = supabase
    .channel(`chat:${poolId}`)
    .on('postgres_changes', 
      { event: 'INSERT', schema: 'public', table: 'game_chat', filter: `pool_id=eq.${poolId}` },
      () => {
        // Fetch all messages for this pool
        fetchChatMessages(poolId).then(messages => {
          callback(messages);
        });
      }
    )
    .subscribe();
  
  // Initial fetch of messages
  fetchChatMessages(poolId).then(messages => {
    callback(messages);
  });
  
  // Return unsubscribe function
  return () => {
    supabase.removeChannel(subscription);
  };
};

// Helper function to fetch chat messages for a pool
async function fetchChatMessages(poolId: string): Promise<any[]> {
  const { data, error } = await supabase
    .from('game_chat')
    .select('*')
    .eq('pool_id', poolId)
    .order('created_at', { ascending: true });
    
  if (error || !data) return [];
  return data;
}
