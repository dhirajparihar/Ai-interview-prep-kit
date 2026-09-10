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
      <div className="glass-panel p-8 rounded-2xl text-center max-w-md mx-auto my-12">
        <h3 className="text-lg font-bold text-white mb-2">No Flashcards in Deck</h3>
        <p className="text-xs text-slate-400 mb-4">Generate flashcards in the main kit page first.</p>
        <Link href={`/kits/${kitId}`} className="text-xs font-semibold text-indigo-400 hover:underline">
          Return to Kit
        </Link>
      </div>
    );
  }

  if (completed) {
    return (
      <div className="glass-panel p-8 rounded-2xl text-center max-w-md mx-auto my-12 border border-slate-800 space-y-6">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <Award className="h-7 w-7" />
        </div>

        <div>
          <h3 className="text-2xl font-extrabold text-white">Practice Session Complete!</h3>
          <p className="text-xs text-slate-400 mt-1">You reviewed {deck.length} flashcards in this deck.</p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20">
            <span className="text-[10px] font-semibold text-red-400 block uppercase">Low</span>
            <span className="text-lg font-bold text-white">{scores.low}</span>
          </div>
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
            <span className="text-[10px] font-semibold text-amber-400 block uppercase">Medium</span>
            <span className="text-lg font-bold text-white">{scores.med}</span>
          </div>
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <span className="text-[10px] font-semibold text-emerald-400 block uppercase">High</span>
            <span className="text-lg font-bold text-white">{scores.high}</span>
          </div>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={handleRestart}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white transition-colors"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Practice Again</span>
          </button>

          <Link
            href={`/kits/${kitId}`}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white transition-colors"
          >
            <span>Back to Kit</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
      {/* Progress */}
      <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
        <span>Card {currentIndex + 1} of {deck.length}</span>
        <span className="text-indigo-400">{Math.round(((currentIndex + 1) / deck.length) * 100)}% Complete</span>
      </div>

      <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
        <div
          className="h-full bg-indigo-500 transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / deck.length) * 100}%` }}
        />
      </div>

      {/* Card */}
      <div className="glass-panel p-8 rounded-3xl border border-slate-800 min-h-[280px] flex flex-col justify-between shadow-2xl relative">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-md border border-indigo-500/20">
              Requirement: {currentCard.requirement_ids.join(", ")}
            </span>
            {currentCard.confidence ? (
              <span className="text-[11px] text-slate-400">Previous Rating: {currentCard.confidence}/3</span>
            ) : (
              <span className="text-[11px] text-slate-500 italic">Unreviewed</span>
            )}
          </div>

          <h3 className="text-lg font-bold text-white leading-relaxed pt-2">{currentCard.front}</h3>

          {revealed && (
            <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 text-sm text-indigo-100 leading-relaxed mt-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 block mb-1">Answer Explanation:</span>
              <p>{currentCard.back}</p>
            </div>
          )}
        </div>

        {!revealed ? (
          <button
            onClick={() => setRevealed(true)}
            className="w-full mt-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2"
          >
            <Eye className="h-4 w-4 text-indigo-400" />
            <span>Reveal Answer</span>
          </button>
        ) : (
          <div className="space-y-2 mt-6 pt-4 border-t border-slate-800">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 text-center block">
              How confident were you?
            </span>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => handleConfidence(1)}
                className="py-2.5 px-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-300 text-xs font-bold transition-all hover:scale-[1.02]"
              >
                1 • Low
              </button>
              <button
                onClick={() => handleConfidence(2)}
                className="py-2.5 px-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 text-amber-300 text-xs font-bold transition-all hover:scale-[1.02]"
              >
                2 • Medium
              </button>
              <button
                onClick={() => handleConfidence(3)}
                className="py-2.5 px-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-300 text-xs font-bold transition-all hover:scale-[1.02]"
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
