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
    return <div className="text-center py-8 text-xs text-slate-400">Analyzing practice readiness...</div>;
  }

  if (!report) {
    return <div className="text-center py-8 text-xs text-slate-500">Practice flashcards to unlock your Weak Spots Report!</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold mb-2">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Creative Feature: Interview Weak Spots</span>
          </div>
          <h3 className="text-xl font-extrabold text-white">Interview Readiness Analysis</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Correlates your practice performance against JD requirement priorities.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-slate-900/90 px-4 py-3 rounded-xl border border-slate-850">
          <div className="text-right">
            <span className="text-[10px] font-semibold uppercase text-slate-400 block">Overall Score</span>
            <span className="text-2xl font-extrabold text-indigo-400">{report.overallReadinessScore}%</span>
          </div>
          <Activity className="h-8 w-8 text-indigo-400" />
        </div>
      </div>

      {/* Recommended Action Items */}
      <div className="glass-panel p-5 rounded-xl border border-slate-800 space-y-3">
        <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Target className="h-4 w-4 text-indigo-400" />
          <span>Recommended Next Actions</span>
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {report.recommendedActionItems.map((item, idx) => (
            <div key={idx} className="p-3 rounded-lg bg-indigo-500/5 border border-indigo-500/15 text-xs text-indigo-200 flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-indigo-400 shrink-0" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Weakest Requirements Table */}
      <div className="glass-panel p-5 rounded-xl border border-slate-800 space-y-3">
        <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-400" />
          <span>Vulnerable Requirements & Topics</span>
        </h4>

        <div className="space-y-2">
          {report.weakestRequirements.map((reqItem) => (
            <div key={reqItem.requirement.id} className="p-3 rounded-lg bg-slate-900 border border-slate-850 flex items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white">{reqItem.requirement.text}</span>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                      reqItem.priority === "must"
                        ? "bg-red-500/10 text-red-400 border border-red-500/20"
                        : "bg-slate-800 text-slate-400"
                    }`}
                  >
                    {reqItem.priority.toUpperCase()}
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 block">
                  Confidence Score: {reqItem.avgConfidence} / 3.0 • {reqItem.totalCards} cards
                </span>
              </div>

              <span
                className={`text-xs font-bold px-2.5 py-1 rounded-md shrink-0 ${
                  reqItem.status === "CRITICAL"
                    ? "bg-red-500/10 text-red-400 border border-red-500/20"
                    : reqItem.status === "MASTEDED"
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                    : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
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
