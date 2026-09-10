import { describe, it, expect } from "vitest";
import { validateKit, KitData } from "../lib/validation/kitSchema";

describe("Kit Schema Validation Engine", () => {
  const validKit: KitData = {
    source: {
      company: "Acme Corp",
      company_url: "https://acme.com",
      role: "Backend Engineer",
      location: "Remote",
      jd_chars: 1200,
      researched_at: "2026-09-10T12:00:00Z",
      pages_used: ["https://acme.com/careers"],
    },
    company_brief: {
      summary: "Acme builds scalable cloud software.",
      what_they_do: "Enterprise microservices and developer tools.",
      sources: ["https://acme.com/about"],
      state: "generated",
    },
    role: {
      title: "Backend Engineer",
      seniority: "Senior",
      responsibilities: ["Build scalable APIs", "Maintain microservices"],
      requirements: [
        { id: "r1", text: "5+ years Node.js", kind: "technical", priority: "must" },
      ],
      state: "generated",
    },
    questions: [
      {
        id: "q1",
        requirement_ids: ["r1"],
        category: "technical",
        prompt: "Explain event loop in Node.js",
        answer_outline: "Covers call stack, event queue, libuv microtasks.",
        difficulty: 2,
        state: "generated",
      },
    ],
    flashcards: [
      {
        id: "f1",
        front: "What is libuv?",
        back: "Multi-platform C library providing asynchronous I/O.",
        requirement_ids: ["r1"],
        state: "generated",
      },
    ],
    schedule: {
      days_available: 5,
      days: [
        { day: 1, focus: "Core Technical Concepts", question_ids: ["q1"], minutes: 60 },
        { day: 2, focus: "Mock Interview", question_ids: [], minutes: 30 },
        { day: 3, focus: "Review", question_ids: [], minutes: 30 },
        { day: 4, focus: "Review", question_ids: [], minutes: 30 },
        { day: 5, focus: "Final Review", question_ids: [], minutes: 30 },
      ],
    },
    coverage: {
      uncovered_requirement_ids: [],
      passes: 2,
    },
  };

  it("should validate a completely conformant Appendix A Kit payload without throwing", () => {
    const validated = validateKit(validKit);
    expect(validated.source.company).toBe("Acme Corp");
    expect(validated.questions[0].difficulty).toBe(2);
  });

  it("should throw Zod error if difficulty is outside range 1-3", () => {
    const invalidKit = JSON.parse(JSON.stringify(validKit));
    invalidKit.questions[0].difficulty = 5; // Invalid! Must be 1-3

    expect(() => validateKit(invalidKit)).toThrow();
  });

  it("should throw Zod error if requirement kind is invalid", () => {
    const invalidKit = JSON.parse(JSON.stringify(validKit));
    invalidKit.role.requirements[0].kind = "magic"; // Invalid!

    expect(() => validateKit(invalidKit)).toThrow();
  });
});
