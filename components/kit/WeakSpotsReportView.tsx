"use client";

import { useEffect, useState } from "react";
import { WeakSpotsReport } from "@/lib/services/weakSpotsService";
import { Target, AlertTriangle, ShieldCheck, CheckCircle, ArrowRight, Activity, Sparkles } from "lucide-react";

interface WeakSpotsReportViewProps {
  kitId: string;
}

export default function WeakSpotsReportView({ kitId }: WeakSpotsReportViewProps) {
  const [report, setReport] = useState<WeakSpotsReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/kits/${kitId}/weak-spots`)
      .then((res) => res.json())
      .then((data) => {
        if (data.report) setReport(data.report);
      })
      .finally(() => setLoading(false));
  }, [kitId]);

  if (loading) {
    return <div className="text-center py-8 text-xs font-mono text-zinc-500 dark:text-zinc-400">Analyzing practice readiness...</div>;
  }

  if (!report) {
    return <div className="text-center py-8 text-xs font-mono text-zinc-500">Practice flashcards to unlock your Weak Spots Report!</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white dark:bg-[#121215] p-5 sm:p-6 rounded-xl border border-zinc-200 dark:border-zinc-800/90 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs dark:shadow-none">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700/60 text-zinc-700 dark:text-zinc-300 text-xs font-mono mb-2">
            <Sparkles className="h-3.5 w-3.5 text-zinc-600 dark:text-zinc-300" />
            <span>Interview Weak Spots Report</span>
          </div>
          <h3 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">Interview Readiness Analysis</h3>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5 font-sans">
            Correlates your practice performance against JD requirement priorities.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-zinc-50 dark:bg-[#18181b] px-4 py-3 rounded-lg border border-zinc-200 dark:border-zinc-800 font-mono">
          <div className="text-right">
            <span className="text-[10px] text-zinc-500 dark:text-zinc-400 block uppercase">Overall Readiness</span>
            <span className="text-2xl font-bold text-zinc-900 dark:text-white">{report.overallReadinessScore}%</span>
          </div>
          <Activity className="h-7 w-7 text-zinc-600 dark:text-zinc-300" />
        </div>
      </div>

      {/* Recommended Action Items */}
      <div className="bg-white dark:bg-[#121215] p-5 rounded-xl border border-zinc-200 dark:border-zinc-800/90 space-y-3 shadow-xs dark:shadow-none">
        <h4 className="text-xs font-mono uppercase text-zinc-500 dark:text-zinc-400 flex items-center gap-2">
          <Target className="h-3.5 w-3.5 text-zinc-600 dark:text-zinc-300" />
          <span>Recommended Next Actions</span>
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {report.recommendedActionItems.map((item, idx) => (
            <div key={idx} className="p-3 rounded-lg bg-zinc-50 dark:bg-[#18181b] border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-800 dark:text-zinc-200 flex items-center gap-2 font-sans">
              <CheckCircle className="h-3.5 w-3.5 text-zinc-500 dark:text-zinc-400 shrink-0" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Weakest Requirements Table */}
      <div className="bg-white dark:bg-[#121215] p-5 rounded-xl border border-zinc-200 dark:border-zinc-800/90 space-y-3 shadow-xs dark:shadow-none">
        <h4 className="text-xs font-mono uppercase text-zinc-500 dark:text-zinc-400 flex items-center gap-2">
          <AlertTriangle className="h-3.5 w-3.5 text-amber-500 dark:text-amber-400" />
          <span>Vulnerable Requirements & Topics</span>
        </h4>

        <div className="space-y-2">
          {report.weakestRequirements.map((reqItem) => (
            <div key={reqItem.requirement.id} className="p-3 rounded-lg bg-zinc-50 dark:bg-[#18181b] border border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-zinc-900 dark:text-white font-sans">{reqItem.requirement.text}</span>
                  <span
                    className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded ${
                      reqItem.priority === "must"
                        ? "bg-red-50 dark:bg-zinc-900 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900/40"
                        : "bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-400"
                    }`}
                  >
                    {reqItem.priority.toUpperCase()}
                  </span>
                </div>
                <span className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400 block">
                  Confidence Score: {reqItem.avgConfidence} / 3.0 • {reqItem.totalCards} cards
                </span>
              </div>

              <span
                className={`text-xs font-mono font-bold px-2.5 py-1 rounded shrink-0 border ${
                  reqItem.status === "CRITICAL"
                    ? "bg-red-50 dark:bg-zinc-900 text-red-700 dark:text-red-400 border-red-200 dark:border-red-900/40"
                    : reqItem.status === "MASTEDED"
                    ? "bg-emerald-50 dark:bg-zinc-900 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/40"
                    : "bg-amber-50 dark:bg-zinc-900 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900/40"
                }`}
              >
                {reqItem.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

