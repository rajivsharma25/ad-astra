import Link from "next/link";
import { Activity, ArrowUpRight, BookOpenText, MessagesSquare, Sparkles, Timer, Zap } from "lucide-react";
import { UsageChartLoader } from "@/components/dashboard/usage-chart-loader";
import { dashboardStats } from "@/data/dashboard";

const summaries = [
  { label: "Conversations", value: dashboardStats[0].value, detail: "Across your workspace", icon: MessagesSquare },
  { label: "AI messages", value: dashboardStats[1].value, detail: dashboardStats[1].delta, icon: Sparkles },
  { label: "Tokens used", value: "34.8K", detail: "Sample usage total", icon: Zap },
  { label: "Avg. conversation", value: "7.8", detail: "Messages per conversation", icon: Timer },
  { label: "Active days", value: "5 of 7", detail: "This week", icon: Activity },
  { label: "Documents", value: dashboardStats[2].value, detail: "Available in your library", icon: BookOpenText },
];

const popularPrompts = [
  { id: "weekly-focus", name: "Plan a focused week", uses: 18 },
  { id: "clear-writing", name: "Make this clearer", uses: 12 },
  { id: "launch-message", name: "Find the launch story", uses: 9 },
];

export default function AnalyticsPage() {
  return <div className="mx-auto max-w-6xl"><div className="mb-6"><p className="mb-2 font-mono text-xs tracking-wide text-app-faint">YOUR PERSPECTIVE</p><h1 className="m-0 font-display text-2xl font-semibold tracking-tight text-app-text sm:text-3xl">Workspace analytics</h1><p className="mb-0 mt-2 text-sm text-app-muted">A clearer view of how your workspace is being used.</p></div><div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{summaries.map(({ label, value, detail, icon: Icon }) => <section key={label} className="rounded-xl border border-app-line bg-app-panel p-4"><span className="grid h-9 w-9 place-items-center rounded-lg bg-app-accent-soft text-app-accent"><Icon size={17}/></span><p className="mb-1 mt-4 text-sm text-app-muted">{label}</p><div className="flex items-end justify-between gap-2"><strong className="font-display text-2xl font-semibold text-app-text">{value}</strong><span className="text-xs text-app-muted">{detail}</span></div></section>)}</div><UsageChartLoader/><section className="mt-4 rounded-xl border border-app-line bg-app-panel p-4 sm:p-5"><div className="mb-3 flex items-center justify-between gap-3"><div><p className="mb-1 font-mono text-xs tracking-wide text-app-faint">PROMPT LIBRARY</p><h2 className="m-0 font-display text-base font-semibold text-app-text">Most used prompts</h2></div><Link href="/app/prompts" className="text-sm font-medium text-app-accent">Browse prompts</Link></div><ol className="m-0 list-none divide-y divide-app-line p-0">{popularPrompts.map((prompt, index) => <li key={prompt.id} className="flex items-center gap-3 py-3"><span className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-app-bg font-mono text-xs text-app-faint">0{index + 1}</span><Link href={`/app/prompts/${prompt.id}`} className="min-w-0 flex-1 truncate text-sm font-medium text-app-text hover:text-app-accent">{prompt.name}</Link><span className="w-24 shrink-0 text-right text-xs text-app-muted sm:w-32">{prompt.uses} uses</span></li>)}</ol></section><p className="mb-0 mt-3 text-xs text-app-faint"><ArrowUpRight size={12} className="mr-1 inline"/>Usage figures are illustrative demo data and are not yet connected to account telemetry.</p></div>;
}
