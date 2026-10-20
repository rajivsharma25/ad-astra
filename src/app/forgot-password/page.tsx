import Link from "next/link";
import { ArrowLeft, ArrowRight, Check, Inbox, KeyRound, Mail, Sparkles } from "lucide-react";
import { AuthForm } from "@/components/auth/auth-form";
import { ThemeToggle } from "@/components/theme-toggle";

export default function ForgotPasswordPage() {
  return <main className="relative flex min-h-screen flex-col overflow-hidden bg-app-bg text-app-text">
    <div aria-hidden="true" className="pointer-events-none absolute -top-40 left-1/3 h-96 w-96 rounded-full bg-app-accent-soft/70 blur-3xl" />
    <header className="relative z-10 mx-auto flex h-[72px] w-full max-w-7xl items-center justify-between px-5 md:px-9">
      <Link href="/" className="inline-flex items-center gap-2 font-display text-lg font-semibold tracking-tight text-app-text"><span className="grid h-7 w-7 place-items-center rounded-lg bg-app-accent-soft text-app-accent"><Sparkles size={16}/></span>ad astra<span className="-ml-2 text-app-accent">.</span></Link>
      <div className="flex items-center gap-3"><ThemeToggle/><Link href="/login" className="inline-flex h-9 items-center gap-1.5 rounded-lg px-2 text-sm text-app-muted transition-colors hover:bg-app-panel hover:text-app-text"><ArrowLeft size={14}/> <span className="hidden sm:inline">Back to login</span></Link></div>
    </header>

    <div className="relative z-10 mx-auto grid w-full max-w-6xl flex-1 items-center gap-10 px-5 py-8 md:px-9 lg:grid-cols-[minmax(0,0.9fr)_minmax(400px,1.1fr)] lg:gap-16 lg:py-12">
      <section className="mx-auto w-full max-w-[440px]">
        <div className="mb-6"><span className="mb-5 grid h-10 w-10 place-items-center rounded-xl bg-app-accent-soft text-app-accent"><KeyRound size={19}/></span><p className="mb-2 font-mono text-xs tracking-wide text-app-faint">ACCOUNT RECOVERY</p><h1 className="m-0 font-display text-4xl font-semibold leading-[1.08] tracking-tight sm:text-5xl">Let’s get you<br/><em className="not-italic text-app-accent">back in.</em></h1><p className="mb-0 mt-3 text-sm leading-6 text-app-muted">A reset link can help you get back to your workspace. Enter the email address you use to sign in.</p></div>
        <div className="rounded-2xl border border-app-line bg-app-panel p-5 shadow-[0_18px_55px_-35px_rgb(30_25_55/0.35)] sm:p-7">
          <div className="mb-5"><h2 className="m-0 font-display text-lg font-semibold text-app-text">Reset your password</h2><p className="mb-0 mt-1 text-sm text-app-muted">We’ll send a secure reset link to your email.</p></div>
          <AuthForm mode="forgot"/>
          <div className="mt-5 flex items-center justify-center gap-1.5 border-t border-app-line pt-4 text-sm text-app-muted"><span>Remembered it?</span><Link href="/login" className="font-semibold text-app-accent hover:underline">Return to login <ArrowRight size={13} className="ml-0.5 inline"/></Link></div>
        </div>
        <p className="mb-0 mt-4 text-center text-xs text-app-faint">A little more room for good work. <span className="text-app-accent">✳</span></p>
      </section>

      <aside className="relative hidden min-h-[520px] overflow-hidden rounded-[28px] border border-app-line bg-app-accent-soft p-7 lg:flex lg:flex-col lg:justify-between xl:p-10">
        <div aria-hidden="true" className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full border border-app-line-strong/70" />
        <div aria-hidden="true" className="pointer-events-none absolute -bottom-24 -left-20 h-72 w-72 rounded-full border border-app-line-strong/70" />
        <div className="relative z-10"><span className="inline-flex items-center gap-2 rounded-full border border-app-line bg-app-panel/80 px-3 py-1.5 font-mono text-[11px] tracking-wide text-app-muted"><Mail size={13} className="text-app-accent"/> A SIMPLE RESET</span><h2 className="mb-2 mt-6 max-w-sm font-display text-3xl font-semibold leading-tight tracking-tight">A few steps,<br/>and you’re back.</h2><p className="mb-0 max-w-sm text-sm leading-6 text-app-muted">We’ll guide you from your inbox back to the work you’ve saved in Ad Astra.</p></div>
        <div className="relative z-10 rounded-2xl border border-app-line bg-app-panel p-4 shadow-sm xl:p-5"><p className="mb-3 mt-0 font-mono text-xs tracking-wide text-app-faint">WHAT HAPPENS NEXT</p><ol className="m-0 list-none space-y-4 p-0">{[{ icon: Inbox, title: "Check your inbox", detail: "Look for an email with a password reset link." }, { icon: KeyRound, title: "Choose a new password", detail: "Open the link and set a password you’ll remember." }, { icon: Check, title: "Return to your workspace", detail: "Sign in and pick up where you left off." }].map(({ icon: Icon, title, detail }, index) => <li key={title} className="flex items-start gap-3"><span className="relative grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-app-accent-soft text-app-accent"><Icon size={16}/>{index < 2 && <span aria-hidden="true" className="absolute left-1/2 top-9 h-4 w-px -translate-x-1/2 bg-app-line-strong"/>}</span><span className="pt-0.5"><b className="block text-sm font-semibold text-app-text">{title}</b><small className="mt-1 block text-xs leading-5 text-app-muted">{detail}</small></span></li>)}</ol><div className="mt-5 flex items-center gap-2 rounded-lg border border-app-line bg-app-bg px-3 py-2.5 text-xs leading-5 text-app-muted"><Mail size={14} className="shrink-0 text-app-accent"/>If you don’t see the email soon, check your spam folder.</div></div>
        <p className="relative z-10 mb-0 text-xs text-app-faint">For account security, the confirmation message won’t reveal whether an email is registered.</p>
      </aside>
    </div>
  </main>;
}
