import { getSessionUser } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { KitService } from "@/lib/services/kitService";
import Navbar from "@/components/ui/Navbar";
import Link from "next/link";
import { PlusCircle, Building2, Calendar, FileText, ArrowRight, BrainCircuit } from "lucide-react";

export default async function DashboardPage() {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login");
  }

  const kitService = new KitService();
  const kits = await kitService.getKitsForUser(user.userId);

  return (
    <div className="min-h-screen flex flex-col bg-[var(--background)] text-[var(--foreground)] transition-colors">
      <Navbar user={user} />

      <main className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">Interview Prep Kits</h1>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-0.5 font-sans">
              Role decks, custom question banks, and schedule allocations
            </p>
          </div>

          <Link
            href="/kits/new"
            className="flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-md bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-zinc-200 font-semibold text-xs transition-colors shadow-sm"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Create New Kit</span>
          </Link>
        </div>

        {/* Kits Grid */}
        {kits.length === 0 ? (
          <div className="bg-white dark:bg-[#121215] border border-zinc-200 dark:border-zinc-800 rounded-xl p-12 text-center max-w-xl mx-auto my-12 shadow-sm dark:shadow-none">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700/60 mb-4">
              <BrainCircuit className="h-6 w-6" />
            </div>
            <h3 className="text-base font-semibold text-zinc-900 dark:text-white mb-1.5">No Preparation Kits Found</h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-6 leading-relaxed font-sans">
              Paste a job description and company URL to generate your tailored AI preparation kit.
            </p>
            <Link
              href="/kits/new"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-zinc-200 font-semibold text-xs transition-colors shadow-sm"
            >
              <PlusCircle className="h-3.5 w-3.5" />
              <span>Generate Kit Now</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {kits.map((kitDoc) => {
              const kit = kitDoc.kit;
              const kitId = kitDoc._id.toString();

              return (
                <div
                  key={kitId}
                  className="bg-white dark:bg-[#121215] border border-zinc-200 dark:border-zinc-800/90 hover:border-zinc-300 dark:hover:border-zinc-700 p-5 rounded-xl flex flex-col justify-between transition-colors shadow-sm dark:shadow-none group"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="text-[11px] font-mono text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700/60 px-2 py-0.5 rounded truncate max-w-[160px]">
                        {kit.source.company || "Target Company"}
                      </span>
                      <span className="text-[11px] font-mono text-zinc-600 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-900 px-2 py-0.5 rounded border border-zinc-200 dark:border-zinc-800">
                        {kit.schedule?.days_available || 5} Days Prep
                      </span>
                    </div>

                    <h3 className="text-base font-semibold text-zinc-900 dark:text-white group-hover:text-zinc-600 dark:group-hover:text-zinc-200 transition-colors line-clamp-1 mb-3">
                      {kit.role?.title || "Target Role"}
                    </h3>

                    <div className="space-y-1.5 text-xs text-zinc-600 dark:text-zinc-400 mb-6 font-sans">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-3.5 w-3.5 text-zinc-400 dark:text-zinc-500" />
                        <span className="truncate">{kit.source.company_url}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FileText className="h-3.5 w-3.5 text-zinc-400 dark:text-zinc-500" />
                        <span>{kit.questions?.length || 0} Questions • {kit.flashcards?.length || 0} Flashcards</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3.5 w-3.5 text-zinc-400 dark:text-zinc-500" />
                        <span>Created {new Date(kitDoc.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-4 border-t border-zinc-100 dark:border-zinc-800/80">
                    <Link
                      href={`/kits/${kitId}`}
                      className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-xs font-medium text-zinc-900 dark:text-zinc-200 transition-colors"
                    >
                      <span>Open Kit</span>
                      <ArrowRight className="h-3 w-3" />
                    </Link>

                    <Link
                      href={`/kits/${kitId}/practice`}
                      className="flex items-center justify-center gap-1.5 py-1.5 px-3 rounded bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-xs font-semibold transition-colors"
                    >
                      <span>Practice</span>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}


