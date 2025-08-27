import { ChatMessage } from "@/types/types";
import { prisma } from "../prisma";

export class MessageService {
  static async createMessage(
    conversationId: string,
    content: string,
    sender: "user" | "ai",
    userId: string
  ): Promise<ChatMessage> {
    const newMessage = await prisma.message.create({
      data: {
        userId: userId,
        conversationId: conversationId,
        content,
        sender,
      },
    });

    return {
      id: newMessage.id,
      conversationId: newMessage.conversationId,
      content: newMessage.content,
      sender: newMessage.sender as "user" | "ai",
      created_at: newMessage.created_at.toISOString(),
    } as ChatMessage;
  }

  static async getConversationMessages(
    conversationId: string,
    userId: string,
  ): Promise<ChatMessage[]> {
    const messages = await prisma.message.findMany({
      where: { conversationId: conversationId, userId: userId },
      orderBy: { created_at: "asc" },
    });

    return messages.map((msg) => ({
      id: msg.id,
      conversationId: msg.conversationId,
      content: msg.content,
      sender: msg.sender as "user" | "ai",
      created_at: msg.created_at.toISOString(),
    })) as ChatMessage[];
  }
}
