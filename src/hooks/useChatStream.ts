"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { v4 as uuidv4 } from "uuid";
import { useConversationMessages } from "./useChat";
import { useRouter } from "next/navigation";
import {
  ChatMessage,
  Conversation,
  StreamEventData,
  StreamEventType,
} from "@/types/types";

interface UseChatStreamResult {
  messages: ChatMessage[];
  isAITyping: boolean;
  sendMessage: (
    content: string,
    currentConversationId?: string
  ) => Promise<void>;
  isLoadingMessages: boolean;
}

export default function useChatStream(
  initialConversationId: string | null
): UseChatStreamResult {
  const queryClient = useQueryClient();
  const router = useRouter();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isAITyping, setIsAITyping] = useState(false);
  const currentEventSourceRef = useRef<EventSource | null>(null);

  const currentConvIdRef = useRef<string | null>(initialConversationId);
  useEffect(() => {
    currentConvIdRef.current = initialConversationId;
  }, [initialConversationId]);

  const justNavigatedToNewChatRef = useRef(false);

  const { data: fetchedMessages, isLoading: isLoadingMessages } =
    useConversationMessages(initialConversationId);

  // Clear messages on navigation unless it's a new chat
  useEffect(() => {
    if (!justNavigatedToNewChatRef.current) {
      setMessages([]);
    }
  }, [initialConversationId]);

  // Sync fetched messages into local state
  useEffect(() => {
    if (fetchedMessages && !justNavigatedToNewChatRef.current) {
      setMessages(fetchedMessages);
    }
  }, [fetchedMessages]);

  const sendMessage = useCallback(
    async (content: string, currentConversationId?: string) => {
      setIsAITyping(true);

      const tempUserMessageId = uuidv4();
      const tempUserMessage: ChatMessage = {
        id: tempUserMessageId,
        conversationId: currentConversationId || "temp-new-conversation",
        content,
        sender: "user",
        created_at: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, tempUserMessage]);

      if (currentEventSourceRef.current) {
        currentEventSourceRef.current.close();
        currentEventSourceRef.current = null;
      }

      let finalConversationId: string | null = null;

      try {
        const response = await fetch("/api/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            content,
            conversationId: currentConversationId,
            sender: "user"
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to initiate chat stream");
        }

        const reader = response.body?.getReader();
        if (!reader) throw new Error("Failed to get readable stream");

        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });

          let eventEndIndex;
          while ((eventEndIndex = buffer.indexOf("\n\n")) !== -1) {
            const eventString = buffer.substring(0, eventEndIndex);
            buffer = buffer.substring(eventEndIndex + 2);

            const eventLines = eventString.split("\n");
            let eventType: StreamEventType | undefined;
            let eventData: StreamEventData | undefined;

            for (const line of eventLines) {
              if (line.startsWith("event: ")) {
                eventType = line.substring("event: ".length) as StreamEventType;
              } else if (line.startsWith("data: ")) {
                try {
                  eventData = JSON.parse(line.substring("data: ".length));
                } catch (e) {
                  console.error("Failed to parse event data:", e);
                }
              }
            }

            if (eventType && eventData) {
              if (eventType === "initial" && eventData.userMessage) {
                setMessages((prev) => {
                  const filtered = prev.filter(
                    (msg) => msg.id !== tempUserMessageId
                  );
                  return [...filtered, eventData.userMessage!];
                });
                finalConversationId = eventData.conversationId || null;

                if (!currentConversationId && finalConversationId) {
                  queryClient.setQueryData<Conversation[]>(
                    ["conversations"],
                    (oldConversations) => {
                      const newConversation: Conversation = {
                        id: finalConversationId!,
                        user_id: "",
                        title: "New Chat",
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString(),
                        isTitleGenerating: true,
                      };
                      return oldConversations
                        ? [newConversation, ...oldConversations]
                        : [newConversation];
                    }
                  );
                }
                queryClient.invalidateQueries({ queryKey: ["conversations"] });

                if (
                  finalConversationId &&
                  currentConvIdRef.current !== finalConversationId
                ) {
                  justNavigatedToNewChatRef.current = true;
                  router.replace(`/chat/${finalConversationId}`); // ✅ Next.js navigation
                }
              } else if (eventType === "message" && eventData.chunk) {
                setIsAITyping(false);
                const currentAssistantMessageId = eventData.id;
                if (!currentAssistantMessageId) {
                  console.warn(
                    "Received message chunk without an ID. Skipping update."
                  );
                  continue;
                }
                setMessages((prev) => {
                  let found = false;
                  const updated = prev.map((msg) => {
                    if (
                      msg.id === currentAssistantMessageId &&
                      msg.sender === "ai"
                    ) {
                      found = true;
                      return {
                        ...msg,
                        content: msg.content + eventData.chunk!,
                      };
                    }
                    return msg;
                  });
                  if (!found) {
                    const newAssistantMessage: ChatMessage = {
                      id: currentAssistantMessageId,
                      conversationId:
                        eventData.conversationId ||
                        finalConversationId ||
                        currentConvIdRef.current ||
                        "unknown",
                      content: eventData.chunk!,
                      sender: "ai",
                      created_at: new Date().toISOString(),
                    };
                    return [...updated, newAssistantMessage];
                  }
                  return updated;
                });
              } else if (eventType === "error" && eventData.content) {
                console.error("Stream error:", eventData.content);
                setIsAITyping(false);
                setMessages((prev) => {
                  const filtered = prev.filter(
                    (msg) => msg.id !== tempUserMessageId
                  );
                  return [
                    ...filtered,
                    {
                      id: uuidv4(),
                      conversationId:
                        eventData.conversationId ||
                        finalConversationId ||
                        currentConvIdRef.current ||
                        "unknown",
                      content: eventData.content!,
                      sender: "ai",
                      created_at: new Date().toISOString(),
                    },
                  ];
                });
                queryClient.invalidateQueries({ queryKey: ["conversations"] });
              } else if (eventType === "done") {
                // Stream finished
              } else if (
                eventType === "titleUpdate" &&
                eventData.conversationId &&
                eventData.newTitle
              ) {
                queryClient.setQueryData<Conversation[]>(
                  ["conversations"],
                  (oldConversations) => {
                    if (!oldConversations) return [];
                    return oldConversations.map((conv) =>
                      conv.id === eventData.conversationId
                        ? {
                            ...conv,
                            title: eventData.newTitle!,
                            isTitleGenerating: false,
                          }
                        : conv
                    );
                  }
                );
              }
            }
          }
        }
      } catch (error) {
        console.error("Error during streaming:", error);
        setIsAITyping(false);
        setMessages((prev) => {
          const filtered = prev.filter((msg) => msg.id !== tempUserMessageId);
          return [
            ...filtered,
            {
              id: uuidv4(),
              conversationId:
                currentConversationId || currentConvIdRef.current || "unknown",
              content:
                "I'm sorry, an unexpected error occurred. Please try again.",
              sender: "ai",
              created_at: new Date().toISOString(),
            },
          ];
        });
        queryClient.invalidateQueries({ queryKey: ["conversations"] });
      } finally {
        setIsAITyping(false);

        if (justNavigatedToNewChatRef.current) {
          justNavigatedToNewChatRef.current = false;
        }

        if (currentEventSourceRef.current) {
          currentEventSourceRef.current.close();
          currentEventSourceRef.current = null;
        }

        if (finalConversationId) {
          queryClient.invalidateQueries({
            queryKey: ["messages", finalConversationId],
          });
        } else if (currentConversationId) {
          queryClient.invalidateQueries({
            queryKey: ["messages", currentConversationId],
          });
        }
        queryClient.invalidateQueries({
          queryKey: ["messages", currentConvIdRef.current],
        });
      }
    },
    [queryClient, router]
  );

  return { messages, isAITyping, sendMessage, isLoadingMessages };
}
