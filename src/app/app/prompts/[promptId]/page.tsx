import { notFound } from "next/navigation";
import { PromptDetail } from "@/components/prompts/prompt-detail";
import { initialPrompts } from "@/data/workspace";

export default async function PromptDetailPage({ params }: { params: Promise<{ promptId: string }> }) {
  const { promptId } = await params;
  if (!initialPrompts.some((prompt) => prompt.id === promptId) && !promptId.startsWith("prompt-")) notFound();
  return <PromptDetail promptId={promptId} />;
}
