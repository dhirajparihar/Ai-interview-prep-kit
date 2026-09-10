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
      <div className="glass-panel p-4 rounded-xl border border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-indigo-400" />
          <span className="text-sm font-bold text-white">Study Roadmap ({schedule.days_available} Days)</span>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
          Deterministic Allocation
        </span>
      </div>

      <div className="space-y-4">
        {schedule.days.map((day) => (
          <div key={day.day} className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between gap-2 border-b border-slate-850 pb-3">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white font-bold text-xs shadow-md shadow-indigo-600/20">
                  D{day.day}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">{day.focus}</h4>
                  <span className="text-[11px] text-slate-400">Day {day.day} of {schedule.days_available}</span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-800 text-slate-300">
                <Clock className="h-3.5 w-3.5 text-indigo-400" />
                <span>{day.minutes} mins</span>
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block">
                Target Questions ({day.question_ids.length}):
              </span>

              {day.question_ids.length === 0 ? (
                <p className="text-xs text-slate-500 italic">Self-directed review and mock interview practice session.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {day.question_ids.map((qId) => {
                    const q = questionMap.get(qId);
                    return (
                      <div
                        key={qId}
                        className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-850 text-xs flex items-start gap-2 text-slate-300"
                      >
                        <HelpCircle className="h-3.5 w-3.5 text-indigo-400 shrink-0 mt-0.5" />
                        <div className="line-clamp-2">
                          <span className="font-semibold text-white mr-1">[{qId}]:</span>
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
