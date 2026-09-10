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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 glass-panel p-4 rounded-xl border border-slate-800">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold capitalize whitespace-nowrap transition-colors ${
                activeCategory === cat
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
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
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/20 text-xs font-semibold transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${regeneratingCat === activeCategory ? "animate-spin" : ""}`} />
            <span>Regenerate Category</span>
          </button>
        )}
      </div>

      {/* Questions List */}
      <div className="space-y-4">
        {filteredQuestions.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-xs">No questions found in this category.</div>
        ) : (
          filteredQuestions.map((q, idx) => {
            const isEditing = editingId === q.id;

            return (
              <div
                key={q.id}
                className="glass-panel p-5 rounded-xl border border-slate-800 space-y-3 relative group hover:border-slate-700 transition-all"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                      Q{idx + 1}
                    </span>
                    <span className="text-xs font-semibold capitalize px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      {q.category}
                    </span>
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded ${
                        q.difficulty === 3
                          ? "bg-red-500/10 text-red-400 border border-red-500/20"
                          : q.difficulty === 2
                          ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                          : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      }`}
                    >
                      Difficulty {q.difficulty}
                    </span>
                    {q.state && q.state !== "generated" && (
                      <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20">
                        {q.state}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {isEditing ? (
                      <button
                        onClick={() => handleSave(q.id)}
                        className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
                      >
                        <Save className="h-3.5 w-3.5" />
                        <span>Save</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => startEditing(q)}
                        className="flex items-center gap-1 text-xs font-medium text-slate-400 hover:text-indigo-300 p-1 rounded hover:bg-slate-800 transition-colors"
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
                      <label className="block text-[10px] font-semibold uppercase text-slate-400 mb-1">Prompt</label>
                      <textarea
                        rows={2}
                        value={editPrompt}
                        onChange={(e) => setEditPrompt(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold uppercase text-slate-400 mb-1">Answer Outline</label>
                      <textarea
                        rows={3}
                        value={editAnswer}
                        onChange={(e) => setEditAnswer(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>
                ) : (
                  <>
                    <h4 className="text-sm font-bold text-white leading-snug">{q.prompt}</h4>
                    <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-850 text-xs text-slate-300 leading-relaxed space-y-1">
                      <span className="font-semibold text-slate-400 block text-[11px] uppercase tracking-wider">Answer Outline:</span>
                      <p>{q.answer_outline}</p>
                    </div>

                    <div className="flex items-center gap-1.5 pt-1 text-[11px] text-slate-500">
                      <Tag className="h-3 w-3 text-slate-600" />
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
