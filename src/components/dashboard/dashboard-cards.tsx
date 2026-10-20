import Link from "next/link";
import { ArrowRight, ArrowUpRight, Clock3, FileText, FolderOpen, MessageSquareText, MoreHorizontal, Zap, type LucideIcon } from "lucide-react";
import type { DashboardIconName, DashboardStat, RecentActivityItem, RecentWorkspaceItem } from "@/data/dashboard";

const dashboardIcons: Record<DashboardIconName, LucideIcon> = {
  conversation: MessageSquareText,
  messages: Zap,
  documents: FolderOpen,
  document: FileText,
};

function DashboardIcon({ name, size = 16 }: { name: DashboardIconName; size?: number }) {
  const Icon = dashboardIcons[name];
  return <Icon size={size} aria-hidden="true" />;
}

export function DashboardStatCard({ stat }: { stat: DashboardStat }) {
  return (
    <article className="flex min-h-[122px] min-w-0 flex-col items-start rounded-lg border border-app-line bg-app-panel p-2.5 sm:p-3.5">
      <div className="flex w-full items-center justify-between text-app-faint">
        <span className={`grid h-8 w-8 place-items-center rounded-lg ${stat.tone}`}><DashboardIcon name={stat.icon} /></span>
        <MoreHorizontal size={18} aria-hidden="true" />
      </div>
      <b className="mt-2 font-display text-2xl font-semibold tracking-tight">{stat.value}</b>
      <span className="mt-0.5 text-xs text-app-muted sm:text-sm">{stat.label}</span>
      <span className="mt-2 text-xs text-green-800 dark:text-green-300"><ArrowUpRight className="mr-0.5 inline" size={13} aria-hidden="true" />{stat.delta}</span>
    </article>
  );
}

export function RecentWorkspaceCard({ items }: { items: RecentWorkspaceItem[] }) {
  return (
    <section className="mt-3 rounded-lg border border-app-line bg-app-panel p-3.5 sm:p-4">
      <div className="flex items-center justify-between">
        <div><span className="font-mono text-xs tracking-wide text-app-faint">PICK UP WHERE YOU LEFT OFF</span><h3 className="mt-1 font-display text-base font-semibold">Recently in your workspace</h3></div>
        <Link href="/app/chat" className="inline-flex items-center gap-1.5 text-xs text-app-muted">See all <ArrowRight size={14} aria-hidden="true" /></Link>
      </div>
      <div className="mt-3">
        {items.map((item) => (
          <Link href={item.href} key={item.title} className="flex min-w-0 items-center gap-2 border-t border-app-line py-2.5 sm:gap-3">
            <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-md ${item.color}`}><DashboardIcon name={item.icon} size={17} /></span>
            <span className="min-w-0 flex-1"><b className="block overflow-hidden text-ellipsis whitespace-nowrap text-sm font-semibold">{item.title}</b><small className="mt-1 block overflow-hidden text-ellipsis whitespace-nowrap text-xs text-app-faint">{item.text}</small></span>
            <span className="hidden rounded bg-app-bg px-1.5 py-1 font-mono text-xs text-app-faint md:block">{item.category}</span>
            <span className="hidden shrink-0 items-center gap-1 text-xs text-app-muted sm:flex"><Clock3 size={13} aria-hidden="true" />{item.time}</span>
            <ArrowRight className="shrink-0 text-app-faint" size={15} aria-hidden="true" />
          </Link>
        ))}
      </div>
    </section>
  );
}

export function ActivityList({ items }: { items: RecentActivityItem[] }) {
  return <section className="mt-3 rounded-lg border border-app-line bg-app-panel p-3.5 sm:p-4"><div className="mb-2"><span className="font-mono text-xs tracking-wide text-app-faint">WHAT’S BEEN HAPPENING</span><h3 className="mt-1 font-display text-base font-semibold">Recent activity</h3></div><ul className="m-0 list-none p-0">{items.map((item) => <li key={item.id} className="border-t border-app-line"><Link href={item.href} className="flex min-w-0 items-center gap-3 py-2.5 focus-visible:outline-2 focus-visible:outline-app-accent"><span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-app-accent-soft text-app-accent"><DashboardIcon name={item.icon} size={15}/></span><span className="min-w-0 flex-1"><b className="block truncate text-sm font-medium text-app-text">{item.title}</b><small className="mt-0.5 block truncate text-xs text-app-muted">{item.detail}</small></span><time className="shrink-0 text-xs text-app-faint">{item.time}</time></Link></li>)}</ul></section>;
}
