import Link from "next/link";
import { ArrowRight, ArrowUpRight, AudioLines, BookOpenText, FolderOpen, Plus, Sparkles } from "lucide-react";
import { dashboardStats, recentActivity, recentWorkspaceItems, starterPrompts } from "@/data/dashboard";
import { ActivityList, DashboardStatCard, RecentWorkspaceCard } from "@/components/dashboard/dashboard-cards";
import { UsageChartLoader } from "@/components/dashboard/usage-chart-loader";

export default function DashboardPage() {
  const today = new Intl.DateTimeFormat("en", { weekday: "long", month: "long", day: "numeric" }).format(new Date()).toUpperCase();
  return (
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-end">
          <div><div className="font-mono text-xs tracking-wide text-app-faint">{today}</div><h1 className="my-2 font-display text-2xl font-semibold tracking-tight sm:text-3xl">Good morning, Jordan <span className="text-xl text-orange-800">✳</span></h1><p className="m-0 text-sm text-app-muted">A clear head is a good place to start. What’s on your mind?</p></div>
          <Link href="/app/chat?new=1" className="inline-flex h-10 items-center gap-2 rounded-lg bg-neutral-800 px-4 text-sm font-semibold text-white transition-colors hover:bg-neutral-700"><Plus size={16}/> Start a conversation</Link>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_270px]">
          <div className="min-w-0">
            <section className="grid min-h-[203px] grid-cols-[minmax(0,1fr)_0.65fr] overflow-hidden rounded-lg border border-app-line bg-app-accent-soft">
              <div className="z-10 p-4 sm:p-6"><span className="inline-flex items-center gap-1.5 rounded-full border border-app-line bg-app-panel px-2 py-1 font-mono text-xs tracking-wide text-app-accent"><Sparkles size={14}/> YOUR SPACE, YOUR PACE</span><h2 className="my-3 font-display text-2xl font-semibold leading-tight tracking-tight">Make room for<br/><em className="not-italic text-app-accent">what matters.</em></h2><p className="mb-3 max-w-[290px] text-sm leading-5 text-app-muted">Bring a question, a rough draft, or just a place to begin. We’ll figure out the next step together.</p><Link href="/app/chat?new=1" className="inline-flex items-center gap-1.5 text-sm font-semibold text-app-accent">Start with a thought <ArrowRight size={15}/></Link></div>
              <div className="relative hidden overflow-hidden sm:block"><div className="absolute right-0 bottom-0 h-[203px] w-full"><div className="absolute top-6 right-6 h-[153px] w-[153px] rounded-full bg-purple-200"/><div className="absolute top-[84px] right-[53px] h-28 w-[119px] rounded-t-[70%] bg-purple-300"/><div className="absolute top-[93px] right-0 h-[120px] w-20 rounded-tl-full bg-purple-400"/><span className="absolute top-8 right-36 text-xl text-purple-600">✳</span><span className="absolute right-9 top-12 text-sm text-amber-800">✳</span><div className="absolute right-5 bottom-3 flex items-center gap-1.5 rounded border border-app-line bg-app-panel/90 px-2 py-1.5 text-xs text-app-muted"><AudioLines size={14}/> ready when you are</div></div></div>
            </section>

            <section className="my-3 grid grid-cols-3 gap-2 sm:gap-3">
              {dashboardStats.map((stat) => <DashboardStatCard key={stat.label} stat={stat} />)}
            </section>

            <UsageChartLoader />

            <RecentWorkspaceCard items={recentWorkspaceItems} />
            <ActivityList items={recentActivity} />
          </div>

          <aside className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:flex lg:flex-col">
            <section className="rounded-lg border border-app-line bg-app-panel p-4 sm:row-span-2 lg:row-span-1"><div className="flex items-center justify-between"><span className="font-mono text-xs tracking-wide text-app-faint">A GOOD PLACE TO BEGIN</span><span className="grid h-6 w-6 place-items-center rounded-md bg-app-accent-soft text-app-accent"><Sparkles size={15}/></span></div><h3 className="mt-2 font-display text-base font-semibold">Need a starting point?</h3><p className="my-1.5 text-sm leading-5 text-app-muted">A few thoughtful prompts to get the ideas flowing.</p><div className="border-t border-app-line">{starterPrompts.map((prompt, i) => <Link href="/app/chat?new=1" key={prompt.title} className="flex items-center gap-2 border-b border-app-line py-2.5"><span className="font-mono text-xs text-app-faint">0{i + 1}</span><span className="flex-1"><b className="block text-sm font-semibold">{prompt.title}</b><small className="mt-0.5 block text-xs text-app-muted">{prompt.sub}</small></span><ArrowUpRight size={14} className="text-app-faint"/></Link>)}</div><Link href="/app/prompts" className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-app-accent">Explore the prompt library <ArrowRight size={13}/></Link></section>
            <section className="relative min-h-40 overflow-hidden rounded-lg border border-orange-100 bg-orange-50 p-4 dark:border-stone-700 dark:bg-stone-900"><span className="mb-2.5 grid h-7 w-7 place-items-center rounded-md bg-white/80 text-orange-900 dark:bg-stone-800 dark:text-orange-200"><BookOpenText size={16}/></span><span className="font-mono text-xs tracking-wide text-app-faint">A SMALL TIP</span><p className="my-2 max-w-[210px] font-display text-sm font-medium leading-5 text-stone-700 dark:text-stone-200">Drop a document into your workspace and ask a question. You don’t have to read the whole thing first.</p><Link href="/app/documents" className="inline-flex items-center gap-1.5 text-xs font-semibold text-orange-900 dark:text-orange-200">Bring in a document <ArrowRight size={13}/></Link><span className="absolute -right-1 -bottom-6 text-8xl leading-none text-orange-100 dark:text-stone-800">✳</span></section>
            <section className="grid grid-cols-[28px_1fr] items-center gap-x-2 rounded-lg border border-app-line bg-app-panel p-3"><span className="row-span-2 grid h-7 w-7 place-items-center rounded-md bg-app-accent-soft text-app-accent"><FolderOpen size={15}/></span><b className="text-sm">Your workspace</b><small className="mt-0.5 text-xs text-app-muted">8 of 20 documents</small><span className="col-start-2 mt-2 h-1 rounded-full bg-app-bg"><i className="block h-full w-2/5 rounded-full bg-app-accent"/></span></section>
          </aside>
        </div>
      </div>
  );
}
