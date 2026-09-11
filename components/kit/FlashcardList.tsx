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
        <div className="col-span-2 text-center py-8 text-zinc-500 text-xs font-mono">No flashcards generated yet.</div>
      ) : (
        flashcards.map((card, idx) => {
          const isFlipped = flippedCards[card.id] || false;

          return (
            <div
              key={card.id}
              onClick={() => toggleFlip(card.id)}
              className="bg-white dark:bg-[#121215] p-5 rounded-xl border border-zinc-200 dark:border-zinc-800/90 hover:border-zinc-300 dark:hover:border-zinc-700 cursor-pointer min-h-[160px] flex flex-col justify-between transition-colors shadow-sm dark:shadow-none select-none group"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-[11px] font-mono font-semibold text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded border border-zinc-200 dark:border-zinc-700/60">
                    Card #{idx + 1}
                  </span>
                  <span className="text-[10px] font-mono text-zinc-500 flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    <span>Click to flip</span>
                  </span>
                </div>

                {isFlipped ? (
                  <div className="text-xs text-zinc-800 dark:text-zinc-200 font-sans leading-relaxed bg-zinc-50 dark:bg-[#18181b] p-3 rounded-lg border border-zinc-200 dark:border-zinc-800">
                    <span className="font-mono text-zinc-500 dark:text-zinc-400 block text-[10px] uppercase mb-1">Answer</span>
                    {card.back}
                  </div>
                ) : (
                  <div className="text-sm font-semibold text-zinc-900 dark:text-white leading-snug">
                    {card.front}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-1.5 pt-3 text-[10px] font-mono text-zinc-500 border-t border-zinc-100 dark:border-zinc-800/80">
                <Tag className="h-3 w-3 text-zinc-500" />
                <span>Reqs: {card.requirement_ids.join(", ")}</span>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}


