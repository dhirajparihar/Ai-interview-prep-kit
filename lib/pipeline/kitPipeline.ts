import crypto from "crypto";
import { RequirementExtractor } from "@/lib/extraction/requirementExtractor";
import { WebCrawler } from "@/lib/scraper/crawler";
import { DiscussionResearcher } from "@/lib/research/discussionResearcher";
import { QuestionGenerator } from "@/lib/questions/questionGenerator";
import { FlashcardGenerator } from "@/lib/flashcards/flashcardGenerator";
import { checkCoverage } from "@/lib/coverage/coverageChecker";
import { allocateSchedule } from "@/lib/scheduling/scheduleAllocator";
import { GeminiClient } from "@/lib/llm/geminiClient";
import { validateKit, KitData, Question } from "@/lib/validation/kitSchema";

export interface PipelineOptions {
  jd: string;
  companyUrl: string;
  days: number;
  onProgress?: (stage: string, percent: number) => void;
}

export function calculateFingerprint(jd: string, companyUrl: string): string {
  const normalizedJd = jd.trim().toLowerCase();
  const normalizedUrl = companyUrl.trim().toLowerCase().replace(/\/$/, "");
  return crypto.createHash("sha256").update(`${normalizedJd}::${normalizedUrl}`).digest("hex");
}

export class KitPipeline {
  private extractor = new RequirementExtractor();
  private crawler = new WebCrawler();
  private researcher = new DiscussionResearcher();
  private questionGen = new QuestionGenerator();
  private flashcardGen = new FlashcardGenerator();

  public async run(options: PipelineOptions): Promise<KitData> {
    const { jd, companyUrl, days, onProgress } = options;

    const reportProgress = (stage: string, percent: number) => {
      if (onProgress) onProgress(stage, percent);
    };

    // Step 1: Receive JD & Inputs
    reportProgress("Extracting requirements from job description...", 10);

    // Step 2: Extract requirements
    const roleData = await this.extractor.extractRequirements(jd);

    // Step 3-9: Crawl company site & public discussion concurrently
    reportProgress("Researching company site and hiring process...", 25);

    const crawlPromise = this.crawler.crawlCompany(companyUrl);
    const discussionPromise = this.researcher.searchInterviewDiscussions(
      roleData.title,
      roleData.title
    );

    const [crawlResult, discussionResult] = await Promise.all([
      crawlPromise,
      discussionPromise,
    ]);

    const companyName = crawlResult.company_name || "Target Company";
    const companyContext = {
      companyName,
      hiringText: crawlResult.hiring_text || crawlResult.homepage_text,
      discussionText: discussionResult.snippets.join("\n"),
    };

    reportProgress("Generating question bank by category...", 45);

    // Step 13: Generate questions concurrently per category
    const categories: Array<"technical" | "behavioural" | "system-design" | "company-fit"> = [
      "technical",
      "behavioural",
      "system-design",
      "company-fit",
    ];

    const questionResults = await Promise.all(
      categories.map((cat) =>
        this.questionGen.generateQuestionsForCategory(
          cat,
          roleData.requirements,
          companyContext
        )
      )
    );

    let allQuestions: Question[] = questionResults.flat();

    // Step 14: Generate flashcards
    reportProgress("Generating flashcards...", 65);
    const flashcards = await this.flashcardGen.generateFlashcards(roleData.requirements);

    // Step 15-18: Deterministic Coverage Checking & Second Pass
    reportProgress("Checking requirement coverage...", 75);
    let coverageRes = checkCoverage(roleData.requirements, allQuestions, 1);

    if (coverageRes.must_uncovered_ids.length > 0) {
      reportProgress("Running second pass generation for uncovered requirements...", 85);
      const secondPassQuestions = await this.questionGen.generateQuestionsForCategory(
        "technical",
        roleData.requirements,
        companyContext,
        coverageRes.must_uncovered_ids
      );

      allQuestions = [...allQuestions, ...secondPassQuestions];
      coverageRes = checkCoverage(roleData.requirements, allQuestions, 2);
    }

    // Step 19: Deterministic Schedule Allocation
    reportProgress("Building study schedule...", 90);
    const schedule = allocateSchedule(roleData.requirements, allQuestions, days);

    // Step 20: Validate Complete Kit against Appendix A Schema
    reportProgress("Validating prep kit...", 95);
    let companyBriefData = {
      summary: `${companyName} is an organization in technology and engineering.`,
      what_they_do: (crawlResult.about_text || crawlResult.homepage_text || "").slice(0, 600).replace(/\s+/g, " ").trim() || "Provides products, services, and engineering solutions in their industry.",
    };

    try {
      const llm = new GeminiClient();
      const briefResult = await llm.generateJSON<{ summary: string; what_they_do: string }>(
        `You are an expert corporate research analyst. Summarize what ${companyName} does based on the provided web content and job role context. Return a professional 2-sentence company summary and a clear, informative 3-sentence 'what they do and product focus' description.`,
        `Company Name: ${companyName}
Role Title: ${roleData.title}
Crawled Web Content:
${(crawlResult.about_text || crawlResult.homepage_text || crawlResult.hiring_text || "").slice(0, 3000)}`,
        `{
  "summary": "2-sentence executive summary of ${companyName}",
  "what_they_do": "3-sentence breakdown of the products, services, and business focus of ${companyName}"
}`
      );

      if (briefResult.summary && briefResult.what_they_do) {
        companyBriefData = briefResult;
      }
    } catch {
      const combined = (crawlResult.about_text || crawlResult.homepage_text || "").trim();
      if (combined.length > 50) {
        companyBriefData.what_they_do = combined.slice(0, 600).replace(/\s+/g, " ").trim() + "...";
      }
    }

    const companyBrief = {
      summary: companyBriefData.summary,
      what_they_do: companyBriefData.what_they_do,
      sources: crawlResult.pages_used.length > 0 ? crawlResult.pages_used : [companyUrl],
      state: "generated" as const,
    };

    const kitData: KitData = {
      source: {
        company: companyName,
        company_url: companyUrl,
        role: roleData.title,
        location: "Remote / Onsite",
        jd_chars: jd.length,
        researched_at: new Date().toISOString(),
        pages_used: crawlResult.pages_used,
      },
      company_brief: companyBrief,
      role: roleData,
      questions: allQuestions,
      flashcards,
      schedule,
      coverage: {
        uncovered_requirement_ids: coverageRes.uncovered_requirement_ids,
        passes: coverageRes.passes,
      },
    };

    const validatedKit = validateKit(kitData);
    reportProgress("Kit generated successfully!", 100);

    return validatedKit;
  }
}
