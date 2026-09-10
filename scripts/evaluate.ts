import fs from "fs";
import path from "path";

// Set evaluator mode BEFORE importing pipeline/SSRF modules
process.env.EVALUATOR_MODE = "true";

import { KitPipeline } from "../lib/pipeline/kitPipeline";

interface TestCase {
  id: string;
  jd: string;
  company_url: string;
  days: number;
}

interface EvaluatorCaseResult {
  id: string;
  status: "ok" | "failed";
  kit: unknown | null;
  error: {
    code: string;
    message: string;
  } | null;
}

async function runEvaluator() {
  const args = process.argv.slice(2);
  let inputPath = "";
  let outputPath = "";

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--input" && args[i + 1]) {
      inputPath = args[i + 1];
      i++;
    } else if (args[i] === "--output" && args[i + 1]) {
      outputPath = args[i + 1];
      i++;
    }
  }

  // Fallback if npm strips flags
  if (!inputPath && args[0] && !args[0].startsWith("-")) {
    inputPath = args[0];
  }
  if (!outputPath && args[1] && !args[1].startsWith("-")) {
    outputPath = args[1];
  }

  if (!inputPath || !outputPath) {
    console.error("Usage: npm run evaluate -- --input <cases.json> --output <kits.json>");
    process.exit(1);
  }

  const resolvedInputPath = path.resolve(process.cwd(), inputPath);
  const resolvedOutputPath = path.resolve(process.cwd(), outputPath);

  if (!fs.existsSync(resolvedInputPath)) {
    console.error(`Input file not found: ${resolvedInputPath}`);
    process.exit(1);
  }

  const rawInput = fs.readFileSync(resolvedInputPath, "utf-8");
  let cases: TestCase[];
  try {
    cases = JSON.parse(rawInput);
  } catch (err) {
    console.error("Failed to parse input JSON file:", err);
    process.exit(1);
  }

  console.log(`Starting Batch Evaluation of ${cases.length} case(s)...`);
  const pipeline = new KitPipeline();
  const caseResults: EvaluatorCaseResult[] = [];

  for (let idx = 0; idx < cases.length; idx++) {
    const c = cases[idx];
    console.log(`[${idx + 1}/${cases.length}] Processing case '${c.id}' for company '${c.company_url}' (${c.days} days)...`);

    try {
      const kitData = await pipeline.run({
        jd: c.jd,
        companyUrl: c.company_url,
        days: c.days,
        onProgress: (stage, percent) => {
          console.log(`  └─ [${percent}%] ${stage}`);
        },
      });

      caseResults.push({
        id: c.id,
        status: "ok",
        kit: kitData,
        error: null,
      });
      console.log(`  ✔ Case '${c.id}' completed successfully.`);
    } catch (err) {
      console.error(`  ✖ Case '${c.id}' failed:`, err instanceof Error ? err.message : err);
      caseResults.push({
        id: c.id,
        status: "failed",
        kit: null,
        error: {
          code: "COMPANY_UNREACHABLE",
          message: err instanceof Error ? err.message : "Pipeline execution failed.",
        },
      });
    }
  }

  const outputPayload = {
    version: "1.0",
    generated_at: new Date().toISOString(),
    kits: caseResults,
  };

  // Ensure output directory exists
  const outDir = path.dirname(resolvedOutputPath);
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  fs.writeFileSync(resolvedOutputPath, JSON.stringify(outputPayload, null, 2), "utf-8");
  console.log(`\nBatch evaluation completed! Results written to: ${resolvedOutputPath}`);
}

runEvaluator().catch((err) => {
  console.error("Batch evaluator unhandled error:", err);
  process.exit(1);
});
