import { ChatWorkspace } from "@/components/chat/chat-workspace";

export default async function ChatPage({ searchParams }: { searchParams: Promise<{ new?: string; prompt?: string }> }) {
  const { new: startNew, prompt } = await searchParams;
  return <ChatWorkspace startNew={startNew === "1"} initialPrompt={prompt} />;
}
