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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 dark:bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg bg-white dark:bg-[#121215] p-7 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-2xl relative overflow-hidden">
        <div className="text-center mb-6">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700/60 mb-3">
            {error ? (
              <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
            ) : (
              <Sparkles className="h-5 w-5 text-zinc-700 dark:text-zinc-200 animate-pulse" />
            )}
          </div>

          <h3 className="text-lg font-bold text-zinc-900 dark:text-white tracking-tight">
            {error ? "Generation Error" : "Building Your Interview Prep Kit"}
          </h3>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 font-sans">
            {error
              ? "An unexpected issue occurred during research or generation."
              : "Our pipeline is extracting requirements, crawling site data, and calculating deterministic schedules."}
          </p>
        </div>

        {!error && (
          <div className="mb-5">
            <div className="flex justify-between text-xs font-mono text-zinc-600 dark:text-zinc-400 mb-2">
              <span>{stage || "Initializing pipeline..."}</span>
              <span className="text-zinc-900 dark:text-white font-semibold">{percent}%</span>
            </div>
            <div className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-900 rounded-full overflow-hidden border border-zinc-200 dark:border-zinc-800">
              <div
                className="h-full bg-zinc-900 dark:bg-white transition-all duration-500"
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>
        )}

        {error ? (
          <div className="space-y-4">
            <div className="p-3.5 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/50 text-red-700 dark:text-red-300 text-xs font-mono leading-relaxed">
              {error}
            </div>
            {onRetry && (
              <button
                onClick={onRetry}
                className="w-full py-2 px-4 rounded-md bg-zinc-900 dark:bg-white hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-950 font-semibold text-xs transition-colors shadow-xs"
              >
                Retry Generation
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
            {STAGES.map((stg, idx) => {
              const isCurrent = stage.toLowerCase().includes(stg.slice(0, 15).toLowerCase());
              const isPassed = percent > (idx + 1) * 9;

              return (
                <div
                  key={idx}
                  className={`flex items-center gap-2.5 px-3 py-1.5 rounded-md text-xs font-mono transition-colors ${
                    isCurrent
                      ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white border border-zinc-200 dark:border-zinc-700/80 font-semibold"
                      : isPassed
                      ? "text-zinc-600 dark:text-zinc-400"
                      : "text-zinc-400 dark:text-zinc-600"
                  }`}
                >
                  {isPassed ? (
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  ) : isCurrent ? (
                    <Loader2 className="h-3.5 w-3.5 text-zinc-900 dark:text-white animate-spin shrink-0" />
                  ) : (
                    <div className="h-1.5 w-1.5 rounded-full bg-zinc-300 dark:bg-zinc-800 shrink-0 ml-1 mr-1" />
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

