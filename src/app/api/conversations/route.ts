import { getUser } from "@/lib/auth";
import { ConversationService } from "@/lib/services/conversationService";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const user = await getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const userId = user.id;

    if (!userId) {
      return new Response(JSON.stringify({ error: "Missing userId" }), {
        status: 400,
      });
    }

    const conversations = await ConversationService.getUserConversations(
      userId
    );
    return Response.json(conversations);
  } catch (error) {
    console.error("GET conversations error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch conversations" }),
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const userId = user.id;

    if (!userId) {
      return new Response(JSON.stringify({ error: "Missing userId" }), {
        status: 400,
      });
    }

    const { title } = await req.json();

    const conversation = await ConversationService.createConversation(
      userId,
      title
    );
    return Response.json(conversation);
  } catch (error) {
    console.error("POST conversation error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to create conversation" }),
      { status: 500 }
    );
  }
}
