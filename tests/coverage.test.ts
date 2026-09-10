import { describe, it, expect } from "vitest";
import { checkCoverage } from "../lib/coverage/coverageChecker";
import { Requirement, Question } from "../lib/validation/kitSchema";

describe("Coverage Checker Engine", () => {
  const reqs: Requirement[] = [
    { id: "r1", text: "5+ years React experience", kind: "technical", priority: "must" },
    { id: "r2", text: "Distributed systems design", kind: "technical", priority: "must" },
    { id: "r3", text: "Mentor junior engineers", kind: "behavioural", priority: "must" },
    { id: "r4", text: "GraphQL experience is a plus", kind: "technical", priority: "nice" },
  ];

  it("should return 0 uncovered requirements when all requirements are referenced in questions", () => {
    const questions: Question[] = [
      { id: "q1", requirement_ids: ["r1"], category: "technical", prompt: "P1", answer_outline: "A1", difficulty: 2, state: "generated" },
      { id: "q2", requirement_ids: ["r2"], category: "system-design", prompt: "P2", answer_outline: "A2", difficulty: 3, state: "generated" },
      { id: "q3", requirement_ids: ["r3"], category: "behavioural", prompt: "P3", answer_outline: "A3", difficulty: 1, state: "generated" },
      { id: "q4", requirement_ids: ["r4"], category: "technical", prompt: "P4", answer_outline: "A4", difficulty: 1, state: "generated" },
    ];

    const result = checkCoverage(reqs, questions, 1);
    expect(result.uncovered_requirement_ids).toEqual([]);
    expect(result.must_uncovered_ids).toEqual([]);
    expect(result.covered_requirement_ids).toHaveLength(4);
  });

  it("should accurately identify uncovered MUST and NICE requirements", () => {
    const questions: Question[] = [
      { id: "q1", requirement_ids: ["r1"], category: "technical", prompt: "P1", answer_outline: "A1", difficulty: 2, state: "generated" },
    ];

    const result = checkCoverage(reqs, questions, 1);
    expect(result.uncovered_requirement_ids).toContain("r2");
    expect(result.uncovered_requirement_ids).toContain("r3");
    expect(result.uncovered_requirement_ids).toContain("r4");

    expect(result.must_uncovered_ids).toEqual(["r2", "r3"]);
    expect(result.nice_uncovered_ids).toEqual(["r4"]);
  });

  it("should handle questions covering multiple requirement IDs simultaneously", () => {
    const questions: Question[] = [
      { id: "q1", requirement_ids: ["r1", "r2", "r3", "r4"], category: "system-design", prompt: "P1", answer_outline: "A1", difficulty: 3, state: "generated" },
    ];

    const result = checkCoverage(reqs, questions, 1);
    expect(result.uncovered_requirement_ids).toEqual([]);
    expect(result.must_uncovered_ids).toEqual([]);
  });
});
