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

  const handleReorderQuestions = async (newQuestionIdsOrder: string[]) => {
    const res = await fetch(`/api/kits/${kitId}/questions/reorder`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ questionIds: newQuestionIdsOrder }),
    });

    const data = await res.json();
    if (res.ok && data.kit?.kit) {
      setKit(data.kit.kit);
    }
  };

  return (
    <div className="space-y-6">
      {/* Kit Header */}
      <div className="bg-white dark:bg-[#121215] p-6 sm:p-7 rounded-xl border border-zinc-200 dark:border-zinc-800/90 shadow-sm dark:shadow-none flex flex-col md:flex-row md:items-center justify-between gap-6 transition-colors">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[11px] font-mono font-medium text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 px-2.5 py-0.5 rounded border border-zinc-200 dark:border-zinc-700/60">
              {kit.source.company}
            </span>
            <span className="text-[11px] font-mono text-zinc-600 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-900 px-2.5 py-0.5 rounded border border-zinc-200 dark:border-zinc-800">
              {kit.schedule.days_available} Days Prep
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">{kit.role.title}</h1>

          <div className="flex items-center gap-3 text-xs text-zinc-600 dark:text-zinc-400 mt-2 font-sans">
            <a
              href={kit.source.company_url}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 hover:text-zinc-900 dark:hover:text-white transition-colors"
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
            className="flex items-center gap-2 px-4 py-2 rounded-md bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-zinc-200 font-semibold text-xs transition-colors shadow-sm"
          >
            <Play className="h-3.5 w-3.5 fill-current" />
            <span>Practice Mode</span>
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto border-b border-zinc-200 dark:border-zinc-800 pb-2">
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
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
                isActive
                  ? "bg-zinc-900 dark:bg-zinc-800 text-white border border-zinc-900 dark:border-zinc-700/80"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800/40"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
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
            onReorderQuestions={handleReorderQuestions}
          />
        )}

        {activeTab === "flashcards" && <FlashcardList flashcards={kit.flashcards} />}

        {activeTab === "schedule" && <ScheduleView schedule={kit.schedule} questions={kit.questions} />}

        {activeTab === "weakspots" && <WeakSpotsReportView kitId={kitId} />}

        {activeTab === "brief" && (
          <div className="bg-white dark:bg-[#121215] p-6 rounded-xl border border-zinc-200 dark:border-zinc-800/90 shadow-sm dark:shadow-none space-y-4 transition-colors">
            <h3 className="text-base font-semibold text-zinc-900 dark:text-white">Company Summary</h3>
            <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed font-sans">{kit.company_brief.summary}</p>

            <h4 className="text-xs font-semibold text-zinc-900 dark:text-white pt-2">What They Do & Product Focus</h4>
            <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed font-sans">{kit.company_brief.what_they_do}</p>

            <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800">
              <span className="text-xs font-mono text-zinc-500 dark:text-zinc-400 block mb-2">Sources Crawled:</span>
              <ul className="space-y-1 text-xs font-mono text-zinc-700 dark:text-zinc-300">
                {kit.company_brief.sources.map((src, idx) => (
                  <li key={idx}>
                    <a href={src} target="_blank" rel="noreferrer" className="hover:underline flex items-center gap-1 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white">
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
          <div className="bg-white dark:bg-[#121215] p-6 rounded-xl border border-zinc-200 dark:border-zinc-800/90 shadow-sm dark:shadow-none space-y-6 transition-colors">
            <div>
              <h3 className="text-base font-semibold text-zinc-900 dark:text-white">{kit.role.title} ({kit.role.seniority})</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 font-sans">Extracted from Job Description</p>
            </div>

            <div>
              <h4 className="text-xs font-mono uppercase text-zinc-500 dark:text-zinc-400 mb-3">Requirements ({kit.role.requirements.length})</h4>
              <div className="space-y-2">
                {kit.role.requirements.map((req) => (
                  <div key={req.id} className="p-3 rounded-lg bg-zinc-50 dark:bg-[#18181b] border border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-zinc-700 dark:text-zinc-300">{req.id}</span>
                      <span className="text-xs text-zinc-800 dark:text-zinc-200 font-sans">{req.text}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 font-mono">
                      <span className="text-[10px] uppercase font-medium px-2 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-300">
                        {req.kind}
                      </span>
                      <span
                        className={`text-[10px] uppercase font-semibold px-2 py-0.5 rounded ${
                          req.priority === "must"
                            ? "bg-red-100 dark:bg-zinc-900 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900/40"
                            : "bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-400"
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


