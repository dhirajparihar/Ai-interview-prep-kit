import { GeminiClient } from "@/lib/llm/geminiClient";
import { Flashcard, Requirement } from "@/lib/validation/kitSchema";

export class FlashcardGenerator {
  private llm: GeminiClient;

  constructor() {
    this.llm = new GeminiClient();
  }

  public async generateFlashcards(requirements: Requirement[]): Promise<Flashcard[]> {
    if (requirements.length === 0) return [];

    const systemInstruction = `
You are an expert technical interview study coach. Generate concise, effective study flashcards testing core concepts, definitions, trade-offs, and commands for the listed job requirements.

STRICT RULES:
1. Every flashcard MUST reference the requirement ID it covers (e.g. ["r1"]).
2. Front should be a crisp question or prompt. Back should be a clear, memorable answer.
`;

    const schemaDescription = `
[
  {
    "id": "f1",
    "front": "Flashcard front prompt / question",
    "back": "Flashcard back concise explanation / answer",
    "requirement_ids": ["r1"]
  }
]
`;

    try {
      const generated = await this.llm.generateJSON<Flashcard[]>(
        systemInstruction,
        JSON.stringify(requirements, null, 2),
        schemaDescription
      );

      return (generated || []).map((card, idx) => ({
        id: card.id || `f${idx + 1}`,
        front: card.front || "Core Concept",
        back: card.back || "Explanation",
        requirement_ids: Array.isArray(card.requirement_ids) && card.requirement_ids.length > 0
          ? card.requirement_ids
          : [requirements[idx % requirements.length]?.id || "r1"],
        state: "generated",
      }));
    } catch {
      return this.heuristicFlashcards(requirements);
    }
  }

  private heuristicFlashcards(requirements: Requirement[]): Flashcard[] {
    return requirements.map((req, idx) => ({
      id: `f${idx + 1}`,
      front: `What are the core technical principles of ${req.text}?`,
      back: `Key principles include modularity, error handling, performance optimization, and adhering to best practice design patterns.`,
      requirement_ids: [req.id],
      state: "generated",
    }));
  }
}
