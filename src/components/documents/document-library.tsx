"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type DragEvent, type FormEvent } from "react";
import { ArrowRight, File, FileSpreadsheet, FileText, FileUp, FolderOpen, Pencil, Search, Trash2, Upload, X } from "lucide-react";
import { initialDocuments, type WorkspaceDocument } from "@/data/workspace";
import { Dropdown } from "@/components/ui/dropdown";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

const storageKey = "ad-astra-documents-v1";

function getFileType(name: string): WorkspaceDocument["type"] {
  const extension = name.split(".").pop()?.toLowerCase();
  if (extension === "pdf") return "PDF";
  if (extension === "docx") return "DOCX";
  if (extension === "csv") return "CSV";
  return "TXT";
}

function formatSize(bytes: number) {
  return bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function DocumentIcon({ type }: { type: WorkspaceDocument["type"] }) {
  const Icon = type === "CSV" ? FileSpreadsheet : type === "PDF" ? File : FileText;
  return <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-lg ${type === "PDF" ? "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300" : type === "CSV" ? "bg-green-50 text-green-800 dark:bg-green-950/40 dark:text-green-300" : "bg-app-accent-soft text-app-accent"}`}><Icon size={19} /></span>;
}

export function DocumentLibrary() {
  const [documents, setDocuments] = useState<WorkspaceDocument[]>(initialDocuments);
  const [ready, setReady] = useState(false);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All types");
  const [sort, setSort] = useState<"recent" | "name">("recent");
  const [dragging, setDragging] = useState(false);
  const [editingId, setEditingId] = useState("");
  const [editName, setEditName] = useState("");
  const [notice, setNotice] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let cancelled = false;
    async function loadDocuments() {
      let localDocuments = initialDocuments;
      try {
        const value = localStorage.getItem(storageKey);
        if (value) { const saved: unknown = JSON.parse(value); if (Array.isArray(saved)) localDocuments = saved as WorkspaceDocument[]; }
      } catch { /* Use the bundled examples when browser storage is unavailable. */ }
      const supabase = createSupabaseBrowserClient();
      if (supabase) {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            const { data: rows } = await supabase.from("documents").select("id,name,file_type,size_label,category,excerpt,local_only,updated_at").eq("user_id", user.id).order("updated_at", { ascending: false });
            if (rows?.length) {
              const remote = rows.map((row): WorkspaceDocument => ({ id: row.id, name: row.name, type: row.file_type as WorkspaceDocument["type"], size: row.size_label, category: row.category, excerpt: row.excerpt, localOnly: row.local_only, updatedAt: row.updated_at }));
              const remoteIds = new Set(remote.map((item) => item.id));
              localDocuments = [...localDocuments.filter((item) => !remoteIds.has(item.id)), ...remote];
            }
          }
        } catch { /* Keep local documents visible when Supabase is offline. */ }
      }
      if (!cancelled) { setDocuments(localDocuments); setReady(true); }
    }
    void loadDocuments();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem(storageKey, JSON.stringify(documents));
    const supabase = createSupabaseBrowserClient();
    if (!supabase) return;
    const timeout = window.setTimeout(() => void (async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser(); if (!user) return;
        const removeStale = supabase.from("documents").delete().eq("user_id", user.id);
        if (documents.length) await removeStale.not("id", "in", `(${documents.map((item) => item.id).join(",")})`); else await removeStale;
        const rows = documents.map((item) => ({ id: item.id, user_id: user.id, name: item.name, file_type: item.type, size_label: item.size, category: item.category, excerpt: item.excerpt, local_only: Boolean(item.localOnly), updated_at: item.updatedAt }));
        if (rows.length) await supabase.from("documents").upsert(rows, { onConflict: "user_id,id" });
      } catch { /* The browser copy remains the fallback when database sync is offline. */ }
    })(), 500);
    return () => window.clearTimeout(timeout);
  }, [documents, ready]);

  const filtered = useMemo(() => documents.filter((item) => {
    const matchesQuery = `${item.name} ${item.category} ${item.type}`.toLowerCase().includes(query.trim().toLowerCase());
    return matchesQuery && (filter === "All types" || item.type === filter);
  }).sort((a, b) => sort === "name" ? a.name.localeCompare(b.name) : new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()), [documents, filter, query, sort]);

  const addFiles = (files: FileList | File[]) => {
    const supported = Array.from(files).filter((file) => ["pdf", "docx", "txt", "csv"].includes(file.name.split(".").pop()?.toLowerCase() ?? ""));
    const unsupportedCount = files.length - supported.length;
    if (supported.length) {
      const added = supported.map((file, index): WorkspaceDocument => ({ id: `local-${Date.now()}-${index}`, name: file.name, type: getFileType(file.name), size: formatSize(file.size), updatedAt: new Date().toISOString(), category: "Added to this browser", excerpt: "This file is listed locally. It has not been uploaded or processed.", localOnly: true }));
      setDocuments((current) => [...added, ...current]);
      setNotice(`${supported.length} file${supported.length === 1 ? "" : "s"} added to this browser. File upload and processing are not connected yet.`);
      window.setTimeout(() => setNotice(""), 5000);
    }
    if (unsupportedCount) {
      setNotice(`${unsupportedCount} unsupported file${unsupportedCount === 1 ? "" : "s"}. Choose PDF, DOCX, TXT, or CSV.`);
      window.setTimeout(() => setNotice(""), 5000);
    }
  };

  const onDrop = (event: DragEvent<HTMLDivElement>) => { event.preventDefault(); setDragging(false); addFiles(event.dataTransfer.files); };
  const saveRename = (event: FormEvent, id: string) => { event.preventDefault(); const name = editName.trim(); if (name) setDocuments((current) => current.map((item) => item.id === id ? { ...item, name } : item)); setEditingId(""); };
  const deleteDocument = (id: string) => setDocuments((current) => current.filter((item) => item.id !== id));

  return <div className="mx-auto max-w-6xl">
    <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="mb-2 font-mono text-xs tracking-wide text-app-faint">YOUR WORKSPACE</p><h1 className="m-0 font-display text-2xl font-semibold tracking-tight text-app-text sm:text-3xl">Documents</h1><p className="mb-0 mt-2 text-sm text-app-muted">Keep useful context close at hand.</p></div><button onClick={() => inputRef.current?.click()} className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-lg bg-app-accent px-4 text-sm font-semibold text-white transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-app-accent"><Upload size={16} /> Add documents</button></div>

    <div onDragEnter={(event) => { event.preventDefault(); setDragging(true); }} onDragOver={(event) => event.preventDefault()} onDragLeave={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setDragging(false); }} onDrop={onDrop} className={`mb-5 flex min-h-28 flex-col items-center justify-center rounded-xl border border-dashed px-4 py-5 text-center transition-colors ${dragging ? "border-app-accent bg-app-accent-soft" : "border-app-line-strong bg-app-panel hover:border-app-accent/60"}`}>
      <input ref={inputRef} type="file" multiple accept=".pdf,.docx,.txt,.csv" className="sr-only" aria-label="Choose documents" onChange={(event) => { if (event.target.files) addFiles(event.target.files); event.target.value = ""; }} />
      <span className="mb-2 grid h-8 w-8 place-items-center rounded-lg bg-app-accent-soft text-app-accent"><FileUp size={17} /></span><p className="m-0 text-sm font-medium text-app-text">Drop files here or <button onClick={() => inputRef.current?.click()} className="font-semibold text-app-accent underline-offset-2 hover:underline">browse</button></p><p className="mb-0 mt-1 text-xs text-app-muted">PDF, DOCX, TXT, or CSV · Demo mode adds a local listing only</p>
    </div>

    {notice && <div role="status" className="mb-4 flex items-start justify-between gap-3 rounded-lg border border-app-line bg-app-accent-soft px-3 py-2.5 text-sm text-app-text"><span>{notice}</span><button onClick={() => setNotice("")} aria-label="Dismiss notice" className="text-app-muted hover:text-app-text"><X size={16} /></button></div>}

    <section className="overflow-hidden rounded-xl border border-app-line bg-app-panel">
      <div className="flex flex-col gap-3 border-b border-app-line p-3 sm:flex-row sm:items-center sm:justify-between sm:px-4"><div><h2 className="m-0 font-display text-base font-semibold text-app-text">Your library <span className="ml-1 font-body text-sm font-normal text-app-faint">{documents.length}</span></h2></div><div className="flex flex-wrap items-center gap-2"><label className="flex h-9 min-w-40 flex-1 items-center gap-2 rounded-md border border-app-line bg-app-bg px-2.5 sm:flex-none"><Search size={15} className="text-app-faint" /><span className="sr-only">Search documents</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search documents" className="min-w-0 flex-1 bg-transparent text-sm text-app-text outline-none placeholder:text-app-faint" /></label><Dropdown ariaLabel="Filter documents by file type" value={filter} onChange={setFilter} triggerClassName="h-9 rounded-md px-2.5" options={["All types", "PDF", "DOCX", "TXT", "CSV"].map((type) => ({ value: type, label: type }))} /><Dropdown ariaLabel="Sort documents" value={sort} onChange={(value) => setSort(value as "recent" | "name")} triggerClassName="h-9 rounded-md px-2.5" options={[{ value: "recent", label: "Recent" }, { value: "name", label: "Name (A–Z)" }]} /></div></div>
      {filtered.length ? <ul className="m-0 list-none divide-y divide-app-line p-0">{filtered.map((item) => <li key={item.id} className="group flex min-w-0 items-center gap-3 px-3 py-3.5 transition-colors hover:bg-app-bg/70 sm:px-4">
        <DocumentIcon type={item.type} />
        <div className="min-w-0 flex-1">{editingId === item.id ? <form onSubmit={(event) => saveRename(event, item.id)} className="flex items-center gap-2"><input autoFocus value={editName} onChange={(event) => setEditName(event.target.value)} onKeyDown={(event) => { if (event.key === "Escape") setEditingId(""); }} aria-label="Document name" className="h-8 min-w-0 flex-1 rounded border border-app-line bg-app-bg px-2 text-sm text-app-text outline-none focus:border-app-accent" /><button type="submit" className="text-sm font-medium text-app-accent">Save</button></form> : <Link href={`/app/documents/${item.id}`} className="block truncate text-sm font-semibold text-app-text hover:text-app-accent">{item.name}</Link>}<div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-app-muted"><span>{item.type}</span><span aria-hidden="true">·</span><span>{item.size}</span><span aria-hidden="true">·</span><span>{item.localOnly ? "Local listing only" : item.updatedAt}</span>{item.localOnly && <span className="rounded bg-app-accent-soft px-1.5 py-0.5 text-app-accent">Not uploaded</span>}</div></div>
        <div className="flex shrink-0 items-center gap-0.5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100"><button onClick={() => { setEditingId(item.id); setEditName(item.name); }} className="grid h-8 w-8 place-items-center rounded-md text-app-muted hover:bg-app-accent-soft hover:text-app-text" aria-label={`Rename ${item.name}`} title="Rename"><Pencil size={14} /></button><button onClick={() => deleteDocument(item.id)} className="grid h-8 w-8 place-items-center rounded-md text-app-muted hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950/40 dark:hover:text-red-300" aria-label={`Delete ${item.name}`} title="Remove"><Trash2 size={14} /></button><Link href={`/app/documents/${item.id}`} className="grid h-8 w-8 place-items-center rounded-md text-app-muted hover:bg-app-accent-soft hover:text-app-accent" aria-label={`Preview ${item.name}`} title="Preview"><ArrowRight size={15} /></Link></div>
      </li>)}</ul> : <div className="px-5 py-14 text-center"><span className="mx-auto grid h-10 w-10 place-items-center rounded-full bg-app-accent-soft text-app-accent"><FolderOpen size={19} /></span><h3 className="mb-1 mt-3 font-display text-base font-semibold text-app-text">No documents found</h3><p className="mb-0 text-sm text-app-muted">Try another search or file type.</p></div>}
    </section>
    <p className="mb-0 mt-3 text-xs leading-5 text-app-faint">This demo stores document names in your browser. Files are not uploaded, previewed, or processed.</p>
  </div>;
}
