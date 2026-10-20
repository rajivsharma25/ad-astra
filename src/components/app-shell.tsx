"use client";

import Link from "next/link";
import { Fragment, useEffect, useState, type KeyboardEvent as ReactKeyboardEvent } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Activity, ArrowUpRight, Bell, BookOpenText, ChevronDown, FileText, LayoutDashboard, LogOut, Menu, MessageSquareText, MoreHorizontal, PanelLeftClose, PanelLeftOpen, Plus, Search, Settings2, Sparkles, Star, X } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { initialConversations, type ChatConversation } from "@/data/chat";

const conversationsKey = "ad-astra-chat-conversations-v1";
const conversationsUpdatedEvent = "ad-astra-conversations-updated";

function getSavedConversations() {
  try {
    const value = localStorage.getItem(conversationsKey);
    const parsed: unknown = value ? JSON.parse(value) : initialConversations;
    return Array.isArray(parsed) ? parsed as ChatConversation[] : initialConversations;
  } catch { return initialConversations; }
}

const groups = [
  { label: "YOUR WORKSPACE", items: [{ label: "Home", href: "/app", icon: LayoutDashboard }, { label: "Conversations", href: "/app/chat", icon: MessageSquareText }, { label: "Documents", href: "/app/documents", icon: FileText }, { label: "Prompt library", href: "/app/prompts", icon: BookOpenText }] },
  { label: "YOUR PERSPECTIVE", items: [{ label: "Analytics", href: "/app/analytics", icon: Activity }] },
  { label: "A FEW MORE THINGS", items: [{ label: "Search", href: "/app/search", icon: Search }, { label: "Settings", href: "/app/settings", icon: Settings2 }] },
];

const iconButton = "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-app-muted transition-colors hover:bg-app-accent-soft hover:text-app-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-app-accent";

export function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const active = pathname.startsWith("/app/chat") ? "Conversations"
    : pathname.startsWith("/app/documents") ? "Documents"
    : pathname.startsWith("/app/prompts") ? "Prompt library"
    : pathname.startsWith("/app/analytics") ? "Analytics"
    : pathname.startsWith("/app/search") ? "Search"
    : pathname.startsWith("/app/settings") ? "Settings"
    : "Home";
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [conversationQuery, setConversationQuery] = useState("");

  useEffect(() => {
    const refresh = () => setConversations(getSavedConversations());
    refresh();
    window.addEventListener(conversationsUpdatedEvent, refresh);
    window.addEventListener("storage", refresh);
    return () => { window.removeEventListener(conversationsUpdatedEvent, refresh); window.removeEventListener("storage", refresh); };
  }, []);

  const saveConversations = (next: ChatConversation[]) => {
    setConversations(next);
    localStorage.setItem(conversationsKey, JSON.stringify(next));
    window.dispatchEvent(new Event(conversationsUpdatedEvent));
  };

  const updateConversation = (id: string, update: (item: ChatConversation) => ChatConversation) => saveConversations(conversations.map((item) => item.id === id ? update(item) : item));
  const removeConversation = async (id: string) => {
    saveConversations(conversations.filter((item) => item.id !== id));
    const supabase = createSupabaseBrowserClient();
    if (supabase) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) await supabase.from("conversations").delete().eq("user_id", user.id).eq("id", id);
    }
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        router.push("/app/search");
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [router]);

  return (
    <div className="flex min-h-screen bg-app-bg">
      <a href="#main-content" className="fixed left-3 top-3 z-[100] -translate-y-20 rounded-md bg-app-text px-3 py-2 text-sm font-semibold text-app-panel focus:translate-y-0">Skip to content</a>
      {open && <button aria-label="Close navigation overlay" className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={() => setOpen(false)} />}
      <aside className={`ad-astra-sidebar-scroll fixed inset-y-0 left-0 z-40 flex h-dvh w-[min(280px,84vw)] flex-col overflow-y-auto border-r border-app-line bg-app-bg px-3 py-5 transition-[transform,width] duration-200 lg:sticky lg:top-0 lg:z-20 lg:h-screen lg:translate-x-0 lg:shrink-0 ${collapsed ? "lg:w-[76px]" : "lg:w-[260px]"} ${open ? "translate-x-0 shadow-2xl" : "-translate-x-full lg:shadow-none"}`}>
        <div className="flex shrink-0 items-center justify-between px-2 pb-6">
          <Link href="/" aria-label="Ad Astra home" title={collapsed ? "Ad Astra" : undefined} className="inline-flex shrink-0 items-center gap-2 whitespace-nowrap font-display text-xl font-semibold tracking-[-1.2px] text-app-text"><span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-app-accent-soft text-app-accent"><Sparkles size={16} /></span><span className={collapsed ? "md:hidden" : ""}>ad astra<span className="-ml-2 text-app-accent">.</span></span></Link>
          <div className="lg:hidden"><button className={iconButton} onClick={() => setOpen(false)} aria-label="Close navigation"><X size={18} /></button></div>
        </div>

        <Link href="/app/chat?new=1" title={collapsed ? "New conversation" : undefined} aria-label="New conversation" onClick={() => setOpen(false)} className={`group flex min-h-11 w-full min-w-0 shrink-0 items-center gap-2 whitespace-nowrap rounded-lg border border-app-line-strong bg-app-panel px-2.5 text-sm font-semibold text-app-text shadow-sm transition-colors hover:border-app-accent hover:bg-app-accent-soft ${collapsed ? "lg:justify-center lg:gap-0 lg:px-0" : ""}`}>
          <span className="grid h-[22px] w-[22px] shrink-0 place-items-center rounded-md bg-app-accent-soft text-app-accent"><Plus size={16} /></span>
          <span className={`min-w-0 flex-1 overflow-hidden text-ellipsis ${collapsed ? "lg:hidden" : ""}`}>New conversation</span><kbd className={`shrink-0 rounded border border-app-line px-1 py-0.5 font-mono text-xs font-normal text-app-faint ${collapsed ? "lg:hidden" : ""}`}>⌘K</kbd>
        </Link>

        <nav className={`mt-4 shrink-0 ${collapsed ? "lg:mt-5" : ""}`} aria-label="Main navigation">
          {groups.map((group) => (
            <div className={`mb-4 ${collapsed ? "lg:mb-3" : ""}`} key={group.label}>
              <span className={`block px-2 pb-2 font-mono text-xs tracking-wide text-app-faint ${collapsed ? "lg:hidden" : ""}`}>{group.label}</span>
              {group.items.map((item) => (
                <Fragment key={item.label}>
                  <Link href={item.href} aria-current={active === item.label ? "page" : undefined} title={collapsed ? item.label : undefined} onClick={() => setOpen(false)} className={`my-0.5 flex h-9 items-center gap-2.5 rounded-md px-2 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-app-accent ${collapsed ? "lg:justify-center lg:gap-0 lg:px-0" : ""} ${active === item.label ? "bg-app-accent-soft font-semibold text-app-accent" : "text-app-muted hover:bg-app-accent-soft hover:text-app-text"}`}>
                    <item.icon size={16} className={active === item.label ? "text-app-accent" : "text-app-faint"} />
                    <span className={collapsed ? "lg:sr-only" : ""}>{item.label}</span>
                    {item.label === "Conversations" && <span className={`ml-auto rounded border border-app-line bg-app-panel px-1.5 py-0.5 text-xs text-app-muted ${collapsed ? "lg:hidden" : ""}`}>{conversations.length}</span>}
                  </Link>
                  {item.label === "Conversations" && <div className={`mb-3 ml-2 border-l border-app-line pl-2 ${collapsed ? "lg:hidden" : ""}`}>
                    <label className="mb-2 flex h-8 items-center gap-2 rounded-md border border-app-line bg-app-panel px-2 text-app-muted"><Search size={13}/><span className="sr-only">Search conversations</span><input aria-label="Search conversations" placeholder="Find a conversation" className="min-w-0 flex-1 bg-transparent text-xs text-app-text outline-none placeholder:text-app-faint" onChange={(event) => { const query = event.target.value.toLowerCase(); setConversationQuery(query); }} /></label>
                    <ConversationHistory conversations={conversations} query={conversationQuery} activeId={pathname.startsWith("/app/chat/") ? decodeURIComponent(pathname.slice("/app/chat/".length)) : ""} onFavorite={(id) => updateConversation(id, (item) => ({ ...item, favorite: !item.favorite }))} onRename={(id, title) => updateConversation(id, (item) => ({ ...item, title }))} onDelete={removeConversation} onNavigate={() => setOpen(false)} />
                  </div>}
                </Fragment>
              ))}
            </div>
          ))}
        </nav>

        <div className="min-h-2 flex-1" />
        <div className={`mb-3 shrink-0 rounded-lg border border-app-line bg-app-accent-soft p-3 ${collapsed ? "lg:hidden" : ""}`}>
          <span className="mb-2 grid h-6 w-6 place-items-center rounded-lg bg-app-panel text-app-accent"><Sparkles size={15} /></span>
          <b className="font-display text-sm font-semibold text-app-text">Good things grow here.</b>
          <p className="my-1.5 text-sm leading-5 text-app-muted">Make room for your team when you’re ready.</p>
          <Link href="/app" className="flex items-center gap-1 text-sm font-semibold text-app-accent">Explore Ad Astra Plus <ArrowUpRight size={13} /></Link>
        </div>
        <div className={`shrink-0 border-t border-app-line pt-3 ${collapsed ? "lg:flex lg:justify-center" : ""}`}>
          <details className="group relative">
            <summary title={collapsed ? "Jordan Lee · Free workspace" : undefined} aria-label="Account menu" className={`flex w-full cursor-pointer list-none items-center gap-2 rounded-md p-1 text-left transition-colors hover:bg-app-accent-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-app-accent [&::-webkit-details-marker]:hidden ${collapsed ? "lg:w-auto lg:justify-center" : ""}`}>
              <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-stone-300 text-xs font-semibold text-stone-800">J</span>
              <span className={`flex-1 ${collapsed ? "lg:hidden" : ""}`}><b className="block text-sm text-app-text">Jordan Lee</b><small className="mt-0.5 block text-xs text-app-muted">Free workspace</small></span><ChevronDown size={15} className={`text-app-muted ${collapsed ? "lg:hidden" : ""}`} />
            </summary>
            <div className={`absolute bottom-full left-0 z-50 mb-2 w-full min-w-48 rounded-lg border border-app-line bg-app-panel p-1.5 shadow-xl ${collapsed ? "lg:left-full lg:bottom-0 lg:ml-2" : ""}`}><button onClick={async () => { const supabase = createSupabaseBrowserClient(); if (supabase) await supabase.auth.signOut(); sessionStorage.removeItem("ad-astra-demo-user"); router.push("/login"); router.refresh(); }} className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-sm text-app-text hover:bg-app-accent-soft"><LogOut size={15} /> Sign out</button></div>
          </details>
        </div>
      </aside>

      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center justify-between gap-2 border-b border-app-line bg-app-bg/95 px-3 backdrop-blur md:px-7">
          <div className="lg:hidden"><button className={iconButton} onClick={() => setOpen(true)} aria-label="Open navigation"><Menu size={19} /></button></div>
          <div className="hidden lg:block"><button className={iconButton} onClick={() => setCollapsed((value) => !value)} aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"} title={collapsed ? "Expand sidebar" : "Collapse sidebar"}>{collapsed ? <PanelLeftOpen size={17} /> : <PanelLeftClose size={17} />}</button></div>
          <div className="mr-auto flex items-center gap-2 text-sm text-app-faint"><span>My workspace</span><span className="text-app-line-strong">/</span><b className="font-semibold text-app-text">{active}</b></div>
          <div className="flex items-center gap-1 md:gap-3">
            <button onClick={() => router.push("/app/search")} className="flex h-8 w-8 items-center justify-center rounded-md text-app-muted transition-colors hover:bg-app-accent-soft hover:text-app-accent md:w-48 md:justify-start md:gap-2 md:border md:border-app-line md:bg-app-panel md:px-2 md:text-left md:text-xs" aria-label="Search workspace"><Search size={15} /><span className="hidden md:inline">Search anything...</span><kbd className="ml-auto hidden rounded border border-app-line px-1 py-0.5 font-mono text-xs md:inline">⌘K</kbd></button>
            <ThemeToggle />
            <button className={`${iconButton} relative max-sm:hidden`} aria-label="Notifications"><Bell size={17} /><i className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full border border-app-bg bg-orange-700" /></button>
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-stone-300 text-xs font-semibold text-stone-800">J</span>
          </div>
        </header>
        <main id="main-content" tabIndex={-1} className="mx-auto w-full max-w-7xl flex-1 px-3 py-5 outline-none sm:px-4 sm:py-6 md:px-9 md:py-9">{children}</main>
        <footer className="flex h-11 items-center justify-between border-t border-app-line px-4 text-xs text-app-faint md:px-9"><span>Made with a little more room to think <span className="text-app-accent">✳</span></span><Link href="/" className="inline-flex items-center gap-1">Back to Ad Astra <ArrowUpRight size={12} /></Link></footer>
      </div>
    </div>
  );
}

function ConversationHistory({ conversations, query, activeId, onFavorite, onRename, onDelete, onNavigate }: { conversations: ChatConversation[]; query: string; activeId: string; onFavorite: (id: string) => void; onRename: (id: string, title: string) => void; onDelete: (id: string) => void; onNavigate: () => void }) {
  const [editingId, setEditingId] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const items = conversations.filter((item) => item.title.toLowerCase().includes(query)).sort((a, b) => Number(b.favorite) - Number(a.favorite) || b.updatedAt.localeCompare(a.updatedAt));
  const finishRename = (id: string, save: boolean) => {
    const title = editTitle.trim();
    if (save && title) onRename(id, title);
    setEditingId("");
  };
  const renameKeyDown = (event: ReactKeyboardEvent<HTMLInputElement>, id: string) => {
    if (event.key === "Enter") { event.preventDefault(); finishRename(id, true); }
    if (event.key === "Escape") { event.preventDefault(); finishRename(id, false); }
  };
  if (!items.length) return <p className="m-0 px-2 py-2 text-xs text-app-faint">{query ? "No matching conversations" : "No conversations yet"}</p>;
  return <ul className="ad-astra-sidebar-scroll m-0 max-h-56 list-none space-y-0.5 overflow-y-auto p-0">{items.map((item) => <li key={item.id} className={`group flex min-w-0 items-center gap-0.5 rounded-md ${item.id === activeId ? "bg-app-accent-soft" : "hover:bg-app-panel"}`}>
    {editingId === item.id ? <input autoFocus aria-label="Rename conversation" value={editTitle} onChange={(event) => setEditTitle(event.target.value)} onBlur={() => finishRename(item.id, false)} onKeyDown={(event) => renameKeyDown(event, item.id)} className="m-1 min-w-0 flex-1 rounded border border-app-line bg-app-bg px-1.5 py-1 text-xs text-app-text outline-none focus:border-app-accent" /> : <Link href={`/app/chat/${item.id}`} onClick={onNavigate} aria-current={item.id === activeId ? "page" : undefined} className="min-w-0 flex-1 truncate rounded-md px-2 py-1.5 text-xs text-app-muted hover:text-app-text">{item.title}</Link>}
    <button onClick={() => onFavorite(item.id)} title={item.favorite ? "Remove favorite" : "Add favorite"} aria-label={item.favorite ? `Remove ${item.title} from favorites` : `Add ${item.title} to favorites`} className="grid h-7 w-7 shrink-0 place-items-center rounded text-app-faint hover:bg-app-accent-soft hover:text-amber-500"><Star size={13} className={item.favorite ? "fill-amber-500 text-amber-500" : ""}/></button>
    <details className="relative"><summary aria-label={`Actions for ${item.title}`} className="grid h-7 w-7 cursor-pointer list-none place-items-center rounded text-app-faint hover:bg-app-accent-soft hover:text-app-text [&::-webkit-details-marker]:hidden"><MoreHorizontal size={14}/></summary><div className="absolute right-0 top-7 z-50 w-32 rounded-lg border border-app-line bg-app-panel p-1 shadow-lg"><button onClick={(event) => { event.currentTarget.closest("details")?.removeAttribute("open"); setEditTitle(item.title); setEditingId(item.id); }} className="w-full rounded px-2 py-1.5 text-left text-xs text-app-text hover:bg-app-accent-soft">Rename</button><button onClick={() => onDelete(item.id)} className="w-full rounded px-2 py-1.5 text-left text-xs text-red-700 hover:bg-red-50 dark:text-red-300 dark:hover:bg-red-950/40">Delete</button></div></details>
  </li>)}</ul>;
}
