
import React, { useState } from "react";
import { User } from "@/types/auth";
import { ChatMessage } from "@/types/game";

interface ChatTabProps {
  chatMessages: ChatMessage[];
  user: User | null;
  sendMessage: (message: string) => Promise<void>;
}

const ChatTab: React.FC<ChatTabProps> = ({ chatMessages, user, sendMessage }) => {
  const [chatMessage, setChatMessage] = useState("");

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;

    try {
      await sendMessage(chatMessage);
      setChatMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <div className="space-y-4">
      <div className="glass-card rounded-xl p-4 flex flex-col h-[600px]">
        <div className="flex-1 overflow-y-auto mb-4 space-y-3">
          {chatMessages && chatMessages.length > 0 ? (
            chatMessages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${
                  msg.sender === user?.username ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`rounded-xl px-4 py-2 max-w-[80%] ${
                    msg.sender === user?.username
                      ? "bg-betster-600 text-white"
                      : msg.sender === "System"
                      ? "bg-muted/70 italic text-sm"
                      : "bg-muted/50"
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-medium text-sm">{msg.sender}</span>
                    <span className="text-xs opacity-70">{msg.timestamp}</span>
                  </div>
                  <p>{msg.message}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground italic">
                No messages yet. Start the conversation!
              </p>
            </div>
          )}
        </div>

        <form onSubmit={handleSendMessage} className="flex gap-2">
          <input
            type="text"
            value={chatMessage}
            onChange={(e) => setChatMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 rounded-md bg-background/50 border border-border px-3 py-2"
          />
          <button
            type="submit"
            className="betster-button px-4 py-2"
            disabled={!chatMessage.trim()}
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatTab;
