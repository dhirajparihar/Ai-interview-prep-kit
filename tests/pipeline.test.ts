import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { validateUrlForSSRF } from "../lib/security/ssrfGuard";
import { calculateFingerprint } from "../lib/pipeline/kitPipeline";

describe("Pipeline Security, SSRF & State Preservation Tests", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("should reject localhost and 127.0.0.1 in production mode", () => {
    delete process.env.EVALUATOR_MODE;
    (process.env as any).NODE_ENV = undefined;

    const resLocalhost = validateUrlForSSRF("http://localhost:8099/acme");
    expect(resLocalhost.allowed).toBe(false);

    const resIp = validateUrlForSSRF("http://127.0.0.1:8099/acme");
    expect(resIp.allowed).toBe(false);

    const resPublic = validateUrlForSSRF("https://google.com");
    expect(resPublic.allowed).toBe(true);
  });

  it("should allow localhost target URLs when EVALUATOR_MODE is true", () => {
    process.env.EVALUATOR_MODE = "true";

    const resLocalhost = validateUrlForSSRF("http://localhost:8099/acme/");
    expect(resLocalhost.allowed).toBe(true);
  });

  it("should generate deterministic SHA-256 fingerprint for identical JD and URL inputs", () => {
    const jd1 = "  Senior Backend Engineer with Node.js  \n";
    const url1 = "https://Acme.com/  ";

    const jd2 = "Senior Backend Engineer with Node.js";
    const url2 = "https://acme.com";

    const hash1 = calculateFingerprint(jd1, url1);
    const hash2 = calculateFingerprint(jd2, url2);

    expect(hash1).toBe(hash2);
    expect(hash1.length).toBe(64); // SHA-256 length
  });

  it("should extract requirements from a two-line stub without inventing non-existent requirements", async () => {
    const { RequirementExtractor } = await import("../lib/extraction/requirementExtractor");
    const extractor = new RequirementExtractor();

    const stubJd = "React Developer.\nBuild user interfaces using React and TypeScript.";
    const role = await extractor.extractRequirements(stubJd);

    expect(role.title).toBeDefined();
    expect(role.requirements.length).toBeGreaterThan(0);
    expect(role.requirements.length).toBeLessThanOrEqual(3);
    const reqTexts = role.requirements.map((r) => r.text.toLowerCase()).join(" ");
    expect(reqTexts).toContain("react");
  });

  it("should handle company sites without hiring pages gracefully without throwing errors", async () => {
    const { WebCrawler } = await import("../lib/scraper/crawler");
    const crawler = new WebCrawler();

    // Crawl a non-existent / unreachable site
    const result = await crawler.crawlCompany("https://unreachable-test-domain-12345.com");

    expect(result.company_name).toBeDefined();
    expect(Array.isArray(result.pages)).toBe(true);
    expect(Array.isArray(result.pages_used)).toBe(true);
    expect(result.hiring_text).toBe("");
  });
});
