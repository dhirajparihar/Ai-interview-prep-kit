"use client";

import { useState } from "react";
import { PracticeSessionCard } from "@/lib/services/practiceService";
import { Eye, ArrowRight, RotateCcw, CheckCircle, Flame, Award } from "lucide-react";
import Link from "next/link";

interface FlashcardDeckProps {
  kitId: string;
  initialDeck: PracticeSessionCard[];
}

export default function FlashcardDeck({ kitId, initialDeck }: FlashcardDeckProps) {
  const [deck, setDeck] = useState<PracticeSessionCard[]>(initialDeck);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [scores, setScores] = useState<{ low: number; med: number; high: number }>({
    low: 0,
    med: 0,
    high: 0,
  });

  const currentCard = deck[currentIndex];

  const handleConfidence = async (confidence: number) => {
    if (!currentCard) return;

    if (confidence === 1) setScores((s) => ({ ...s, low: s.low + 1 }));
    else if (confidence === 2) setScores((s) => ({ ...s, med: s.med + 1 }));
    else if (confidence === 3) setScores((s) => ({ ...s, high: s.high + 1 }));

    // Send rating to backend
    fetch(`/api/kits/${kitId}/practice`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cardId: currentCard.id, confidence }),
    });

    if (currentIndex + 1 < deck.length) {
      setCurrentIndex((i) => i + 1);
      setRevealed(false);
    } else {
      setCompleted(true);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setRevealed(false);
    setCompleted(false);
    setScores({ low: 0, med: 0, high: 0 });
  };

  if (deck.length === 0) {
    return (
      <div className="bg-white dark:bg-[#121215] border border-zinc-200 dark:border-zinc-800 p-8 rounded-xl text-center max-w-md mx-auto my-12 shadow-xs dark:shadow-none">
        <h3 className="text-base font-semibold text-zinc-900 dark:text-white mb-1.5">No Flashcards in Deck</h3>
        <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-4">Generate flashcards in the main kit page first.</p>
        <Link href={`/kits/${kitId}`} className="text-xs font-semibold text-zinc-900 dark:text-white hover:underline">
          Return to Kit
        </Link>
      </div>
    );
  }

  if (completed) {
    return (
      <div className="bg-white dark:bg-[#121215] border border-zinc-200 dark:border-zinc-800 p-8 rounded-xl text-center max-w-md mx-auto my-12 space-y-6 shadow-xs dark:shadow-none">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700/60">
          <Award className="h-6 w-6" />
        </div>

        <div>
          <h3 className="text-xl font-bold text-zinc-900 dark:text-white">Practice Session Complete</h3>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 font-sans">You reviewed {deck.length} flashcards in this deck.</p>
        </div>

        <div className="grid grid-cols-3 gap-2.5 font-mono">
          <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
            <span className="text-[10px] font-medium text-zinc-500 dark:text-zinc-400 block uppercase">Needs Practice</span>
            <span className="text-base font-bold text-red-600 dark:text-red-400">{scores.low}</span>
          </div>
          <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
            <span className="text-[10px] font-medium text-zinc-500 dark:text-zinc-400 block uppercase">Moderate</span>
            <span className="text-base font-bold text-amber-600 dark:text-amber-400">{scores.med}</span>
          </div>
          <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
            <span className="text-[10px] font-medium text-zinc-500 dark:text-zinc-400 block uppercase">Mastered</span>
            <span className="text-base font-bold text-emerald-600 dark:text-emerald-400">{scores.high}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 pt-2">
          <button
            onClick={handleRestart}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-md bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-xs font-medium text-zinc-800 dark:text-zinc-200 transition-colors border border-zinc-200 dark:border-zinc-700"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Practice Again</span>
          </button>

          <Link
            href={`/kits/${kitId}`}
            className="flex-1 flex items-center justify-center gap-1 py-2 px-3 rounded-md bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-xs font-semibold transition-colors"
          >
            <span>Back to Kit</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto space-y-5">
      {/* Progress */}
      <div className="flex items-center justify-between text-xs font-mono text-zinc-600 dark:text-zinc-400">
        <span>Card {currentIndex + 1} of {deck.length}</span>
        <span className="text-zinc-900 dark:text-zinc-200 font-semibold">{Math.round(((currentIndex + 1) / deck.length) * 100)}% Complete</span>
      </div>

      <div className="w-full h-1 bg-zinc-200 dark:bg-zinc-900 rounded-full overflow-hidden border border-zinc-200 dark:border-zinc-800">
        <div
          className="h-full bg-zinc-900 dark:bg-white transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / deck.length) * 100}%` }}
        />
      </div>

      {/* Card */}
      <div className="bg-white dark:bg-[#121215] p-6 sm:p-8 rounded-xl border border-zinc-200 dark:border-zinc-800/90 min-h-[280px] flex flex-col justify-between shadow-xs dark:shadow-xl relative">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-medium text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 px-2.5 py-0.5 rounded border border-zinc-200 dark:border-zinc-700/60">
              Requirement: {currentCard.requirement_ids.join(", ")}
            </span>
            {currentCard.confidence ? (
              <span className="text-[11px] font-mono text-zinc-500">Prev Rating: {currentCard.confidence}/3</span>
            ) : (
              <span className="text-[11px] font-mono text-zinc-500">Unreviewed</span>
            )}
          </div>

          <h3 className="text-base sm:text-lg font-semibold text-zinc-900 dark:text-white leading-relaxed pt-1">{currentCard.front}</h3>

          {revealed && (
            <div className="p-4 rounded-lg bg-zinc-50 dark:bg-[#18181b] border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-800 dark:text-zinc-200 leading-relaxed mt-4 transition-all duration-200">
              <span className="text-[10px] font-mono uppercase text-zinc-500 dark:text-zinc-400 block mb-1">Answer Explanation</span>
              <p className="font-sans">{currentCard.back}</p>
            </div>
          )}
        </div>

        {!revealed ? (
          <button
            onClick={() => setRevealed(true)}
            className="w-full mt-6 py-2.5 rounded-md bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-zinc-200 font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-xs"
          >
            <Eye className="h-3.5 w-3.5" />
            <span>Reveal Answer</span>
          </button>
        ) : (
          <div className="space-y-2 mt-6 pt-4 border-t border-zinc-200 dark:border-zinc-800">
            <span className="text-[10px] font-mono uppercase text-zinc-500 dark:text-zinc-400 text-center block">
              Confidence Rating
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => handleConfidence(1)}
                className="py-2 px-3 rounded bg-red-50 dark:bg-zinc-900 hover:bg-red-100 dark:hover:bg-zinc-800 border border-red-200 dark:border-zinc-800 text-red-700 dark:text-red-400 text-xs font-mono font-semibold transition-colors"
              >
                1 • Low
              </button>
              <button
                onClick={() => handleConfidence(2)}
                className="py-2 px-3 rounded bg-amber-50 dark:bg-zinc-900 hover:bg-amber-100 dark:hover:bg-zinc-800 border border-amber-200 dark:border-zinc-800 text-amber-700 dark:text-amber-400 text-xs font-mono font-semibold transition-colors"
              >
                2 • Medium
              </button>
              <button
                onClick={() => handleConfidence(3)}
                className="py-2 px-3 rounded bg-emerald-50 dark:bg-zinc-900 hover:bg-emerald-100 dark:hover:bg-zinc-800 border border-emerald-200 dark:border-zinc-800 text-emerald-700 dark:text-emerald-400 text-xs font-mono font-semibold transition-colors"
              >
                3 • High
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

