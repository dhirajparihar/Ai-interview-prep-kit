import Link from "next/link";
import { getSessionUser } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import Navbar from "@/components/ui/Navbar";
import InteractiveDrillPreview from "@/components/landing/InteractiveDrillPreview";
import { ArrowRight, Terminal, ShieldCheck, Cpu } from "lucide-react";

export default async function HomePage() {
  const user = await getSessionUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen flex flex-col bg-[var(--background)] text-[var(--foreground)] transition-colors">
      <Navbar user={null} />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="pt-16 pb-16 sm:pt-24 sm:pb-20 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white sm:text-6xl max-w-3xl mx-auto leading-[1.1]">
              Precision Interview Preparation Kits Built For Target Roles
            </h1>

            <p className="mt-5 text-base sm:text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed font-sans">
              Transform any job posting into an integrated study system featuring automated company research, requirement coverage checks, flashcard drills, and timeline scheduling.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/register"
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-zinc-200 font-semibold text-sm transition-colors shadow-sm"
              >
                <span>Generate Your First Kit</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/login"
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-300 font-medium text-sm transition-colors"
              >
                Sign In
              </Link>
            </div>
          </div>

          {/* Interactive Drill Component Preview */}
          <InteractiveDrillPreview />
        </section>

        {/* Feature Grid */}
        <section className="py-16 border-t border-zinc-200 dark:border-zinc-800/80 bg-zinc-50 dark:bg-[#0c0c0e]">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white dark:bg-[#121215] border border-zinc-200 dark:border-zinc-800/80 p-6 rounded-xl shadow-sm dark:shadow-none">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700/60 mb-4">
                  <Terminal className="h-4.5 w-4.5" />
                </div>
                <h3 className="text-base font-semibold text-zinc-900 dark:text-white mb-2">Automated Web & Culture Intelligence</h3>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed font-sans">
                  Crawls target company engineering blogs, hiring documentation, and interview discussions to generate company-fit questions.
                </p>
              </div>

              <div className="bg-white dark:bg-[#121215] border border-zinc-200 dark:border-zinc-800/80 p-6 rounded-xl shadow-sm dark:shadow-none">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700/60 mb-4">
                  <ShieldCheck className="h-4.5 w-4.5" />
                </div>
                <h3 className="text-base font-semibold text-zinc-900 dark:text-white mb-2">Deterministic Requirement Coverage</h3>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed font-sans">
                  Validates requirement mapping programmatically and executes secondary generation passes to guarantee complete role coverage.
                </p>
              </div>

              <div className="bg-white dark:bg-[#121215] border border-zinc-200 dark:border-zinc-800/80 p-6 rounded-xl shadow-sm dark:shadow-none">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700/60 mb-4">
                  <Cpu className="h-4.5 w-4.5" />
                </div>
                <h3 className="text-base font-semibold text-zinc-900 dark:text-white mb-2">State-Preserving Question Editor</h3>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed font-sans">
                  Edit, reorder, or customize question parameters. Regeneration passes replace generated content while strictly preserving user edits.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-6 border-t border-zinc-200 dark:border-zinc-800/80 text-center text-xs font-mono text-zinc-500">
        PREPKIT // SYSTEM • AI INTERVIEW PREPARATION FRAMEWORK
      </footer>
    </div>
  );
}

