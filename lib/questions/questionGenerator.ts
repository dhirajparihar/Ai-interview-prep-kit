import { GeminiClient } from "@/lib/llm/geminiClient";
import { Question, Requirement } from "@/lib/validation/kitSchema";

export class QuestionGenerator {
  private llm: GeminiClient;

  constructor() {
    this.llm = new GeminiClient();
  }

  public async generateQuestionsForCategory(
    category: "technical" | "behavioural" | "system-design" | "company-fit",
    requirements: Requirement[],
    companyContext: { companyName: string; hiringText: string; discussionText: string },
    targetRequirementIds?: string[]
  ): Promise<Question[]> {
    const activeReqs = targetRequirementIds
      ? requirements.filter((r) => targetRequirementIds.includes(r.id))
      : requirements;

    if (activeReqs.length === 0) return [];

    const categoryInstructions: Record<string, string> = {
      technical: `Generate challenging technical interview questions testing specific libraries, tools, programming languages, and algorithms mentioned in the requirements. Provide detailed answer outlines with key code/architectural points.`,
      behavioural: `Generate STAR-format (Situation, Task, Action, Result) behavioural interview questions based on leadership, teamwork, mentoring, and past project experience in the requirements.`,
      "system-design": `Generate distributed systems design, data architecture, and scalability interview questions relevant to the technical stack and role context.`,
      "company-fit": `Generate company-specific culture, mission, and interview process questions leveraging actual research on ${companyContext.companyName}.`,
    };

    const systemInstruction = `
You are a principal technical interviewer at ${companyContext.companyName}.
${categoryInstructions[category]}

STRICT RULES:
1. Every generated question MUST map to one or more requirement IDs provided in the requirements list.
2. Difficulty MUST be an integer: 1 (Easy/Foundational), 2 (Medium/Practical), or 3 (Hard/Advanced).
3. Do NOT produce generic, fluff questions. Make prompts realistic and realistic for a live interview.
`;

    const schemaDescription = `
[
  {
    "id": "q1",
    "requirement_ids": ["r1"],
    "category": "${category}",
    "prompt": "Specific interview question prompt",
    "answer_outline": "Key points expected in a stellar answer",
    "difficulty": 2
  }
]
`;

    const untrustedContent = `
TARGET REQUIREMENTS:
${JSON.stringify(activeReqs, null, 2)}

COMPANY & INTERVIEW RESEARCH CONTEXT:
Company: ${companyContext.companyName}
Hiring Info: ${companyContext.hiringText.slice(0, 1500)}
Public Discussion: ${companyContext.discussionText.slice(0, 1500)}
`;

    try {
      const generated = await this.llm.generateJSON<Question[]>(
        systemInstruction,
        untrustedContent,
        schemaDescription
      );

      return (generated || []).map((q, idx) => ({
        id: q.id || `q_${category}_${idx + 1}`,
        requirement_ids: Array.isArray(q.requirement_ids) && q.requirement_ids.length > 0
          ? q.requirement_ids
          : [activeReqs[0]?.id || "r1"],
        category,
        prompt: q.prompt || "Describe your approach to this requirement.",
        answer_outline: q.answer_outline || "Demonstrate core domain competence.",
        difficulty: [1, 2, 3].includes(q.difficulty) ? q.difficulty : 2,
        state: "generated",
      }));
    } catch {
      // Rule 22: Heuristic fallback question generation if LLM is unavailable
      return this.heuristicQuestions(category, activeReqs);
    }
  }

  private heuristicQuestions(
    category: "technical" | "behavioural" | "system-design" | "company-fit",
    requirements: Requirement[]
  ): Question[] {
    return requirements.map((req, idx) => {
      let prompt = `How would you demonstrate proficiency in ${req.text}?`;
      let answerOutline = `Explain key concepts, trade-offs, and practical experience with ${req.text}.`;
      let difficulty = 2;

      if (category === "technical") {
        prompt = `Explain how you implement and optimize ${req.text} in a production codebase.`;
        answerOutline = `Cover architecture, error handling, performance consideration, and automated testing for ${req.text}.`;
        difficulty = req.priority === "must" ? 3 : 2;
      } else if (category === "behavioural") {
        prompt = `Describe a situation where you had to navigate challenges involving ${req.text}.`;
        answerOutline = `Use the STAR method: Describe the Situation, your Task, the Action you took, and the quantifiable Result.`;
        difficulty = 2;
      } else if (category === "system-design") {
        prompt = `Design a high-throughput, fault-tolerant system that fulfills ${req.text}.`;
        answerOutline = `Address data modeling, API boundaries, caching strategy, bottleneck identification, and failure recovery.`;
        difficulty = 3;
      } else if (category === "company-fit") {
        prompt = `Why are you excited about working on ${req.text} at our company?`;
        answerOutline = `Align personal career goals, technical background, and passion for the company's product vision.`;
        difficulty = 1;
      }

      return {
        id: `q_${category}_${req.id}_${idx + 1}`,
        requirement_ids: [req.id],
        category,
        prompt,
        answer_outline: answerOutline,
        difficulty,
        state: "generated",
      };
    });
  }
}
