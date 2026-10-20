"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const [message, setMessage] = useState(""); const [busy, setBusy] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setMessage("");
    const password = String(new FormData(event.currentTarget).get("password") ?? "");
    const supabase = createSupabaseBrowserClient();
    if (!supabase) { setMessage("Connect Supabase to reset your password."); setBusy(false); return; }
    const { error } = await supabase.auth.updateUser({ password });
    setMessage(error?.message ?? "Password updated. You can now return to your workspace."); setBusy(false);
  }
  return <main className="grid min-h-screen place-items-center bg-app-bg px-5"><section className="w-full max-w-[380px] rounded-xl border border-app-line bg-app-panel p-6 shadow-xl sm:p-9"><h1 className="m-0 font-display text-3xl font-semibold text-app-text">Choose a new password</h1><p className="mb-5 mt-2 text-sm text-app-muted">Use at least 8 characters.</p><form onSubmit={submit} className="space-y-4"><label className="block text-sm font-semibold text-app-muted">New password<input name="password" type="password" autoComplete="new-password" minLength={8} required className="mt-1.5 block h-10 w-full rounded-md border border-app-line bg-app-bg px-3 text-sm text-app-text focus-visible:outline-2 focus-visible:outline-app-accent" /></label><button disabled={busy} className="h-10 w-full rounded-lg bg-neutral-800 text-sm font-semibold text-white disabled:opacity-60 dark:bg-stone-100 dark:text-stone-950">{busy ? "Saving…" : "Update password"}</button></form>{message && <p role="status" className="mt-4 text-sm text-app-text">{message}</p>}<Link href="/login" className="mt-5 inline-block text-sm font-medium text-app-accent">Return to login</Link></section></main>;
}
