"use client";

import { useState } from "react";
import { Question } from "@/lib/validation/kitSchema";
import { Plus, Trash2, Edit3, Save, RefreshCw, BadgeAlert, Tag, MoveUp, MoveDown } from "lucide-react";

interface QuestionListProps {
  questions: Question[];
  kitId: string;
  onUpdateQuestion: (questionId: string, updatedData: Partial<Question>) => Promise<void>;
  onRegenerateCategory: (category: "technical" | "behavioural" | "system-design" | "company-fit") => Promise<void>;
}

export default function QuestionList({
  questions,
  kitId,
  onUpdateQuestion,
  onRegenerateCategory,
}: QuestionListProps) {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPrompt, setEditPrompt] = useState("");
  const [editAnswer, setEditAnswer] = useState("");
  const [regeneratingCat, setRegeneratingCat] = useState<string | null>(null);

  const categories = ["all", "technical", "behavioural", "system-design", "company-fit"];

  const filteredQuestions =
    activeCategory === "all"
      ? questions
      : questions.filter((q) => q.category === activeCategory);

  const startEditing = (q: Question) => {
    setEditingId(q.id);
    setEditPrompt(q.prompt);
    setEditAnswer(q.answer_outline);
  };

  const handleSave = async (qId: string) => {
    await onUpdateQuestion(qId, {
      prompt: editPrompt,
      answer_outline: editAnswer,
      state: "edited", // Section 18: Mark as edited to survive category regeneration
    });
    setEditingId(null);
  };

  const handleRegenerate = async (cat: "technical" | "behavioural" | "system-design" | "company-fit") => {
    setRegeneratingCat(cat);
    try {
      await onRegenerateCategory(cat);
    } finally {
      setRegeneratingCat(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Category Tabs & Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-[#121215] p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800/90 shadow-sm dark:shadow-none transition-colors">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium capitalize whitespace-nowrap transition-colors ${
                activeCategory === cat
                  ? "bg-zinc-900 dark:bg-zinc-800 text-white border border-zinc-900 dark:border-zinc-700/80"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800/40"
              }`}
            >
              {cat.replace("-", " ")}
            </button>
          ))}
        </div>

        {activeCategory !== "all" && (
          <button
            onClick={() => handleRegenerate(activeCategory as any)}
            disabled={!!regeneratingCat}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-medium transition-colors disabled:opacity-50 border border-zinc-200 dark:border-zinc-700/60"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${regeneratingCat === activeCategory ? "animate-spin" : ""}`} />
            <span>Regenerate Category</span>
          </button>
        )}
      </div>

      {/* Questions List */}
      <div className="space-y-3.5">
        {filteredQuestions.length === 0 ? (
          <div className="text-center py-8 text-zinc-500 text-xs font-mono">No questions recorded for this filter category.</div>
        ) : (
          filteredQuestions.map((q, idx) => {
            const isEditing = editingId === q.id;

            return (
              <div
                key={q.id}
                className="bg-white dark:bg-[#121215] p-5 rounded-xl border border-zinc-200 dark:border-zinc-800/90 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors shadow-sm dark:shadow-none space-y-3 relative group"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono font-semibold text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded border border-zinc-200 dark:border-zinc-700/60">
                      Q{idx + 1}
                    </span>
                    <span className="text-[11px] font-mono text-zinc-600 dark:text-zinc-400 capitalize px-2 py-0.5 rounded bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                      {q.category}
                    </span>
                    <span
                      className={`text-[11px] font-mono px-2 py-0.5 rounded border ${
                        q.difficulty === 3
                          ? "bg-red-50 dark:bg-zinc-900 text-red-700 dark:text-red-400 border-red-200 dark:border-red-900/40"
                          : q.difficulty === 2
                          ? "bg-amber-50 dark:bg-zinc-900 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900/40"
                          : "bg-emerald-50 dark:bg-zinc-900 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/40"
                      }`}
                    >
                      Diff {q.difficulty}
                    </span>
                    {q.state && q.state !== "generated" && (
                      <span className="text-[10px] font-mono font-medium uppercase px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700/60">
                        {q.state}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {isEditing ? (
                      <button
                        onClick={() => handleSave(q.id)}
                        className="flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors shadow-sm"
                      >
                        <Save className="h-3.5 w-3.5" />
                        <span>Save</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => startEditing(q)}
                        className="flex items-center gap-1 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 p-1.5 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                        <span>Edit</span>
                      </button>
                    )}
                  </div>
                </div>

                {isEditing ? (
                  <div className="space-y-3 pt-2">
                    <div>
                      <label className="block text-[10px] font-mono text-zinc-500 dark:text-zinc-400 uppercase mb-1">Question Prompt</label>
                      <textarea
                        rows={2}
                        value={editPrompt}
                        onChange={(e) => setEditPrompt(e.target.value)}
                        className="w-full bg-zinc-50 dark:bg-[#18181b] border border-zinc-300 dark:border-zinc-700/80 rounded-md p-2.5 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-zinc-500 font-sans"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono text-zinc-500 dark:text-zinc-400 uppercase mb-1">Answer Outline</label>
                      <textarea
                        rows={3}
                        value={editAnswer}
                        onChange={(e) => setEditAnswer(e.target.value)}
                        className="w-full bg-zinc-50 dark:bg-[#18181b] border border-zinc-300 dark:border-zinc-700/80 rounded-md p-2.5 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-zinc-500 font-sans"
                      />
                    </div>
                  </div>
                ) : (
                  <>
                    <h4 className="text-base font-semibold text-zinc-900 dark:text-white leading-snug">{q.prompt}</h4>
                    <div className="p-3.5 rounded-lg bg-zinc-50 dark:bg-[#18181b] border border-zinc-200 dark:border-zinc-800/80 text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed space-y-1">
                      <span className="font-mono text-zinc-500 dark:text-zinc-400 block text-[10px] uppercase tracking-wider">Answer Outline</span>
                      <p className="font-sans text-zinc-800 dark:text-zinc-200">{q.answer_outline}</p>
                    </div>

                    <div className="flex items-center gap-1.5 pt-0.5 text-[11px] font-mono text-zinc-500">
                      <Tag className="h-3 w-3 text-zinc-500" />
                      <span>Requirements: {q.requirement_ids.join(", ")}</span>
                    </div>
                  </>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}


