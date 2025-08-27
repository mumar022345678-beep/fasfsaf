import { MessageService } from "@/lib/services/messageService";
import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const user = await getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { conversationId, content, sender } = await req.json();

    if (!conversationId || !content || !sender) {
      return new Response(JSON.stringify({ error: "Missing fields" }), {
        status: 400,
      });
    }

    const message = await MessageService.createMessage(
      conversationId,
      content,
      sender,
      user.id
    );

    return Response.json(message);
  } catch (error) {
    console.error("POST message error:", error);
    return new Response(JSON.stringify({ error: "Failed to create message" }), {
      status: 500,
    });
  }
}
