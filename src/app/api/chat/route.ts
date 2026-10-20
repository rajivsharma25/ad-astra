import { createTextStreamResponse, streamText, toTextStream } from "ai";
import { NextResponse } from "next/server";
import { createMockReply } from "@/data/chat";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

type ChatInput = { role: "user" | "assistant"; content: string };

export async function POST(request: Request) {
  let input: unknown;
  try { input = await request.json(); } catch { return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 }); }
  const messages = (input as { messages?: unknown })?.messages;
  if (!Array.isArray(messages) || messages.length === 0 || messages.length > 40) return NextResponse.json({ error: "Send between 1 and 40 messages." }, { status: 400 });
  if (!messages.every((message): message is ChatInput => typeof message === "object" && message !== null && ((message as ChatInput).role === "user" || (message as ChatInput).role === "assistant") && typeof (message as ChatInput).content === "string" && (message as ChatInput).content.length <= 20000)) return NextResponse.json({ error: "Each message needs a supported role and text under 20,000 characters." }, { status: 400 });

  const gatewayKey = process.env.AI_GATEWAY_API_KEY;
  const model = process.env.AI_MODEL;
  if (!gatewayKey || !model) {
    const lastUser = [...messages].reverse().find((message) => message.role === "user");
    return new Response(createMockReply(lastUser?.content ?? ""), { headers: { "content-type": "text/plain; charset=utf-8", "x-ad-astra-mode": "mock" } });
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) return NextResponse.json({ error: "Configure Supabase before enabling live AI responses." }, { status: 503 });
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return NextResponse.json({ error: "Sign in to use live AI responses." }, { status: 401 });

  try {
    const requestedModel = (input as { model?: unknown }).model;
    const requestedStyle = (input as { responseStyle?: unknown }).responseStyle;
    const requestedTemperature = (input as { temperature?: unknown }).temperature;
    const requestedStreaming = (input as { streaming?: unknown }).streaming;
    const selectedModel = requestedModel === "Ad Astra thoughtful" ? process.env.AI_MODEL_THOUGHTFUL ?? model : model;
    const temperature = typeof requestedTemperature === "number" && requestedTemperature >= 0 && requestedTemperature <= 2 ? requestedTemperature : 0.7;
    const streaming = typeof requestedStreaming === "boolean" ? requestedStreaming : true;
    const styleInstruction = requestedStyle === "concise" ? "Keep responses brief and focused." : requestedStyle === "detailed" ? "Give thorough explanations with useful context and clear steps." : "Use a balanced level of detail.";
    const result = streamText({ model: selectedModel, temperature, system: `You are Ad Astra, a thoughtful and practical workspace assistant. Be clear and useful. Use Markdown when it improves readability. ${styleInstruction}`, messages });
    if (!streaming) return new Response(await result.text, { headers: { "content-type": "text/plain; charset=utf-8", "x-ad-astra-mode": "live" } });
    return createTextStreamResponse({ stream: toTextStream({ stream: result.stream }) });
  } catch { return NextResponse.json({ error: "The AI service could not start this response." }, { status: 502 }); }
}
