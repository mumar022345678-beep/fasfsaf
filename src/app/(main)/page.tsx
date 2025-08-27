"use client";

import ChatInterface from "@/components/chat/ChatInterface";

export default function Home() {
  return (
    <main className="flex full w-full flex-col items-center justify-center">
      <ChatInterface conversationId={undefined} />
    </main>
  );
}
