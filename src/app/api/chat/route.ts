import { AIService } from "@/lib/services/aiService";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { prompt, history } = await req.json();

    const stream = AIService.generateResponse(prompt, history);

    const encoder = new TextEncoder();

    const streamResponse = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            controller.enqueue(encoder.encode(chunk));
          }
          controller.close();
        } catch (err) {
          controller.error(err);
        }
      },
    });

    return new Response(streamResponse, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
      },
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return new Response(
      JSON.stringify({ error: "Chat failed" }),
      { status: 500 }
    );
  }
}
