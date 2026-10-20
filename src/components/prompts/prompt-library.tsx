"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowUpRight, Check, Copy, Heart, Pencil, Plus, Search, Sparkles, Trash2, X } from "lucide-react";
import { initialPrompts, promptCategories, type PromptCategory, type WorkspacePrompt } from "@/data/workspace";
import { Dropdown } from "@/components/ui/dropdown";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

const storageKey = "ad-astra-prompts-v1";
const emptyForm = { title: "", description: "", category: "Productivity" as PromptCategory, content: "" };

export function PromptLibrary() {
  const router = useRouter();
  const [prompts, setPrompts] = useState<WorkspacePrompt[]>(initialPrompts);
  const [ready, setReady] = useState(false);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<"All prompts" | PromptCategory | "Favorites">("All prompts");
  const [editor, setEditor] = useState(false);
  const [editingId, setEditingId] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [notice, setNotice] = useState("");
  const editorRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!editor) return;
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    editorRef.current?.querySelector<HTMLElement>("input, textarea, button")?.focus();
    return () => previousFocus?.focus();
  }, [editor]);

  const handleEditorKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === "Escape") { event.preventDefault(); setEditor(false); return; }
    if (event.key !== "Tab" || !editorRef.current) return;
    const controls = Array.from(editorRef.current.querySelectorAll<HTMLElement>('button:not([disabled]), input:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'));
    if (!controls.length) return;
    const first = controls[0]; const last = controls[controls.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  };

  useEffect(() => {
    let cancelled = false;
    async function loadPrompts() {
      let localPrompts = initialPrompts;
      try {
        const value = localStorage.getItem(storageKey);
        if (value) { const saved: unknown = JSON.parse(value); if (Array.isArray(saved)) localPrompts = saved as WorkspacePrompt[]; }
      } catch { /* Fall back to the included mock library. */ }
      const supabase = createSupabaseBrowserClient();
      if (supabase) {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            const { data: rows } = await supabase.from("prompts").select("id,title,description,category,content,favorite,updated_at").eq("user_id", user.id).order("updated_at", { ascending: false });
            if (rows?.length) {
              const remote = rows.map((row): WorkspacePrompt => ({ id: row.id, title: row.title, description: row.description, category: row.category as PromptCategory, content: row.content, favorite: row.favorite }));
              const remoteIds = new Set(remote.map((item) => item.id));
              localPrompts = [...localPrompts.filter((item) => !remoteIds.has(item.id)), ...remote];
            }
          }
        } catch { /* Keep the browser library visible when Supabase is offline. */ }
      }
      if (!cancelled) { setPrompts(localPrompts); setReady(true); }
    }
    void loadPrompts();
    return () => { cancelled = true; };
  }, []);
  useEffect(() => {
    if (!ready) return;
    localStorage.setItem(storageKey, JSON.stringify(prompts));
    const supabase = createSupabaseBrowserClient();
    if (!supabase) return;
    const timeout = window.setTimeout(() => void (async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const removeStale = supabase.from("prompts").delete().eq("user_id", user.id);
        if (prompts.length) await removeStale.not("id", "in", `(${prompts.map((item) => item.id).join(",")})`); else await removeStale;
        const updatedAt = new Date().toISOString();
        const rows = prompts.map((item) => ({ ...item, user_id: user.id, updated_at: updatedAt }));
        if (rows.length) await supabase.from("prompts").upsert(rows, { onConflict: "user_id,id" });
      } catch { /* Browser storage remains the fallback when database sync is offline. */ }
    })(), 500);
    return () => window.clearTimeout(timeout);
  }, [prompts, ready]);

  const visiblePrompts = useMemo(() => prompts.filter((prompt) => {
    const matchesText = `${prompt.title} ${prompt.description} ${prompt.category}`.toLowerCase().includes(query.trim().toLowerCase());
    return matchesText && (category === "All prompts" || (category === "Favorites" ? prompt.favorite : prompt.category === category));
  }), [prompts, category, query]);

  const openNew = () => { setEditingId(""); setForm(emptyForm); setEditor(true); };
  const openEdit = (prompt: WorkspacePrompt) => { setEditingId(prompt.id); setForm({ title: prompt.title, description: prompt.description, category: prompt.category, content: prompt.content }); setEditor(true); };
  const save = (event: FormEvent) => {
    event.preventDefault();
    const normalized = { ...form, title: form.title.trim(), description: form.description.trim(), content: form.content.trim() };
    if (!normalized.title || !normalized.content) return;
    if (editingId) setPrompts((current) => current.map((prompt) => prompt.id === editingId ? { ...prompt, ...normalized } : prompt));
    else setPrompts((current) => [{ id: `prompt-${Date.now()}`, ...normalized, favorite: false }, ...current]);
    setEditor(false);
  };

  const copyPrompt = async (prompt: WorkspacePrompt) => {
    try { await navigator.clipboard.writeText(prompt.content); setNotice("Prompt copied"); }
    catch { setNotice("Clipboard access is unavailable"); }
    window.setTimeout(() => setNotice(""), 1800);
  };
  const usePrompt = (prompt: WorkspacePrompt) => router.push(`/app/chat?new=1&prompt=${encodeURIComponent(prompt.content)}`);

  return <div className="mx-auto max-w-6xl">
    <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="mb-2 font-mono text-xs tracking-wide text-app-faint">YOUR WORKSPACE</p><h1 className="m-0 font-display text-2xl font-semibold tracking-tight text-app-text sm:text-3xl">Prompt library</h1><p className="mb-0 mt-2 text-sm text-app-muted">Save the instructions you reach for again and again.</p></div><button onClick={openNew} className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-lg bg-app-accent px-4 text-sm font-semibold text-white transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-app-accent"><Plus size={16} /> Create prompt</button></div>

    <section className="mb-5 rounded-xl border border-app-line bg-app-accent-soft p-4 sm:p-5"><div className="flex items-start gap-3"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-app-panel text-app-accent"><Sparkles size={18} /></span><div><h2 className="m-0 font-display text-base font-semibold text-app-text">A good prompt makes room for good work.</h2><p className="mb-0 mt-1 text-sm leading-5 text-app-muted">Start with a reusable structure, then make it your own.</p></div></div></section>

    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center"><label className="flex h-10 flex-1 items-center gap-2 rounded-lg border border-app-line bg-app-panel px-3"><Search size={16} className="text-app-faint" /><span className="sr-only">Search prompts</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search prompts" className="min-w-0 flex-1 bg-transparent text-sm text-app-text outline-none placeholder:text-app-faint" /></label><div className="flex gap-2 overflow-x-auto pb-1" role="group" aria-label="Filter prompts by category">{(["All prompts", "Favorites", ...promptCategories] as const).map((item) => <button key={item} onClick={() => setCategory(item)} aria-pressed={category === item} className={`h-9 shrink-0 rounded-full border px-3 text-sm transition-colors ${category === item ? "border-app-accent bg-app-accent-soft font-semibold text-app-accent" : "border-app-line bg-app-panel text-app-muted hover:bg-app-accent-soft hover:text-app-text"}`}>{item}</button>)}</div></div>

    {notice && <div role="status" className="mb-4 rounded-lg border border-app-line bg-app-accent-soft px-3 py-2 text-sm text-app-text">{notice}</div>}
    {visiblePrompts.length ? <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{visiblePrompts.map((prompt) => <article key={prompt.id} className="flex min-h-56 flex-col rounded-xl border border-app-line bg-app-panel p-4 transition-colors hover:border-app-line-strong"><div className="flex items-start justify-between gap-3"><span className="rounded-md bg-app-accent-soft px-2 py-1 text-xs font-medium text-app-accent">{prompt.category}</span><div className="flex items-center"><button onClick={() => setPrompts((current) => current.map((item) => item.id === prompt.id ? { ...item, favorite: !item.favorite } : item))} aria-label={prompt.favorite ? "Remove favorite" : "Add favorite"} title={prompt.favorite ? "Remove favorite" : "Add favorite"} className="grid h-8 w-8 place-items-center rounded-md text-app-muted hover:bg-app-accent-soft hover:text-rose-600"><Heart size={16} className={prompt.favorite ? "fill-rose-500 text-rose-500" : ""} /></button><details className="relative"><summary aria-label="Prompt actions" className="grid h-8 w-8 cursor-pointer list-none place-items-center rounded-md text-app-muted hover:bg-app-accent-soft hover:text-app-text [&::-webkit-details-marker]:hidden"><MoreMenuIcon /></summary><div className="absolute right-0 top-9 z-20 w-32 rounded-lg border border-app-line bg-app-panel p-1 shadow-lg"><button onClick={() => openEdit(prompt)} className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-xs text-app-text hover:bg-app-accent-soft"><Pencil size={13} /> Edit</button><button onClick={() => setPrompts((current) => current.filter((item) => item.id !== prompt.id))} className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-xs text-red-700 hover:bg-red-50 dark:text-red-300 dark:hover:bg-red-950/40"><Trash2 size={13} /> Delete</button></div></details></div></div><h2 className="mb-1 mt-3 font-display text-base font-semibold text-app-text"><Link href={`/app/prompts/${prompt.id}`} className="rounded-sm hover:text-app-accent focus-visible:outline-2 focus-visible:outline-app-accent">{prompt.title}</Link></h2><p className="mb-3 mt-0 text-sm leading-5 text-app-muted">{prompt.description}</p><div className="mb-4 line-clamp-3 rounded-lg bg-app-bg px-3 py-2 font-mono text-xs leading-5 text-app-faint">{prompt.content}</div><div className="mt-auto flex items-center justify-between gap-2"><button onClick={() => usePrompt(prompt)} className="inline-flex h-9 items-center gap-1.5 rounded-md bg-app-accent px-3 text-sm font-semibold text-white hover:opacity-90">Use prompt <ArrowUpRight size={14} /></button><Link href={`/app/prompts/${prompt.id}`} className="inline-flex h-9 items-center gap-1.5 rounded-md px-2.5 text-sm text-app-muted hover:bg-app-accent-soft hover:text-app-text">Details <ArrowUpRight size={14}/></Link><button onClick={() => copyPrompt(prompt)} className="inline-flex h-9 items-center gap-1.5 rounded-md px-2.5 text-sm text-app-muted hover:bg-app-accent-soft hover:text-app-text"><Copy size={14} /> Copy</button></div></article>)}</div> : <div className="rounded-xl border border-app-line bg-app-panel px-4 py-14 text-center"><span className="mx-auto grid h-10 w-10 place-items-center rounded-full bg-app-accent-soft text-app-accent"><Search size={18} /></span><h2 className="mb-1 mt-3 font-display text-base font-semibold text-app-text">No prompts found</h2><p className="m-0 text-sm text-app-muted">Try another search or create a new prompt.</p></div>}

    {editor && <div className="fixed inset-0 z-[60] grid place-items-center bg-black/40 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) setEditor(false); }}><section ref={editorRef} role="dialog" aria-modal="true" aria-labelledby="prompt-editor-title" onKeyDown={handleEditorKeyDown} className="max-h-[90dvh] w-full max-w-xl overflow-y-auto rounded-2xl border border-app-line bg-app-panel p-5 shadow-2xl sm:p-6"><div className="mb-5 flex items-start justify-between"><div><p className="mb-1 font-mono text-xs tracking-wide text-app-faint">PROMPT DETAILS</p><h2 id="prompt-editor-title" className="m-0 font-display text-xl font-semibold text-app-text">{editingId ? "Edit prompt" : "Create a prompt"}</h2></div><button onClick={() => setEditor(false)} aria-label="Close prompt editor" className="grid h-8 w-8 place-items-center rounded-md text-app-muted hover:bg-app-accent-soft"><X size={17} /></button></div><form onSubmit={save} className="space-y-4"><label className="block text-sm font-medium text-app-text">Title<input required maxLength={80} value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} className="mt-1.5 h-10 w-full rounded-lg border border-app-line bg-app-bg px-3 text-sm outline-none focus:border-app-accent" /></label><label className="block text-sm font-medium text-app-text">Description<input maxLength={140} value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} className="mt-1.5 h-10 w-full rounded-lg border border-app-line bg-app-bg px-3 text-sm outline-none focus:border-app-accent" /></label><div className="space-y-1.5"><span className="block text-sm font-medium text-app-text">Category</span><Dropdown ariaLabel="Prompt category" value={form.category} onChange={(value) => setForm((current) => ({ ...current, category: value as PromptCategory }))} className="w-full" triggerClassName="h-10 w-full justify-between rounded-lg" options={promptCategories.map((item) => ({ value: item, label: item }))} /></div><label className="block text-sm font-medium text-app-text">Prompt<textarea required rows={6} value={form.content} onChange={(event) => setForm((current) => ({ ...current, content: event.target.value }))} className="mt-1.5 w-full rounded-lg border border-app-line bg-app-bg px-3 py-2 text-sm leading-6 outline-none focus:border-app-accent" /></label><div className="flex justify-end gap-2 border-t border-app-line pt-4"><button type="button" onClick={() => setEditor(false)} className="h-9 rounded-md px-3 text-sm font-medium text-app-muted hover:bg-app-accent-soft">Cancel</button><button type="submit" className="inline-flex h-9 items-center gap-2 rounded-md bg-app-accent px-3 text-sm font-semibold text-white"><Check size={15} /> {editingId ? "Save changes" : "Create prompt"}</button></div></form></section></div>}
  </div>;
}

function MoreMenuIcon() {
  return <span aria-hidden="true" className="flex gap-0.5"><i className="h-1 w-1 rounded-full bg-current"/><i className="h-1 w-1 rounded-full bg-current"/><i className="h-1 w-1 rounded-full bg-current"/></span>;
}
