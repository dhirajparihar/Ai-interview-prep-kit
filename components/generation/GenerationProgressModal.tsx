"use client";

import { CheckCircle2, Loader2, AlertTriangle, Sparkles } from "lucide-react";

export interface GenerationProgressProps {
  stage: string;
  percent: number;
  error?: string | null;
  onRetry?: () => void;
}

const STAGES = [
  "Extracting requirements from job description...",
  "Researching company site and hiring process...",
  "Finding relevant hiring and career pages...",
  "Researching public interview discussion...",
  "Generating question bank by category...",
  "Generating flashcards...",
  "Checking requirement coverage...",
  "Running second pass generation for uncovered requirements...",
  "Building study schedule...",
  "Validating prep kit...",
  "Kit generated successfully!",
];

export default function GenerationProgressModal({
  stage,
  percent,
  error,
  onRetry,
}: GenerationProgressProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
      <div className="w-full max-w-lg glass-panel p-8 rounded-2xl shadow-2xl border border-slate-800 relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-500/10 blur-3xl rounded-full pointer-events-none" />

        <div className="text-center mb-6">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 mb-4">
            {error ? (
              <AlertTriangle className="h-6 w-6 text-red-400" />
            ) : (
              <Sparkles className="h-6 w-6 text-indigo-400 animate-pulse" />
            )}
          </div>

          <h3 className="text-xl font-bold text-white">
            {error ? "Generation Error" : "Building Your Interview Prep Kit"}
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            {error
              ? "An unexpected issue occurred during research or generation."
              : "Our pipeline is extracting requirements, crawling site data, and calculating deterministic schedules."}
          </p>
        </div>

        {!error && (
          <div className="mb-6">
            <div className="flex justify-between text-xs font-semibold text-slate-400 mb-2">
              <span>{stage || "Initializing pipeline..."}</span>
              <span className="text-indigo-400">{percent}%</span>
            </div>
            <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>
        )}

        {error ? (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs leading-relaxed">
              {error}
            </div>
            {onRetry && (
              <button
                onClick={onRetry}
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-all"
              >
                Retry Generation
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {STAGES.map((stg, idx) => {
              const isCurrent = stage.toLowerCase().includes(stg.slice(0, 15).toLowerCase());
              const isPassed = percent > (idx + 1) * 9;

              return (
                <div
                  key={idx}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs transition-colors ${
                    isCurrent
                      ? "bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-medium"
                      : isPassed
                      ? "text-slate-400"
                      : "text-slate-600"
                  }`}
                >
                  {isPassed ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  ) : isCurrent ? (
                    <Loader2 className="h-4 w-4 text-indigo-400 animate-spin shrink-0" />
                  ) : (
                    <div className="h-2 w-2 rounded-full bg-slate-800 shrink-0 ml-1 mr-1" />
                  )}
                  <span className="truncate">{stg}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
