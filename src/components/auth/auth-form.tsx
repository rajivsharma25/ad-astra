"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type AuthMode = "login" | "signup" | "forgot";

export function AuthForm({ mode, nextPath = "/app" }: { mode: AuthMode; nextPath?: string }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const safeNext = nextPath.startsWith("/app") && !nextPath.startsWith("//") ? nextPath : "/app";

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); setNotice(""); setBusy(true);
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");
    const supabase = createSupabaseBrowserClient();
    try {
      if (!supabase) {
        sessionStorage.setItem("ad-astra-demo-user", JSON.stringify({ email, name: String(form.get("name") ?? "") }));
        router.push(safeNext); router.refresh(); return;
      }
      if (mode === "login") {
        const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
        if (authError) throw authError;
        router.push(safeNext); router.refresh();
      } else if (mode === "signup") {
        const { data, error: authError } = await supabase.auth.signUp({ email, password, options: { data: { full_name: String(form.get("name") ?? "").trim() }, emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(safeNext)}` } });
        if (authError) throw authError;
        if (data.session) { router.push(safeNext); router.refresh(); }
        else setNotice("Check your email to confirm your account, then come back to log in.");
      } else {
        const { error: authError } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/auth/callback?next=/reset-password` });
        if (authError) throw authError;
        setNotice("If an account exists for that email, a password reset link is on its way.");
      }
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Something went wrong. Please try again."); }
    finally { setBusy(false); }
  }

  async function google() {
    const supabase = createSupabaseBrowserClient();
    if (!supabase) { setError("Google sign-in is available after connecting Supabase."); return; }
    setBusy(true); setError("");
    const { error: authError } = await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(safeNext)}` } });
    if (authError) { setError(authError.message); setBusy(false); }
  }

  const isForgot = mode === "forgot";
  return <>
    <form onSubmit={submit} className="space-y-4">
      {mode === "signup" && <label className="block text-sm font-semibold text-app-muted">Your name<input name="name" autoComplete="name" className="mt-1.5 block h-11 w-full rounded-lg border border-app-line bg-app-bg px-3 text-sm text-app-text placeholder:text-app-faint outline-none transition-colors focus:border-app-accent focus-visible:ring-2 focus-visible:ring-app-accent/20" placeholder="What should we call you?" required /></label>}
      <label className="block text-sm font-semibold text-app-muted">Email address<input name="email" type="email" autoComplete="email" className="mt-1.5 block h-11 w-full rounded-lg border border-app-line bg-app-bg px-3 text-sm text-app-text placeholder:text-app-faint outline-none transition-colors focus:border-app-accent focus-visible:ring-2 focus-visible:ring-app-accent/20" placeholder="you@yourcompany.com" required /></label>
      {!isForgot && <label className="block text-sm font-semibold text-app-muted"><span className="flex items-center justify-between"><span>Password</span>{mode === "login" && <Link href="/forgot-password" className="text-xs font-semibold text-app-accent hover:underline">Forgot password?</Link>}</span><input name="password" type="password" autoComplete={mode === "signup" ? "new-password" : "current-password"} minLength={mode === "signup" ? 8 : undefined} className="mt-1.5 block h-11 w-full rounded-lg border border-app-line bg-app-bg px-3 text-sm text-app-text placeholder:text-app-faint outline-none transition-colors focus:border-app-accent focus-visible:ring-2 focus-visible:ring-app-accent/20" placeholder="At least 8 characters" required /></label>}
      {error && <p role="alert" className="m-0 rounded-md bg-red-50 px-3 py-2 text-sm text-red-800 dark:bg-red-950/40 dark:text-red-200">{error}</p>}
      {notice && <p role="status" className="m-0 rounded-md bg-app-accent-soft px-3 py-2 text-sm text-app-text">{notice}</p>}
      <button disabled={busy} className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-neutral-800 px-4 text-sm font-semibold text-white transition-colors hover:bg-neutral-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-app-accent disabled:cursor-not-allowed disabled:opacity-60 dark:bg-stone-100 dark:text-stone-950 dark:hover:bg-white">{busy ? "Please wait…" : isForgot ? "Send reset link" : mode === "signup" ? "Create your free workspace" : "Log in to your workspace"}</button>
    </form>
    {mode === "login" && <><div className="my-5 flex items-center gap-2.5 text-xs text-app-faint"><span className="h-px flex-1 bg-app-line"/>or<span className="h-px flex-1 bg-app-line"/></div><button type="button" disabled={busy} onClick={google} className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-app-line bg-app-panel text-sm font-semibold text-app-text transition-colors hover:bg-app-accent-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-app-accent disabled:cursor-not-allowed disabled:opacity-60"><svg aria-hidden="true" className="h-[18px] w-[18px]" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5Z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.76 7.18l7.73 6C44.42 37.95 46.98 31.85 46.98 24.55Z"/><path fill="#FBBC05" d="M10.53 28.59A14.4 14.4 0 0 1 9.75 24c0-1.59.27-3.13.76-4.59l-7.98-6.19A23.9 23.9 0 0 0 0 24c0 3.87.93 7.52 2.56 10.78l7.97-6.19Z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.91-5.8l-7.73-6c-2.14 1.44-4.89 2.3-8.18 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48Z"/></svg>Continue with Google</button></>}
  </>;
}
