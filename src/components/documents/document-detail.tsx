"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, ArrowUpRight, File, FileSpreadsheet, FileText, Info } from "lucide-react";
import { initialDocuments, type WorkspaceDocument } from "@/data/workspace";

export function DocumentDetail({ documentId }: { documentId: string }) {
  const [document, setDocument] = useState<WorkspaceDocument | null>(() => initialDocuments.find((item) => item.id === documentId) ?? null);
  useEffect(() => {
    try {
      const saved = localStorage.getItem("ad-astra-documents-v1");
      if (!saved) return;
      const items = JSON.parse(saved) as WorkspaceDocument[];
      setDocument(items.find((item) => item.id === documentId) ?? null);
    } catch { /* Keep the bundled mock document, if present. */ }
  }, [documentId]);

  if (!document) return <div className="mx-auto max-w-4xl"><Link href="/app/documents" className="inline-flex items-center gap-2 text-sm text-app-muted hover:text-app-text"><ArrowLeft size={15} /> Back to documents</Link><section className="mt-5 rounded-xl border border-app-line bg-app-panel px-5 py-14 text-center"><h1 className="m-0 font-display text-xl font-semibold text-app-text">Document not found</h1><p className="mb-0 mt-2 text-sm text-app-muted">It may have been removed from this browser.</p></section></div>;

  const Icon = document.type === "CSV" ? FileSpreadsheet : document.type === "PDF" ? File : FileText;
  return <div className="mx-auto max-w-4xl"><Link href="/app/documents" className="inline-flex items-center gap-2 text-sm text-app-muted transition-colors hover:text-app-text"><ArrowLeft size={15} /> All documents</Link>
    <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_260px]">
      <section className="overflow-hidden rounded-xl border border-app-line bg-app-panel"><header className="flex items-center gap-3 border-b border-app-line p-4 sm:p-5"><span className="grid h-11 w-11 place-items-center rounded-lg bg-app-accent-soft text-app-accent"><Icon size={21} /></span><div className="min-w-0"><p className="mb-1 font-mono text-xs tracking-wide text-app-faint">{document.type} DOCUMENT</p><h1 className="m-0 truncate font-display text-lg font-semibold text-app-text sm:text-xl">{document.name}</h1></div></header><div className="min-h-[360px] bg-app-bg/60 p-5 sm:p-8"><article className="mx-auto max-w-2xl rounded-lg border border-app-line bg-app-panel p-5 shadow-sm sm:p-8"><h2 className="mb-4 mt-0 font-display text-xl font-semibold text-app-text">{document.name.replace(/\.[^.]+$/, "")}</h2><p className="text-sm leading-7 text-app-muted">{document.excerpt}</p><div className="mt-8 border-t border-app-line pt-4"><p className="mb-1 font-mono text-xs tracking-wide text-app-faint">PREVIEW</p><p className="m-0 text-sm leading-7 text-app-muted">This text is a sample preview for the interface. Document extraction and file processing are not connected in this demo.</p></div></article></div></section>
      <aside className="h-fit rounded-xl border border-app-line bg-app-panel p-4"><h2 className="mb-4 mt-0 font-display text-base font-semibold text-app-text">File details</h2><dl className="m-0 space-y-3 text-sm"><div><dt className="text-xs text-app-faint">Type</dt><dd className="mb-0 mt-0.5 text-app-text">{document.type}</dd></div><div><dt className="text-xs text-app-faint">Size</dt><dd className="mb-0 mt-0.5 text-app-text">{document.size}</dd></div><div><dt className="text-xs text-app-faint">Added</dt><dd className="mb-0 mt-0.5 text-app-text">{document.localOnly ? "Local listing" : document.updatedAt}</dd></div><div><dt className="text-xs text-app-faint">Folder</dt><dd className="mb-0 mt-0.5 text-app-text">{document.category}</dd></div></dl><div className="my-4 flex gap-2 rounded-lg bg-app-accent-soft p-3"><Info size={15} className="mt-0.5 shrink-0 text-app-accent" /><p className="m-0 text-xs leading-5 text-app-muted">{document.localOnly ? "This file is listed in your browser only. Its contents are not attached or analyzed." : "This page contains a sample preview. The full file has not been uploaded or analyzed."}</p></div>{document.localOnly ? <Link href={`/app/chat?new=1&prompt=${encodeURIComponent(`Help me prepare useful questions for a document named ${document.name}. The document contents are not available yet.`)}`} className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-app-accent px-3 text-sm font-semibold text-white hover:opacity-90">Plan questions <ArrowUpRight size={14} /></Link> : <div className="space-y-2"><Link href={`/app/chat?new=1&prompt=${encodeURIComponent(`Using only this sample preview from ${document.name}, help me answer questions about the document. Be clear when the excerpt does not contain enough information.\n\nSample preview:\n${document.excerpt}`)}`} className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-app-accent px-3 text-sm font-semibold text-white hover:opacity-90">Ask about this preview <ArrowUpRight size={14} /></Link><Link href={`/app/chat?new=1&prompt=${encodeURIComponent(`Summarize only this sample preview from ${document.name}. Note that it may not represent the complete document.\n\nSample preview:\n${document.excerpt}`)}`} className="inline-flex h-9 w-full items-center justify-center gap-2 rounded-md border border-app-line px-3 text-sm font-semibold text-app-text hover:bg-app-accent-soft">Summarize preview</Link></div>}</aside>
    </div>
  </div>;
}
