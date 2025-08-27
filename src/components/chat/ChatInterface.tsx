import React, { useEffect, useRef } from "react";
import MessageBubble from "./MessageBubble";
import MessageInput from "./MessageInput";
import TypingIndicator from "./TypingIndicator";
import WelcomeScreen from "./WelcomeScreen";
import useChatStream from "@/hooks/useChatStream";

interface ChatInterfaceProps {
  conversationId?: string | null;
}

export default function ChatInterface({ conversationId }: ChatInterfaceProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Pass the navigate function to useChatStream
  const { messages, isAITyping, sendMessage, isLoadingMessages } =
    useChatStream(conversationId || null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    // Scroll to bottom when messages change or AI is typing
    scrollToBottom();
  }, [messages, isAITyping]);

  const handleSendMessage = async (content: string) => {
    try {
      await sendMessage(content, conversationId ?? undefined);
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  // Show welcome screen for new conversations
  if (!conversationId && messages.length === 0 && !isLoadingMessages) {
    return (
      <div className="flex flex-col h-full bg-gray-50">
        <WelcomeScreen />
        <MessageInput onSendMessage={handleSendMessage} disabled={isAITyping} />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full bg-gray-50">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {isLoadingMessages && messages.length === 0 ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto">
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
            {isAITyping && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <MessageInput onSendMessage={handleSendMessage} disabled={isAITyping} />
    </div>
  );
}
