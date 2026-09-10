import { z } from "zod";

export const RequirementKindSchema = z.enum(["technical", "behavioural", "domain"]);
export const RequirementPrioritySchema = z.enum(["must", "nice"]);

export const RequirementSchema = z.object({
  id: z.string(),
  text: z.string(),
  kind: RequirementKindSchema,
  priority: RequirementPrioritySchema,
});

export const QuestionCategorySchema = z.enum([
  "technical",
  "behavioural",
  "system-design",
  "company-fit",
]);

export const QuestionSchema = z.object({
  id: z.string(),
  requirement_ids: z.array(z.string()),
  category: QuestionCategorySchema,
  prompt: z.string(),
  answer_outline: z.string(),
  difficulty: z.number().int().min(1).max(3),
  state: z.enum(["generated", "edited", "pinned"]).optional().default("generated"),
});

export const FlashcardSchema = z.object({
  id: z.string(),
  front: z.string(),
  back: z.string(),
  requirement_ids: z.array(z.string()),
  state: z.enum(["generated", "edited", "pinned"]).optional().default("generated"),
});

export const ScheduleDaySchema = z.object({
  day: z.number().int().min(1),
  focus: z.string(),
  question_ids: z.array(z.string()),
  minutes: z.number().int().min(1),
});

export const ScheduleSchema = z.object({
  days_available: z.number().int().min(1).max(60),
  days: z.array(ScheduleDaySchema),
});

export const CoverageSchema = z.object({
  uncovered_requirement_ids: z.array(z.string()),
  passes: z.number().int().min(1),
});

export const SourceSchema = z.object({
  company: z.string(),
  company_url: z.string(),
  role: z.string(),
  location: z.string(),
  jd_chars: z.number().int().min(0),
  researched_at: z.string(),
  pages_used: z.array(z.string()),
});

export const CompanyBriefSchema = z.object({
  summary: z.string(),
  what_they_do: z.string(),
  sources: z.array(z.string()),
  state: z.enum(["generated", "edited", "pinned"]).optional().default("generated"),
});

export const RoleSchema = z.object({
  title: z.string(),
  seniority: z.string(),
  responsibilities: z.array(z.string()),
  requirements: z.array(RequirementSchema),
  state: z.enum(["generated", "edited", "pinned"]).optional().default("generated"),
});

export const KitSchema = z.object({
  source: SourceSchema,
  company_brief: CompanyBriefSchema,
  role: RoleSchema,
  questions: z.array(QuestionSchema),
  flashcards: z.array(FlashcardSchema),
  schedule: ScheduleSchema,
  coverage: CoverageSchema,
});

export type Requirement = z.infer<typeof RequirementSchema>;
export type Question = z.infer<typeof QuestionSchema>;
export type Flashcard = z.infer<typeof FlashcardSchema>;
export type ScheduleDay = z.infer<typeof ScheduleDaySchema>;
export type Schedule = z.infer<typeof ScheduleSchema>;
export type Coverage = z.infer<typeof CoverageSchema>;
export type Source = z.infer<typeof SourceSchema>;
export type CompanyBrief = z.infer<typeof CompanyBriefSchema>;
export type Role = z.infer<typeof RoleSchema>;
export type KitData = z.infer<typeof KitSchema>;

export function validateKit(data: unknown): KitData {
  return KitSchema.parse(data);
}
