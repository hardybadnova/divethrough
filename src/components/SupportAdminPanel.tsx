
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Send, User } from 'lucide-react';
import { format } from 'date-fns';

interface UserType {
  id: string;
  username: string;
}

interface SupportMessage {
  id: string;
  user_id: string;
  sender: 'user' | 'support';
  message: string;
  timestamp: string;
  read: boolean;
}

const SupportAdminPanel = () => {
  const [users, setUsers] = useState<UserType[]>([]);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);

  // Fetch users with support messages
  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('support_messages')
          .select('user_id, user_profiles(id, username)')
          .order('timestamp', { ascending: false });
        
        if (error) throw error;
        
        if (data) {
          // Extract unique users with proper type handling
          const uniqueUserIds = Array.from(new Set(data.map(item => item.user_id)));
          
          const uniqueUsers: UserType[] = uniqueUserIds.map(userId => {
            const userRecord = data.find(item => item.user_id === userId);
            return {
              id: userId,
              username: userRecord?.user_profiles?.username || 'Unknown User'
            };
          });
          
          setUsers(uniqueUsers);
        }
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUsers();
  }, []);

  // Fetch messages for selected user
  useEffect(() => {
    if (!selectedUser) return;
    
    const fetchMessages = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('support_messages')
          .select('*')
          .eq('user_id', selectedUser)
          .order('timestamp', { ascending: true });
        
        if (error) throw error;
        
        if (data) {
          setMessages(data);
        }
      } catch (error) {
        console.error('Error fetching messages:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchMessages();
    
    // Subscribe to new messages
    const channel = supabase
      .channel(`support_messages_${selectedUser}`)
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'support_messages', filter: `user_id=eq.${selectedUser}` },
        (payload) => {
          const newMessage = payload.new as SupportMessage;
          setMessages(currentMessages => [...currentMessages, newMessage]);
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedUser]);

  // Send support message
  const sendSupportMessage = async () => {
    if (!selectedUser || !newMessage.trim()) return;
    
    setIsSending(true);
    try {
      const { error } = await supabase
        .from('support_messages')
        .insert({
          user_id: selectedUser,
          sender: 'support',
          message: newMessage,
          timestamp: new Date().toISOString(),
          read: false
        });
      
      if (error) throw error;
      
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="bg-betster-800/30 p-4 rounded-lg border border-betster-700/40 max-w-full">
      <h2 className="text-xl font-semibold mb-4 text-white">Support Tickets</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[600px]">
        <div className="md:col-span-1 bg-betster-900/60 rounded-lg overflow-hidden border border-betster-700/40">
          <div className="bg-betster-800/80 p-3 font-medium text-betster-100 border-b border-betster-700/40 flex items-center gap-2">
            <User className="h-4 w-4" /> Users
          </div>
          <div className="p-2 h-[550px] overflow-y-auto">
            {isLoading && !users.length ? (
              <div className="flex justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin text-betster-300" />
              </div>
            ) : users.length > 0 ? (
              users.map(user => (
                <div 
                  key={user.id}
                  className={`p-2 cursor-pointer rounded transition-colors ${
                    selectedUser === user.id 
                      ? 'bg-betster-600 text-white' 
                      : 'hover:bg-betster-700/40 text-betster-200'
                  }`}
                  onClick={() => setSelectedUser(user.id)}
                >
                  {user.username}
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-betster-400">
                No support requests
              </div>
            )}
          </div>
        </div>
        
        <div className="md:col-span-2 bg-betster-900/60 rounded-lg overflow-hidden border border-betster-700/40">
          {selectedUser ? (
            <>
              <div className="bg-betster-800/80 p-3 font-medium text-betster-100 border-b border-betster-700/40">
                Chat with {users.find(u => u.id === selectedUser)?.username}
              </div>
              
              <div className="p-4 h-[500px] overflow-y-auto bg-gradient-to-b from-betster-900/30 to-betster-900/10">
                {isLoading ? (
                  <div className="flex justify-center py-4">
                    <Loader2 className="h-6 w-6 animate-spin text-betster-300" />
                  </div>
                ) : messages.length > 0 ? (
                  messages.map(message => (
                    <div 
                      key={message.id}
                      className={`mb-3 ${message.sender === 'support' ? 'text-right' : 'text-left'}`}
                    >
                      <div className={`inline-block rounded-lg px-3 py-2 max-w-[80%] ${
                        message.sender === 'support' 
                          ? 'bg-betster-600 text-white rounded-br-none' 
                          : 'bg-betster-800/40 text-betster-100 rounded-bl-none border border-betster-700/40'
                      }`}>
                        {message.message}
                        <div className="text-xs mt-1 opacity-70">
                          {format(new Date(message.timestamp), 'MMM d, h:mm a')}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex items-center justify-center h-full text-betster-400">
                    No messages yet
                  </div>
                )}
              </div>
              
              <div className="p-2 border-t border-betster-700/40 flex gap-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 bg-betster-900/50 border-betster-700/50 text-white"
                />
                <Button 
                  onClick={sendSupportMessage}
                  disabled={isSending || !newMessage.trim()}
                  className="bg-betster-600 hover:bg-betster-500"
                >
                  {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-betster-400">
              Select a user to view chat
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SupportAdminPanel;
