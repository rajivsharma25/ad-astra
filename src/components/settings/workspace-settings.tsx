"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { Check, Moon, Palette, Settings2, Sun, Laptop, UserRound, Sparkles, Bell } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { setAppTheme, type AppTheme } from "@/components/theme-toggle";
import { Dropdown } from "@/components/ui/dropdown";

type Preferences = { defaultModel: "Ad Astra standard" | "Ad Astra thoughtful"; responseStyle: "balanced" | "concise" | "detailed"; temperature: number; streaming: boolean };
type Notices = { email: boolean; usage: boolean; product: boolean };
export type SettingsSection = "all" | "account" | "appearance" | "ai" | "notifications";
const preferenceKey = "ad-astra-ai-preferences-v1";
const noticeKey = "ad-astra-notification-preferences-v1";
const defaults: Preferences = { defaultModel: "Ad Astra standard", responseStyle: "balanced", temperature: 0.7, streaming: true };
const defaultNotices: Notices = { email: false, usage: true, product: false };
const inputClass = "mt-1.5 block h-10 w-full rounded-lg border border-app-line bg-app-bg px-3 text-sm text-app-text outline-none focus:border-app-accent focus-visible:ring-2 focus-visible:ring-app-accent/20";

export function WorkspaceSettings({ section = "all" }: { section?: SettingsSection }) {
  const [name, setName] = useState("Jordan Lee");
  const [email, setEmail] = useState("jordan@example.com");
  const [theme, setTheme] = useState<AppTheme>("system");
  const [preferences, setPreferences] = useState<Preferences>(defaults);
  const [notices, setNotices] = useState<Notices>(defaultNotices);
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    const savedTheme = localStorage.getItem("ad-astra-theme");
    if (savedTheme === "light" || savedTheme === "dark" || savedTheme === "system") setTheme(savedTheme);
    try {
      const saved = JSON.parse(localStorage.getItem(preferenceKey) ?? "null") as Partial<Preferences> | null;
      if (saved) setPreferences({ ...defaults, ...saved });
      const savedNotices = JSON.parse(localStorage.getItem(noticeKey) ?? "null") as Partial<Notices> | null;
      if (savedNotices) setNotices({ ...defaultNotices, ...savedNotices });
    } catch { /* Keep the default preferences when local storage is unreadable. */ }
    const supabase = createSupabaseBrowserClient();
    if (supabase) void supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) { setEmail(user.email ?? ""); setName(String(user.user_metadata?.full_name ?? "") || user.email?.split("@")[0] || "Workspace member"); }
    });
  }, []);

  async function saveAccount(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setFeedback("");
    const supabase = createSupabaseBrowserClient();
    if (supabase) {
      const { data: { user }, error } = await supabase.auth.updateUser({ data: { full_name: name.trim() } });
      if (error) { setFeedback(error.message); return; }
      if (user) await supabase.from("profiles").upsert({ id: user.id, full_name: name.trim(), updated_at: new Date().toISOString() }, { onConflict: "id" });
    } else {
      try { const saved = JSON.parse(localStorage.getItem("ad-astra-demo-user") ?? "{}") as Record<string, unknown>; localStorage.setItem("ad-astra-demo-user", JSON.stringify({ ...saved, name: name.trim() })); } catch { /* The demo profile can still be updated in component state. */ }
    }
    setFeedback("Account details saved.");
  }

  function savePreferences(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); localStorage.setItem(preferenceKey, JSON.stringify(preferences)); setFeedback("AI preferences saved on this browser.");
  }

  function saveNotifications(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); localStorage.setItem(noticeKey, JSON.stringify(notices)); setFeedback("Notification preferences saved on this browser.");
  }

  const nav = [{ href: "/app/settings/account", key: "account" as const, label: "Account", icon: UserRound }, { href: "/app/settings/appearance", key: "appearance" as const, label: "Appearance", icon: Palette }, { href: "/app/settings/ai", key: "ai" as const, label: "AI preferences", icon: Sparkles }, { href: "/app/settings/notifications", key: "notifications" as const, label: "Notifications", icon: Bell }];
  const sectionClass = (key: SettingsSection) => `${section !== "all" && section !== key ? "hidden " : ""}scroll-mt-20 rounded-xl border border-app-line bg-app-panel p-4 sm:p-5`;
  return <div className="mx-auto max-w-6xl"><div className="mb-6"><p className="mb-2 font-mono text-xs tracking-wide text-app-faint">A FEW MORE THINGS</p><h1 className="m-0 font-display text-2xl font-semibold tracking-tight text-app-text sm:text-3xl">Settings</h1><p className="mb-0 mt-2 text-sm text-app-muted">Make your workspace feel like yours.</p></div><div className="grid gap-5 lg:grid-cols-[190px_minmax(0,1fr)]"><nav aria-label="Settings sections" className="flex gap-1 overflow-x-auto rounded-xl border border-app-line bg-app-panel p-2 lg:h-fit lg:flex-col">{nav.map(({ href, key, label, icon: Icon }) => <Link key={href} href={href} aria-current={section === key ? "page" : undefined} className={`inline-flex h-9 shrink-0 items-center gap-2 rounded-lg px-2.5 text-sm focus-visible:outline-2 focus-visible:outline-app-accent ${section === key ? "bg-app-accent-soft font-semibold text-app-accent" : "text-app-muted hover:bg-app-accent-soft hover:text-app-text"}`}><Icon size={15}/>{label}</Link>)}</nav><div className="min-w-0 space-y-4">
    <section id="account" className={sectionClass("account")}><div className="mb-4 flex items-center gap-2"><UserRound size={17} className="text-app-accent"/><h2 className="m-0 font-display text-base font-semibold text-app-text">Account</h2></div><div className="mb-4 flex items-center gap-3"><span role="img" aria-label={`${name || "Account"} avatar`} className="grid h-12 w-12 place-items-center rounded-full bg-app-accent-soft font-display text-lg font-semibold text-app-accent">{name.trim().charAt(0).toUpperCase() || "A"}</span><span><b className="block text-sm font-medium text-app-text">Workspace avatar</b><small className="text-xs text-app-muted">Generated from your name.</small></span></div><form onSubmit={saveAccount} className="grid gap-4 sm:grid-cols-2"><label className="text-sm font-medium text-app-text">Name<input className={inputClass} value={name} onChange={(event) => setName(event.target.value)} required maxLength={80}/></label><label className="text-sm font-medium text-app-text">Email<input className={`${inputClass} opacity-70`} value={email} readOnly aria-describedby="email-account-note"/><span id="email-account-note" className="mt-1 block text-xs font-normal text-app-faint">Email changes are managed by your sign-in provider.</span></label><div className="sm:col-span-2"><button className="h-9 rounded-lg bg-app-accent px-3 text-sm font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-app-accent">Save account</button></div></form></section>
    <section id="appearance" className={sectionClass("appearance")}><div className="mb-4 flex items-center gap-2"><Palette size={17} className="text-app-accent"/><h2 className="m-0 font-display text-base font-semibold text-app-text">Appearance</h2></div><p className="mb-3 mt-0 text-sm text-app-muted">Choose the theme for this browser.</p><div className="grid gap-2 sm:grid-cols-3">{([{ value: "light", label: "Light", icon: Sun }, { value: "dark", label: "Dark", icon: Moon }, { value: "system", label: "System", icon: Laptop }] as const).map(({ value, label, icon: Icon }) => <button key={value} type="button" aria-pressed={theme === value} onClick={() => { setTheme(value); setAppTheme(value); }} className={`inline-flex h-11 items-center gap-2 rounded-lg border px-3 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-app-accent ${theme === value ? "border-app-accent bg-app-accent-soft text-app-accent" : "border-app-line text-app-muted hover:bg-app-bg"}`}><Icon size={16}/>{label}{theme === value && <Check size={14} className="ml-auto"/>}</button>)}</div></section>
    <section id="ai" className={sectionClass("ai")}><div className="mb-4 flex items-center gap-2"><Settings2 size={17} className="text-app-accent"/><h2 className="m-0 font-display text-base font-semibold text-app-text">AI preferences</h2></div><form onSubmit={savePreferences} className="grid gap-4 sm:grid-cols-2"><div className="space-y-1.5"><span className="block text-sm font-medium text-app-text">Default model</span><Dropdown ariaLabel="Default model" value={preferences.defaultModel} onChange={(value) => setPreferences((current) => ({ ...current, defaultModel: value as Preferences["defaultModel"] }))} className="w-full" triggerClassName="h-10 w-full justify-between rounded-lg" options={[{ value: "Ad Astra standard", label: "Ad Astra standard", description: "Everyday tasks and quick ideas" }, { value: "Ad Astra thoughtful", label: "Ad Astra thoughtful", description: "More detailed reasoning" }]} /></div><div className="space-y-1.5"><span className="block text-sm font-medium text-app-text">Response style</span><Dropdown ariaLabel="Response style" value={preferences.responseStyle} onChange={(value) => setPreferences((current) => ({ ...current, responseStyle: value as Preferences["responseStyle"] }))} className="w-full" triggerClassName="h-10 w-full justify-between rounded-lg" options={[{ value: "balanced", label: "Balanced", description: "A useful mix of detail and brevity" }, { value: "concise", label: "Concise", description: "Keep responses brief and focused" }, { value: "detailed", label: "Detailed", description: "Include more context and steps" }]} /></div><label className="block text-sm font-medium text-app-text">Temperature <span className="font-normal text-app-muted">({preferences.temperature.toFixed(1)})</span><input type="range" aria-label="AI response temperature" min="0" max="2" step="0.1" value={preferences.temperature} onChange={(event) => setPreferences((current) => ({ ...current, temperature: Number(event.target.value) }))} className="mt-3 block h-2 w-full cursor-pointer accent-[var(--app-accent)]"/><span className="mt-1 flex justify-between text-xs font-normal text-app-faint"><span>More focused</span><span>More varied</span></span></label><label className="flex items-center gap-3 self-center rounded-lg border border-app-line p-3"><input type="checkbox" checked={preferences.streaming} onChange={(event) => setPreferences((current) => ({ ...current, streaming: event.target.checked }))} className="h-4 w-4 accent-[var(--app-accent)]"/><span><b className="block text-sm font-medium text-app-text">Stream responses</b><small className="text-xs text-app-muted">Show the answer as it is generated.</small></span></label><div className="sm:col-span-2"><button className="h-9 rounded-lg bg-app-accent px-3 text-sm font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-app-accent">Save AI preferences</button><p className="mb-0 mt-2 text-xs text-app-faint">Saved on this browser. Live model availability is configured by your workspace.</p></div></form></section>
    <section id="notifications" className={sectionClass("notifications")}><div className="mb-4 flex items-center gap-2"><Bell size={17} className="text-app-accent"/><h2 className="m-0 font-display text-base font-semibold text-app-text">Notifications</h2></div><form onSubmit={saveNotifications} className="space-y-3">{([{ key: "email", label: "Email notifications", detail: "A short digest about activity in your workspace." }, { key: "usage", label: "Usage alerts", detail: "A note when workspace usage changes significantly." }, { key: "product", label: "Product updates", detail: "Occasional updates about new Ad Astra features." }] as const).map(({ key, label, detail }) => <label key={key} className="flex cursor-pointer items-start gap-3 rounded-lg border border-app-line p-3"><input type="checkbox" checked={notices[key]} onChange={(event) => setNotices((current) => ({ ...current, [key]: event.target.checked }))} className="mt-1 h-4 w-4 accent-[var(--app-accent)]"/><span><b className="block text-sm font-medium text-app-text">{label}</b><small className="mt-0.5 block text-xs leading-5 text-app-muted">{detail}</small></span></label>)}<button className="h-9 rounded-lg bg-app-accent px-3 text-sm font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-app-accent">Save notifications</button><p className="mb-0 text-xs text-app-faint">Preferences are stored locally; email delivery is not connected in this demo.</p></form></section>
    {feedback && <p role="status" className="fixed bottom-5 left-1/2 z-50 m-0 -translate-x-1/2 rounded-lg border border-app-line bg-app-panel px-4 py-2.5 text-sm text-app-text shadow-lg">{feedback}</p>}
  </div></div></div>;
}
