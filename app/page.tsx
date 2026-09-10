import Link from "next/link";
import { getSessionUser } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import Navbar from "@/components/ui/Navbar";
import { BrainCircuit, Sparkles, ShieldCheck, Zap, Layers, ArrowRight } from "lucide-react";

export default async function HomePage() {
  const user = await getSessionUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <Navbar user={null} />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-20 pb-16 sm:pt-28 sm:pb-24">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-indigo-600/20 to-purple-600/20 blur-[120px] rounded-full pointer-events-none" />

          <div className="mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8 relative">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold mb-6">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Full-Stack AI Interview Prep System</span>
            </div>

            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-6xl max-w-4xl mx-auto leading-tight">
              Turn Any Job Posting Into A <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-indigo-200 bg-clip-text text-transparent">Master Prep Kit</span>
            </h1>

            <p className="mt-6 text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
              Automated company site research, job requirement extraction, categorized interview question bank, flashcards, and a day-by-day study schedule.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/register"
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-lg shadow-indigo-600/25 transition-all hover:scale-[1.02]"
              >
                <span>Create Your First Kit</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/login"
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-slate-850 hover:bg-slate-800 border border-slate-800 text-slate-200 font-semibold transition-colors"
              >
                Sign In
              </Link>
            </div>
          </div>
        </section>

        {/* Feature Grid */}
        <section className="py-16 border-t border-slate-850 bg-slate-900/30">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="glass-panel p-6 rounded-2xl">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400 mb-4 border border-indigo-500/20">
                  <BrainCircuit className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Automated Company Research</h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Crawls company sites, ranks hiring/culture pages, and searches public interview discussions to build targeted company-fit questions.
                </p>
              </div>

              <div className="glass-panel p-6 rounded-2xl">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10 text-purple-400 mb-4 border border-purple-500/20">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Deterministic Coverage</h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Calculates requirement coverage deterministically and triggers a second-pass generation loop to ensure zero MUST requirements are left uncovered.
                </p>
              </div>

              <div className="glass-panel p-6 rounded-2xl">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400 mb-4 border border-indigo-500/20">
                  <Layers className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">State-Preserving Builder</h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Edit, reorder, or add questions. Section regeneration replaces generated content while strictly preserving your custom edits.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-8 border-t border-slate-850 text-center text-xs text-slate-500">
        AI Interview Prep Kit • Built for Trao Full-Stack Engineering Assessment
      </footer>
    </div>
  );
}
