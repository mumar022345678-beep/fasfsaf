import { getUser } from "@/lib/auth";
import { MessageService } from "@/lib/services/messageService";
import { NextResponse } from "next/server";

export async function GET({ params }: { params: { conversationId: string } }) {
  try {
    const user = await getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const messages = await MessageService.getConversationMessages(
      params.conversationId,
      user.id
    );
    return Response.json(messages);
  } catch (error) {
    console.error("GET messages error:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch messages" }), {
      status: 500,
    });
  }
}
