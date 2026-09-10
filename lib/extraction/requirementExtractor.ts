import { GeminiClient } from "@/lib/llm/geminiClient";
import { Requirement, Role } from "@/lib/validation/kitSchema";

export class RequirementExtractor {
  private llm: GeminiClient;

  constructor() {
    this.llm = new GeminiClient();
  }

  public async extractRequirements(jdText: string): Promise<Role> {
    const systemInstruction = `
You are an expert technical recruiter and role analyst. Extract exact role requirements and breakdown from the provided Job Description.

STRICT RULES:
1. Do NOT invent requirements that are not in the job description text.
2. If the JD is a two-line stub or thin text, return ONLY the actual requirements found in those lines.
3. Every requirement must have a stable ID starting with "r" (r1, r2, r3, ...).
4. Distinguish carefully between "must" (explicitly required, mandatory, minimum years experience) and "nice" (plus, preferred, optional, bonus points for).
5. Categorize each requirement into "technical", "behavioural", or "domain".
`;

    const schemaDescription = `
{
  "title": "Role Title string",
  "seniority": "Seniority string e.g. Senior, Mid-Level, Lead",
  "responsibilities": ["Array of key responsibility strings"],
  "requirements": [
    {
      "id": "r1",
      "text": "Explicit requirement statement from JD",
      "kind": "technical | behavioural | domain",
      "priority": "must | nice"
    }
  ]
}
`;

    try {
      const extracted = await this.llm.generateJSON<Role>(
        systemInstruction,
        jdText,
        schemaDescription
      );

      // Ensure stable IDs and defaults
      const requirements: Requirement[] = (extracted.requirements || []).map((req, idx) => ({
        id: req.id || `r${idx + 1}`,
        text: req.text || "Role expectation",
        kind: ["technical", "behavioural", "domain"].includes(req.kind)
          ? req.kind
          : "technical",
        priority: req.priority === "nice" ? "nice" : "must",
      }));

      return {
        title: extracted.title || "Target Role",
        seniority: extracted.seniority || "Not specified",
        responsibilities: Array.isArray(extracted.responsibilities)
          ? extracted.responsibilities
          : [],
        requirements,
        state: "generated",
      };
    } catch {
      // Rule 22: Heuristic requirement extraction for thin JDs or when LLM API key is not present
      return this.heuristicExtract(jdText);
    }
  }

  private heuristicExtract(jdText: string): Role {
    const lines = jdText.split("\n").map((l) => l.trim()).filter(Boolean);
    const title = lines[0] || "Software Engineer";
    const reqs: Requirement[] = [];

    lines.forEach((line, idx) => {
      if (line.length > 5 && idx > 0) {
        const isNice = /nice|plus|preferred|bonus|optional/i.test(line);
        const isBehav = /mentor|lead|communication|collaboration|team/i.test(line);
        const isDomain = /fintech|healthcare|compliance|crypto|ecommerce/i.test(line);

        reqs.push({
          id: `r${idx}`,
          text: line,
          kind: isBehav ? "behavioural" : isDomain ? "domain" : "technical",
          priority: isNice ? "nice" : "must",
        });
      }
    });

    if (reqs.length === 0) {
      reqs.push({
        id: "r1",
        text: jdText.trim() || "Perform core role responsibilities",
        kind: "technical",
        priority: "must",
      });
    }

    return {
      title,
      seniority: "Mid-Senior",
      responsibilities: ["Fulfill technical objectives", "Collaborate with team"],
      requirements: reqs,
      state: "generated",
    };
  }
}
