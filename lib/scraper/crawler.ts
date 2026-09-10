import * as cheerio from "cheerio";
import { URL } from "url";
import { validateUrlForSSRF } from "@/lib/security/ssrfGuard";

export interface CrawledPage {
  url: string;
  title: string;
  cleanContent: string;
  isHiringPage: boolean;
  isAboutPage: boolean;
}

export interface CrawlResult {
  pages: CrawledPage[];
  pages_used: string[];
  company_name: string;
  homepage_text: string;
  hiring_text: string;
  about_text: string;
}

const RELEVANCE_KEYWORDS = {
  hiring: ["careers", "jobs", "hiring", "join-us", "work-with-us", "positions", "openings", "interview", "handbook"],
  about: ["about", "about-us", "company", "team", "culture", "mission", "values", "engineering", "blog"],
};

export class WebCrawler {
  private visitedUrls = new Set<string>();
  private maxPages = 4;
  private timeoutMs = 5000;
  private maxSizeBytes = 2 * 1024 * 1024; // 2MB limit

  public async crawlCompany(baseUrl: string): Promise<CrawlResult> {
    const ssrf = validateUrlForSSRF(baseUrl);
    if (!ssrf.allowed || !ssrf.url) {
      return {
        pages: [],
        pages_used: [],
        company_name: this.extractNameFromUrl(baseUrl),
        homepage_text: "",
        hiring_text: "",
        about_text: "",
      };
    }

    const normalizedBaseUrl = ssrf.url;
    const pages: CrawledPage[] = [];

    // Step 1: Fetch homepage
    const homePage = await this.fetchAndCleanPage(normalizedBaseUrl);
    if (homePage) {
      pages.push(homePage);
      this.visitedUrls.add(normalizedBaseUrl);
    }

    // Extract company name from title or URL
    const companyName = homePage?.title
      ? homePage.title.split("|")[0].split("-")[0].trim()
      : this.extractNameFromUrl(normalizedBaseUrl);

    if (!homePage) {
      return {
        pages: [],
        pages_used: [],
        company_name: companyName,
        homepage_text: "",
        hiring_text: "",
        about_text: "",
      };
    }

    // Step 2: Extract and rank links from homepage
    const links = this.extractAndRankLinks(homePage.cleanContent, normalizedBaseUrl);

    // Step 3: Fetch top relevant links concurrently/sequentially
    const targetLinks = links.slice(0, this.maxPages - 1);
    for (const link of targetLinks) {
      if (this.visitedUrls.has(link.url)) continue;
      const page = await this.fetchAndCleanPage(link.url);
      if (page) {
        page.isHiringPage = link.category === "hiring";
        page.isAboutPage = link.category === "about";
        pages.push(page);
        this.visitedUrls.add(link.url);
      }
    }

    const pagesUsed = pages.map((p) => p.url);
    const homepageText = homePage.cleanContent.slice(0, 3000);
    const hiringPages = pages.filter((p) => p.isHiringPage);
    const aboutPages = pages.filter((p) => p.isAboutPage);

    const hiringText = hiringPages.map((p) => p.cleanContent).join("\n\n").slice(0, 4000);
    const aboutText = aboutPages.map((p) => p.cleanContent).join("\n\n").slice(0, 4000);

    return {
      pages,
      pages_used: pagesUsed,
      company_name: companyName,
      homepage_text: homepageText,
      hiring_text: hiringText,
      about_text: aboutText,
    };
  }

  private async fetchAndCleanPage(targetUrl: string): Promise<CrawledPage | null> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

      const res = await fetch(targetUrl, {
        signal: controller.signal,
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AI-Interview-PrepKit-Crawler/1.0",
          Accept: "text/html,application/xhtml+xml",
        },
      });

      clearTimeout(timeoutId);

      if (!res.ok) return null;

      const contentType = res.headers.get("content-type") || "";
      if (!contentType.includes("text/html") && !contentType.includes("xhtml")) {
        return null;
      }

      const rawHtml = await res.text();
      if (rawHtml.length > this.maxSizeBytes) {
        return null; // Skip oversized responses
      }

      const $ = cheerio.load(rawHtml);

      // Remove script, style, nav, footer, header elements to extract core text
      $("script, style, noscript, nav, footer, header, svg, iframe").remove();

      const title = $("title").text().trim() || targetUrl;
      const bodyText = $("body").text();

      // Normalize whitespace
      const cleanContent = bodyText.replace(/\s+/g, " ").trim();

      const isHiring = RELEVANCE_KEYWORDS.hiring.some((k) => targetUrl.toLowerCase().includes(k));
      const isAbout = RELEVANCE_KEYWORDS.about.some((k) => targetUrl.toLowerCase().includes(k));

      return {
        url: targetUrl,
        title,
        cleanContent,
        isHiringPage: isHiring,
        isAboutPage: isAbout,
      };
    } catch {
      return null;
    }
  }

  private extractAndRankLinks(
    html: string,
    baseUrl: string
  ): { url: string; score: number; category: "hiring" | "about" | "general" }[] {
    const $ = cheerio.load(html);
    const discovered: Map<string, { score: number; category: "hiring" | "about" | "general" }> = new Map();

    const baseObj = new URL(baseUrl);

    $("a[href]").each((_, el) => {
      const href = $(el).attr("href");
      if (!href) return;

      try {
        const fullUrl = new URL(href, baseUrl);

        // Stay on same domain
        if (fullUrl.hostname !== baseObj.hostname) return;

        const urlStr = fullUrl.toString();
        const lowerUrl = urlStr.toLowerCase();
        const linkText = $(el).text().toLowerCase();

        let score = 0;
        let category: "hiring" | "about" | "general" = "general";

        for (const kw of RELEVANCE_KEYWORDS.hiring) {
          if (lowerUrl.includes(kw) || linkText.includes(kw)) {
            score += 10;
            category = "hiring";
          }
        }

        for (const kw of RELEVANCE_KEYWORDS.about) {
          if (lowerUrl.includes(kw) || linkText.includes(kw)) {
            score += 5;
            if (category === "general") category = "about";
          }
        }

        if (score > 0 && !discovered.has(urlStr)) {
          discovered.set(urlStr, { score, category });
        }
      } catch {
        // Ignore invalid URLs
      }
    });

    return Array.from(discovered.entries())
      .map(([url, meta]) => ({ url, ...meta }))
      .sort((a, b) => b.score - a.score);
  }

  private extractNameFromUrl(urlStr: string): string {
    try {
      const host = new URL(urlStr).hostname.replace(/^www\./, "");
      const name = host.split(".")[0];
      return name.charAt(0).toUpperCase() + name.slice(1);
    } catch {
      return "Target Company";
    }
  }
}
