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
    delete process.env.NODE_ENV;

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
});
