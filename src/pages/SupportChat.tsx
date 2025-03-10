
import React, { useState, useRef, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import { useSupport, SupportMessage } from '@/contexts/SupportContext';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import { Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const SupportChat = () => {
  const { messages, isLoading, isSendingMessage, sendMessage, markAllAsRead } = useSupport();
  const { user } = useAuth();
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Mark messages as read when chat is opened
  useEffect(() => {
    markAllAsRead();
  }, [markAllAsRead]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    
    await sendMessage(newMessage);
    setNewMessage('');
  };

  const renderMessage = (message: SupportMessage) => {
    const isUser = message.sender === 'user';
    
    return (
      <div 
        key={message.id} 
        className={cn(
          "flex mb-4", 
          isUser ? "justify-end" : "justify-start"
        )}
      >
        <div 
          className={cn(
            "rounded-lg px-4 py-2 max-w-[80%]",
            isUser 
              ? "bg-betster-600 text-white rounded-br-none" 
              : "bg-betster-800/40 text-betster-100 rounded-bl-none border border-betster-700/40"
          )}
        >
          <div className="text-sm">{message.message}</div>
          <div className="text-xs mt-1 opacity-70">
            {format(new Date(message.timestamp), 'MMM d, h:mm a')}
          </div>
        </div>
      </div>
    );
  };

  return (
    <AppLayout>
      <div className="flex flex-col h-[calc(100vh-8rem)]">
        <div className="py-3 px-4 border-b border-betster-700/40 flex items-center">
          <h1 className="text-xl font-semibold text-white">Support Chat</h1>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 bg-gradient-to-b from-betster-900/30 to-betster-900/10">
          {isLoading ? (
            <div className="h-full flex items-center justify-center">
              <Loader2 className="h-8 w-8 text-betster-400 animate-spin" />
            </div>
          ) : messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-betster-300">
              <p>No messages yet</p>
              <p className="text-sm mt-2">Send a message to start chatting with our support team</p>
            </div>
          ) : (
            <>
              {messages.map(renderMessage)}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>
        
        <form 
          onSubmit={handleSendMessage}
          className="p-3 border-t border-betster-700/40 flex items-center gap-2"
        >
          <Input
            type="text"
            placeholder="Type your message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="flex-1 bg-betster-900/50 border-betster-700/50 text-white"
            disabled={isSendingMessage}
          />
          <Button 
            type="submit" 
            size="icon"
            disabled={isSendingMessage || !newMessage.trim()}
            className="bg-betster-600 hover:bg-betster-500"
          >
            {isSendingMessage ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>
      </div>
    </AppLayout>
  );
};

export default SupportChat;
