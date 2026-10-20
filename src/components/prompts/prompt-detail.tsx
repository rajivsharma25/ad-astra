"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowUpRight, Check, Copy, Heart, Sparkles } from "lucide-react";
import { initialPrompts, type WorkspacePrompt } from "@/data/workspace";

export function PromptDetail({ promptId }: { promptId: string }) {
  const router = useRouter();
  const [prompt, setPrompt] = useState<WorkspacePrompt | null>(() => initialPrompts.find((item) => item.id === promptId) ?? null);
  const [copied, setCopied] = useState(false);
  const [favorite, setFavorite] = useState(false);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("ad-astra-prompts-v1") ?? "null") as WorkspacePrompt[] | null;
      const found = saved?.find((item) => item.id === promptId) ?? initialPrompts.find((item) => item.id === promptId) ?? null;
      setPrompt(found); setFavorite(Boolean(found?.favorite));
    } catch { setPrompt(initialPrompts.find((item) => item.id === promptId) ?? null); }
  }, [promptId]);

  async function copy() {
    if (!prompt) return;
    try { await navigator.clipboard.writeText(prompt.content); setCopied(true); window.setTimeout(() => setCopied(false), 1600); }
    catch { setCopied(false); }
  }

  function toggleFavorite() {
    if (!prompt) return;
    const next = !favorite; setFavorite(next);
    try {
      const saved = JSON.parse(localStorage.getItem("ad-astra-prompts-v1") ?? "null") as WorkspacePrompt[] | null;
      const list = saved ?? initialPrompts;
      localStorage.setItem("ad-astra-prompts-v1", JSON.stringify(list.map((item) => item.id === prompt.id ? { ...item, favorite: next } : item)));
    } catch { /* Keep the favorite state for this view if browser storage is unavailable. */ }
  }

  if (!prompt) return <div className="mx-auto max-w-4xl"><Link href="/app/prompts" className="inline-flex items-center gap-2 text-sm text-app-muted"><ArrowLeft size={15}/> Prompt library</Link><section className="mt-5 rounded-xl border border-app-line bg-app-panel px-5 py-14 text-center"><h1 className="m-0 font-display text-xl font-semibold text-app-text">Prompt not found</h1><p className="mb-4 mt-2 text-sm text-app-muted">It may have been removed from your browser.</p><Link href="/app/prompts" className="text-sm font-semibold text-app-accent">Return to prompt library</Link></section></div>;

  return <div className="mx-auto max-w-4xl"><Link href="/app/prompts" className="inline-flex items-center gap-2 text-sm text-app-muted hover:text-app-text"><ArrowLeft size={15}/> Prompt library</Link><article className="mt-5 overflow-hidden rounded-2xl border border-app-line bg-app-panel"><header className="border-b border-app-line p-5 sm:p-7"><span className="rounded-md bg-app-accent-soft px-2 py-1 text-xs font-medium text-app-accent">{prompt.category}</span><div className="mt-4 flex items-start justify-between gap-3"><div><h1 className="m-0 font-display text-2xl font-semibold tracking-tight text-app-text sm:text-3xl">{prompt.title}</h1><p className="mb-0 mt-2 text-sm leading-6 text-app-muted">{prompt.description}</p></div><button onClick={toggleFavorite} aria-pressed={favorite} aria-label={favorite ? "Remove from favorites" : "Add to favorites"} className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-app-muted hover:bg-app-accent-soft hover:text-rose-600"><Heart size={17} className={favorite ? "fill-rose-500 text-rose-500" : ""}/></button></div></header><section className="p-5 sm:p-7"><div className="mb-2 flex items-center gap-2 font-mono text-xs tracking-wide text-app-faint"><Sparkles size={14} className="text-app-accent"/> PROMPT TEXT</div><pre className="m-0 whitespace-pre-wrap break-words rounded-xl border border-app-line bg-app-bg p-4 font-body text-sm leading-6 text-app-text sm:p-5">{prompt.content}</pre><div className="mt-4 flex flex-wrap gap-2"><button onClick={() => router.push(`/app/chat?new=1&prompt=${encodeURIComponent(prompt.content)}`)} className="inline-flex h-10 items-center gap-2 rounded-lg bg-app-accent px-4 text-sm font-semibold text-white"><Sparkles size={15}/> Use prompt <ArrowUpRight size={14}/></button><button onClick={copy} className="inline-flex h-10 items-center gap-2 rounded-lg border border-app-line px-4 text-sm font-semibold text-app-text hover:bg-app-accent-soft">{copied ? <Check size={15}/> : <Copy size={15}/>} {copied ? "Copied" : "Copy prompt"}</button></div></section></article></div>;
}
