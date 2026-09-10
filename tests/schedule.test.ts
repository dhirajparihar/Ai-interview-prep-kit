import { describe, it, expect } from "vitest";
import { allocateSchedule } from "../lib/scheduling/scheduleAllocator";
import { Requirement, Question } from "../lib/validation/kitSchema";

describe("Schedule Allocation Engine", () => {
  const reqs: Requirement[] = [
    { id: "r1", text: "React experience", kind: "technical", priority: "must" },
    { id: "r2", text: "Distributed systems", kind: "technical", priority: "must" },
    { id: "r3", text: "GraphQL optional", kind: "technical", priority: "nice" },
  ];

  const questions: Question[] = [
    { id: "q1", requirement_ids: ["r1"], category: "technical", prompt: "P1", answer_outline: "A1", difficulty: 2, state: "generated" },
    { id: "q2", requirement_ids: ["r2"], category: "system-design", prompt: "P2", answer_outline: "A2", difficulty: 3, state: "generated" },
    { id: "q3", requirement_ids: ["r3"], category: "technical", prompt: "P3", answer_outline: "A3", difficulty: 1, state: "generated" },
  ];

  it("should generate exact number of days for 1 day request", () => {
    const schedule = allocateSchedule(reqs, questions, 1);
    expect(schedule.days_available).toBe(1);
    expect(schedule.days).toHaveLength(1);
    expect(schedule.days[0].day).toBe(1);
    expect(schedule.days[0].question_ids).toContain("q1");
    expect(schedule.days[0].question_ids).toContain("q2");
    expect(Number.isInteger(schedule.days[0].minutes)).toBe(true);
  });

  it("should generate exact number of days for 5 days request", () => {
    const schedule = allocateSchedule(reqs, questions, 5);
    expect(schedule.days_available).toBe(5);
    expect(schedule.days).toHaveLength(5);
    schedule.days.forEach((day, idx) => {
      expect(day.day).toBe(idx + 1);
      expect(Number.isInteger(day.minutes)).toBe(true);
    });
  });

  it("should generate exact number of days for 60 days request", () => {
    const schedule = allocateSchedule(reqs, questions, 60);
    expect(schedule.days_available).toBe(60);
    expect(schedule.days).toHaveLength(60);
  });

  it("should place harder and MUST-have questions earlier in the schedule", () => {
    const schedule = allocateSchedule(reqs, questions, 3);
    // q2 has difficulty 3 and MUST priority, so it should land on Day 1
    expect(schedule.days[0].question_ids).toContain("q2");
  });

  it("should ensure every scheduled question ID exists in the provided questions list", () => {
    const schedule = allocateSchedule(reqs, questions, 5);
    const validQuestionIds = new Set(questions.map((q) => q.id));

    schedule.days.forEach((day) => {
      day.question_ids.forEach((qId) => {
        expect(validQuestionIds.has(qId)).toBe(true);
      });
    });
  });
});
