"use client";

import { useEffect, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { ArrowUpRight, BookOpenText, CornerDownLeft, FileText, MessageSquareText, Search, Sparkles } from "lucide-react";
import { initialConversations, type ChatConversation } from "@/data/chat";
import { initialDocuments, initialPrompts, type WorkspaceDocument, type WorkspacePrompt } from "@/data/workspace";

type SearchResult = { id: string; title: string; description: string; kind: "Conversations" | "Documents" | "Prompts"; href: string };

const resultIcons = { Conversations: MessageSquareText, Documents: FileText, Prompts: BookOpenText };

function HighlightedText({ text, query }: { text: string; query: string }) {
  const term = query.trim();
  if (!term) return text;
  const lowerText = text.toLocaleLowerCase(); const lowerTerm = term.toLocaleLowerCase();
  const parts: ReactNode[] = []; let cursor = 0; let match = lowerText.indexOf(lowerTerm);
  while (match >= 0) {
    if (match > cursor) parts.push(text.slice(cursor, match));
    parts.push(<mark key={`${match}-${parts.length}`} className="rounded-sm bg-amber-200/80 text-inherit dark:bg-amber-300/25">{text.slice(match, match + term.length)}</mark>);
    cursor = match + term.length; match = lowerText.indexOf(lowerTerm, cursor);
  }
  if (cursor < text.length) parts.push(text.slice(cursor));
  return parts.length ? parts : text;
}

export function WorkspaceSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(0);
  const [conversations, setConversations] = useState(initialConversations);
  const [documents, setDocuments] = useState(initialDocuments);
  const [prompts, setPrompts] = useState(initialPrompts);
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => { inputRef.current?.focus(); }, []);
  useEffect(() => {
    const load = <T,>(key: string, setItems: (items: T[]) => void) => {
      try { const saved: unknown = JSON.parse(localStorage.getItem(key) ?? "null"); if (Array.isArray(saved)) setItems(saved as T[]); }
      catch { /* Keep the included mock results. */ }
    };
    load<ChatConversation>("ad-astra-chat-conversations-v1", setConversations);
    load<WorkspaceDocument>("ad-astra-documents-v1", setDocuments);
    load<WorkspacePrompt>("ad-astra-prompts-v1", setPrompts);
  }, []);

  const groups = useMemo(() => {
    const term = query.trim().toLowerCase();
    const matches = (text: string) => !term || text.toLowerCase().includes(term);
    return [
      { kind: "Conversations" as const, items: conversations.filter((item) => matches(`${item.title} ${item.messages.map((message) => message.content).join(" ")}`)).map((item): SearchResult => ({ id: `conversation-${item.id}`, title: item.title, description: "Conversation", kind: "Conversations", href: `/app/chat/${item.id}` })) },
      { kind: "Documents" as const, items: documents.filter((item) => matches(`${item.name} ${item.category} ${item.excerpt}`)).map((item): SearchResult => ({ id: `document-${item.id}`, title: item.name, description: `${item.type} · ${item.category}`, kind: "Documents", href: `/app/documents/${item.id}` })) },
      { kind: "Prompts" as const, items: prompts.filter((item) => matches(`${item.title} ${item.description} ${item.category} ${item.content}`)).map((item): SearchResult => ({ id: `prompt-${item.id}`, title: item.title, description: `${item.category} · ${item.description}`, kind: "Prompts", href: `/app/prompts/${item.id}` })) },
    ];
  }, [query, conversations, documents, prompts]);
  const flatResults = groups.flatMap((group) => group.items);
  const activeIndex = flatResults.length ? selected % flatResults.length : 0;
  const navigateTo = (index: number) => { const result = flatResults[index]; if (result) router.push(result.href); };
  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") { event.preventDefault(); setSelected((current) => flatResults.length ? (current + 1) % flatResults.length : 0); }
    if (event.key === "ArrowUp") { event.preventDefault(); setSelected((current) => flatResults.length ? (current - 1 + flatResults.length) % flatResults.length : 0); }
    if (event.key === "Enter") { event.preventDefault(); navigateTo(activeIndex); }
    if (event.key === "Escape") { setQuery(""); inputRef.current?.blur(); }
  };

  return <div className="mx-auto max-w-5xl">
    <div className="mb-6"><p className="mb-2 font-mono text-xs tracking-wide text-app-faint">YOUR WORKSPACE</p><h1 className="m-0 font-display text-2xl font-semibold tracking-tight text-app-text sm:text-3xl">Search</h1><p className="mb-0 mt-2 text-sm text-app-muted">Find conversations, documents, and saved prompts.</p></div>
    <section className="overflow-hidden rounded-2xl border border-app-line bg-app-panel shadow-sm">
      <label className="flex min-h-14 items-center gap-3 border-b border-app-line px-4 sm:px-5"><Search size={19} className="shrink-0 text-app-accent" /><span className="sr-only">Search your workspace</span><input ref={inputRef} value={query} onChange={(event) => { setQuery(event.target.value); setSelected(0); }} onKeyDown={onKeyDown} role="combobox" aria-expanded="true" aria-controls="workspace-search-results" aria-activedescendant={flatResults[activeIndex] ? `workspace-search-option-${flatResults[activeIndex].id}` : undefined} aria-autocomplete="list" placeholder="Search anything..." className="min-w-0 flex-1 bg-transparent py-3 text-base text-app-text outline-none placeholder:text-app-faint" /><kbd className="hidden rounded border border-app-line px-1.5 py-0.5 font-mono text-xs text-app-faint sm:inline">ESC</kbd></label>
      <div id="workspace-search-results" className="max-h-[min(60vh,560px)] overflow-y-auto p-2" role="listbox" aria-label="Workspace search results">
        {flatResults.length ? groups.map((group) => group.items.length > 0 && <section key={group.kind} aria-label={group.kind}><h2 className="mb-1 mt-2 px-3 font-mono text-[11px] tracking-wide text-app-faint">{group.kind.toUpperCase()}</h2>{group.items.map((result) => {
          const index = flatResults.findIndex((item) => item.id === result.id);
          const Icon = resultIcons[result.kind];
          return <button key={result.id} id={`workspace-search-option-${result.id}`} role="option" aria-selected={activeIndex === index} onMouseEnter={() => setSelected(index)} onClick={() => navigateTo(index)} className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors ${activeIndex === index ? "bg-app-accent-soft" : "hover:bg-app-bg"}`}><span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-app-line bg-app-panel text-app-muted"><Icon size={16} /></span><span className="min-w-0 flex-1"><b className="block truncate text-sm font-medium text-app-text"><HighlightedText text={result.title} query={query}/></b><small className="mt-0.5 block truncate text-xs text-app-muted"><HighlightedText text={result.description} query={query}/></small></span>{activeIndex === index ? <CornerDownLeft size={15} className="text-app-faint" /> : <ArrowUpRight size={14} className="text-app-faint" />}</button>;
        })}</section>) : <div className="px-4 py-12 text-center"><span className="mx-auto grid h-10 w-10 place-items-center rounded-full bg-app-accent-soft text-app-accent"><Search size={18} /></span><h2 className="mb-1 mt-3 font-display text-base font-semibold text-app-text">No results found</h2><p className="m-0 text-sm text-app-muted">Try a different word or search for a document, conversation, or prompt.</p></div>}
      </div>
      <footer className="flex flex-wrap items-center justify-between gap-2 border-t border-app-line px-4 py-2.5 text-xs text-app-faint sm:px-5"><span className="inline-flex items-center gap-1.5"><Sparkles size={13} className="text-app-accent" /> Searching your workspace</span><span><kbd className="rounded border border-app-line px-1">↑</kbd> <kbd className="rounded border border-app-line px-1">↓</kbd> to navigate · Enter to open</span></footer>
    </section>
  </div>;
}
