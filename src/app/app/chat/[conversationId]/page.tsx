import { ChatWorkspace } from "@/components/chat/chat-workspace";

export default async function ConversationPage({ params, searchParams }: { params: Promise<{ conversationId: string }>; searchParams: Promise<{ prompt?: string }> }) {
  const [{ conversationId }, { prompt }] = await Promise.all([params, searchParams]);
  return <ChatWorkspace initialConversationId={conversationId} initialPrompt={prompt} />;
}
