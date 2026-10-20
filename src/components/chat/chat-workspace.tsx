"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from "react";
import { ArrowDown, ArrowUp, Check, Copy, MessageSquarePlus, Mic, Paperclip, Pencil, Plus, Sparkles, Square, Star, X } from "lucide-react";
import { initialConversations, type ChatConversation, type ChatMessage } from "@/data/chat";
import { Dropdown } from "@/components/ui/dropdown";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

const STORAGE_KEY = "ad-astra-chat-conversations-v1";
const buttonStyle = "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-app-muted transition-colors hover:bg-app-accent-soft hover:text-app-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-app-accent disabled:pointer-events-none disabled:opacity-40";

function readSavedConversations(): ChatConversation[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return initialConversations;
    const parsed: unknown = JSON.parse(saved);
    if (!Array.isArray(parsed)) return initialConversations;
    return parsed as ChatConversation[];
  } catch {
    return initialConversations;
  }
}

function MessageContent({ content }: { content: string }) {
  const lines = content.split("\n");
  const blocks: { kind: "code" | "text"; value: string }[] = [];
  let code = false;
  let buffer: string[] = [];
  for (const line of lines) {
    if (line.startsWith("```")) {
      if (code) blocks.push({ kind: "code", value: buffer.join("\n") });
      else if (buffer.length) blocks.push({ kind: "text", value: buffer.join("\n") });
      code = !code;
      buffer = [];
    } else buffer.push(line);
  }
  if (buffer.length) blocks.push({ kind: code ? "code" : "text", value: buffer.join("\n") });

  return <div className="space-y-3 text-[15px] leading-7 text-app-text">
    {blocks.map((block, index) => block.kind === "code" ? <CodeBlock key={index} value={block.value} /> : <TextBlock key={index} value={block.value} />)}
  </div>;
}

function TextBlock({ value }: { value: string }) {
  return <div className="space-y-2.5">
    {value.split(/\n\s*\n/).filter(Boolean).map((paragraph, index) => {
      const trimmed = paragraph.trim();
      if (trimmed.startsWith("### ")) return <h3 key={index} className="m-0 pt-1 font-display text-base font-semibold leading-6">{trimmed.slice(4)}</h3>;
      const listLines = trimmed.split("\n").filter((line) => /^\s*(?:[-*]|\d+\.)\s/.test(line));
      if (listLines.length === trimmed.split("\n").length && listLines.length > 0) {
        const ordered = /^\s*\d+\./.test(listLines[0]);
        const List = ordered ? "ol" : "ul";
        return <List key={index} className={`my-0 space-y-1.5 pl-6 ${ordered ? "list-decimal" : "list-disc"}`}>{listLines.map((line, i) => <li key={i}>{formatInline(line.replace(/^\s*(?:[-*]|\d+\.)\s/, ""))}</li>)}</List>;
      }
      return <p key={index} className="m-0">{trimmed.split("\n").map((line, i) => <span key={i}>{i > 0 && <br />}{formatInline(line)}</span>)}</p>;
    })}
  </div>;
}

function formatInline(line: string) {
  return line.split(/(\*\*[^*]+\*\*)/g).map((part, index) => part.startsWith("**") && part.endsWith("**")
    ? <strong key={index} className="font-semibold">{part.slice(2, -2)}</strong>
    : part);
}

function CodeBlock({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try { await navigator.clipboard.writeText(value); setCopied(true); window.setTimeout(() => setCopied(false), 1600); } catch { /* Clipboard permissions may be unavailable. */ }
  };
  return <div className="overflow-hidden rounded-lg border border-app-line bg-app-bg">
    <div className="flex items-center justify-between border-b border-app-line px-3 py-1.5"><span className="font-mono text-xs text-app-faint">Code</span><button onClick={copy} className="inline-flex items-center gap-1.5 rounded px-2 py-1 text-xs text-app-muted hover:bg-app-accent-soft hover:text-app-text" aria-label="Copy code">{copied ? <Check size={13} /> : <Copy size={13} />}{copied ? "Copied" : "Copy"}</button></div>
    <pre className="m-0 overflow-x-auto p-3 font-mono text-[13px] leading-6 text-app-text"><code>{value}</code></pre>
  </div>;
}

function MessageBubble({ message, onCopy, onRegenerate, onEdit, busy }: { message: ChatMessage; onCopy: (message: ChatMessage) => void; onRegenerate: () => void; onEdit: () => void; busy: boolean }) {
  const isUser = message.role === "user";
  return <article className={`group flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}>
    {!isUser && <span aria-hidden="true" className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-app-accent-soft text-sm font-semibold text-app-accent">✳</span>}
    <div className={`min-w-0 max-w-[min(100%,680px)] ${isUser ? "rounded-2xl rounded-tr-sm bg-app-accent-soft px-4 py-3" : "flex-1 py-1"}`}>
      <div className="mb-1 flex items-center gap-2"><span className="text-xs font-semibold text-app-text">{isUser ? "You" : "Ad Astra"}</span><time className="text-xs text-app-faint">{new Date(message.createdAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}</time></div>
      <MessageContent content={message.content} />
      {isUser ? <div className="mt-1 flex justify-end opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100 sm:focus-within:opacity-100"><button className={`${buttonStyle} h-7 w-7`} aria-label="Edit message" title="Edit message" disabled={busy} onClick={onEdit}><Pencil size={14} /></button></div> : <div className="mt-2 flex items-center gap-1 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100 sm:focus-within:opacity-100"><button className={`${buttonStyle} h-7 w-7`} aria-label="Copy response" title="Copy response" onClick={() => onCopy(message)}><Copy size={14} /></button><button className={`${buttonStyle} h-7 w-7`} aria-label="Regenerate response" title="Regenerate response" disabled={busy} onClick={onRegenerate}><ArrowDown size={14} className="rotate-180" /></button></div>}
    </div>
    {isUser && <span aria-hidden="true" className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-stone-300 text-xs font-semibold text-stone-800">J</span>}
  </article>;
}

type SpeechResultEvent = { results: ArrayLike<ArrayLike<{ transcript: string }>>; resultIndex: number };
type SpeechRecognizer = { lang: string; continuous: boolean; interimResults: boolean; onresult: ((event: SpeechResultEvent) => void) | null; onerror: (() => void) | null; onend: (() => void) | null; start: () => void; stop: () => void };
type RetryRequest = { id: string; history: ChatMessage[]; prompt: string; model: string; responseStyle: string; temperature: number; streaming: boolean };

function Composer({ onSend, busy, onStop, onNotify, initialValue = "", editing = false, onCancelEdit }: { onSend: (value: string, model: string, responseStyle: string, temperature: number, streaming: boolean) => void; busy: boolean; onStop: () => void; onNotify: (message: string) => void; initialValue?: string; editing?: boolean; onCancelEdit: () => void }) {
  const [value, setValue] = useState(initialValue);
  const [files, setFiles] = useState<File[]>([]);
  const [model, setModel] = useState("Ad Astra standard");
  const [listening, setListening] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const addMenuRef = useRef<HTMLDetailsElement>(null);
  const recognitionRef = useRef<SpeechRecognizer | null>(null);
  const voiceBaseRef = useRef("");
  useEffect(() => () => recognitionRef.current?.stop(), []);
  useEffect(() => { setValue(initialValue); }, [initialValue]);
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("ad-astra-ai-preferences-v1") ?? "null") as { defaultModel?: string } | null;
      if (saved?.defaultModel === "Ad Astra standard" || saved?.defaultModel === "Ad Astra thoughtful") setModel(saved.defaultModel);
    } catch { /* Keep the standard model if browser preferences are unavailable. */ }
  }, []);
  useEffect(() => {
    const input = inputRef.current;
    if (!input) return;
    input.style.height = "auto";
    input.style.height = `${input.scrollHeight}px`;
  }, [value]);
  const send = () => {
    const text = value.trim();
    if ((!text && files.length === 0) || busy) return;
    const fileNote = files.length ? `\n\nAttached files (mock replies do not read file contents): ${files.map((file) => file.name).join(", ")}` : "";
    let responseStyle = "balanced"; let temperature = 0.7; let streaming = true;
    try {
      const saved = JSON.parse(localStorage.getItem("ad-astra-ai-preferences-v1") ?? "null") as { responseStyle?: string; temperature?: number; streaming?: boolean } | null;
      if (["balanced", "concise", "detailed"].includes(saved?.responseStyle ?? "")) responseStyle = saved?.responseStyle ?? responseStyle;
      if (typeof saved?.temperature === "number" && saved.temperature >= 0 && saved.temperature <= 2) temperature = saved.temperature;
      if (typeof saved?.streaming === "boolean") streaming = saved.streaming;
    } catch { /* Use the balanced streaming defaults. */ }
    onSend(`${text}${fileNote}`, model, responseStyle, temperature, streaming);
    setValue(""); setFiles([]);
    if (inputRef.current) inputRef.current.style.height = "auto";
    if (fileInputRef.current) fileInputRef.current.value = "";
    inputRef.current?.focus();
  };
  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) { event.preventDefault(); send(); }
  };
  const toggleVoice = () => {
    if (recognitionRef.current) { recognitionRef.current.stop(); recognitionRef.current = null; setListening(false); return; }
    const speechWindow = window as unknown as { SpeechRecognition?: new () => SpeechRecognizer; webkitSpeechRecognition?: new () => SpeechRecognizer };
    const SpeechApi = speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition;
    if (!SpeechApi) { onNotify("Voice input isn’t supported in this browser."); return; }
    const recognition = new SpeechApi();
    recognition.lang = navigator.language || "en-US"; recognition.continuous = true; recognition.interimResults = true;
    voiceBaseRef.current = value.trimEnd();
    recognition.onresult = (event) => {
      const transcript = Array.from({ length: event.results.length }, (_, index) => event.results[index]?.[0]?.transcript ?? "").join(" ").trim();
      const combined = [voiceBaseRef.current, transcript].filter(Boolean).join(" ");
      setValue(combined);
    };
    recognition.onerror = () => { setListening(false); recognitionRef.current = null; onNotify("Voice input couldn’t start. Check your microphone permission."); };
    recognition.onend = () => { setListening(false); recognitionRef.current = null; };
    try { recognition.start(); recognitionRef.current = recognition; setListening(true); }
    catch { onNotify("Voice input couldn’t start. Check your microphone permission."); }
  };
  return <div className="w-full px-3 pb-3 pt-3 sm:px-6 sm:pb-5 sm:pt-4 lg:px-8">
    <div className="rounded-3xl border border-app-line-strong bg-app-panel p-2 shadow-[0_4px_18px_-8px_rgb(0_0_0/0.16)] transition-colors focus-within:border-app-accent/60 focus-within:ring-2 focus-within:ring-app-accent/10 sm:p-3">
      {editing && <div className="mb-1 flex items-center justify-between rounded-lg bg-app-accent-soft px-3 py-2 text-xs text-app-text"><span className="font-medium">Editing your message</span><button type="button" onClick={onCancelEdit} className="rounded px-2 py-1 font-semibold text-app-accent hover:bg-app-panel">Cancel</button></div>}
      {files.length > 0 && <div className="flex flex-wrap gap-2 px-2 pt-1 sm:px-3">{files.map((file, index) => <span key={`${file.name}-${index}`} className="inline-flex max-w-full items-center gap-2 rounded-lg border border-app-line bg-app-bg px-2.5 py-1.5 text-xs text-app-muted"><Paperclip size={13} className="shrink-0 text-app-accent" /><span className="max-w-48 truncate">{file.name}</span><button type="button" onClick={() => setFiles((current) => current.filter((_, fileIndex) => fileIndex !== index))} aria-label={`Remove ${file.name}`} className="rounded p-0.5 hover:bg-app-accent-soft hover:text-app-text"><X size={13} /></button></span>)}</div>}
      <label className="sr-only" htmlFor="chat-composer">Write a message</label>
      <textarea id="chat-composer" ref={inputRef} rows={1} value={value} onChange={(event) => setValue(event.target.value)} onKeyDown={onKeyDown} placeholder="Message Ad Astra" className="block min-h-12 w-full resize-none overflow-y-hidden bg-transparent px-3 py-3 text-base leading-6 text-app-text outline-none placeholder:text-app-faint sm:px-4" />
      <div className="flex min-h-11 items-center justify-between gap-2 px-1 sm:px-2">
        <div className="flex min-w-0 items-center gap-1.5">
          <details ref={addMenuRef} className="relative">
            <summary aria-label="Add to message" title="Add to message" className="grid h-9 w-9 cursor-pointer list-none place-items-center rounded-full text-app-muted transition-colors hover:bg-app-accent-soft hover:text-app-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-app-accent [&::-webkit-details-marker]:hidden"><Plus size={20} /></summary>
            <div className="absolute bottom-11 left-0 z-40 w-64 rounded-xl border border-app-line bg-app-panel p-1.5 shadow-xl"><button type="button" onClick={() => { addMenuRef.current?.removeAttribute("open"); fileInputRef.current?.click(); }} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-app-text hover:bg-app-accent-soft"><Paperclip size={16} className="text-app-muted" /><span><b className="block font-medium">Add photos & files</b><small className="text-xs text-app-faint">Keep them with your message</small></span></button></div>
          </details>
          <input ref={fileInputRef} type="file" multiple className="sr-only" aria-label="Choose files to attach" onChange={(event) => { const selected = Array.from(event.target.files ?? []); if (selected.length) setFiles((current) => [...current, ...selected]); }} />
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <Dropdown ariaLabel="Choose a model" value={model} onChange={(value) => { setModel(value); try { const preferences = JSON.parse(localStorage.getItem("ad-astra-ai-preferences-v1") ?? "{}") as Record<string, unknown>; localStorage.setItem("ad-astra-ai-preferences-v1", JSON.stringify({ ...preferences, defaultModel: value })); } catch { /* Model selection still applies to this conversation. */ } }} placement="top" align="end" leadingIcon={<Sparkles size={15} className="shrink-0 text-app-accent" />} triggerClassName="h-9 max-w-[220px] rounded-full border-transparent bg-transparent px-3 text-app-muted hover:bg-app-accent-soft hover:text-app-text" options={[{ value: "Ad Astra standard", label: "Standard", description: "Everyday tasks and quick ideas" }, { value: "Ad Astra thoughtful", label: "Thoughtful", description: "More detailed reasoning" }]} />
          <button type="button" onClick={toggleVoice} aria-label={listening ? "Stop voice input" : "Start voice input"} aria-pressed={listening} title={listening ? "Stop voice input" : "Voice input"} className={`grid h-9 w-9 place-items-center rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-app-accent ${listening ? "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300" : "text-app-muted hover:bg-app-accent-soft hover:text-app-text"}`}><Mic size={18} /></button>
          {busy ? <button onClick={onStop} aria-label="Stop generating" title="Stop generating" className="grid h-9 w-9 place-items-center rounded-full bg-app-text text-app-panel transition-opacity hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-app-accent"><Square size={13} /></button> : <button onClick={send} disabled={!value.trim() && files.length === 0} aria-label="Send message" title="Send message" className="grid h-9 w-9 place-items-center rounded-full bg-app-text text-app-panel transition-opacity hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-app-accent disabled:cursor-not-allowed disabled:opacity-30"><ArrowUp size={19} strokeWidth={2.5} /></button>}
        </div>
      </div>
    </div>
    <p className="mb-0 mt-2 text-center text-xs leading-5 text-app-faint">Mock replies don’t read attached file contents · Enter to send, Shift + Enter for a new line</p>
  </div>;
}

export function ChatWorkspace({ initialConversationId = "launch-strategy", startNew = false, initialPrompt = "" }: { initialConversationId?: string; startNew?: boolean; initialPrompt?: string }) {
  const router = useRouter();
  const [conversations, setConversations] = useState<ChatConversation[]>(initialConversations);
  const [activeId, setActiveId] = useState(initialConversationId);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState("");
  const [composerSeed, setComposerSeed] = useState(initialPrompt);
  const [editingMessageId, setEditingMessageId] = useState("");
  const [requestFailure, setRequestFailure] = useState("");
  const [retryRequest, setRetryRequest] = useState<RetryRequest | null>(null);
  const messagesRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<number | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const startNewHandledRef = useRef(false);
  const activeConversation = conversations.find((item) => item.id === activeId) ?? conversations[0];

  useEffect(() => { setComposerSeed(initialPrompt); }, [initialPrompt]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      let saved = readSavedConversations();
      const supabase = createSupabaseBrowserClient();
      if (supabase) {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            const { data: rows } = await supabase.from("conversations").select("id,title,favorite,updated_at").eq("user_id", user.id).order("updated_at", { ascending: false });
            if (rows?.length) {
              const ids = rows.map((row) => row.id);
              const { data: messageRows } = await supabase.from("messages").select("id,conversation_id,role,content,created_at").eq("user_id", user.id).in("conversation_id", ids).order("created_at", { ascending: true });
              saved = rows.map((row) => ({ id: row.id, title: row.title, favorite: row.favorite, updatedAt: row.updated_at, messages: (messageRows ?? []).filter((message) => message.conversation_id === row.id).map((message) => ({ id: message.id, role: message.role as "user" | "assistant", content: message.content, createdAt: message.created_at })) }));
            }
          }
        } catch { /* Keep the local copy available when sync is temporarily offline. */ }
      }
      if (cancelled) return;
      setConversations(saved);
      window.dispatchEvent(new Event("ad-astra-conversations-updated"));
      setActiveId(saved.some((item) => item.id === initialConversationId) ? initialConversationId : (saved[0]?.id ?? ""));
      setReady(true);
    }
    void load();
    return () => { cancelled = true; };
  }, [initialConversationId]);

  useEffect(() => {
    const refreshFromSidebar = () => {
      const next = readSavedConversations();
      setConversations(next);
      if (!next.some((item) => item.id === activeId)) {
        const nextId = next[0]?.id ?? "";
        setActiveId(nextId);
        router.replace(nextId ? `/app/chat/${nextId}` : "/app/chat", { scroll: false });
      }
    };
    window.addEventListener("ad-astra-conversations-updated", refreshFromSidebar);
    return () => window.removeEventListener("ad-astra-conversations-updated", refreshFromSidebar);
  }, [activeId, router]);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
    const supabase = createSupabaseBrowserClient();
    if (!supabase) return;
    const timeout = window.setTimeout(() => {
      void (async () => {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) return;
          const conversationRows = conversations.map(({ id, title, favorite, updatedAt }) => ({ id, user_id: user.id, title, favorite, updated_at: updatedAt }));
          if (conversationRows.length) await supabase.from("conversations").upsert(conversationRows, { onConflict: "user_id,id" });
          for (const conversation of conversations) {
            const removeStale = supabase.from("messages").delete().eq("user_id", user.id).eq("conversation_id", conversation.id);
            if (conversation.messages.length) await removeStale.not("id", "in", `(${conversation.messages.map((message) => message.id).join(",")})`);
            else await removeStale;
          }
          const messageRows = conversations.flatMap((conversation) => conversation.messages.map((message) => ({ id: message.id, conversation_id: conversation.id, user_id: user.id, role: message.role, content: message.content, created_at: message.createdAt })));
          if (messageRows.length) await supabase.from("messages").upsert(messageRows, { onConflict: "user_id,id" });
        } catch { /* Keep the local copy usable if database sync is offline. */ }
      })();
    }, 500);
    return () => window.clearTimeout(timeout);
  }, [conversations, ready]);

  useEffect(() => {
    messagesRef.current?.scrollTo({ top: messagesRef.current.scrollHeight, behavior: "smooth" });
  }, [activeId, activeConversation?.messages.length, busy]);

  useEffect(() => () => { if (timerRef.current) window.clearTimeout(timerRef.current); abortRef.current?.abort(); }, []);

  const updateConversations = useCallback((next: ChatConversation[]) => {
    setConversations(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    window.dispatchEvent(new Event("ad-astra-conversations-updated"));
  }, []);

  const newConversation = useCallback((prompt = "") => {
    const id = `chat-${Date.now()}`;
    const created: ChatConversation = { id, title: "New conversation", updatedAt: new Date().toISOString(), favorite: false, messages: [] };
    updateConversations([created, ...conversations]); setActiveId(id); setBusy(false); router.push(`/app/chat/${id}${prompt ? `?prompt=${encodeURIComponent(prompt)}` : ""}`, { scroll: false });
  }, [conversations, router, updateConversations]);

  useEffect(() => {
    if (!ready || !startNew || startNewHandledRef.current) return;
    startNewHandledRef.current = true;
    newConversation(initialPrompt);
  }, [ready, startNew, initialPrompt, newConversation]);

  const makeTitle = (text: string) => text.trim().replace(/\s+/g, " ").slice(0, 38) + (text.trim().length > 38 ? "…" : "");

  const streamReply = async (id: string, history: ChatMessage[], prompt: string, requestedModel = "Ad Astra standard", responseStyle = "balanced", temperature = 0.7, streaming = true) => {
    const controller = new AbortController(); abortRef.current = controller; setBusy(true); setRequestFailure(""); setRetryRequest(null);
    const assistant: ChatMessage = { id: `message-${Date.now()}-assistant`, role: "assistant", content: "", createdAt: new Date().toISOString() };
    let streamedContent = "";
    const removeEmptyReply = () => {
      try {
        const latest = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]") as ChatConversation[];
        updateConversations(latest.map((item) => item.id === id ? { ...item, messages: item.messages.filter((entry) => entry.id !== assistant.id) } : item));
      } catch { /* Keep the current view if local storage is unavailable. */ }
    };
    try {
      const response = await fetch("/api/chat", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ messages: history.map(({ role, content }) => ({ role, content })), model: requestedModel, responseStyle, temperature, streaming }), signal: controller.signal });
      if (!response.ok) { const data = await response.json().catch(() => null) as { error?: string } | null; throw new Error(data?.error ?? "The response could not be generated."); }
      if (!response.body) throw new Error("The response stream is unavailable.");
      updateConversations(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]").map((item: ChatConversation) => item.id === id ? { ...item, messages: [...item.messages, assistant] } : item));
      const reader = response.body.getReader(); const decoder = new TextDecoder();
      while (true) {
        const { value, done } = await reader.read(); if (done) break;
        streamedContent += decoder.decode(value, { stream: true });
        const updated = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]") as ChatConversation[];
        updateConversations(updated.map((item) => item.id === id ? { ...item, updatedAt: new Date().toISOString(), messages: item.messages.map((message) => message.id === assistant.id ? { ...message, content: streamedContent } : message) } : item));
      }
      streamedContent += decoder.decode();
      if (!streamedContent) throw new Error("The assistant returned an empty response.");
    } catch (cause) {
      if (cause instanceof DOMException && cause.name === "AbortError" && streamedContent) {
        const latest = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]") as ChatConversation[];
        updateConversations(latest.map((item) => item.id === id ? { ...item, messages: item.messages.map((message) => message.id === assistant.id ? { ...message, content: streamedContent } : message) } : item));
        return;
      }
      removeEmptyReply();
      if (cause instanceof DOMException && cause.name === "AbortError") return;
      const message = cause instanceof Error ? cause.message : "The response could not be generated.";
      setRequestFailure(message);
      setRetryRequest({ id, history, prompt, model: requestedModel, responseStyle, temperature, streaming });
    } finally { if (abortRef.current === controller) abortRef.current = null; setBusy(false); }
  };

  const sendMessage = (text: string, selectedModel = "Ad Astra standard", responseStyle = "balanced", temperature = 0.7, streaming = true) => {
    if (!activeConversation) return;
    const now = new Date().toISOString();
    if (editingMessageId) {
      const originalIndex = activeConversation.messages.findIndex((message) => message.id === editingMessageId && message.role === "user");
      if (originalIndex >= 0) {
        const editedMessage = { ...activeConversation.messages[originalIndex], content: text, createdAt: now };
        const history = [...activeConversation.messages.slice(0, originalIndex), editedMessage];
        updateConversations(conversations.map((item) => item.id === activeConversation.id ? { ...item, title: originalIndex === 0 ? makeTitle(text) : item.title, updatedAt: now, messages: history } : item));
        setEditingMessageId(""); setComposerSeed("");
        void streamReply(activeConversation.id, history, text, selectedModel, responseStyle, temperature, streaming);
        return;
      }
      setEditingMessageId("");
    }
    const userMessage: ChatMessage = { id: `message-${Date.now()}`, role: "user", content: text, createdAt: now };
    const next = conversations.map((item) => item.id === activeConversation.id ? { ...item, title: item.messages.length === 0 ? makeTitle(text) : item.title, updatedAt: now, messages: [...item.messages, userMessage] } : item);
    updateConversations(next);
    setComposerSeed("");
    const history = [...activeConversation.messages, userMessage];
    void streamReply(activeConversation.id, history, text, selectedModel, responseStyle, temperature, streaming);
  };

  const stopGeneration = () => { abortRef.current?.abort(); if (timerRef.current) window.clearTimeout(timerRef.current); timerRef.current = null; setBusy(false); };
  const mutateConversation = (id: string, change: (item: ChatConversation) => ChatConversation) => updateConversations(conversations.map((item) => item.id === id ? change(item) : item));
  const copyMessage = async (message: ChatMessage) => {
    try { await navigator.clipboard.writeText(message.content); setToast("Copied to clipboard"); window.setTimeout(() => setToast(""), 1800); } catch { setToast("Clipboard access is unavailable"); window.setTimeout(() => setToast(""), 1800); }
  };
  const startEditingMessage = (message: ChatMessage) => {
    if (busy) return;
    setEditingMessageId(message.id); setComposerSeed(message.content); setRequestFailure("");
    window.setTimeout(() => document.getElementById("chat-composer")?.focus(), 0);
  };
  const cancelEditingMessage = () => { setEditingMessageId(""); setComposerSeed(""); };
  const regenerate = () => {
    const lastUserMessage = [...(activeConversation?.messages ?? [])].reverse().find((message) => message.role === "user");
    if (!lastUserMessage || busy || !activeConversation) return;
    const history = activeConversation.messages.at(-1)?.role === "assistant" ? activeConversation.messages.slice(0, -1) : activeConversation.messages;
    mutateConversation(activeConversation.id, (item) => ({ ...item, messages: history }));
    void streamReply(activeConversation.id, history, lastUserMessage.content);
  };

  if (!activeConversation) return <div className="grid min-h-[540px] place-items-center"><div className="text-center"><span className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-app-accent-soft text-app-accent"><MessageSquarePlus size={22} /></span><h1 className="mb-1 mt-4 font-display text-lg font-semibold text-app-text">A little more room to think.</h1><p className="mb-4 mt-0 text-sm text-app-muted">Start a conversation and work through an idea.</p><button onClick={() => newConversation()} className="inline-flex h-9 items-center gap-2 rounded-md bg-app-accent px-3 text-sm font-semibold text-white"><Plus size={15} /> New conversation</button></div></div>;

  return <section className="-mx-3 -my-5 flex min-h-[calc(100dvh-110px)] flex-col overflow-hidden border-y border-app-line bg-app-panel sm:-mx-4 sm:-my-6 md:-mx-9 md:-my-9 md:min-h-[calc(100dvh-100px)]">
    <div className="flex min-h-[540px] min-w-0 flex-1 flex-col">
      <header className="flex h-12 shrink-0 items-center justify-between gap-3 border-b border-app-line px-4 sm:px-6"><div className="flex min-w-0 items-center gap-2"><h1 className="m-0 truncate font-display text-sm font-semibold text-app-text">{activeConversation.title}</h1>{activeConversation.favorite && <Star size={13} className="shrink-0 fill-amber-500 text-amber-500" aria-label="Favorite conversation" />}</div></header>
      {activeConversation.messages.length === 0 ? <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-5 py-8 text-center"><span className="grid h-12 w-12 place-items-center rounded-xl bg-app-accent-soft text-app-accent"><span className="text-2xl">✳</span></span><h2 className="mb-1 mt-4 font-display text-xl font-semibold text-app-text">A little more room to think.</h2><p className="mb-6 mt-0 max-w-sm text-sm leading-6 text-app-muted">Bring a question, a rough draft, or just a place to begin. We’ll figure out the next step together.</p><div className="grid w-full max-w-xl gap-2 sm:grid-cols-2">{["Help me make a plan", "Summarize this idea", "Help me get unstuck", "What should I consider?"] .map((prompt) => <button key={prompt} onClick={() => sendMessage(prompt)} className="flex items-center justify-between gap-2 rounded-lg border border-app-line bg-app-bg px-3 py-2.5 text-left text-sm text-app-muted transition-colors hover:border-app-accent/40 hover:bg-app-accent-soft hover:text-app-text"><span>{prompt}</span><ArrowUp size={14} className="shrink-0 rotate-45" /></button>)}</div></div> : <div ref={messagesRef} className="min-h-0 flex-1 space-y-7 overflow-y-auto scroll-smooth px-4 py-6 sm:px-6 md:px-8">{activeConversation.messages.map((message) => <MessageBubble key={message.id} message={message} onCopy={copyMessage} onRegenerate={regenerate} onEdit={() => startEditingMessage(message)} busy={busy} />)}{busy && <div className="flex items-start gap-3" role="status" aria-label="Ad Astra is thinking"><span className="grid h-8 w-8 place-items-center rounded-lg bg-app-accent-soft text-app-accent">✳</span><div className="flex h-9 items-center gap-1.5"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-app-muted"/><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-app-muted [animation-delay:150ms]"/><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-app-muted [animation-delay:300ms]"/><span className="sr-only">Thinking</span></div></div>}</div>}
      {requestFailure && <div role="alert" className="mx-3 flex items-center justify-between gap-3 rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-900 dark:border-red-900 dark:bg-red-950/40 dark:text-red-100 sm:mx-6"><span>{requestFailure}</span>{retryRequest && <button onClick={() => void streamReply(retryRequest.id, retryRequest.history, retryRequest.prompt, retryRequest.model, retryRequest.responseStyle, retryRequest.temperature, retryRequest.streaming)} className="shrink-0 rounded-md border border-current/20 px-3 py-1.5 text-xs font-semibold hover:bg-black/5 dark:hover:bg-white/5">Retry</button>}</div>}
      <Composer onSend={sendMessage} busy={busy} onStop={stopGeneration} initialValue={composerSeed} editing={Boolean(editingMessageId)} onCancelEdit={cancelEditingMessage} onNotify={(message) => { setToast(message); window.setTimeout(() => setToast(""), 2200); }} />
    </div>
    {toast && <div role="status" className="fixed bottom-16 left-1/2 z-50 -translate-x-1/2 rounded-lg border border-app-line bg-app-panel px-4 py-2 text-sm text-app-text shadow-lg">{toast}</div>}
  </section>;
}
