import Link from "next/link";
import { ArrowLeft, ArrowRight, FileText, MessageSquareText, Sparkles, WandSparkles } from "lucide-react";
import { AuthForm } from "@/components/auth/auth-form";
import { ThemeToggle } from "@/components/theme-toggle";

export default function SignupPage() {
  return <main className="relative flex min-h-screen flex-col overflow-hidden bg-app-bg text-app-text">
    <div aria-hidden="true" className="pointer-events-none absolute -top-40 left-1/3 h-96 w-96 rounded-full bg-app-accent-soft/70 blur-3xl" />
    <header className="relative z-10 mx-auto flex h-[72px] w-full max-w-7xl items-center justify-between px-5 md:px-9">
      <Link href="/" className="inline-flex items-center gap-2 font-display text-lg font-semibold tracking-tight text-app-text"><span className="grid h-7 w-7 place-items-center rounded-lg bg-app-accent-soft text-app-accent"><Sparkles size={16}/></span>ad astra<span className="-ml-2 text-app-accent">.</span></Link>
      <div className="flex items-center gap-3"><ThemeToggle/><Link href="/" className="inline-flex h-9 items-center gap-1.5 rounded-lg px-2 text-sm text-app-muted transition-colors hover:bg-app-panel hover:text-app-text"><ArrowLeft size={14}/> <span className="hidden sm:inline">Back home</span></Link></div>
    </header>

    <div className="relative z-10 mx-auto grid w-full max-w-6xl flex-1 items-center gap-10 px-5 py-8 md:px-9 lg:grid-cols-[minmax(0,0.9fr)_minmax(400px,1.1fr)] lg:gap-16 lg:py-12">
      <section className="mx-auto w-full max-w-[440px]">
        <div className="mb-6"><span className="mb-5 grid h-10 w-10 place-items-center rounded-xl bg-app-accent-soft text-app-accent"><Sparkles size={19}/></span><p className="mb-2 font-mono text-xs tracking-wide text-app-faint">A GOOD PLACE TO BEGIN</p><h1 className="m-0 font-display text-4xl font-semibold leading-[1.08] tracking-tight sm:text-5xl">Make a little<br/><em className="not-italic text-app-accent">room for you.</em></h1><p className="mb-0 mt-3 text-sm leading-6 text-app-muted">Create your workspace and give your ideas a place to grow.</p></div>
        <div className="rounded-2xl border border-app-line bg-app-panel p-5 shadow-[0_18px_55px_-35px_rgb(30_25_55/0.35)] sm:p-7">
          <div className="mb-5"><h2 className="m-0 font-display text-lg font-semibold text-app-text">Create your workspace</h2><p className="mb-0 mt-1 text-sm text-app-muted">A few details and you’re ready to go.</p></div>
          <AuthForm mode="signup"/>
          <p className="mb-0 mt-5 border-t border-app-line pt-4 text-center text-sm text-app-muted">Already have an account? <Link href="/login" className="font-semibold text-app-accent hover:underline">Log in <ArrowRight size={13} className="ml-0.5 inline"/></Link></p>
        </div>
        <p className="mb-0 mt-4 text-center text-xs text-app-faint">A little more room for good work. <span className="text-app-accent">✳</span></p>
      </section>

      <aside className="relative hidden min-h-[520px] overflow-hidden rounded-[28px] border border-app-line bg-app-accent-soft p-7 lg:flex lg:flex-col lg:justify-between xl:p-10">
        <div aria-hidden="true" className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full border border-app-line-strong/70" />
        <div aria-hidden="true" className="pointer-events-none absolute -bottom-24 -left-20 h-72 w-72 rounded-full border border-app-line-strong/70" />
        <div className="relative z-10"><span className="inline-flex items-center gap-2 rounded-full border border-app-line bg-app-panel/80 px-3 py-1.5 font-mono text-[11px] tracking-wide text-app-muted"><Sparkles size={13} className="text-app-accent"/> YOUR SPACE TO THINK</span><h2 className="mb-2 mt-6 max-w-sm font-display text-3xl font-semibold leading-tight tracking-tight">Start with a thought.<br/>Build from there.</h2><p className="mb-0 max-w-sm text-sm leading-6 text-app-muted">Bring your conversations, notes, and useful prompts together in one calm workspace.</p></div>

        <div className="relative z-10 my-8 rounded-2xl border border-app-line bg-app-panel p-4 shadow-sm xl:p-5"><div className="mb-4 flex items-center justify-between border-b border-app-line pb-3"><div className="flex items-center gap-2"><span className="grid h-7 w-7 place-items-center rounded-lg bg-app-accent-soft text-app-accent"><MessageSquareText size={15}/></span><span><b className="block text-xs font-semibold text-app-text">Your first conversation</b><small className="text-[10px] text-app-faint">A fresh start</small></span></div><span className="rounded-full bg-app-accent-soft px-2 py-1 text-[10px] font-medium text-app-accent">Ready</span></div><div className="ml-auto max-w-[82%] rounded-xl rounded-br-sm bg-app-bg px-3 py-2 text-xs leading-5 text-app-muted">Help me turn this idea into a plan.</div><div className="mt-3 flex gap-2.5"><span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-app-accent-soft text-app-accent"><Sparkles size={14}/></span><p className="m-0 rounded-xl rounded-bl-sm border border-app-line px-3 py-2 text-xs leading-5 text-app-muted">Let’s find the next clear step, then shape a plan that fits your goals.</p></div><div className="mt-4 flex items-center gap-2 border-t border-app-line pt-3 text-[10px] text-app-faint"><span className="h-1.5 w-1.5 rounded-full bg-app-accent"/>A space for ideas to take shape</div></div>

        <div className="relative z-10 grid grid-cols-2 gap-3"><div className="rounded-xl border border-app-line bg-app-panel/80 p-3"><span className="grid h-7 w-7 place-items-center rounded-lg bg-app-panel text-app-accent"><FileText size={14}/></span><b className="mt-2 block text-xs font-semibold text-app-text">Keep the context</b><small className="mt-1 block text-[11px] leading-4 text-app-muted">Documents and notes close at hand.</small></div><div className="rounded-xl border border-app-line bg-app-panel/80 p-3"><span className="grid h-7 w-7 place-items-center rounded-lg bg-app-panel text-app-accent"><WandSparkles size={14}/></span><b className="mt-2 block text-xs font-semibold text-app-text">Reuse good ideas</b><small className="mt-1 block text-[11px] leading-4 text-app-muted">Save prompts for the next time.</small></div></div>
      </aside>
    </div>
  </main>;
}
