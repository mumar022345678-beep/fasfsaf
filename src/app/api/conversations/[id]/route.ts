import { getUser } from "@/lib/auth";
import { ConversationService } from "@/lib/services/conversationService";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const conversation = await ConversationService.getConversation(
      params.id,
      userId
    );
    if (!conversation) {
      return new Response(JSON.stringify({ error: "Conversation not found" }), {
        status: 404,
      });
    }

    return Response.json(conversation);
  } catch (error) {
    console.error("GET conversation error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch conversation" }),
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { title } = await req.json();
    await ConversationService.updateConversationTitle(params.id, title);
    return Response.json({ success: true });
  } catch (error) {
    console.error("PATCH conversation error:", error);
    return new Response(JSON.stringify({ error: "Failed to update title" }), {
      status: 500,
    });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await ConversationService.deleteConversation(params.id);
    return Response.json({ success: true });
  } catch (error) {
    console.error("DELETE conversation error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to delete conversation" }),
      { status: 500 }
    );
  }
}
