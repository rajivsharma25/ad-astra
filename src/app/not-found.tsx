import Link from "next/link";
import { ArrowLeft, Search } from "lucide-react";

export default function NotFound() {
  return <main className="grid min-h-[70vh] place-items-center px-5 py-12"><section className="max-w-md text-center"><span className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-app-accent-soft text-app-accent"><Search size={20}/></span><p className="mb-2 mt-5 font-mono text-xs tracking-wide text-app-faint">404 · PAGE NOT FOUND</p><h1 className="m-0 font-display text-2xl font-semibold text-app-text">We couldn’t find that page.</h1><p className="mb-5 mt-2 text-sm leading-6 text-app-muted">The link may be old, or the page may have moved.</p><Link href="/app" className="inline-flex h-10 items-center gap-2 rounded-lg bg-app-accent px-4 text-sm font-semibold text-white"><ArrowLeft size={15}/> Back to your workspace</Link></section></main>;
}
