import axios from '@/lib/axios';
import { Conversation, ChatMessage } from '@/types/types';
import { useQuery } from '@tanstack/react-query';

export const useConversations = () => {
  return useQuery({
    queryKey: ['conversations'],
    queryFn: async () => {
      const response = await axios.get('/chat/conversations');
      return response.data.conversations as Conversation[];
    },
  });
};

export const useConversationMessages = (conversationId: string | null) => {
  return useQuery({
    queryKey: ['messages', conversationId],
    queryFn: async () => {
      if (!conversationId) return [];
      const response = await axios.get(`/chat/conversations/messages/${conversationId}`);
      return response.data.messages as ChatMessage[];
    },
    enabled: !!conversationId,
  });
};