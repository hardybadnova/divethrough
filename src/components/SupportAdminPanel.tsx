
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Send } from 'lucide-react';

interface User {
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
  const [users, setUsers] = useState<User[]>([]);
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
          
          const uniqueUsers: User[] = uniqueUserIds.map(userId => {
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

  // This is just a placeholder - in a real app, this would be part of an admin dashboard
  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Support Admin Panel</h1>
      
      <div className="grid grid-cols-3 gap-4 h-[600px]">
        <div className="col-span-1 border rounded-lg overflow-hidden">
          <div className="bg-gray-100 p-3 font-medium">Users</div>
          <div className="p-2 h-[550px] overflow-y-auto">
            {isLoading && !users.length ? (
              <div className="flex justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : (
              users.map(user => (
                <div 
                  key={user.id}
                  className={`p-2 cursor-pointer rounded ${selectedUser === user.id ? 'bg-blue-100' : 'hover:bg-gray-100'}`}
                  onClick={() => setSelectedUser(user.id)}
                >
                  {user.username}
                </div>
              ))
            )}
          </div>
        </div>
        
        <div className="col-span-2 border rounded-lg overflow-hidden">
          {selectedUser ? (
            <>
              <div className="bg-gray-100 p-3 font-medium">
                Chat with {users.find(u => u.id === selectedUser)?.username}
              </div>
              
              <div className="p-4 h-[500px] overflow-y-auto">
                {isLoading ? (
                  <div className="flex justify-center py-4">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : (
                  messages.map(message => (
                    <div 
                      key={message.id}
                      className={`mb-3 ${message.sender === 'support' ? 'text-right' : 'text-left'}`}
                    >
                      <div className={`inline-block rounded-lg px-3 py-2 max-w-[80%] ${
                        message.sender === 'support' 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-gray-200'
                      }`}>
                        {message.message}
                        <div className="text-xs mt-1 opacity-70">
                          {new Date(message.timestamp).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              
              <div className="p-2 border-t flex gap-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1"
                />
                <Button 
                  onClick={sendSupportMessage}
                  disabled={isSending || !newMessage.trim()}
                >
                  {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              Select a user to view chat
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SupportAdminPanel;
