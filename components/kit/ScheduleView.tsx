"use client";

import { Schedule, Question } from "@/lib/validation/kitSchema";
import { Calendar, Clock, CheckCircle, HelpCircle } from "lucide-react";

interface ScheduleViewProps {
  schedule: Schedule;
  questions: Question[];
}

export default function ScheduleView({ schedule, questions }: ScheduleViewProps) {
  const questionMap = new Map<string, Question>();
  questions.forEach((q) => questionMap.set(q.id, q));

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-[#121215] p-4 rounded-xl border border-zinc-200 dark:border-zinc-800/90 flex items-center justify-between shadow-xs dark:shadow-none">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-zinc-700 dark:text-zinc-200" />
          <span className="text-sm font-semibold text-zinc-900 dark:text-white">Study Roadmap ({schedule.days_available} Days)</span>
        </div>
        <span className="text-[11px] font-mono text-zinc-600 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 px-2.5 py-0.5 rounded border border-zinc-200 dark:border-zinc-700/60">
          Deterministic Allocation
        </span>
      </div>

      <div className="space-y-3.5">
        {schedule.days.map((day) => (
          <div key={day.day} className="bg-white dark:bg-[#121215] p-5 rounded-xl border border-zinc-200 dark:border-zinc-800/90 space-y-3 shadow-xs dark:shadow-none">
            <div className="flex items-center justify-between gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="flex h-7 w-7 items-center justify-center rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white font-mono font-bold text-xs border border-zinc-200 dark:border-zinc-700/60">
                  D{day.day}
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-zinc-900 dark:text-white">{day.focus}</h4>
                  <span className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400">Day {day.day} of {schedule.days_available}</span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-xs font-mono text-zinc-700 dark:text-zinc-300 px-2.5 py-0.5 rounded bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                <Clock className="h-3.5 w-3.5 text-zinc-400" />
                <span>{day.minutes} mins</span>
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-mono uppercase text-zinc-500 dark:text-zinc-400 block">
                Target Questions ({day.question_ids.length}):
              </span>

              {day.question_ids.length === 0 ? (
                <p className="text-xs text-zinc-500 font-sans italic">Self-directed review and mock interview practice session.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {day.question_ids.map((qId) => {
                    const q = questionMap.get(qId);
                    return (
                      <div
                        key={qId}
                        className="p-2.5 rounded-lg bg-zinc-50 dark:bg-[#18181b] border border-zinc-200 dark:border-zinc-800 text-xs flex items-start gap-2 text-zinc-700 dark:text-zinc-300 font-sans"
                      >
                        <HelpCircle className="h-3.5 w-3.5 text-zinc-400 shrink-0 mt-0.5" />
                        <div className="line-clamp-2">
                          <span className="font-mono text-zinc-500 dark:text-zinc-400 mr-1">[{qId}]:</span>
                          {q ? q.prompt : "Custom Question"}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

