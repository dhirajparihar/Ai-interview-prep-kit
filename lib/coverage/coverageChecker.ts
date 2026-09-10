import { Requirement, Question, Coverage } from "@/lib/validation/kitSchema";

export interface CoverageResult extends Coverage {
  covered_requirement_ids: string[];
  must_uncovered_ids: string[];
  nice_uncovered_ids: string[];
}

export function checkCoverage(
  requirements: Requirement[],
  questions: Question[],
  passes = 1
): CoverageResult {
  const coveredSet = new Set<string>();

  for (const question of questions) {
    if (Array.isArray(question.requirement_ids)) {
      for (const reqId of question.requirement_ids) {
        coveredSet.add(reqId);
      }
    }
  }

  const uncovered_requirement_ids: string[] = [];
  const must_uncovered_ids: string[] = [];
  const nice_uncovered_ids: string[] = [];
  const covered_requirement_ids: string[] = [];

  for (const req of requirements) {
    if (coveredSet.has(req.id)) {
      covered_requirement_ids.push(req.id);
    } else {
      uncovered_requirement_ids.push(req.id);
      if (req.priority === "must") {
        must_uncovered_ids.push(req.id);
      } else {
        nice_uncovered_ids.push(req.id);
      }
    }
  }

  return {
    uncovered_requirement_ids,
    covered_requirement_ids,
    must_uncovered_ids,
    nice_uncovered_ids,
    passes,
  };
}
