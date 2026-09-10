import { getSessionUser } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { KitService } from "@/lib/services/kitService";
import Navbar from "@/components/ui/Navbar";
import Link from "next/link";
import { PlusCircle, Building2, Calendar, FileText, ArrowRight, BrainCircuit, ExternalLink, Sparkles } from "lucide-react";

export default async function DashboardPage() {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login");
  }

  const kitService = new KitService();
  const kits = await kitService.getKitsForUser(user.userId);

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <Navbar user={user} />

      <main className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Your Interview Prep Kits</h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Manage your role preparation decks, custom questions, and study timelines
            </p>
          </div>

          <Link
            href="/kits/new"
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-md shadow-indigo-600/20 transition-all hover:scale-[1.02]"
          >
            <PlusCircle className="h-4.5 w-4.5" />
            <span>Create New Kit</span>
          </Link>
        </div>

        {/* Kits Grid */}
        {kits.length === 0 ? (
          <div className="glass-panel rounded-2xl p-12 text-center max-w-xl mx-auto my-12 border border-slate-800">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-4">
              <BrainCircuit className="h-7 w-7" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">No Prep Kits Yet</h3>
            <p className="text-sm text-slate-400 mb-6 leading-relaxed">
              Paste a job description and company website URL to generate your first AI-powered preparation kit.
            </p>
            <Link
              href="/kits/new"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/20 transition-all"
            >
              <Sparkles className="h-4 w-4" />
              <span>Generate Kit Now</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {kits.map((kitDoc) => {
              const kit = kitDoc.kit;
              const kitId = kitDoc._id.toString();

              return (
                <div
                  key={kitId}
                  className="glass-panel p-6 rounded-2xl flex flex-col justify-between hover:border-slate-700 transition-all group hover:shadow-xl hover:shadow-indigo-500/5"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 truncate max-w-[180px]">
                        {kit.source.company || "Target Company"}
                      </span>
                      <span className="text-xs font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                        {kit.schedule?.days_available || 5} Days Prep
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-white group-hover:text-indigo-300 transition-colors line-clamp-1 mb-2">
                      {kit.role?.title || "Target Role"}
                    </h3>

                    <div className="space-y-1.5 text-xs text-slate-400 mb-6">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-3.5 w-3.5 text-slate-500" />
                        <span className="truncate">{kit.source.company_url}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FileText className="h-3.5 w-3.5 text-slate-500" />
                        <span>{kit.questions?.length || 0} Questions • {kit.flashcards?.length || 0} Flashcards</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3.5 w-3.5 text-slate-500" />
                        <span>Created {new Date(kitDoc.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-4 border-t border-slate-800/80">
                    <Link
                      href={`/kits/${kitId}`}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors"
                    >
                      <span>Open Kit</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>

                    <Link
                      href={`/kits/${kitId}/practice`}
                      className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 text-xs font-semibold border border-indigo-500/30 transition-colors"
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
