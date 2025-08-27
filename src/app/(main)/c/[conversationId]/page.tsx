import ChatInterface from "@/components/chat/ChatInterface";
import { useParams } from "next/navigation";

export default function ChatPage() {
  const { conversationId } = useParams();

  return (
    <main className="flex h-full w-full flex-col items-center justify-center">
      <ChatInterface conversationId={conversationId as string} />
    </main>
  );
}
