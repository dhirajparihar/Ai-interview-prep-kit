"use client";

import { useState } from "react";
import { KitData, Question } from "@/lib/validation/kitSchema";
import QuestionList from "./QuestionList";
import FlashcardList from "./FlashcardList";
import ScheduleView from "./ScheduleView";
import WeakSpotsReportView from "./WeakSpotsReportView";
import Link from "next/link";
import { Building2, FileText, HelpCircle, Layers, Calendar, ShieldCheck, Play, ExternalLink, Sparkles } from "lucide-react";

interface KitViewerProps {
  kitId: string;
  initialKit: KitData;
}

export default function KitViewer({ kitId, initialKit }: KitViewerProps) {
  const [kit, setKit] = useState<KitData>(initialKit);
  const [activeTab, setActiveTab] = useState<"brief" | "role" | "questions" | "flashcards" | "schedule" | "weakspots">("questions");

  const handleUpdateQuestion = async (questionId: string, updatedData: Partial<Question>) => {
    const res = await fetch(`/api/kits/${kitId}/questions/${questionId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedData),
    });

    const data = await res.json();
    if (res.ok && data.kit?.kit) {
      setKit(data.kit.kit);
    }
  };

  const handleRegenerateCategory = async (category: "technical" | "behavioural" | "system-design" | "company-fit") => {
    const res = await fetch(`/api/kits/${kitId}/regenerate/questions/${category}`, {
      method: "POST",
    });

    const data = await res.json();
    if (res.ok && data.kit?.kit) {
      setKit(data.kit.kit);
    }
  };

  return (
    <div className="space-y-6">
      {/* Kit Header */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-bold text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
              {kit.source.company}
            </span>
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              {kit.schedule.days_available} Days Prep
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">{kit.role.title}</h1>

          <div className="flex items-center gap-4 text-xs text-slate-400 mt-2">
            <a
              href={kit.source.company_url}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 hover:text-indigo-300 transition-colors"
            >
              <Building2 className="h-3.5 w-3.5" />
              <span>{kit.source.company_url}</span>
              <ExternalLink className="h-3 w-3" />
            </a>
            <span>•</span>
            <span>Researched {new Date(kit.source.researched_at).toLocaleDateString()}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href={`/kits/${kitId}/practice`}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/25 transition-all hover:scale-[1.02]"
          >
            <Play className="h-4 w-4 fill-white" />
            <span>Practice Mode</span>
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto border-b border-slate-800 pb-2">
        {[
          { id: "questions", label: `Questions (${kit.questions.length})`, icon: HelpCircle },
          { id: "flashcards", label: `Flashcards (${kit.flashcards.length})`, icon: Layers },
          { id: "schedule", label: `Schedule (${kit.schedule.days_available} Days)`, icon: Calendar },
          { id: "weakspots", label: "Weak Spots", icon: Sparkles },
          { id: "brief", label: "Company Brief", icon: Building2 },
          { id: "role", label: "Role Breakdown", icon: FileText },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                isActive
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-850"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="pt-2">
        {activeTab === "questions" && (
          <QuestionList
            questions={kit.questions}
            kitId={kitId}
            onUpdateQuestion={handleUpdateQuestion}
            onRegenerateCategory={handleRegenerateCategory}
          />
        )}

        {activeTab === "flashcards" && <FlashcardList flashcards={kit.flashcards} />}

        {activeTab === "schedule" && <ScheduleView schedule={kit.schedule} questions={kit.questions} />}

        {activeTab === "weakspots" && <WeakSpotsReportView kitId={kitId} />}

        {activeTab === "brief" && (
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="text-lg font-bold text-white">Company Summary</h3>
            <p className="text-sm text-slate-300 leading-relaxed">{kit.company_brief.summary}</p>

            <h4 className="text-sm font-bold text-white pt-2">What They Do & Product Focus</h4>
            <p className="text-sm text-slate-300 leading-relaxed">{kit.company_brief.what_they_do}</p>

            <div className="pt-4 border-t border-slate-850">
              <span className="text-xs font-semibold text-slate-400 block mb-2">Sources Crawled:</span>
              <ul className="space-y-1 text-xs text-indigo-400">
                {kit.company_brief.sources.map((src, idx) => (
                  <li key={idx}>
                    <a href={src} target="_blank" rel="noreferrer" className="hover:underline flex items-center gap-1">
                      <span>{src}</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {activeTab === "role" && (
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-6">
            <div>
              <h3 className="text-lg font-bold text-white">{kit.role.title} ({kit.role.seniority})</h3>
              <p className="text-xs text-slate-400 mt-1">Extracted from Job Description</p>
            </div>

            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Requirements ({kit.role.requirements.length})</h4>
              <div className="space-y-2">
                {kit.role.requirements.map((req) => (
                  <div key={req.id} className="p-3 rounded-lg bg-slate-900 border border-slate-850 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-indigo-400">{req.id}</span>
                      <span className="text-xs text-slate-200">{req.text}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                        {req.kind}
                      </span>
                      <span
                        className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                          req.priority === "must"
                            ? "bg-red-500/10 text-red-400 border border-red-500/20"
                            : "bg-slate-800 text-slate-400"
                        }`}
                      >
                        {req.priority}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
