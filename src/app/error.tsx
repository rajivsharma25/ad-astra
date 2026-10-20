"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error("Application route failed", error); }, [error]);
  return <main className="grid min-h-screen place-items-center bg-app-bg px-5 py-10"><section className="w-full max-w-md rounded-2xl border border-app-line bg-app-panel p-7 text-center shadow-sm"><span className="mx-auto grid h-11 w-11 place-items-center rounded-xl bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300"><AlertTriangle size={20}/></span><h1 className="mb-2 mt-4 font-display text-xl font-semibold text-app-text">This page ran into a problem</h1><p className="mb-5 mt-0 text-sm leading-6 text-app-muted">Your work is still here. Try loading the page again.</p><button onClick={reset} className="inline-flex h-10 items-center gap-2 rounded-lg bg-app-accent px-4 text-sm font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-app-accent"><RefreshCw size={15}/> Try again</button>{error.digest && <p className="mb-0 mt-4 text-xs text-app-faint">Reference: {error.digest}</p>}</section></main>;
}
