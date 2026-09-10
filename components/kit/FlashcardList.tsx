"use client";

import { useState } from "react";
import { Flashcard } from "@/lib/validation/kitSchema";
import { Eye, Edit3, Save, Tag } from "lucide-react";

interface FlashcardListProps {
  flashcards: Flashcard[];
}

export default function FlashcardList({ flashcards }: FlashcardListProps) {
  const [flippedCards, setFlippedCards] = useState<Record<string, boolean>>({});

  const toggleFlip = (id: string) => {
    setFlippedCards((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {flashcards.length === 0 ? (
        <div className="col-span-2 text-center py-8 text-slate-500 text-xs">No flashcards generated yet.</div>
      ) : (
        flashcards.map((card, idx) => {
          const isFlipped = flippedCards[card.id] || false;

          return (
            <div
              key={card.id}
              onClick={() => toggleFlip(card.id)}
              className="glass-panel p-6 rounded-2xl border border-slate-800 cursor-pointer min-h-[160px] flex flex-col justify-between hover:border-indigo-500/40 transition-all select-none group"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-xs font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                    Card #{idx + 1}
                  </span>
                  <span className="text-[10px] text-slate-500 flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    <span>Click to flip</span>
                  </span>
                </div>

                {isFlipped ? (
                  <div className="text-xs text-indigo-200 font-medium leading-relaxed bg-indigo-950/30 p-3 rounded-xl border border-indigo-500/20">
                    <span className="font-semibold text-indigo-400 block text-[10px] uppercase mb-1">Answer:</span>
                    {card.back}
                  </div>
                ) : (
                  <div className="text-sm font-semibold text-white leading-snug">
                    {card.front}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-1.5 pt-3 text-[10px] text-slate-500 border-t border-slate-850">
                <Tag className="h-3 w-3 text-slate-600" />
                <span>Reqs: {card.requirement_ids.join(", ")}</span>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
