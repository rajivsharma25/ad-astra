"use client";

import { useEffect } from "react";
import "./globals.css";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error("Root application error", error); }, [error]);
  return <html lang="en"><body className="grid min-h-screen place-items-center bg-stone-50 p-6 font-sans text-stone-900 dark:bg-stone-950 dark:text-stone-100"><main className="max-w-md text-center"><h1 className="text-2xl font-semibold">Ad Astra couldn’t load this page</h1><p className="my-3 text-sm text-stone-600 dark:text-stone-300">Please try again. If the problem continues, reload the app.</p><button onClick={reset} className="rounded-lg bg-stone-900 px-4 py-2 text-sm font-semibold text-white dark:bg-stone-100 dark:text-stone-900">Try again</button></main></body></html>;
}
