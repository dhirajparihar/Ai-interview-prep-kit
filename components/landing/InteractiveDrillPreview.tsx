"use client";

import { useState } from "react";
import { ArrowRight, RotateCw, CheckCircle2, ShieldCheck, Terminal, Layers } from "lucide-react";

const SAMPLE_DRILLS = [
  {
    category: "Technical",
    role: "Senior Full-Stack Engineer @ Stripe",
    question: "How do you handle idempotent API requests during webhook retries when external payments fail?",
    answer: "Assign a deterministic idempotency key (e.g. `evt_...`) per transaction. In MongoDB/Postgres, perform an atomic `upsert` or check key existence before execution inside an isolation lock.",
    difficulty: "Hard",
    tags: ["Idempotency", "Webhooks", "System Resilience"],
  },
  {
    category: "System Design",
    role: "Staff Backend Engineer @ Vercel",
    question: "Design an edge rate-limiting algorithm that handles 50,000 requests/sec with sub-5ms latency across global POPS.",
    answer: "Use sliding window counter in Redis with memory eviction policy, or local atomic token bucket synchronized via asynchronous batched updates to central cluster.",
    difficulty: "Staff Level",
    tags: ["Rate Limiting", "Edge Computing", "Redis"],
  },
  {
    category: "Behavioral",
    role: "Lead Engineer @ Airbnb",
    question: "Describe a scenario where you disagreed with a major architectural decision and how you reached consensus.",
    answer: "Framed disagreement around empirical benchmark metrics rather than personal preference, built a 1-day proof of concept, and established clear rollback criteria.",
    difficulty: "Behavioral",
    tags: ["Leadership", "Architecture", "Trade-offs"],
  },
];

export default function InteractiveDrillPreview() {
  const [activeDrillIndex, setActiveDrillIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [masteryCount, setMasteryCount] = useState(1);

  const currentDrill = SAMPLE_DRILLS[activeDrillIndex];

  const handleNext = () => {
    setShowAnswer(false);
    setActiveDrillIndex((prev) => (prev + 1) % SAMPLE_DRILLS.length);
  };

  const handleMastered = () => {
    setMasteryCount((prev) => prev + 1);
    handleNext();
  };

  return (
    <div className="w-full max-w-3xl mx-auto mt-12 rounded-xl bg-white dark:bg-[#121215] border border-zinc-200 dark:border-zinc-800 p-6 sm:p-8 shadow-xl dark:shadow-2xl text-left transition-colors">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200 dark:border-zinc-800/80 pb-4 mb-6">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-mono font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
            LIVE PREVIEW // DRILL #{activeDrillIndex + 1}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {SAMPLE_DRILLS.map((drill, idx) => (
            <button
              key={drill.category}
              onClick={() => {
                setActiveDrillIndex(idx);
                setShowAnswer(false);
              }}
              className={`text-xs font-mono px-2.5 py-1 rounded transition-colors ${
                idx === activeDrillIndex
                  ? "bg-zinc-900 dark:bg-zinc-800 text-white border border-zinc-700"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
              }`}
            >
              {drill.category}
            </button>
          ))}
        </div>
      </div>

      {/* Role Subtitle */}
      <div className="text-xs font-mono text-zinc-500 dark:text-zinc-400 mb-2">
        {currentDrill.role}
      </div>

      {/* Question */}
      <h3 className="text-lg sm:text-xl font-semibold text-zinc-900 dark:text-white leading-snug mb-4">
        {currentDrill.question}
      </h3>

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5 mb-6">
        {currentDrill.tags.map((tag) => (
          <span
            key={tag}
            className="text-[11px] font-mono text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-2 py-0.5 rounded"
          >
            #{tag}
          </span>
        ))}
      </div>

      {/* Answer Container */}
      {showAnswer ? (
        <div className="bg-zinc-50 dark:bg-[#18181b] border border-zinc-200 dark:border-zinc-800/90 rounded-lg p-5 mb-6 transition-all duration-200">
          <div className="text-xs font-mono text-emerald-600 dark:text-emerald-400 mb-2 flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>STRUCTURED SAMPLE ANSWER</span>
          </div>
          <p className="text-sm text-zinc-800 dark:text-zinc-200 leading-relaxed font-sans">
            {currentDrill.answer}
          </p>
        </div>
      ) : (
        <div
          onClick={() => setShowAnswer(true)}
          className="cursor-pointer bg-zinc-50/50 dark:bg-[#18181b]/50 border border-dashed border-zinc-300 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-700 rounded-lg p-6 mb-6 text-center transition-colors group"
        >
          <p className="text-xs font-mono text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-800 dark:group-hover:text-zinc-200 transition-colors">
            [ CLICK TO REVEAL KEY ANSWER POINTS & MENTOR NOTES ]
          </p>
        </div>
      )}

      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
        <div className="flex items-center gap-3">
          {showAnswer ? (
            <>
              <button
                onClick={handleMastered}
                className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-md bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors shadow-sm"
              >
                <span>Mark Mastered</span>
                <CheckCircle2 className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={handleNext}
                className="flex items-center gap-1.5 text-xs font-medium px-3.5 py-2 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
              >
                <span>Skip</span>
                <RotateCw className="h-3.5 w-3.5" />
              </button>
            </>
          ) : (
            <button
              onClick={() => setShowAnswer(true)}
              className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-md bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors shadow-sm"
            >
              <span>Reveal Answer</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <div className="text-xs font-mono text-zinc-500">
          Mastered Drills: <span className="text-zinc-900 dark:text-zinc-200 font-bold">{masteryCount}</span>
        </div>
      </div>
    </div>
  );
}

