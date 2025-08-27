import { prisma } from '../config/database'; // Changed from supabase to prisma
import { Conversation } from '../types/types'; // Import Conversation type

export class ConversationService {
  static async createConversation(userId: string, title: string): Promise<Conversation> {
    const newConversation = await prisma.conversation.create({
      data: {
        user_id: userId,
        title: title || 'New Conversation'
      }
    });

    return {
      id: newConversation.id,
      user_id: newConversation.user_id,
      title: newConversation.title,
      created_at: newConversation.created_at.toISOString(), // Convert Date to ISO string
      updated_at: newConversation.updated_at.toISOString() // Convert Date to ISO string
    } as Conversation; // Cast to your Conversation type
  }

  static async getUserConversations(userId: string): Promise<Conversation[]> {
    const conversations = await prisma.conversation.findMany({
      where: { user_id: userId },
      orderBy: { updated_at: 'desc' }
    });

    return conversations.map(conv => ({
      id: conv.id,
      user_id: conv.user_id,
      title: conv.title,
      created_at: conv.created_at.toISOString(), // Convert Date to ISO string
      updated_at: conv.updated_at.toISOString() // Convert Date to ISO string
    })) as Conversation[]; // Cast to your Conversation[] type
  }

  static async getConversation(conversationId: string, userId: string): Promise<Conversation | null> {
    const conversation = await prisma.conversation.findUnique({
      where: {
        id: conversationId,
        user_id: userId
      }
    });

    if (!conversation) {
      return null;
    }

    return {
      id: conversation.id,
      user_id: conversation.user_id,
      title: conversation.title,
      created_at: conversation.created_at.toISOString(), // Convert Date to ISO string
      updated_at: conversation.updated_at.toISOString() // Convert Date to ISO string
    } as Conversation; // Cast to your Conversation type
  }

  static async updateConversationTitle(conversationId: string, title: string): Promise<void> {
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { title }
    });
  }

  static async deleteConversation(conversationId: string): Promise<void> {
    await prisma.conversation.delete({
      where: { id: conversationId }
    });
  }
}
